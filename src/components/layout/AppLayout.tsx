import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MobileNav } from './MobileNav';
import { PWAInstallPrompt } from '../common/PWAInstallPrompt';
import { SupportWidget } from '../common/SupportWidget';
import { FeedbackModal } from '../common/FeedbackModal';

export const AppLayout: React.FC = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="app-main">
        <AppHeader onOpenFeedback={() => setFeedbackOpen(true)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <PWAInstallPrompt />
      <SupportWidget />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
};
