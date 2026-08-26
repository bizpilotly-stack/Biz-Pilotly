import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calculator, Bell, Layers } from 'lucide-react';
import { useToast } from '../common/Toast';

export const AppHeader: React.FC = () => {
  const { showToast } = useToast();

  const handleNotificationClick = () => {
    showToast('No unread notifications at this time.', 'info');
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Layers size={16} color="#0B1F3A" />
          <span>Workspace</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/app/calculators" className="btn btn-secondary btn-sm">
          <Calculator size={14} />
          <span>Calculators</span>
        </Link>

        <Link to="/app/documents/invoice" className="btn btn-primary btn-sm">
          <Plus size={14} />
          <span>New Invoice</span>
        </Link>

        <button
          onClick={handleNotificationClick}
          className="btn btn-secondary btn-icon btn-sm"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
};

