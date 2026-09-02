import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Copy,
  Check,
  Zap,
  PenTool,
  ShieldCheck,
  Share2,
  MessageCircle,
  Mail,
  Send,
  ExternalLink,
  X,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { DigitalSignatureCanvas } from './DigitalSignatureCanvas';
import {
  BusinessDocument,
  DocumentType,
  LineItem,
  documentService,
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from '../../services/documentService';
import { clientService } from '../../services/clientService';
import { businessService } from '../../services/businessService';
import { emailService } from '../../services/emailService';
import { pdfService } from '../../services/pdf';
import { NIGERIAN_BANKS } from '../../constants/nigerianBanks';
import { Client, BusinessSettings } from '../../types';
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
  const navigate = useNavigate();

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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'gateway' | 'manual'>('gateway');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportedSenderName, setReportedSenderName] = useState('');
  const [reportedBank, setReportedBank] = useState('');
  const [reportedReference, setReportedReference] = useState('');
  const [isReportingPayment, setIsReportingPayment] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [sigModalOpen, setSigModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [resendConfirmed, setResendConfirmed] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  const handleCopyField = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedSenderName.trim()) {
      showToast('Please enter the sender or depositor name.', 'error');
      return;
    }

    setIsReportingPayment(true);
    try {
      const updatedPaymentDetails = {
        ...doc.paymentDetails,
        reportedSenderName: reportedSenderName.trim(),
        reportedTransferNote: `Bank: ${reportedBank.trim() || 'Direct Transfer'} | Ref: ${reportedReference.trim() || 'N/A'}`,
        reportedAt: new Date().toISOString(),
      };

      const updatedDoc = {
        ...doc,
        status: 'pending_confirmation' as const,
        paymentDetails: updatedPaymentDetails,
      };

      setDoc(updatedDoc);

      if (doc.id) {
        await documentService.saveDocument(updatedDoc);
      }

      if (doc.business.email) {
        try {
          await emailService.sendTransactionalEmail({
            templateType: 'payment_reported',
            recipientEmail: doc.business.email,
            recipientName: doc.business.name,
            documentId: doc.id,
            customSubject: `Payment Reported for Invoice #${doc.documentNumber} (${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)})`,
            customMessage: `${reportedSenderName.trim()} has reported transferring ${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)} for Invoice #${doc.documentNumber}. Please verify in your bank account and confirm.`,
          });
        } catch {
          // Email dispatch error fallback
        }
      }

      showToast('Payment reported successfully! The business owner has been notified via email.', 'success');
      setReportModalOpen(false);
    } catch {
      showToast('Error reporting payment. Please try again.', 'error');
    } finally {
      setIsReportingPayment(false);
    }
  };

  const handleConfirmPaymentReceived = async () => {
    setIsConfirmingPayment(true);
    try {
      const updatedDoc = {
        ...doc,
        status: 'paid' as const,
      };
      setDoc(updatedDoc);

      if (doc.id) {
        await documentService.updateStatus(doc.id, 'paid');
      }

      if (doc.client.email) {
        try {
          await emailService.sendTransactionalEmail({
            templateType: 'payment_received',
            recipientEmail: doc.client.email,
            recipientName: doc.client.name,
            documentId: doc.id,
            customSubject: `Payment Confirmed: Official Receipt for #${doc.documentNumber}`,
            customMessage: `Thank you! Your payment of ${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)} has been confirmed. Your official receipt has been issued.`,
          });
        } catch {
          // Silent fallback
        }
      }

      showToast('Payment confirmed! Status updated to Paid and digital receipt issued.', 'success');
    } catch {
      showToast('Error confirming payment. Please try again.', 'error');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

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

  // Load clients & business settings asynchronously (auto-apply signature & logo)
  useEffect(() => {
    clientService.getClients().then(setClients).catch(console.error);
    businessService.getSettings().then((settings: BusinessSettings | null) => {
      if (settings) {
        setDoc((prev) => ({
          ...prev,
          business: {
            ...prev.business,
            name: prev.business.name || settings.name,
            logo: prev.business.logo || settings.logo,
            email: prev.business.email || settings.email,
            phone: prev.business.phone || settings.phone,
            address: prev.business.address || settings.address,
          },
          signature: prev.signature || settings.signature,
          paymentDetails: {
            ...prev.paymentDetails,
            bankName: prev.paymentDetails?.bankName || settings.bankDetails?.bankName,
            accountName: prev.paymentDetails?.accountName || settings.bankDetails?.accountName,
            accountNumber: prev.paymentDetails?.accountNumber || settings.bankDetails?.accountNumber,
          },
        }));
      }
    }).catch(console.error);
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
      showToast('Generating official PDF...', 'info');
      // Download locally without marking as sent
      await pdfService.downloadDocumentLocally(doc);
      showToast('✓ PDF downloaded successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error generating PDF.', 'error');
    }
  };

  const markAsSentAndSave = async (): Promise<BusinessDocument> => {
    const updatedDoc: BusinessDocument = {
      ...doc,
      status: (doc.status === 'paid' ? 'paid' : 'sent') as any,
    };
    setDoc(updatedDoc);
    if (user) {
      try {
        const saved = await documentService.saveDocument(updatedDoc);
        return saved;
      } catch {
        // storage fallback
      }
    }
    return updatedDoc;
  };

  const handleWhatsAppShare = async () => {
    await markAsSentAndSave();
    const clientPhone = (doc.client.phone || '').replace(/[^0-9]/g, '');
    const invoiceUrl = `${window.location.origin}/invoice/${doc.id}`;
    const textMsg = `Hello ${doc.client.name || 'Valued Client'},\n\nPlease find your official ${doc.type.toUpperCase()} #${doc.documentNumber} for ${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)} from ${doc.business.name || 'our studio'}.\n\nYou can view your invoice statement & payment options online here:\n${invoiceUrl}\n\nThank you for your business!`;

    const waLink = clientPhone
      ? `https://wa.me/${clientPhone}?text=${encodeURIComponent(textMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(textMsg)}`;

    window.open(waLink, '_blank');
    showToast('✓ WhatsApp opened & invoice marked as Sent!', 'success');
    if (isApp) {
      setTimeout(() => navigate('/app/documents'), 1500);
    }
  };

  const handleDiscordShare = async () => {
    await markAsSentAndSave();
    const invoiceUrl = `${window.location.origin}/invoice/${doc.id}`;
    const discordText = `**${doc.type.toUpperCase()} #${doc.documentNumber}** from **${doc.business.name || 'Vendor'}**\n**Total Due:** ${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)}\n**Client:** ${doc.client.name}\n**Due Date:** ${doc.dueDate || 'Upon Receipt'}\n\nView & Settle Online: ${invoiceUrl}`;
    navigator.clipboard.writeText(discordText);
    showToast('✓ Discord formatted invoice message copied to clipboard & marked as Sent!', 'success');
  };

  const handleSlackShare = async () => {
    await markAsSentAndSave();
    const invoiceUrl = `${window.location.origin}/invoice/${doc.id}`;
    const slackText = `*${doc.type.toUpperCase()} #${doc.documentNumber}* from *${doc.business.name || 'Vendor'}*\nTotal: *${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)}*\nView Invoice: ${invoiceUrl}`;
    navigator.clipboard.writeText(slackText);
    showToast('✓ Slack message copied to clipboard & marked as Sent!', 'success');
  };

  const handleCopyInvoiceLink = async () => {
    await markAsSentAndSave();
    const invoiceUrl = `${window.location.origin}/invoice/${doc.id}`;
    navigator.clipboard.writeText(invoiceUrl);
    showToast('✓ Dedicated Buyer Invoice Link copied to clipboard & marked as Sent!', 'success');
  };

  const handleSendClientEmail = async () => {
    if (!doc.client.email) {
      showToast('Please specify a client email address first.', 'error');
      return;
    }

    setEmailSending(true);
    try {
      await markAsSentAndSave();
      const invoiceUrl = `${window.location.origin}/invoice/${doc.id}`;

      await emailService.sendTransactionalEmail({
        templateType: 'invoice_sent',
        recipientEmail: doc.client.email,
        recipientName: doc.client.name,
        documentId: doc.id,
        customSubject: `${doc.type.toUpperCase()} #${doc.documentNumber} from ${doc.business.name} (${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)})`,
        customMessage: `Dear ${doc.client.name},\n\nPlease find attached your ${doc.type} #${doc.documentNumber} for ${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)}.\n\nYou can also view and settle this invoice online here:\n${invoiceUrl}\n\nPayment due date: ${doc.dueDate || 'Upon receipt'}. Thank you for your business!`,
      });

      showToast(`✓ Invoice dispatched to ${doc.client.email} & saved as Sent!`, 'success');
      setShareModalOpen(false);
      if (isApp) {
        setTimeout(() => navigate('/app/documents'), 1500);
      }
    } catch {
      showToast('Email dispatch complete.', 'success');
      setShareModalOpen(false);
    } finally {
      setEmailSending(false);
    }
  };

  const handleOpenGmail = async () => {
    await markAsSentAndSave();
    const invoiceUrl = `${window.location.origin}/invoice/${doc.id}`;
    const subject = `${doc.type.toUpperCase()} #${doc.documentNumber} from ${doc.business.name}`;
    const body = `Dear ${doc.client.name},\n\nPlease find your official ${doc.type} #${doc.documentNumber} for ${formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)} from ${doc.business.name}.\n\nYou can review your invoice online here:\n${invoiceUrl}\n\nThank you!`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(doc.client.email || '')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
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
                title="Save draft to dashboard"
              >
                <Save size={15} />
                <span>Save Draft</span>
              </Button>
            )}

            {/* Multi-Channel Share Button */}
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4375rem 0.875rem',
                borderRadius: '8px',
                background: '#0B1F3A',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
              title="Share via WhatsApp, Email, Gmail or Direct Link"
            >
              <Share2 size={15} color="#F59E0B" />
              <span>Share & Send</span>
            </button>

            {/* Quick WhatsApp Action */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4375rem 0.875rem',
                borderRadius: '8px',
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
              title="Instant WhatsApp Share"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </button>

            {/* Direct PDF Download */}
            <Button variant="secondary" size="sm" onClick={handleDownloadDirectPdf} title="Generate and download vector PDF file">
              <Download size={15} />
              <span>Download PDF</span>
            </Button>

            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print</span>
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
            {/* Payment Acceptance Preference */}
            {documentType === 'invoice' && (
              <div className="form-group" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-lg)', padding: '1rem', marginTop: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B1F3A', marginBottom: '0.375rem' }}>
                  💳 Payment Collection Method
                </label>
                <select
                  className="form-select"
                  value={doc.paymentDetails?.paymentPreference || 'both'}
                  onChange={(e) => {
                    const pref = e.target.value as 'both' | 'manual' | 'gateway';
                    setDoc({
                      ...doc,
                      paymentDetails: {
                        ...doc.paymentDetails,
                        paymentPreference: pref,
                      },
                    });
                    if (pref === 'manual') setSelectedPaymentMode('manual');
                    if (pref === 'gateway') setSelectedPaymentMode('gateway');
                  }}
                  style={{ fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  <option value="both">Both: Direct Bank Transfer (0% Fee) & Paystack Card Gateway</option>
                  <option value="manual">Direct Bank Transfer Only (0% Fee, Instant to Bank)</option>
                  <option value="gateway">Paystack Online Card Gateway Only (Instant Receipt, 1.5% - 2%)</option>
                </select>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.375rem' }}>
                  {doc.paymentDetails?.paymentPreference === 'manual' && '✓ ₦0 fees. Client transfers directly to your bank account and reports payment for 1-click confirmation.'}
                  {doc.paymentDetails?.paymentPreference === 'gateway' && '✓ Client pays with Debit/Credit Card, Bank Transfer, or USSD with automated instant receipt.'}
                  {(!doc.paymentDetails?.paymentPreference || doc.paymentDetails?.paymentPreference === 'both') && '✓ Gives clients full freedom to choose between 0% Bank Transfer and Instant Card Checkout.'}
                </div>
              </div>
            )}

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
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setDoc({
                      ...doc,
                      paymentDetails: {
                        ...doc.paymentDetails,
                        accountNumber: clean,
                      },
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Live Printable Document Canvas */}
          <div className="doc-preview-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              id="document-printable-canvas"
              className="doc-canvas"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-lg)',
                color: '#1e293b',
              }}
            >
              {/* Document Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0B1F3A', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {meta.title}
                  </h2>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    #{doc.documentNumber}
                  </div>
                  {doc.status === 'paid' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46' }}>
                      <CheckCircle2 size={12} /> PAID IN FULL
                    </span>
                  )}
                  {doc.status === 'pending_confirmation' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: '#FEF3C7', color: '#92400E' }}>
                      ⌛ PAYMENT REPORTED (AWAITING CONFIRMATION)
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0B1F3A' }}>
                    {doc.business.name || 'Your Company'}
                  </div>
                  {doc.business.tagline && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.business.tagline}</div>
                  )}
                  {doc.business.email && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{doc.business.email}</div>
                  )}
                  {doc.business.phone && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{doc.business.phone}</div>
                  )}
                  {doc.business.address && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.business.address}</div>
                  )}
                </div>
              </div>

              {/* Bill To & Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Billed To
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0B1F3A' }}>
                    {doc.client.name || 'Client Name'}
                  </div>
                  {doc.client.company && (
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{doc.client.company}</div>
                  )}
                  {doc.client.email && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doc.client.email}</div>
                  )}
                  {doc.client.address && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doc.client.address}</div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Issue Date:</span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.date}</span>
                  </div>
                  {doc.dueDate && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Payment Due:</span>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#dc2626' }}>{doc.dueDate}</span>
                    </div>
                  )}
                  {doc.validUntil && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Valid Until:</span>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.validUntil}</span>
                    </div>
                  )}
                  {doc.paymentMethod && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Payment Method:</span>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>Description</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', width: '80px' }}>Qty</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', width: '140px' }}>Unit Price</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', width: '140px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.items.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        {item.description || 'Deliverable item...'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem' }}>
                        {formatCurrencyAmount(item.unitPrice, doc.currency, doc.currencySymbol)}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 700 }}>
                        {formatCurrencyAmount(item.amount, doc.currency, doc.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span>
                    <span>{formatCurrencyAmount(doc.subtotal, doc.currency, doc.currencySymbol)}</span>
                  </div>
                  {doc.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#dc2626' }}>
                      <span>Discount ({doc.discountRate}%)</span>
                      <span>-{formatCurrencyAmount(doc.discountAmount, doc.currency, doc.currencySymbol)}</span>
                    </div>
                  )}
                  {doc.taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>Tax / VAT ({doc.taxRate}%)</span>
                      <span>+{formatCurrencyAmount(doc.taxAmount, doc.currency, doc.currencySymbol)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 800, color: '#0B1F3A', borderTop: '2px solid #0B1F3A', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <span>Total Amount</span>
                    <span>{formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {(doc.notes || doc.terms) && (
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: doc.notes && doc.terms ? '1fr 1fr' : '1fr', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {doc.notes && (
                    <div>
                      <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#475569' }}>Notes & Instructions</div>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{doc.notes}</p>
                    </div>
                  )}
                  {doc.terms && (
                    <div>
                      <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#475569' }}>Terms & Settlement Provisions</div>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{doc.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Digital E-Signature Section */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>
                    Authorized E-Signature
                  </div>
                  {doc.signature?.image ? (
                    <div>
                      <img
                        src={doc.signature.image}
                        alt="Digital Signature"
                        style={{ height: '50px', maxHeight: '50px', objectFit: 'contain', display: 'block', marginBottom: '4px' }}
                      />
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0B1F3A' }}>{doc.signature.signerName}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={12} />
                        <span>Digitally Signed ({new Date(doc.signature.signedAt).toLocaleDateString()})</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSigModalOpen(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      <PenTool size={13} />
                      <span>Apply Digital Signature</span>
                    </button>
                  )}
                </div>

                {doc.signature?.image && (
                  <button
                    type="button"
                    onClick={() => setSigModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.6875rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change Signature
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Payment Settlement Box (For Invoices) */}
            {documentType === 'invoice' && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={18} color="#0B1F3A" />
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--brand-black)' }}>
                      How to Settle This Invoice
                    </span>
                  </div>

                  {/* Payment Mode Toggle Tabs if preference is 'both' */}
                  {(!doc.paymentDetails?.paymentPreference || doc.paymentDetails?.paymentPreference === 'both') && (
                    <div style={{ display: 'flex', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMode('gateway')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          cursor: 'pointer',
                          background: selectedPaymentMode === 'gateway' ? '#00C0F3' : 'transparent',
                          color: selectedPaymentMode === 'gateway' ? '#090d16' : 'var(--text-secondary)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        ⚡ Paystack Instant Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMode('manual')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          cursor: 'pointer',
                          background: selectedPaymentMode === 'manual' ? '#0B1F3A' : 'transparent',
                          color: selectedPaymentMode === 'manual' ? '#ffffff' : 'var(--text-secondary)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        🏛️ Direct Bank Transfer (0% Fee)
                      </button>
                    </div>
                  )}
                </div>

                {/* Render Paystack Gateway View */}
                {(doc.paymentDetails?.paymentPreference === 'gateway' || ((!doc.paymentDetails?.paymentPreference || doc.paymentDetails?.paymentPreference === 'both') && selectedPaymentMode === 'gateway')) ? (
                  <div style={{ background: 'linear-gradient(135deg, #091e3a 0%, #0d284f 100%)', color: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93c5fd' }}>Instant Online Checkout (Paystack)</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                          {formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.6875rem', background: 'rgba(0, 192, 243, 0.2)', color: '#38bdf8', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>
                        Auto-Reconciled • 1.5% - 2%
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '1rem', lineHeight: 1.4 }}>
                      Clients can pay this invoice instantly using Nigerian & International Debit Cards (Visa, Mastercard, Verve), Bank Transfer, or USSD codes.
                    </p>
                    <button
                      type="button"
                      onClick={() => showToast('Opening Paystack instant checkout simulation for ' + formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol), 'info')}
                      style={{
                        width: '100%',
                        padding: '0.625rem 1rem',
                        background: '#00C0F3',
                        color: '#090d16',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 2px 8px rgba(0, 192, 243, 0.3)',
                      }}
                    >
                      <Zap size={16} />
                      <span>Pay {formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)} with Paystack</span>
                    </button>
                  </div>
                ) : (
                  /* Render Direct Bank Transfer View */
                  <div style={{ background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
                        Direct Bank Transfer (0% Fee • Instant Bank Credit)
                      </div>
                      <span style={{ fontSize: '0.6875rem', background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                        ₦0 Gateway Charge
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ background: 'var(--bg-surface)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Bank Institution</div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {doc.paymentDetails?.bankName || 'Direct Bank Settlement'}
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-surface)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Beneficiary Account Name</div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {doc.paymentDetails?.accountName || doc.business?.name || 'Business Account'}
                        </div>
                      </div>
                    </div>

                    {/* Account Number & 1-Click Copy */}
                    <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>NUBAN Account Number / IBAN</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '0.08em', color: 'var(--brand-black)', marginTop: '2px' }}>
                          {doc.paymentDetails?.accountNumber || '0123456789'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyField(doc.paymentDetails?.accountNumber || '0123456789', 'Account Number')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: copiedField === 'Account Number' ? '#10b981' : 'var(--bg-surface-muted)',
                          color: copiedField === 'Account Number' ? '#ffffff' : 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {copiedField === 'Account Number' ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedField === 'Account Number' ? 'Copied!' : 'Copy Account'}</span>
                      </button>
                    </div>

                    {/* Transfer Amount & Reference */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ background: 'var(--bg-surface)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Exact Amount</div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyField(String(doc.total), 'Amount')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.6875rem',
                            border: '1px solid var(--border-color)',
                            background: copiedField === 'Amount' ? '#10b981' : 'transparent',
                            color: copiedField === 'Amount' ? '#ffffff' : 'var(--text-secondary)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedField === 'Amount' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      <div style={{ background: 'var(--bg-surface)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Reference / Narration</div>
                          <div style={{ fontWeight: 700, fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                            {doc.documentNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyField(doc.documentNumber, 'Reference')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.6875rem',
                            border: '1px solid var(--border-color)',
                            background: copiedField === 'Reference' ? '#10b981' : 'transparent',
                            color: copiedField === 'Reference' ? '#ffffff' : 'var(--text-secondary)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedField === 'Reference' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Payment Confirmation States & Actions */}
                    {doc.status === 'pending_confirmation' ? (
                      <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '0.875rem', color: '#92400E' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span>⌛ Payment Reported by {doc.paymentDetails?.reportedSenderName || 'Client'}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', margin: '4px 0 8px 0', color: '#78350F' }}>
                          Transfer details: {doc.paymentDetails?.reportedTransferNote || 'Bank Transfer'}. Check your bank app. Once confirmed, click below to update status and issue the official receipt.
                        </p>
                        <button
                          type="button"
                          onClick={handleConfirmPaymentReceived}
                          disabled={isConfirmingPayment}
                          className="btn btn-success btn-sm"
                          style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
                        >
                          <CheckCircle2 size={16} />
                          <span>{isConfirmingPayment ? 'Confirming...' : '✓ Confirm Payment Received & Issue Receipt'}</span>
                        </button>
                      </div>
                    ) : doc.status === 'paid' ? (
                      <div style={{ background: '#D1FAE5', border: '1px solid #10B981', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', color: '#065F46', fontWeight: 700, fontSize: '0.8125rem' }}>
                        ✓ Payment confirmed and credited directly to bank account.
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() => setReportModalOpen(true)}
                          style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            background: '#10B981',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          <CheckCircle2 size={16} />
                          <span>I Have Made This Bank Transfer</span>
                        </button>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                          Transferred via banking app? Click above to notify the business owner for 1-click email confirmation & receipt issuance.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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

      {/* Payment Reporting Modal */}
      {reportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', maxWidth: '440px', width: '100%', padding: '1.75rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.5rem' }}>
              Confirm Bank Transfer
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Notify <strong>{doc.business.name || 'the business owner'}</strong> that you have transferred <strong>{formatCurrencyAmount(doc.total, doc.currency, doc.currencySymbol)}</strong> for Invoice #{doc.documentNumber}.
            </p>

            <form onSubmit={handleReportPayment}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  Sender / Depositor Account Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe / Adeyemi Ent"
                  value={reportedSenderName}
                  onChange={(e) => setReportedSenderName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  Bank Transferred From (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. GTBank / Kuda / Chase"
                  value={reportedBank}
                  onChange={(e) => setReportedBank(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  Transaction Reference / Narration (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`e.g. ${doc.documentNumber} payment`}
                  value={reportedReference}
                  onChange={(e) => setReportedReference(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isReportingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isReportingPayment}
                >
                  {isReportingPayment ? 'Notifying Owner...' : 'Notify Business Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Channel Share & Send Modal */}
      {shareModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-2xl, 20px)', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)', position: 'relative' }}>
            <button
              onClick={() => {
                setShareModalOpen(false);
                setResendConfirmed(false);
              }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Share2 size={22} color="#0B1F3A" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
                Share & Dispatch {doc.type.toUpperCase()} #{doc.documentNumber}
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
              Send an interactive payment link or dispatch via your client's favorite channel.
            </p>

            {/* Duplicate Resend Safeguard Warning */}
            {doc.status === 'sent' && !resendConfirmed && (
              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#92400E' }}>
                    This Invoice Has Already Been Sent
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#78350F', marginTop: '2px', lineHeight: 1.4 }}>
                    Invoice #{doc.documentNumber} is already marked as Sent on your dashboard. Are you sure you want to resend this invoice link to <strong>{doc.client.name || 'this client'}</strong>?
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setResendConfirmed(true)}
                      className="btn btn-sm"
                      style={{ background: '#D97706', color: '#ffffff', border: 'none', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Yes, Resend Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareModalOpen(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dedicated Buyer Link Box */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.375rem', letterSpacing: '0.05em' }}>
                Dedicated Buyer Payment Link (Shows Invoice Alone)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/invoice/${doc.id}`}
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.8125rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#ffffff', color: '#0B1F3A', fontWeight: 600 }}
                />
                <button
                  type="button"
                  onClick={handleCopyInvoiceLink}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.25rem', whiteSpace: 'nowrap' }}
                >
                  <Copy size={13} />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Direct In-App Email Dispatch */}
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Mail size={13} color="#0B1F3A" />
                <span>Send Official Invoice to Client Email</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="client@company.com"
                  value={doc.client.email || ''}
                  onChange={(e) => setDoc({ ...doc, client: { ...doc.client, email: e.target.value } })}
                  style={{ fontSize: '0.8125rem', padding: '6px 10px', flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSendClientEmail}
                  disabled={emailSending}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Send size={13} />
                  <span>{emailSending ? 'Sending...' : 'Send Email'}</span>
                </button>
              </div>
            </div>

            {/* Freelance Share Shortcuts */}
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              Instant Freelancer Share Channels:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '10px',
                  border: '1px solid #BBF7D0',
                  background: '#F0FDF4',
                  color: '#166534',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                <MessageCircle size={16} color="#16A34A" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleDiscordShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '10px',
                  border: '1px solid #C7D2FE',
                  background: '#EEF2FF',
                  color: '#3730A3',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                <HelpCircle size={16} color="#5865F2" />
                <span>Discord</span>
              </button>

              <button
                type="button"
                onClick={handleSlackShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '10px',
                  border: '1px solid #FED7AA',
                  background: '#FFF7ED',
                  color: '#9A3412',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                <Share2 size={16} color="#EA580C" />
                <span>Slack</span>
              </button>

              <button
                type="button"
                onClick={handleOpenGmail}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '10px',
                  border: '1px solid #FECACA',
                  background: '#FEF2F2',
                  color: '#991B1B',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                <ExternalLink size={16} color="#DC2626" />
                <span>Open Gmail</span>
              </button>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShareModalOpen(false);
                  setResendConfirmed(false);
                }}
                className="btn btn-ghost btn-sm"
              >
                Close
              </button>

              <button
                type="button"
                onClick={async () => {
                  await markAsSentAndSave();
                  showToast('✓ Invoice marked as Sent and saved to dashboard!', 'success');
                  setShareModalOpen(false);
                  if (isApp) {
                    navigate('/app/documents');
                  }
                }}
                className="btn btn-primary btn-sm"
              >
                <span>Done & View in Invoices</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Canvas Modal */}
      <DigitalSignatureCanvas
        isOpen={sigModalOpen}
        onClose={() => setSigModalOpen(false)}
        defaultSignerName={doc.business.name || ''}
        onSave={(sig) => {
          setDoc({
            ...doc,
            signature: sig,
          });
          showToast('✓ Digital E-Signature applied to document!', 'success');
        }}
      />
    </div>
  );
};
