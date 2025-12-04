import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Compass, TrendingUp, Settings, CreditCard, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center p-3 rounded-lg group transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  }

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-slate-900 border-r border-slate-800">
      <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
        <div className="flex items-center ps-2.5 mb-8 mt-2">
            <div className="bg-brand-600 p-1.5 rounded-lg mr-3">
                <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white">QP<span className="text-brand-500">.AI</span></span>
        </div>
        
        <ul className="space-y-2 font-medium flex-1">
          <li>
            <NavLink to="/app/dashboard" className={linkClass}>
              <LayoutDashboard className="w-5 h-5 transition duration-75 group-hover:text-white" />
              <span className="ms-3">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/strategies" className={linkClass}>
              <Compass className="w-5 h-5 transition duration-75 group-hover:text-white" />
              <span className="ms-3">Strategies</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/backtests" className={linkClass}>
              <TrendingUp className="w-5 h-5 transition duration-75 group-hover:text-white" />
              <span className="ms-3">Backtests</span>
            </NavLink>
          </li>
        </ul>

        <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-slate-800">
            <li>
                <NavLink to="/app/billing" className={linkClass}>
                <CreditCard className="w-5 h-5 transition duration-75 group-hover:text-white" />
                <span className="ms-3">Billing</span>
                </NavLink>
            </li>
            <li>
                <NavLink to="/app/settings" className={linkClass}>
                <Settings className="w-5 h-5 transition duration-75 group-hover:text-white" />
                <span className="ms-3">Settings</span>
                </NavLink>
            </li>
             <li>
                <button onClick={handleLogout} className="w-full flex items-center p-3 text-slate-400 rounded-lg hover:bg-red-900/20 hover:text-red-400 group">
                    <LogOut className="w-5 h-5 transition duration-75" />
                    <span className="ms-3">Sign Out</span>
                </button>
            </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;