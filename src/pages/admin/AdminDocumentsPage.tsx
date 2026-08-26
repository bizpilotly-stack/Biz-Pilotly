import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { FileText, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id, document_number, type, total, currency, currency_symbol, status, created_at, pdf_storage_path')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          setDocuments(data);
        }
      } catch (err) {
        console.error('Error loading documents for admin monitor:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, []);

  const filtered = documents.filter((d) =>
    (d.document_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Platform Documents Monitor
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Cross-tenant audit ledger of invoices, quotes, receipts, and proposals.
        </p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', maxWidth: '360px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search document number or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Document #</th>
              <th>Type</th>
              <th>Date Created</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>PDF Cloud Stored</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading documents...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No documents found.</td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0B1F3A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} color="#0B1F3A" />
                      <span>{d.document_number}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                      {d.type}
                    </span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>{formatDate(d.created_at)}</td>
                  <td style={{ fontWeight: 800 }}>
                    {formatCurrency(d.total, d.currency, d.currency_symbol)}
                  </td>
                  <td>
                    <span className={`badge ${d.status === 'paid' ? 'badge-success' : d.status === 'overdue' ? 'badge-danger' : 'badge-neutral'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${d.pdf_storage_path ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.6875rem' }}>
                      {d.pdf_storage_path ? '✓ Stored in Supabase' : 'Not Generated'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
