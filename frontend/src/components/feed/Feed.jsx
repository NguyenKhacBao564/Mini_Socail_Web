import React, { useState, useEffect, useContext, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import PostCard from './PostCard';
import { Image, X } from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const res = await axiosClient.get('/posts');
      setPosts(res.data.data || res.data); 
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // NOTE: When using FormData with axios, Content-Type header is usually set automatically 
      // to multipart/form-data with the correct boundary.
      // However, since our axiosClient interceptor adds 'Content-Type': 'application/json' by default,
      // we need to let the browser set it for this request.
      
      await axiosClient.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setContent('');
      clearImage();
      fetchPosts(); 
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  return (
    <div>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <h2 className="text-xl font-bold text-white">Home</h2>
      </div>

      {/* Create Post Input */}
      <div className="p-4 border-b border-white/5">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
             {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <form onSubmit={handleCreatePost} className="flex-1">
            <textarea
              className="w-full bg-transparent text-xl text-white placeholder:text-slate-500 border-none focus:ring-0 resize-none h-24 p-0"
              placeholder="What is happening?!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>

            {/* Image Preview */}
            {previewUrl && (
              <div className="relative mb-3 w-full rounded-xl overflow-hidden border border-white/10">
                <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-cover" />
                <button 
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-white/10 pt-3">
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  className="hidden" 
                  accept="image/*"
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="text-blue-400 hover:bg-blue-500/10 p-2 rounded-full transition-colors"
                >
                  <Image size={20} />
                </button>
              </div>
              
              <button 
                type="submit" 
                disabled={!content.trim() && !selectedImage}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold px-5 py-1.5 rounded-full text-sm transition-all"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feed List */}
      <div>
        {loading ? (
           <div className="flex justify-center py-10">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : posts.length === 0 ? (
           <div className="text-center py-10 text-slate-500">No posts yet. Be the first to share something!</div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Feed;
