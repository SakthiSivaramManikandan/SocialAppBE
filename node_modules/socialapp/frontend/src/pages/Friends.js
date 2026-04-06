import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiUserCheck, FiUserX, FiUserMinus, FiUsers } from 'react-icons/fi';

import { mediaUrl } from '../utils/media';

const Avatar = ({ user, size = 'md' }) => {
  const s = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-base';
  return user?.profilePicture
    ? <img src={mediaUrl(user.profilePicture)} alt="" className={`${s} rounded-full object-cover`} />
    : <div className={`${s} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold`}>{user?.firstName?.[0]}</div>;
};

const Friends = () => {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/friends/requests'),
      API.get('/friends')
    ]).then(([{ data: reqs }, { data: frs }]) => {
      setRequests(reqs);
      setFriends(frs);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const respond = async (userId, action) => {
    try {
      await API.put(`/friends/respond/${userId}`, { action });
      const req = requests.find(r => r.from._id === userId);
      setRequests(rs => rs.filter(r => r.from._id !== userId));
      if (action === 'accept' && req) {
        setFriends(fs => [req.from, ...fs]);
        toast.success(`You and ${req.from.firstName} are now friends!`);
      } else {
        toast.success('Request declined');
      }
    } catch { toast.error('Error'); }
  };

  const unfriend = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from friends?`)) return;
    try {
      await API.delete(`/friends/unfriend/${userId}`);
      setFriends(fs => fs.filter(f => f._id !== userId));
      toast.success('Unfriended');
    } catch { toast.error('Error'); }
  };

  const tabs = [
    { key: 'requests', label: 'Friend Requests', count: requests.length },
    { key: 'friends', label: 'My Friends', count: friends.length },
  ];

  if (loading) return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3" />
            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
            <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Friends</h2>

      {/* Tabs */}
      <div className="card p-1 flex gap-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.label} {t.count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${tab === t.key ? 'bg-blue-500' : 'bg-gray-200 text-gray-600'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Friend Requests */}
      {tab === 'requests' && (
        requests.length === 0 ? (
          <div className="card p-12 text-center">
            <FiUsers size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No pending friend requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requests.map(r => (
              <div key={r.from._id} className="card p-4 flex flex-col items-center text-center gap-3">
                <Link to={`/profile/${r.from.username}`}><Avatar user={r.from} size="lg" /></Link>
                <div>
                  <Link to={`/profile/${r.from.username}`} className="font-semibold text-gray-900 hover:text-blue-600 block">
                    {r.from.firstName} {r.from.lastName}
                  </Link>
                  <p className="text-xs text-gray-500">@{r.from.username}</p>
                  {r.from.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.from.bio}</p>}
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={() => respond(r.from._id, 'accept')}
                    className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1.5">
                    <FiUserCheck size={14} /> Confirm
                  </button>
                  <button onClick={() => respond(r.from._id, 'decline')}
                    className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1.5">
                    <FiUserX size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Friends List */}
      {tab === 'friends' && (
        friends.length === 0 ? (
          <div className="card p-12 text-center">
            <FiUsers size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No friends yet. Start connecting!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map(f => (
              <div key={f._id} className="card p-4 flex items-center gap-3">
                <Link to={`/profile/${f.username}`}><Avatar user={f} /></Link>
                <div className="flex-1 overflow-hidden">
                  <Link to={`/profile/${f.username}`} className="font-semibold text-sm text-gray-900 hover:text-blue-600 block truncate">
                    {f.firstName} {f.lastName}
                  </Link>
                  <p className="text-xs text-gray-500">@{f.username}</p>
                  {f.bio && <p className="text-xs text-gray-400 truncate mt-0.5">{f.bio}</p>}
                </div>
                <button onClick={() => unfriend(f._id, f.firstName)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                  title="Unfriend">
                  <FiUserMinus size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Friends;
