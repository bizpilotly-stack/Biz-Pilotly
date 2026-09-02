import React, { useEffect, useState } from 'react';
import { adminService, PlatformUserRow } from '../../services/adminService';
import { Search, ShieldCheck, User, Building } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<PlatformUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'trial' | 'free' | 'pro' | 'business' | 'admin'>('all');

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

    if (activeFilter === 'trial') return u.subscriptionStatus === 'TRIAL_ACTIVE';
    if (activeFilter === 'free') return u.subscriptionStatus === 'FREE' || u.subscriptionStatus === 'TRIAL_EXPIRED';
    if (activeFilter === 'pro') return u.plan === 'pro' && u.subscriptionStatus === 'ACTIVE';
    if (activeFilter === 'business') return u.plan === 'business' && u.subscriptionStatus === 'ACTIVE';
    if (activeFilter === 'admin') return u.role === 'admin' || u.role === 'super_admin';

    return true;
  });

  const totalUsers = users.length;
  const totalTrials = users.filter((u) => u.subscriptionStatus === 'TRIAL_ACTIVE').length;
  const totalFree = users.filter((u) => u.subscriptionStatus === 'FREE' || u.subscriptionStatus === 'TRIAL_EXPIRED').length;
  const totalPro = users.filter((u) => u.plan === 'pro' && u.subscriptionStatus === 'ACTIVE').length;
  const totalBusiness = users.filter((u) => u.plan === 'business' && u.subscriptionStatus === 'ACTIVE').length;
  const totalAdmins = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', margin: '0 0 0.25rem 0' }}>
            User Accounts & Subscriptions
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            Master directory of registered users, active 15-day free trials, and paid subscribers.
          </p>
        </div>
      </div>

      {/* Cohort Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>All Registered Signups</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B1F3A', marginTop: '4px' }}>{totalUsers}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>15-Day Free Trials</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>{totalTrials}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Free Starter Tier</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#64748B', marginTop: '4px' }}>{totalFree}</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Platform Admins</div>
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
            onClick={() => setActiveFilter('trial')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === 'trial' ? '#0B1F3A' : '#F1F5F9',
              color: activeFilter === 'trial' ? '#FFFFFF' : '#475569',
            }}
          >
            15-Day Trials ({totalTrials})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('free')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === 'free' ? '#0B1F3A' : '#F1F5F9',
              color: activeFilter === 'free' ? '#FFFFFF' : '#475569',
            }}
          >
            Free Starter ({totalFree})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pro')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === 'pro' ? '#0B1F3A' : '#F1F5F9',
              color: activeFilter === 'pro' ? '#FFFFFF' : '#475569',
            }}
          >
            Pro Active ({totalPro})
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
            Business Suite ({totalBusiness})
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

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search email, name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Users Roster Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 1rem' }}>User Profile</th>
                <th style={{ padding: '0.75rem 1rem' }}>Auth Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Subscription Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Business Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Docs Issued</th>
                <th style={{ padding: '0.75rem 1rem' }}>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                    Loading user roster from database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                    No users found matching current filter or search term.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0B1F3A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0B1F3A' }}>{u.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontFamily: 'monospace' }}>{u.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {u.subscriptionStatus === 'TRIAL_ACTIVE' ? (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '999px' }}>
                          🎁 15-Day Trial ({u.trialDaysLeft}d left)
                        </span>
                      ) : u.plan === 'pro' && u.subscriptionStatus === 'ACTIVE' ? (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '999px' }}>
                          ⭐ Pro Active
                        </span>
                      ) : u.plan === 'business' && u.subscriptionStatus === 'ACTIVE' ? (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#F5F3FF', color: '#6D28D9', padding: '2px 8px', borderRadius: '999px' }}>
                          👑 Business Suite
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '999px' }}>
                          🆓 Free Starter
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {u.businessName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#0F172A', fontWeight: 600 }}>
                          <Building size={13} color="#0284c7" />
                          <span>{u.businessName}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontStyle: 'italic' }}>Pending Business Setup</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${u.role === 'admin' || u.role === 'super_admin' ? 'badge-gold' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                        {u.role === 'admin' || u.role === 'super_admin' ? <ShieldCheck size={12} style={{ marginRight: '4px' }} /> : <User size={12} style={{ marginRight: '4px' }} />}
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0B1F3A' }}>
                      {u.documentCount}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#64748B', fontSize: '0.8125rem' }}>
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
