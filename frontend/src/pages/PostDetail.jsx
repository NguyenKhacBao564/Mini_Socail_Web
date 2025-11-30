import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/feed/PostCard';
import { ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch
      try {
        // 1. Fetch Post Data
        const res = await axiosClient.get(`/posts/${postId}`);
        const postData = res.data.data;

        if (!postData) {
          throw new Error("Post data is empty");
        }

        // 2. Fetch Author Data
        // We default to a placeholder if the user fetch fails
        let author = { username: 'Unknown', avatarUrl: null };
        try {
            if (postData.userId) {
                const userRes = await axiosClient.get(`/users/${postData.userId}`);
                if (userRes.data && userRes.data.data) {
                    author = userRes.data.data;
                }
            }
        } catch (userErr) {
          console.error("Failed to fetch author details", userErr);
          // Fallback author is already set
        }

        // 3. Enrich and Set Post
        setPost({
          ...postData,
          author
        });
      } catch (err) {
        console.error("Failed to fetch post", err);
        setError(err.response?.data?.message || "Post not found or deleted.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeletePost = () => {
    // If deleted from detail view, go back to feed
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <ArrowLeft className="text-red-500" size={24} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-6">{error || "The post you are looking for does not exist."}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors font-medium"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">Post</h1>
      </div>

      {/* Content */}
      <div className="pb-20">
        <PostCard 
            post={post} 
            onDelete={handleDeletePost} 
            defaultShowComments={true} 
        />
      </div>
    </div>
  );
};

export default PostDetail;