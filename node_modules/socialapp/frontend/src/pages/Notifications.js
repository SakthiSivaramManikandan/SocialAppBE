import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiHeart, FiMessageCircle, FiUserPlus, FiUserCheck, FiAtSign, FiTrash2, FiCheckCircle } from 'react-icons/fi';

import { mediaUrl } from '../utils/media';

const typeConfig = {
  like_post:       { icon: FiHeart,         color: 'text-red-500 bg-red-50',    text: 'liked your post' },
  like_comment:    { icon: FiHeart,         color: 'text-red-500 bg-red-50',    text: 'liked your comment' },
  comment:         { icon: FiMessageCircle, color: 'text-blue-500 bg-blue-50',  text: 'commented on your post' },
  friend_request:  { icon: FiUserPlus,      color: 'text-green-500 bg-green-50',text: 'sent you a friend request' },
  friend_accept:   { icon: FiUserCheck,     color: 'text-green-500 bg-green-50',text: 'accepted your friend request' },
  mention:         { icon: FiAtSign,        color: 'text-purple-500 bg-purple-50',text: 'mentioned you' },
  story_view:      { icon: FiAtSign,        color: 'text-orange-500 bg-orange-50',text: 'viewed your story' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notifications').then(({ data }) => { setNotifications(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(ns => ns.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(ns => ns.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(ns => ns.filter(n => n._id !== id));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="card p-4 animate-pulse flex gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Notifications {unreadCount > 0 && <span className="text-sm font-normal text-blue-600">({unreadCount} new)</span>}
        </h2>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <FiCheckCircle size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const config = typeConfig[n.type] || typeConfig.mention;
            const Icon = config.icon;
            return (
              <div key={n._id}
                className={`card p-4 flex items-start gap-3 transition-colors ${!n.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
                onClick={() => !n.read && markRead(n._id)}>
                <div className="flex-shrink-0 relative">
                  {n.sender?.profilePicture
                    ? <img src={mediaUrl(n.sender.profilePicture)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">{n.sender?.firstName?.[0]}</div>
                  }
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${config.color}`}>
                    <Icon size={11} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <Link to={`/profile/${n.sender?.username}`} className="font-semibold hover:text-blue-600">
                      {n.sender?.firstName} {n.sender?.lastName}
                    </Link>{' '}
                    {config.text}
                    {n.post && <span className="text-gray-500"> — "{n.post.content?.slice(0, 40)}{n.post.content?.length > 40 ? '...' : ''}"</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                  <FiTrash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
