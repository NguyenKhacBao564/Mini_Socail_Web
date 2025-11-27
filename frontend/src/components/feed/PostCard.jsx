import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import CommentSection from './CommentSection';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(parseInt(post.likesCount) || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking like
    if (isLikeLoading) return;
    
    // Optimistic Update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLikeLoading(true);

    try {
      await axiosClient.post(`/posts/${post.id}/like`);
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      console.error("Failed to like post", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar - Clickable */}
        <Link 
          to={`/profile/${post.userId}`} 
          onClick={(e) => e.stopPropagation()}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex-shrink-0 flex items-center justify-center font-bold text-white hover:opacity-80 transition-opacity overflow-hidden"
        >
          {post.author?.avatarUrl ? (
            <img src={`http://localhost:3000${post.author.avatarUrl}`} alt={post.author.username} className="w-full h-full object-cover" />
          ) : (
            post.author?.username?.[0]?.toUpperCase() || 'U'
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Link 
                to={`/profile/${post.userId}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-white hover:underline"
              >
                {post.author?.username || `User #${post.userId}`}
              </Link>
              <span className="text-slate-500 text-sm">· {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <button className="text-slate-500 hover:text-blue-400 p-1 rounded-full hover:bg-blue-500/10">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Body */}
          <p className="text-slate-200 mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Image */}
          {post.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-800">
              <img 
                src={`http://localhost:3000${post.imageUrl}`} 
                alt="Post attachment" 
                className="w-full h-auto object-cover" 
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-3 text-slate-500 max-w-md">
            {/* Reply / Comment */}
            <button 
              onClick={handleCommentClick}
              className={`flex items-center gap-2 group transition-colors ${showComments ? 'text-blue-400' : 'hover:text-blue-400'}`}
            >
              <div className={`p-2 rounded-full ${showComments ? 'bg-blue-500/10' : 'group-hover:bg-blue-500/10'}`}>
                <MessageCircle size={18} />
              </div>
              <span className="text-xs">{showComments ? 'Close' : 'Reply'}</span>
            </button>

            {/* Like */}
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
              <div className={`p-2 rounded-full ${isLiked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </div>
              <span className={`text-xs ${isLiked ? 'font-bold' : ''}`}>
                {likesCount > 0 ? likesCount : 'Like'}
              </span>
            </button>

            {/* Share */}
            <button className="flex items-center gap-2 hover:text-green-500 group transition-colors">
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Share2 size={18} />
              </div>
              <span className="text-xs">Share</span>
            </button>
          </div>

          {/* Comment Section */}
          {showComments && <CommentSection postId={post.id} />}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
