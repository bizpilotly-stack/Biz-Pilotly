import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Download, CreditCard, ExternalLink } from 'lucide-react';
import { clientPortalService, ClientPortalStatement } from '../../services/clientPortalService';
import { formatCurrency } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO';

export const ClientPortalPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [statement, setStatement] = useState<ClientPortalStatement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      clientPortalService.getClientStatement(clientId).then((data) => {
        setStatement(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [clientId]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Client Portal Link Expired or Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please contact the business owner for a new statement link.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <SEO
        title={`Client Statement of Accounts | ${statement.client.name}`}
        description={`Secure client statement of accounts and invoice portal for ${statement.client.name}.`}
        canonical={`https://bizpilotly.com/portal/${clientId}`}
      />

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Top Header Card */}
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-2xl, 20px)', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#FEF3C7', color: '#B45309', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Layers size={13} />
                <span>Verified Client Statement</span>
              </div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', margin: 0 }}>
                {statement.client.name}
              </h1>
              {statement.client.company && (
                <div style={{ fontSize: '0.9375rem', color: '#64748B', fontWeight: 600 }}>{statement.client.company}</div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Issued By</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0B1F3A' }}>{statement.business.name}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>{statement.business.email}</div>
            </div>
          </div>

          {/* Statement Account Balance Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-xl, 16px)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Invoiced</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B1F3A', marginTop: '4px' }}>
                {formatCurrency(statement.totalInvoiced, statement.business.currency, statement.business.currencySymbol)}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-xl, 16px)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Settled</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
                {formatCurrency(statement.totalPaid, statement.business.currency, statement.business.currencySymbol)}
              </div>
            </div>

            <div style={{ background: statement.outstandingBalance > 0 ? '#FEF2F2' : '#F0FDF4', padding: '1.25rem', borderRadius: 'var(--radius-xl, 16px)', border: statement.outstandingBalance > 0 ? '1px solid #FECACA' : '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: statement.outstandingBalance > 0 ? '#991B1B' : '#166534', textTransform: 'uppercase' }}>Outstanding Balance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: statement.outstandingBalance > 0 ? '#DC2626' : '#16A34A', marginTop: '4px' }}>
                {formatCurrency(statement.outstandingBalance, statement.business.currency, statement.business.currencySymbol)}
              </div>
            </div>
          </div>
        </div>

        {/* Invoices & Documents Statement Table */}
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-2xl, 20px)', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
              Statement Invoices & Receipts
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Doc #</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {statement.documents.map((doc) => {
                  const docUrl = `/invoice/${doc.id}`;
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>
                        <Link
                          to={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#0B1F3A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {doc.documentNumber}
                          <ExternalLink size={12} color="#64748B" />
                        </Link>
                      </td>
                      <td style={{ padding: '1rem', color: '#334155', fontSize: '0.875rem' }}>
                        {doc.title}
                      </td>
                      <td style={{ padding: '1rem', color: '#64748B', fontSize: '0.8125rem' }}>
                        {doc.date}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#0B1F3A' }}>
                        {formatCurrency(doc.total, doc.currency, doc.currencySymbol)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            textTransform: 'uppercase',
                            background: doc.status === 'paid' ? '#D1FAE5' : doc.status === 'sent' ? '#EFF6FF' : '#FEF3C7',
                            color: doc.status === 'paid' ? '#065F46' : doc.status === 'sent' ? '#1E40AF' : '#92400E',
                          }}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link
                            to={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} />
                            <span>View</span>
                          </Link>
                          <button
                            onClick={() => window.open(docUrl, '_blank')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            title="Download PDF"
                          >
                            <Download size={12} />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank Transfer Payment Info Box */}
        {statement.business.bankAccountNumber && (
          <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-2xl, 20px)', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.125rem', color: '#0B1F3A', marginBottom: '0.75rem' }}>
              <CreditCard size={18} color="#0B1F3A" />
              <span>Direct Bank Settlement Details</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '1rem' }}>
              You may settle outstanding invoices directly into the official business account below:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-lg, 12px)' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Bank Name</div>
                <div style={{ fontWeight: 700, color: '#0B1F3A', fontSize: '0.875rem' }}>{statement.business.bankName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Account Name</div>
                <div style={{ fontWeight: 700, color: '#0B1F3A', fontSize: '0.875rem' }}>{statement.business.bankAccountName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Account Number</div>
                <div style={{ fontWeight: 800, color: '#0B1F3A', fontSize: '1rem', letterSpacing: '0.05em' }}>{statement.business.bankAccountNumber}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
