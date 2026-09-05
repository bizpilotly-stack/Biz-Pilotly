import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, X, ShieldCheck, Zap, Crown, Percent } from 'lucide-react';
import {
  PlanTier,
  PricingCurrency,
  BillingInterval,
  PRICING_PLANS,
  getPlanConfig,
  getStoredCurrency,
} from '../../config/pricing';
import { CurrencySelector } from '../common/CurrencySelector';
import { subscriptionService } from '../../services/subscriptionService';
import { useToast } from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: PlanTier;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'pro',
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(initialPlan === 'free' ? 'pro' : initialPlan);
  const [currency, setCurrency] = useState<PricingCurrency>(getStoredCurrency());
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentPlanConfig = getPlanConfig(selectedPlan);
  const currentPrice = currentPlanConfig.prices[currency];

  const handleSubscribe = async () => {
    if (!user) {
      showToast('Please sign in to subscribe.', 'error');
      return;
    }

    setLoading(true);
    try {
      await subscriptionService.activateSubscription(user.id, selectedPlan as 'pro' | 'business', currency, interval);
      showToast(`🎉 Upgraded to ${currentPlanConfig.name} (${interval === 'yearly' ? 'Annual - 20% OFF' : 'Monthly'})! All features unlocked.`, 'success');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      showToast('Subscription setup could not be completed. Please try again.', 'error');
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
          maxWidth: '820px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #e2e8f0)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
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
              marginBottom: '0.5rem',
            }}
          >
            <Sparkles size={14} />
            <span>Workspace Upgrade</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', margin: 0 }}>
            Choose Your Plan
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.375rem' }}>
            Unlock unlimited invoicing, white-label branding, legal execution certificates, and team collaboration.
          </p>

          {/* Billing Interval Toggle (Monthly vs Yearly - 20% OFF) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <div
              style={{
                display: 'inline-flex',
                background: '#F1F5F9',
                padding: '3px',
                borderRadius: '999px',
                border: '1px solid #E2E8F0',
              }}
            >
              <button
                type="button"
                onClick={() => setInterval('monthly')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: interval === 'monthly' ? 700 : 500,
                  background: interval === 'monthly' ? '#0B1F3A' : 'transparent',
                  color: interval === 'monthly' ? '#ffffff' : '#64748B',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval('yearly')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: interval === 'yearly' ? 700 : 500,
                  background: interval === 'yearly' ? '#0B1F3A' : 'transparent',
                  color: interval === 'yearly' ? '#ffffff' : '#64748B',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Yearly</span>
                <span
                  style={{
                    background: '#10B981',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '999px',
                  }}
                >
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Currency Toggle */}
          <div style={{ marginTop: '0.75rem' }}>
            <CurrencySelector value={currency} onChange={setCurrency} />
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {PRICING_PLANS.filter((p) => p.id !== 'free').map((p) => {
            const isSelected = selectedPlan === p.id;
            const price = p.prices[currency];
            const isYearly = interval === 'yearly';

            const displayAmount = isYearly
              ? price.monthlyEquivalentFormatted
              : price.formatted;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                style={{
                  border: isSelected ? '2px solid #0B1F3A' : '1px solid #E2E8F0',
                  background: isSelected ? 'var(--bg-surface-muted, #F8FAFC)' : '#ffffff',
                  borderRadius: 'var(--radius-xl, 16px)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                {p.isRecommended && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#F59E0B',
                      color: '#ffffff',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Recommended
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0B1F3A' }}>{p.name}</span>
                    {p.id === 'pro' ? <Zap size={16} color="#F59E0B" /> : <Crown size={16} color="#6366F1" />}
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A' }}>{displayAmount}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}> {isYearly ? '/ mo (billed yearly)' : '/ month'}</span>
                  </div>

                  {isYearly && (
                    <div style={{ fontSize: '0.6875rem', color: '#047857', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Percent size={11} />
                      <span>{price.yearlyFormatted} (20% OFF)</span>
                    </div>
                  )}

                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '1rem', lineHeight: 1.4, minHeight: '34px' }}>
                    {p.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.6875rem' }}>
                    {p.features.slice(0, 6).map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#334155' }}>
                        <Check size={12} color="#10B981" strokeWidth={3} />
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md, 8px)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isSelected ? '#0B1F3A' : '#F1F5F9',
                      color: isSelected ? '#ffffff' : '#475569',
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-xl, 16px)',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1F3A', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldCheck size={16} color="#10B981" />
              <span>Instant Activation • Cancel Anytime</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Selected: <strong>{currentPlanConfig.name} ({interval === 'yearly' ? `${currentPrice.yearlyFormatted} (20% OFF)` : `${currentPrice.formatted}/month`})</strong>
            </p>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.625rem 1.5rem', fontWeight: 700 }}
          >
            <span>{loading ? 'Processing...' : `Subscribe to ${currentPlanConfig.name}`}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

