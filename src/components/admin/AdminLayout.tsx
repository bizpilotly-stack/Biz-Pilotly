import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CreditCard,
  Mail,
  History,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';

export const AdminLayout: React.FC = () => {
  const navItems = [
    { to: '/admin', label: 'Platform Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users & Accounts', icon: Users },
    { to: '/admin/waitlist', label: 'Pro Plan Waitlist', icon: Sparkles },
    { to: '/admin/businesses', label: 'Businesses', icon: Building2 },
    { to: '/admin/documents', label: 'Documents Monitor', icon: FileText },
    { to: '/admin/payments', label: 'Payments Ledger', icon: CreditCard },
    { to: '/admin/emails', label: 'Email Logs', icon: Mail },
    { to: '/admin/audit-logs', label: 'Security Audit Trail', icon: History },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: '260px',
          background: '#0B1F3A',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Shield size={20} color="#D4AF37" />
            <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              {BRAND_NAME}
            </span>
            <span style={{ background: '#D4AF37', color: '#0B1F3A', fontSize: '0.625rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Admin
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Platform Operations Console</p>
        </div>

        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <item.icon size={16} color="currentColor" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link
            to="/app"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.8125rem',
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: '6px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to User App</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <header
          style={{
            height: '60px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Platform Administration</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              Privileged Mode Active
            </span>
          </div>
        </header>

        <main style={{ padding: '2rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
