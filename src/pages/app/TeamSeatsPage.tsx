import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { teamService, TeamMember, TeamRole } from '../../services/teamService';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const TeamSeatsPage: React.FC = () => {
  const { showToast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('editor');

  const loadMembers = async () => {
    try {
      const data = await teamService.getTeamMembers();
      setMembers(data);
    } catch {
      showToast('Could not load team members.', 'error');
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      await teamService.inviteMember(email, role, name);
      showToast(`Invitation sent to ${email}!`, 'success');
      setIsInviteModalOpen(false);
      setName('');
      setEmail('');
      loadMembers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to invite team member.', 'error');
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (window.confirm(`Remove ${name} from this business workspace?`)) {
      await teamService.removeMember(id);
      showToast('Team member seat freed.', 'success');
      loadMembers();
    }
  };

  const seatsUsed = members.length;
  const maxSeats = 5;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="#0B1F3A" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', margin: 0 }}>
              Team Members & Permissions
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            Collaborate with your agency partners and accountants under one unified workspace.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsInviteModalOpen(true)}
          disabled={seatsUsed >= maxSeats}
        >
          <Plus size={16} />
          <span>Invite Team Member</span>
        </Button>
      </div>

      {/* Seat Meter Banner */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--brand-black)' }}>
            Business Suite Seats: {seatsUsed} of {maxSeats} in Use
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '999px' }}>
            {maxSeats - seatsUsed} Seats Available
          </span>
        </div>

        <div style={{ height: '8px', background: 'var(--bg-surface-muted)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(seatsUsed / maxSeats) * 100}%`,
              background: '#0B1F3A',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Members Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Member</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Role</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date Added</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0B1F3A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--brand-black)' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase', background: m.role === 'admin' ? '#FEF3C7' : '#EFF6FF', color: m.role === 'admin' ? '#B45309' : '#1E40AF' }}>
                      {m.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: m.status === 'active' ? '#10B981' : '#F59E0B' }}>
                      {m.status === 'active' ? '● Active' : '○ Invite Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {new Date(m.invitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    {idx !== 0 && (
                      <button
                        onClick={() => handleRemove(m.id, m.name)}
                        className="btn btn-secondary btn-icon btn-sm"
                        title="Remove member seat"
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInvite}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Invited members receive full workspace access based on their assigned role.
          </p>

          <Input label="Full Name" placeholder="e.g. Samuel Adeyemi" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email Address" type="email" placeholder="samuel@agency.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Assigned Permission Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value as TeamRole)}>
              <option value="editor">Editor (Create and edit invoices, quotes, and clients)</option>
              <option value="viewer">Viewer (Read-only financial and statement access)</option>
              <option value="admin">Admin (Full access to settings and team management)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Seat Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
