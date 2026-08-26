import React, { useEffect, useState } from 'react';
import { adminService, PlatformUserRow } from '../../services/adminService';
import { Search, ShieldCheck, User } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<PlatformUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredUsers = users.filter((u) =>
    u.id.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            User Accounts & Roles
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Registered platform accounts, authentication IDs, and assigned authorization roles.
          </p>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', maxWidth: '360px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by User UUID or role..."
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
              <th>User ID (UUID)</th>
              <th>Assigned Role</th>
              <th>Signup Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading user registry...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No accounts found. Create and assign roles in <code>user_roles</code> table.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem', color: '#0B1F3A' }}>
                    {u.id}
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' || u.role === 'super_admin' ? 'badge-gold' : 'badge-neutral'}`}>
                      {u.role === 'admin' || u.role === 'super_admin' ? <ShieldCheck size={12} style={{ marginRight: '4px' }} /> : <User size={12} style={{ marginRight: '4px' }} />}
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>Active</span>
                  </td>
                  <td>
                    <button
                      onClick={() => alert(`User Details:\nID: ${u.id}\nRole: ${u.role}\nCreated: ${u.createdAt}`)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Inspect
                    </button>
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
