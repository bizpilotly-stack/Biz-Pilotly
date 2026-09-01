import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Clock, ShieldCheck, Mail } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { subscriptionService } from '../../services/subscriptionService';
import { SEO } from '../../components/common/SEO';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const PricingPage: React.FC = () => {
  const plans = subscriptionService.getPlans();
  const { showToast } = useToast();
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setWaitlistSubmitted(true);
    showToast('You are on the Pro early access waitlist!', 'success');
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
        description="Simple, transparent pricing for independent professionals. Access calculators, document generators, and client tools."
        canonical="https://bizpilotly.com/pricing"
      />

      <div className="container">
        <div className="text-center" style={{ maxWidth: '720px', margin: '0 auto 3rem' }}>
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>Transparent Pricing</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Simple, Transparent Plans
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Start with our complete suite of financial calculators and document builders. Upgrade to automated recurring invoicing and deep analytics as your business scales.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', maxWidth: '960px', margin: '0 auto 4rem', alignItems: 'stretch' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: plan.highlighted ? '2px solid var(--brand-gold-500)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-2xl)',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: plan.highlighted ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
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
                    background: 'var(--brand-gold-500)',
                    color: '#ffffff',
                    padding: '0.25rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{plan.name}</h3>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', minHeight: '40px' }}>
                  {plan.description}
                </p>

                <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span style={{ fontSize: plan.price.startsWith('$') ? '2.75rem' : '2rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em' }}>
                    {plan.price}
                  </span>
                  {plan.billingPeriod && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                      {plan.price.startsWith('$') ? `/ ${plan.billingPeriod}` : `• ${plan.billingPeriod}`}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Features Included:
                </div>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  {plan.features.map((feat, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.625rem',
                        fontSize: '0.875rem',
                        color: feat.included ? 'var(--text-primary)' : 'var(--text-muted)',
                        opacity: feat.included ? 1 : 0.6,
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: feat.included ? (plan.highlighted ? 'var(--brand-gold-100)' : 'var(--brand-navy-50)') : 'var(--bg-surface-muted)',
                          color: feat.included ? (plan.highlighted ? 'var(--brand-gold-700)' : 'var(--brand-navy-600)') : 'var(--text-muted)',
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
                          <span className="badge badge-gold" style={{ marginLeft: '0.5rem', fontSize: '0.6875rem' }}>
                            Pro
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
                  onClick={() => setWaitlistModalOpen(true)}
                  className="btn btn-gold btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Clock size={16} />
                  <span>{plan.ctaText}</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Note Regarding Future Pricing */}
        <div style={{ maxWidth: '780px', margin: '0 auto', background: 'var(--bg-surface-muted)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="#1d4ed8" />
            <span>Founder Guarantee</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            All core calculation tools and document generators remain fully accessible on the Starter plan. Early accounts receive guaranteed preferential founder rates when Pro automation modules launch.
          </p>
        </div>
      </div>

      {/* Pro Waitlist Modal */}
      <Modal
        isOpen={waitlistModalOpen}
        onClose={() => setWaitlistModalOpen(false)}
        title="Join Pro Early Access Waitlist"
      >
        {waitlistSubmitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check size={24} />
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Thank you for joining!</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              We will notify you the moment Pro automated features are ready for preview testing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWaitlistSubmit}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Pro tier will introduce recurring invoicing, automated email payment reminders, and custom domains. Leave your email for priority beta access.
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
                Join Waitlist
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
