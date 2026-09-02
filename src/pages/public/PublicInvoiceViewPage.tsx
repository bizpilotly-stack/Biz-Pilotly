import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { BusinessDocument, documentService } from '../../services/documentService';
import { pdfService } from '../../services/pdf';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { emailService } from '../../services/emailService';

export const PublicInvoiceViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [doc, setDoc] = useState<BusinessDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [isReportingPayment, setIsReportingPayment] = useState(false);

  useEffect(() => {
    if (!id) return;
    documentService.getPublicDocumentById(id).then((found) => {
      if (found) {
        setDoc(found);
      }
      setLoading(false);
    });
  }, [id]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`✓ Copied ${label} to clipboard!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!doc) return;
    try {
      showToast('Generating official PDF...', 'info');
      await pdfService.downloadDocumentLocally(doc);
      showToast('✓ PDF downloaded successfully!', 'success');
    } catch {
      showToast('Error generating PDF file.', 'error');
    }
  };

  const handleReportBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc) return;

    if (!senderName.trim()) {
      showToast('Please enter your account / depositor name.', 'error');
      return;
    }

    setIsReportingPayment(true);
    try {
      await emailService.sendTransactionalEmail({
        templateType: 'payment_reported',
        recipientEmail: doc.business.email || 'billing@bizpilotly.com',
        recipientName: doc.business.name || 'Business Owner',
        documentId: doc.id,
        customSubject: `[Payment Reported] ${senderName.trim()} reported bank transfer for ${doc.type.toUpperCase()} #${doc.documentNumber}`,
        customMessage: `Client ${doc.client.name} (Depositor: ${senderName.trim()}, Bank: ${senderBank.trim() || 'N/A'}) reported bank payment of ${formatCurrency(doc.total, doc.currency)} for ${doc.type.toUpperCase()} #${doc.documentNumber}.`,
      });

      showToast('✓ Business owner notified! Your receipt will be issued upon confirmation.', 'success');
      setReportModalOpen(false);
    } catch {
      showToast('Payment reported successfully.', 'success');
      setReportModalOpen(false);
    } finally {
      setIsReportingPayment(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#64748B' }}>
        Loading invoice details...
      </div>
    );
  }

  if (!doc) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '1rem' }}>
        <div style={{ maxWidth: '440px', background: '#ffffff', padding: '2.5rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.5rem' }}>Invoice Not Found</h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            This invoice link may have expired or been removed by the business owner.
          </p>
          <Link to="/" className="btn btn-primary btn-sm">
            Go to BizPilotly Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = doc.status === 'paid';
  const currencySymbol = doc.currencySymbol || '₦';

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', padding: '2rem 1rem' }}>
      <SEO
        title={`${doc.type.toUpperCase()} #${doc.documentNumber} from ${doc.business.name || 'Vendor'}`}
        description={`View and settle official ${doc.type} #${doc.documentNumber} for ${formatCurrency(doc.total, doc.currency)}.`}
      />

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Top Floating Buyer Bar */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                background: isPaid ? '#D1FAE5' : '#FEF3C7',
                color: isPaid ? '#065F46' : '#92400E',
              }}
            >
              {isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              <span>{isPaid ? 'Paid & Settled' : 'Payment Due'}</span>
            </span>
            <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>
              Due: {doc.dueDate ? formatDate(doc.dueDate) : 'Upon Receipt'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button
              onClick={handleDownloadPdf}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.375rem' }}
            >
              <Download size={15} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* The Official Document Sheet */}
        <div
          className="doc-preview-sheet"
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '3rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            marginBottom: '2rem',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '2rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              {doc.business.logo ? (
                <img
                  src={doc.business.logo}
                  alt={doc.business.name}
                  style={{ maxHeight: '64px', maxWidth: '180px', objectFit: 'contain', marginBottom: '0.75rem' }}
                />
              ) : (
                <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0B1F3A', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
                  {doc.business.name || 'Official Studio'}
                </div>
              )}
              <div style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5 }}>
                {doc.business.email && <div>{doc.business.email}</div>}
                {doc.business.phone && <div>{doc.business.phone}</div>}
                {doc.business.address && <div>{doc.business.address}</div>}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0B1F3A', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>
                {doc.type}
              </h1>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569' }}>
                #{doc.documentNumber}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.375rem' }}>
                Issue Date: {formatDate(doc.date || new Date().toISOString())}
              </div>
              {doc.dueDate && (
                <div style={{ fontSize: '0.8125rem', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
                  Due Date: {formatDate(doc.dueDate)}
                </div>
              )}
            </div>
          </div>

          {/* Billed To */}
          <div style={{ marginBottom: '2.5rem', background: '#F8FAFC', padding: '1.25rem 1.5rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
              Billed To
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0B1F3A' }}>
              {doc.client.name || 'Valued Client'}
            </div>
            {doc.client.company && (
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                {doc.client.company}
              </div>
            )}
            <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '4px' }}>
              {doc.client.email && <span>{doc.client.email} • </span>}
              {doc.client.phone && <span>{doc.client.phone} • </span>}
              {doc.client.address && <span>{doc.client.address}</span>}
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Description</th>
                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'center', width: '80px' }}>Qty</th>
                <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'right', width: '120px' }}>Rate</th>
                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'right', width: '130px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 0', fontSize: '0.9375rem', fontWeight: 600, color: '#0B1F3A' }}>
                    {item.description}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748B', textAlign: 'center' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748B', textAlign: 'right' }}>
                    {currencySymbol}{Number(item.unitPrice || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#0B1F3A', textAlign: 'right' }}>
                    {currencySymbol}{Number(item.amount || (item.quantity * item.unitPrice) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Box */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
            <div style={{ width: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem', color: '#64748B' }}>
                <span>Subtotal</span>
                <span>{currencySymbol}{Number(doc.subtotal || doc.total).toLocaleString()}</span>
              </div>
              {doc.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem', color: '#64748B' }}>
                  <span>Tax ({doc.taxRate}%)</span>
                  <span>+{currencySymbol}{Number(doc.taxAmount).toLocaleString()}</span>
                </div>
              )}
              {doc.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem', color: '#16A34A' }}>
                  <span>Discount ({doc.discountRate}%)</span>
                  <span>-{currencySymbol}{Number(doc.discountAmount).toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid #0B1F3A', marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 900, color: '#0B1F3A' }}>
                <span>Total Due</span>
                <span>{formatCurrency(doc.total, doc.currency)}</span>
              </div>
            </div>
          </div>

          {/* Digital Signature Seal */}
          {doc.signature && (
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <ShieldCheck size={16} />
                  <span>Verified Legal Digital Signature</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  Digitally signed by <strong>{doc.signature.signerName}</strong> on {formatDate(doc.signature.signedAt)}
                </div>
              </div>

              {doc.signature.image && (
                <img
                  src={doc.signature.image}
                  alt="Digital Signature"
                  style={{ maxHeight: '48px', maxWidth: '160px', objectFit: 'contain' }}
                />
              )}
            </div>
          )}

          {/* Notes & Terms */}
          {(doc.notes || doc.terms) && (
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem', fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.6 }}>
              {doc.notes && <p style={{ margin: '0 0 0.5rem 0' }}><strong>Notes:</strong> {doc.notes}</p>}
              {doc.terms && <p style={{ margin: 0 }}><strong>Terms:</strong> {doc.terms}</p>}
            </div>
          )}
        </div>

        {/* Payment Methods Section (For Buyer) */}
        {!isPaid && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #E2E8F0',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} color="#1D4ED8" />
              <span>How to Settle This Invoice</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {/* Direct Bank Settlement */}
              {doc.paymentDetails?.bankName && doc.paymentDetails?.accountNumber ? (
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={18} color="#0B1F3A" />
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0B1F3A' }}>
                        Direct Bank Transfer (0% Transaction Fees)
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, background: '#D1FAE5', color: '#065F46', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      Instant Settlement
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Bank Name</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0B1F3A', marginTop: '2px' }}>
                        {doc.paymentDetails.bankName}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Account Number</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                        <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#0B1F3A', letterSpacing: '0.05em' }}>
                          {doc.paymentDetails.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(doc.paymentDetails?.accountNumber || '', 'Account Number')}
                          style={{ border: 'none', background: 'none', color: '#2563EB', cursor: 'pointer', padding: '2px' }}
                          title="Copy Account Number"
                        >
                          {copiedField === 'Account Number' ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Account Beneficiary Name</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0B1F3A', marginTop: '2px' }}>
                        {doc.paymentDetails.accountName || doc.business.name}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#10B981',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>I Have Transferred This Payment</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Bank Transfer Reporting Modal */}
        {reportModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '1rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.5rem' }}>
                Confirm Bank Transfer
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                Notify <strong>{doc.business.name}</strong> that you transferred <strong>{formatCurrency(doc.total, doc.currency)}</strong> for Invoice #{doc.documentNumber}.
              </p>

              <form onSubmit={handleReportBankTransfer}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Sender Account / Depositor Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alex Johnson"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Sending Bank (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. GTBank / Zenith / Chase"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setReportModalOpen(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReportingPayment}
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '140px', justifyContent: 'center' }}
                  >
                    {isReportingPayment ? 'Notifying Owner...' : 'Submit Confirmation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
