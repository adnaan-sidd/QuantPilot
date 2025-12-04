import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="p-4 sm:ml-64">
        <div className="p-4 mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;