import React, { useEffect, useState } from 'react';
import { adminService, PlatformUserRow } from '../../services/adminService';
import { Search, ShieldCheck, User, Building, Sparkles } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<PlatformUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'business' | 'pending' | 'waitlist' | 'admin'>('all');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminService.getPlatformUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      (u.businessName && u.businessName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'business') return u.hasBusiness;
    if (activeFilter === 'pending') return !u.hasBusiness;
    if (activeFilter === 'waitlist') return u.isOnWaitlist;
    if (activeFilter === 'admin') return u.role === 'admin' || u.role === 'super_admin';

    return true;
  });

  const totalUsers = users.length;
  const totalBusinesses = users.filter((u) => u.hasBusiness).length;
  const totalWaitlist = users.filter((u) => u.isOnWaitlist).length;
  const totalAdmins = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', margin: '0 0 0.25rem 0' }}>
            User Accounts & Cohorts
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            Unified roster of registered users, business status, plans, and Pro waitlist leads.
          </p>
        </div>
      </div>

      {/* Cohort Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>All Registered Signups</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B1F3A', marginTop: '4px' }}>{totalUsers}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Configured Businesses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{totalBusinesses}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pro Waitlist Leads</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{totalWaitlist}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Platform Admins</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{totalAdmins}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === 'all' ? '#0B1F3A' : '#F1F5F9',
              color: activeFilter === 'all' ? '#FFFFFF' : '#475569',
            }}
          >
            All Signups ({totalUsers})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('business')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === 'business' ? '#0B1F3A' : '#F1F5F9',
              color: activeFilter === 'business' ? '#FFFFFF' : '#475569',
            }}
          >
            Active Businesses ({totalBusinesses})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === 'pending' ? '#0B1F3A' : '#F1F5F9',
              color: activeFilter === 'pending' ? '#FFFFFF' : '#475569',
            }}
          >
            Pending Setup ({totalUsers - totalBusinesses})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('waitlist')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === 'waitlist' ? '#D97706' : '#FEF3C7',
              color: activeFilter === 'waitlist' ? '#FFFFFF' : '#92400E',
            }}
          >
            ⭐ Pro Waitlist ({totalWaitlist})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('admin')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === 'admin' ? '#0B1F3A' : '#F1F5F9',
              color: activeFilter === 'admin' ? '#FFFFFF' : '#475569',
            }}
          >
            Admins ({totalAdmins})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', minWidth: '280px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search email, name, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>User / Email</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Business Workspace</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Plan & Interest</th>
              <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Signup Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading user accounts...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  No accounts matched your filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', fontWeight: 700, fontSize: '0.875rem' }}>
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>
                          {u.email}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                          UID: {u.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.role === 'admin' || u.role === 'super_admin' ? 'badge-gold' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                      {u.role === 'admin' || u.role === 'super_admin' ? <ShieldCheck size={12} style={{ marginRight: '4px' }} /> : <User size={12} style={{ marginRight: '4px' }} />}
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.hasBusiness ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0B1F3A', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Building size={14} color="#0284c7" />
                          <span>{u.businessName || 'Configured Workspace'}</span>
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                          ✓ Active Profile ({u.businessCurrency || 'NGN'})
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        Pending Onboarding
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#F1F5F9', color: '#334155' }}>
                        Free Forever
                      </span>
                      {u.isOnWaitlist && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Sparkles size={11} /> Pro Waitlist
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', color: '#64748B' }}>
                    {formatDate(u.createdAt)}
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
