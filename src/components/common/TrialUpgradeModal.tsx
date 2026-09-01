import React, { useState } from 'react';
import { Sparkles, Check, Crown, Zap, Shield, ArrowRight, X } from 'lucide-react';
import { subscriptionService, UserTrialInfo } from '../../services/subscriptionService';
import { waitlistService } from '../../services/waitlistService';
import { useToast } from './Toast';
import { useAuth } from '../../contexts/AuthContext';

interface TrialUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialInfo: UserTrialInfo;
}

export const TrialUpgradeModal: React.FC<TrialUpgradeModalProps> = ({
  isOpen,
  onClose,
  trialInfo,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const plans = subscriptionService.getPlans();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  if (!isOpen) return null;

  const handleJoinWaitlist = async () => {
    const email = user?.email;
    if (!email) {
      showToast('Please sign in to join the waitlist.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await waitlistService.joinWaitlist({
        email,
        plan: selectedPlan === 'business' ? 'Business Suite' : 'Pro Tier (50% Early Bird)',
        source: 'trial_countdown_modal',
      });
      setHasJoined(true);
      showToast('🎉 You have locked in your 50% Early Bird Pro Discount!', 'success');
      setTimeout(() => {
        onClose();
        setHasJoined(false);
      }, 2000);
    } catch {
      showToast('Failed to join waitlist. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ background: '#ffffff', borderRadius: 'var(--radius-2xl)', maxWidth: '840px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', border: '1px solid var(--border-color)' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Sparkles size={14} />
            <span>{trialInfo.isInTrial ? `🎁 30-Day VIP All-Access Trial (${trialInfo.daysRemaining} Days Left)` : '⚠️ 30-Day Trial Expired • Upgrade Plan'}</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', margin: 0 }}>
            {trialInfo.isInTrial ? 'Keep Unlimited Power When Trial Ends' : 'Upgrade to Pro or Business Suite'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem', maxWidth: '540px', margin: '0.5rem auto 0' }}>
            Enjoy unrestricted invoicing, custom logo branding, and client ledgers. Lock in your <strong>50% Early Bird Discount</strong> before official payment launch.
          </p>
        </div>

        {/* 3 Tier Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              style={{
                background: selectedPlan === p.id ? '#F8FAFC' : '#ffffff',
                border: selectedPlan === p.id ? '2px solid #0B1F3A' : '1px solid #E2E8F0',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {p.highlighted && (
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#F59E0B', color: '#ffffff', fontSize: '0.625rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase' }}>
                  Most Popular
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0B1F3A' }}>{p.name}</span>
                  {p.id === 'pro' && <Zap size={16} color="#F59E0B" />}
                  {p.id === 'business' && <Crown size={16} color="#6366F1" />}
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B1F3A' }}>{p.priceNGN}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}> / {p.priceUSD} mo</span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem', minHeight: '36px', lineHeight: 1.4 }}>
                  {p.description}
                </p>

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.6875rem' }}>
                  {p.features.slice(0, 5).map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: f.included ? '#1e293b' : '#94a3b8' }}>
                      {f.included ? <Check size={12} color="#10B981" /> : <X size={12} color="#CBD5E1" />}
                      <span style={{ fontWeight: f.isNew ? 600 : 400 }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ width: '100%', textAlign: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 700, background: selectedPlan === p.id ? '#0B1F3A' : '#F1F5F9', color: selectedPlan === p.id ? '#ffffff' : '#475569' }}>
                  {selectedPlan === p.id ? 'Selected' : 'Select Plan'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-xl)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1F3A', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Shield size={16} color="#10B981" />
              <span>Zero-Risk 50% Early-Bird Reservation</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
              No credit card charged today. You will receive an exclusive 50% coupon on launch.
            </p>
          </div>

          <button
            onClick={handleJoinWaitlist}
            disabled={isSubmitting || hasJoined}
            className="btn btn-primary"
            style={{ padding: '0.625rem 1.5rem', fontWeight: 700 }}
          >
            <span>{hasJoined ? '✓ Reserved!' : isSubmitting ? 'Reserving...' : 'Lock In 50% Off Early Bird'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
