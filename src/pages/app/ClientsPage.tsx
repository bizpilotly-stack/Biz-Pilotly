import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  FileText,
  Trash2,
  AlertCircle,
  X,
  Globe,
  Copy,
  ExternalLink,
  MoreVertical,
} from 'lucide-react';
import { Client } from '../../types';
import { clientService } from '../../services/clientService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

export const ClientsPage: React.FC = () => {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Add Client Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCurrency, setNewCurrency] = useState('NGN');

  const loadClients = async () => {
    setLoading(true);
    setErrorState(false);
    try {
      const data = await clientService.getClients({ search, status: statusFilter });
      setClients(data);
      if (data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
      }
    } catch {
      setErrorState(true);
      showToast('Failed to load clients list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search, statusFilter]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      showToast('Name and Email are required.', 'error');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const created = await clientService.createClient({
        name: newName,
        company: newCompany,
        email: newEmail,
        phone: newPhone,
        address: newAddress,
        currency: newCurrency,
        status: 'active',
      });
      showToast(`Client "${created.name}" created successfully!`, 'success');
      setAddModalOpen(false);
      setNewName('');
      setNewCompany('');
      setNewEmail('');
      setNewPhone('');
      setNewAddress('');
      loadClients();
      setSelectedClient(created);
    } catch {
      showToast('Error creating client record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await clientService.deleteClient(id);
      showToast(`Client ${name} removed`, 'info');
      setSelectedClient(null);
      loadClients();
    }
  };

  return (
    <div>
      <SEO
        title={`Client Management | ${BRAND_NAME}`}
        description="Manage your client directory, contact details, total billed revenue, and open balances."
      />

      <PageHeader
        title="Clients"
        description="Organize your customer directory, ongoing scopes, lifetime value, and payment history."
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus size={14} />
            <span>Add Client</span>
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by client name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'active', 'lead', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* States: Loading, Error, Empty, Populated */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '64px', width: '100%' }} />
          <div className="skeleton" style={{ height: '64px', width: '100%' }} />
          <div className="skeleton" style={{ height: '64px', width: '100%' }} />
        </div>
      ) : errorState ? (
        <div className="empty-state">
          <AlertCircle size={40} color="#ef4444" />
          <h3 className="empty-state-title">Failed to load client records</h3>
          <p className="empty-state-desc">There was an unexpected error retrieving your data.</p>
          <Button variant="primary" onClick={loadClients}>Retry Loading</Button>
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No clients found"
          description="Your clients will appear here once you add your first client or adjust your search filter."
          actionText="Add Client"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedClient ? '1.5fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Clients List: Desktop Table + Mobile Cards */}
          <div>
            {/* 1. Desktop Table */}
            <div className="table-container desktop-table-view">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client / Company</th>
                    <th>Contact</th>
                    <th>Total Billed</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => {
                    const isSelected = selectedClient?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedClient(c)}
                        style={{ cursor: 'pointer', backgroundColor: isSelected ? 'var(--brand-navy-50)' : undefined }}
                      >
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                          {c.company && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.company}</div>}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{c.email}</div>
                          {c.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}</div>}
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(c.totalBilled, c.currency)}</td>
                        <td style={{ fontWeight: 700, color: c.balance > 0 ? '#b45309' : '#047857' }}>
                          {formatCurrency(c.balance, c.currency)}
                        </td>
                        <td>
                          <Badge status={c.status}>{c.status}</Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/portal/${c.id}`, '_blank');
                              }}
                              className="btn btn-ghost btn-sm btn-icon"
                              title="Open Client Portal Statement"
                            >
                              <ExternalLink size={15} color="#1d4ed8" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`${window.location.origin}/portal/${c.id}`);
                                showToast(`✓ Copied Portal link for ${c.name}!`, 'success');
                              }}
                              className="btn btn-ghost btn-sm btn-icon"
                              title="Copy Client Portal Link"
                            >
                              <Copy size={15} color="#475569" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(c.id, c.name);
                              }}
                              className="btn btn-ghost btn-sm btn-icon"
                              style={{ color: '#ef4444' }}
                              title="Delete client"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. Mobile Responsive Cards */}
            <div className="mobile-cards-view" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {clients.map((c) => {
                const isMenuOpen = activeMenuId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0B1F3A' }}>{c.name}</div>
                        {c.company && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.company}</div>}
                      </div>

                      {/* 3-Dot Actions Menu */}
                      <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : c.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            color: '#64748b',
                            borderRadius: '4px',
                          }}
                          aria-label="Actions Menu"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {isMenuOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              background: '#ffffff',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                              zIndex: 50,
                              minWidth: '160px',
                              padding: '4px 0',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                window.open(`/portal/${c.id}`, '_blank');
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                fontSize: '0.8125rem',
                                color: '#1d4ed8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <ExternalLink size={14} />
                              <span>Open Portal</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                navigator.clipboard.writeText(`${window.location.origin}/portal/${c.id}`);
                                showToast(`✓ Copied Portal link for ${c.name}!`, 'success');
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                fontSize: '0.8125rem',
                                color: '#0B1F3A',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Copy size={14} />
                              <span>Copy Portal Link</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setSelectedClient(c);
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                fontSize: '0.8125rem',
                                color: '#0B1F3A',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <FileText size={14} />
                              <span>View Statement</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleDeleteClient(c.id, c.name);
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                fontSize: '0.8125rem',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Trash2 size={14} />
                              <span>Delete Client</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      {c.email} {c.phone && `• ${c.phone}`}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                      <div>
                        <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Billed: </span>
                        <strong>{formatCurrency(c.totalBilled, c.currency)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Balance: </span>
                        <strong style={{ color: c.balance > 0 ? '#b45309' : '#047857' }}>
                          {formatCurrency(c.balance, c.currency)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Profile Card / Drawer */}
          {selectedClient && (
            <div className="card" style={{ border: '1px solid var(--brand-navy-500)', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                    {selectedClient.name}
                  </h3>
                  {selectedClient.company && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {selectedClient.company}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="btn btn-ghost btn-icon btn-sm"
                  aria-label="Close client card"
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} color="#64748b" />
                  <span>{selectedClient.email}</span>
                </div>
                {selectedClient.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} color="#64748b" />
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
                {selectedClient.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Building size={14} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedClient.address}</span>
                  </div>
                )}
              </div>

              {/* Client Portal Action Banner */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '0.875rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={16} color="#16A34A" />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#166534' }}>Passwordless Client Portal</div>
                    <div style={{ fontSize: '0.6875rem', color: '#15803D' }}>Live statement of accounts & invoice history</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/portal/${selectedClient.id}`);
                      showToast(`✓ Copied Client Portal Link!`, 'success');
                    }}
                    className="btn btn-sm"
                    style={{ background: '#ffffff', color: '#166534', border: '1px solid #86EFAC', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    <Copy size={12} />
                    <span>Copy Link</span>
                  </button>
                  <a
                    href={`/portal/${selectedClient.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{ background: '#16A34A', color: '#ffffff', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
                  >
                    <ExternalLink size={12} />
                    <span>View</span>
                  </a>
                </div>
              </div>

              {/* Financial Stats */}
              <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Billed</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-black)' }}>
                    {formatCurrency(selectedClient.totalBilled, selectedClient.currency)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Outstanding Balance</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: selectedClient.balance > 0 ? '#b45309' : '#047857' }}>
                    {formatCurrency(selectedClient.balance, selectedClient.currency)}
                  </div>
                </div>
              </div>

              {/* Recent Documents for this Client */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="#1d4ed8" />
                  <span>Recent Documents</span>
                </h4>
                {selectedClient.recentDocuments && selectedClient.recentDocuments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedClient.recentDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--bg-surface-muted)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{doc.number}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{formatDate(doc.date)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700 }}>{formatCurrency(doc.amount, selectedClient.currency)}</div>
                          <Badge status={doc.status}>{doc.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No recent documents for this client.</p>
                )}
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <Link to="/documents/invoice" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={14} />
                  <span>Create Invoice for {selectedClient.name.split(' ')[0]}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Client"
      >
        <form onSubmit={handleAddClient}>
          <Input
            label="Full Contact Name"
            placeholder="e.g. Marcus Vance"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Input
            label="Company / Studio"
            placeholder="e.g. Vance Capital Partners"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="m.vance@company.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <Input
            label="Billing Address"
            placeholder="100 Wall Street, Floor 24, New York, NY"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />
          <div className="form-group">
            <label className="form-label">Billing Currency</label>
            <select
              className="form-select"
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value)}
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="AUD">AUD (AU$)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
              Save Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
