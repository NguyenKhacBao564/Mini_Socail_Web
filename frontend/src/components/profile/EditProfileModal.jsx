import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdateSuccess }) => {
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl ? `http://localhost:3000${currentUser.avatarUrl}` : null);
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(currentUser.coverUrl ? `http://localhost:3000${currentUser.coverUrl}` : null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);
      if (cover) formData.append('cover', cover);

      const res = await axiosClient.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        onUpdateSuccess(res.data.data);
        onClose();
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/5">
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Cover Image Input */}
            <div className="h-32 bg-slate-800 relative group cursor-pointer">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <span>No Cover Image</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <label className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer transition-all">
                  <Camera size={20} />
                  <input type="file" className="hidden" onChange={handleCoverChange} accept="image/*" />
                </label>
              </div>
            </div>

            {/* Avatar Input - Overlapping */}
            <div className="px-6 relative">
              <div className="-mt-12 w-24 h-24 rounded-full border-4 border-slate-900 relative group">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-700">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                      {currentUser.username[0]}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer">
                    <Camera size={16} />
                    <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Bio</label>
                <textarea 
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none resize-none h-24"
                  placeholder="Tell the world about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-white text-black font-bold px-6 py-2 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
