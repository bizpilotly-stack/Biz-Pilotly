import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { subscriptionService, UserSubscription } from '../../services/subscriptionService';
import { UpgradeModal } from '../subscription/UpgradeModal';
import { useAuth } from '../../contexts/AuthContext';

interface FeatureGateProps {
  requiredPlan?: 'pro' | 'business';
  featureName?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  requiredPlan = 'pro',
  featureName = 'Professional feature',
  fallback,
  children,
}) => {
  const { user } = useAuth();
  const [sub, setSub] = useState<UserSubscription | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    subscriptionService.getSubscription(user || undefined).then(setSub);
  }, [user]);

  const effectivePlan = sub ? subscriptionService.getEffectivePlan(sub) : 'free';
  const hasAccess =
    requiredPlan === 'business'
      ? effectivePlan === 'business'
      : effectivePlan === 'pro' || effectivePlan === 'business';

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div
        style={{
          background: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lock size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1F3A' }}>
              {featureName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Available on the {requiredPlan === 'business' ? 'Business Suite' : 'Professional'} plan.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUpgradeOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Sparkles size={13} />
          <span>Upgrade to {requiredPlan === 'business' ? 'Business Suite' : 'Professional'}</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        initialPlan={requiredPlan}
      />
    </>
  );
};
