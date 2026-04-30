import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
