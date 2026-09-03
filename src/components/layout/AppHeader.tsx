import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Plus,
  Calculator,
  Bell,
  Sparkles,
  MessageSquare,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  CheckSquare,
  TrendingUp,
  Building,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  FileCheck,
  ScrollText,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionService, UserSubscription } from '../../services/subscriptionService';
import { notificationService } from '../../services/notificationService';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { UpgradeModal } from '../subscription/UpgradeModal';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { BrandLogo } from '../common/BrandLogo';
import { useToast } from '../common/Toast';
import { adminService } from '../../services/adminService';

interface AppHeaderProps {
  onOpenFeedback?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenFeedback }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshSubAndNotifs = async () => {
    if (user) {
      const sub = await subscriptionService.getSubscription(user);
      setSubscription(sub);
      setUnreadCount(notificationService.getUnreadCount(user.id));
    }
  };

  useEffect(() => {
    refreshSubAndNotifs();
    adminService.checkIsAdmin().then((status) => setIsAdmin(status));
    const unsub = notificationService.subscribe(() => {
      if (user?.id) {
        setUnreadCount(notificationService.getUnreadCount(user.id));
      }
    });
    return () => unsub();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Signed out successfully', 'info');
      navigate('/login');
    } catch {
      showToast('Error signing out', 'error');
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Mobile Menu Button (Visible on screens <= 768px) */}
          <button
            type="button"
            className="mobile-drawer-toggle"
            onClick={() => setMobileDrawerOpen(true)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#0B1F3A',
            }}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>

          <WorkspaceSwitcher />

          {/* Compact Trial Status Component (Non-intrusive) */}
          {subscription && subscription.status === 'TRIAL_ACTIVE' && (
            <div
              className="trial-status-badge"
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="btn btn-ghost btn-sm header-feedback-btn"
              title="Give Feedback or Request Features"
              style={{ fontSize: '0.8125rem', color: '#64748B' }}
            >
              <MessageSquare size={14} />
              <span>Feedback</span>
            </button>
          )}

          <Link to="/app/calculators" className="btn btn-secondary btn-sm header-calc-btn">
            <Calculator size={14} />
            <span>Calculators</span>
          </Link>

          <Link to="/app/documents/invoice" className="btn btn-primary btn-sm header-new-invoice-btn">
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

      {/* Slide-Over Full Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(9, 13, 22, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            style={{
              width: '82%',
              maxWidth: '320px',
              height: '100%',
              background: '#0B1F3A',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <BrandLogo size="md" variant="light" />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                aria-label="Close Navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation List */}
            <div style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', padding: '0.5rem 0.75rem', letterSpacing: '0.08em' }}>
                Main Hub
              </div>
              {[
                { label: 'Overview', path: '/app', icon: <LayoutDashboard size={18} /> },
                { label: 'All Documents', path: '/app/documents', icon: <FileText size={18} /> },
                { label: 'Clients Directory', path: '/app/clients', icon: <Users size={18} /> },
                { label: 'Incoming Payments', path: '/app/payments', icon: <CreditCard size={18} /> },
                { label: 'Expense Ledger', path: '/app/expenses', icon: <Receipt size={18} /> },
                { label: 'Accounting & Reports', path: '/app/accounting', icon: <FileSpreadsheet size={18} /> },
                { label: 'Task & Deliverable CSV', path: '/app/tasks', icon: <CheckSquare size={18} /> },
                { label: 'Profit & Margins', path: '/app/profit', icon: <TrendingUp size={18} /> },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '8px' }}
                  end={item.path === '/app'}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', padding: '1rem 0.75rem 0.25rem', letterSpacing: '0.08em' }}>
                Document Studio
              </div>
              {[
                { label: 'Invoices', path: '/app/documents/invoice', icon: <FileText size={18} /> },
                { label: 'Quotes', path: '/app/documents/quote', icon: <FileCheck size={18} /> },
                { label: 'Estimates', path: '/app/documents/estimate', icon: <FileCheck size={18} /> },
                { label: 'Proposals', path: '/app/documents/proposal', icon: <ScrollText size={18} /> },
                { label: 'Contracts', path: '/app/documents/contract', icon: <ScrollText size={18} /> },
                { label: 'Official Receipts', path: '/app/documents/receipt', icon: <Receipt size={18} /> },
                { label: 'Recurring Retainers', path: '/app/recurring', icon: <RefreshCw size={18} /> },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', padding: '1rem 0.75rem 0.25rem', letterSpacing: '0.08em' }}>
                Tools & Settings
              </div>
              {[
                { label: '8 Pricing Calculators', path: '/app/calculators', icon: <Calculator size={18} /> },
                { label: 'Business Settings', path: '/app/settings/business', icon: <Building size={18} /> },
                { label: 'Account Settings', path: '/app/settings/account', icon: <UserIcon size={18} /> },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#C9A227',
                    color: '#0A0A0A',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    textDecoration: 'none',
                    marginTop: '0.75rem',
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Platform Admin Portal</span>
                </Link>
              )}
            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#F87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.625rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        initialPlan={subscription?.plan || 'pro'}
      />
    </>
  );
};

