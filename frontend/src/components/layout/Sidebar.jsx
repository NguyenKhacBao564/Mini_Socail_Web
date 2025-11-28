import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Bell, LogOut, Settings, Hash } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';

const SidebarItem = ({ icon: Icon, text, to, active, onClick, isDanger }) => (
  <Link 
    to={to || "#"} 
    onClick={onClick}
    className={`
      flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group
      ${active ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
      ${isDanger ? 'text-red-400 hover:bg-red-500/10 hover:text-red-400' : ''}
    `}
  >
    <Icon size={24} />
    <span className="text-lg hidden xl:block">{text}</span>
  </Link>
);

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between py-6 px-2 xl:px-4 border-r border-white/5">
      <div className="space-y-6">
        {/* Logo */}
        <div className="px-3 mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 hidden xl:block">
            OmniSocial
          </h1>
          <div className="xl:hidden w-8 h-8 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500" />
        </div>

        {/* Nav Items */}
        <nav className="space-y-2">
          <SidebarItem icon={Home} text="Home" to="/" active={location.pathname === '/'} />
          <SidebarItem icon={Hash} text="Explore" />
          <SidebarItem icon={Bell} text="Notifications" to="/notifications" active={location.pathname === '/notifications'} />
          <SidebarItem 
            icon={User} 
            text="Profile" 
            to={user ? `/profile/${user.id}` : '#'} 
            active={location.pathname.startsWith('/profile')} 
          />
          <SidebarItem icon={Settings} text="Settings" />
        </nav>

        {/* Post Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 xl:py-3 font-bold shadow-lg shadow-blue-900/20 transition-all mt-4 flex justify-center items-center">
          <span className="hidden xl:block">Post</span>
          <span className="xl:hidden">+</span>
        </button>
      </div>

      {/* User & Logout */}
      <div className="space-y-2">
        <Link to={user ? `/profile/${user.id}` : '#'} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            {user?.avatarUrl ? (
               <img src={getImageUrl(user.avatarUrl)} alt="User" className="w-full h-full object-cover" />
             ) : (
               user?.username?.[0]?.toUpperCase() || 'U'
             )}
          </div>
          <div className="hidden xl:block overflow-hidden">
            <p className="font-bold text-sm truncate text-white">{user?.username}</p>
            <p className="text-slate-500 text-xs truncate">@{user?.username}</p>
          </div>
        </Link>
        <SidebarItem icon={LogOut} text="Logout" onClick={logout} isDanger />
      </div>
    </div>
  );
};

export default Sidebar;
