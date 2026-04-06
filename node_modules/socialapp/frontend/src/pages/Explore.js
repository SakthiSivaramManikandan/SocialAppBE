import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import PostCard from '../components/posts/PostCard';
import { FiCompass } from 'react-icons/fi';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (p = 1) => {
    try {
      const { data } = await API.get(`/posts/explore?page=${p}&limit=10`);
      if (p === 1) setPosts(data.posts);
      else setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.posts.length === 10);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(1); }, []);

  const loadMore = () => { const next = page + 1; setPage(next); fetchPosts(next); };

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-2 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiCompass size={22} className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Explore</h2>
        <span className="text-sm text-gray-500">— Discover public posts</span>
      </div>

      {posts.length === 0 ? (
        <div className="card p-12 text-center">
          <FiCompass size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500">No public posts yet. Be the first!</p>
        </div>
      ) : (
        <>
          {posts.map(p => (
            <PostCard key={p._id} post={p}
              onDelete={id => setPosts(ps => ps.filter(x => x._id !== id))}
              onUpdate={up => setPosts(ps => ps.map(x => x._id === up._id ? up : x))} />
          ))}
          {hasMore && (
            <div className="text-center pb-4">
              <button onClick={loadMore} className="btn-secondary px-8 py-2.5 text-sm">Load more</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Explore;
