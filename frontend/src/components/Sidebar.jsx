import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, PieChart, Info, Settings, Database } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Upload Data', path: '/upload', icon: <UploadCloud size={20} /> },
    { name: 'Datasets', path: '/datasets', icon: <Database size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col items-center py-6 border-r border-slate-800 shrink-0 shadow-xl">
      <div className="flex items-center gap-3 mb-10 w-full px-6">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <PieChart size={24} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">AI Analyst<span className="text-blue-500">.</span></h1>
      </div>
      
      <nav className="flex-1 w-full flex flex-col gap-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white font-medium' 
                : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="w-full px-4 mb-4">
        <div className="bg-slate-800 rounded-xl p-4 mt-auto">
          <div className="flex items-center gap-2 mb-2 text-white font-medium">
            <Info size={16} className="text-blue-400" />
            <span className="text-sm">Storage Usage</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-1">
            <div className="bg-blue-500 h-full w-1/3 rounded-full"></div>
          </div>
          <p className="text-xs text-slate-400 text-right">33% Full</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
