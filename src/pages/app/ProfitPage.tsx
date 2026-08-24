import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Percent,
} from 'lucide-react';
import { INITIAL_PROFIT_METRICS, MONTHLY_FINANCIALS } from '../../mock/profit';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const ProfitPage: React.FC = () => {
  const metrics = INITIAL_PROFIT_METRICS;
  const maxRevenue = Math.max(...MONTHLY_FINANCIALS.map((m) => m.revenue));

  return (
    <div>
      <SEO
        title={`Profit & Financial Performance | ${BRAND_NAME}`}
        description="Monitor monthly revenue, operating expenses, gross margin, and net bottom-line profit."
      />

      <PageHeader
        title="Profit & Performance"
        description="Comprehensive analysis of your realized revenue, expense overheads, and net profit margins."
      />

      {/* Top 5 KPI Metric Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">YTD Gross Revenue</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-card-value">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="metric-card-subtext" style={{ color: '#10b981' }}>
            <span>8 months tracked</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Total Expenditures</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: '#b91c1c' }}>
            {formatCurrency(metrics.totalExpenses)}
          </div>
          <div className="metric-card-subtext">
            <span>Direct + Overheads</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Gross Margin</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-gold-100)', color: 'var(--brand-gold-700)' }}>
              <Percent size={18} />
            </div>
          </div>
          <div className="metric-card-value">{formatCurrency(metrics.grossProfit)}</div>
          <div className="metric-card-subtext">
            <span>86.2% gross margin</span>
          </div>
        </div>

        <div className="metric-card" style={{ border: '2px solid var(--brand-navy-500)' }}>
          <div className="metric-card-top">
            <span className="metric-card-label">Net Realized Profit</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-navy-600)', color: '#ffffff' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: 'var(--brand-navy-700)' }}>
            {formatCurrency(metrics.netProfit)}
          </div>
          <div className="metric-card-subtext">
            <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
              {metrics.profitMargin}% Net Margin
            </span>
          </div>
        </div>
      </div>

      {/* Visual Revenue vs Expense Chart */}
      <div className="chart-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Monthly Revenue vs. Expenses Trend
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Comparison of total billing receipts versus operational disbursements.
            </p>
          </div>
          <div className="chart-legend" style={{ margin: 0 }}>
            <span>
              <span className="legend-dot" style={{ background: 'var(--brand-navy-600)' }} />
              Revenue
            </span>
            <span>
              <span className="legend-dot" style={{ background: '#f87171' }} />
              Expenses
            </span>
          </div>
        </div>

        {/* Visual Responsive Pure CSS/SVG Bar Chart */}
        <div className="chart-bars-wrap">
          {MONTHLY_FINANCIALS.map((m) => {
            const revHeightPct = Math.max(8, (m.revenue / maxRevenue) * 100);
            const expHeightPct = Math.max(4, (m.expenses / maxRevenue) * 100);

            return (
              <div key={m.month} className="chart-col">
                <div className="chart-bar-pair">
                  <div
                    className="chart-bar chart-bar-rev"
                    style={{ height: `${revHeightPct}%` }}
                    title={`${m.month} Revenue: ${formatCurrency(m.revenue)}`}
                  />
                  <div
                    className="chart-bar chart-bar-exp"
                    style={{ height: `${expHeightPct}%` }}
                    title={`${m.month} Expenses: ${formatCurrency(m.expenses)}`}
                  />
                </div>
                <span className="chart-month-label">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Month-by-Month Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Financial Ledger</h3>
          <span className="badge badge-neutral">2026 Fiscal Year</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Gross Profit</th>
                <th>Net Profit</th>
                <th>Net Margin</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_FINANCIALS.map((m) => (
                <tr key={m.month}>
                  <td style={{ fontWeight: 700 }}>{m.month} 2026</td>
                  <td style={{ fontWeight: 600, color: 'var(--brand-navy-700)' }}>{formatCurrency(m.revenue)}</td>
                  <td style={{ color: '#b91c1c' }}>-{formatCurrency(m.expenses)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(m.grossProfit)}</td>
                  <td style={{ fontWeight: 800, color: '#047857' }}>+{formatCurrency(m.netProfit)}</td>
                  <td>
                    <span className="badge badge-gold">{formatPercent(m.profitMargin)}</span>
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
