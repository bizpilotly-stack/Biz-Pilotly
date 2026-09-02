import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { BRAND_NAME } from '../../constants/brand';
import { useAuth } from '../../contexts/AuthContext';
import { SEO } from '../../components/common/SEO';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Determine redirect destination if user was redirected from a protected route
  const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';

  // Detect OAuth error parameters in URL
  React.useEffect(() => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Direct Supabase authentication
      const { user, error } = await signIn(cleanEmail, password);
      if (error) {
        const errorLower = error.message.toLowerCase();
        if (
          errorLower.includes('invalid login credentials') ||
          errorLower.includes('user not found') ||
          errorLower.includes('invalid grant')
        ) {
          showToast('Invalid email or password. Please verify your credentials or sign up if you do not have an account.', 'error');
        } else if (errorLower.includes('email not confirmed')) {
          showToast('Please verify your email address before signing in.', 'info');
        } else if (errorLower.includes('fetch') || errorLower.includes('network')) {
          showToast('Network error: Unable to reach authentication service. Please check your connection.', 'error');
        } else {
          showToast(error.message || 'Sign in failed. Please try again.', 'error');
        }
        return;
      }

      if (user) {
        showToast('Welcome back! Signed in successfully.', 'success');
        navigate(fromPath, { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        showToast('Connection failed: Unable to connect to authentication server.', 'error');
      } else {
        showToast(msg || 'An unexpected connection error occurred.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    sessionStorage.setItem('bizpilotly_auth_intent', 'login');
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        showToast(error.message || 'Google sign in failed. Ensure Google OAuth is enabled in Supabase.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to initialize Google authentication.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showToast('Please enter your email address first, then click Forgot password.', 'info');
      return;
    }
    try {
      const { error } = await resetPassword(email.trim().toLowerCase());
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast(`Password reset link sent to ${email}. Check your inbox!`, 'success');
      }
    } catch {
      showToast('Failed to send password reset request.', 'error');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--bg-app)' }}>
      <SEO
        title={`Sign In to Your Workspace | ${BRAND_NAME}`}
        description={`Log in to access your ${BRAND_NAME} business dashboard, client directory, and invoices.`}
        canonical="https://bizpilotly.com/login"
      />

      <div style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand-black)', color: '#ffffff', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Layers size={22} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', margin: 0 }}>
            Sign In
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            Access your tools, client ledgers, and documents.
          </p>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
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
          <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        <form onSubmit={handleLogin}>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
                Password <span className="required">*</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', color: 'var(--brand-navy-600)', cursor: 'pointer', fontWeight: 600 }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
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

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <span>Sign In to Workspace</span>
            <ArrowRight size={16} />
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
          Don't have an account yet?{' '}
          <Link to="/signup" style={{ color: 'var(--brand-navy-600)', fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
