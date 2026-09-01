import React, { useEffect, useState } from 'react';
import { adminService, PlatformOverviewStats } from '../../services/adminService';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Mail,
  FileCheck,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<PlatformOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await adminService.getPlatformOverview();
        setStats(data);
      } catch (err) {
        console.error('Error loading platform overview:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '1.5rem' }}>Loading Master Telemetry...</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    );
  }

  // 1. User & Business Cohort Cards
  const userCohorts = [
    {
      title: 'Total User Signups',
      value: stats?.totalSignups || 0,
      subtext: 'Registered user accounts across Google & Email auth',
      icon: Users,
      color: '#0B1F3A',
      badge: 'All Accounts',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      subtext: 'Users with active workspaces or recent session telemetry',
      icon: Zap,
      color: '#10B981',
      badge: 'Engaged',
    },
    {
      title: 'Registered Businesses',
      value: stats?.registeredBusinesses || 0,
      subtext: 'Users who completed workspace name, bank & currency setup',
      icon: Building2,
      color: '#0284C7',
      badge: 'Configured Profile',
    },
    {
      title: 'Actively Using for Business',
      value: stats?.activelyUsingBusiness || 0,
      subtext: 'Businesses generating invoices, quotes & logging expenses',
      icon: Activity,
      color: '#8B5CF6',
      badge: 'Commercial Use',
    },
    {
      title: 'Pro Plan Waitlist Leads',
      value: stats?.proWaitlistCount || 0,
      subtext: 'Users awaiting early access founding perks & upgrades',
      icon: Sparkles,
      color: '#D97706',
      badge: '⭐ High-Intent',
    },
    {
      title: 'Free Tier Accounts',
      value: stats?.freeTierCount || 0,
      subtext: 'Operating on free standard freelancer tier',
      icon: CheckCircle2,
      color: '#64748B',
      badge: 'Free Tier',
    },
    {
      title: 'Pro Tier Subscribers',
      value: stats?.proTierCount || 0,
      subtext: 'Early access / Founding Pro members',
      icon: TrendingUp,
      color: '#D4AF37',
      badge: 'Pro Tier',
    },
  ];

  // 2. Operational & Throughput Metrics
  const operationMetrics = [
    { title: 'Platform Invoices Issued', value: stats?.totalInvoices || 0, icon: FileCheck, color: '#10B981' },
    { title: 'Quotations & Estimates', value: stats?.totalQuotes || 0, icon: FileText, color: '#8B5CF6' },
    { title: 'Total Documents Created', value: stats?.totalDocuments || 0, icon: FileText, color: '#0284C7' },
    { title: 'Total Platform Revenue Tracked', value: formatCurrency(stats?.totalRevenue || 0, 'USD', '$'), icon: DollarSign, color: '#10B981' },
    { title: 'Server PDFs Stored & Rendered', value: stats?.totalPdfsGenerated || 0, icon: FileCheck, color: '#EC4899' },
    { title: 'Transactional Emails Sent', value: stats?.totalEmailsSent || 0, icon: Mail, color: '#6366F1' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', margin: '0 0 0.25rem 0' }}>
            Platform Master Overview
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            Unified live telemetry for signups, business activation, user cohorts, and Pro waitlist adoption.
          </p>
        </div>
        <Link to="/admin/users" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>View All Users ({stats?.totalSignups || 0})</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* SECTION 1: User & Growth Cohort Breakdown */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0B1F3A', margin: 0 }}>
            👥 User & Growth Cohorts
          </h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '999px' }}>
            Live Breakdown
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {userCohorts.map((cohort, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cohort.color, background: `${cohort.color}12`, padding: '2px 8px', borderRadius: '4px' }}>
                    {cohort.badge}
                  </span>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${cohort.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cohort.color }}>
                    <cohort.icon size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                  {cohort.value}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>
                  {cohort.title}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>
                {cohort.subtext}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Operations & Commercial Throughput */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0B1F3A', margin: 0 }}>
            ⚡ Commercial & Document Operations
          </h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '999px' }}>
            Platform Totals
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {operationMetrics.map((op, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>{op.title}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${op.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: op.color }}>
                  <op.icon size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0B1F3A' }}>
                {op.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Live User Roster Snapshot */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0B1F3A', margin: 0 }}>
              Recent User Accounts & Activity
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Real-time snapshot of signed-up accounts and their operational status.
            </p>
          </div>
          <Link to="/admin/users" className="btn btn-ghost btn-sm" style={{ color: '#0284C7', fontWeight: 600 }}>
            <span>Full User Management</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>User / Email</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Business Profile</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Plan & Interest</th>
              <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {(!stats?.users || stats.users.length === 0) ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  No users registered yet.
                </td>
              </tr>
            ) : (
              stats.users.slice(0, 6).map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', fontWeight: 700, fontSize: '0.75rem' }}>
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0F172A' }}>
                          {u.email}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748B', fontFamily: 'monospace' }}>
                          UID: {u.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className={`badge ${u.role === 'admin' || u.role === 'super_admin' ? 'badge-gold' : 'badge-neutral'}`} style={{ fontSize: '0.6875rem' }}>
                      {u.role === 'admin' || u.role === 'super_admin' ? <ShieldCheck size={11} style={{ marginRight: '3px' }} /> : <User size={11} style={{ marginRight: '3px' }} />}
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {u.hasBusiness ? (
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0284C7' }}>
                        🏢 {u.businessName || 'Active Workspace'}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        Pending Onboarding
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: '#F1F5F9', color: '#334155' }}>
                        Free Tier
                      </span>
                      {u.isOnWaitlist && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Sparkles size={10} /> Pro Waitlist
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', color: '#64748B' }}>
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
