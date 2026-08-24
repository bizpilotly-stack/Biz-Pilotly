import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Receipt,
  TrendingUp,
  Building,
  User,
  LogOut,
  Calculator,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../common/Toast';
import { BrandLogo } from '../common/BrandLogo';

export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    showToast('Signed out successfully', 'info');
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/app', icon: <LayoutDashboard className="icon" />, end: true },
    { label: 'Clients', path: '/app/clients', icon: <Users className="icon" /> },
    { label: 'Documents', path: '/app/documents', icon: <FileText className="icon" /> },
    { label: 'Payments', path: '/app/payments', icon: <CreditCard className="icon" /> },
    { label: 'Expenses', path: '/app/expenses', icon: <Receipt className="icon" /> },
    { label: 'Profit', path: '/app/profit', icon: <TrendingUp className="icon" /> },
  ];

  const toolItems = [
    { label: 'Calculators Hub', path: '/calculators', icon: <Calculator className="icon" /> },
    { label: 'New Invoice', path: '/documents/invoice', icon: <FileText className="icon" /> },
  ];

  const settingsItems = [
    { label: 'Business Settings', path: '/app/settings/business', icon: <Building className="icon" /> },
    { label: 'Account Settings', path: '/app/settings/account', icon: <User className="icon" /> },
  ];

  return (
    <aside className="app-sidebar" aria-label="Application Sidebar">
      <div className="app-sidebar-header">
        <Link to="/">
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
      </div>

      <div className="app-sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Studio Admin'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.businessName || 'BizPilotly Workspace'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ color: '#94a3b8' }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
