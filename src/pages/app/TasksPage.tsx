import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  Edit3,
  MoreVertical,
  User,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../components/common/Toast';
import { SEO } from '../../components/common/SEO';
import { BRAND_NAME } from '../../constants/brand';
import { EmptyState } from '../../components/common/EmptyState';

export interface TaskItem {
  id: string;
  title: string;
  clientName: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  estimatedHours: number;
  billableRate: number;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'bizpilotly_tasks_data';

const DEFAULT_TASKS: TaskItem[] = [];

export const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleToggleSelectTask = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = (visibleIds: string[]) => {
    if (selectedTaskIds.length === visibleIds.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(visibleIds);
    }
  };

  const handleGenerateInvoiceFromTasks = () => {
    const selectedTasks = tasks.filter((t) => selectedTaskIds.includes(t.id));
    if (selectedTasks.length === 0) {
      showToast('Please select at least one task to generate an invoice.', 'error');
      return;
    }

    const firstClient = selectedTasks[0].clientName || 'Valued Client';
    const lineItems = selectedTasks.map((t, idx) => ({
      id: `item-${idx + 1}`,
      description: `${t.title}${t.notes ? ` — ${t.notes}` : ''}`,
      quantity: t.estimatedHours || 1,
      unitPrice: t.billableRate || 75,
      amount: (t.estimatedHours || 1) * (t.billableRate || 75),
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

    // Read current draft or create fresh invoice draft
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const invoiceDraft = {
      id: `doc-${Date.now().toString(36)}`,
      type: 'invoice',
      documentNumber: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      title: `Invoice for ${firstClient} Deliverables`,
      date: today,
      dueDate,
      status: 'draft',
      business: {
        name: 'My Business',
        email: 'billing@bizpilotly.com',
      },
      client: {
        name: firstClient,
      },
      items: lineItems,
      subtotal,
      taxRate: 0,
      taxAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      total: subtotal,
      currency: 'USD',
      currencySymbol: '$',
      notes: `Invoice generated from ${selectedTasks.length} billable milestone task deliverables.`,
      terms: 'Payment is due within 30 days of invoice date.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('bizpilotly_draft_invoice_v1', JSON.stringify(invoiceDraft));
    showToast(`✓ Created draft invoice with ${selectedTasks.length} tasks ($${subtotal.toLocaleString()})!`, 'success');
    navigate('/app/documents/invoice');
  };

  // Task Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formData, setFormData] = useState<Partial<TaskItem>>({
    title: '',
    clientName: '',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    estimatedHours: 4,
    billableRate: 75,
    notes: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Close 3-dot menus on outside click
  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      clientName: '',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      estimatedHours: 4,
      billableRate: 75,
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormData(task);
    setModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? ({ ...t, ...formData } as TaskItem) : t)));
      showToast('Task updated successfully!', 'success');
    } else {
      const newTask: TaskItem = {
        id: `tsk-${Date.now().toString().slice(-6)}`,
        title: formData.title.trim(),
        clientName: formData.clientName?.trim() || 'Internal Studio',
        status: formData.status as any || 'todo',
        priority: formData.priority as any || 'medium',
        dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
        estimatedHours: Number(formData.estimatedHours) || 1,
        billableRate: Number(formData.billableRate) || 0,
        notes: formData.notes?.trim() || '',
        createdAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
      showToast('New task added!', 'success');
    }
    setModalOpen(false);
  };

  const handleDeleteTask = (id: string, title: string) => {
    if (window.confirm(`Delete task "${title}"?`)) {
      setTasks(tasks.filter((t) => t.id !== id));
      showToast('Task deleted', 'info');
      setActiveMenuId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === 'completed' ? 'in_progress' : 'completed';
        return { ...t, status: nextStatus };
      })
    );
  };

  // 1-Click Export Task CSV
  const handleExportCSV = () => {
    if (tasks.length === 0) {
      showToast('No task records to export.', 'info');
      return;
    }

    const headers = ['Task ID', 'Title', 'Client', 'Status', 'Priority', 'Due Date', 'Est. Hours', 'Billable Rate ($)', 'Total Value ($)', 'Notes'];
    const rows = tasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.clientName.replace(/"/g, '""')}"`,
      t.status.toUpperCase(),
      t.priority.toUpperCase(),
      t.dueDate,
      t.estimatedHours,
      t.billableRate,
      t.estimatedHours * t.billableRate,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bizpilotly-tasks-deliverables-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ Task CSV exported successfully!', 'success');
  };

  // 1-Click Import Task CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          showToast('CSV file is empty or missing data rows.', 'error');
          return;
        }

        const newItems: TaskItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 2 && parts[1]) {
            newItems.push({
              id: parts[0] || `tsk-imp-${Date.now().toString().slice(-4)}-${i}`,
              title: parts[1],
              clientName: parts[2] || 'Imported Client',
              status: (parts[3]?.toLowerCase() as any) || 'todo',
              priority: (parts[4]?.toLowerCase() as any) || 'medium',
              dueDate: parts[5] || new Date().toISOString().split('T')[0],
              estimatedHours: Number(parts[6]) || 2,
              billableRate: Number(parts[7]) || 75,
              notes: parts[9] || '',
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (newItems.length > 0) {
          setTasks((prev) => [...newItems, ...prev]);
          showToast(`✓ Successfully imported ${newItems.length} tasks from CSV!`, 'success');
        } else {
          showToast('Could not parse valid tasks from the uploaded CSV.', 'error');
        }
      } catch {
        showToast('Error parsing task CSV file format.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalValue = tasks.reduce((sum, t) => sum + t.estimatedHours * t.billableRate, 0);
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div>
      <SEO
        title={`Task & Deliverables CSV Tracker | ${BRAND_NAME}`}
        description="Track client milestones, billable task deliverables, and import/export task CSV files."
      />

      <PageHeader
        title="Tasks & Deliverables"
        description="Track billable milestones, project deliverables, and manage 1-click Task CSV imports and exports."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {selectedTaskIds.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateInvoiceFromTasks}
                style={{ background: '#10B981', borderColor: '#10B981' }}
                title="Create a draft invoice with all selected tasks as line items"
              >
                <Sparkles size={14} />
                <span>Invoice Selected ({selectedTaskIds.length})</span>
              </Button>
            )}

            {/* Import CSV input */}
            <label
              className="btn btn-secondary btn-sm"
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: 0 }}
              title="Import tasks from a CSV spreadsheet"
            >
              <Upload size={14} />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
            </label>

            <Button variant="secondary" size="sm" onClick={handleExportCSV} title="Export accountant-ready Task CSV">
              <Download size={14} />
              <span>Export Task CSV</span>
            </Button>

            <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
              <Plus size={14} />
              <span>New Task</span>
            </Button>
          </div>
        }
      />

      {/* KPI Metric Summary Cards (Responsive 2x2 on Mobile) */}
      <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Active Tasks</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-navy-50)', color: 'var(--brand-navy-600)' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="metric-card-value">{tasks.length}</div>
          <div className="metric-card-subtext">
            <span>{completedCount} completed ({tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">Pipeline Billable Value</span>
            <div className="metric-card-icon" style={{ background: 'var(--brand-gold-100)', color: 'var(--brand-gold-700)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-card-value">${totalValue.toLocaleString()}</div>
          <div className="metric-card-subtext">
            <span>Calculated from rate × hours</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">In Progress / Review</span>
            <div className="metric-card-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-card-value">
            {tasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length}
          </div>
          <div className="metric-card-subtext">
            <span>Requires active delivery</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-card-label">High / Urgent Priority</span>
            <div className="metric-card-icon" style={{ background: 'var(--status-danger-bg)', color: '#DC2626' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: '#DC2626' }}>
            {tasks.filter((t) => t.priority === 'urgent' || t.priority === 'high').length}
          </div>
          <div className="metric-card-subtext">
            <span>Due soonest</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div className="search-input-wrapper" style={{ flex: '1 1 240px', minWidth: '200px' }}>
          <Search className="search-input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks, clients, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Content: Desktop Table + Mobile Responsive Cards */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={28} />}
          title="No tasks match your filters"
          description="Create your first project deliverable or import tasks via CSV spreadsheet."
          actionText="Add New Task"
          onAction={handleOpenAddModal}
        />
      ) : (
        <>
          {/* 1. DESKTOP DATA TABLE (Visible on Desktop / Tablets) */}
          <div className="table-container desktop-table-view">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '36px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length}
                      onChange={() => handleSelectAllVisible(filteredTasks.map((t) => t.id))}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                      title="Select all for invoicing"
                    />
                  </th>
                  <th style={{ width: '40px' }}>Done</th>
                  <th>Task Deliverable</th>
                  <th>Client</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Hours & Rate</th>
                  <th>Billable Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => {
                  const isDone = t.status === 'completed';
                  const isSelected = selectedTaskIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      style={{
                        opacity: isDone ? 0.75 : 1,
                        background: isSelected ? '#F0FDF4' : undefined,
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectTask(t.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                          title="Select task for invoice generation"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleStatus(t.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                          title="Mark complete"
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0B1F3A', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {t.title}
                        </div>
                        {t.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{t.clientName}</div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            background:
                              t.priority === 'urgent' ? '#FEE2E2' : t.priority === 'high' ? '#FEF3C7' : '#F1F5F9',
                            color:
                              t.priority === 'urgent' ? '#991B1B' : t.priority === 'high' ? '#92400E' : '#475569',
                          }}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{t.dueDate}</td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {t.estimatedHours}h @ ${t.billableRate}/h
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0B1F3A' }}>
                        ${(t.estimatedHours * t.billableRate).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            textTransform: 'capitalize',
                            fontSize: '0.6875rem',
                            background:
                              t.status === 'completed'
                                ? '#D1FAE5'
                                : t.status === 'review'
                                ? '#EFF6FF'
                                : t.status === 'in_progress'
                                ? '#FEF3C7'
                                : '#F1F5F9',
                            color:
                              t.status === 'completed'
                                ? '#065F46'
                                : t.status === 'review'
                                ? '#1E40AF'
                                : t.status === 'in_progress'
                                ? '#92400E'
                                : '#475569',
                          }}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(t)}
                            className="btn btn-ghost btn-sm btn-icon"
                            title="Edit Task"
                          >
                            <Edit3 size={15} color="#475569" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(t.id, t.title)}
                            className="btn btn-ghost btn-sm btn-icon"
                            style={{ color: '#ef4444' }}
                            title="Delete Task"
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

          {/* 2. MOBILE RESPONSIVE CARDS WITH 3-DOT ACTION MENUS (Visible on Mobile Viewports) */}
          <div className="mobile-cards-view" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredTasks.map((t) => {
              const isDone = t.status === 'completed';
              const isMenuOpen = activeMenuId === t.id;

              return (
                <div
                  key={t.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleStatus(t.id)}
                        style={{ cursor: 'pointer', width: 18, height: 18, flexShrink: 0 }}
                      />
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B1F3A', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {t.title}
                      </div>
                    </div>

                    {/* 3-Dot Actions Menu */}
                    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : t.id)}
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
                            minWidth: '140px',
                            padding: '4px 0',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(t.id)}
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
                            <CheckCircle2 size={14} color="#10B981" />
                            <span>{isDone ? 'Mark Incomplete' : 'Mark Complete'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(t)}
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
                            <Edit3 size={14} color="#2563EB" />
                            <span>Edit Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(t.id, t.title)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              padding: '8px 12px',
                              fontSize: '0.8125rem',
                              color: '#DC2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} />
                      <strong>{t.clientName}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#0B1F3A' }}>
                      ${(t.estimatedHours * t.billableRate).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.625rem',
                          padding: '2px 6px',
                          background: t.priority === 'urgent' ? '#FEE2E2' : t.priority === 'high' ? '#FEF3C7' : '#F1F5F9',
                          color: t.priority === 'urgent' ? '#991B1B' : t.priority === 'high' ? '#92400E' : '#475569',
                        }}
                      >
                        {t.priority.toUpperCase()}
                      </span>
                      <span style={{ color: '#64748b' }}>Due: {t.dueDate}</span>
                    </div>

                    <span
                      className="badge"
                      style={{
                        fontSize: '0.625rem',
                        padding: '2px 6px',
                        background: t.status === 'completed' ? '#D1FAE5' : '#EFF6FF',
                        color: t.status === 'completed' ? '#065F46' : '#1E40AF',
                      }}
                    >
                      {t.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Task Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 13, 22, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1F3A', marginBottom: '1.25rem' }}>
              {editingTask ? 'Edit Task Deliverable' : 'Add New Task / Milestone'}
            </h3>

            <form onSubmit={handleSaveTask}>
              <div style={{ marginBottom: '1rem' }}>
                <Input
                  label="Task Deliverable Title"
                  required
                  placeholder="e.g. Design responsive landing page mockup"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Input
                  label="Client Name"
                  placeholder="e.g. Apex Digital"
                  value={formData.clientName || ''}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status || 'todo'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Input
                  label="Est. Hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedHours || 1}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                />
                <Input
                  label="Billable Rate ($/hr)"
                  type="number"
                  min="0"
                  value={formData.billableRate || 0}
                  onChange={(e) => setFormData({ ...formData, billableRate: Number(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Deliverable Notes & Specs</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Optional deliverables notes..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
