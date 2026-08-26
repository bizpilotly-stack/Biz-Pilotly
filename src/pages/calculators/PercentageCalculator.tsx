import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Sparkles, HelpCircle } from 'lucide-react';
import { calculatorService, PercentageCalcInput } from '../../services/calculatorService';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const PercentageCalculator: React.FC = () => {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');
  const calcsBase = isApp ? '/app/calculators' : '/calculators';
  const docsBase = isApp ? '/app/documents' : '/documents';

  const meta = calculatorService.getCalculatorBySlug('percentage')!;
  const relatedCalculators = calculatorService.getRelatedCalculators('percentage');
  const jsonLd = calculatorService.getJsonLd('percentage');

  const [mode, setMode] = useState<PercentageCalcInput['mode']>('what_is_x_percent_of_y');
  const [val1, setVal1] = useState<number>(25);
  const [val2, setVal2] = useState<number>(4800);

  const res = calculatorService.calculatePercentage({
    mode,
    val1,
    val2,
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
                <span>Percentage Mode</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setVal1(0);
                  setVal2(0);
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'what_is_x_percent_of_y' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setMode('what_is_x_percent_of_y'); setVal1(25); setVal2(4800); }}
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                1. What is X% of Y? (e.g. 25% deposit of $4,800)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'x_is_what_percent_of_y' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setMode('x_is_what_percent_of_y'); setVal1(1200); setVal2(4800); }}
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                2. X is what percent of Y? (e.g. $1,200 of $4,800)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'percentage_increase_decrease' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setMode('percentage_increase_decrease'); setVal1(14000); setVal2(21500); }}
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                3. Percent Change from X to Y (Growth / Drop)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="val1Input">
                  {mode === 'what_is_x_percent_of_y' ? 'Percentage (X %)' : mode === 'x_is_what_percent_of_y' ? 'Part Value (X)' : 'Initial Value (X)'}
                </label>
                <input
                  id="val1Input"
                  type="number"
                  className="form-input"
                  value={val1}
                  onChange={(e) => setVal1(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="val2Input">
                  {mode === 'what_is_x_percent_of_y' ? 'Total Amount (Y)' : mode === 'x_is_what_percent_of_y' ? 'Total Amount (Y)' : 'New Value (Y)'}
                </label>
                <input
                  id="val2Input"
                  type="number"
                  className="form-input"
                  value={val2}
                  onChange={(e) => setVal2(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="calc-results-panel">
            <div className="calc-result-header">
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                {res.text}
              </div>
              <div className="calc-main-stat">
                {res.result}{res.unit || ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#38bdf8' }}>
                <Sparkles size={16} />
                <span>{res.explanation}</span>
              </div>
            </div>

            <div className="calc-stats-grid">
              <div className="calc-stat-item">
                <div className="calc-stat-label">Value X</div>
                <div className="calc-stat-val">{val1}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Value Y</div>
                <div className="calc-stat-val">{val2}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Link to={`${docsBase}/quote`} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <FileText size={16} />
                <span>Apply to Business Document</span>
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
            <p>Prepare financial estimates for upcoming client projects.</p>
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
