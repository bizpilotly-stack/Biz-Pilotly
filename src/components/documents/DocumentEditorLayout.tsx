import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  Save,
  Download,
  Building,
  User,
  FileText,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  BusinessDocument,
  DocumentType,
  LineItem,
  documentService,
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from '../../services/documentService';
import { clientService } from '../../services/clientService';
import { pdfService } from '../../services/pdf';
import { NIGERIAN_BANKS } from '../../constants/nigerianBanks';
import { Client } from '../../types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { SEO } from '../common/SEO';

interface DocumentEditorProps {
  documentType: DocumentType;
}

export const DocumentEditorLayout: React.FC<DocumentEditorProps> = ({
  documentType,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');
  const docsBase = isApp ? '/app/documents' : '/documents';

  const { showToast } = useToast();
  const meta = documentService.getMeta(documentType);
  const jsonLd = documentService.getJsonLd(documentType);

  // Initialize from saved draft or default template
  const [doc, setDoc] = useState<BusinessDocument>(() =>
    documentService.loadDraft(documentType)
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [draftSaved, setDraftSaved] = useState<boolean>(true);
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const saveTimeoutRef = useRef<number | null>(null);

  // Auto-fetch database sequential document number for authenticated users
  useEffect(() => {
    if (user || isApp) {
      documentService.getNextDocumentNumber(documentType).then((nextNum) => {
        setDoc((prev) => {
          // Only replace if document is a fresh unsaved draft
          if (!prev.id && prev.documentNumber.endsWith('-0001')) {
            return { ...prev, documentNumber: nextNum };
          }
          return prev;
        });
      }).catch(console.error);
    }
  }, [documentType, user, isApp]);

  // Load clients asynchronously from service boundary
  useEffect(() => {
    clientService.getClients().then(setClients).catch(console.error);
  }, []);

  // Auto-save draft on doc state changes (debounced by 300ms)
  useEffect(() => {
    setDraftSaved(false);
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      documentService.saveDraft(documentType, doc);
      setDraftSaved(true);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [doc, documentType]);

  // Recalculate totals whenever items, taxRate, or discountRate change
  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = doc.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(value) : item.quantity;
          const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updated.amount = documentService.calculateLineItem(qty, price);
        }
        return updated;
      }
      return item;
    });

    const totals = documentService.calculateTotals(updatedItems, doc.taxRate, doc.discountRate);
    setDoc((prev) => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now().toString(36)}`,
      description: 'Additional Deliverable / Scope item',
      quantity: 1,
      unitPrice: 500,
      amount: 500,
    };
    const updatedItems = [...doc.items, newItem];
    const totals = documentService.calculateTotals(updatedItems, doc.taxRate, doc.discountRate);
    setDoc((prev) => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (doc.items.length <= 1) {
      showToast('Document must contain at least one line item.', 'error');
      return;
    }
    const updatedItems = doc.items.filter((item) => item.id !== id);
    const totals = documentService.calculateTotals(updatedItems, doc.taxRate, doc.discountRate);
    setDoc((prev) => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));
  };

  const handleTaxChange = (rate: number) => {
    const safeRate = Math.max(0, Math.min(100, Number(rate) || 0));
    const totals = documentService.calculateTotals(doc.items, safeRate, doc.discountRate);
    setDoc((prev) => ({
      ...prev,
      taxRate: safeRate,
      ...totals,
    }));
  };

  const handleDiscountChange = (rate: number) => {
    const safeRate = Math.max(0, Math.min(100, Number(rate) || 0));
    const totals = documentService.calculateTotals(doc.items, doc.taxRate, safeRate);
    setDoc((prev) => ({
      ...prev,
      discountRate: safeRate,
      ...totals,
    }));
  };

  const handleCurrencyChange = (currencyCode: string) => {
    const selected = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
    if (selected) {
      setDoc((prev) => ({
        ...prev,
        currency: selected.code,
        currencySymbol: selected.symbol,
      }));
    }
  };

  const handleClientSelect = (clientId: string) => {
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setDoc((prev) => ({
        ...prev,
        client: {
          id: found.id,
          name: found.name,
          company: found.company,
          email: found.email,
          phone: found.phone,
          address: found.address,
        },
      }));
      showToast(`Loaded details for ${found.name}`, 'info');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset this document to its initial default template? Current edits will be cleared.')) {
      const fresh = documentService.clearDraft(documentType);
      setDoc(fresh);
      setValidationErrors({});
      showToast('Document reset to initial template.', 'info');
    }
  };

  const handleSaveToDashboard = async () => {
    const validation = documentService.validate(doc);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast('Please fix required validation fields before saving.', 'error');
      return;
    }
    setValidationErrors({});
    setIsSavingToCloud(true);
    try {
      const saved = await documentService.saveDocument(doc);
      setDoc(saved);
      showToast(`Document #${saved.documentNumber} successfully saved to dashboard!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error saving document to database.', 'error');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleDownloadDirectPdf = async () => {
    const validation = documentService.validate(doc);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast('Please fix required validation fields before downloading.', 'error');
      return;
    }
    setValidationErrors({});
    try {
      showToast('Generating vector PDF...', 'info');
      await pdfService.downloadDocumentLocally(doc);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error generating PDF.', 'error');
    }
  };

  const handlePrint = () => {
    const validation = documentService.validate(doc);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast('Please fix required validation fields before printing.', 'error');
      return;
    }
    setValidationErrors({});
    window.print();
  };

  return (
    <div className="section-py-sm">
      <SEO
        title={meta.seoTitle}
        description={meta.seoDescription}
        canonical={`https://bizpilotly.com${meta.route}`}
        jsonLd={jsonLd}
      />

      <div className="container-fluid">
        {/* Page Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <Link to={docsBase} style={{ color: 'var(--brand-navy-600)' }}>Documents</Link>
              <span>/</span>
              <span style={{ color: 'var(--text-primary)' }}>{meta.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.025em' }}>
                {meta.title} Builder
              </h1>
              <span className="badge badge-gold">{meta.badgeLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: draftSaved ? 'var(--brand-navy-600)' : 'var(--text-muted)' }}>
              {draftSaved ? <CheckCircle2 size={14} color="#0B1F3A" /> : <Sparkles size={14} />}
              <span>{draftSaved ? 'Draft saved in browser' : 'Saving draft changes...'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm" onClick={handleReset} title="Reset to default document template">
              <RotateCcw size={15} />
              <span>Reset</span>
            </Button>
            {user && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveToDashboard}
                isLoading={isSavingToCloud}
                title="Save document to your Supabase business dashboard"
              >
                <Save size={15} />
                <span>Save to Dashboard</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleDownloadDirectPdf} title="Generate and download vector PDF file">
              <Download size={15} />
              <span>Download PDF</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print / Browser PDF</span>
            </Button>
          </div>
        </div>

        {/* Split Grid: Left Editor | Right Live Sheet */}
        <div className="doc-builder-container">
          {/* =================================================================
             LEFT EDITOR FORM
             ================================================================= */}
          <div className="doc-editor-column">
            {/* Header Info */}
            <div className="doc-section-title">
              <FileText size={18} color="#0B1F3A" />
              <span>Document Identification</span>
            </div>

            <div className="doc-form-row">
              <Input
                label="Document Scope / Title"
                value={doc.title}
                onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                required
              />
              <Input
                label="Document Reference #"
                value={doc.documentNumber}
                onChange={(e) => setDoc({ ...doc, documentNumber: e.target.value })}
                error={validationErrors['documentNumber']}
                required
              />
            </div>

            <div className="doc-form-row-3">
              <Input
                label="Issue Date"
                type="date"
                value={doc.date}
                onChange={(e) => setDoc({ ...doc, date: e.target.value })}
                error={validationErrors['date']}
                required
              />

              {documentType === 'invoice' && (
                <Input
                  label="Payment Due Date"
                  type="date"
                  value={doc.dueDate || ''}
                  onChange={(e) => setDoc({ ...doc, dueDate: e.target.value })}
                />
              )}

              {(documentType === 'quote' || documentType === 'proposal') && (
                <Input
                  label="Quote Valid Until"
                  type="date"
                  value={doc.validUntil || ''}
                  onChange={(e) => setDoc({ ...doc, validUntil: e.target.value })}
                />
              )}

              {documentType === 'receipt' && (
                <Input
                  label="Transaction Ref / TXN ID"
                  value={doc.paymentReference || ''}
                  onChange={(e) => setDoc({ ...doc, paymentReference: e.target.value })}
                  placeholder="e.g. TXN-89214"
                />
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="currencySelect">Currency</label>
                <select
                  id="currencySelect"
                  className="form-select"
                  value={doc.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Proposal Specific Narrative Overview */}
            {documentType === 'proposal' && (
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Project Executive Overview / Scope Narrative</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={doc.projectOverview || ''}
                  onChange={(e) => setDoc({ ...doc, projectOverview: e.target.value })}
                  placeholder="Outline the client goals, strategic approach, and high-level milestones..."
                />
              </div>
            )}

            {/* Business (Sender) Section */}
            <div className="doc-section-title" style={{ marginTop: '1.5rem' }}>
              <Building size={18} color="#0B1F3A" />
              <span>Your Business Details (Issuer)</span>
            </div>

            <div className="doc-form-row">
              <Input
                label="Business / Freelancer Name"
                value={doc.business.name}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    business: { ...doc.business, name: e.target.value },
                  })
                }
                error={validationErrors['business.name']}
                required
              />
              <Input
                label="Business Email"
                type="email"
                value={doc.business.email}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    business: { ...doc.business, email: e.target.value },
                  })
                }
                error={validationErrors['business.email']}
              />
            </div>

            <div className="doc-form-row">
              <Input
                label="Business Address"
                value={doc.business.address || ''}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    business: { ...doc.business, address: e.target.value },
                  })
                }
                placeholder="Studio address or city / state"
              />
              <Input
                label="Tax / VAT Registration ID"
                value={doc.business.taxNumber || ''}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    business: { ...doc.business, taxNumber: e.target.value },
                  })
                }
                placeholder="Optional VAT or EIN number"
              />
            </div>

            {/* Client (Recipient) Section */}
            <div className="doc-section-title" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="#0B1F3A" />
                <span>Client Information (Recipient)</span>
              </div>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                onChange={(e) => handleClientSelect(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Load from Directory...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>

            <div className="doc-form-row">
              <Input
                label="Client Contact Name"
                value={doc.client.name}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    client: { ...doc.client, name: e.target.value },
                  })
                }
                error={validationErrors['client.name']}
                required
              />
              <Input
                label="Client Company / Organization"
                value={doc.client.company || ''}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    client: { ...doc.client, company: e.target.value },
                  })
                }
              />
            </div>

            <div className="doc-form-row">
              <Input
                label="Client Email"
                type="email"
                value={doc.client.email}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    client: { ...doc.client, email: e.target.value },
                  })
                }
                error={validationErrors['client.email']}
              />
              <Input
                label="Client Address"
                value={doc.client.address || ''}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    client: { ...doc.client, address: e.target.value },
                  })
                }
              />
            </div>

            {/* Line Items Editor */}
            <div className="doc-section-title" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Itemized Deliverables & Pricing</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="line-items-editor">
              <div className="line-item-header">
                <div>Description</div>
                <div>Qty</div>
                <div>Rate ({doc.currencySymbol})</div>
                <div>Amount ({doc.currencySymbol})</div>
                <div></div>
              </div>

              {doc.items.map((item, idx) => (
                <div key={item.id} className="line-item-row">
                  <input
                    className="form-input"
                    placeholder="Deliverable description..."
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    aria-label={`Item ${idx + 1} description`}
                  />
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    aria-label={`Item ${idx + 1} quantity`}
                  />
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="10"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                    aria-label={`Item ${idx + 1} unit price`}
                  />
                  <input
                    className="form-input"
                    readOnly
                    value={formatCurrencyAmount(item.amount, doc.currency, doc.currencySymbol)}
                    style={{ background: 'var(--bg-surface-muted)', fontWeight: 600 }}
                    aria-label={`Item ${idx + 1} total amount`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: '#ef4444' }}
                    title="Remove item"
                    aria-label={`Remove item ${idx + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Adjustments (Tax & Discount) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="taxRateInput">Tax / VAT Rate (%)</label>
                <input
                  id="taxRateInput"
                  type="number"
                  className="form-input"
                  min="0"
                  max="100"
                  value={doc.taxRate}
                  onChange={(e) => handleTaxChange(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="discountRateInput">Discount Allowance (%)</label>
                <input
                  id="discountRateInput"
                  type="number"
                  className="form-input"
                  min="0"
                  max="100"
                  value={doc.discountRate}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Notes & Payment Instructions */}
            <div className="doc-section-title">
              <CreditCard size={18} color="#0B1F3A" />
              <span>Notes & Settlement Instructions</span>
            </div>

            {documentType === 'receipt' && (
              <div className="form-group">
                <label className="form-label">Payment Method Used</label>
                <select
                  className="form-select"
                  value={doc.paymentMethod || 'Bank Transfer'}
                  onChange={(e) => setDoc({ ...doc, paymentMethod: e.target.value })}
                >
                  <option value="Bank Transfer">Bank Transfer / Direct Wire</option>
                  <option value="Credit Card">Credit Card / Debit</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Cash">Cash</option>
                  <option value="Stripe">Stripe Checkout</option>
                  <option value="Other">Other / Cheque</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Client Notes & Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={doc.notes || ''}
                onChange={(e) => setDoc({ ...doc, notes: e.target.value })}
                placeholder="Notes shown on printable document..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Legal Terms & Settlement Terms</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={doc.terms || ''}
                onChange={(e) => setDoc({ ...doc, terms: e.target.value })}
                placeholder="Payment terms, late fee provisions, or turnaround timeline..."
              />
            </div>

            {/* Bank Details on Document */}
            <div className="form-group" style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginTop: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} color="#0B1F3A" />
                <span>Bank Settlement Details (Appears on Document)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Bank Name (Nigeria)</label>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.8125rem' }}
                    value={doc.paymentDetails?.bankName || ''}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        paymentDetails: {
                          ...doc.paymentDetails,
                          bankName: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="">-- Select Bank --</option>
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                    <option value="Other Bank">Other / International Bank</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Beneficiary Name</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: '0.8125rem' }}
                    placeholder="Account Name"
                    value={doc.paymentDetails?.accountName || ''}
                    onChange={(e) =>
                      setDoc({
                        ...doc,
                        paymentDetails: {
                          ...doc.paymentDetails,
                          accountName: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>NUBAN Account Number (10 Digits)</span>
                  {doc.paymentDetails?.accountNumber && (
                    <span style={{ color: doc.paymentDetails.accountNumber.length === 10 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                      {doc.paymentDetails.accountNumber.length}/10 digits
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}
                  placeholder="e.g. 0123456789"
                  maxLength={10}
                  value={doc.paymentDetails?.accountNumber || ''}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setDoc({
                      ...doc,
                      paymentDetails: {
                        ...doc.paymentDetails,
                        accountNumber: cleaned,
                      },
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* =================================================================
             RIGHT COLUMN: LIVE PRINTABLE PAPER PREVIEW
             ================================================================= */}
          <div className="doc-preview-column">
            <div className="doc-preview-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                <Sparkles size={16} color="#C9A227" />
                <span>Live Document Preview</span>
              </div>
              <span className="badge badge-neutral">A4 / Print Proportions</span>
            </div>

            <div className="doc-preview-sheet-wrapper">
              <div className="doc-paper-sheet" id="printableDocument">
                {/* Sheet Top Header */}
                <div>
                  <div className="doc-sheet-header">
                    <div>
                      <div className="doc-sheet-badge">{documentType}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                        #{doc.documentNumber}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#090d16' }}>{doc.business.name}</div>
                      {doc.business.tagline && <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.business.tagline}</div>}
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{doc.business.email}</div>
                      {doc.business.address && <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.business.address}</div>}
                      {doc.business.taxNumber && <div style={{ fontSize: '10px', color: '#94a3b8' }}>Tax ID: {doc.business.taxNumber}</div>}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="doc-sheet-meta-grid">
                    <div className="doc-sheet-meta-block">
                      <h4>Billed To / Recipient:</h4>
                      <p>
                        <strong>{doc.client.name}</strong><br />
                        {doc.client.company && <span>{doc.client.company}<br /></span>}
                        {doc.client.email && <span>{doc.client.email}<br /></span>}
                        {doc.client.address && <span>{doc.client.address}</span>}
                      </p>
                    </div>

                    <div className="doc-sheet-meta-block" style={{ textAlign: 'right' }}>
                      <h4>Document Details:</h4>
                      <p>
                        <strong>Issue Date:</strong> {doc.date}<br />
                        {doc.dueDate && <span><strong>Due Date:</strong> {doc.dueDate}<br /></span>}
                        {doc.validUntil && <span><strong>Valid Until:</strong> {doc.validUntil}<br /></span>}
                        {doc.paymentMethod && <span><strong>Method:</strong> {doc.paymentMethod}<br /></span>}
                        {doc.paymentReference && <span><strong>Ref:</strong> {doc.paymentReference}<br /></span>}
                        <strong>Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#0B1F3A' }}>{doc.status}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    Project Scope: {doc.title}
                  </div>

                  {/* Optional Proposal Narrative */}
                  {doc.projectOverview && (
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#334155', marginBottom: '18px', lineHeight: 1.5 }}>
                      <strong>Executive Summary:</strong> {doc.projectOverview}
                    </div>
                  )}

                  {/* Table of Items */}
                  <table className="doc-sheet-table">
                    <thead>
                      <tr>
                        <th style={{ width: '55%' }}>Description</th>
                        <th style={{ width: '12%', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '15%', textAlign: 'right' }}>Rate</th>
                        <th style={{ width: '18%', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.items.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.description}</strong></td>
                          <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrencyAmount(item.unitPrice, doc.currency, doc.currencySymbol)}</td>
                          <td style={{ textAlign: 'right' }}><strong>{formatCurrencyAmount(item.amount, doc.currency, doc.currencySymbol)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Summary */}
                  <div className="doc-sheet-totals">
                    <div className="doc-totals-row">
                      <span>Subtotal:</span>
                      <span>{formatCurrencyAmount(doc.subtotal, doc.currency, doc.currencySymbol)}</span>
                    </div>
                    {doc.discountAmount > 0 && (
                      <div className="doc-totals-row" style={{ color: '#b91c1c' }}>
                        <span>Discount ({doc.discountRate}%):</span>
                        <span>-{formatCurrencyAmount(doc.discountAmount, doc.currency, doc.currencySymbol)}</span>
                      </div>
                    )}
                    {doc.taxAmount > 0 && (
                      <div className="doc-totals-row">
                        <span>Tax / VAT ({doc.taxRate}%):</span>
                        <span>+{formatCurrencyAmount(doc.taxAmount, doc.currency, doc.currencySymbol)}</span>
                      </div>
                    )}
                    <div className="doc-totals-row grand-total">
                      <span>Total Amount:</span>
                      <span>{formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Terms & Instructions */}
                <div className="doc-sheet-footer">
                  {doc.notes && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', color: '#475569', marginBottom: '2px' }}>Notes</div>
                      <div>{doc.notes}</div>
                    </div>
                  )}

                  {doc.paymentDetails && (doc.paymentDetails.bankName || doc.paymentDetails.accountNumber) && (
                    <div className="doc-sheet-bank-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px', fontSize: '11px', color: '#1e293b' }}>
                      <div style={{ fontWeight: 700, color: '#090d16', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '10px' }}>Direct Bank Settlement Instructions:</div>
                      <div><strong>Bank:</strong> {doc.paymentDetails.bankName || 'Nigerian Bank'} &nbsp;|&nbsp; <strong>Beneficiary:</strong> {doc.paymentDetails.accountName || doc.business?.name || 'Business Account'}</div>
                      <div><strong>NUBAN / Account:</strong> <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}>{doc.paymentDetails.accountNumber || 'N/A'}</span>{doc.paymentDetails.routingOrIban ? ` | Sort Code: ${doc.paymentDetails.routingOrIban}` : ''}</div>
                    </div>
                  )}

                  {doc.terms && (
                    <div style={{ marginTop: '12px', fontSize: '10px', color: '#94a3b8' }}>
                      {doc.terms}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conversion Bridge for Anonymous Visitors */}
            {!user && !isApp && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Layers size={20} color="#0B1F3A" />
                  <div style={{ fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--brand-black)' }}>Need Cloud Sync & Online Invoicing?</span>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Automate payment reminders and client ledgers in BizPilotly workspace.</p>
                  </div>
                </div>
                <Link to="/signup" className="btn btn-outline btn-sm">
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
