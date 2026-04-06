import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';

import { mediaUrl } from '../../utils/media';

const StoriesBar = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [viewing, setViewing] = useState(null); // { groupIdx, storyIdx }
  const [showCreate, setShowCreate] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);
  const [storyText, setStoryText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    API.get('/stories/feed').then(({ data }) => setGroups(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (viewing !== null) {
      timerRef.current = setTimeout(() => advanceStory(), 5000);
      return () => clearTimeout(timerRef.current);
    }
  }, [viewing]);

  const advanceStory = () => {
    if (!viewing) return;
    const group = groups[viewing.groupIdx];
    if (viewing.storyIdx < group.stories.length - 1) {
      setViewing(v => ({ ...v, storyIdx: v.storyIdx + 1 }));
    } else if (viewing.groupIdx < groups.length - 1) {
      setViewing({ groupIdx: viewing.groupIdx + 1, storyIdx: 0 });
    } else {
      setViewing(null);
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setStoryFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setStoryPreview({ url: ev.target.result, type: f.type.startsWith('image') ? 'image' : 'video' });
    reader.readAsDataURL(f);
  };

  const uploadStory = async () => {
    if (!storyFile) return toast.error('Select a photo or video');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('media', storyFile);
      if (storyText) fd.append('text', storyText);
      const { data } = await API.post('/stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Story posted!');
      setShowCreate(false); setStoryFile(null); setStoryPreview(null); setStoryText('');
      // Prepend to groups
      const myGroup = groups.find(g => g.author._id === user?._id);
      if (myGroup) {
        setGroups(gs => gs.map(g => g.author._id === user?._id ? { ...g, stories: [data, ...g.stories] } : g));
      } else {
        setGroups(gs => [{ author: { _id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName, profilePicture: user.profilePicture }, stories: [data] }, ...gs]);
      }
    } catch { toast.error('Failed to upload'); }
    finally { setUploading(false); }
  };

  const deleteStory = async (storyId) => {
    try {
      await API.delete(`/stories/${storyId}`);
      setGroups(gs => gs.map(g => ({ ...g, stories: g.stories.filter(s => s._id !== storyId) })).filter(g => g.stories.length > 0));
      setViewing(null);
      toast.success('Story deleted');
    } catch {}
  };

  const currentStory = viewing !== null ? groups[viewing.groupIdx]?.stories[viewing.storyIdx] : null;
  const currentAuthor = viewing !== null ? groups[viewing.groupIdx]?.author : null;

  return (
    <>
      {/* Stories scroll bar */}
      <div className="card p-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Add Story */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer" onClick={() => setShowCreate(true)}>
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-colors">
              <FiPlus size={20} className="text-gray-400" />
            </div>
            <span className="text-xs text-gray-500 font-medium w-14 text-center truncate">Your Story</span>
          </div>

          {groups.map((g, gi) => (
            <div key={g.author._id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
              onClick={() => setViewing({ groupIdx: gi, storyIdx: 0 })}>
              <div className="w-14 h-14 rounded-full story-ring p-0.5">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                  {g.author.profilePicture
                    ? <img src={mediaUrl(g.author.profilePicture)} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">{g.author.firstName[0]}</div>
                  }
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium w-14 text-center truncate">{g.author.firstName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer */}
      {viewing !== null && currentStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setViewing(null)}>
          <div className="relative w-full max-w-sm h-full max-h-screen" onClick={e => e.stopPropagation()}>
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
              {groups[viewing.groupIdx].stories.map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full bg-white bg-opacity-40 overflow-hidden">
                  <div className={`h-full bg-white transition-all ${i < viewing.storyIdx ? 'w-full' : i === viewing.storyIdx ? 'w-full animate-[progress_5s_linear]' : 'w-0'}`} />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentAuthor?.profilePicture
                  ? <img src={mediaUrl(currentAuthor.profilePicture)} alt="" className="w-8 h-8 rounded-full object-cover border border-white" />
                  : <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white text-sm font-semibold">{currentAuthor?.firstName?.[0]}</div>
                }
                <span className="text-white text-sm font-medium">{currentAuthor?.firstName} {currentAuthor?.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                {currentStory.author === user?._id && (
                  <button onClick={() => deleteStory(currentStory._id)} className="text-white hover:text-red-400 transition-colors p-1">
                    <FiTrash2 size={16} />
                  </button>
                )}
                <button onClick={() => setViewing(null)} className="text-white p-1"><FiX size={20} /></button>
              </div>
            </div>

            {/* Media */}
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              {currentStory.media.type === 'image'
                ? <img src={mediaUrl(currentStory.media.url)} alt="" className="w-full h-full object-contain" />
                : <video src={mediaUrl(currentStory.media.url)} autoPlay className="w-full h-full object-contain" />
              }
              {currentStory.text && (
                <div className="absolute bottom-16 left-0 right-0 text-center">
                  <span className="bg-black bg-opacity-50 text-white text-lg px-4 py-2 rounded-xl">{currentStory.text}</span>
                </div>
              )}
            </div>

            {/* Nav */}
            <button onClick={(e) => { e.stopPropagation(); viewing.storyIdx > 0 ? setViewing(v => ({ ...v, storyIdx: v.storyIdx - 1 })) : viewing.groupIdx > 0 && setViewing({ groupIdx: viewing.groupIdx - 1, storyIdx: 0 }); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-30 text-white hover:bg-opacity-50">
              <FiChevronLeft size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); advanceStory(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-30 text-white hover:bg-opacity-50">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Create Story</h3>
              <button onClick={() => { setShowCreate(false); setStoryFile(null); setStoryPreview(null); }} className="p-1 rounded-lg hover:bg-gray-100"><FiX size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              {storyPreview ? (
                <div className="relative rounded-xl overflow-hidden bg-gray-100 h-64">
                  {storyPreview.type === 'image'
                    ? <img src={storyPreview.url} alt="" className="w-full h-full object-cover" />
                    : <video src={storyPreview.url} className="w-full h-full object-cover" controls />
                  }
                  <button onClick={() => { setStoryFile(null); setStoryPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center">
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div onClick={() => fileRef.current.click()}
                  className="h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><FiPlus size={24} className="text-gray-400" /></div>
                  <p className="text-sm text-gray-500">Click to add photo or video</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
              <input value={storyText} onChange={e => setStoryText(e.target.value)}
                placeholder="Add text to your story..." className="input-field text-sm" />
              <button onClick={uploadStory} disabled={uploading || !storyFile} className="btn-primary w-full py-3">
                {uploading ? 'Posting...' : 'Post Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesBar;
