import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, Sparkles, HelpCircle } from 'lucide-react';
import { calculatorService } from '../../services/calculatorService';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const CommissionCalculator: React.FC = () => {
  const meta = calculatorService.getCalculatorBySlug('commission')!;
  const [dealAmount, setDealAmount] = useState<number>(18000);
  const [commissionRate, setCommissionRate] = useState<number>(8.5);

  const res = calculatorService.calculateCommission({
    dealAmount,
    commissionRatePercent: commissionRate,
  });

  return (
    <div className="section-py-sm">
      <SEO
        title={`${meta.title} | ${BRAND_NAME}`}
        description={meta.shortDescription}
        canonical="https://example.com/calculators/commission"
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
                <span>Deal & Commission</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setDealAmount(18000);
                  setCommissionRate(8.5);
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Reset
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Total Contract / Deal Value ($)</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="500"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Commission / Referral Split Rate (%)</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="100"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
          </div>

          <div className="calc-results-panel">
            <div className="calc-result-header">
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Total Commission Payout
              </div>
              <div className="calc-main-stat">
                {formatCurrency(res.commissionAmount)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#38bdf8' }}>
                <Sparkles size={16} />
                <span>Net retained by producer: <strong>{formatCurrency(res.remainingAmount)}</strong></span>
              </div>
            </div>

            <div className="calc-stats-grid">
              <div className="calc-stat-item">
                <div className="calc-stat-label">Producer Retained</div>
                <div className="calc-stat-val" style={{ color: '#10b981' }}>{formatCurrency(res.remainingAmount)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Referral Fee</div>
                <div className="calc-stat-val" style={{ color: 'var(--brand-gold-400)' }}>{formatCurrency(res.commissionAmount)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Total Contract</div>
                <div className="calc-stat-val">{formatCurrency(res.dealAmount)}</div>
              </div>

              <div className="calc-stat-item">
                <div className="calc-stat-label">Rate Percentage</div>
                <div className="calc-stat-val">{formatPercent(commissionRate)}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Link to="/documents/receipt" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <FileText size={16} />
                <span>Issue Commission Receipt</span>
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
            <p>Generate an official receipt confirming funds or commission settlement.</p>
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
