import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  DollarSign,
  Receipt,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MoreVertical,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';
import { ProfitMetrics, MonthlyFinancialSummary } from '../../types';
import { profitService } from '../../services/profitService';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const AccountingPage: React.FC = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<ProfitMetrics | null>(null);
  const [financials, setFinancials] = useState<MonthlyFinancialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [metricsData, financialsData] = await Promise.all([
          profitService.getProfitMetrics(),
          profitService.getMonthlyFinancials(),
        ]);
        setMetrics(metricsData);
        setFinancials(financialsData);
      } catch (err) {
        console.error('Error loading accounting records:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 1-Click Export Complete Accounting Ledger CSV
  const handleExportAccountingCSV = () => {
    if (!metrics || financials.length === 0) {
      showToast('No accounting records available to export.', 'info');
      return;
    }

    const headers = ['Financial Month', 'Gross Revenue Inflow ($)', 'Operating Expenses Outflow ($)', 'Gross Profit ($)', 'Net Realized Profit ($)', 'Operating Margin (%)'];
    const rows = financials.map((f) => [
      f.month,
      f.revenue,
      f.expenses,
      f.grossProfit,
      f.netProfit,
      `${f.profitMargin.toFixed(1)}%`,
    ]);

    rows.push([
      'YEAR-TO-DATE (TOTAL)',
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
    link.setAttribute('download', `bizpilotly-accounting-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ Full Accounting & Tax CSV ledger exported successfully!', 'success');
  };

  // 1-Click Export Tax Filing Report CSV
  const handleExportTaxCSV = () => {
    if (!metrics || financials.length === 0) {
      showToast('No tax records available.', 'info');
      return;
    }

    const headers = ['Tax Filing Period', 'Taxable Gross Receipts', 'Allowable Operating Deductions', 'Net Taxable Profit', 'Estimated Tax Reserve (20%)'];
    const rows = financials.map((f) => [
      f.month,
      f.revenue,
      f.expenses,
      f.netProfit,
      Math.max(0, f.netProfit * 0.2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bizpilotly-tax-filing-summary-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ Tax Deductible Accounting CSV exported successfully!', 'success');
  };

  if (loading || !metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading accounting statements...
      </div>
    );
  }

  return (
    <div>
      <SEO
        title={`Accounting & Tax Ledger | ${BRAND_NAME}`}
        description="Comprehensive accounting ledger, P&L statements, tax deductions, and CSV exports."
      />

      <PageHeader
        title="Accounting & Reports"
        description="Consolidated financial statements, P&L breakdowns, deductible tax ledgers, and 1-click CSV exports."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="secondary" size="sm" onClick={handleExportTaxCSV} title="Export Tax Deductions CSV">
              <FileSpreadsheet size={14} />
              <span>Export Tax CSV</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportAccountingCSV} title="Export Full Accounting CSV">
              <Download size={14} />
              <span>Export Accounting CSV</span>
            </Button>
          </div>
        }
      />

      {/* KPI Metric Summary Cards (Responsive 2x2 on Mobile) */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">YTD Gross Revenue</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-card-value">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="metric-card-subtext" style={{ color: '#10b981' }}>
            <span>Inflows from client settlements</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Operating Deductions</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-danger-bg)', color: '#DC2626' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: metrics.totalExpenses > 0 ? '#b91c1c' : 'inherit' }}>
            {formatCurrency(metrics.totalExpenses)}
          </div>
          <div className="metric-card-subtext">
            <span>Deductible overheads</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Net Realized Profit</span>
            <div className="metric-card-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: metrics.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
            {formatCurrency(metrics.netProfit)}
          </div>
          <div className="metric-card-subtext">
            <span>Bottom-line realized return</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Profit Margin</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-gold-100)', color: 'var(--brand-gold-700)' }}>
              <Percent size={18} />
            </div>
          </div>
          <div className="metric-card-value">{metrics.profitMargin}%</div>
          <div className="metric-card-subtext">
            <span>Realized operating efficiency</span>
          </div>
        </div>
      </div>

      {/* Accounting Statement Ledger */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={18} color="#0B1F3A" />
              <span>Monthly Accounting Ledger & Performance</span>
            </h3>
            <p className="card-subtitle">Monthly revenue collections, categorized deductions, and profit margins.</p>
          </div>
        </div>

        {/* 1. DESKTOP ACCOUNTING TABLE */}
        <div className="table-container desktop-table-view">
          <table className="data-table">
            <thead>
              <tr>
                <th>Statement Month</th>
                <th style={{ textAlign: 'right' }}>Gross Revenue</th>
                <th style={{ textAlign: 'right' }}>Operating Expenses</th>
                <th style={{ textAlign: 'right' }}>Gross Profit</th>
                <th style={{ textAlign: 'right' }}>Net Profit</th>
                <th style={{ textAlign: 'right' }}>Margin (%)</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {financials.map((f, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#0B1F3A' }}>{f.month}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    <span style={{ color: '#10b981' }}>+{formatCurrency(f.revenue)}</span>
                  </td>
                  <td style={{ textAlign: 'right', color: '#b91c1c' }}>
                    -{formatCurrency(f.expenses)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(f.grossProfit)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: f.netProfit >= 0 ? '#10b981' : '#dc2626' }}>
                    {formatCurrency(f.netProfit)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    {f.profitMargin.toFixed(1)}%
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                      Reconciled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. MOBILE RESPONSIVE CARDS */}
        <div className="mobile-cards-view" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem' }}>
          {financials.map((f, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1rem', color: '#0B1F3A' }}>{f.month}</strong>
                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>
                  {f.profitMargin.toFixed(1)}% MARGIN
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Revenue</div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>+{formatCurrency(f.revenue)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Expenses</div>
                  <div style={{ fontWeight: 700, color: '#b91c1c' }}>-{formatCurrency(f.expenses)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Net Realized Profit:</span>
                <strong style={{ fontSize: '0.9375rem', color: f.netProfit >= 0 ? '#10b981' : '#dc2626' }}>
                  {formatCurrency(f.netProfit)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
