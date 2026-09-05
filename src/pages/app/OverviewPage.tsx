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
  Layers,
  FileSpreadsheet,
  PenTool,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import {
  DashboardStats,
  ActivityItem,
  BusinessDocument,
  Payment,
  LifecycleFunnelStats,
  Client,
} from '../../types';
import { dashboardService } from '../../services/dashboardService';
import { documentService } from '../../services/documentService';
import { paymentService } from '../../services/paymentService';
import { clientService } from '../../services/clientService';
import { expenseService } from '../../services/expenseService';
import { businessService } from '../../services/businessService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

const ONBOARDING_DISMISSED_KEY = 'bizpilotly_onboarding_dismissed';

export const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lifecycle, setLifecycle] = useState<LifecycleFunnelStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<BusinessDocument[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
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
        const [
          statsData,
          lifecycleData,
          docsData,
          paymentsData,
          activitiesData,
          clientsData,
          expensesData,
          businessData,
        ] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getLifecycleStats(),
          documentService.getDocuments(),
          paymentService.getPayments(),
          dashboardService.getRecentActivities(),
          clientService.getClients(),
          expenseService.getExpenses(),
          businessService.getCurrentBusiness(),
        ]);
        setStats(statsData);
        setLifecycle(lifecycleData);
        setRecentInvoices(docsData.slice(0, 5));
        setRecentPayments(paymentsData.slice(0, 5));
        setActivities(activitiesData);
        setClientsList(clientsData);
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

      {/* =========================================================================
          LAYER 2: DEAL FLOW & DOCUMENT LIFECYCLE COCKPIT (4 Executive Segments)
         ========================================================================= */}
      {lifecycle && (
        <div className="lifecycle-cockpit-grid">
          {/* Card 1: Proposals & Estimates */}
          <Link to="/app/documents" className="cockpit-card">
            <div>
              <div className="cockpit-card-header">
                <div className="cockpit-card-title">
                  <FileText size={15} color="#2563EB" />
                  <span>Proposals & Quotes</span>
                </div>
                <span
                  className="cockpit-card-badge"
                  style={{ background: '#EFF6FF', color: '#1E40AF' }}
                >
                  {lifecycle.proposals.total + lifecycle.quotes.total > 0
                    ? `${lifecycle.proposals.winRatePct}% Win Rate`
                    : '0 Pitches Created'}
                </span>
              </div>

              <div className="cockpit-main-value">
                {lifecycle.proposals.accepted + lifecycle.quotes.accepted} Won /{' '}
                <span style={{ color: '#64748B', fontSize: '1rem', fontWeight: 600 }}>
                  {lifecycle.proposals.total + lifecycle.quotes.total} Pitches
                </span>
              </div>

              <div className="cockpit-subtext">
                <span>Won: ${lifecycle.proposals.closedValue.toLocaleString()}</span>
                <span>Open: ${lifecycle.proposals.pendingValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="ratio-track" title={`${lifecycle.proposals.winRatePct}% conversion win rate`}>
              <div
                className="ratio-seg-green"
                style={{
                  width: `${
                    lifecycle.proposals.total + lifecycle.quotes.total > 0
                      ? Math.min(100, lifecycle.proposals.winRatePct)
                      : 0
                  }%`,
                }}
              />
              <div
                className="ratio-seg-blue"
                style={{
                  width: `${
                    lifecycle.proposals.total + lifecycle.quotes.total > 0
                      ? Math.max(0, 100 - lifecycle.proposals.winRatePct)
                      : 0
                  }%`,
                }}
              />
            </div>
          </Link>

          {/* Card 2: Contracts & Agreements */}
          <Link to="/app/documents" className="cockpit-card">
            <div>
              <div className="cockpit-card-header">
                <div className="cockpit-card-title">
                  <PenTool size={15} color="#8B5CF6" />
                  <span>Contracts & Retainers</span>
                </div>
                <span
                  className="cockpit-card-badge"
                  style={{
                    background:
                      lifecycle.contracts.total === 0
                        ? '#F1F5F9'
                        : lifecycle.contracts.pendingSignature > 0
                        ? '#FEF3C7'
                        : '#D1FAE5',
                    color:
                      lifecycle.contracts.total === 0
                        ? '#64748B'
                        : lifecycle.contracts.pendingSignature > 0
                        ? '#92400E'
                        : '#065F46',
                  }}
                >
                  {lifecycle.contracts.total === 0
                    ? '0 Contracts Active'
                    : lifecycle.contracts.pendingSignature > 0
                    ? `${lifecycle.contracts.pendingSignature} Pending Sign`
                    : '100% Executed'}
                </span>
              </div>

              <div className="cockpit-main-value">
                {lifecycle.contracts.signed} Signed /{' '}
                <span style={{ color: '#64748B', fontSize: '1rem', fontWeight: 600 }}>
                  {lifecycle.contracts.total} Contracts
                </span>
              </div>

              <div className="cockpit-subtext">
                <span>
                  {lifecycle.contracts.total > 0
                    ? `${lifecycle.contracts.executionRatePct}% legally executed`
                    : 'No contracts drafted'}
                </span>
                <span>{lifecycle.contracts.sent} in review</span>
              </div>
            </div>

            <div className="ratio-track" title={`${lifecycle.contracts.executionRatePct}% signed`}>
              <div
                className="ratio-seg-purple"
                style={{
                  width: `${
                    lifecycle.contracts.total > 0
                      ? Math.min(100, lifecycle.contracts.executionRatePct)
                      : 0
                  }%`,
                }}
              />
            </div>
          </Link>

          {/* Card 3: Invoices Settlement Ratio */}
          <Link to="/app/documents" className="cockpit-card">
            <div>
              <div className="cockpit-card-header">
                <div className="cockpit-card-title">
                  <Receipt size={15} color="#10B981" />
                  <span>Invoice Settlement Ratio</span>
                </div>
                <span
                  className="cockpit-card-badge"
                  style={{
                    background:
                      lifecycle.invoices.totalCount === 0
                        ? '#F1F5F9'
                        : lifecycle.invoices.overdueCount > 0
                        ? '#FEE2E2'
                        : '#ECFDF5',
                    color:
                      lifecycle.invoices.totalCount === 0
                        ? '#64748B'
                        : lifecycle.invoices.overdueCount > 0
                        ? '#991B1B'
                        : '#065F46',
                  }}
                >
                  {lifecycle.invoices.totalCount === 0
                    ? '0 Invoices Issued'
                    : `${lifecycle.invoices.paidCount} Paid • ${lifecycle.invoices.pendingCount} Sent`}
                </span>
              </div>

              <div className="cockpit-main-value">
                ${lifecycle.invoices.paidAmount.toLocaleString()}{' '}
                <span style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600 }}>
                  / ${(lifecycle.invoices.paidAmount + lifecycle.invoices.pendingAmount + lifecycle.invoices.overdueAmount).toLocaleString()}
                </span>
              </div>

              <div className="cockpit-subtext">
                <span>Paid: ${lifecycle.invoices.paidAmount.toLocaleString()}</span>
                <span style={{ color: lifecycle.invoices.overdueCount > 0 ? '#DC2626' : undefined }}>
                  Overdue: ${lifecycle.invoices.overdueAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Tri-color Segmented Settlement Bar */}
            <div className="ratio-track">
              <div
                className="ratio-seg-green"
                style={{
                  width: `${
                    lifecycle.invoices.totalCount > 0
                      ? (lifecycle.invoices.paidCount / lifecycle.invoices.totalCount) * 100
                      : 0
                  }%`,
                }}
                title="Paid Invoices"
              />
              <div
                className="ratio-seg-gold"
                style={{
                  width: `${
                    lifecycle.invoices.totalCount > 0
                      ? (lifecycle.invoices.pendingCount / lifecycle.invoices.totalCount) * 100
                      : 0
                  }%`,
                }}
                title="Pending / Sent Invoices"
              />
              <div
                className="ratio-seg-coral"
                style={{
                  width: `${
                    lifecycle.invoices.totalCount > 0
                      ? (lifecycle.invoices.overdueCount / lifecycle.invoices.totalCount) * 100
                      : 0
                  }%`,
                }}
                title="Overdue Invoices"
              />
            </div>
          </Link>

          {/* Card 4: Retainer MRR & Unbilled Tasks */}
          <Link to="/app/recurring" className="cockpit-card">
            <div>
              <div className="cockpit-card-header">
                <div className="cockpit-card-title">
                  <RefreshCw size={15} color="#D97706" />
                  <span>Retainers & Unbilled Work</span>
                </div>
                <span
                  className="cockpit-card-badge"
                  style={{
                    background: lifecycle.retainers.activeCount > 0 ? '#FEF3C7' : '#F1F5F9',
                    color: lifecycle.retainers.activeCount > 0 ? '#B45309' : '#64748B',
                  }}
                >
                  {lifecycle.retainers.activeCount} Retainers Active
                </span>
              </div>

              <div className="cockpit-main-value">
                ${lifecycle.retainers.mrr.toLocaleString()}{' '}
                <span style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600 }}>MRR</span>
              </div>

              <div className="cockpit-subtext">
                <span>{lifecycle.tasks.completedUnbilledCount} unbilled tasks</span>
                <span>${lifecycle.tasks.unbilledAmount.toLocaleString()} ready to bill</span>
              </div>
            </div>

            <div className="ratio-track" title="Retainer & tasks capacity">
              <div
                className="ratio-seg-gold"
                style={{
                  width: `${lifecycle.retainers.activeCount > 0 ? 65 : 0}%`,
                }}
              />
              <div
                className="ratio-seg-blue"
                style={{
                  width: `${lifecycle.tasks.completedUnbilledCount > 0 ? 35 : 0}%`,
                }}
              />
            </div>
          </Link>
        </div>
      )}

      {/* =========================================================================
          LAYER 3: SMART ACTION RADAR (Needs Attention Triage Strip)
         ========================================================================= */}
      {lifecycle && lifecycle.attentionItems.length > 0 && (
        <div className="action-radar-container">
          <div className="action-radar-header">
            <div className="action-radar-title">
              <AlertCircle size={18} color="#D97706" />
              <span>Smart Action Radar ({lifecycle.attentionItems.length} items requiring attention)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Real-time business triage</span>
          </div>

          <div className="action-radar-items-grid">
            {lifecycle.attentionItems.map((item) => (
              <div key={item.id} className="action-radar-pill">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '999px',
                      marginTop: '6px',
                      flexShrink: 0,
                      background:
                        item.badgeColor === 'red'
                          ? '#EF4444'
                          : item.badgeColor === 'yellow'
                          ? '#F59E0B'
                          : item.badgeColor === 'purple'
                          ? '#8B5CF6'
                          : item.badgeColor === 'green'
                          ? '#10B981'
                          : '#2563EB',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0B1F3A' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <Link
                  to={item.actionLink}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    whiteSpace: 'nowrap',
                    marginLeft: '0.75rem',
                    background: '#ffffff',
                  }}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          LAYER 4: MAIN TWO COLUMN GRID (Recent Invoices, Payments, Debtors & Feed)
         ========================================================================= */}
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

        {/* Right Column: Client Receivables, Quick Tools & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Client Receivables / Debtors Card */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                <Users size={16} color="#0B1F3A" />
                <span>Client Receivables Summary</span>
              </h3>
              <Link to="/app/clients" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-navy-600)', fontSize: '0.75rem' }}>
                <span>Directory</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {clientsList.length === 0 ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No clients added yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {clientsList.slice(0, 4).map((c) => {
                  const hasBalance = (c.outstandingBalance || 0) > 0;
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        background: hasBalance ? '#FEF2F2' : '#F8FAFC',
                        border: hasBalance ? '1px solid #FECACA' : '1px solid #E2E8F0',
                        borderRadius: '10px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0B1F3A' }}>
                          {c.name}
                        </div>
                        {c.company && (
                          <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{c.company}</div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            color: hasBalance ? '#DC2626' : '#10B981',
                          }}
                        >
                          {hasBalance
                            ? `${formatCurrency(c.outstandingBalance || 0)} due`
                            : 'Settled ✓'}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                          Invoiced: {formatCurrency(c.totalInvoiced || 0)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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

