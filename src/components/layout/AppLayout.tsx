import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MobileNav } from './MobileNav';
import { PWAInstallPrompt } from '../common/PWAInstallPrompt';

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
      <PWAInstallPrompt />
    </div>
  );
};
