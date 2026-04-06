import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RightSidebar = () => {
  const [suggested, setSuggested] = useState([]);
  const [sent, setSent] = useState(new Set());
  const base = process.env.REACT_APP_API_URL?.replace('/api', '') || '';

  useEffect(() => {
    API.get('/users/suggested').then(({ data }) => setSuggested(data)).catch(() => {});
  }, []);

  const sendRequest = async (userId) => {
    try {
      await API.post(`/friends/request/${userId}`);
      setSent(s => new Set([...s, userId]));
      toast.success('Friend request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="sticky top-20 space-y-4">
      {suggested.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">People You May Know</h3>
          <div className="space-y-3">
            {suggested.slice(0, 5).map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <Link to={`/profile/${u.username}`}>
                  {u.profilePicture
                    ? <img src={`${base}${u.profilePicture}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                    : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">{u.firstName[0]}</div>
                  }
                </Link>
                <div className="flex-1 overflow-hidden">
                  <Link to={`/profile/${u.username}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 block truncate">
                    {u.firstName} {u.lastName}
                  </Link>
                  <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                </div>
                <button
                  onClick={() => sendRequest(u._id)}
                  disabled={sent.has(u._id)}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-40"
                  title="Add Friend">
                  <FiUserPlus size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          SocialConnect © 2024 · <a href="#privacy" className="hover:underline">Privacy</a> · <a href="#terms" className="hover:underline">Terms</a>
        </p>
      </div>
    </div>
  );
};

export default RightSidebar;
