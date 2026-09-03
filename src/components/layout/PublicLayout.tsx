import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
