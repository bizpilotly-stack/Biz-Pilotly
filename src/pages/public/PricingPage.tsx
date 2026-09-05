import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Shield, Zap, Crown, Percent } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import {
  PRICING_PLANS,
  PricingCurrency,
  BillingInterval,
  getStoredCurrency,
  setStoredCurrency,
} from '../../config/pricing';
import { CurrencySelector } from '../../components/common/CurrencySelector';
import { SEO } from '../../components/common/SEO';

export const PricingPage: React.FC = () => {
  const [currency, setCurrency] = useState<PricingCurrency>(getStoredCurrency());
  const [interval, setInterval] = useState<BillingInterval>('monthly');

  const handleCurrencyChange = (newCurrency: PricingCurrency) => {
    setCurrency(newCurrency);
    setStoredCurrency(newCurrency);
  };

  return (
    <div className="section-py-sm">
      <SEO
        title={`Pricing & Plans | ${BRAND_NAME}`}
        description="Simple, transparent pricing for independent professionals, freelancers, and agencies. 15-day free trial on Professional and Business Suite. Save 20% on yearly plans."
        canonical="https://bizpilotly.com/pricing"
      />

      <div className="container">
        {/* Top Header */}
        <div className="text-center" style={{ maxWidth: '780px', margin: '0 auto 2.5rem' }}>
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>15-Day Free Trial on All Paid Plans</span>
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Simple pricing. Start free.
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Use BizPilotly for free, or unlock advanced business tools with a 15-day free trial. No credit card required.
          </p>

          {/* Billing Interval Toggle (Monthly vs Yearly - 20% OFF) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--bg-surface-muted, #F1F5F9)',
                padding: '4px',
                borderRadius: '999px',
                border: '1px solid var(--border-color, #E2E8F0)',
              }}
            >
              <button
                type="button"
                onClick={() => setInterval('monthly')}
                style={{
                  padding: '6px 18px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: interval === 'monthly' ? 700 : 500,
                  background: interval === 'monthly' ? '#0B1F3A' : 'transparent',
                  color: interval === 'monthly' ? '#ffffff' : '#64748B',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setInterval('yearly')}
                style={{
                  padding: '6px 18px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: interval === 'yearly' ? 700 : 500,
                  background: interval === 'yearly' ? '#0B1F3A' : 'transparent',
                  color: interval === 'yearly' ? '#ffffff' : '#64748B',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Annual Billing</span>
                <span
                  style={{
                    background: '#10B981',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '999px',
                  }}
                >
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Currency Switcher Toggle */}
          <div style={{ marginTop: '1.25rem' }}>
            <CurrencySelector value={currency} onChange={handleCurrencyChange} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              More currencies coming soon.
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto 4rem', alignItems: 'stretch' }}>
          {PRICING_PLANS.map((plan) => {
            const price = plan.prices[currency];
            const isYearly = interval === 'yearly' && plan.id !== 'free';

            const displayAmount = isYearly
              ? price.monthlyEquivalentFormatted
              : price.formatted;

            const displayPeriod = isYearly
              ? '/ month (billed annually)'
              : `/ ${plan.billingPeriod}`;

            return (
              <div
                key={plan.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: plan.isRecommended ? '2px solid #F59E0B' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-2xl, 20px)',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: plan.isRecommended ? '0 10px 30px -10px rgba(245, 158, 11, 0.3)' : 'var(--shadow-sm)',
                  position: 'relative',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: plan.isRecommended ? '#F59E0B' : '#0B1F3A',
                      color: plan.isRecommended ? '#0A0A0A' : '#ffffff',
                      padding: '0.3rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-black)', margin: 0 }}>
                      {plan.name}
                    </h3>
                    {plan.id === 'pro' && <Zap size={20} color="#F59E0B" />}
                    {plan.id === 'business' && <Crown size={20} color="#6366F1" />}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', minHeight: '44px', lineHeight: 1.4 }}>
                    {plan.description}
                  </p>

                  {/* Price Display */}
                  <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em' }}>
                        {displayAmount}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {displayPeriod}
                      </span>
                    </div>

                    {isYearly && (
                      <div style={{ fontSize: '0.8125rem', color: '#047857', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Percent size={13} />
                        <span>{price.yearlyFormatted} • 20% Annual Discount Applied</span>
                      </div>
                    )}

                    {plan.trialDays > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                        ✓ {plan.trialText}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Features Included:
                  </div>

                  {/* Features List */}
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem', listStyle: 'none', padding: 0 }}>
                    {plan.features.map((feat, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.625rem',
                          fontSize: '0.875rem',
                          color: feat.included ? 'var(--text-primary)' : 'var(--text-muted)',
                          opacity: feat.included ? 1 : 0.5,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: feat.included ? (plan.isRecommended ? '#FEF3C7' : '#EFF6FF') : 'var(--bg-surface-muted)',
                            color: feat.included ? (plan.isRecommended ? '#D97706' : '#2563EB') : '#94A3B8',
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
                  to={`/signup?plan=${plan.id}&interval=${interval}`}
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

        {/* 15-Day Trial Guarantee Banner */}
        <div style={{ maxWidth: '860px', margin: '0 auto', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl, 16px)', padding: '1.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#0B1F3A', margin: 0 }}>
                15-Day Free Trial Guarantee
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Test any plan risk-free for 15 days. After 15 days, choose to subscribe or automatically return to Free Starter with 100% of your data intact.
              </p>
            </div>
          </div>
          <Link to={`/signup?plan=pro&interval=${interval}`} className="btn btn-primary btn-sm">
            <span>Start Free Trial</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

