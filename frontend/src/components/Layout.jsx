import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  BarChart2, 
  PieChart, 
  FileText, 
  Search,
  ChevronRight,
  TrendingUp,
  FileDown,
  ChevronLeft,
  Menu
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const links = [
    { to: "/companies", icon: <Building2 size={20}/>, label: "Companies" },
    { to: "/market", icon: <PieChart size={20}/>, label: "Market" },
    { to: "/analytics", icon: <TrendingUp size={20}/>, label: "Analytics" },
    { to: "/reports", icon: <FileDown size={20}/>, label: "Reports" },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 text-slate-300 shadow-2xl z-50 transition-all duration-300 ease-in-out`}>
      <div className={`h-20 flex flex-col justify-center ${isCollapsed ? 'items-center' : 'px-6'} border-b border-slate-800 bg-slate-900 overflow-hidden relative`}>
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h1 className="text-xl font-black tracking-tighter glow-text truncate">
              SEC EDGAR
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 truncate">
              Financial Data Insights from SEC Filings
            </p>
          </div>
        )}
        {isCollapsed && (
          <div className="text-xl font-black text-emerald-500 tracking-tighter">SEC</div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute ${isCollapsed ? 'relative mt-2' : 'right-4 top-1/2 -translate-y-1/2'} p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white transition-colors`}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <div className="flex flex-col py-6 px-3 gap-1 overflow-y-auto overflow-x-hidden">
        {links.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to}
            title={isCollapsed ? link.label : ""}
            className={({isActive}) => 
              `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500' 
                  : 'hover:bg-slate-800/80 hover:text-slate-100 border-l-2 border-transparent'
              }`
            }
          >
            {link.icon}
            {!isCollapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

const Topbar = ({ isCollapsed }) => {
  return (
    <div className="h-4 bg-transparent sticky top-0 z-40">
      {/* Search and Breadcrumbs removed as per request */}
    </div>
  );
};

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  return (
    <div className="flex bg-[#0f172a] min-h-screen text-slate-100 font-sans">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} flex flex-col relative w-full overflow-x-hidden transition-all duration-300 ease-in-out`}>
        <Topbar isCollapsed={isCollapsed} />
        <div className={`p-8 w-full max-w-7xl mx-auto ${isCollapsed ? 'translate-x-0' : ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
