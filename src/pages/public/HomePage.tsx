import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Building,
  Zap,
  Sparkles,
  ChevronDown,
  Calculator,
  FileSpreadsheet,
  FileText,
  FileCheck,
  Receipt,
  Crown,
  Check,
} from 'lucide-react';
import { BRAND_NAME, BRAND_TAGLINE, BRAND_SUBTITLE, FAQ_ITEMS } from '../../constants/brand';
import { SEO } from '../../components/common/SEO';
import { PRICING_PLANS, PricingCurrency, getStoredCurrency, setStoredCurrency } from '../../config/pricing';
import { CurrencySelector } from '../../components/common/CurrencySelector';
import { Ecosystem3DHero } from '../../components/landing/Ecosystem3DHero';
import { ProductBentoGrid } from '../../components/landing/ProductBentoGrid';
import { KineticText } from '../../components/landing/KineticText';
import '../../styles/ecosystem-3d.css';

export const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currency, setCurrency] = useState<PricingCurrency>(() => getStoredCurrency());

  const handleCurrencyChange = (newCurrency: PricingCurrency) => {
    setCurrency(newCurrency);
    setStoredCurrency(newCurrency);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const workflowItems = [
    { step: 1, title: 'Price & Target Margin', desc: 'Calculate break-even rates and markup with built-in financial models.', icon: <Calculator size={20} color="#C9A227" /> },
    { step: 2, title: 'Scope & Proposal', desc: 'Draft clean proposals with timeline milestones and deliverables.', icon: <FileText size={20} color="#0B1F3A" /> },
    { step: 3, title: 'Client Sign-off', desc: 'Convert agreed terms into confirmed contracts with uploaded signatures.', icon: <FileCheck size={20} color="#0B1F3A" /> },
    { step: 4, title: 'Invoice Delivery', desc: 'Generate printable invoices and share via WhatsApp, Telegram, or Discord links.', icon: <Receipt size={20} color="#C9A227" /> },
    { step: 5, title: 'Payment Collection', desc: 'Record incoming bank transfers and card deposits with automatic ledger updates.', icon: <CreditCard size={20} color="#0B1F3A" /> },
    { step: 6, title: 'Expense Logging', desc: 'Track project expenses and subcontractor payouts against billables.', icon: <FileSpreadsheet size={20} color="#0B1F3A" /> },
    { step: 7, title: 'Realized Net Profit', desc: 'View your true net profit and margin without messy spreadsheet formulas.', icon: <TrendingUp size={20} color="#10b981" /> },
  ];

  return (
    <div>
      <SEO
        title={`${BRAND_NAME} — Business Tools for Freelancers & Small Businesses`}
        description={BRAND_SUBTITLE}
        canonical="https://bizpilotly.com/"
      />

      {/* 1. IMMERSIVE 3D HERO SECTION WITH KINETIC TYPOGRAPHY */}
      <section
        className="section-py"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(11, 31, 58, 0.08) 0%, rgba(248, 250, 252, 0) 70%)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: '3.5rem',
          paddingBottom: '3.5rem',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Primary Hero Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--brand-gold-100)',
                  color: 'var(--brand-gold-700)',
                  padding: '0.35rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  border: '1px solid var(--brand-gold-200)',
                }}
              >
                <Sparkles size={14} color="#C9A227" />
                <span>Lightweight Operating System for Freelancers</span>
              </div>

              {/* Existing Hero Title with Kinetic Typography */}
              <KineticText
                as="h1"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                  fontWeight: 800,
                  color: 'var(--brand-black)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  margin: '0 0 0.5rem',
                }}
              >
                {BRAND_NAME}
              </KineticText>

              <div
                style={{
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  fontWeight: 700,
                  color: 'var(--brand-navy-800)',
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                {BRAND_TAGLINE}
              </div>

              <p
                style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.125rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  maxWidth: '520px',
                }}
              >
                {BRAND_SUBTITLE}
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <Link to="/signup" className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/calculators" className="btn btn-secondary btn-lg">
                  <span>Explore Free Tools</span>
                </Link>
              </div>

              {/* Trust Value Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>No credit card required</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Instant 1-click tools</span>
                </div>
              </div>
            </div>

            {/* Right 3D Spatial Interactive Hero Scene */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '460px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ecosystem3DHero />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION 01: ASYMMETRIC EDITORIAL BENTO GRID */}
      <ProductBentoGrid />

      {/* 3. SECTION 02: 7-STEP FINANCIAL WORKFLOW */}
      <section className="section-py" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <span className="editorial-number">02</span>
                <span className="editorial-divider" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C9A227' }}>
                  End-to-End Workflow
                </span>
              </div>
              <KineticText
                as="h2"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', margin: 0 }}
              >
                From Initial Quote to Realized Net Profit
              </KineticText>
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.6, margin: 0 }}>
              BizPilotly structures the complete financial lifecycle of client projects into 7 clear, automated milestones.
            </p>
          </div>

          {/* Visual Connected Step Chain */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              alignItems: 'stretch',
              position: 'relative',
            }}
          >
            {workflowItems.map((item, index) => (
              <div
                key={item.step}
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-xs)',
                  position: 'relative',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-full)',
                    background: index === 6 ? 'var(--brand-gold-500)' : 'var(--brand-navy-800)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  {item.step}
                </div>

                <div style={{ marginBottom: '0.75rem' }}>{item.icon}</div>

                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 'auto', paddingTop: '0.5rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION 03: THREE PILLARS (CALCULATE, CREATE, MANAGE) */}
      <section className="section-py" style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <span className="editorial-number">03</span>
            <span className="editorial-divider" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C9A227' }}>
              Functional Pillars
            </span>
          </div>
          <KineticText
            as="h2"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '3.5rem' }}
          >
            Calculate Accurately. Create Fast. Manage With Clarity.
          </KineticText>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {/* Pillar 1: Calculate */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <div className="badge badge-info" style={{ marginBottom: '1rem' }}>Pillar 1: Calculate</div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                  Stop Guessing Your Rates. Price for Real Profit.
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Undercharging is the #1 mistake freelancers make. Use BizPilotly calculators to determine exact markups, break-even hourly rates, and target margins before sending proposals.
                </p>
                <Link to="/calculators" className="btn btn-primary">
                  <span>View All 8 Calculators</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Profit Margin Engine</h4>
                  <span className="badge badge-gold">Interactive Preview</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Internal Project Cost</label>
                  <input className="form-input" defaultValue="$1,200.00" readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Desired Net Margin Target</label>
                  <input className="form-input" defaultValue="45%" readOnly />
                </div>
                <div style={{ background: '#0A0A0A', color: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>RECOMMENDED PRICE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C9A227' }}>$2,181.82</div>
                  </div>
                  <Link to="/calculators/profit-margin" className="btn btn-gold btn-sm">Try Interactive</Link>
                </div>
              </div>
            </div>

            {/* Pillar 2: Create Documents */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div style={{ order: 2 }}>
                <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ borderBottom: '2px solid #0B1F3A', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0B1F3A' }}>INVOICE</div>
                    <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>INV-2026-0001</div>
                  </div>
                  <div style={{ margin: '1rem 0', fontSize: '0.8125rem', color: '#475569' }}>
                    <strong>Apex Digital Studio</strong><br />
                    UX Design & Interactive Retainer (August)
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontWeight: 800, fontSize: '1.125rem' }}>
                    <span>Total Due:</span>
                    <span style={{ color: '#0B1F3A' }}>$2,500.00</span>
                  </div>
                </div>
              </div>

              <div style={{ order: 1 }}>
                <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>Pillar 2: Create</div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                  Instant, Professional Business Documents.
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Generate clean, printable Invoices, Estimates/Quotes, Receipts, and Proposals with side-by-side live sheet updates. No clunky formatting, no messy spreadsheets.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <Link to="/documents/invoice" className="btn btn-secondary btn-sm">Invoices</Link>
                  <Link to="/documents/quote" className="btn btn-secondary btn-sm">Quotes</Link>
                  <Link to="/documents/receipt" className="btn btn-secondary btn-sm">Receipts</Link>
                  <Link to="/documents/proposal" className="btn btn-secondary btn-sm">Proposals</Link>
                </div>
                <Link to="/documents" className="btn btn-primary">
                  <span>Explore Document Hub</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Manage Business */}
            <div>
              <div className="badge badge-info" style={{ marginBottom: '1rem' }}>Pillar 3: Manage</div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                Keep Your Operations Organized
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="card card-hover">
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--brand-navy-50)', color: 'var(--brand-navy-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Building size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>Client Directory</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Keep contact details, active currencies, lifetime billing totals, and payment status history organized.
                  </p>
                  <Link to="/app/clients" className="btn btn-outline btn-sm">Manage Clients →</Link>
                </div>

                <div className="card card-hover">
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--brand-gold-50)', color: 'var(--brand-gold-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CreditCard size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>Payments & Overdue Tracking</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Log incoming bank transfers and card deposits. Instantly know which invoices require follow-up.
                  </p>
                  <Link to="/app/payments" className="btn btn-outline btn-sm">View Ledger →</Link>
                </div>

                <div className="card card-hover">
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--brand-navy-50)', color: 'var(--brand-navy-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <TrendingUp size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>Profit & Expense Analytics</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Categorize business overheads and view real-time monthly profit margins.
                  </p>
                  <Link to="/app/profit" className="btn btn-outline btn-sm">View Analytics →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 04: PRICING */}
      <section className="section-py" id="pricing" style={{ background: '#0A0A0A', color: '#ffffff', borderBottom: '1px solid #262626' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '720px', margin: '0 auto 3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <span className="editorial-number">04</span>
              <span className="editorial-divider" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C9A227' }}>
                Subscription Plans
              </span>
            </div>
            <KineticText
              as="h2"
              style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}
            >
              Simple pricing. Start free.
            </KineticText>
            <p style={{ fontSize: '1.0625rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Use BizPilotly for free, or unlock advanced business tools with a 15-day free trial. No credit card required.
            </p>

            {/* Currency Selector */}
            <div style={{ marginTop: '1.5rem' }}>
              <CurrencySelector value={currency} onChange={handleCurrencyChange} />
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.5rem' }}>
                More currencies coming soon.
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto 2.5rem', alignItems: 'stretch' }}>
            {PRICING_PLANS.map((plan) => {
              const price = plan.prices[currency];

              return (
                <div
                  key={plan.id}
                  style={{
                    backgroundColor: plan.isRecommended ? '#0B1F3A' : 'rgba(255, 255, 255, 0.04)',
                    border: plan.isRecommended ? '2px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-2xl, 20px)',
                    padding: '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    boxShadow: plan.isRecommended ? '0 20px 40px -15px rgba(245, 158, 11, 0.25)' : 'none',
                  }}
                >
                  {plan.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#F59E0B',
                        color: '#0A0A0A',
                        padding: '0.25rem 1rem',
                        borderRadius: '999px',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {plan.name}
                      </h3>
                      {plan.id === 'pro' && <Zap size={20} color="#F59E0B" />}
                      {plan.id === 'business' && <Crown size={20} color="#6366F1" />}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem', minHeight: '44px', lineHeight: 1.4 }}>
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
                          {price.formatted}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                          / {plan.billingPeriod}
                        </span>
                      </div>
                      {plan.trialDays > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>
                          ✓ {plan.trialText}
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '1rem' }}>
                      Features Included:
                    </div>

                    {/* Feature list */}
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem', listStyle: 'none', padding: 0 }}>
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.625rem',
                            fontSize: '0.875rem',
                            color: feat.included ? '#e2e8f0' : '#64748b',
                            opacity: feat.included ? 1 : 0.4,
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: feat.included ? (plan.isRecommended ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)') : 'rgba(255, 255, 255, 0.03)',
                              color: feat.included ? (plan.isRecommended ? '#F59E0B' : '#38bdf8') : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span>
                            {feat.text}
                            {feat.isNew && (
                              <span className="badge badge-gold" style={{ marginLeft: '0.375rem', fontSize: '0.625rem', padding: '1px 6px' }}>
                                NEW
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={`/signup?plan=${plan.id}`}
                    className={plan.isRecommended ? 'btn btn-gold btn-lg' : 'btn btn-primary btn-lg'}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SECTION 05: FAQ */}
      <section className="section-py" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-sm">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <span className="editorial-number">05</span>
              <span className="editorial-divider" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C9A227' }}>
                Inquiries
              </span>
            </div>
            <KineticText
              as="h2"
              style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}
            >
              Frequently Asked Questions
            </KineticText>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Clear answers regarding BizPilotly tools, workflow, and features.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform var(--transition-fast)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. SECTION 06: FINAL CTA */}
      <section className="section-py" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #0B1F3A 100%)', color: '#ffffff' }}>
        <div className="container text-center">
          <KineticText
            as="h2"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: '1.25rem' }}
          >
            Calculate Accurately. Create Fast. Manage With Clarity.
          </KineticText>
          <p style={{ fontSize: '1.125rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Join modern freelancers and service businesses using BizPilotly to run their client operations with confidence.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-gold btn-lg">
              <span>Create Free Account</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/calculators" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <span>Try Calculators</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
