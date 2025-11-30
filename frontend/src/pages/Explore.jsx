import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/feed/PostCard';

const Explore = () => {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Simple debounce could be added here, but for now we'll search on Enter or button click 
  // to avoid too many requests while typing, or just use a small timeout.
  // Let's do a live search with debounce effect.
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          // 1. Search Posts
          const res = await axiosClient.get(`/posts/search?q=${encodeURIComponent(query)}`);
          const rawPosts = res.data.data;

          if (rawPosts.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
          }

          // 2. Extract User IDs
          const userIds = [...new Set(rawPosts.map(p => p.userId))];

          // 3. Batch Fetch Users
          const usersRes = await axiosClient.get(`/users/batch?ids=${userIds.join(',')}`);
          const users = usersRes.data.data;
          
          const userMap = {};
          users.forEach(u => { userMap[u.id] = u; });

          // 4. Enrich
          const enrichedPosts = rawPosts.map(post => ({
            ...post,
            author: userMap[post.userId] || { username: 'Unknown', avatarUrl: null }
          }));

          setPosts(enrichedPosts);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        setPosts([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Back Button (Mobile friendly) */}
          <button 
            onClick={handleBack}
            className="xl:hidden p-2 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-white/10 rounded-full leading-5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
              placeholder="Search for posts, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="pb-20">
        {loading ? (
           <div className="flex justify-center py-10">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : query && posts.length === 0 ? (
           <div className="text-center py-20 px-4">
             <p className="text-slate-500 text-lg">No results found for "{query}"</p>
           </div>
        ) : !query ? (
           <div className="text-center py-20 px-4">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 text-slate-600 mb-4">
               <Search size={32} />
             </div>
             <h3 className="text-white text-lg font-bold mb-2">Explore OmniSocial</h3>
             <p className="text-slate-500">Search for people, topics, and keywords.</p>
           </div>
        ) : (
          <div>
            {posts.map((post) => (
               <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;