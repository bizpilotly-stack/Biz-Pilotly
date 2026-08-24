import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Save,
  Send,
  Building,
  User,
  FileText,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { BusinessDocument, DocumentType, LineItem } from '../../types';
import { documentService } from '../../services/documentService';
import { formatCurrency, calculateLineItemTotal, calculateDocumentTotals } from '../../utils/formatters';
import { CURRENCIES, BRAND_NAME } from '../../constants/brand';
import { INITIAL_CLIENTS } from '../../mock/clients';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { SEO } from '../common/SEO';

interface DocumentEditorProps {
  initialDocument: BusinessDocument;
  documentType: DocumentType;
  title: string;
  badgeLabel: string;
}

export const DocumentEditorLayout: React.FC<DocumentEditorProps> = ({
  initialDocument,
  documentType,
  title,
  badgeLabel,
}) => {
  const { showToast } = useToast();
  const [doc, setDoc] = useState<BusinessDocument>(initialDocument);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(initialDocument.client.email);

  // Recalculate totals whenever items, taxRate, or discountRate change
  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = doc.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = calculateLineItemTotal(
            field === 'quantity' ? Number(value) : item.quantity,
            field === 'unitPrice' ? Number(value) : item.unitPrice
          );
        }
        return updated;
      }
      return item;
    });

    const totals = calculateDocumentTotals(updatedItems, doc.taxRate, doc.discountRate);
    setDoc({
      ...doc,
      items: updatedItems,
      ...totals,
    });
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
    const totals = calculateDocumentTotals(updatedItems, doc.taxRate, doc.discountRate);
    setDoc({
      ...doc,
      items: updatedItems,
      ...totals,
    });
  };

  const handleRemoveItem = (id: string) => {
    if (doc.items.length <= 1) {
      showToast('Document must contain at least one item.', 'error');
      return;
    }
    const updatedItems = doc.items.filter((item) => item.id !== id);
    const totals = calculateDocumentTotals(updatedItems, doc.taxRate, doc.discountRate);
    setDoc({
      ...doc,
      items: updatedItems,
      ...totals,
    });
  };

  const handleTaxChange = (rate: number) => {
    const totals = calculateDocumentTotals(doc.items, rate, doc.discountRate);
    setDoc({
      ...doc,
      taxRate: rate,
      ...totals,
    });
  };

  const handleDiscountChange = (rate: number) => {
    const totals = calculateDocumentTotals(doc.items, doc.taxRate, rate);
    setDoc({
      ...doc,
      discountRate: rate,
      ...totals,
    });
  };

  const handleClientSelect = (clientId: string) => {
    const found = INITIAL_CLIENTS.find((c) => c.id === clientId);
    if (found) {
      setDoc({
        ...doc,
        client: {
          id: found.id,
          name: found.name,
          company: found.company,
          email: found.email,
          phone: found.phone,
          address: found.address,
        },
      });
      setRecipientEmail(found.email);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    try {
      await documentService.saveDocument(doc);
      showToast(`${title} (${doc.documentNumber}) saved locally to documents ledger!`, 'success');
    } catch {
      showToast('Error saving document', 'error');
    }
  };

  const handleMockSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSendModalOpen(false);
    showToast(`Document sent to ${recipientEmail} (Mock email simulation)`, 'success');
  };

  return (
    <div className="section-py-sm">
      <SEO
        title={`${title} Builder | ${BRAND_NAME}`}
        description={`Interactive live builder for ${title}. Customize rates, tax, line items, and export professional print-ready business documents.`}
        canonical={`https://example.com/documents/${documentType}`}
      />

      <div className="container-fluid">
        {/* Page Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-gold">{badgeLabel}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-Time Live Sheet Sync</span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.025em' }}>
              {title} Builder
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print / PDF</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save size={15} />
              <span>Save Document</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setSendModalOpen(true)}>
              <Send size={15} />
              <span>Send to Client</span>
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
              <FileText size={18} color="#1d4ed8" />
              <span>Document Identification</span>
            </div>

            <div className="doc-form-row">
              <Input
                label="Document Title / Scope"
                value={doc.title}
                onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                required
              />
              <Input
                label="Document Number"
                value={doc.documentNumber}
                onChange={(e) => setDoc({ ...doc, documentNumber: e.target.value })}
                required
              />
            </div>

            <div className="doc-form-row-3">
              <Input
                label="Issue Date"
                type="date"
                value={doc.date}
                onChange={(e) => setDoc({ ...doc, date: e.target.value })}
                required
              />
              <Input
                label={documentType === 'quote' || documentType === 'proposal' ? 'Valid Until' : 'Due Date'}
                type="date"
                value={doc.dueDate || doc.validUntil || ''}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    dueDate: e.target.value,
                    validUntil: e.target.value,
                  })
                }
              />
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  value={doc.currency}
                  onChange={(e) => {
                    const sel = CURRENCIES.find((c) => c.code === e.target.value);
                    if (sel) {
                      setDoc({ ...doc, currency: sel.code, currencySymbol: sel.symbol });
                    }
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Business (Sender) Section */}
            <div className="doc-section-title" style={{ marginTop: '1.5rem' }}>
              <Building size={18} color="#1d4ed8" />
              <span>Your Business Details</span>
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
              />
            </div>

            {/* Client (Recipient) Section */}
            <div className="doc-section-title" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="#1d4ed8" />
                <span>Client Information</span>
              </div>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                onChange={(e) => handleClientSelect(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Load from Clients Directory...</option>
                {INITIAL_CLIENTS.map((c) => (
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
                required
              />
              <Input
                label="Client Company / Org"
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

              {doc.items.map((item) => (
                <div key={item.id} className="line-item-row">
                  <input
                    className="form-input"
                    placeholder="Deliverable description..."
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="10"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                  />
                  <input
                    className="form-input"
                    readOnly
                    value={formatCurrency(item.amount, doc.currency, doc.currencySymbol)}
                    style={{ background: 'var(--bg-surface-muted)', fontWeight: 600 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: '#ef4444' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Adjustments (Tax & Discount) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tax / VAT Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="100"
                  value={doc.taxRate}
                  onChange={(e) => handleTaxChange(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Discount Allowance (%)</label>
                <input
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
              <CreditCard size={18} color="#1d4ed8" />
              <span>Notes & Settlement Instructions</span>
            </div>

            <div className="form-group">
              <label className="form-label">Client Notes & Instructions</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={doc.notes || ''}
                onChange={(e) => setDoc({ ...doc, notes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Terms / Bank Instructions</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={doc.terms || ''}
                onChange={(e) => setDoc({ ...doc, terms: e.target.value })}
              />
            </div>
          </div>

          {/* =================================================================
             RIGHT COLUMN: LIVE PRINTABLE PAPER PREVIEW
             ================================================================= */}
          <div className="doc-preview-column">
            <div className="doc-preview-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                <Sparkles size={16} color="#d97706" />
                <span>Live Document Preview</span>
              </div>
              <span className="badge badge-neutral">A4 / US-Letter Proportions</span>
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
                        <strong>Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#1d4ed8' }}>{doc.status}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    Project Scope: {doc.title}
                  </div>

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
                          <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice, doc.currency, doc.currencySymbol)}</td>
                          <td style={{ textAlign: 'right' }}><strong>{formatCurrency(item.amount, doc.currency, doc.currencySymbol)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Summary */}
                  <div className="doc-sheet-totals">
                    <div className="doc-totals-row">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(doc.subtotal, doc.currency, doc.currencySymbol)}</span>
                    </div>
                    {doc.discountAmount > 0 && (
                      <div className="doc-totals-row" style={{ color: '#b91c1c' }}>
                        <span>Discount ({doc.discountRate}%):</span>
                        <span>-{formatCurrency(doc.discountAmount, doc.currency, doc.currencySymbol)}</span>
                      </div>
                    )}
                    {doc.taxAmount > 0 && (
                      <div className="doc-totals-row">
                        <span>Tax / VAT ({doc.taxRate}%):</span>
                        <span>+{formatCurrency(doc.taxAmount, doc.currency, doc.currencySymbol)}</span>
                      </div>
                    )}
                    <div className="doc-totals-row grand-total">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(doc.total, doc.currency, doc.currencySymbol)}</span>
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

                  {doc.paymentDetails && (
                    <div className="doc-sheet-bank-box">
                      <div style={{ fontWeight: 700, color: '#090d16', marginBottom: '2px' }}>Payment Instructions:</div>
                      <div>Bank: {doc.paymentDetails.bankName} | Beneficiary: {doc.paymentDetails.accountName}</div>
                      <div>Account: {doc.paymentDetails.accountNumber} | Routing / IBAN: {doc.paymentDetails.routingOrIban}</div>
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
          </div>
        </div>
      </div>

      {/* Mock Send Email Modal */}
      <Modal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        title={`Send ${title} to Client`}
      >
        <form onSubmit={handleMockSend}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Simulate sending an official email notification with a downloadable PDF attachment to your client.
          </p>
          <Input
            label="Recipient Email"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
          />
          <Input
            label="Subject"
            defaultValue={`${doc.business.name} has sent you ${title} #${doc.documentNumber}`}
          />
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              rows={3}
              defaultValue={`Hi ${doc.client.name},\n\nPlease find attached ${title} #${doc.documentNumber} for ${formatCurrency(doc.total, doc.currency, doc.currencySymbol)}.\n\nBest regards,\n${doc.business.name}`}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setSendModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <Send size={15} />
              <span>Send Document</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
