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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { BrandLogo } from '../common/BrandLogo';
import { adminService } from '../../services/adminService';

export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    adminService.checkIsAdmin().then((adminStatus) => {
      if (mounted) setIsAdmin(adminStatus);
    });
    return () => {
      mounted = false;
    };
  }, [user]);

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
  const displayEmail = user?.email || 'BizPilotly Workspace';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const navItems = [
    { label: 'Overview', path: '/app', icon: <LayoutDashboard className="icon" />, end: true },
    { label: 'All Documents', path: '/app/documents', icon: <FileText className="icon" /> },
    { label: 'Clients Directory', path: '/app/clients', icon: <Users className="icon" /> },
    { label: 'Incoming Payments', path: '/app/payments', icon: <CreditCard className="icon" /> },
    { label: 'Expense Ledger', path: '/app/expenses', icon: <Receipt className="icon" /> },
    { label: 'Accounting & Reports', path: '/app/accounting', icon: <FileSpreadsheet className="icon" /> },
    { label: 'Task & Deliverable CSV', path: '/app/tasks', icon: <CheckSquare className="icon" /> },
    { label: 'Profit & Margins', path: '/app/profit', icon: <TrendingUp className="icon" /> },
  ];

  const documentStudioItems = [
    { label: 'Invoices', path: '/app/documents/invoice', icon: <FileText className="icon" /> },
    { label: 'Quotes', path: '/app/documents/quote', icon: <FileCheck className="icon" /> },
    { label: 'Estimates', path: '/app/documents/estimate', icon: <FileCheck className="icon" /> },
    { label: 'Proposals', path: '/app/documents/proposal', icon: <ScrollText className="icon" /> },
    { label: 'Contracts', path: '/app/documents/contract', icon: <ScrollText className="icon" /> },
    { label: 'Official Receipts', path: '/app/documents/receipt', icon: <Receipt className="icon" /> },
    { label: 'Recurring Retainers', path: '/app/recurring', icon: <RefreshCw className="icon" /> },
  ];

  const settingsItems = [
    { label: '8 Pricing Calculators', path: '/app/calculators', icon: <Calculator className="icon" /> },
    { label: 'Team & Seats', path: '/app/team', icon: <Users className="icon" /> },
    { label: 'Business Settings', path: '/app/settings/business', icon: <Building className="icon" /> },
    { label: 'Account Settings', path: '/app/settings/account', icon: <UserIcon className="icon" /> },
  ];

  return (
    <aside className="app-sidebar" aria-label="Application Sidebar">
      <div className="app-sidebar-header">
        <Link to="/app">
          <BrandLogo size="md" variant="light" />
        </Link>
      </div>

      <div className="app-sidebar-nav">
        <div className="sidebar-nav-section-title">Operations</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar-nav-section-title" style={{ marginTop: '1.25rem' }}>Document Studio</div>
        {documentStudioItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar-nav-section-title" style={{ marginTop: '1.25rem' }}>Preferences & Tools</div>
        {settingsItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

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
            <div style={{ fontSize: '0.6875rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayEmail}
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
    </aside>
  );
};
