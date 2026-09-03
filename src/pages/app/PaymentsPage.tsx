import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  MoreVertical,
} from 'lucide-react';
import { Payment } from '../../types';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const PaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({ totalReceived: 0, pendingAmount: 0, overdueAmount: 0, overdueCount: 0, completedCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Record Payment Modal State
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<Payment['method']>('Bank Transfer');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await paymentService.getPayments({ search, status: statusFilter });
      const sum = await paymentService.getPaymentSummary();
      setPayments(list);
      setSummary(sum);
    } catch {
      showToast('Error loading payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !amount) {
      showToast('Client and Amount are required.', 'error');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await paymentService.recordPayment({
        invoiceId: 'doc-manual',
        invoiceNumber: invoiceNumber || 'INV-MANUAL',
        clientId: 'cli-manual',
        clientName,
        amount: Number(amount),
        currency: 'NGN',
        currencySymbol: '₦',
        method,
        date,
        status: 'completed',
        reference,
      });

      showToast('Payment recorded successfully in ledger!', 'success');
      setRecordModalOpen(false);
      setClientName('');
      setAmount(0);
      setReference('');
      loadData();
    } catch {
      showToast('Error recording payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      showToast('No payment records available to export.', 'info');
      return;
    }

    const headers = ['Date', 'Invoice Number', 'Client Name', 'Amount', 'Currency', 'Payment Method', 'Reference', 'Status'];
    const rows = payments.map((p) => [
      p.date,
      p.invoiceNumber,
      `"${p.clientName.replace(/"/g, '""')}"`,
      p.amount,
      p.currency,
      p.method,
      `"${(p.reference || '').replace(/"/g, '""')}"`,
      p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bizpilotly-payments-accounting-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ Accounting CSV exported successfully!', 'success');
  };

  return (
    <div>
      <SEO
        title={`Payment History & Tracking | ${BRAND_NAME}`}
        description="Track received funds, wire transfers, card settlements, and pending client invoices."
      />

      <PageHeader
        title="Payments"
        description="Comprehensive ledger of all incoming settlements, client deposits, and outstanding receivables."
        actions={
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <Button variant="secondary" size="sm" onClick={handleExportCSV} title="Export accountant-ready CSV ledger">
              <FileSpreadsheet size={14} />
              <span>Export Accounting CSV</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setRecordModalOpen(true)}>
              <Plus size={14} />
              <span>Record Payment</span>
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Total Received Funds</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-success-bg)', color: 'var(--status-success-text)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: '#047857' }}>
            {formatCurrency(summary.totalReceived)}
          </div>
          <div className="metric-card-subtext">
            <span>{summary.completedCount} completed settlements</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Pending / In-Clearing</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: '#b45309' }}>
            {formatCurrency(summary.pendingAmount)}
          </div>
          <div className="metric-card-subtext">
            <span>{summary.pendingCount} pending bank transfers</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Overdue Invoices</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: summary.overdueCount > 0 ? '#b91c1c' : 'inherit' }}>
            {formatCurrency(summary.overdueAmount, 'NGN', '₦')}
          </div>
          <div className="metric-card-subtext">
            <span>{summary.overdueCount} {summary.overdueCount === 1 ? 'invoice' : 'invoices'} past due terms</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search payments by client, reference, or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'completed', 'pending'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="skeleton" style={{ height: '54px', width: '100%' }} />
          <div className="skeleton" style={{ height: '54px', width: '100%' }} />
          <div className="skeleton" style={{ height: '54px', width: '100%' }} />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={28} />}
          title="No payments recorded"
          description="Log client payments once wire or card transfers settle."
          actionText="Record Payment"
          onAction={() => setRecordModalOpen(true)}
        />
      ) : (
        <>
          {/* 1. Desktop Data Table */}
          <div className="table-container desktop-table-view">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Client Name</th>
                  <th>Invoice #</th>
                  <th>Payment Method</th>
                  <th>Date Settled</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.paymentNumber}</td>
                    <td>{p.clientName}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-navy-600)' }}>{p.invoiceNumber}</td>
                    <td>{p.method}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(p.date)}</td>
                    <td style={{ fontWeight: 800, color: p.status === 'completed' ? '#047857' : 'var(--text-primary)' }}>
                      +{formatCurrency(p.amount, p.currency, p.currencySymbol)}
                    </td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {p.reference || '-'}
                    </td>
                    <td>
                      <Badge status={p.status}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Mobile Responsive Cards */}
          <div className="mobile-cards-view" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {payments.map((p) => {
              const isMenuOpen = activeMenuId === p.id;
              return (
                <div
                  key={p.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#64748b', marginRight: '0.5rem' }}>
                        {p.paymentNumber}
                      </span>
                      <strong style={{ fontSize: '0.9375rem', color: '#0B1F3A' }}>{p.clientName}</strong>
                    </div>

                    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : p.id)}
                        style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#64748b' }}
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
                            minWidth: '150px',
                            padding: '4px 0',
                          }}
                        >
                          <div
                            style={{
                              padding: '8px 12px',
                              fontSize: '0.8125rem',
                              color: '#64748b',
                              borderBottom: '1px solid #F1F5F9',
                            }}
                          >
                            Ref: {p.reference || 'N/A'}
                          </div>
                          <div
                            style={{
                              padding: '8px 12px',
                              fontSize: '0.8125rem',
                              color: '#0B1F3A',
                            }}
                          >
                            Method: {p.method}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                    <span>For Invoice: <strong>{p.invoiceNumber}</strong></span>
                    <strong style={{ fontSize: '1rem', color: p.status === 'completed' ? '#047857' : '#0B1F3A' }}>
                      +{formatCurrency(p.amount, p.currency, p.currencySymbol)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9', fontSize: '0.75rem' }}>
                    <span style={{ color: '#64748b' }}>Date: {formatDate(p.date)}</span>
                    <Badge status={p.status}>{p.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title="Record Incoming Payment"
      >
        <form onSubmit={handleRecordPayment}>
          <Input
            label="Client Name / Company"
            placeholder="e.g. Apex Digital Studio"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Associated Invoice #"
              placeholder="INV-2026-0001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
            <Input
              label="Amount Received (₦)"
              type="number"
              min="1"
              step="100"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
              >
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Stripe">Stripe</option>
                <option value="PayPal">PayPal</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Settlement Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Transaction Reference / Note"
            placeholder="e.g. WIRE-US-998234"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setRecordModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
              Confirm & Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
