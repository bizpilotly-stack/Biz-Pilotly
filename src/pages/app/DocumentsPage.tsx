import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  Eye,
  Edit3,
  Sparkles,
  MessageSquare,
  Layers,
  MoreVertical,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import { BusinessDocument, DocumentType, DocumentStatus } from '../../types';
import { documentService } from '../../services/documentService';
import { pdfService } from '../../services/pdf';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Rejection Reason Modal
  const [reasonModalDoc, setReasonModalDoc] = useState<BusinessDocument | null>(null);

  // Related Documents Tree Modal
  const [relatedModalDoc, setRelatedModalDoc] = useState<BusinessDocument | null>(null);
  const [relatedModalList, setRelatedModalList] = useState<BusinessDocument[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocuments({
        type: typeFilter,
        status: statusFilter,
        search,
      });
      setDocuments(docs);
    } catch {
      showToast('Error loading documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [search, typeFilter, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: DocumentStatus) => {
    try {
      await documentService.updateStatus(id, newStatus);
      showToast(`Document status updated to ${newStatus}`, 'success');
      loadDocuments();
    } catch {
      showToast('Error updating document status', 'error');
    }
  };

  const handleDelete = async (id: string, number: string) => {
    if (window.confirm(`Delete ${number}? This cannot be undone.`)) {
      await documentService.deleteDocument(id);
      showToast(`Document ${number} removed`, 'info');
      loadDocuments();
    }
  };

  const handleDownloadPdf = async (doc: BusinessDocument) => {
    setDownloadingId(doc.id);
    try {
      showToast(`Preparing PDF for #${doc.documentNumber}...`, 'info');
      const { downloadUrl, filename } = await pdfService.getSecureDownloadUrl(doc.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloaded #${doc.documentNumber} PDF!`, 'success');
    } catch (err: any) {
      console.warn('Falling back to local vector PDF render:', err);
      await pdfService.downloadDocumentLocally(doc);
      showToast(`Downloaded #${doc.documentNumber} PDF!`, 'success');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleGenerateInvoice = async (doc: BusinessDocument) => {
    setConvertingId(doc.id);
    try {
      let newInv: BusinessDocument;
      if (doc.type === 'proposal') {
        newInv = await documentService.generateInvoiceFromProposal(doc.id);
      } else if (doc.type === 'quote') {
        newInv = await documentService.generateInvoiceFromQuote(doc.id);
      } else if (doc.type === 'estimate') {
        newInv = await documentService.generateInvoiceFromEstimate(doc.id);
      } else {
        throw new Error('Unsupported conversion');
      }

      showToast(`✓ Generated Invoice #${newInv.documentNumber} from ${doc.type}!`, 'success');
      loadDocuments();
      navigate('/app/documents/invoice');
    } catch (err: any) {
      showToast(err?.message || 'Error generating invoice', 'error');
    } finally {
      setConvertingId(null);
    }
  };

  const openRelatedTree = async (doc: BusinessDocument) => {
    setRelatedModalDoc(doc);
    setLoadingRelated(true);
    try {
      const related = await documentService.getRelatedDocuments(doc.id);
      setRelatedModalList(related);
    } catch {
      setRelatedModalList([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  return (
    <div>
      <SEO
        title={`Documents Ledger | ${BRAND_NAME}`}
        description="Centralized ledger of all business Invoices, Quotes, Estimates, Proposals, Contracts, and Receipts."
      />

      <PageHeader
        title="Documents"
        description="Centralized ledger of all issued Invoices, Quotes, Estimates, Proposals, Contracts, and Receipts."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/app/documents/invoice" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>New Invoice</span>
            </Link>
            <Link to="/app/documents/quote" className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>New Quote</span>
            </Link>
            <Link to="/app/documents/estimate" className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>New Estimate</span>
            </Link>
            <Link to="/app/documents/proposal" className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>New Proposal</span>
            </Link>
            <Link to="/app/documents/contract" className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>New Contract</span>
            </Link>
            <Link to="/app/documents/receipt" className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>New Receipt</span>
            </Link>
          </div>
        }
      />

      {/* Tabs by Document Type */}
      <div className="tabs-container">
        {[
          { id: 'all', label: 'All Documents' },
          { id: 'invoice', label: 'Invoices' },
          { id: 'quote', label: 'Quotes' },
          { id: 'estimate', label: 'Estimates' },
          { id: 'proposal', label: 'Proposals' },
          { id: 'contract', label: 'Contracts' },
          { id: 'receipt', label: 'Receipts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id as any)}
            className={`tab-button ${typeFilter === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by document #, client, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          {(['all', 'draft', 'sent', 'viewed', 'accepted', 'rejected', 'signed', 'declined', 'paid', 'overdue', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Empty State */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="skeleton" style={{ height: '54px', width: '100%' }} />
          <div className="skeleton" style={{ height: '54px', width: '100%' }} />
          <div className="skeleton" style={{ height: '54px', width: '100%' }} />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No documents match your filters"
          description="Create a new invoice, quote, estimate, proposal, or contract to get started."
          actionText="Create Invoice"
          onAction={() => navigate('/app/documents/invoice')}
        />
      ) : (
        <>
          {/* 1. DESKTOP DATA TABLE (Tablets & Desktop) */}
          <div className="table-container desktop-table-view">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document #</th>
                  <th>Type</th>
                  <th>Client</th>
                  <th>Date Issued</th>
                  <th>Due / Valid</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Related</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => {
                  const isPaid = d.status === 'paid';
                  const isAccepted = d.status === 'accepted';
                  const isRejected = d.status === 'rejected';
                  const isSigned = d.status === 'signed';
                  const isDeclined = d.status === 'declined';

                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        <Link to={`/app/documents/${d.type}`} style={{ color: 'var(--brand-navy-600)' }}>
                          {d.documentNumber}
                        </Link>
                      </td>
                      <td>
                        <span
                          className="badge badge-neutral"
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.6875rem',
                            background:
                              d.type === 'proposal'
                                ? '#EFF6FF'
                                : d.type === 'contract'
                                ? '#F5F3FF'
                                : d.type === 'receipt'
                                ? '#ECFDF5'
                                : d.type === 'estimate'
                                ? '#FFFBEB'
                                : undefined,
                            color:
                              d.type === 'proposal'
                                ? '#1E40AF'
                                : d.type === 'contract'
                                ? '#6D28D9'
                                : d.type === 'receipt'
                                ? '#065F46'
                                : d.type === 'estimate'
                                ? '#92400E'
                                : undefined,
                          }}
                        >
                          {d.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.client.name}</div>
                        {d.client.company && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.client.company}</div>}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(d.date)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(d.dueDate || d.validUntil || '-')}</td>
                      <td style={{ fontWeight: 800, fontSize: '0.9375rem' }}>
                        {formatCurrency(d.total, d.currency, d.currencySymbol)}
                      </td>
                      <td>
                        <select
                          value={d.status}
                          onChange={(e) => handleUpdateStatus(d.id, e.target.value as DocumentStatus)}
                          className="form-select"
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            width: 'auto',
                            textTransform: 'capitalize',
                            background:
                              isPaid || isAccepted || isSigned
                                ? '#D1FAE5'
                                : isRejected || isDeclined
                                ? '#FEE2E2'
                                : d.status === 'overdue'
                                ? '#FEE2E2'
                                : 'var(--bg-surface)',
                            color:
                              isPaid || isAccepted || isSigned
                                ? '#065F46'
                                : isRejected || isDeclined
                                ? '#991B1B'
                                : d.status === 'overdue'
                                ? '#991B1B'
                                : undefined,
                          }}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="viewed">Viewed</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="signed">Signed</option>
                          <option value="declined">Declined</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Related Document Chains */}
                      <td>
                        {d.sourceDocumentNumber ? (
                          <button
                            type="button"
                            onClick={() => openRelatedTree(d)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#2563EB',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                            title={`Source: ${d.sourceDocumentType} #${d.sourceDocumentNumber}`}
                          >
                            <Layers size={13} />
                            <span>#{d.sourceDocumentNumber}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openRelatedTree(d)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              color: '#94A3B8',
                              fontSize: '0.75rem',
                            }}
                            title="View document chain"
                          >
                            <Layers size={14} />
                          </button>
                        )}
                      </td>

                      {/* Contextual Actions */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                          {(isAccepted || d.type === 'estimate') && (
                            <button
                              onClick={() => handleGenerateInvoice(d)}
                              disabled={convertingId === d.id}
                              className="btn btn-ghost btn-sm btn-icon"
                              style={{ color: '#10B981' }}
                              title="Generate Invoice from this document"
                            >
                              <Sparkles size={15} />
                            </button>
                          )}

                          {(isRejected || isDeclined) && d.rejectionReason && (
                            <button
                              onClick={() => setReasonModalDoc(d)}
                              className="btn btn-ghost btn-sm btn-icon"
                              style={{ color: '#DC2626' }}
                              title="View Feedback / Decline Reason"
                            >
                              <MessageSquare size={15} />
                            </button>
                          )}

                          <a
                            href={`/invoice/${d.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-sm btn-icon"
                            title="View public document"
                          >
                            <Eye size={15} color="#2563EB" />
                          </a>

                          <Link
                            to={`/app/documents/${d.type}`}
                            className="btn btn-ghost btn-sm btn-icon"
                            title="Edit in builder"
                          >
                            <Edit3 size={15} color="#475569" />
                          </Link>

                          <button
                            onClick={() => handleDownloadPdf(d)}
                            className="btn btn-ghost btn-sm btn-icon"
                            title="Download PDF"
                            disabled={downloadingId === d.id}
                          >
                            <Download size={15} color="#0B1F3A" />
                          </button>

                          <button
                            onClick={() => handleDelete(d.id, d.documentNumber)}
                            className="btn btn-ghost btn-sm btn-icon"
                            style={{ color: '#ef4444' }}
                            title="Delete document"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE RESPONSIVE CARDS (Phones <= 768px) */}
          <div className="mobile-cards-view" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {documents.map((d) => {
              const isPaid = d.status === 'paid';
              const isAccepted = d.status === 'accepted';
              const isRejected = d.status === 'rejected';
              const isSigned = d.status === 'signed';
              const isDeclined = d.status === 'declined';
              const isMenuOpen = activeMenuId === d.id;

              return (
                <div
                  key={d.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <span
                        className="badge"
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          marginRight: '0.5rem',
                          background:
                            d.type === 'proposal'
                              ? '#EFF6FF'
                              : d.type === 'contract'
                              ? '#F5F3FF'
                              : d.type === 'receipt'
                              ? '#ECFDF5'
                              : d.type === 'estimate'
                              ? '#FFFBEB'
                              : '#F1F5F9',
                          color:
                            d.type === 'proposal'
                              ? '#1E40AF'
                              : d.type === 'contract'
                              ? '#6D28D9'
                              : d.type === 'receipt'
                              ? '#065F46'
                              : d.type === 'estimate'
                              ? '#92400E'
                              : '#475569',
                        }}
                      >
                        {d.type}
                      </span>
                      <strong style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-mono)', color: '#0B1F3A' }}>
                        #{d.documentNumber}
                      </strong>
                    </div>

                    {/* 3-Dot Actions Menu */}
                    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : d.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          color: '#64748b',
                          borderRadius: '4px',
                        }}
                        aria-label="Actions Menu"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {isMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            background: '#ffffff',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                            zIndex: 50,
                            minWidth: '160px',
                            padding: '4px 0',
                          }}
                        >
                          <a
                            href={`/invoice/${d.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              fontSize: '0.8125rem',
                              color: '#2563EB',
                              textDecoration: 'none',
                            }}
                          >
                            <Eye size={14} />
                            <span>View Document</span>
                          </a>

                          <Link
                            to={`/app/documents/${d.type}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              fontSize: '0.8125rem',
                              color: '#0B1F3A',
                              textDecoration: 'none',
                            }}
                          >
                            <Edit3 size={14} />
                            <span>Edit in Builder</span>
                          </Link>

                          {(isAccepted || d.type === 'estimate') && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleGenerateInvoice(d);
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                fontSize: '0.8125rem',
                                color: '#10B981',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontWeight: 600,
                              }}
                            >
                              <Sparkles size={14} />
                              <span>Generate Invoice</span>
                            </button>
                          )}

                          {(isRejected || isDeclined) && d.rejectionReason && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setReasonModalDoc(d);
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                fontSize: '0.8125rem',
                                color: '#DC2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <MessageSquare size={14} />
                              <span>View Feedback</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleDownloadPdf(d);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              padding: '8px 12px',
                              fontSize: '0.8125rem',
                              color: '#0B1F3A',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Download size={14} />
                            <span>Download PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              openRelatedTree(d);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              padding: '8px 12px',
                              fontSize: '0.8125rem',
                              color: '#64748B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Layers size={14} />
                            <span>Related Chain</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleDelete(d.id, d.documentNumber);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              padding: '8px 12px',
                              fontSize: '0.8125rem',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} />
                      <strong style={{ color: '#1e293b' }}>{d.client.name}</strong>
                    </div>

                    <strong style={{ fontSize: '1rem', color: '#0B1F3A' }}>
                      {formatCurrency(d.total, d.currency, d.currencySymbol)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9', fontSize: '0.75rem' }}>
                    <span style={{ color: '#64748B' }}>Issued: {formatDate(d.date)}</span>

                    <select
                      value={d.status}
                      onChange={(e) => handleUpdateStatus(d.id, e.target.value as DocumentStatus)}
                      className="form-select"
                      style={{
                        padding: '0.15rem 0.4rem',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        width: 'auto',
                        textTransform: 'capitalize',
                        background:
                          isPaid || isAccepted || isSigned
                            ? '#D1FAE5'
                            : isRejected || isDeclined
                            ? '#FEE2E2'
                            : d.status === 'overdue'
                            ? '#FEE2E2'
                            : '#F1F5F9',
                        color:
                          isPaid || isAccepted || isSigned
                            ? '#065F46'
                            : isRejected || isDeclined
                            ? '#991B1B'
                            : d.status === 'overdue'
                            ? '#991B1B'
                            : '#475569',
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="viewed">Viewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="signed">Signed</option>
                      <option value="declined">Declined</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Rejection / Decline Reason Inspection Modal */}
      {reasonModalDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.5rem' }}>
              Client Feedback: #{reasonModalDoc.documentNumber}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Submitted by <strong>{reasonModalDoc.client.name}</strong> on {formatDate(reasonModalDoc.rejectedAt || reasonModalDoc.updatedAt)}.
            </p>

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '1rem', color: '#991B1B', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              "{reasonModalDoc.rejectionReason || 'No specific reason provided.'}"
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setReasonModalDoc(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Documents Tree Modal */}
      {relatedModalDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#2563EB" />
              <span>Document Lifecycle Tree</span>
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '1.5rem' }}>
              Trace source relationships and downstream generated documents for #{relatedModalDoc.documentNumber}.
            </p>

            {loadingRelated ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B' }}>Loading related documents...</div>
            ) : relatedModalList.length === 0 ? (
              <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                No parent or downstream documents linked to #{relatedModalDoc.documentNumber}.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {relatedModalList.map((rel) => (
                  <div
                    key={rel.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <span style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 800, color: '#2563EB', marginRight: '0.5rem' }}>
                        {rel.type}
                      </span>
                      <strong style={{ fontSize: '0.875rem', color: '#0B1F3A' }}>#{rel.documentNumber}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {formatCurrency(rel.total, rel.currency)} • Status: {rel.status}
                      </div>
                    </div>
                    <a
                      href={`/invoice/${rel.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRelatedModalDoc(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
