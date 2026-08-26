import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { CreditCard, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          setPayments(data);
        }
      } catch (err) {
        console.error('Error loading payments for admin monitor:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const filtered = payments.filter((p) =>
    (p.payment_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.method || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.reference || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Platform Payments Ledger
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Real-time transaction tracking across manual bank transfers, wire settlements, and gateway webhooks.
        </p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', maxWidth: '360px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search payment number, method, reference..."
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
              <th>Payment #</th>
              <th>Channel / Provider</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Reference / Note</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading payments...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No payments logged yet.</td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0B1F3A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CreditCard size={16} color="#10B981" />
                      <span>{p.payment_number}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">
                      {p.provider && p.provider !== 'manual' ? `Gateway (${p.provider})` : `Manual (${p.method})`}
                    </span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>{formatDate(p.date || p.created_at)}</td>
                  <td style={{ fontWeight: 800, color: '#0B1F3A' }}>
                    {formatCurrency(p.amount, p.currency, p.currency_symbol)}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#64748B' }}>{p.reference || p.notes || '-'}</td>
                  <td>
                    <span className="badge badge-success">
                      {p.status}
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
