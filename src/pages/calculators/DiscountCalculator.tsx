import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Sparkles, HelpCircle } from 'lucide-react';
import { calculatorService } from '../../services/calculatorService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const DiscountCalculator: React.FC = () => {
  const meta = calculatorService.getCalculatorBySlug('discount')!;
  const [originalPrice, setOriginalPrice] = useState<number>(6000);
  const [discountPercent, setDiscountPercent] = useState<number>(15);

  const res = calculatorService.calculateDiscount({
    originalPrice,
    discountPercent,
  });

  return (
    <div className="section-py-sm">
      <SEO
        title={`${meta.title} | ${BRAND_NAME}`}
        description={meta.shortDescription}
        canonical="https://example.com/calculators/discount"
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
                <span>Price & Discount</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setOriginalPrice(6000);
                  setDiscountPercent(15);
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Reset
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Original Standard Fee / Price ($)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="100"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Discount Percentage Allowance (%)</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                />
                <span className="input-suffix">%</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[5, 10, 15, 20, 25].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDiscountPercent(preset)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="calc-results-panel">
            <div className="calc-result-header">
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Discounted Final Invoice Price
              </div>
              <div className="calc-main-stat">
                {formatCurrency(res.finalPrice)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#38bdf8' }}>
                <Sparkles size={16} />
                <span>Client saves <strong>{formatCurrency(res.discountAmount)}</strong> ({formatPercent(discountPercent)})</span>
              </div>
            </div>

            <div className="calc-stats-grid">
              <div className="calc-stat-item">
                <div className="calc-stat-label">Total Savings Given</div>
                <div className="calc-stat-val" style={{ color: '#f87171' }}>-{formatCurrency(res.discountAmount)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Net Billed</div>
                <div className="calc-stat-val" style={{ color: 'var(--brand-gold-400)' }}>{formatCurrency(res.finalPrice)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Original Price</div>
                <div className="calc-stat-val">{formatCurrency(res.originalPrice)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Discount Rate</div>
                <div className="calc-stat-val">{formatPercent(discountPercent)}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Link to="/documents/invoice" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <FileText size={16} />
                <span>Create Invoice with {discountPercent}% Discount</span>
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
            <p>Apply this discounted line item directly to an official invoice.</p>
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
