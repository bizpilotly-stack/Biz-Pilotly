import React, { useState } from 'react';
import { User, Lock, Bell } from 'lucide-react';
import { authService } from '../../services/authService';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const AccountSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const user = authService.getCurrentUser();

  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [email, setEmail] = useState(user?.email || 'alex@studionorth.co');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Personal profile information updated successfully!', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please enter both current and new password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    showToast('Password updated successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div>
      <SEO
        title={`Account Settings | ${BRAND_NAME}`}
        description="Manage your personal profile, credentials, and notification preferences."
      />

      <PageHeader
        title="Account Settings"
        description="Manage your personal administrator credentials, login email, and notification preferences."
      />

      <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Personal Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="#1d4ed8" />
              <span>Personal Profile</span>
            </h3>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Login Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="submit" variant="secondary" size="sm">
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} color="#1d4ed8" />
              <span>Security & Password</span>
            </h3>
          </div>

          <form onSubmit={handleChangePassword}>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="New Password"
                type="password"
                placeholder="New password (8+ characters)"
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="submit" variant="secondary" size="sm">
                Update Password
              </Button>
            </div>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#1d4ed8" />
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
              variant="primary"
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
