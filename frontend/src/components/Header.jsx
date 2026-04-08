import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User, LayoutDashboard } from 'lucide-react';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click  
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-30">
      {/* Left: Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={22} />
      </button>

      {/* Center: Brand */}
      <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">
        AI Analyst<span className="text-blue-500">.</span>
      </h1>

      {/* Right: Avatar */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2"
        >
          <span className="text-sm font-medium text-slate-300 hidden sm:block">{user?.name}</span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm border-2 border-blue-400/30 shadow-lg shadow-blue-600/20 cursor-pointer hover:scale-105 transition-transform">
            {initial}
          </div>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
            <div className="p-4 border-b border-slate-700">
              <p className="font-bold text-white">{user?.name}</p>
              <p className="text-sm text-slate-400 truncate">{user?.email}</p>
              <span className="inline-block mt-2 bg-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/20">
                {user?.role}
              </span>
            </div>
            <div className="p-2">
              <button
                onClick={() => { setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium"
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button
                onClick={() => { logout(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
