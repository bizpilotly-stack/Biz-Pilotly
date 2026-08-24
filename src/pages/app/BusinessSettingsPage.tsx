import React, { useState } from 'react';
import {
  Building,
  Save,
  DollarSign,
  FileText,
  CreditCard,
} from 'lucide-react';
import { INITIAL_SETTINGS } from '../../mock/settings';
import { CURRENCIES, BRAND_NAME } from '../../constants/brand';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';

export const BusinessSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Business settings saved successfully!', 'success');
  };

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
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#1d4ed8" />
              <span>Bank Settlement Details (Appears on Invoices)</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Bank Institution Name"
              value={settings.bankDetails.bankName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, bankName: e.target.value },
                })
              }
            />
            <Input
              label="Account Beneficiary Name"
              value={settings.bankDetails.accountName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, accountName: e.target.value },
                })
              }
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Account / IBAN Number"
              value={settings.bankDetails.accountNumber}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, accountNumber: e.target.value },
                })
              }
            />
            <Input
              label="Routing Code / SWIFT / BIC"
              value={settings.bankDetails.routingCode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, routingCode: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button type="submit" variant="primary" size="lg">
            <Save size={16} />
            <span>Save All Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
