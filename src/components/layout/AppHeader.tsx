import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calculator, Bell } from 'lucide-react';
import { useToast } from '../common/Toast';

export const AppHeader: React.FC = () => {
  const { showToast } = useToast();

  const handleNotificationClick = () => {
    showToast('You have 2 pending invoice payments scheduled this week.', 'info');
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem' }}>← Marketing Site</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/calculators" className="btn btn-secondary btn-sm">
          <Calculator size={14} />
          <span>Calculators</span>
        </Link>

        <Link to="/documents/invoice" className="btn btn-primary btn-sm">
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
