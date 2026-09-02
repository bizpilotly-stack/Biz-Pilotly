import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Play, Pause, Trash2, Calendar } from 'lucide-react';
import { recurringInvoiceService, RecurringSchedule, RecurringFrequency } from '../../services/recurringInvoiceService';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';

export const RecurringInvoicesPage: React.FC = () => {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [amount, setAmount] = useState<number>(50000);
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [nextRunDate, setNextRunDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('Monthly Retainer Services');

  const loadSchedules = async () => {
    try {
      const data = await recurringInvoiceService.getSchedules();
      setSchedules(data);
    } catch {
      showToast('Could not load recurring schedules.', 'error');
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || !amount) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    try {
      await recurringInvoiceService.createSchedule({
        title: title.trim(),
        clientId: `client_${Date.now()}`,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        amount: Number(amount),
        currency: 'NGN',
        frequency,
        nextRunDate,
        status: 'active',
        autoSendEmail: true,
        items: [
          {
            id: '1',
            description: description.trim() || title.trim(),
            quantity: 1,
            unitPrice: Number(amount),
            total: Number(amount),
          },
        ],
      });
      showToast('Recurring retainer created successfully!', 'success');
      setIsModalOpen(false);
      setTitle('');
      setClientName('');
      setClientEmail('');
      loadSchedules();
    } catch {
      showToast('Failed to create recurring retainer.', 'error');
    }
  };

  const handleToggleStatus = async (s: RecurringSchedule) => {
    const newStatus = s.status === 'active' ? 'paused' : 'active';
    await recurringInvoiceService.updateStatus(s.id, newStatus);
    showToast(`Schedule ${newStatus === 'active' ? 'resumed' : 'paused'}.`, 'info');
    loadSchedules();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this recurring schedule?')) {
      await recurringInvoiceService.deleteSchedule(id);
      showToast('Schedule removed.', 'success');
      loadSchedules();
    }
  };

  const handleRunNow = async (s: RecurringSchedule) => {
    try {
      await recurringInvoiceService.triggerGenerateNow(s);
      showToast(`✓ Invoice generated! View in Invoices directory.`, 'success');
      loadSchedules();
    } catch {
      showToast('Failed to generate invoice.', 'error');
    }
  };

  const totalMRR = schedules
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => {
      if (s.frequency === 'monthly') return acc + s.amount;
      if (s.frequency === 'weekly') return acc + s.amount * 4;
      if (s.frequency === 'quarterly') return acc + s.amount / 3;
      if (s.frequency === 'annually') return acc + s.amount / 12;
      return acc + s.amount;
    }, 0);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={24} color="#0B1F3A" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-black)', letterSpacing: '-0.03em', margin: 0 }}>
              Recurring Invoices & Retainers
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            Automate monthly client retainers, subscriptions, and scheduled billing cycles.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>New Recurring Retainer</span>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Active Retainers
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-black)', marginTop: '0.25rem' }}>
            {schedules.filter((s) => s.status === 'active').length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Monthly Recurring Revenue (MRR)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginTop: '0.25rem' }}>
            {formatCurrency(totalMRR, 'NGN', '₦')}
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Title & Client</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Frequency</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Next Bill Date</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recurring retainers found. Click <strong>New Recurring Retainer</strong> to create one.
                  </td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--brand-black)', fontSize: '0.9375rem' }}>{s.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.clientName}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-gold" style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                        {s.frequency}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--brand-black)' }}>
                      {formatCurrency(s.amount, s.currency, '₦')}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={14} color="#64748B" />
                        <span>{s.nextRunDate}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.status === 'active' ? '#10B981' : '#64748B', background: s.status === 'active' ? '#D1FAE5' : '#F1F5F9', padding: '2px 8px', borderRadius: '999px' }}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => handleRunNow(s)}
                          className="btn btn-secondary btn-sm"
                          title="Generate invoice now"
                        >
                          <Play size={12} color="#10B981" />
                          <span>Run Now</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className="btn btn-secondary btn-icon btn-sm"
                          title={s.status === 'active' ? 'Pause retainer' : 'Resume retainer'}
                        >
                          {s.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Delete retainer"
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Recurring Retainer">
        <form onSubmit={handleCreate}>
          <Input label="Retainer Title" placeholder="e.g. Monthly Website Maintenance" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Client / Company Name" placeholder="e.g. Acme Corporation" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          <Input label="Client Billing Email" type="email" placeholder="billing@acme.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Billing Frequency</label>
              <select className="form-select" value={frequency} onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (3 Months)</option>
                <option value="annually">Annually (Yearly)</option>
              </select>
            </div>

            <Input label="Amount (NGN ₦)" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          </div>

          <Input label="First Billing Date" type="date" value={nextRunDate} onChange={(e) => setNextRunDate(e.target.value)} required />
          <Input label="Line Item Description" placeholder="Description appearing on invoice" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Retainer Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
