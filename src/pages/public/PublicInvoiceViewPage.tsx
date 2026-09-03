import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  Check,
  ArrowLeft,
  XCircle,
  PenTool,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import { BusinessDocument, documentService } from '../../services/documentService';
import { pdfService } from '../../services/pdf';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { emailService } from '../../services/emailService';
import { DigitalSignatureCanvas } from '../../components/documents/DigitalSignatureCanvas';
import { useAuth } from '../../contexts/AuthContext';

export const PublicInvoiceViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [doc, setDoc] = useState<BusinessDocument | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [isReportingPayment, setIsReportingPayment] = useState(false);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptName, setAcceptName] = useState('');
  const [acceptEmail, setAcceptEmail] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');

  const [isConverting, setIsConverting] = useState(false);

  const loadDocument = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const found = await documentService.getPublicDocumentById(id);
      if (found) {
        setDoc(found);
        setAcceptName(found.client?.name || '');
        setAcceptEmail(found.client?.email || '');
        setSignerName(found.client?.name || '');
        setSignerEmail(found.client?.email || '');

        // Fetch related documents if available
        try {
          const rels = await documentService.getRelatedDocuments(found.id);
          setRelatedDocs(rels);
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
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

  // 1. Accept Proposal / Quote
  const handleAcceptDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc) return;
    if (!acceptName.trim()) {
      showToast('Please provide your full legal name.', 'error');
      return;
    }

    setIsAccepting(true);
    try {
      const updated = await documentService.publicAcceptDocument(doc.id, {
        name: acceptName.trim(),
        email: acceptEmail.trim(),
      });
      setDoc(updated);
      setAcceptModalOpen(false);
      showToast(`✓ ${doc.type.toUpperCase()} #${doc.documentNumber} officially accepted!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error accepting document.', 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  // 2. Reject Proposal / Quote / Contract
  const handleRejectDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc) return;
    if (!rejectReason.trim()) {
      showToast('Please provide a reason or note.', 'error');
      return;
    }

    setIsRejecting(true);
    try {
      if (doc.type === 'contract') {
        const updated = await documentService.publicDeclineContract(doc.id, rejectReason.trim(), {
          name: acceptName.trim() || doc.client.name,
        });
        setDoc(updated);
      } else {
        const updated = await documentService.publicRejectDocument(doc.id, rejectReason.trim(), {
          name: acceptName.trim() || doc.client.name,
          email: acceptEmail.trim() || doc.client.email,
        });
        setDoc(updated);
      }
      setRejectModalOpen(false);
      showToast(`Response submitted. The business owner has been notified.`, 'info');
    } catch (err: any) {
      showToast(err?.message || 'Error submitting response.', 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  // 3. Sign Contract
  const handleContractSigned = async (signatureData: { image: string; signerName: string; signedAt: string }) => {
    if (!doc) return;
    try {
      const updated = await documentService.publicSignContract(
        doc.id,
        signatureData.image,
        signatureData.signerName || signerName.trim() || doc.client.name,
        signerEmail.trim() || doc.client.email
      );
      setDoc(updated);
      setSignModalOpen(false);
      showToast(`✓ Contract #${doc.documentNumber} has been legally executed!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error executing contract.', 'error');
    }
  };

  // 4. Generate Invoice from Accepted Proposal / Quote / Estimate
  const handleGenerateInvoice = async () => {
    if (!doc) return;
    setIsConverting(true);
    try {
      let newInv: BusinessDocument;
      if (doc.type === 'proposal') {
        newInv = await documentService.generateInvoiceFromProposal(doc.id);
      } else if (doc.type === 'quote') {
        newInv = await documentService.generateInvoiceFromQuote(doc.id);
      } else if (doc.type === 'estimate') {
        newInv = await documentService.generateInvoiceFromEstimate(doc.id);
      } else {
        throw new Error('Unsupported conversion type');
      }

      showToast(`✓ Invoice #${newInv.documentNumber} generated from ${doc.type}!`, 'success');
      navigate(user ? `/app/documents/invoice` : `/invoice/${newInv.id}`);
    } catch (err: any) {
      showToast(err?.message || 'Error generating invoice.', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  // 5. Report Bank Transfer
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
        Loading document details...
      </div>
    );
  }

  if (!doc) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '1rem' }}>
        <div style={{ maxWidth: '440px', background: '#ffffff', padding: '2.5rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.5rem' }}>Document Not Found</h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            This document link may have expired or been removed by the issuer.
          </p>
          <Link to="/" className="btn btn-primary btn-sm">
            Go to BizPilotly Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = doc.status === 'paid';
  const isAccepted = doc.status === 'accepted';
  const isRejected = doc.status === 'rejected';
  const isSigned = doc.status === 'signed';
  const isDeclined = doc.status === 'declined';
  const currencySymbol = doc.currencySymbol || '$';

  // Find linked receipt if paid invoice
  const linkedReceipt = relatedDocs.find((d) => d.type === 'receipt');

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', padding: '2rem 1rem' }}>
      <SEO
        title={`${doc.type.toUpperCase()} #${doc.documentNumber} | ${doc.business.name || 'BizPilotly'}`}
        description={`View ${doc.type} #${doc.documentNumber} issued to ${doc.client.name}.`}
      />

      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Status Pill */}
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
                background:
                  isPaid || isAccepted || isSigned
                    ? '#D1FAE5'
                    : isRejected || isDeclined
                    ? '#FEE2E2'
                    : '#FEF3C7',
                color:
                  isPaid || isAccepted || isSigned
                    ? '#065F46'
                    : isRejected || isDeclined
                    ? '#991B1B'
                    : '#92400E',
              }}
            >
              {isPaid || isAccepted || isSigned ? (
                <CheckCircle2 size={14} />
              ) : isRejected || isDeclined ? (
                <XCircle size={14} />
              ) : (
                <Clock size={14} />
              )}
              <span>
                {doc.type === 'contract'
                  ? isSigned
                    ? 'Signed & Executed'
                    : isDeclined
                    ? 'Declined'
                    : 'Awaiting Signature'
                  : doc.type === 'proposal' || doc.type === 'quote'
                  ? isAccepted
                    ? 'Accepted by Client'
                    : isRejected
                    ? 'Declined'
                    : 'Awaiting Decision'
                  : doc.type === 'receipt'
                  ? 'Official Receipt (Settled)'
                  : doc.type === 'estimate'
                  ? 'Provisional Estimate'
                  : isPaid
                  ? 'Paid & Settled'
                  : 'Payment Due'}
              </span>
            </span>

            {doc.validUntil && (
              <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>
                Valid Until: {formatDate(doc.validUntil)}
              </span>
            )}
            {doc.dueDate && (
              <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>
                Due: {formatDate(doc.dueDate)}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <Link
              to="/app/documents"
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.375rem', textDecoration: 'none' }}
            >
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </Link>

            {/* Proposal / Quote Client Actions */}
            {(doc.type === 'proposal' || doc.type === 'quote') && !isAccepted && !isRejected && (
              <>
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#DC2626', borderColor: '#FECACA' }}
                >
                  <XCircle size={14} />
                  <span>Reject {doc.type === 'proposal' ? 'Proposal' : 'Quote'}</span>
                </button>
                <button
                  onClick={() => setAcceptModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#10B981', borderColor: '#10B981' }}
                >
                  <Check size={14} />
                  <span>Accept {doc.type === 'proposal' ? 'Proposal' : 'Quote'}</span>
                </button>
              </>
            )}

            {/* Contract Client Actions */}
            {doc.type === 'contract' && !isSigned && !isDeclined && (
              <>
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#DC2626', borderColor: '#FECACA' }}
                >
                  <XCircle size={14} />
                  <span>Decline Contract</span>
                </button>
                <button
                  onClick={() => setSignModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#0B1F3A', borderColor: '#0B1F3A' }}
                >
                  <PenTool size={14} color="#F59E0B" />
                  <span>Sign Contract</span>
                </button>
              </>
            )}

            {/* 1-Click Generate Invoice from Accepted Proposal / Quote or Estimate */}
            {(isAccepted || doc.type === 'estimate') && (
              <button
                onClick={handleGenerateInvoice}
                disabled={isConverting}
                className="btn btn-primary btn-sm"
                style={{ background: '#0B1F3A' }}
                title="Generate an Invoice from this approved document"
              >
                <Sparkles size={14} color="#F59E0B" />
                <span>{isConverting ? 'Generating...' : 'Generate Invoice'}</span>
              </button>
            )}

            {/* View Linked Receipt for Paid Invoices */}
            {doc.type === 'invoice' && isPaid && linkedReceipt && (
              <Link
                to={`/invoice/${linkedReceipt.id}`}
                className="btn btn-secondary btn-sm"
                style={{ background: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0' }}
              >
                <ReceiptIcon size={14} />
                <span>View Receipt #{linkedReceipt.documentNumber}</span>
              </Link>
            )}

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

        {/* Source Document Banner if Generated */}
        {doc.sourceDocumentNumber && (
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '0.875rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E40AF', fontSize: '0.875rem', fontWeight: 600 }}>
              <Layers size={16} />
              <span>
                Generated from {doc.sourceDocumentType ? doc.sourceDocumentType.toUpperCase() : 'source document'}{' '}
                <strong>#{doc.sourceDocumentNumber}</strong>
              </span>
            </div>
            {doc.sourceDocumentId && (
              <Link
                to={`/invoice/${doc.sourceDocumentId}`}
                style={{ fontSize: '0.8125rem', color: '#2563EB', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View Source Document</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        )}

        {/* Estimate Disclaimer Banner */}
        {doc.type === 'estimate' && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '0.875rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#92400E',
            }}
          >
            <AlertTriangle size={18} />
            <div style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
              <strong>PROVISIONAL ESTIMATE:</strong> Quantities and pricing shown below are provisional estimates for client budgeting and preliminary planning. Formal pricing is finalized upon contract or invoice issuance.
            </div>
          </div>
        )}

        {/* Rejection / Decline Notice Banner */}
        {(isRejected || isDeclined) && doc.rejectionReason && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              color: '#991B1B',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              {doc.type === 'contract' ? 'Decline Reason Feedback' : 'Client Rejection Reason'}
            </div>
            <div style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>
              "{doc.rejectionReason}"
            </div>
          </div>
        )}

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
                {doc.business.taxNumber && <div>Tax ID: {doc.business.taxNumber}</div>}
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
              {doc.validUntil && (
                <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                  Valid Until: {formatDate(doc.validUntil)}
                </div>
              )}
              {doc.dueDate && (
                <div style={{ fontSize: '0.8125rem', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
                  Due Date: {formatDate(doc.dueDate)}
                </div>
              )}
            </div>
          </div>

          {/* Recipient / Client Box */}
          <div style={{ marginBottom: '2rem', background: '#F8FAFC', padding: '1.25rem 1.5rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
              {doc.type === 'contract' ? 'Agreement Parties' : 'Prepared For / Billed To'}
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

          {/* Proposal Specific Sections: Executive Overview, Scope, Deliverables, Timeline */}
          {doc.type === 'proposal' && (
            <div style={{ marginBottom: '2.5rem' }}>
              {doc.projectOverview && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Executive Overview
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {doc.projectOverview}
                  </p>
                </div>
              )}

              {doc.scope && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Scope of Work & Objectives
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {doc.scope}
                  </p>
                </div>
              )}

              {doc.deliverables && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Key Deliverables
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {doc.deliverables}
                  </p>
                </div>
              )}

              {doc.timeline && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Milestone Timeline
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {doc.timeline}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contract Specific Sections: Agreement Terms, Parties, Scope, Obligations, Termination */}
          {doc.type === 'contract' && (
            <div style={{ marginBottom: '2.5rem' }}>
              {doc.contractTerms?.parties && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    1. The Parties & Purpose
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {doc.contractTerms.parties}
                  </p>
                </div>
              )}

              {doc.contractTerms?.effectiveDate && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    2. Effective Date & Engagement Period
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    This agreement is legally effective starting <strong>{formatDate(doc.contractTerms.effectiveDate)}</strong>.
                  </p>
                </div>
              )}

              {doc.contractTerms?.obligations && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    3. Mutual Obligations & Deliverable Standards
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {doc.contractTerms.obligations}
                  </p>
                </div>
              )}

              {doc.contractTerms?.governingLaw && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    4. Governing Jurisdiction & Termination
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    Jurisdiction: {doc.contractTerms.governingLaw}. {doc.contractTerms.terminationTerms || ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Line Items Table */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              {doc.type === 'contract' ? 'Agreed Pricing & Milestone Fees' : 'Itemized Services & Pricing'}
            </h3>
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
          </div>

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
                <span>{doc.type === 'receipt' ? 'Amount Settled' : doc.type === 'contract' ? 'Contract Value' : 'Total Amount'}</span>
                <span>{formatCurrency(doc.total, doc.currency)}</span>
              </div>
            </div>
          </div>

          {/* Digital Signature / Execution Seal */}
          {(doc.signature || doc.signerInfo || isSigned) && (
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <ShieldCheck size={16} />
                  <span>Verified Legal Digital Signature</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  Digitally executed by <strong>{doc.signature?.signerName || doc.signerInfo?.name || doc.client.name}</strong> on {formatDate(doc.signature?.signedAt || doc.signedAt || new Date().toISOString())}
                </div>
              </div>

              {(doc.signature?.image || doc.signerInfo?.signatureDataUrl) && (
                <img
                  src={doc.signature?.image || doc.signerInfo?.signatureDataUrl}
                  alt="Digital Signature"
                  style={{ maxHeight: '48px', maxWidth: '160px', objectFit: 'contain' }}
                />
              )}
            </div>
          )}

          {/* Receipt Settlement Metadata */}
          {doc.type === 'receipt' && (
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem', marginBottom: '2rem', background: '#F8FAFC', padding: '1.25rem 1.5rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Payment Settlement Acknowledgment
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                <div>
                  <div style={{ color: '#64748B' }}>Payment Method:</div>
                  <div style={{ fontWeight: 700, color: '#0B1F3A' }}>{doc.paymentMethod || 'Bank Transfer'}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B' }}>Settlement Ref:</div>
                  <div style={{ fontWeight: 700, color: '#0B1F3A' }}>{doc.paymentReference || 'CONFIRMED'}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B' }}>Settlement Date:</div>
                  <div style={{ fontWeight: 700, color: '#0B1F3A' }}>{formatDate(doc.date)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Notes & Terms */}
          {(doc.notes || doc.terms) && (
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem', fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.6 }}>
              {doc.notes && <p style={{ margin: '0 0 0.5rem 0' }}><strong>Notes:</strong> {doc.notes}</p>}
              {doc.terms && <p style={{ margin: 0 }}><strong>Terms & Conditions:</strong> {doc.terms}</p>}
            </div>
          )}

          {/* Related Documents Section */}
          {relatedDocs.length > 0 && (
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem', marginTop: '2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Layers size={14} />
                <span>Related Documents in this Lifecycle</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {relatedDocs.map((r) => (
                  <Link
                    key={r.id}
                    to={`/invoice/${r.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.875rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#0B1F3A',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ textTransform: 'uppercase', fontSize: '0.6875rem', color: '#64748B' }}>{r.type}</span>
                    <span>#{r.documentNumber}</span>
                    <ArrowRight size={13} color="#2563EB" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invoice Direct Bank Settlement Section (For Buyer) */}
        {doc.type === 'invoice' && !isPaid && (
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

            {doc.paymentDetails?.bankName && doc.paymentDetails?.accountNumber ? (
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={18} color="#0B1F3A" />
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0B1F3A' }}>
                      Direct Bank Transfer (0% Platform Fee)
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
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Beneficiary Name</div>
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
        )}

        {/* Accept Proposal / Quote Modal */}
        {acceptModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '1rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.5rem' }}>
                Accept {doc.type === 'proposal' ? 'Proposal' : 'Quote'} #{doc.documentNumber}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                Confirm your official acceptance of this {doc.type} for <strong>{formatCurrency(doc.total, doc.currency)}</strong>. The business owner will be immediately notified to initiate service delivery and billing.
              </p>

              <form onSubmit={handleAcceptDocument}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Your Full Legal / Authorized Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={acceptName}
                    onChange={(e) => setAcceptName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    required
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Your Confirmation Email
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={acceptEmail}
                    onChange={(e) => setAcceptEmail(e.target.value)}
                    placeholder="e.g. s.jenkins@horizonhealth.co"
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setAcceptModalOpen(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAccepting}
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '130px', justifyContent: 'center', background: '#10B981', borderColor: '#10B981' }}
                  >
                    {isAccepting ? 'Confirming...' : 'Confirm Acceptance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Proposal / Quote / Contract Modal */}
        {rejectModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '1rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.5rem' }}>
                Decline / Reject {doc.type.toUpperCase()} #{doc.documentNumber}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                Please provide feedback or the primary reason for declining this {doc.type}. Your message will be communicated directly to <strong>{doc.business.name}</strong>.
              </p>

              <form onSubmit={handleRejectDocument}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Reason for Declining *
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Budget constraints, project timeline adjustment needed, or scope revision required..."
                    required
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setRejectModalOpen(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRejecting}
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '130px', justifyContent: 'center', background: '#DC2626', borderColor: '#DC2626' }}
                  >
                    {isRejecting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contract Digital Signing Modal */}
        {signModalOpen && (
          <DigitalSignatureCanvas
            isOpen={signModalOpen}
            onClose={() => setSignModalOpen(false)}
            onSave={handleContractSigned}
            defaultSignerName={signerName || doc.client.name}
          />
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
                    placeholder="e.g. Chase / Bank of America / GTBank"
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
