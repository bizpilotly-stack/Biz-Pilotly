import React from 'react';
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
} from 'lucide-react';
import { INITIAL_DASHBOARD_STATS, INITIAL_ACTIVITIES } from '../../mock/dashboard';
import { INITIAL_DOCUMENTS } from '../../mock/documents';
import { INITIAL_PAYMENTS } from '../../mock/payments';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const OverviewPage: React.FC = () => {
  const stats = INITIAL_DASHBOARD_STATS;
  const recentInvoices = INITIAL_DOCUMENTS.slice(0, 4);
  const recentPayments = INITIAL_PAYMENTS.slice(0, 4);

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
            <Link to="/documents/invoice" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Create Invoice</span>
            </Link>
            <Link to="/app/clients" className="btn btn-secondary btn-sm">
              <span>View Clients</span>
            </Link>
          </div>
        }
      />

      {/* 4 Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Monthly Gross Revenue</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-card-value">{formatCurrency(stats.revenue)}</div>
          <div className="metric-card-subtext">
            <span style={{ color: '#10b981', fontWeight: 600 }}>↑ +{stats.revenueChangePct}%</span>
            <span>vs previous month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Outstanding Invoices</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: 'var(--brand-gold-600)' }}>
            {formatCurrency(stats.outstandingInvoices)}
          </div>
          <div className="metric-card-subtext">
            <span>{stats.outstandingCount} invoices awaiting client settlement</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Logged Expenses (Aug)</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-card-value">{formatCurrency(stats.expenses)}</div>
          <div className="metric-card-subtext">
            <span style={{ color: '#10b981', fontWeight: 600 }}>{stats.expenseChangePct}%</span>
            <span>operating overhead control</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Net Realized Profit</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-gold-100)', color: 'var(--brand-gold-700)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: 'var(--brand-navy-700)' }}>
            {formatCurrency(stats.profit)}
          </div>
          <div className="metric-card-subtext">
            <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
              {stats.profitMarginPct}% Margin
            </span>
            <span>healthy return</span>
          </div>
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
                <span>View All ({INITIAL_DOCUMENTS.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

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
                        <Link to={`/documents/${doc.type}`} style={{ color: 'var(--brand-navy-600)' }}>
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
          </div>
        </div>

        {/* Right Column: Activity Feed & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Quick Actions Panel */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--brand-black) 0%, #1e293b 100%)', color: '#ffffff', border: '1px solid var(--brand-black-border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Quick Launch Tools
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Jump straight into client billing or profit calculations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/documents/invoice" className="btn btn-gold btn-sm" style={{ justifyContent: 'flex-start' }}>
                <Plus size={14} />
                <span>Issue New Invoice</span>
              </Link>
              <Link to="/calculators/profit-margin" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
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
            <div className="activity-feed">
              {INITIAL_ACTIVITIES.map((act) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};
