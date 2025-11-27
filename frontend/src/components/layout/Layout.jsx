import React from 'react';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto max-w-7xl flex">
        {/* Left Sidebar (Fixed width) */}
        <div className="w-[80px] xl:w-[280px] flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Feed (Flexible width) */}
        <main className="flex-1 min-w-0 border-r border-white/5">
          {children}
        </main>

        {/* Right Panel (Fixed width, hidden on small screens) */}
        <div className="w-[350px] flex-shrink-0 hidden lg:block">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default Layout;