import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionService, UserSubscription } from '../../services/subscriptionService';
import { PlanTier, PRICING_PLANS, getStoredCurrency } from '../../config/pricing';
import { UpgradeModal } from './UpgradeModal';

interface TierProtectedPageProps {
  children: React.ReactNode;
  requiredPlan: 'pro' | 'business';
  featureName?: string;
  featureDescription?: string;
  featureBenefits?: string[];
}

export const TierProtectedPage: React.FC<TierProtectedPageProps> = ({
  children,
  requiredPlan,
  featureName,
  featureDescription,
  featureBenefits,
}) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (user) {
      subscriptionService.getSubscription({ id: user.id, email: user.email }).then((sub) => {
        if (mounted) {
          setSubscription(sub);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Verifying plan access...</div>
      </div>
    );
  }

  // Check access based on required plan
  const effectivePlan: PlanTier = subscription ? subscriptionService.getEffectivePlan(subscription) : 'free';
  const hasAccess =
    requiredPlan === 'pro'
      ? effectivePlan === 'pro' || effectivePlan === 'business'
      : effectivePlan === 'business';

  if (hasAccess) {
    return <>{children}</>;
  }

  const planConfig = PRICING_PLANS.find((p) => p.id === requiredPlan) || PRICING_PLANS[1];
  const currency = getStoredCurrency();
  const priceDetail = planConfig.prices[currency];
  const isBusiness = requiredPlan === 'business';

  const defaultBenefits = isBusiness
    ? [
        'Multi-Business Workspace switching (up to 5 brand studios)',
        'Team member seats & customizable staff permission levels',
        'Bilateral Legal Execution Certificates & client counter-signatures',
        'Platform Audit Logs export & enterprise financial tracking',
      ]
    : [
        'Unlimited Invoices, Quotes, Receipts & Proposals',
        'Unlimited Saved Client Contacts & Customer Ledgers',
        '100% White-Label Branding (Upload custom logo & remove watermark)',
        'Paystack & Multi-provider Online Card, USSD & Bank Checkout',
        'Automated Client Payment Email Reminders & Accounting CSVs',
      ];

  const benefits = featureBenefits || defaultBenefits;

  return (
    <div className="tier-locked-container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(145deg, #0B1F3A 0%, #061120 100%)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow Accent */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: isBusiness ? 'radial-gradient(circle, rgba(201,162,39,0.3) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />

        {/* Lock Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            background: isBusiness ? 'rgba(201, 162, 39, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            border: isBusiness ? '1px solid rgba(201, 162, 39, 0.5)' : '1px solid rgba(59, 130, 246, 0.5)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            color: isBusiness ? '#C9A227' : '#60A5FA',
          }}
        >
          <Lock size={30} />
        </div>

        {/* Badge */}
        <div style={{ marginBottom: '0.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: isBusiness ? 'rgba(201, 162, 39, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              color: isBusiness ? '#FDE047' : '#93C5FD',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <Sparkles size={13} />
            <span>{isBusiness ? 'Business Suite Exclusive' : 'Professional Tier Feature'}</span>
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', margin: '0 0 0.75rem' }}>
          {featureName || (isBusiness ? 'Unlock Business Suite' : 'Unlock Professional Power')}
        </h2>

        {/* Description */}
        <p style={{ fontSize: '0.9375rem', color: '#CBD5E1', maxWidth: '580px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          {featureDescription ||
            `This feature is available exclusively on ${planConfig.name}. Start a 15-day free trial now to unlock access with zero credit card required.`}
        </p>

        {/* Benefits Box */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '520px',
            margin: '0 auto 2rem',
            textAlign: 'left',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', marginBottom: '0.875rem' }}>
            What you get with {planConfig.name}:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {benefits.map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem', color: '#F1F5F9' }}>
                <CheckCircle2 size={16} color={isBusiness ? '#C9A227' : '#10B981'} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 2rem',
              borderRadius: '999px',
              background: isBusiness ? 'linear-gradient(135deg, #C9A227 0%, #A37F16 100%)' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isBusiness ? '0 10px 25px rgba(201, 162, 39, 0.4)' : '0 10px 25px rgba(37, 99, 235, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            <span>Start 15-Day Free Trial ({priceDetail.formatted}/mo after)</span>
            <ArrowRight size={16} />
          </button>

          <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>No credit card required • Cancel or downgrade anytime to Free Starter</span>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        initialPlan={requiredPlan}
      />
    </div>
  );
};
