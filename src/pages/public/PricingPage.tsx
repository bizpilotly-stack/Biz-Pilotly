import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Clock, Mail, Zap, Crown, Shield } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { subscriptionService, SubscriptionPlan, CurrencyType } from '../../services/subscriptionService';
import { waitlistService } from '../../services/waitlistService';
import { SEO } from '../../components/common/SEO';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const PricingPage: React.FC = () => {
  const plans = subscriptionService.getPlans();
  const { showToast } = useToast();
  const [currency, setCurrency] = useState<CurrencyType>('NGN');
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [selectedPlanForWaitlist, setSelectedPlanForWaitlist] = useState<SubscriptionPlan | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleOpenWaitlist = (plan: SubscriptionPlan) => {
    setSelectedPlanForWaitlist(plan);
    setWaitlistModalOpen(true);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    await waitlistService.joinWaitlist({
      email: waitlistEmail,
      plan: selectedPlanForWaitlist ? selectedPlanForWaitlist.name : 'Pro Tier',
      source: 'public_pricing_page',
    });
    setWaitlistSubmitted(true);
    showToast('🎉 You have locked in your 15-Day Free Trial and Early Bird Discount!', 'success');
    setTimeout(() => {
      setWaitlistModalOpen(false);
      setWaitlistSubmitted(false);
      setWaitlistEmail('');
    }, 1800);
  };

  return (
    <div className="section-py-sm">
      <SEO
        title={`Pricing & Plans | ${BRAND_NAME}`}
        description="Simple, transparent pricing for independent professionals, freelancers, and agencies. 15-day free trial on Professional and Business Suite."
        canonical="https://bizpilotly.com/pricing"
      />

      <div className="container">
        {/* Top Header */}
        <div className="text-center" style={{ maxWidth: '780px', margin: '0 auto 2.5rem' }}>
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>🎁 15-Day Free Trial on All Paid Plans</span>
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Simple, Transparent Plans
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Start free or test our Professional and Business Suite tiers with a <strong>15-Day Free Trial</strong>. No credit card required to explore.
          </p>

          {/* Currency Switcher Toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--bg-surface-muted)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', padding: '4px', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setCurrency('NGN')}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: currency === 'NGN' ? '#0B1F3A' : 'transparent',
                color: currency === 'NGN' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🇳🇬 NGN (₦)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: currency === 'USD' ? '#0B1F3A' : 'transparent',
                color: currency === 'USD' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🇺🇸 USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('EUR')}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: currency === 'EUR' ? '#0B1F3A' : 'transparent',
                color: currency === 'EUR' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              🇪🇺 EUR (€)
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto 4rem', alignItems: 'stretch' }}>
          {plans.map((plan) => {
            const formattedPrice = subscriptionService.getFormattedPrice(plan, currency);

            return (
              <div
                key={plan.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: plan.highlighted ? '2px solid #F59E0B' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: plan.highlighted ? '0 10px 30px -10px rgba(245, 158, 11, 0.3)' : 'var(--shadow-sm)',
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
                      background: plan.highlighted ? '#F59E0B' : '#0B1F3A',
                      color: '#ffffff',
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
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em' }}>
                        {formattedPrice}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        / {plan.billingPeriod}
                      </span>
                    </div>
                    {plan.id !== 'free' && (
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                        ✓ 15-Day Free Trial included (then {formattedPrice}/mo)
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
                            background: feat.included ? (plan.highlighted ? '#FEF3C7' : '#EFF6FF') : 'var(--bg-surface-muted)',
                            color: feat.included ? (plan.highlighted ? '#D97706' : '#2563EB') : '#94A3B8',
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

                {plan.status === 'active' ? (
                  <Link to="/signup" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    <span>{plan.ctaText}</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleOpenWaitlist(plan)}
                    className="btn btn-gold btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Clock size={16} />
                    <span>{plan.ctaText}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 15-Day Trial Guarantee Banner */}
        <div style={{ maxWidth: '860px', margin: '0 auto', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#0B1F3A', margin: 0 }}>
                15-Day Free Trial Guarantee
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Test any plan risk-free for 15 days. After 15 days, choose to subscribe or remain on the Free Starter plan.
              </p>
            </div>
          </div>
          <Link to="/signup" className="btn btn-primary btn-sm">
            <span>Get Started</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Pro / Suite Waitlist Modal */}
      <Modal
        isOpen={waitlistModalOpen}
        onClose={() => setWaitlistModalOpen(false)}
        title={`Start ${selectedPlanForWaitlist?.name || 'Pro'} 15-Day Free Trial`}
      >
        {waitlistSubmitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check size={24} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>15-Day Free Trial Reserved!</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              We will notify you at your email address the moment paid features go live so you can start your 15 days free.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWaitlistSubmit}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              Register your email for <strong>{selectedPlanForWaitlist?.name || 'Professional'}</strong>. You will receive an immediate <strong>15-Day Free Trial</strong> when card checkout activates.
            </p>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              prefixText={<Mail size={16} />}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="secondary" onClick={() => setWaitlistModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold">
                Reserve 15-Day Free Trial
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
