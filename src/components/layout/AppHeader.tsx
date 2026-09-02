import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calculator, Bell, Layers, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionService, UserSubscription } from '../../services/subscriptionService';
import { notificationService } from '../../services/notificationService';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { UpgradeModal } from '../subscription/UpgradeModal';

export const AppHeader: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const refreshSubAndNotifs = async () => {
    if (user) {
      const sub = await subscriptionService.getSubscription(user);
      setSubscription(sub);
      setUnreadCount(notificationService.getUnreadCount(user.id));
    }
  };

  useEffect(() => {
    refreshSubAndNotifs();
    const unsub = notificationService.subscribe(() => {
      if (user?.id) {
        setUnreadCount(notificationService.getUnreadCount(user.id));
      }
    });
    return () => unsub();
  }, [user]);

  const formatTrialEndDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Layers size={16} color="#0B1F3A" />
            <span>Workspace</span>
          </div>

          {/* Compact Trial Status Component (Non-intrusive) */}
          {subscription && subscription.status === 'TRIAL_ACTIVE' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: subscription.isTrialEndingSoon ? '#FEF2F2' : '#FEF3C7',
                border: subscription.isTrialEndingSoon ? '1px solid #FECACA' : '1px solid #FDE68A',
                color: subscription.isTrialEndingSoon ? '#991B1B' : '#92400E',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Sparkles size={12} color={subscription.isTrialEndingSoon ? '#DC2626' : '#D97706'} />
              <span>
                <strong>{subscription.plan === 'business' ? 'Business Suite' : 'Professional'} Trial</strong> • {subscription.formattedCountdown}
                {subscription.trialEndsAt && ` • Ends ${formatTrialEndDate(subscription.trialEndsAt)}`}
              </span>
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(true)}
                style={{
                  background: subscription.isTrialEndingSoon ? '#DC2626' : '#0B1F3A',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '1px 8px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: '2px',
                }}
              >
                Subscribe
              </button>
            </div>
          )}
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

          {/* Notification Bell with Unread Badge */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="btn btn-secondary btn-icon btn-sm"
              title="Notifications"
              aria-label="Notifications"
              style={{ position: 'relative' }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#EF4444',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={notifDropdownOpen}
              onClose={() => setNotifDropdownOpen(false)}
            />
          </div>
        </div>
      </header>

      {/* Subscription Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        initialPlan={subscription?.plan || 'pro'}
      />
    </>
  );
};
