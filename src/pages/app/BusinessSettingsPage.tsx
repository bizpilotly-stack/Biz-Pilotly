import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  DollarSign,
  FileText,
  CreditCard,
  Globe,
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { businessService } from '../../services/businessService';
import { CURRENCIES, BRAND_NAME } from '../../constants/brand';
import { COUNTRIES_BANKING_PROFILES, getCountryProfile } from '../../constants/internationalBanks';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/common/Input';
import { bankResolutionService } from '../../services/bankResolutionService';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';

export const BusinessSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resolvingBank, setResolvingBank] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('NG');

  const countryProfile = getCountryProfile(selectedCountry);

  useEffect(() => {
    businessService.getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await businessService.updateSettings(settings);
      showToast('Business settings saved successfully!', 'success');
    } catch {
      showToast('Error saving business settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBankOrAccountChange = async (newBankName: string, newAccountNumber: string) => {
    if (!settings) return;
    const cleaned = newAccountNumber.replace(/\D/g, '').slice(0, 10);
    const updated = {
      ...settings,
      bankDetails: {
        ...settings.bankDetails,
        bankName: newBankName,
        accountNumber: cleaned,
      },
    };
    setSettings(updated);

    if (newBankName && cleaned.length === 10) {
      setResolvingBank(true);
      try {
        const res = await bankResolutionService.resolveAccountName(cleaned, newBankName);
        if (res.success && res.accountName) {
          setSettings((prev) =>
            prev
              ? {
                  ...prev,
                  bankDetails: {
                    ...prev.bankDetails,
                    accountName: res.accountName || prev.bankDetails.accountName,
                  },
                }
              : prev
          );
          showToast(`Account name verified: ${res.accountName}`, 'success');
        }
      } catch (err) {
        console.warn('Bank verification finished');
      } finally {
        setResolvingBank(false);
      }
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading business settings...
      </div>
    );
  }

  return (
    <div>
      <SEO
        title={`Business Settings | ${BRAND_NAME}`}
        description="Configure your studio business name, contact details, currency, default tax rates, and document prefixes."
      />

      <PageHeader
        title="Business Settings"
        description="Configure your official studio branding, billing currency, default tax rates, and document preferences."
      />

      <form onSubmit={handleSubmit} style={{ maxWidth: '840px' }}>
        {/* Business Identity */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="#1d4ed8" />
              <span>Studio & Entity Profile</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Legal Business / Freelancer Name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              required
            />
            <Input
              label="Professional Tagline"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Public Business Email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
            <Input
              label="Studio Physical Address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
            <Input
              label="Website URL"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
            />
          </div>

          <Input
            label="Tax Registration / VAT ID Number"
            value={settings.taxNumber}
            onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
          />
        </div>

        {/* Currency & Tax Defaults */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} color="#1d4ed8" />
              <span>Currency & Default Tax Configuration</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Primary Business Currency</label>
              <select
                className="form-select"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Default Sales Tax / VAT Rate (%)"
              type="number"
              min="0"
              max="100"
              value={settings.defaultTaxRate}
              onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Document Numbering & Preferences */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#1d4ed8" />
              <span>Document Numbering Prefixes</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
            <Input
              label="Invoice Prefix"
              value={settings.invoicePrefix}
              onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
            />
            <Input
              label="Quote Prefix"
              value={settings.quotePrefix}
              onChange={(e) => setSettings({ ...settings, quotePrefix: e.target.value })}
            />
            <Input
              label="Receipt Prefix"
              value={settings.receiptPrefix}
              onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
            />
            <Input
              label="Proposal Prefix"
              value={settings.proposalPrefix}
              onChange={(e) => setSettings({ ...settings, proposalPrefix: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default Payment Terms & Notice</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={settings.defaultPaymentTerms}
              onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Standard Thank-You Note on Documents</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={settings.defaultNotes}
              onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
            />
          </div>
        </div>

        {/* Bank & Settlement Details */}
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(to right, rgba(11, 31, 58, 0.04), transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(11, 31, 58, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B1F3A' }}>
                <CreditCard size={20} color="#0B1F3A" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--brand-black)' }}>
                  Bank Settlement & Payout Instructions
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Select your country to configure local bank details formatted precisely for your clients' payment transfers.
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Country Selector */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Globe size={15} color="#0B1F3A" />
                <span>Settlement Country & Banking System <span className="required">*</span></span>
              </label>
              <select
                className="form-select"
                style={{ height: '42px', fontSize: '0.875rem', fontWeight: 600 }}
                value={selectedCountry}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  setSelectedCountry(newCountry);
                  if (settings) {
                    setSettings({
                      ...settings,
                      bankDetails: {
                        ...settings.bankDetails,
                        bankName: '',
                        accountNumber: '',
                        routingCode: '',
                      },
                    });
                  }
                }}
              >
                {COUNTRIES_BANKING_PROFILES.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {c.flagEmoji} {c.countryName} ({c.currencyCode})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Bank Institution ({countryProfile.countryName}) <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  style={{ height: '42px', fontSize: '0.875rem' }}
                  value={settings.bankDetails.bankName || ''}
                  onChange={(e) =>
                    handleBankOrAccountChange(e.target.value, settings.bankDetails.accountNumber)
                  }
                  required
                >
                  <option value="">-- Select Bank in {countryProfile.countryName} --</option>
                  {countryProfile.banks.map((b, idx) => (
                    <option key={`${b.name}-${idx}`} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  <option value="Other Bank">Other / International Institution</option>
                </select>
              </div>

              <Input
                label="Account Beneficiary Name"
                placeholder="e.g. Adeyemi Creative Ltd / John Doe"
                value={settings.bankDetails.accountName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, accountName: e.target.value },
                  })
                }
                required
              />

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{countryProfile.accountNumberLabel} <span className="required">*</span></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {resolvingBank && (
                      <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                        🔍 Verifying...
                      </span>
                    )}
                    {settings.bankDetails.accountNumber && !resolvingBank && countryProfile.accountNumberLength && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: settings.bankDetails.accountNumber.length === countryProfile.accountNumberLength ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: settings.bankDetails.accountNumber.length === countryProfile.accountNumberLength ? '#10b981' : '#f59e0b',
                        }}
                      >
                        {settings.bankDetails.accountNumber.length === countryProfile.accountNumberLength
                          ? `✓ ${countryProfile.accountNumberLength} Digits Valid`
                          : `${settings.bankDetails.accountNumber.length}/${countryProfile.accountNumberLength} digits`}
                      </span>
                    )}
                  </div>
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ height: '42px', fontSize: '0.9375rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                  placeholder={countryProfile.accountNumberPlaceholder}
                  maxLength={countryProfile.accountNumberLength || 35}
                  value={settings.bankDetails.accountNumber}
                  onChange={(e) =>
                    handleBankOrAccountChange(settings.bankDetails.bankName, e.target.value)
                  }
                  required
                />
              </div>

              <Input
                label={countryProfile.routingCodeLabel}
                placeholder={countryProfile.routingCodePlaceholder}
                value={settings.bankDetails.routingCode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, routingCode: e.target.value },
                  })
                }
              />
            </div>

            {/* Live Visual Preview Card */}
            {(settings.bankDetails.bankName || settings.bankDetails.accountNumber) && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-surface-muted)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                    Live Preview on Invoices ({countryProfile.flagEmoji} {countryProfile.countryName})
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {settings.bankDetails.bankName || 'Selected Bank'} • <span style={{ fontFamily: 'var(--font-mono)' }}>{settings.bankDetails.accountNumber || '0000000000'}</span> • {settings.bankDetails.accountName || 'Beneficiary'}
                  </div>
                </div>
                <span className="badge badge-success">Active on Invoices</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button type="submit" variant="primary" size="lg" isLoading={saving}>
            <Save size={16} />
            <span>Save All Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
