import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { KineticText } from './KineticText';

export const ProductBentoGrid: React.FC = () => {
  return (
    <section className="bento-section" style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', padding: '5rem 0' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '880px', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--brand-gold-100)',
              color: 'var(--brand-gold-700)',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              border: '1px solid var(--brand-gold-200)',
            }}
          >
            <Sparkles size={13} color="#C9A227" />
            <span>Platform Architecture</span>
          </div>
          <KineticText
            as="h2"
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--brand-black)',
              letterSpacing: '-0.03em',
              margin: '0 0 0.875rem',
              lineHeight: 1.15,
            }}
          >
            Everything Your Business Needs. Connected in One Command Center.
          </KineticText>
          <KineticText
            as="p"
            intensity="subtle"
            style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '720px' }}
          >
            No more jumping between disconnected spreadsheets, manual invoicing, and notes. BizPilotly unifies your complete workflow from initial estimate to net realized profit.
          </KineticText>
        </div>

        {/* Bento Grid Layout (Strictly Balanced Architecture) */}
        <div className="bento-grid">
          {/* 1. LARGE PRIMARY HERO CELL (Spans 2 columns on desktop) */}
          <div className="bento-card bento-card-hero">
            <div>
              <div className="bento-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="bento-icon-badge" style={{ background: 'rgba(201, 162, 39, 0.15)', color: '#C9A227' }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span className="bento-category">Unified Engine</span>
                    <h3 className="bento-title" style={{ fontSize: '1.25rem' }}>Operating Command Center</h3>
                  </div>
                </div>
                <span className="badge badge-gold" style={{ fontSize: '0.6875rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                  Live Production UI
                </span>
              </div>

              <p style={{ fontSize: '0.9375rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Real-time financial reconciliation synchronizing gross billings, client retainers, active receivables, and true take-home margins.
              </p>

              <div className="bento-hero-metrics-grid">
                <div className="bento-hero-metric-box">
                  <div className="bento-metric-label">Gross Invoicing</div>
                  <div className="bento-hero-metric-val">$24,500.00</div>
                  <div className="bento-metric-subtext" style={{ color: '#10B981' }}>+18.4% this month</div>
                </div>
                <div className="bento-hero-metric-box">
                  <div className="bento-metric-label">Active Receivables</div>
                  <div className="bento-hero-metric-val" style={{ color: '#FBBF24' }}>$3,200.00</div>
                  <div className="bento-metric-subtext" style={{ color: '#94a3b8' }}>2 Invoices Pending</div>
                </div>
                <div className="bento-hero-metric-box">
                  <div className="bento-metric-label">Realized Margin</div>
                  <div className="bento-hero-metric-val" style={{ color: '#38BDF8' }}>81.9% Net</div>
                  <div className="bento-metric-subtext" style={{ color: '#C9A227' }}>Expenses Logged</div>
                </div>
              </div>
            </div>

            <div className="bento-hero-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.8125rem' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>All client accounts & tax ledgers reconciled</span>
              </div>
              <Link to="/signup" className="btn btn-gold btn-sm" style={{ fontSize: '0.8125rem', padding: '6px 14px' }}>
                <span>Get Started Free</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* 2. CELL: CLIENT DIRECTORY (1 Column) */}
          <div className="bento-card">
            <div>
              <div className="bento-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div className="bento-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#0284C7' }}>
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="bento-category">Relationships</span>
                    <h3 className="bento-title">Clients & Ledgers</h3>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Maintain verified contact profiles, multi-currency billing terms, active retainers, and complete document histories.
              </p>
            </div>

            {/* Client Card Preview */}
            <div className="bento-mini-preview">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#0B1F3A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 800 }}>
                    AD
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0B1F3A', lineHeight: 1.2 }}>Apex Digital Studio</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Design Retainer</div>
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Active</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color, #E2E8F0)' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Lifetime Value</div>
                  <strong style={{ fontSize: '0.8125rem', color: '#0B1F3A' }}>$19,800.00</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Terms</div>
                  <span style={{ fontSize: '0.8125rem', color: '#0B1F3A', fontWeight: 600 }}>Net 15 • USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CELL: DOCUMENT LIFECYCLE PIPELINE (1 Column) */}
          <div className="bento-card">
            <div>
              <div className="bento-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div className="bento-icon-badge" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#7C3AED' }}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <span className="bento-category">Agreements</span>
                    <h3 className="bento-title">Documents Pipeline</h3>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Proposals convert seamlessly to accepted contracts, quotes, invoices, and instant customer receipts with 1 click.
              </p>
            </div>

            {/* Document Progression Chain */}
            <div className="bento-mini-preview">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#0B1F3A' }}>
                <span style={{ color: '#1E40AF', fontFamily: 'var(--font-mono, monospace)' }}>PROP-2026-004</span>
                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Accepted</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0.5rem 0', fontSize: '0.6875rem', color: '#10B981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.08)', padding: '4px 8px', borderRadius: '6px' }}>
                <Zap size={12} />
                <span>Auto-converts to Invoice #INV-0089</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                <span>Deliverables locked</span>
                <span style={{ color: '#0B1F3A', fontWeight: 600 }}>PDF & WhatsApp</span>
              </div>
            </div>
          </div>

          {/* 4. CELL: PAYMENTS & SETTLEMENT (1 Column) */}
          <div className="bento-card">
            <div>
              <div className="bento-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div className="bento-icon-badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#059669' }}>
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <span className="bento-category">Settlement</span>
                    <h3 className="bento-title">Payments & Deposits</h3>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Record direct bank transfers, USSD, and card settlements. Automatically generates and emails customer receipts.
              </p>
            </div>

            {/* Payment Record Preview */}
            <div className="bento-mini-preview">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0B1F3A' }}>Wire Deposit #PAY-992</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Bank Transfer • Today</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#10B981', fontSize: '0.9375rem' }}>+$2,500.00</div>
                  <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Settled</span>
                </div>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', paddingTop: '0.375rem', borderTop: '1px solid var(--border-color, #E2E8F0)' }}>
                <span>Receipt generated:</span>
                <span style={{ color: '#0B1F3A', fontWeight: 600 }}>REC-2026-089</span>
              </div>
            </div>
          </div>

          {/* 5. CELL: EXPENSES, ACCOUNTING & REALIZED NET PROFIT (1 Column) */}
          <div className="bento-card">
            <div>
              <div className="bento-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div className="bento-icon-badge" style={{ background: 'rgba(201, 162, 39, 0.15)', color: '#B45309' }}>
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <span className="bento-category">Financial Clarity</span>
                    <h3 className="bento-title">Profit & Overheads</h3>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Deductible expenses update your true profit margins in real-time. Export 1-click tax ledgers instantly.
              </p>
            </div>

            {/* Realized Profit Preview */}
            <div className="bento-mini-preview" style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #172B4D 100%)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <div>
                  <div style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Net Margin Target</div>
                  <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#FBBF24', marginTop: '1px' }}>81.9% Net</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Realized Return</div>
                  <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#ffffff', marginTop: '1px' }}>$16,227.52</div>
                </div>
              </div>
              <div style={{ fontSize: '0.625rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', paddingTop: '0.375rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Overhead Deductions:</span>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>$3,572.48 Logged</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
