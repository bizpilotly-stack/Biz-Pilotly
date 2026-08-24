import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MobileNav } from './MobileNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="app-main">
        <AppHeader />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
