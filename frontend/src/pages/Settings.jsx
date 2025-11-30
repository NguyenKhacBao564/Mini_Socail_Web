import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      const res = await axiosClient.put('/users/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      if (res.data.success) {
        toast.success("Password updated successfully");
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error("Change password failed", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Lock className="text-blue-500" />
        Security Settings
      </h1>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-slate-400 text-sm mb-1">Current Password</label>
            <input 
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter current password"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-slate-400 text-sm mb-1">New Password</label>
            <input 
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter new password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-slate-400 text-sm mb-1">Confirm New Password</label>
            <input 
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;