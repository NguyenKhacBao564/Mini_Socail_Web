import React from 'react';

const UserSuggestion = ({ name, handle, color }) => (
  <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex-shrink-0`} />
    <div className="flex-1 overflow-hidden">
      <p className="font-bold text-sm text-white truncate">{name}</p>
      <p className="text-slate-500 text-xs truncate">{handle}</p>
    </div>
    <button className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
      Follow
    </button>
  </div>
);

const RightPanel = () => {
  return (
    <div className="h-screen sticky top-0 py-6 px-4 hidden lg:flex flex-col gap-6 border-l border-white/5">
      {/* Search */}
      <div className="relative">
        <input 
          placeholder="Search OmniSocial" 
          className="w-full bg-slate-900 border border-slate-800 rounded-full py-3 px-6 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500" 
        />
      </div>

      {/* Who to follow */}
      <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-4">
        <h3 className="font-bold text-lg text-white mb-4 px-2">Who to follow</h3>
        <div className="space-y-1">
          <UserSuggestion name="Elon Musk" handle="@elonmusk" color="from-yellow-400 to-orange-500" />
          <UserSuggestion name="React Team" handle="@reactjs" color="from-blue-400 to-indigo-500" />
          <UserSuggestion name="Gemini AI" handle="@googleai" color="from-purple-400 to-pink-500" />
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-500 px-4 leading-relaxed">
        <span className="hover:underline cursor-pointer">Terms of Service</span> · 
        <span className="hover:underline cursor-pointer ml-1">Privacy Policy</span> · 
        <span className="hover:underline cursor-pointer ml-1">Cookie Policy</span> <br/>
        © 2025 OmniSocial Inc.
      </div>
    </div>
  );
};

export default RightPanel;