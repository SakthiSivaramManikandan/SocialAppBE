import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiHeart, FiEdit2, FiTrash2, FiSend } from 'react-icons/fi';

import { mediaUrl } from '../../utils/media';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    API.get(`/comments/${postId}`).then(({ data }) => setComments(data)).catch(() => {});
  }, [postId]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await API.post(`/comments/${postId}`, { content: text });
      setComments(prev => [data, ...prev]);
      setText('');
    } catch { toast.error('Failed to comment'); }
    finally { setLoading(false); }
  };

  const deleteComment = async (id) => {
    try {
      await API.delete(`/comments/${id}`);
      setComments(prev => prev.filter(c => c._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await API.put(`/comments/${id}`, { content: editText });
      setComments(prev => prev.map(c => c._id === id ? data : c));
      setEditingId(null);
    } catch { toast.error('Failed to update'); }
  };

  const likeComment = async (id) => {
    try {
      const { data } = await API.put(`/comments/${id}/like`);
      setComments(prev => prev.map(c => c._id === id ? { ...c, likes: data.likes } : c));
    } catch {}
  };

  return (
    <div className="p-4 space-y-4">
      {/* Add comment */}
      <form onSubmit={addComment} className="flex items-center gap-2">
        {user?.profilePicture
          ? <img src={mediaUrl(user.profilePicture)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">{user?.firstName?.[0]}</div>
        }
        <div className="flex-1 relative">
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-gray-100 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
          <button type="submit" disabled={loading || !text.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 transition-colors">
            <FiSend size={16} />
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map(c => (
          <div key={c._id} className="flex items-start gap-2">
            {c.author?.profilePicture
              ? <img src={mediaUrl(c.author.profilePicture)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">{c.author?.firstName?.[0]}</div>
            }
            <div className="flex-1">
              <div className="bg-gray-100 rounded-2xl px-3 py-2">
                <Link to={`/profile/${c.author?.username}`} className="text-xs font-semibold text-gray-900 hover:text-blue-600">
                  {c.author?.firstName} {c.author?.lastName}
                </Link>
                {editingId === c._id ? (
                  <div className="flex gap-2 mt-1">
                    <input value={editText} onChange={e => setEditText(e.target.value)}
                      className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <button onClick={() => saveEdit(c._id)} className="text-xs text-blue-600 font-medium">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">Cancel</button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 ml-3">
                <button onClick={() => likeComment(c._id)}
                  className={`text-xs font-medium flex items-center gap-1 transition-colors ${c.likes?.includes(user?._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                  <FiHeart size={12} className={c.likes?.includes(user?._id) ? 'fill-current' : ''} />
                  {c.likes?.length > 0 && c.likes.length}
                </button>
                <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                {c.author?._id === user?._id && (
                  <>
                    <button onClick={() => { setEditingId(c._id); setEditText(c.content); }}
                      className="text-xs text-gray-400 hover:text-blue-600 transition-colors"><FiEdit2 size={11} /></button>
                    <button onClick={() => deleteComment(c._id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={11} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
