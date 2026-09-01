import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  FileText,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Building,
  Users,
  X,
  Sparkles,
} from 'lucide-react';
import { DashboardStats, ActivityItem, BusinessDocument, Payment } from '../../types';
import { dashboardService } from '../../services/dashboardService';
import { documentService } from '../../services/documentService';
import { paymentService } from '../../services/paymentService';
import { clientService } from '../../services/clientService';
import { expenseService } from '../../services/expenseService';
import { businessService } from '../../services/businessService';
import { waitlistService } from '../../services/waitlistService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

const ONBOARDING_DISMISSED_KEY = 'bizpilotly_onboarding_dismissed';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<BusinessDocument[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState<boolean>(() => {
    return localStorage.getItem('bizpilotly_joined_waitlist_user') === 'true';
  });

  const handleJoinWaitlist = async () => {
    if (!user?.email) {
      showToast('Please verify your email to join the waitlist.', 'error');
      return;
    }
    const res = await waitlistService.joinWaitlist({
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      userId: user.id,
      plan: 'Pro Tier',
      source: 'app_dashboard_banner',
    });
    setHasJoinedWaitlist(true);
    localStorage.setItem('bizpilotly_joined_waitlist_user', 'true');
    showToast(res.message, 'success');
  };

  // Onboarding Checklist States
  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(() => {
    return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true';
  });
  const [hasConfiguredBusiness, setHasConfiguredBusiness] = useState(false);
  const [hasClients, setHasClients] = useState(false);
  const [hasExpenses, setHasExpenses] = useState(false);

  useEffect(() => {
    const loadOverviewData = async () => {
      setLoading(true);
      try {
        const [statsData, docsData, paymentsData, activitiesData, clientsData, expensesData, businessData] = await Promise.all([
          dashboardService.getDashboardStats(),
          documentService.getDocuments(),
          paymentService.getPayments(),
          dashboardService.getRecentActivities(),
          clientService.getClients(),
          expenseService.getExpenses(),
          businessService.getCurrentBusiness(),
        ]);
        setStats(statsData);
        setRecentInvoices(docsData.slice(0, 4));
        setRecentPayments(paymentsData.slice(0, 4));
        setActivities(activitiesData);
        setHasClients(clientsData.length > 0);
        setHasExpenses(expensesData.length > 0);
        const isBusinessFullyConfigured = Boolean(
          businessData &&
          businessData.name &&
          businessData.name.trim() !== '' &&
          businessData.name.trim() !== 'My Business Studio' &&
          !businessData.name.endsWith("'s Business") &&
          businessData.email &&
          (businessData.phone || businessData.address) &&
          businessData.bank_name &&
          businessData.bank_account_number &&
          businessData.bank_account_name
        );
        setHasConfiguredBusiness(isBusinessFullyConfigured);
      } catch (err) {
        console.error('Error loading dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  const handleDismissOnboarding = () => {
    setOnboardingDismissed(true);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  };

  if (loading || !stats) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading business dashboard...
      </div>
    );
  }

  // Calculate onboarding progress (out of 4 steps)
  const step1Done = hasConfiguredBusiness;
  const step2Done = hasClients;
  const step3Done = recentInvoices.length > 0;
  const step4Done = hasExpenses;
  const completedStepsCount = (step1Done ? 1 : 0) + (step2Done ? 1 : 0) + (step3Done ? 1 : 0) + (step4Done ? 1 : 0);
  const showOnboarding = !onboardingDismissed && completedStepsCount < 4;

  return (
    <div>
      <SEO
        title={`Dashboard Overview | ${BRAND_NAME}`}
        description="Comprehensive business operations overview showing real-time revenue, invoices, expenses, and net profit."
      />

      <PageHeader
        title="Business Overview"
        description="Summary of your ongoing billing, outstanding client invoices, and net financial performance."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/app/documents/invoice" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Create Invoice</span>
            </Link>
            <Link to="/app/clients" className="btn btn-secondary btn-sm">
              <span>View Clients</span>
            </Link>
          </div>
        }
      />

      {/* First-Login Onboarding Tutorial Card */}
      {showOnboarding && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #0B1F3A 0%, #1e293b 100%)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            marginBottom: '2rem',
            padding: '1.75rem',
            position: 'relative',
          }}
        >
          <button
            onClick={handleDismissOnboarding}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
            }}
            title="Dismiss tutorial"
            aria-label="Dismiss tutorial"
          >
            <span>Dismiss</span>
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={18} color="#C9A227" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Welcome to BizPilotly
            </h3>
            <span className="badge badge-gold" style={{ fontSize: '0.6875rem' }}>
              {completedStepsCount} of 4 Completed
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Set up your business to get started. Complete these essential steps to power your workspace:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Step 1 */}
            <Link
              to="/app/settings/business"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${step1Done ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
            >
              {step1Done ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : (
                <Building size={20} color="#94a3b8" />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                  1. Business Details
                </div>
                <div style={{ fontSize: '0.6875rem', color: step1Done ? '#10b981' : '#94a3b8' }}>
                  {step1Done ? 'Configured' : 'Add name, logo & terms'}
                </div>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>

            {/* Step 2 */}
            <Link
              to="/app/clients"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${step2Done ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
            >
              {step2Done ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : (
                <Users size={20} color="#94a3b8" />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                  2. Add First Client
                </div>
                <div style={{ fontSize: '0.6875rem', color: step2Done ? '#10b981' : '#94a3b8' }}>
                  {step2Done ? 'Client added' : 'Directory & contacts'}
                </div>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>

            {/* Step 3 */}
            <Link
              to="/app/documents/invoice"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${step3Done ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
            >
              {step3Done ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : (
                <FileText size={20} color="#94a3b8" />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                  3. Create Invoice
                </div>
                <div style={{ fontSize: '0.6875rem', color: step3Done ? '#10b981' : '#94a3b8' }}>
                  {step3Done ? 'Invoice issued' : 'Bill for services'}
                </div>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>

            {/* Step 4 */}
            <Link
              to="/app/expenses"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${step4Done ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#ffffff',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
            >
              {step4Done ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : (
                <Receipt size={20} color="#94a3b8" />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                  4. Record Expense
                </div>
                <div style={{ fontSize: '0.6875rem', color: step4Done ? '#10b981' : '#94a3b8' }}>
                  {step4Done ? 'Expense logged' : 'Track software & costs'}
                </div>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>
          </div>
        </div>
      )}

      {/* 4 Metric Cards with Honest Zero States */}
      <div className="metrics-grid">
        {/* Revenue */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Monthly Gross Revenue</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-card-value">{formatCurrency(stats.revenue)}</div>
          <div className="metric-card-subtext">
            {stats.revenue === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>No payments recorded yet.</span>
            ) : (
              <span style={{ color: '#10b981', fontWeight: 600 }}>Settled billing receipts</span>
            )}
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Outstanding Invoices</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: stats.outstandingInvoices > 0 ? 'var(--brand-gold-600)' : 'inherit' }}>
            {formatCurrency(stats.outstandingInvoices)}
          </div>
          <div className="metric-card-subtext">
            {stats.outstandingCount === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>No outstanding invoices.</span>
            ) : (
              <span>{stats.outstandingCount} invoice{stats.outstandingCount !== 1 ? 's' : ''} awaiting client settlement</span>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Logged Expenses</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-card-value">{formatCurrency(stats.expenses)}</div>
          <div className="metric-card-subtext">
            {stats.expenses === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>No expenses recorded yet.</span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>Operating overhead recorded</span>
            )}
          </div>
        </div>

        {/* Net Profit */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Net Realized Profit</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-gold-100)', color: 'var(--brand-gold-700)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: stats.profit > 0 ? 'var(--brand-navy-700)' : 'inherit' }}>
            {formatCurrency(stats.profit)}
          </div>
          <div className="metric-card-subtext">
            {stats.revenue === 0 && stats.expenses === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>Your profit summary will appear once you record business activity.</span>
            ) : (
              <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                {stats.profitMarginPct}% Margin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pro Plan Early Access Waitlist Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B1F3A 0%, #17325B 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 4px 16px rgba(11, 31, 58, 0.12)',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                color: '#78350F',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              ⭐ Pro Tier Early Access
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#93C5FD', fontWeight: 600 }}>
              Special Founding Access
            </span>
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#ffffff' }}>
            Get Custom Domains, Multi-Seats & Automated Payment Webhooks
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
            Join the waitlist to receive founding member benefits and early access when BizPilotly Pro is rolled out.
          </p>
        </div>

        <div>
          {hasJoinedWaitlist ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34D399', fontWeight: 700, fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} />
              <span>You're On The Waitlist!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleJoinWaitlist}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #D4AF37 0%, #C59B27 100%)',
                color: '#0B1F3A',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(212, 175, 55, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Sparkles size={16} />
              <span>Join Pro Waitlist</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two Column Grid */}
      <div className="dashboard-grid-2">
        {/* Left Column: Recent Invoices & Recent Payments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Recent Invoices Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Invoices & Documents</h3>
              <Link to="/app/documents" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-navy-600)' }}>
                <span>View All ({recentInvoices.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  No documents yet.
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Create your first professional invoice in seconds.
                </p>
                <Link to="/app/documents/invoice" className="btn btn-primary btn-sm">
                  <Plus size={14} />
                  <span>Create Invoice</span>
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doc #</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          <Link to={`/app/documents/${doc.type}`} style={{ color: 'var(--brand-navy-600)' }}>
                            {doc.documentNumber}
                          </Link>
                        </td>
                        <td>{doc.client.company || doc.client.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(doc.date)}</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(doc.total, doc.currency, doc.currencySymbol)}</td>
                        <td>
                          <Badge status={doc.status}>{doc.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Payments Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Settled Payments</h3>
              <Link to="/app/payments" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-navy-600)' }}>
                <span>View Payments</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentPayments.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <DollarSign size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  No payments recorded yet.
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Record payments manually in your ledger as clients settle invoices.
                </p>
                <Link to="/app/payments" className="btn btn-secondary btn-sm">
                  <span>Open Payments Ledger</span>
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Client</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((pay) => (
                      <tr key={pay.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{pay.paymentNumber}</td>
                        <td>{pay.clientName.split('(')[0]}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{pay.method}</td>
                        <td style={{ fontWeight: 700, color: '#047857' }}>
                          +{formatCurrency(pay.amount, pay.currency, pay.currencySymbol)}
                        </td>
                        <td>
                          <Badge status={pay.status}>{pay.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Quick Actions Panel */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--brand-black) 0%, #1e293b 100%)', color: '#ffffff', border: '1px solid var(--brand-black-border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Quick Launch Tools
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Jump straight into client billing, pricing calculators, or logging costs.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/app/documents/invoice" className="btn btn-gold btn-sm" style={{ justifyContent: 'flex-start' }}>
                <Plus size={14} />
                <span>Issue New Invoice</span>
              </Link>
              <Link to="/app/calculators/profit-margin" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                <TrendingUp size={14} />
                <span>Calculate Profit Margin</span>
              </Link>
              <Link to="/app/expenses" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                <Receipt size={14} />
                <span>Log Business Expense</span>
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Recent Operational Activity</h3>
            {activities.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No operational activity recorded yet.
                <div style={{ marginTop: '0.5rem' }}>
                  Create an invoice or record an expense to begin tracking activity.
                </div>
              </div>
            ) : (
              <div className="activity-feed">
                {activities.map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-icon-badge">
                      {act.type === 'invoice_paid' ? <CheckCircle2 size={16} color="#047857" /> : <FileText size={16} color="#1d4ed8" />}
                    </div>
                    <div className="activity-info">
                      <div className="activity-title">{act.title}</div>
                      <div className="activity-desc">{act.description}</div>
                    </div>
                    <div className="activity-time">{act.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

