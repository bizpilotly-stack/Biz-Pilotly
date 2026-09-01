import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calculator, Bell, Layers, Sparkles } from 'lucide-react';
import { useToast } from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { TrialUpgradeModal } from '../common/TrialUpgradeModal';

export const AppHeader: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const trialInfo = subscriptionService.getUserTrialInfo(user?.created_at);

  const handleNotificationClick = () => {
    showToast('No unread notifications at this time.', 'info');
  };

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Layers size={16} color="#0B1F3A" />
            <span>Workspace</span>
          </div>

          {/* Interactive 30-Day All-Access Trial Countdown Badge */}
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: trialInfo.isInTrial ? '#FEF3C7' : '#F1F5F9',
              color: trialInfo.isInTrial ? '#B45309' : '#475569',
              border: trialInfo.isInTrial ? '1px solid #FDE68A' : '1px solid #E2E8F0',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Click to view subscription tiers & 50% early bird discount"
          >
            <Sparkles size={13} color={trialInfo.isInTrial ? '#D97706' : '#64748B'} />
            <span>
              {trialInfo.isInTrial
                ? `30-Day VIP Pass • ${trialInfo.daysRemaining}d Left`
                : 'Free Starter • Upgrade'}
            </span>
            <span style={{ fontSize: '0.625rem', background: '#F59E0B', color: '#ffffff', padding: '1px 5px', borderRadius: '999px', fontWeight: 800 }}>
              50% OFF
            </span>
          </button>
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

      {/* 30-Day Trial Upgrade & Waitlist Modal */}
      <TrialUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        trialInfo={trialInfo}
      />
    </>
  );
};
