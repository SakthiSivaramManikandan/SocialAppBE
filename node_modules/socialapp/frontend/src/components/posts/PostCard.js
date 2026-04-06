import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import CommentSection from '../posts/CommentSection';
import {
  FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal,
  FiEdit2, FiTrash2, FiGlobe, FiLock, FiUsers
} from 'react-icons/fi';

import { mediaUrl } from '../../utils/media';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const privacyIcon = { public: <FiGlobe size={12} />, friends: <FiUsers size={12} />, private: <FiLock size={12} /> };

  const handleLike = async () => {
    try {
      setLiked(l => !l);
      setLikesCount(c => liked ? c - 1 : c + 1);
      await API.put(`/posts/${post._id}/like`);
    } catch { setLiked(l => !l); setLikesCount(c => liked ? c + 1 : c - 1); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${post._id}`);
      onDelete(post._id);
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const { data } = await API.put(`/posts/${post._id}`, { content: editContent });
      onUpdate(data);
      setEditing(false);
      toast.success('Post updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const authorPic = post.author?.profilePicture ? mediaUrl(post.author.profilePicture) : null;
  const isOwner = post.author?._id === user?._id;

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?.username}`}>
            {authorPic
              ? <img src={authorPic} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {post.author?.firstName?.[0]}
                </div>
            }
          </Link>
          <div>
            <Link to={`/profile/${post.author?.username}`} className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors">
              {post.author?.firstName} {post.author?.lastName}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">{privacyIcon[post.privacy]}</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(s => !s)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <FiMoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                <button onClick={() => { setEditing(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <FiEdit2 size={14} /> Edit Post
                </button>
                <button onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <FiTrash2 size={14} /> Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {editing ? (
          <div className="space-y-2">
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-1.5 px-3">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="btn-primary text-sm py-1.5 px-3">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          post.content && <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      {/* Media */}
      {post.media?.length > 0 && (
        <div className={`${post.media.length > 1 ? 'grid grid-cols-2 gap-1' : ''} overflow-hidden`}>
          {post.media.map((m, i) => (
            <div key={i} className={`${post.media.length === 1 ? 'w-full' : ''} bg-gray-100`}>
              {m.type === 'image'
                ? <img src={mediaUrl(m.url)} alt="" className="w-full max-h-96 object-cover" />
                : <video src={mediaUrl(m.url)} controls className="w-full max-h-96 object-cover" />
              }
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {(likesCount > 0 || post.comments?.length > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50">
          {likesCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">♥</span>
              {likesCount}
            </span>
          )}
          {post.comments?.length > 0 && (
            <button onClick={() => setShowComments(s => !s)} className="ml-auto hover:text-blue-600 transition-colors">
              {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex gap-1">
        <button onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
            ${liked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100'}`}>
          <FiHeart size={16} className={liked ? 'fill-current' : ''} />
          {liked ? 'Liked' : 'Like'}
        </button>
        <button onClick={() => setShowComments(s => !s)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
          <FiMessageCircle size={16} /> Comment
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.origin + `/post/${post._id}`); toast.success('Link copied!'); }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
          <FiShare2 size={16} /> Share
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-100">
          <CommentSection postId={post._id} />
        </div>
      )}
    </div>
  );
};

export default PostCard;
