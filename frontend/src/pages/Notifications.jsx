import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Heart, UserPlus, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosClient.get('/notifications');
        const rawNotifs = res.data.data;

        if (rawNotifs.length === 0) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        // Extract Sender IDs
        const senderIds = [...new Set(rawNotifs.map(n => n.senderId))];

        // Batch Fetch Users
        const usersRes = await axiosClient.get(`/users/batch?ids=${senderIds.join(',')}`);
        const users = usersRes.data.data;
        const userMap = {};
        users.forEach(u => { userMap[u.id] = u; });

        // Enrich
        const enriched = rawNotifs.map(n => ({
          ...n,
          sender: userMap[n.senderId] || { username: `User #${n.senderId}`, avatarUrl: null }
        }));

        setNotifications(enriched);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'POST_LIKED': return <Heart size={20} className="text-pink-500" />;
      case 'USER_FOLLOWED': return <UserPlus size={20} className="text-blue-500" />;
      default: return <MessageCircle size={20} className="text-green-500" />;
    }
  };

  const getText = (notif) => {
    switch(notif.type) {
      case 'POST_LIKED': return 'liked your post.';
      case 'USER_FOLLOWED': return 'started following you.';
      default: return 'interacted with you.';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <h2 className="text-xl font-bold text-white">Notifications</h2>
      </div>

      <div className="max-w-2xl mx-auto">
        {loading ? (
           <div className="flex justify-center py-10">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : notifications.length === 0 ? (
           <div className="text-center py-10 text-slate-500">No notifications yet. May be Later.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <div className="p-2 bg-white/5 rounded-full flex-shrink-0">
                {getIcon(n.type)}
              </div>
              
              {/* Avatar */}
              <Link to={`/profile/${n.senderId}`} className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white overflow-hidden">
                  {n.sender.avatarUrl ? (
                    <img src={getImageUrl(n.sender.avatarUrl)} alt={n.sender.username} className="w-full h-full object-cover" />
                  ) : (
                    n.sender.username[0].toUpperCase()
                  )}
                </div>
              </Link>

              <div className="flex-1">
                <p className="text-white text-sm">
                  <Link to={`/profile/${n.senderId}`} className="font-bold hover:underline">
                    {n.sender.username}
                  </Link> {getText(n)}
                </p>
                <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;