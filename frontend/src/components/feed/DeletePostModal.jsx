import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const DeletePostModal = ({ onClose, onConfirm, isDeleting }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2">Delete Post?</h3>
          <p className="text-slate-400 text-sm mb-6">
            Are you sure you want to delete this post? This action cannot be undone and will remove it from your profile permanently.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeletePostModal;