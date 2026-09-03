import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  DollarSign,
  FileText,
  CreditCard,
  Globe,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  PenTool,
} from 'lucide-react';
import { DigitalSignatureCanvas } from '../../components/documents/DigitalSignatureCanvas';
import { BusinessSettings } from '../../types';
import { businessService } from '../../services/businessService';
import { CURRENCIES, BRAND_NAME } from '../../constants/brand';
import { getCountryProfile } from '../../constants/internationalBanks';
import { ALL_WORLD_COUNTRIES } from '../../constants/allCountries';
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
  const [isCustomBankMode, setIsCustomBankMode] = useState<boolean>(false);
  const [sigModalOpen, setSigModalOpen] = useState(false);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo file size must be under 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (settings && base64) {
        setSettings({ ...settings, logo: base64 });
        showToast('Logo uploaded! Click "Save Settings" to apply.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (settings) {
      setSettings({ ...settings, logo: '' });
      showToast('Logo removed.', 'info');
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

          {/* Friendly Logo Uploader */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '12px',
                  border: '2px dashed #CBD5E1',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt="Company Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <ImageIcon size={28} color="#94A3B8" />
                )}
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1F3A' }}>Official Studio Logo</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                  PNG, JPG, or SVG up to 2MB. Appears on all invoices, quotes & receipts.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: '#0B1F3A',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                <UploadCloud size={15} />
                <span>{settings.logo ? 'Change Logo' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {settings.logo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          {/* Official Default Digital E-Signature */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '12px',
                  border: '2px dashed #CBD5E1',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                {settings.signature?.image ? (
                  <img
                    src={settings.signature.image}
                    alt="Digital Signature"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                  />
                ) : (
                  <PenTool size={26} color="#94A3B8" />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1F3A' }}>Official Default E-Signature</div>
                  {settings.signature?.image && (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: '#D1FAE5', color: '#065F46', padding: '2px 6px', borderRadius: '4px' }}>
                      Auto-Applied
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                  {settings.signature?.image
                    ? `Signed by ${settings.signature.signerName}. Automatically applied to all new invoices, contracts & proposals.`
                    : 'Draw or type your legal digital signature once to auto-sign all documents.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <button
                type="button"
                onClick={() => setSigModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.375rem' }}
              >
                <PenTool size={14} />
                <span>{settings.signature?.image ? 'Edit Signature' : 'Add E-Signature'}</span>
              </button>

              {settings.signature?.image && (
                <button
                  type="button"
                  onClick={() => {
                    setSettings({ ...settings, signature: undefined });
                    showToast('Signature removed.', 'info');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
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
              label="Estimate Prefix"
              value={settings.estimatePrefix || 'EST'}
              onChange={(e) => setSettings({ ...settings, estimatePrefix: e.target.value })}
            />
            <Input
              label="Proposal Prefix"
              value={settings.proposalPrefix}
              onChange={(e) => setSettings({ ...settings, proposalPrefix: e.target.value })}
            />
            <Input
              label="Contract Prefix"
              value={settings.contractPrefix || 'CON'}
              onChange={(e) => setSettings({ ...settings, contractPrefix: e.target.value })}
            />
            <Input
              label="Receipt Prefix"
              value={settings.receiptPrefix}
              onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
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
                <span>Settlement Country & Banking System ({ALL_WORLD_COUNTRIES.length} Countries Available) <span className="required">*</span></span>
              </label>
              <select
                className="form-select"
                style={{ height: '42px', fontSize: '0.875rem', fontWeight: 600 }}
                value={selectedCountry}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  setSelectedCountry(newCountry);
                  setIsCustomBankMode(false);
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
                {ALL_WORLD_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                    Bank Institution ({countryProfile.countryName}) <span className="required">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = !isCustomBankMode;
                      setIsCustomBankMode(nextMode);
                      if (nextMode) {
                        handleBankOrAccountChange('', settings.bankDetails.accountNumber);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {isCustomBankMode ? '← Choose from Directory' : '✏️ Type Bank Manually'}
                  </button>
                </div>

                {isCustomBankMode ? (
                  <input
                    type="text"
                    className="form-input"
                    style={{ height: '42px', fontSize: '0.875rem' }}
                    placeholder={`Type your bank name in ${countryProfile.countryName} (e.g. Apex Community Bank)`}
                    value={settings.bankDetails.bankName || ''}
                    onChange={(e) =>
                      handleBankOrAccountChange(e.target.value, settings.bankDetails.accountNumber)
                    }
                    required
                  />
                ) : (
                  <select
                    className="form-select"
                    style={{ height: '42px', fontSize: '0.875rem' }}
                    value={settings.bankDetails.bankName || ''}
                    onChange={(e) => {
                      if (e.target.value === 'Other Bank') {
                        setIsCustomBankMode(true);
                        handleBankOrAccountChange('', settings.bankDetails.accountNumber);
                      } else {
                        handleBankOrAccountChange(e.target.value, settings.bankDetails.accountNumber);
                      }
                    }}
                    required
                  >
                    <option value="">-- Select Bank in {countryProfile.countryName} --</option>
                    {countryProfile.banks.map((b, idx) => (
                      <option key={`${b.name}-${idx}`} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                    <option value="Other Bank">✏️ Other / Type Bank Name Manually...</option>
                  </select>
                )}
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

      {/* Digital Signature Canvas Modal */}
      <DigitalSignatureCanvas
        isOpen={sigModalOpen}
        onClose={() => setSigModalOpen(false)}
        defaultSignerName={settings.name || ''}
        onSave={(sig) => {
          setSettings({
            ...settings,
            signature: sig,
          });
          showToast('✓ Official signature captured! Click "Save All Settings" to store.', 'success');
        }}
      />
    </div>
  );
};
