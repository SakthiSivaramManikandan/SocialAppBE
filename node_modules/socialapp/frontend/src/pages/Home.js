import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import StoriesBar from '../components/stories/StoriesBar';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeed = useCallback(async (p = 1) => {
    try {
      const { data } = await API.get(`/posts/feed?page=${p}&limit=10`);
      if (p === 1) setPosts(data.posts);
      else setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchFeed(1); }, [fetchFeed]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  const handlePost = (newPost) => setPosts(prev => [newPost, ...prev]);
  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));
  const handleUpdate = (updated) => setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-2 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <StoriesBar />
      <CreatePost onPost={handlePost} />

      {posts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">👋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your feed is empty</h3>
          <p className="text-gray-500 text-sm">Add some friends to see their posts here, or explore public posts.</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post._id} post={post} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))}
          {hasMore && (
            <div className="text-center pb-4">
              <button onClick={loadMore} disabled={loadingMore} className="btn-secondary px-8 py-2.5 text-sm">
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
