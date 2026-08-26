import React, { useEffect, useState } from 'react';
import { adminService, PlatformOverviewStats } from '../../services/adminService';
import {
  Users,
  Building2,
  FileText,
  CreditCard,
  DollarSign,
  TrendingUp,
  Mail,
  FileCheck,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

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
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '1.5rem' }}>Platform Overview</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Registered Users', value: stats?.totalUsers || 1, icon: Users, color: '#0B1F3A' },
    { title: 'Active Businesses', value: stats?.totalBusinesses || 1, icon: Building2, color: '#3B82F6' },
    { title: 'Total Documents Created', value: stats?.totalDocuments || 0, icon: FileText, color: '#8B5CF6' },
    { title: 'Invoices Issued', value: stats?.totalInvoices || 0, icon: FileCheck, color: '#10B981' },
    { title: 'Quotations Created', value: stats?.totalQuotes || 0, icon: TrendingUp, color: '#F59E0B' },
    { title: 'Platform Revenue Logged', value: formatCurrency(stats?.totalRevenue || 0, 'USD', '$'), icon: DollarSign, color: '#10B981' },
    { title: 'Server PDFs Stored', value: stats?.totalPdfsGenerated || 0, icon: CreditCard, color: '#EC4899' },
    { title: 'Emails Dispatched', value: stats?.totalEmailsSent || 0, icon: Mail, color: '#6366F1' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Platform Master Overview
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Global operational telemetry, user growth, document throughput, and transaction metrics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>{kpi.title}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                <kpi.icon size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* System Health Status Banner */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0B1F3A', marginBottom: '1rem' }}>
          Infrastructure & Service Boundaries Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PostgreSQL & RLS</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10B981', marginTop: '0.25rem' }}>● Multi-Tenant Active</div>
          </div>
          <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Supabase Storage</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10B981', marginTop: '0.25rem' }}>● Private Bucket Ready</div>
          </div>
          <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PDF Edge Function</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10B981', marginTop: '0.25rem' }}>● Server Rendering Live</div>
          </div>
          <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Resend Email Hook</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F59E0B', marginTop: '0.25rem' }}>● Ready for API Key</div>
          </div>
        </div>
      </div>
    </div>
  );
};
