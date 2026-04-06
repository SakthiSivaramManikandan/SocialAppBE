import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiImage, FiVideo, FiX, FiGlobe, FiUsers, FiLock } from 'react-icons/fi';

import { mediaUrl } from '../../utils/media';

const CreatePost = ({ onPost }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [privacy, setPrivacy] = useState('public');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews(prev => [...prev, { url: ev.target.result, type: f.type.startsWith('image') ? 'image' : 'video', name: f.name }]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return toast.error('Write something or add media');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('privacy', privacy);
      files.forEach(f => formData.append('media', f));
      const { data } = await API.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onPost(data);
      setContent(''); setFiles([]); setPreviews([]);
      toast.success('Post published!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: <FiGlobe size={14} /> },
    { value: 'friends', label: 'Friends', icon: <FiUsers size={14} /> },
    { value: 'private', label: 'Only Me', icon: <FiLock size={14} /> },
  ];

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        {user?.profilePicture
          ? <img src={mediaUrl(user.profilePicture)} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">{user?.firstName?.[0]}</div>
        }
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.firstName}?`}
            className="w-full resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none min-h-[80px] leading-relaxed"
            rows={3}
          />

          {/* Media previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {previews.map((p, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden w-20 h-20 bg-gray-100">
                  {p.type === 'image'
                    ? <img src={p.url} alt="" className="w-full h-full object-cover" />
                    : <video src={p.url} className="w-full h-full object-cover" />
                  }
                  <button onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiX size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <div className="flex items-center gap-1">
              <button onClick={() => fileRef.current.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-600 hover:bg-green-50 transition-colors">
                <FiImage size={15} /> Photo
              </button>
              <button onClick={() => fileRef.current.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                <FiVideo size={15} /> Video
              </button>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={handleFiles} className="hidden" />

              <select value={privacy} onChange={e => setPrivacy(e.target.value)}
                className="ml-2 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                {privacyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button onClick={handleSubmit} disabled={loading || (!content.trim() && files.length === 0)}
              className="btn-primary text-sm py-2 px-5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </span>
              ) : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
