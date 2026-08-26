import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Mail, Search } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminEmailsPage: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadEmails = async () => {
      try {
        const { data, error } = await supabase
          .from('email_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          setEmails(data);
        }
      } catch (err) {
        console.error('Error loading email logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEmails();
  }, []);

  const filtered = emails.filter((e) =>
    (e.recipient_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.template_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Transactional Email Dispatch Logs
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Real-time delivery status, Resend telemetry, and client notifications.
        </p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', maxWidth: '360px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search recipient, template, subject..."
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
              <th>Template Type</th>
              <th>Recipient Email</th>
              <th>Subject</th>
              <th>Sent Timestamp</th>
              <th>Status</th>
              <th>Resend ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading email logs...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No transactional emails logged yet.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} color="#6366F1" />
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                        {e.template_type}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0B1F3A' }}>{e.recipient_email}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{e.subject}</td>
                  <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>{formatDate(e.sent_at || e.created_at)}</td>
                  <td>
                    <span className={`badge ${e.status === 'sent' || e.status === 'delivered' ? 'badge-success' : 'badge-danger'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>{e.resend_id || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
