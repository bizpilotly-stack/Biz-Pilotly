import React, { useEffect, useState } from 'react';
import { adminService, PlatformBusinessRow } from '../../services/adminService';
import { Building2, Search } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminBusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<PlatformBusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await adminService.getPlatformBusinesses();
        setBusinesses(data);
      } catch (err) {
        console.error('Error loading businesses:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.currency.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Registered Businesses
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Tenant workspaces, base currencies, and activity telemetry.
        </p>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', maxWidth: '360px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search business name or currency..."
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
              <th>Business Name</th>
              <th>Base Currency</th>
              <th>Created Date</th>
              <th>Customers</th>
              <th>Documents</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading businesses...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No businesses found.</td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700, color: '#0B1F3A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={16} color="#3B82F6" />
                      <span>{b.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{b.currency}</span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>{formatDate(b.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{b.customerCount}</td>
                  <td style={{ fontWeight: 600 }}>{b.documentCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
