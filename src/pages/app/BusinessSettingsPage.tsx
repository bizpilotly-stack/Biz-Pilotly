import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertTriangle,
  ShieldAlert,
  Download,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import { DigitalSignatureCanvas } from '../../components/documents/DigitalSignatureCanvas';
import { BusinessSettings } from '../../types';
import { businessService } from '../../services/businessService';
import { documentService } from '../../services/documentService';
import { clientService } from '../../services/clientService';
import { expenseService } from '../../services/expenseService';
import { authService } from '../../services/authService';
import { Modal } from '../../components/common/Modal';
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
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resolvingBank, setResolvingBank] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('NG');
  const [isCustomBankMode, setIsCustomBankMode] = useState<boolean>(false);
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDocumentsCSV = async () => {
    try {
      const docs = await documentService.getDocuments();
      const headers = ['Doc_Number', 'Type', 'Title', 'Client_Name', 'Client_Email', 'Date', 'Due_Date', 'Subtotal', 'Tax', 'Discount', 'Total', 'Currency', 'Status'];
      const rows = docs.map((d) => [
        d.documentNumber,
        d.type,
        `"${(d.title || '').replace(/"/g, '""')}"`,
        `"${(d.client?.name || '').replace(/"/g, '""')}"`,
        `"${(d.client?.email || '').replace(/"/g, '""')}"`,
        d.date,
        d.dueDate || d.validUntil || '',
        d.subtotal || 0,
        d.taxAmount || 0,
        d.discountAmount || 0,
        d.total || 0,
        d.currency || 'USD',
        d.status,
      ]);
      downloadCsv(`bizpilotly-documents-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      showToast('✓ Exported Documents Ledger CSV!', 'success');
    } catch {
      showToast('Error exporting documents CSV.', 'error');
    }
  };

  const handleExportClientsCSV = async () => {
    try {
      const clients = await clientService.getClients();
      const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Address', 'Total_Invoiced', 'Total_Paid', 'Balance'];
      const rows = clients.map((c) => [
        c.id,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.company || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${(c.address || '').replace(/"/g, '""')}"`,
        c.totalBilled ?? c.totalInvoiced ?? 0,
        c.amountPaid ?? c.totalPaid ?? 0,
        c.balance ?? c.outstandingBalance ?? 0,
      ]);
      downloadCsv(`bizpilotly-clients-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      showToast('✓ Exported Client Directory CSV!', 'success');
    } catch {
      showToast('Error exporting clients CSV.', 'error');
    }
  };

  const handleExportExpensesCSV = async () => {
    try {
      const expenses = await expenseService.getExpenses();
      const headers = ['ID', 'Title', 'Category', 'Vendor', 'Amount', 'Currency', 'Date', 'Payment_Method', 'Status'];
      const rows = expenses.map((e) => [
        e.id,
        `"${(e.title || '').replace(/"/g, '""')}"`,
        e.category,
        `"${(e.vendor || '').replace(/"/g, '""')}"`,
        e.amount,
        e.currency,
        e.date,
        e.paymentMethod || '',
        e.status,
      ]);
      downloadCsv(`bizpilotly-expenses-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      showToast('✓ Exported Expenses CSV!', 'success');
    } catch {
      showToast('Error exporting expenses CSV.', 'error');
    }
  };

  const handleExportFullJSON = async () => {
    try {
      const [docs, clients, expenses] = await Promise.all([
        documentService.getDocuments().catch(() => []),
        clientService.getClients().catch(() => []),
        expenseService.getExpenses().catch(() => []),
      ]);
      const backup = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        businessSettings: settings,
        documents: docs,
        clients,
        expenses,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bizpilotly-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✓ Full JSON Backup downloaded!', 'success');
    } catch {
      showToast('Error exporting JSON backup.', 'error');
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

          {/* Brand Color Theme Selection */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1F3A' }}>
                  Brand Primary Accent Color
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                  Choose your brand identity color. Applies to document headers, borders, invoice links, and client portal receipts.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={settings.primaryColor || '#0B1F3A'}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '2px solid #CBD5E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '2px',
                    background: '#ffffff',
                  }}
                  title="Choose custom color"
                />
                <input
                  type="text"
                  value={settings.primaryColor || '#0B1F3A'}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  style={{
                    width: '90px',
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    textTransform: 'uppercase',
                  }}
                  placeholder="#0B1F3A"
                />
              </div>
            </div>

            {/* Quick Preset Color Swatches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              {[
                { name: 'Navy', hex: '#0B1F3A' },
                { name: 'Royal Blue', hex: '#2563EB' },
                { name: 'Emerald', hex: '#059669' },
                { name: 'Gold', hex: '#C9A227' },
                { name: 'Imperial Purple', hex: '#7C3AED' },
                { name: 'Crimson', hex: '#E11D48' },
                { name: 'Teal', hex: '#0D9488' },
                { name: 'Slate Black', hex: '#0F172A' },
              ].map((swatch) => {
                const isSelected = (settings.primaryColor || '#0B1F3A').toLowerCase() === swatch.hex.toLowerCase();
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setSettings({ ...settings, primaryColor: swatch.hex })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '4px 10px',
                      background: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
                      border: isSelected ? `2px solid ${swatch.hex}` : '1px solid #E2E8F0',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? swatch.hex : '#475569',
                      boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: swatch.hex,
                        display: 'inline-block',
                      }}
                    />
                    <span>{swatch.name}</span>
                  </button>
                );
              })}
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

      {/* DATA EXPORT & BACKUP SUITE */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.125rem', color: '#0B1F3A', marginBottom: '0.5rem' }}>
            <Database size={20} color="#0B1F3A" />
            <span>Data Export & Business Backup Suite</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem', maxWidth: '700px' }}>
            Download offline copies of your business ledgers for accounting, tax audits, or full account backup.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              type="button"
              onClick={handleExportDocumentsCSV}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', gap: '6px', padding: '0.75rem 1rem' }}
            >
              <FileSpreadsheet size={16} color="#059669" />
              <span>Export Invoices (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleExportClientsCSV}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', gap: '6px', padding: '0.75rem 1rem' }}
            >
              <FileSpreadsheet size={16} color="#2563EB" />
              <span>Export Clients (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleExportExpensesCSV}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', gap: '6px', padding: '0.75rem 1rem' }}
            >
              <FileSpreadsheet size={16} color="#D97706" />
              <span>Export Expenses (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleExportFullJSON}
              className="btn btn-primary"
              style={{ justifyContent: 'center', gap: '6px', padding: '0.75rem 1rem', background: '#0B1F3A', borderColor: '#0B1F3A' }}
            >
              <Download size={16} />
              <span>Full JSON Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* DANGER ZONE: Account Deletion */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #FEE2E2' }}>
        <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontWeight: 800, fontSize: '1.125rem' }}>
                <ShieldAlert size={20} />
                <span>Danger Zone: Permanent Account Deletion</span>
              </div>
              <p style={{ color: '#7F1D1D', fontSize: '0.875rem', marginTop: '0.5rem', maxWidth: '600px', lineHeight: 1.5 }}>
                Permanently delete your account, business profile, all client contacts, documents, invoices, receipts, and payment records. This action cannot be reversed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText('');
                setDeleteModalOpen(true);
              }}
              className="btn btn-secondary"
              style={{ background: '#DC2626', color: '#ffffff', borderColor: '#B91C1C', fontWeight: 700 }}
            >
              <Trash2 size={16} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Delete Your Account"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#DC2626', background: '#FEE2E2', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
              <strong>Warning:</strong> All your data, documents, templates, and subscription settings will be permanently erased immediately.
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Please type <strong style={{ color: '#DC2626', fontFamily: 'var(--font-mono)' }}>DELETE</strong> to confirm permanent deletion:
          </p>

          <input
            type="text"
            className="form-input"
            placeholder="Type DELETE"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-mono)' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <button
              type="button"
              disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
              onClick={async () => {
                if (deleteConfirmText !== 'DELETE') return;
                setIsDeletingAccount(true);
                try {
                  await authService.deleteAccount();
                  showToast('Account successfully deleted. Goodbye!', 'info');
                  navigate('/login');
                } catch (err: any) {
                  showToast(err?.message || 'Error deleting account.', 'error');
                  setIsDeletingAccount(false);
                }
              }}
              className="btn btn-primary"
              style={{
                background: '#DC2626',
                borderColor: '#B91C1C',
                opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5,
                cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
              }}
            >
              {isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete Account'}
            </button>
          </div>
        </div>
      </Modal>

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
