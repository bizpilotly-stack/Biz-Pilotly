import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  CreditCard,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const ProductBentoGrid: React.FC = () => {
  return (
    <section className="bento-section" style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', padding: '5rem 0' }}>
      <div className="container">
        {/* Section Header with Levo-style Editorial Numbering */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <span className="editorial-number">01</span>
              <span className="editorial-divider" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C9A227' }}>
                Platform Architecture
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', margin: '0 0 0.5rem', lineHeight: 1.15 }}>
              Everything Your Business Needs.<br />
              Connected in One Command Center.
            </h2>
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.6, margin: 0 }}>
            No more jumping between spreadsheets, invoice apps, and manual notes. BizPilotly unifies your client pipeline from initial estimate to net realized profit.
          </p>
        </div>

        {/* Bento Grid Layout (LP Grid / 21st.dev Asymmetric Hierarchy) */}
        <div className="bento-grid">
          {/* 1. LARGE PRIMARY ANCHOR CELL (Spans 2 columns & 2 rows on desktop) */}
          <div className="bento-card bento-card-hero">
            <div className="bento-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="bento-icon-badge" style={{ background: 'rgba(201, 162, 39, 0.15)', color: '#C9A227' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <span className="bento-category">Unified Engine</span>
                  <h3 className="bento-title" style={{ fontSize: '1.25rem' }}>Operating Command Center</h3>
                </div>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.6875rem' }}>Live Production UI</span>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Real-time financial reconciliation combining gross revenue, pending deliverables, overhead expenses, and true profit margins.
            </p>

            {/* Real Dashboard Window Inside Bento Cell */}
            <div className="bento-ui-window">
              <div className="bento-ui-topbar">
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>app.bizpilotly.com/overview</span>
              </div>

              <div style={{ padding: '1.25rem', background: '#0B1F3A' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="bento-metric-pill">
                    <div className="bento-metric-label">August Revenue</div>
                    <div className="bento-metric-val">$19,800.00</div>
                    <div style={{ fontSize: '0.625rem', color: '#10B981', marginTop: '2px' }}>↑ +14.8% MoM</div>
                  </div>
                  <div className="bento-metric-pill">
                    <div className="bento-metric-label">Receivables</div>
                    <div className="bento-metric-val" style={{ color: '#FBBF24' }}>$2,500.00</div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '2px' }}>1 active invoice</div>
                  </div>
                  <div className="bento-metric-pill">
                    <div className="bento-metric-label">Realized Profit</div>
                    <div className="bento-metric-val" style={{ color: '#38BDF8' }}>$16,227.52</div>
                    <div style={{ fontSize: '0.625rem', color: '#C9A227', marginTop: '2px' }}>81.9% net margin</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#cbd5e1', fontSize: '0.75rem' }}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <span>6 active client retainers fully balanced.</span>
                  </div>
                  <Link to="/signup" className="btn btn-gold btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    <span>Launch Free</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CELL: CLIENT DIRECTORY */}
          <div className="bento-card">
            <div className="bento-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="bento-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
                  <Users size={16} />
                </div>
                <div>
                  <span className="bento-category">Relationships</span>
                  <h3 className="bento-title">Clients & Ledgers</h3>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Maintain verified contact profiles, billing currencies, active retainers, and complete document histories.
            </p>

            {/* Real Client Card Preview */}
            <div className="bento-mini-preview">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1F3A' }}>Apex Digital Studio</div>
                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Active</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                <span>Lifetime Value:</span>
                <strong style={{ color: '#0B1F3A' }}>$19,800.00</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                <span>Terms:</span>
                <span>Net 15 • USD</span>
              </div>
            </div>
          </div>

          {/* 3. CELL: DOCUMENT LIFECYCLE PIPELINE */}
          <div className="bento-card">
            <div className="bento-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="bento-icon-badge" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}>
                  <FileText size={16} />
                </div>
                <div>
                  <span className="bento-category">Agreements</span>
                  <h3 className="bento-title">Documents Pipeline</h3>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Proposals convert seamlessly to accepted contracts, quotes, invoices, and instant receipts with 1 click.
            </p>

            {/* Document Progression Chain */}
            <div className="bento-mini-preview" style={{ padding: '0.625rem 0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#0B1F3A' }}>
                <span style={{ color: '#1E40AF' }}>PROP-2026-004</span>
                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Accepted</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '6px 0', fontSize: '0.6875rem', color: '#10B981', fontWeight: 600 }}>
                <Zap size={12} />
                <span>Auto-converts to Invoice #INV-0089</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                Scope & deliverables locked with digital timestamp.
              </div>
            </div>
          </div>

          {/* 4. CELL: PAYMENTS & SETTLEMENT */}
          <div className="bento-card">
            <div className="bento-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="bento-icon-badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#10B981' }}>
                  <CreditCard size={16} />
                </div>
                <div>
                  <span className="bento-category">Settlement</span>
                  <h3 className="bento-title">Payments & Deposits</h3>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Record direct bank transfers, USSD, and card settlements. Automatically generates and emails customer receipts.
            </p>

            {/* Real Payment Record Preview */}
            <div className="bento-mini-preview">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0B1F3A' }}>Wire Deposit #PAY-992</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Bank Transfer • Today</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#10B981', fontSize: '0.9375rem' }}>+$2,500.00</div>
                  <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Settled</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. CELL: EXPENSES & TAX LEDGER */}
          <div className="bento-card">
            <div className="bento-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="bento-icon-badge" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#EF4444' }}>
                  <FileSpreadsheet size={16} />
                </div>
                <div>
                  <span className="bento-category">Overheads</span>
                  <h3 className="bento-title">Expenses & Accounting</h3>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Track contractor payouts, software licenses, and server costs. Deductible overheads update your net margin instantly.
            </p>

            {/* Real Expense Snapshot */}
            <div className="bento-mini-preview">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748B' }}>Direct Project Costs:</span>
                <strong style={{ color: '#EF4444' }}>-$318.00</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
                <span style={{ color: '#64748B' }}>1-Click CSV Ledger:</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>Tax Ready</span>
              </div>
            </div>
          </div>

          {/* 6. CELL: REALIZED PROFIT & MARGIN GAUGE */}
          <div className="bento-card">
            <div className="bento-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="bento-icon-badge" style={{ background: 'rgba(201, 162, 39, 0.2)', color: '#C9A227' }}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <span className="bento-category">Intelligence</span>
                  <h3 className="bento-title">Realized Net Profit</h3>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Know exactly how much cash you keep after every delivery without complex financial modeling or spreadsheet errors.
            </p>

            {/* Realized Profit Badge */}
            <div className="bento-mini-preview" style={{ background: '#0B1F3A', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>Net Profit Margin</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#C9A227', marginTop: '2px' }}>81.9% Target</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Realized Return</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>$16,227.52</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
