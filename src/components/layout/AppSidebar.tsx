import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Receipt,
  TrendingUp,
  Building,
  User as UserIcon,
  LogOut,
  Calculator,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  ScrollText,
  FileSpreadsheet,
  CheckSquare,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { BrandLogo } from '../common/BrandLogo';
import { adminService } from '../../services/adminService';
import { subscriptionService, UserSubscription } from '../../services/subscriptionService';
import { UpgradeModal } from '../subscription/UpgradeModal';

interface SidebarNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  end?: boolean;
  requiredPlan?: 'pro' | 'business';
}

export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState<'pro' | 'business'>('pro');

  useEffect(() => {
    let mounted = true;
    adminService.checkIsAdmin().then((adminStatus) => {
      if (mounted) setIsAdmin(adminStatus);
    });
    if (user) {
      subscriptionService.getSubscription({ id: user.id, email: user.email }).then((sub) => {
        if (mounted) setSubscription(sub);
      });
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const effectivePlan = subscription ? subscriptionService.getEffectivePlan(subscription) : 'free';

  const isLocked = (requiredPlan?: 'pro' | 'business') => {
    if (!requiredPlan) return false;
    if (requiredPlan === 'pro') {
      return effectivePlan === 'free';
    }
    if (requiredPlan === 'business') {
      return effectivePlan === 'free' || effectivePlan === 'pro';
    }
    return false;
  };

  const handleNavClick = (e: React.MouseEvent, item: SidebarNavItem) => {
    if (isLocked(item.requiredPlan) && item.requiredPlan) {
      e.preventDefault();
      setUpgradeTargetPlan(item.requiredPlan);
      setUpgradeModalOpen(true);
      showToast(
        `${item.label} is exclusive to ${item.requiredPlan === 'business' ? 'Business Suite' : 'Professional'}. Start a 15-day trial to unlock!`,
        'info'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Signed out successfully', 'info');
      navigate('/login');
    } catch {
      showToast('Error signing out.', 'error');
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Studio Admin';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const navItems: SidebarNavItem[] = [
    { label: 'Overview', path: '/app', icon: <LayoutDashboard className="icon" />, end: true },
    { label: 'All Documents', path: '/app/documents', icon: <FileText className="icon" /> },
    { label: 'Clients Directory', path: '/app/clients', icon: <Users className="icon" /> },
    { label: 'Incoming Payments', path: '/app/payments', icon: <CreditCard className="icon" /> },
    { label: 'Expense Ledger', path: '/app/expenses', icon: <Receipt className="icon" /> },
    { label: 'Accounting & Reports', path: '/app/accounting', icon: <FileSpreadsheet className="icon" />, requiredPlan: 'pro' },
    { label: 'Task & Deliverable CSV', path: '/app/tasks', icon: <CheckSquare className="icon" />, requiredPlan: 'pro' },
    { label: 'Profit & Margins', path: '/app/profit', icon: <TrendingUp className="icon" /> },
  ];

  const documentStudioItems: SidebarNavItem[] = [
    { label: 'Invoices', path: '/app/documents/invoice', icon: <FileText className="icon" /> },
    { label: 'Quotes', path: '/app/documents/quote', icon: <FileCheck className="icon" /> },
    { label: 'Estimates', path: '/app/documents/estimate', icon: <FileCheck className="icon" /> },
    { label: 'Proposals', path: '/app/documents/proposal', icon: <ScrollText className="icon" /> },
    { label: 'Contracts', path: '/app/documents/contract', icon: <ScrollText className="icon" />, requiredPlan: 'business' },
    { label: 'Official Receipts', path: '/app/documents/receipt', icon: <Receipt className="icon" /> },
    { label: 'Recurring Retainers', path: '/app/recurring', icon: <RefreshCw className="icon" />, requiredPlan: 'pro' },
  ];

  const settingsItems: SidebarNavItem[] = [
    { label: '8 Pricing Calculators', path: '/app/calculators', icon: <Calculator className="icon" /> },
    { label: 'Team & Seats', path: '/app/team', icon: <Users className="icon" />, requiredPlan: 'business' },
    { label: 'Business Settings', path: '/app/settings/business', icon: <Building className="icon" /> },
    { label: 'Account Settings', path: '/app/settings/account', icon: <UserIcon className="icon" /> },
  ];

  const renderNavItem = (item: SidebarNavItem) => {
    const locked = isLocked(item.requiredPlan);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        onClick={(e) => handleNavClick(e, item)}
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''} ${locked ? 'is-locked' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: locked ? 0.85 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          {item.icon}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
        </div>

        {locked && (
          <span
            style={{
              fontSize: '0.5625rem',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '4px',
              background: item.requiredPlan === 'business' ? 'rgba(201, 162, 39, 0.25)' : 'rgba(59, 130, 246, 0.25)',
              color: item.requiredPlan === 'business' ? '#FDE047' : '#93C5FD',
              border: item.requiredPlan === 'business' ? '1px solid rgba(201, 162, 39, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Lock size={9} />
            <span>{item.requiredPlan === 'business' ? 'BIZ' : 'PRO'}</span>
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="app-sidebar" aria-label="Application Sidebar">
      <div className="app-sidebar-header">
        <Link to="/app">
          <BrandLogo size="md" variant="light" />
        </Link>
      </div>

      <div className="app-sidebar-nav">
        <div className="sidebar-nav-section-title">Operations</div>
        {navItems.map(renderNavItem)}

        <div className="sidebar-nav-section-title" style={{ marginTop: '1.25rem' }}>Document Studio</div>
        {documentStudioItems.map(renderNavItem)}

        <div className="sidebar-nav-section-title" style={{ marginTop: '1.25rem' }}>Preferences & Tools</div>
        {settingsItems.map(renderNavItem)}

        {isAdmin && (
          <>
            <div className="sidebar-nav-section-title" style={{ marginTop: '1rem', color: '#fbbf24' }}>Platform Admin</div>
            <Link
              to="/admin"
              className="sidebar-nav-item"
              style={{
                background: 'rgba(201, 162, 39, 0.12)',
                color: '#fef08a',
                border: '1px solid rgba(201, 162, 39, 0.25)',
                fontWeight: 600,
              }}
            >
              <ShieldCheck className="icon" color="#fbbf24" />
              <span>Admin Suite</span>
            </Link>
          </>
        )}
      </div>

      <div className="app-sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">
            {avatarLetter}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <button
                type="button"
                onClick={() => {
                  setUpgradeTargetPlan(effectivePlan === 'free' ? 'pro' : 'business');
                  setUpgradeModalOpen(true);
                }}
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  background:
                    effectivePlan === 'business'
                      ? 'linear-gradient(135deg, #C9A227 0%, #A37F16 100%)'
                      : effectivePlan === 'pro'
                      ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                      : 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                title="Click to manage subscription & upgrade"
              >
                <span>
                  {effectivePlan === 'business'
                    ? '👑 Business Suite'
                    : effectivePlan === 'pro'
                    ? '⭐ Professional'
                    : 'Free Starter • Upgrade'}
                </span>
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ color: '#94a3b8' }}
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        initialPlan={upgradeTargetPlan}
      />
    </aside>
  );
};
