import React, { useState, useEffect, useContext } from 'react';
import axiosClient from '../../api/axiosClient';
import { Send } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchComments = async () => {
    try {
      const res = await axiosClient.get(`/comments/${postId}`);
      setComments(res.data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Optimistic UI update could be done here, but we'll just fetch for simplicity
    try {
      // User ID is injected by Gateway, but frontend sends just content/postId usually
      // Checking Comment Service logic: it expects content, postId, userId in BODY?
      // Wait, CommentController.js expects { content, postId, userId } in req.body.
      // We need to send userId from frontend context if the Gateway doesn't inject it into body (Gateway injects into HEADERS).
      // Backend CommentController should ideally read from headers like PostController does now.
      // BUT I cannot modify CommentController in this turn (not requested).
      // So I MUST send userId in the body.
      
      await axiosClient.post('/comments', { 
        content: newComment, 
        postId,
        userId: user?.id 
      });
      
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="space-y-4 mb-4">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-slate-500 text-sm">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold">
                {comment.userId?.toString()[0] || 'U'}
              </div>
              <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-slate-200 flex-1">
                <span className="font-bold text-white block text-xs mb-1">User #{comment.userId}</span>
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-1 bg-slate-900 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!newComment.trim()}
          className="text-blue-400 hover:bg-blue-500/10 p-2 rounded-full transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
