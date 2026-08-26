import React, { useEffect, useState } from 'react';
import { adminService, AdminAuditLogRow } from '../../services/adminService';
import { Search, Shield } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await adminService.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filtered = logs.filter((l) =>
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.targetType || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.actorUserId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Platform Security Audit Trail
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Immutable log of administrative operations, role modifications, and system interventions.
        </p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', maxWidth: '360px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search action, actor, target..."
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
              <th>Timestamp</th>
              <th>Actor (User UUID)</th>
              <th>Action</th>
              <th>Target Type</th>
              <th>Target ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading security logs...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No administrative actions logged yet.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id}>
                  <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>{formatDate(l.createdAt)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#0B1F3A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Shield size={12} color="#D4AF37" />
                      <span>{l.actorUserId.slice(0, 8)}...</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0B1F3A' }}>{l.action}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      {l.targetType}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
                    {l.targetId || '-'}
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
