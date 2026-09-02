import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  Eye,
  Edit3,
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
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');

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
    if (window.confirm(`Delete ${number}?`)) {
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

  return (
    <div>
      <SEO
        title={`Documents Ledger | ${BRAND_NAME}`}
        description="Comprehensive ledger of all business invoices, quotes, receipts, and proposals."
      />

      <PageHeader
        title="Documents"
        description="Centralized ledger of all issued and draft Invoices, Quotes, Receipts, and Proposals."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/app/documents/invoice" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>New Invoice</span>
            </Link>
            <Link to="/app/documents/quote" className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>New Quote / Estimate</span>
            </Link>
            <Link to="/app/documents/proposal" className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>New Proposal / Contract</span>
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
          { id: 'quote', label: 'Quotes & Estimates' },
          { id: 'receipt', label: 'Receipts' },
          { id: 'proposal', label: 'Proposals' },
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
            placeholder="Search by doc number, client, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          {(['all', 'draft', 'sent', 'viewed', 'accepted', 'paid', 'overdue', 'cancelled'] as const).map((s) => (
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
          description="Create your first professional invoice in minutes or clear your active filters."
          actionText="Create Invoice"
          onAction={() => window.location.assign('/documents/invoice')}
        />
      ) : (
        <div className="table-container">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    <Link to={`/app/documents/${d.type}`} style={{ color: 'var(--brand-navy-600)' }}>
                      {d.documentNumber}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>
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
                        background: d.status === 'paid' ? 'var(--status-success-bg)' : d.status === 'overdue' ? 'var(--status-danger-bg)' : 'var(--bg-surface)',
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="viewed">Viewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <a
                        href={d.type === 'invoice' ? `/invoice/${d.id}` : `/documents/${d.type}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm btn-icon"
                        title="View Document (Opens in new tab)"
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
