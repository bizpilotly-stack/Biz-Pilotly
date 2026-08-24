import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { expenseService } from '../../services/expenseService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';

const CATEGORIES: ExpenseCategory[] = [
  'Software',
  'Marketing',
  'Transport',
  'Equipment',
  'Contractors',
  'Utilities',
  'Other',
];

export const ExpensesPage: React.FC = () => {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<{ totalExpenses: number; categories: Record<ExpenseCategory, number>; count: number }>({
    totalExpenses: 0,
    categories: { Software: 0, Marketing: 0, Transport: 0, Equipment: 0, Contractors: 0, Utilities: 0, Other: 0 },
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add Expense Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Software');
  const [amount, setAmount] = useState<number>(0);
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Visa');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await expenseService.getExpenses({ search, category: categoryFilter });
      const sum = await expenseService.getExpenseSummary();
      setExpenses(list);
      setSummary(sum);
    } catch {
      showToast('Error loading expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryFilter]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !vendor) {
      showToast('Title, Vendor, and Amount are required.', 'error');
      return;
    }

    try {
      await expenseService.addExpense({
        title,
        category,
        amount: Number(amount),
        currency: 'USD',
        currencySymbol: '$',
        vendor,
        paymentMethod,
        date,
        status: 'cleared',
        receiptAttached: true,
        notes,
      });

      showToast('Expense recorded successfully!', 'success');
      setAddModalOpen(false);
      setTitle('');
      setVendor('');
      setAmount(0);
      setNotes('');
      loadData();
    } catch {
      showToast('Error logging expense', 'error');
    }
  };

  const handleDelete = async (id: string, expTitle: string) => {
    if (window.confirm(`Delete expense "${expTitle}"?`)) {
      await expenseService.deleteExpense(id);
      showToast(`Expense deleted`, 'info');
      loadData();
    }
  };

  return (
    <div>
      <SEO
        title={`Expense Tracking | ${BRAND_NAME}`}
        description="Track business overhead, software subscriptions, equipment, and contractor disbursements."
      />

      <PageHeader
        title="Expenses"
        description="Monitor operating overheads, software licenses, contractor payouts, and tax deductible costs."
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus size={14} />
            <span>Add Expense</span>
          </Button>
        }
      />

      {/* Top Overview: Total Spent & Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Metric Summary Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Total Logged Expenses (August)
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-black)', marginTop: '0.5rem' }}>
              {formatCurrency(summary.totalExpenses)}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Across {summary.count} distinct operational expense entries.
            </p>
          </div>
          <div style={{ background: 'var(--brand-navy-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--brand-navy-700)', fontSize: '0.8125rem', fontWeight: 600, marginTop: '1rem' }}>
            Operating ratio: 18.1% of gross revenue
          </div>
        </div>

        {/* Category Breakdown Progress Bars */}
        <div className="card">
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Category Distribution</h4>
          {CATEGORIES.map((cat) => {
            const catAmount = summary.categories[cat] || 0;
            const pct = summary.totalExpenses > 0 ? (catAmount / summary.totalExpenses) * 100 : 0;
            if (catAmount === 0 && summary.totalExpenses > 0) return null;

            return (
              <div key={cat} className="category-bar-item">
                <div className="category-bar-header">
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(catAmount)} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="category-progress-track">
                  <div
                    className="category-progress-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat === 'Contractors' ? '#1d4ed8' : cat === 'Software' ? '#38bdf8' : cat === 'Marketing' ? '#f59e0b' : '#64748b',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by vendor, title, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`btn btn-sm ${categoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="skeleton" style={{ height: '54px', width: '100%' }} />
          <div className="skeleton" style={{ height: '54px', width: '100%' }} />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={<Receipt size={28} />}
          title="No expenses logged"
          description="Keep your business costs organized in one place."
          actionText="Add Expense"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expense Item</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{exp.title}</div>
                    {exp.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.notes}</div>}
                  </td>
                  <td>
                    <span className="badge badge-neutral">{exp.category}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{exp.vendor}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{exp.paymentMethod}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(exp.date)}</td>
                  <td style={{ fontWeight: 800, color: '#b91c1c' }}>
                    -{formatCurrency(exp.amount, exp.currency, exp.currencySymbol)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(exp.id, exp.title)}
                      className="btn btn-ghost btn-sm btn-icon"
                      style={{ color: '#ef4444' }}
                      title="Delete expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Log Business Expense"
      >
        <form onSubmit={handleAddExpense}>
          <Input
            label="Expense Description / Title"
            placeholder="e.g. Adobe CC Subscription"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Amount ($)"
              type="number"
              min="0.01"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Vendor / Payee"
              placeholder="e.g. Adobe Systems"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              required
            />
            <Input
              label="Payment Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Payment Method"
            placeholder="e.g. Corporate Visa, Bank Transfer"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />

          <Input
            label="Notes / Tax Reference"
            placeholder="Optional purpose notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
