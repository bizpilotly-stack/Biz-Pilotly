import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Sparkles, HelpCircle } from 'lucide-react';
import { calculatorService } from '../../services/calculatorService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const ROICalculator: React.FC = () => {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');
  const calcsBase = isApp ? '/app/calculators' : '/calculators';
  const docsBase = isApp ? '/app/documents' : '/documents';

  const meta = calculatorService.getCalculatorBySlug('roi')!;
  const relatedCalculators = calculatorService.getRelatedCalculators('roi');
  const jsonLd = calculatorService.getJsonLd('roi');

  const [cost, setCost] = useState<number>(2000);
  const [expectedRevenue, setExpectedRevenue] = useState<number>(9500);

  const res = calculatorService.calculateROI({
    cost,
    expectedRevenue,
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
                <span>Investment Parameters</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCost(2000);
                  setExpectedRevenue(9500);
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Reset
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="roiCostInput">Total Expenditure / Investment Cost ($)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="roiCostInput"
                  type="number"
                  className="form-input"
                  min="0"
                  step="100"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                />
              </div>
              <p className="form-hint">Cost of equipment, software, hiring, or campaign expenditure</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="roiRevenueInput">Total Expected Gross Returns / Client Revenue ($)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="roiRevenueInput"
                  type="number"
                  className="form-input"
                  min="0"
                  step="500"
                  value={expectedRevenue}
                  onChange={(e) => setExpectedRevenue(Number(e.target.value))}
                />
              </div>
              <p className="form-hint">Anticipated gross income unlocked by this investment</p>
            </div>
          </div>

          <div className="calc-results-panel">
            <div className="calc-result-header">
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Total Return on Investment (ROI)
              </div>
              <div className="calc-main-stat" style={{ color: '#34d399' }}>
                +{formatPercent(res.roiPercent)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#38bdf8' }}>
                <Sparkles size={16} />
                <span>Yields an <strong>{res.multiple}x</strong> investment multiple</span>
              </div>
            </div>

            <div className="calc-stats-grid">
              <div className="calc-stat-item">
                <div className="calc-stat-label">Net Financial Gain</div>
                <div className="calc-stat-val" style={{ color: '#34d399' }}>+{formatCurrency(res.netGain)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Investment Multiple</div>
                <div className="calc-stat-val" style={{ color: 'var(--brand-gold-400)' }}>{res.multiple}x</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Total Outlay</div>
                <div className="calc-stat-val">{formatCurrency(res.cost)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Total Cash Returned</div>
                <div className="calc-stat-val">{formatCurrency(res.revenue)}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Link to={`${docsBase}/proposal`} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <FileText size={16} />
                <span>Create Proposal for {formatCurrency(res.revenue)}</span>
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
            <p>Showcase projected return on investment directly inside client proposals.</p>
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
