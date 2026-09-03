import React, { useState, useEffect } from 'react';
import { User as UserIcon, Lock, Bell, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';
import { supabase } from '../../services/supabase';

export const AccountSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const initials = (name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name, name },
      });
      if (error) throw error;
      showToast('Personal profile information updated successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      showToast('Please enter a new password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      showToast('Password updated successfully!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <SEO
        title={`Account Profile | ${BRAND_NAME}`}
        description="Manage your personal administrator profile, credentials, and notification preferences."
      />

      <PageHeader
        title="Profile & Account"
        description="Manage your personal administrator credentials, login email, and notification preferences."
      />

      <div style={{ maxWidth: '840px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Profile Overview Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #071527 100%)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C9A227 0%, #F59E0B 100%)',
                  color: '#0B1F3A',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(201, 162, 39, 0.4)',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {name || 'Business Administrator'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px' }}>
                  <Mail size={13} />
                  <span>{email || 'admin@bizpilotly.com'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <ShieldCheck size={13} />
                <span>Verified Account</span>
              </span>
              <span className="badge badge-neutral" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '0.75rem' }}>
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserIcon size={18} color="#2563EB" />
              <span>Personal Information</span>
            </h3>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <Input
                label="Full Legal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
              />
              <div>
                <Input
                  label="Authentication Email"
                  type="email"
                  value={email}
                  disabled
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Managed securely through your Supabase account.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button type="submit" variant="primary" size="sm" isLoading={profileLoading}>
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="#2563EB" />
              <span>Security & Credentials</span>
            </h3>
          </div>

          <form onSubmit={handleChangePassword}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <Input
                label="New Password"
                type="password"
                placeholder="New password (6+ characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button type="submit" variant="secondary" size="sm" isLoading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#2563EB" />
              <span>Notification Preferences</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={paymentAlerts}
                onChange={(e) => setPaymentAlerts(e.target.checked)}
              />
              <div>
                <strong>Payment Confirmation Alerts</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get notified immediately when a client processes an invoice payment.</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
              <div>
                <strong>Overdue Invoice Reminders</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily notifications for clients who have passed payment due terms.</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
              />
              <div>
                <strong>Weekly Profit & Revenue Digest</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>A concise summary of weekly net billings and expenditures.</p>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => showToast('Notification preferences updated.', 'success')}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
