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
  Crown,
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

  // 1. Subscription & User Cohort Breakdown
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
      title: '15-Day Free Trial Users',
      value: stats?.trialUsersCount || 0,
      subtext: 'Users actively exploring Professional / Suite trial',
      icon: Sparkles,
      color: '#D97706',
      badge: '🎁 15-Day Trial',
    },
    {
      title: 'Free Starter Users',
      value: stats?.freeTierCount || 0,
      subtext: 'Users operating on permanent Free Starter plan',
      icon: CheckCircle2,
      color: '#64748B',
      badge: '🆓 Free Starter',
    },
    {
      title: 'Paid Pro Subscribers',
      value: stats?.proSubscribersCount || 0,
      subtext: 'Active paid Professional members (₦10k / $10 / €9)',
      icon: Zap,
      color: '#2563EB',
      badge: '⭐ Pro Tier',
    },
    {
      title: 'Paid Business Suite',
      value: stats?.businessSuiteCount || 0,
      subtext: 'Active agency & multi-seat teams (₦25k / $20 / €19)',
      icon: Crown,
      color: '#7C3AED',
      badge: '👑 Business Suite',
    },
    {
      title: 'Configured Businesses',
      value: stats?.registeredBusinesses || 0,
      subtext: 'Users who completed workspace bank & currency setup',
      icon: Building2,
      color: '#0284C7',
      badge: 'Configured Profile',
    },
    {
      title: 'Active Invoicing Studios',
      value: stats?.activelyUsingBusiness || 0,
      subtext: 'Businesses issuing real invoices & tracking payments',
      icon: Activity,
      color: '#10B981',
      badge: 'Active Billing',
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
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
            Real-time subscriber cohorts, business registrations, and operational activity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/admin/users" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={15} />
            <span>View All Registered Users ({stats?.totalUsers || 0})</span>
          </Link>
        </div>
      </div>

      {/* Cohort Metric Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0B1F3A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} color="#0B1F3A" />
          <span>Subscriber & Business Cohorts</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {userCohorts.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${c.color}15`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '999px' }}>
                      {c.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em' }}>
                    {c.value}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', marginTop: '2px' }}>
                    {c.title}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem' }}>
                  {c.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Throughput */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0B1F3A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color="#0B1F3A" />
          <span>Operational Throughput</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {operationMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A' }}>{m.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{m.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master User Roster Preview */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
              Recent Platform Signups & Trial Users
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Real-time feed of user profiles and subscription statuses.
            </p>
          </div>

          <Link to="/admin/users" className="btn btn-ghost btn-sm" style={{ color: '#0284C7', fontWeight: 600 }}>
            <span>View All ({stats?.totalUsers || 0})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>User / Full Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Auth Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Subscription Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Joined Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Invoices</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.users || []).slice(0, 8).map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0B1F3A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0B1F3A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>{u.email}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className={`badge ${u.role === 'admin' || u.role === 'super_admin' ? 'badge-gold' : 'badge-neutral'}`} style={{ fontSize: '0.6875rem' }}>
                      {u.role === 'admin' || u.role === 'super_admin' ? <ShieldCheck size={11} style={{ marginRight: '3px' }} /> : <User size={11} style={{ marginRight: '3px' }} />}
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {u.subscriptionStatus === 'TRIAL_ACTIVE' ? (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '999px' }}>
                        🎁 15-Day Trial ({u.trialDaysLeft}d left)
                      </span>
                    ) : u.plan === 'pro' && u.subscriptionStatus === 'ACTIVE' ? (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '999px' }}>
                        ⭐ Pro Active
                      </span>
                    ) : u.plan === 'business' && u.subscriptionStatus === 'ACTIVE' ? (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#F5F3FF', color: '#6D28D9', padding: '2px 8px', borderRadius: '999px' }}>
                        👑 Business Suite
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '999px' }}>
                        🆓 Free Starter
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#64748B', fontSize: '0.8125rem' }}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0B1F3A' }}>
                    {u.documentCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
