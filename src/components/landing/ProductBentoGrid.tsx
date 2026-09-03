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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '720px', width: '100%' }}>
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
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 800,
                color: 'var(--brand-black)',
                letterSpacing: '-0.03em',
                margin: '0 0 0.75rem',
                lineHeight: 1.15,
              }}
            >
              Everything Your Business Needs. Connected in One Command Center.
            </KineticText>
          </div>
          <div style={{ maxWidth: '440px', width: '100%', margin: '0.5rem 0 0' }}>
            <KineticText
              as="p"
              intensity="subtle"
              style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}
            >
              No more jumping between spreadsheets, invoice apps, and manual notes. BizPilotly unifies your client pipeline from initial estimate to net realized profit.
            </KineticText>
          </div>
        </div>

        {/* Bento Grid Layout (Strictly Balanced 3-Column Hierarchy) */}
        <div className="bento-grid">
          {/* 1. LARGE PRIMARY ANCHOR CELL (Spans 2 columns) */}
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

            <p style={{ fontSize: '0.9375rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Real-time financial reconciliation combining gross revenue, client retainers, deductible expenses, and true net margins.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Billings</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>Real-time Tracking</div>
                <div style={{ fontSize: '0.6875rem', color: '#10B981', marginTop: '2px' }}>Automatic Reconciliation</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receivables</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FBBF24', marginTop: '4px' }}>Active Invoices</div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>Overdue Reminders</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Intelligence</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38BDF8', marginTop: '4px' }}>True Profit Margin</div>
                <div style={{ fontSize: '0.6875rem', color: '#C9A227', marginTop: '2px' }}>Deductible Expenses</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.8125rem' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>All client retainers & accounts balanced.</span>
              </div>
              <Link to="/signup" className="btn btn-gold btn-sm" style={{ fontSize: '0.8125rem', padding: '6px 14px' }}>
                <span>Get Started Free</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* 2. CELL: CLIENT DIRECTORY (1 Column) */}
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

          {/* 3. CELL: DOCUMENT LIFECYCLE PIPELINE (1 Column) */}
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

          {/* 4. CELL: PAYMENTS & SETTLEMENT (1 Column) */}
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

          {/* 5. CELL: EXPENSES, ACCOUNTING & REALIZED NET PROFIT (1 Column) */}
          <div className="bento-card">
            <div className="bento-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="bento-icon-badge" style={{ background: 'rgba(201, 162, 39, 0.2)', color: '#C9A227' }}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <span className="bento-category">Accounting</span>
                  <h3 className="bento-title">Profit & Overheads</h3>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Deductible expenses update your true profit margins in real-time. Export 1-click tax ledgers instantly.
            </p>

            {/* Realized Profit Badge */}
            <div className="bento-mini-preview" style={{ background: '#0B1F3A', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>Net Margin Target</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#C9A227', marginTop: '2px' }}>81.9% Net</div>
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
