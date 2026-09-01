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
    if (user) {
      adminService.checkIsAdmin().then((res) => setIsAdmin(res));
    } else {
      setIsAdmin(false);
    }
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
    { label: 'Calculators', path: '/app/calculators', icon: <Calculator className="icon" /> },
    { label: 'Documents', path: '/app/documents', icon: <FileText className="icon" /> },
    { label: 'Clients', path: '/app/clients', icon: <Users className="icon" /> },
    { label: 'Payments', path: '/app/payments', icon: <CreditCard className="icon" /> },
    { label: 'Expenses', path: '/app/expenses', icon: <Receipt className="icon" /> },
    { label: 'Profit', path: '/app/profit', icon: <TrendingUp className="icon" /> },
  ];

  const toolItems = [
    { label: 'New Invoice', path: '/app/documents/invoice', icon: <FileText className="icon" /> },
    { label: 'Profit Margin', path: '/app/calculators/profit-margin', icon: <TrendingUp className="icon" /> },
  ];

  const settingsItems = [
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

        <div className="sidebar-nav-section-title" style={{ marginTop: '1rem' }}>Fast Tools</div>
        {toolItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="sidebar-nav-item"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="sidebar-nav-section-title" style={{ marginTop: '1rem' }}>Preferences</div>
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
