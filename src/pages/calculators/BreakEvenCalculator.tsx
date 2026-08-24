import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Sparkles, HelpCircle } from 'lucide-react';
import { calculatorService } from '../../services/calculatorService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const BreakEvenCalculator: React.FC = () => {
  const meta = calculatorService.getCalculatorBySlug('break-even')!;
  const [fixedCosts, setFixedCosts] = useState<number>(3000);
  const [pricePerUnit, setPricePerUnit] = useState<number>(150);
  const [variableCost, setVariableCost] = useState<number>(30);

  const res = calculatorService.calculateBreakEven({
    fixedCosts,
    pricePerUnit,
    variableCostPerUnit: variableCost,
  });

  return (
    <div className="section-py-sm">
      <SEO
        title={`${meta.title} | ${BRAND_NAME}`}
        description={meta.shortDescription}
        canonical="https://example.com/calculators/break-even"
      />

      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link to="/calculators" style={{ color: 'var(--brand-navy-600)' }}>Calculators</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{meta.title}</span>
        </div>

        <div style={{ maxWidth: '780px', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            {meta.title}
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
                  setFixedCosts(3000);
                  setPricePerUnit(150);
                  setVariableCost(30);
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Reset
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Total Monthly Fixed Overheads ($)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="100"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Number(e.target.value))}
                />
              </div>
              <p className="form-hint">Studio rent, software licenses, core equipment depreciation</p>
            </div>

            <div className="form-group">
              <label className="form-label">Client Rate Per Billable Unit / Hour ($)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  step="10"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Variable Direct Cost Per Unit / Hour ($)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="5"
                  value={variableCost}
                  onChange={(e) => setVariableCost(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="calc-results-panel">
            <div className="calc-result-header">
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Break-Even Threshold Needed
              </div>
              <div className="calc-main-stat">
                {res.breakEvenUnits} Units / Hours
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#38bdf8' }}>
                <Sparkles size={16} />
                <span>Requires <strong>{formatCurrency(res.breakEvenRevenue)}</strong> in total billings</span>
              </div>
            </div>

            <div className="calc-stats-grid">
              <div className="calc-stat-item">
                <div className="calc-stat-label">Contribution / Unit</div>
                <div className="calc-stat-val">{formatCurrency(res.contributionMargin)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Margin Ratio</div>
                <div className="calc-stat-val" style={{ color: 'var(--brand-gold-400)' }}>{formatPercent(res.marginRatio || 0)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Fixed Overhead</div>
                <div className="calc-stat-val">{formatCurrency(res.fixedCosts)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Revenue Target</div>
                <div className="calc-stat-val">{formatCurrency(res.breakEvenRevenue)}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Link to="/documents/quote" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <FileText size={16} />
                <span>Create Quote</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="calc-info-section">
          <div className="calc-info-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="#1d4ed8" />
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
            <p>Draft an estimate based on your target billable hours.</p>
          </div>
          <Link to={meta.targetDocumentCTA.link} className="btn btn-gold">
            <span>{meta.targetDocumentCTA.buttonLabel}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Related Pricing Calculators
          </h4>
          <div className="related-calcs-list">
            {meta.relatedCalculators.map((r, idx) => (
              <Link key={idx} to={`/calculators/${r.slug}`} className="related-calc-chip">
                <span>{r.title}</span>
                <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
