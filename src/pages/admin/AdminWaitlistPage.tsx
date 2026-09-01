import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Download } from 'lucide-react';
import { waitlistService, WaitlistEntry } from '../../services/waitlistService';
import { useToast } from '../../components/common/Toast';

export const AdminWaitlistPage: React.FC = () => {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    waitlistService.getWaitlistEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const handleExportCSV = () => {
    if (entries.length === 0) {
      showToast('No waitlist entries to export.', 'info');
      return;
    }

    const headers = ['Email', 'Name', 'Plan', 'Source', 'User ID', 'Created At'];
    const rows = entries.map((e) => [
      `"${e.email}"`,
      `"${e.name || ''}"`,
      `"${e.plan || 'Pro'}"`,
      `"${e.source || 'web'}"`,
      `"${e.userId || ''}"`,
      `"${e.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bizpilotly_pro_waitlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${entries.length} waitlist records to CSV.`, 'success');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} color="#D4AF37" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
              Pro Plan Early Access Waitlist
            </h1>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Monitor and manage verified platform users interested in upgrading to the Pro Tier.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            background: '#0B1F3A',
            color: '#FFFFFF',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Download size={16} />
          <span>Export Waitlist CSV</span>
        </button>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1F3A' }}>
            Total In Queue: <span style={{ color: '#0284c7' }}>{entries.length} Leads</span>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(212, 175, 55, 0.15)', color: '#854d0e', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}>
            ✨ High-Intent Early Adopters
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading waitlist entries...</div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <Sparkles size={36} color="#CBD5E1" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontWeight: 600, color: '#334155' }}>No waitlist entries yet</div>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Users who click "Join Pro Waitlist" on the marketing page or in-app dashboard will appear here in real time.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#FAFAFA' }}>
                  <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>User / Email</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Plan Target</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Acquisition Channel</th>
                  <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={entry.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', fontWeight: 700, fontSize: '0.8125rem' }}>
                          {entry.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>
                            {entry.email}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {entry.name || 'Anonymous User'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#92400E' }}>
                        ⭐ {entry.plan || 'Pro'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#475569', textTransform: 'capitalize' }}>
                        {entry.source?.replace('_', ' ') || 'Dashboard'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={13} />
                        <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
