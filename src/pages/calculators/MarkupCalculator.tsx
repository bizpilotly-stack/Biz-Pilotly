import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Sparkles, HelpCircle } from 'lucide-react';
import { calculatorService } from '../../services/calculatorService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const MarkupCalculator: React.FC = () => {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');
  const calcsBase = isApp ? '/app/calculators' : '/calculators';
  const docsBase = isApp ? '/app/documents' : '/documents';

  const meta = calculatorService.getCalculatorBySlug('markup')!;
  const relatedCalculators = calculatorService.getRelatedCalculators('markup');
  const jsonLd = calculatorService.getJsonLd('markup');

  const [cost, setCost] = useState<number>(1500);
  const [markupPercent, setMarkupPercent] = useState<number>(80);

  const res = calculatorService.calculateMarkup({
    cost,
    markupPercent,
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

        <div className="calc-detail-layout">
          <div className="calc-inputs-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={20} color="#0B1F3A" />
                <span>Parameters</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCost(1500);
                  setMarkupPercent(80);
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Reset
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="markupCostInput">Base Internal Cost ($)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="markupCostInput"
                  type="number"
                  className="form-input"
                  min="0"
                  step="50"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                />
              </div>
              <p className="form-hint">Direct project expenditure and subcontracting costs</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="markupPercentInput">Markup Percentage (%)</label>
              <div className="input-with-suffix">
                <input
                  id="markupPercentInput"
                  type="number"
                  className="form-input"
                  min="0"
                  step="5"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(Number(e.target.value))}
                />
                <span className="input-suffix">%</span>
              </div>
              <p className="form-hint">Percentage multiplier added above baseline cost</p>
            </div>
          </div>

          <div className="calc-results-panel">
            <div className="calc-result-header">
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Total Marked-Up Client Price
              </div>
              <div className="calc-main-stat" style={{ color: 'var(--brand-gold-400)' }}>
                {formatCurrency(res.sellingPrice)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#38bdf8' }}>
                <Sparkles size={16} />
                <span>Yields <strong>{formatPercent(res.profitMargin)}</strong> Profit Margin</span>
              </div>
            </div>

            <div className="calc-stats-grid">
              <div className="calc-stat-item">
                <div className="calc-stat-label">Net Profit Added</div>
                <div className="calc-stat-val" style={{ color: '#34d399' }}>{formatCurrency(res.profit)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Markup Rate</div>
                <div className="calc-stat-val">+{formatPercent(res.markup)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Base Cost</div>
                <div className="calc-stat-val">{formatCurrency(res.cost)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Resulting Margin</div>
                <div className="calc-stat-val">{formatPercent(res.profitMargin)}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Link to={`${docsBase}/proposal`} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <FileText size={16} />
                <span>Create Proposal for {formatCurrency(res.sellingPrice)}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="calc-info-section">
          <div className="calc-info-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="#0B1F3A" />
              <span>Formula Explanation</span>
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
              Example Calculation
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {meta.exampleScenario}
            </p>
            <div style={{ background: 'var(--bg-app)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--brand-black)' }}>
              {meta.exampleCalculation}
            </div>
          </div>
        </div>

        <div className="calc-cta-banner">
          <div className="calc-cta-text">
            <h3>{meta.targetDocumentCTA.text}</h3>
            <p>Structure your marked-up pricing into a clear proposal for client sign-off.</p>
          </div>
          <Link to={isApp ? `/app${meta.targetDocumentCTA.link}` : meta.targetDocumentCTA.link} className="btn btn-gold">
            <span>{meta.targetDocumentCTA.buttonLabel}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

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
