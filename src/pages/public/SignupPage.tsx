import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, ArrowRight, Eye, EyeOff, Check, X, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { PRICING_PLANS, PlanTier, PricingCurrency, getStoredCurrency } from '../../config/pricing';
import { PlanConfirmationModal } from '../../components/subscription/PlanConfirmationModal';
import { SEO } from '../../components/common/SEO';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { validatePasswordStrength } from '../../utils/formatters';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const planFromUrl = (searchParams.get('plan') || '').toLowerCase();
  const initialPlan: PlanTier = planFromUrl === 'free' || planFromUrl === 'pro' || planFromUrl === 'business'
    ? planFromUrl
    : 'pro';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanTier>(initialPlan);
  const [currency] = useState<PricingCurrency>(getStoredCurrency());
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Plan Confirmation Modal State
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ id: string; email?: string | null; name?: string } | null>(null);

  // Live password validation
  const pwdValidation = useMemo(() => validatePasswordStrength(password), [password]);

  // Sync plan if URL param changes
  useEffect(() => {
    if (planFromUrl === 'free' || planFromUrl === 'pro' || planFromUrl === 'business') {
      setSelectedPlanId(planFromUrl);
    }
  }, [planFromUrl]);

  // Detect OAuth error parameters in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorDesc = params.get('error_description') || hashParams.get('error_description');
    const errorCode = params.get('error') || hashParams.get('error');

    if (errorDesc) {
      showToast(decodeURIComponent(errorDesc.replace(/\+/g, ' ')), 'error');
    } else if (errorCode) {
      showToast(`Authentication error: ${errorCode}`, 'error');
    }
  }, [showToast]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail || !password) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    // Strict Password Validation
    if (!pwdValidation.isValid) {
      showToast(`Password must satisfy all security rules: ${pwdValidation.errors.join(', ')}.`, 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Guard check: Pre-check if this email is already registered in profiles or businesses
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        showToast('This email is already registered. Please sign in to your existing account.', 'error');
        setLoading(false);
        return;
      }

      const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingBusiness) {
        showToast('This email is already registered. Please sign in to your existing account.', 'error');
        setLoading(false);
        return;
      }

      // 2. Perform Supabase signup
      const { user, error } = await signUp(cleanEmail, password, name.trim());
      if (error) {
        const errorLower = error.message.toLowerCase();
        if (
          errorLower.includes('already registered') ||
          errorLower.includes('already exists') ||
          errorLower.includes('user already registered')
        ) {
          showToast('This email is already registered. Please sign in to your existing account.', 'error');
        } else if (errorLower.includes('fetch') || errorLower.includes('network')) {
          showToast('Network error: Unable to connect to authentication server. Check your connection.', 'error');
        } else {
          showToast(error.message || 'Failed to create account. Please try again.', 'error');
        }
        return;
      }

      if (user && user.identities && user.identities.length === 0) {
        showToast('This email is already registered. Please sign in instead.', 'error');
        return;
      }

      const userInfo = { id: user?.id || `user_${Date.now()}`, email: cleanEmail, name: name.trim() };

      // 3. Free Starter signup vs Paid Trial signup
      if (selectedPlanId === 'free') {
        showToast('Welcome to BizPilotly! Your free account is ready.', 'success');
        navigate('/app');
      } else {
        // Open the 15-day trial confirmation modal
        setCreatedUser(userInfo);
        setConfirmationModalOpen(true);
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        showToast('Connection failed: Unable to reach authentication service.', 'error');
      } else {
        showToast(msg || 'An unexpected error occurred during signup.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    sessionStorage.setItem('bizpilotly_auth_intent', 'signup');
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        showToast(error.message || 'Google sign up failed. Ensure Google OAuth is enabled in Supabase.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to initialize Google signup.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg-app)' }}>
      <SEO
        title={`Create Your Account | ${BRAND_NAME}`}
        description={`Sign up for free to access ${BRAND_NAME} business calculators, invoice builders, and client management tools.`}
        canonical="https://bizpilotly.com/signup"
      />

      <div style={{ width: '100%', maxWidth: '580px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl, 20px)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
        <div className="text-center" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand-black)', color: '#ffffff', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Layers size={22} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', margin: 0 }}>
            Create Your Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            Choose your plan to start with all financial calculators and document builders.
          </p>
        </div>

        {/* 3-Tier Plan Selector with 15-Day Free Trial Badges */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Sparkles size={14} color="#F59E0B" />
            <span>Select Your Starting Plan:</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
            {PRICING_PLANS.map((p) => {
              const isSelected = selectedPlanId === p.id;
              const price = p.prices[currency];

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  style={{
                    border: isSelected ? '2px solid #0B1F3A' : '1px solid #E2E8F0',
                    background: isSelected ? 'var(--bg-surface-muted, #F8FAFC)' : '#ffffff',
                    borderRadius: 'var(--radius-lg, 12px)',
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p.trialDays > 0 && (
                    <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#F59E0B', color: '#ffffff', fontSize: '0.5625rem', fontWeight: 800, padding: '1px 6px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                      15D Trial
                    </div>
                  )}
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#0B1F3A' }}>{p.name}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0B1F3A', marginTop: '2px' }}>{price.formatted}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>/ month</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem', padding: '0.75rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        <form onSubmit={handleSignup}>
          <Input
            label="Full Name / Studio Name"
            placeholder="e.g. Elena Rostova"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Work Email Address"
            type="email"
            placeholder="elena@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Password <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Live Password Checklist & Strength Bar */}
          {password.length > 0 && (
            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.875rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {pwdValidation.isValid ? <ShieldCheck size={14} color="#16a34a" /> : <ShieldAlert size={14} color="#d97706" />}
                  <span>Password Security:</span>
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: pwdValidation.score <= 2 ? '#dc2626' : pwdValidation.score <= 4 ? '#d97706' : '#16a34a' }}>
                  {pwdValidation.score <= 2 ? 'Weak' : pwdValidation.score <= 4 ? 'Medium' : 'Strong & Secure'}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.625rem' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(pwdValidation.score / 5) * 100}%`,
                    background: pwdValidation.score <= 2 ? '#ef4444' : pwdValidation.score <= 4 ? '#f59e0b' : '#10b981',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>

              {/* Requirement Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', fontSize: '0.6875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdValidation.hasMinLength ? '#16a34a' : '#64748b' }}>
                  {pwdValidation.hasMinLength ? <Check size={12} color="#16a34a" /> : <X size={12} color="#94a3b8" />}
                  <span>8+ characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdValidation.hasUppercase ? '#16a34a' : '#64748b' }}>
                  {pwdValidation.hasUppercase ? <Check size={12} color="#16a34a" /> : <X size={12} color="#94a3b8" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdValidation.hasLowercase ? '#16a34a' : '#64748b' }}>
                  {pwdValidation.hasLowercase ? <Check size={12} color="#16a34a" /> : <X size={12} color="#94a3b8" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdValidation.hasNumber ? '#16a34a' : '#64748b' }}>
                  {pwdValidation.hasNumber ? <Check size={12} color="#16a34a" /> : <X size={12} color="#94a3b8" />}
                  <span>Number (0-9)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdValidation.hasSpecialChar ? '#16a34a' : '#64748b', gridColumn: 'span 2' }}>
                  {pwdValidation.hasSpecialChar ? <Check size={12} color="#16a34a" /> : <X size={12} color="#94a3b8" />}
                  <span>Special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Confirm Password <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <span style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                Passwords do not match.
              </span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            disabled={password.length > 0 && (!pwdValidation.isValid || password !== confirmPassword)}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <span>
              {selectedPlanId === 'free'
                ? 'Create Free Account'
                : `Start 15-Day Free Trial (${selectedPlanId === 'pro' ? 'Professional' : 'Business Suite'})`}
            </span>
            <ArrowRight size={16} />
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand-navy-600)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Plan Confirmation Modal for 15-Day Trial */}
      {createdUser && selectedPlanId !== 'free' && (
        <PlanConfirmationModal
          isOpen={confirmationModalOpen}
          planTier={selectedPlanId as 'pro' | 'business'}
          currency={currency}
          user={createdUser}
          onConfirm={() => navigate('/app')}
          onCancel={() => navigate('/app')}
        />
      )}
    </div>
  );
};
