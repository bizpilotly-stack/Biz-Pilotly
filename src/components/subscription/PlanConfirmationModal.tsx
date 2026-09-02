import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap, Crown } from 'lucide-react';
import { PricingCurrency, getPlanConfig } from '../../config/pricing';
import { subscriptionService } from '../../services/subscriptionService';
import { useToast } from '../common/Toast';

interface PlanConfirmationModalProps {
  isOpen: boolean;
  planTier: 'pro' | 'business';
  currency: PricingCurrency;
  user: { id: string; email?: string | null; name?: string };
  onConfirm: () => void;
  onCancel: () => void;
}

export const PlanConfirmationModal: React.FC<PlanConfirmationModalProps> = ({
  isOpen,
  planTier,
  currency,
  user,
  onConfirm,
  onCancel,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const plan = getPlanConfig(planTier);

  if (!isOpen) return null;

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      await subscriptionService.start15DayTrial(user, planTier, currency);
      showToast(`🎉 15-Day ${plan.name} Trial Activated! Welcome to your workspace.`, 'success');
      onConfirm();
    } catch (err: any) {
      showToast(err?.message || 'Could not start trial. Continuing with Free Starter.', 'error');
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(9, 13, 22, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-2xl, 20px)',
          maxWidth: '520px',
          width: '100%',
          padding: '2.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #e2e8f0)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: '#FEF3C7',
              color: '#B45309',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} />
            <span>15-Day Free Trial • No Credit Card Required</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', margin: 0 }}>
            Start your {plan.name} trial
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.375rem', lineHeight: 1.4 }}>
            Explore all advanced business tools free for 15 days. No automated charges or credit card needed.
          </p>
        </div>

        {/* Selected Plan Snapshot Box */}
        <div
          style={{
            background: 'var(--bg-surface-muted, #F8FAFC)',
            border: '2px solid #0B1F3A',
            borderRadius: 'var(--radius-xl, 16px)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {planTier === 'pro' ? <Zap size={18} color="#F59E0B" /> : <Crown size={18} color="#6366F1" />}
              <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0B1F3A' }}>{plan.name}</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '999px' }}>
              15 Days Free
            </span>
          </div>

          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0B1F3A', marginBottom: '0.5rem' }}>
            Included in your 15-day trial:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {plan.features.slice(0, 5).map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#334155' }}>
                <Check size={13} color="#10B981" strokeWidth={3} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '0.75rem', paddingTop: '0.5rem', fontSize: '0.75rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
            <span>Price after trial if you subscribe:</span>
            <span style={{ fontWeight: 700, color: '#0B1F3A' }}>
              {plan.prices[currency].formatted} / month
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleStartTrial}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontWeight: 700, fontSize: '0.9375rem' }}
          >
            <span>{loading ? 'Activating Trial...' : 'Start 15-Day Trial'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', color: '#64748B' }}
          >
            Maybe Later (Continue on Free Starter)
          </button>
        </div>

        {/* Security Note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '1rem', fontSize: '0.6875rem', color: '#94A3B8' }}>
          <ShieldCheck size={13} color="#10B981" />
          <span>Zero risk. When trial completes, your data is 100% safe on Free Starter.</span>
        </div>
      </div>
    </div>
  );
};
