import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/feed/PostCard';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import { getImageUrl } from '../utils/imageUtils';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Profile Data
        const profileRes = await axiosClient.get(`/users/${userId}`);
        if (profileRes.data.success) {
          const data = profileRes.data.data;
          setProfile(data);
          setIsFollowing(data.isFollowing);
          setStats({
            followersCount: data.followersCount,
            followingCount: data.followingCount
          });
        }

        // Fetch User Posts
        const postsRes = await axiosClient.get(`/posts?userId=${userId}`);
        const rawPosts = postsRes.data.data || postsRes.data;
        
        // Enrich posts with profile data since we know the author is the profile owner
        // Note: 'data' variable holds the profile info from the previous call
        const profileData = profileRes.data.data; 
        const enrichedPosts = rawPosts.map(post => ({
          ...post,
          author: profileData
        }));

        setPosts(enrichedPosts);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleFollowToggle = async () => {
    const prevIsFollowing = isFollowing;
    const prevStats = { ...stats };

    setIsFollowing(!isFollowing);
    setStats(prev => ({
      ...prev,
      followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
    }));

    try {
      if (isFollowing) {
        await axiosClient.delete(`/users/${userId}/follow`);
      } else {
        await axiosClient.post(`/users/${userId}/follow`);
      }
    } catch (error) {
      setIsFollowing(prevIsFollowing);
      setStats(prevStats);
      console.error("Failed to toggle follow", error);
    }
  };

  const onProfileUpdate = (updatedData) => {
    setProfile(prev => ({ ...prev, ...updatedData }));
  };

  const isOwnProfile = currentUser?.id?.toString() === userId?.toString();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-white text-center mt-20">User not found</div>;
  }

  return (
    <div>
      {/* Header / Banner */}
      <div className="relative">
        <div className="h-48 w-full overflow-hidden bg-slate-800">
          {profile.coverUrl ? (
            <img src={getImageUrl(profile.coverUrl)} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          )}
        </div>
        
        <div className="absolute -bottom-16 left-4 p-1 bg-slate-950 rounded-full">
           <div className="w-32 h-32 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center">
             {profile.avatarUrl ? (
               <img src={getImageUrl(profile.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-4xl font-bold text-white">
                 {profile.username ? profile.username[0].toUpperCase() : 'U'}
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-4 pb-4 border-b border-white/5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
            <p className="text-slate-500">@{profile.username}</p>
          </div>
          
          {!isOwnProfile && (
            <button 
              onClick={handleFollowToggle}
              className={`
                font-bold px-6 py-2 rounded-full transition-all 
                ${isFollowing 
                  ? 'bg-transparent border border-slate-600 text-white hover:border-red-500 hover:text-red-500' 
                  : 'bg-white text-black hover:bg-slate-200'}
              `}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
          
          {isOwnProfile && (
             <button 
               onClick={() => setIsEditModalOpen(true)}
               className="bg-transparent border border-slate-600 text-white font-bold px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
             >
               Edit Profile
             </button>
          )}
        </div>

        <p className="mt-4 text-slate-200 max-w-xl whitespace-pre-wrap">
          {profile.bio || "No bio yet."}
        </p>

        <div className="flex gap-4 mt-4 text-slate-500 text-sm">
           <div className="flex items-center gap-1">
             <Calendar size={16} /> Joined {new Date(profile.createdAt).toLocaleDateString()}
           </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-white">{stats.followingCount}</span> <span className="text-slate-500">Following</span>
          </div>
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-white">{stats.followersCount}</span> <span className="text-slate-500">Followers</span>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div>
        <div className="flex border-b border-white/5">
           <div className="px-8 py-4 font-bold text-white border-b-4 border-blue-500 cursor-pointer hover:bg-white/5 transition-colors">
             Posts
           </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No posts yet.</div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentUser={profile} 
        onUpdateSuccess={onProfileUpdate} 
      />
    </div>
  );
};

export default Profile;