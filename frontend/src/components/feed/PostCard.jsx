import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import CommentSection from './CommentSection';
import DeletePostModal from './DeletePostModal';
import { getImageUrl } from '../../utils/imageUtils';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete, defaultShowComments = false }) => {
  const { user } = useContext(AuthContext);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(parseInt(post.likesCount) || 0);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const optionsRef = useRef(null);

  const isOwner = user?.id === post.userId;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLikeLoading) return;
    
    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLikeLoading(true);

    try {
      await axiosClient.post(`/posts/${post.id}/like`);
    } catch (error) {
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

  const handleShare = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/post/${post.id}`; 
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
    setShowOptions(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/posts/${post.id}`);
      toast.success('Post deleted successfully');
      setShowDeleteModal(false);
      if (onDelete) onDelete(post.id);
    } catch (error) {
      console.error("Failed to delete post", error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors relative"
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <Link 
            to={`/profile/${post.userId}`} 
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex-shrink-0 flex items-center justify-center font-bold text-white hover:opacity-80 transition-opacity overflow-hidden"
          >
            {post.author?.avatarUrl ? (
              <img src={getImageUrl(post.author.avatarUrl)} alt={post.author.username} className="w-full h-full object-cover" />
            ) : (
              post.author?.username?.[0]?.toUpperCase() || 'U'
            )}
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start relative">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/profile/${post.userId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-white hover:underline"
                            >
                              {post.author?.username || `User #${post.userId}`}
                            </Link>
                            <Link 
                              to={`/post/${post.id}`}
                              className="text-slate-500 text-sm hover:text-blue-400 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              · {new Date(post.createdAt).toLocaleDateString()}
                            </Link>
                          </div>
                          
                          {/* Options Menu */}              <div className="relative" ref={optionsRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                  className="text-slate-500 hover:text-blue-400 p-1 rounded-full hover:bg-blue-500/10 transition-colors"
                >
                  <MoreHorizontal size={18} />
                </button>

                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                      <button
                        onClick={handleShare}
                        className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2 transition-colors"
                      >
                        <Copy size={16} />
                        Copy Link
                      </button>
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOptions(false);
                            setShowDeleteModal(true);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Body */}
            <p className="text-slate-200 mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Image */}
            {post.imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-800">
                <img 
                  src={getImageUrl(post.imageUrl)} 
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

              {/* Share (Direct action) */}
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-green-500 group transition-colors"
              >
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeletePostModal 
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PostCard;