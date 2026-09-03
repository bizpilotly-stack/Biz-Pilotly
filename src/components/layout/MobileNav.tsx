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
          <span>{moreOpen ? 'Close' : 'More'}</span>
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
              padding: '1.5rem 1.25rem calc(80px + env(safe-area-inset-bottom, 16px))',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
              animation: 'slideUpMobileDrawer 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Drag Bar */}
            <div style={{ width: 40, height: 4, borderRadius: 99, background: '#cbd5e1', margin: '0 auto 1.25rem' }} />

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
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#C9A227',
                    color: '#0B1F3A',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  {(user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user?.user_metadata?.full_name || 'Admin'}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{user?.email}</div>
                </div>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
                <Sparkles size={11} style={{ marginRight: 3 }} />
                Active
              </span>
            </div>

            {/* Extended Navigation Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <NavLink
                to="/app/accounting"
                onClick={handleNavClick}
                className="mobile-drawer-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <FileSpreadsheet size={18} color="#2563EB" />
                <span>Accounting</span>
              </NavLink>

              <NavLink
                to="/app/tasks"
                onClick={handleNavClick}
                className="mobile-drawer-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <CheckSquare size={18} color="#10B981" />
                <span>Tasks</span>
              </NavLink>

              <NavLink
                to="/app/profit"
                onClick={handleNavClick}
                className="mobile-drawer-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <TrendingUp size={18} color="#C9A227" />
                <span>Profit Intel</span>
              </NavLink>

              <NavLink
                to="/calculators"
                onClick={handleNavClick}
                className="mobile-drawer-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Calculator size={18} color="#8B5CF6" />
                <span>Calculators</span>
              </NavLink>

              <NavLink
                to="/app/settings/business"
                onClick={handleNavClick}
                className="mobile-drawer-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Building size={18} color="#475569" />
                <span>Business Info</span>
              </NavLink>

              <NavLink
                to="/app/settings/account"
                onClick={handleNavClick}
                className="mobile-drawer-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <User size={18} color="#475569" />
                <span>Profile & Acct</span>
              </NavLink>
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
                fontSize: '0.875rem',
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
