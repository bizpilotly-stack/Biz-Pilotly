import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Menu,
  X,
  FileSpreadsheet,
  CheckSquare,
  TrendingUp,
  Calculator,
  Building,
  User,
  LogOut,
  Sparkles,
  Receipt,
  FileCheck,
  ScrollText,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const MobileNav: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setMoreOpen(false);
    await signOut();
    navigate('/login');
  };

  const handleNavClick = () => {
    setMoreOpen(false);
  };

  const operationsLinks = [
    { label: 'Overview', path: '/app', icon: <LayoutDashboard size={17} color="#2563EB" />, end: true },
    { label: 'All Documents', path: '/app/documents', icon: <FileText size={17} color="#A78BFA" /> },
    { label: 'Clients Directory', path: '/app/clients', icon: <Users size={17} color="#38BDF8" /> },
    { label: 'Incoming Payments', path: '/app/payments', icon: <CreditCard size={17} color="#10B981" /> },
    { label: 'Expense Ledger', path: '/app/expenses', icon: <Receipt size={17} color="#EF4444" /> },
    { label: 'Accounting & Reports', path: '/app/accounting', icon: <FileSpreadsheet size={17} color="#2563EB" /> },
    { label: 'Tasks & Deliverables', path: '/app/tasks', icon: <CheckSquare size={17} color="#10B981" /> },
    { label: 'Profit & Margins', path: '/app/profit', icon: <TrendingUp size={17} color="#C9A227" /> },
  ];

  const documentStudioLinks = [
    { label: 'Invoices', path: '/app/documents/invoice', icon: <FileText size={17} color="#2563EB" /> },
    { label: 'Quotes', path: '/app/documents/quote', icon: <FileCheck size={17} color="#10B981" /> },
    { label: 'Estimates', path: '/app/documents/estimate', icon: <FileCheck size={17} color="#F59E0B" /> },
    { label: 'Proposals', path: '/app/documents/proposal', icon: <ScrollText size={17} color="#8B5CF6" /> },
    { label: 'Contracts', path: '/app/documents/contract', icon: <ScrollText size={17} color="#3B82F6" /> },
    { label: 'Receipts', path: '/app/documents/receipt', icon: <Receipt size={17} color="#10B981" /> },
    { label: 'Recurring Retainers', path: '/app/recurring', icon: <RefreshCw size={17} color="#6366F1" /> },
  ];

  const toolsSettingsLinks = [
    { label: '8 Calculators Hub', path: '/app/calculators', icon: <Calculator size={17} color="#8B5CF6" /> },
    { label: 'Team & Seats', path: '/app/team', icon: <Users size={17} color="#38BDF8" /> },
    { label: 'Business Settings', path: '/app/settings/business', icon: <Building size={17} color="#475569" /> },
    { label: 'Account Profile', path: '/app/settings/account', icon: <User size={17} color="#475569" /> },
  ];

  return (
    <>
      {/* 1. Sleek Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar" aria-label="Mobile Bottom Navigation">
        <NavLink
          to="/app"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          end
          onClick={handleNavClick}
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/app/documents"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <FileText size={20} />
          <span>Docs</span>
        </NavLink>

        <NavLink
          to="/app/clients"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <Users size={20} />
          <span>Clients</span>
        </NavLink>

        <NavLink
          to="/app/payments"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <CreditCard size={20} />
          <span>Payments</span>
        </NavLink>

        <button
          type="button"
          className={`mobile-nav-item ${moreOpen ? 'active' : ''}`}
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
          aria-label="Toggle Extended Menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {moreOpen ? <X size={20} /> : <Menu size={20} />}
          <span>{moreOpen ? 'Close' : 'Menu'}</span>
        </button>
      </nav>

      {/* 2. Slide-up Extended Mobile App Drawer */}
      {moreOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMoreOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 31, 58, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            className="mobile-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '1.25rem 1.25rem calc(80px + env(safe-area-inset-bottom, 16px))',
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
              animation: 'slideUpMobileDrawer 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Drag Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 99, background: '#cbd5e1', margin: '0 auto 1rem' }} />

            {/* User Quick Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #0B1F3A 0%, #071527 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#C9A227',
                    color: '#0B1F3A',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9375rem',
                  }}
                >
                  {(user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                    {user?.user_metadata?.full_name || 'Admin Workspace'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{user?.email}</div>
                </div>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
                <Sparkles size={11} style={{ marginRight: 3 }} />
                Active
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Quick Create Document
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <NavLink
                  to="/app/documents/invoice"
                  onClick={handleNavClick}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.625rem 0.35rem',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '10px',
                    color: '#1D4ED8',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    gap: '4px',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>+ Invoice</span>
                </NavLink>

                <NavLink
                  to="/app/documents/quote"
                  onClick={handleNavClick}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.625rem 0.35rem',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '10px',
                    color: '#047857',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    gap: '4px',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>+ Quote</span>
                </NavLink>

                <NavLink
                  to="/app/documents/proposal"
                  onClick={handleNavClick}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.625rem 0.35rem',
                    background: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    borderRadius: '10px',
                    color: '#7E22CE',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    gap: '4px',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>+ Proposal</span>
                </NavLink>
              </div>
            </div>

            {/* Section 1: Operations */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Operations & Financials
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {operationsLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '10px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Section 2: Document Studio */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Document Studio
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {documentStudioLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '10px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Section 3: Tools & Settings */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Tools & Settings
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {toolsSettingsLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '10px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
