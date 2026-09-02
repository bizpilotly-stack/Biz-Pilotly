import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Percent,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { ProfitMetrics, MonthlyFinancialSummary } from '../../types';
import { profitService } from '../../services/profitService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const ProfitPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ProfitMetrics | null>(null);
  const [financials, setFinancials] = useState<MonthlyFinancialSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfitData = async () => {
      setLoading(true);
      try {
        const [metricsData, financialsData] = await Promise.all([
          profitService.getProfitMetrics(),
          profitService.getMonthlyFinancials(),
        ]);
        setMetrics(metricsData);
        setFinancials(financialsData);
      } catch (err) {
        console.error('Error loading profit metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfitData();
  }, []);

  const { showToast } = useToast();

  const handleExportPnLCSV = () => {
    if (!metrics || financials.length === 0) {
      showToast('No financial records available to export.', 'info');
      return;
    }

    const headers = ['Month', 'Total Revenue', 'Total Operating Expenses', 'Gross Profit', 'Net Profit', 'Profit Margin (%)'];
    const rows = financials.map((f) => [
      f.month,
      f.revenue,
      f.expenses,
      f.grossProfit,
      f.netProfit,
      `${f.profitMargin.toFixed(1)}%`,
    ]);

    // Add summary row
    rows.push([
      'TOTAL / YTD',
      metrics.totalRevenue,
      metrics.totalExpenses,
      metrics.grossProfit,
      metrics.netProfit,
      `${metrics.profitMargin.toFixed(1)}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bizpilotly-pnl-accounting-statement-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ Profit & Loss Accounting Statement exported successfully!', 'success');
  };

  if (loading || !metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading financial analytics...
      </div>
    );
  }

  const maxRevenue = financials.length > 0 ? Math.max(...financials.map((m) => m.revenue)) : 1000;

  return (
    <div>
      <SEO
        title={`Profit & Financial Performance | ${BRAND_NAME}`}
        description="Monitor monthly revenue, operating expenses, gross margin, and net bottom-line profit."
      />

      <PageHeader
        title="Profit & Performance"
        description="Comprehensive analysis of your realized revenue, expense overheads, and net profit margins."
        actions={
          <Button variant="secondary" size="sm" onClick={handleExportPnLCSV} title="Export P&L Statement for tax filing">
            <FileSpreadsheet size={14} />
            <span>Export P&L Statement CSV</span>
          </Button>
        }
      />

      {/* Top 4 KPI Metric Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">YTD Gross Revenue</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-card-value">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="metric-card-subtext" style={{ color: metrics.totalRevenue > 0 ? '#10b981' : 'var(--text-muted)' }}>
            <span>{metrics.totalRevenue > 0 ? `${financials.length} months tracked` : 'No revenue recorded yet'}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Total Expenditures</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: metrics.totalExpenses > 0 ? '#b91c1c' : 'inherit' }}>
            {formatCurrency(metrics.totalExpenses)}
          </div>
          <div className="metric-card-subtext">
            <span>{metrics.totalExpenses > 0 ? 'Direct + Overheads' : 'No expenses recorded yet'}</span>
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
            <span>{metrics.totalRevenue > 0 ? `${metrics.profitMargin}% gross margin` : '0% gross margin'}</span>
          </div>
        </div>

        <div className="metric-card" style={{ border: '2px solid var(--brand-navy-500)' }}>
          <div className="metric-card-top">
            <span className="metric-card-label">Net Realized Profit</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-navy-600)', color: '#ffffff' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: metrics.netProfit > 0 ? 'var(--brand-navy-700)' : 'inherit' }}>
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
          {financials.map((m) => {
            const revHeightPct = m.revenue > 0 ? Math.max(8, (m.revenue / maxRevenue) * 100) : 2;
            const expHeightPct = m.expenses > 0 ? Math.max(4, (m.expenses / maxRevenue) * 100) : 2;

            return (
              <div key={m.month} className="chart-col">
                <div className="chart-bar-pair">
                  <div
                    className="chart-bar chart-bar-rev"
                    style={{ height: `${revHeightPct}%`, opacity: m.revenue > 0 ? 1 : 0.2 }}
                    title={`${m.month} Revenue: ${formatCurrency(m.revenue)}`}
                  />
                  <div
                    className="chart-bar chart-bar-exp"
                    style={{ height: `${expHeightPct}%`, opacity: m.expenses > 0 ? 1 : 0.2 }}
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
              {financials.map((m) => (
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
