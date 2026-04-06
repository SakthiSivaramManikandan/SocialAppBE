import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import PostCard from '../components/posts/PostCard';
import toast from 'react-hot-toast';
import { FiCamera, FiEdit2, FiUserPlus, FiUserCheck, FiUserX, FiMapPin, FiLink, FiSave, FiX } from 'react-icons/fi';

import { mediaUrl } from '../utils/media';

const Profile = () => {
  const { username } = useParams();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [friendStatus, setFriendStatus] = useState('none'); // none | sent | friends
  const [saving, setSaving] = useState(false);
  const profilePicRef = useRef();
  const coverRef = useRef();

  const isOwn = user?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [{ data: p }, { data: userPosts }] = await Promise.all([
          API.get(`/users/${username}`),
          API.get(`/users/${username}/posts`)
        ]);
        setProfile(p);
        setPosts(userPosts);
        setEditForm({ firstName: p.firstName, lastName: p.lastName, bio: p.bio, location: p.location, website: p.website });

        if (!isOwn) {
          const currentUser = await API.get('/auth/me');
          if (currentUser.data.friends?.some(f => (f._id || f) === p._id)) setFriendStatus('friends');
          else if (currentUser.data.sentRequests?.includes(p._id)) setFriendStatus('sent');
          else setFriendStatus('none');
        }
      } catch { toast.error('Profile not found'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [username, isOwn]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/users/profile/update', editForm);
      setProfile(data);
      updateUser(data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const uploadAvatar = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append('profilePicture', f);
    try {
      const { data } = await API.put('/users/profile/picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(p => ({ ...p, profilePicture: data.profilePicture }));
      updateUser({ profilePicture: data.profilePicture });
      toast.success('Profile picture updated!');
    } catch { toast.error('Upload failed'); }
  };

  const uploadCover = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append('coverPhoto', f);
    try {
      const { data } = await API.put('/users/profile/cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(p => ({ ...p, coverPhoto: data.coverPhoto }));
      toast.success('Cover photo updated!');
    } catch { toast.error('Upload failed'); }
  };

  const sendFriendRequest = async () => {
    try {
      await API.post(`/friends/request/${profile._id}`);
      setFriendStatus('sent');
      toast.success('Friend request sent!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const cancelRequest = async () => {
    try {
      await API.delete(`/friends/cancel/${profile._id}`);
      setFriendStatus('none');
      toast.success('Request cancelled');
    } catch { toast.error('Error'); }
  };

  const unfriend = async () => {
    if (!window.confirm('Remove this friend?')) return;
    try {
      await API.delete(`/friends/unfriend/${profile._id}`);
      setFriendStatus('none');
      setProfile(p => ({ ...p, friends: p.friends.filter(f => (f._id || f) !== user._id) }));
      toast.success('Unfriended');
    } catch { toast.error('Error'); }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto">
      <div className="card animate-pulse">
        <div className="h-40 bg-gray-200 rounded-t-xl" />
        <div className="p-6 pt-12">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );

  if (!profile) return <div className="text-center py-16 text-gray-500">Profile not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Profile Card */}
      <div className="card overflow-hidden">
        {/* Cover */}
        <div className="relative h-44 bg-gradient-to-r from-blue-400 to-purple-500 group">
          {profile.coverPhoto && <img src={mediaUrl(profile.coverPhoto)} alt="" className="w-full h-full object-cover" />}
          {isOwn && (
            <button onClick={() => coverRef.current.click()}
              className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <FiCamera size={13} /> Change Cover
            </button>
          )}
          <input ref={coverRef} type="file" accept="image/*" onChange={uploadCover} className="hidden" />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-md">
                {profile.profilePicture
                  ? <img src={mediaUrl(profile.profilePicture)} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">{profile.firstName[0]}</div>
                }
              </div>
              {isOwn && (
                <button onClick={() => profilePicRef.current.click()}
                  className="absolute bottom-1 right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiCamera size={13} />
                </button>
              )}
              <input ref={profilePicRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </div>
            <div className="flex gap-2">
              {isOwn ? (
                editing ? (
                  <div className="flex gap-2">
                    <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                      <FiSave size={14} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-2 px-3"><FiX size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5">
                    <FiEdit2 size={14} /> Edit Profile
                  </button>
                )
              ) : (
                <>
                  {friendStatus === 'none' && (
                    <button onClick={sendFriendRequest} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                      <FiUserPlus size={14} /> Add Friend
                    </button>
                  )}
                  {friendStatus === 'sent' && (
                    <button onClick={cancelRequest} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5 text-orange-600">
                      <FiUserX size={14} /> Cancel Request
                    </button>
                  )}
                  {friendStatus === 'friends' && (
                    <button onClick={unfriend} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5 text-green-600">
                      <FiUserCheck size={14} /> Friends
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">First Name</label>
                  <input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Last Name</label>
                  <input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="input-field text-sm resize-none" rows={2} maxLength={500} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
                <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="input-field text-sm" placeholder="City, Country" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Website</label>
                <input value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} className="input-field text-sm" placeholder="https://..." />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
              <p className="text-gray-500 text-sm">@{profile.username}</p>
              {profile.bio && <p className="text-gray-700 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
              <div className="flex flex-wrap gap-4 mt-3">
                {profile.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-500"><FiMapPin size={14} />{profile.location}</span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <FiLink size={14} />{profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="font-bold text-gray-900">{posts.length}</p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{profile.friends?.length || 0}</p>
                  <p className="text-xs text-gray-500">Friends</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Friends list */}
      {profile.friends?.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Friends <span className="text-gray-400 font-normal text-sm">({profile.friends.length})</span></h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {profile.friends.slice(0, 8).map(f => (
              <a key={f._id} href={`/profile/${f.username}`} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                {f.profilePicture
                  ? <img src={mediaUrl(f.profilePicture)} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">{f.firstName[0]}</div>
                }
                <span className="text-xs text-gray-600 text-center truncate w-full">{f.firstName}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Posts</h3>
        {posts.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">No posts yet</div>
        ) : (
          posts.map(p => <PostCard key={p._id} post={p} onDelete={id => setPosts(ps => ps.filter(x => x._id !== id))} onUpdate={up => setPosts(ps => ps.map(x => x._id === up._id ? up : x))} />)
        )}
      </div>
    </div>
  );
};

export default Profile;
