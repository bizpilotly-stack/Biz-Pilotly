import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Sparkles, HelpCircle } from 'lucide-react';
import { calculatorService } from '../../services/calculatorService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const ProfitCalculator: React.FC = () => {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');
  const calcsBase = isApp ? '/app/calculators' : '/calculators';
  const docsBase = isApp ? '/app/documents' : '/documents';

  const meta = calculatorService.getCalculatorBySlug('profit')!;
  const relatedCalculators = calculatorService.getRelatedCalculators('profit');
  const jsonLd = calculatorService.getJsonLd('profit');

  const [revenue, setRevenue] = useState<number>(5000);
  const [directCosts, setDirectCosts] = useState<number>(800);
  const [overheadCosts, setOverheadCosts] = useState<number>(400);
  const [taxRate, setTaxRate] = useState<number>(15);

  const res = calculatorService.calculateProfit({
    revenue,
    directCosts,
    overheadCosts,
    taxRate,
  });

  return (
    <div className="section-py-sm">
      <SEO
        title={meta.seoTitle || `${meta.name} | ${BRAND_NAME}`}
        description={meta.seoDescription || meta.shortDescription}
        canonical={`https://bizpilotly.com${meta.route}`}
        jsonLd={jsonLd}
      />

      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link to={calcsBase} style={{ color: 'var(--brand-navy-600)' }}>Calculators</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{meta.name}</span>
        </div>

        <div style={{ maxWidth: '780px', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            {meta.name}
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {meta.shortDescription}
          </p>
        </div>

        {/* Split Calculator Layout */}
        <div className="calc-detail-layout">
          {/* Inputs Column */}
          <div className="calc-inputs-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={20} color="#0B1F3A" />
                <span>Parameters</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setRevenue(5000);
                  setDirectCosts(800);
                  setOverheadCosts(400);
                  setTaxRate(15);
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Reset
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="revenueInput">Total Client Revenue / Billing</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="revenueInput"
                  type="number"
                  className="form-input"
                  min="0"
                  step="50"
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                />
              </div>
              <p className="form-hint">Total agreed client fee for deliverables</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="directCostsInput">Direct Deliverable Costs (Contractors, Asset licenses)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="directCostsInput"
                  type="number"
                  className="form-input"
                  min="0"
                  step="25"
                  value={directCosts}
                  onChange={(e) => setDirectCosts(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="overheadCostsInput">Allocated Overhead Costs (Software, Equipment, Utilities)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="overheadCostsInput"
                  type="number"
                  className="form-input"
                  min="0"
                  step="25"
                  value={overheadCosts}
                  onChange={(e) => setOverheadCosts(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="taxRateInput">Estimated Income / Business Tax Rate (%)</label>
              <div className="input-with-suffix">
                <input
                  id="taxRateInput"
                  type="number"
                  className="form-input"
                  min="0"
                  max="60"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="calc-results-panel">
            <div className="calc-result-header">
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Realized Net Take-Home Profit
              </div>
              <div className="calc-main-stat">
                {formatCurrency(res.netProfit)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#38bdf8' }}>
                <Sparkles size={16} />
                <span><strong>{formatPercent(res.netMargin)}</strong> Net Margin on Billing</span>
              </div>
            </div>

            <div className="calc-stats-grid">
              <div className="calc-stat-item">
                <div className="calc-stat-label">Gross Profit</div>
                <div className="calc-stat-val">{formatCurrency(res.grossProfit)}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{formatPercent(res.grossMargin)} gross margin</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Total Expenditures</div>
                <div className="calc-stat-val" style={{ color: '#f87171' }}>{formatCurrency(res.totalCosts)}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Direct + Overhead</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Pre-Tax Operating Income</div>
                <div className="calc-stat-val">{formatCurrency(res.preTaxNetProfit)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Tax Provision ({taxRate}%)</div>
                <div className="calc-stat-val" style={{ color: '#fbbf24' }}>{formatCurrency(res.estimatedTax)}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Link to={`${docsBase}/invoice`} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <FileText size={16} />
                <span>Create Invoice for {formatCurrency(revenue)}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Formula & Explanation Accordion Section */}
        <div className="calc-info-section">
          <div className="calc-info-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="#0B1F3A" />
              <span>Mathematical Formula</span>
            </h3>
            <div className="formula-box">
              {meta.formula}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {meta.formulaDescription}
            </p>
          </div>

          <div className="calc-info-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Real-World Freelance Scenario
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {meta.exampleScenario}
            </p>
            <div style={{ background: 'var(--bg-app)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--brand-black)' }}>
              {meta.exampleCalculation}
            </div>
          </div>
        </div>

        {/* Cross Linking to Related Tools & Next Document Step */}
        <div className="calc-cta-banner">
          <div className="calc-cta-text">
            <h3>{meta.targetDocumentCTA.text}</h3>
            <p>Generate a professional, printable invoice or estimate populated with your client information.</p>
          </div>
          <Link to={isApp ? `/app${meta.targetDocumentCTA.link}` : meta.targetDocumentCTA.link} className="btn btn-gold">
            <span>{meta.targetDocumentCTA.buttonLabel}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Related Calculators */}
        {relatedCalculators.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Related Pricing Calculators
            </h4>
            <div className="related-calcs-list">
              {relatedCalculators.map((r) => (
                <Link key={r.slug} to={isApp ? `/app${r.route}` : r.route} className="related-calc-chip">
                  <span>{r.name}</span>
                  <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
