import { DashboardStats, ActivityItem, LifecycleFunnelStats } from '../types';
import { supabase } from './supabase';
import { businessService } from './businessService';
import { documentService } from './documentService';
import { recurringInvoiceService } from './recurringInvoiceService';

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const business = await businessService.getCurrentBusiness();
    if (!business) {
      return {
        revenue: 0,
        outstandingInvoices: 0,
        expenses: 0,
        profit: 0,
        revenueChangePct: 0,
        outstandingCount: 0,
        expenseChangePct: 0,
        profitMarginPct: 0,
      };
    }

    const businessCurrency = business.currency || 'USD';

    // 1. Fetch completed payments for revenue (matching business currency)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status, currency')
      .eq('business_id', business.id);

    const revenue = (payments || [])
      .filter((p) => p.status === 'completed' && (!p.currency || p.currency === businessCurrency))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // 2. Fetch outstanding invoices (sent, viewed, overdue only — excluding draft, paid, cancelled)
    const { data: documents } = await supabase
      .from('documents')
      .select('total, status, type, currency')
      .eq('business_id', business.id)
      .eq('type', 'invoice');

    const outstandingInvoicesList = (documents || []).filter(
      (d) =>
        (!d.currency || d.currency === businessCurrency) &&
        (d.status === 'sent' || d.status === 'viewed' || d.status === 'overdue')
    );

    const outstandingInvoices = outstandingInvoicesList.reduce(
      (sum, d) => sum + (Number(d.total) || 0),
      0
    );
    const outstandingCount = outstandingInvoicesList.length;

    // 3. Fetch expenses (excluding reimbursed, matching business currency)
    const { data: expensesList } = await supabase
      .from('expenses')
      .select('amount, status, currency')
      .eq('business_id', business.id);

    const expenses = (expensesList || [])
      .filter((e) => e.status !== 'reimbursed' && (!e.currency || e.currency === businessCurrency))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // 4. Derive Profit and Margins
    const profit = revenue - expenses;
    const profitMarginPct =
      revenue > 0 ? Math.round(((profit / revenue) * 100 + Number.EPSILON) * 10) / 10 : 0;

    return {
      revenue,
      outstandingInvoices,
      expenses,
      profit,
      revenueChangePct: 0,
      outstandingCount,
      expenseChangePct: 0,
      profitMarginPct,
    };
  }

  async getLifecycleStats(): Promise<LifecycleFunnelStats> {
    const allDocs = await documentService.getDocuments().catch(() => []);
    const allRetainers = await recurringInvoiceService.getSchedules().catch(() => []);

    let tasksList: any[] = [];
    try {
      const rawTasks = localStorage.getItem('bizpilotly_tasks_data');
      if (rawTasks) tasksList = JSON.parse(rawTasks);
    } catch {
      // fallback
    }

    // 1. Proposals
    const proposals = allDocs.filter((d) => d.type === 'proposal');
    const proposalsSent = proposals.filter((d) => d.status === 'sent' || d.status === 'viewed').length;
    const proposalsAccepted = proposals.filter((d) => d.status === 'accepted').length;
    const proposalsRejected = proposals.filter((d) => d.status === 'rejected' || d.status === 'declined').length;
    const closedProposalValue = proposals.filter((d) => d.status === 'accepted').reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    const pendingProposalValue = proposals.filter((d) => d.status === 'sent' || d.status === 'viewed' || d.status === 'draft').reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    const proposalWinRate = proposalsAccepted + proposalsRejected > 0
      ? Math.round((proposalsAccepted / (proposalsAccepted + proposalsRejected)) * 100)
      : (proposalsAccepted > 0 ? 100 : 0);

    // 2. Quotes & Estimates
    const quotes = allDocs.filter((d) => d.type === 'quote' || d.type === 'estimate');
    const quotesSent = quotes.filter((d) => d.status === 'sent' || d.status === 'viewed').length;
    const quotesAccepted = quotes.filter((d) => d.status === 'accepted').length;
    const quotesRejected = quotes.filter((d) => d.status === 'rejected' || d.status === 'declined').length;
    const closedQuoteValue = quotes.filter((d) => d.status === 'accepted').reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    const pendingQuoteValue = quotes.filter((d) => d.status === 'sent' || d.status === 'viewed' || d.status === 'draft').reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    const quoteWinRate = quotesAccepted + quotesRejected > 0
      ? Math.round((quotesAccepted / (quotesAccepted + quotesRejected)) * 100)
      : (quotesAccepted > 0 ? 100 : 0);

    // 3. Contracts
    const contracts = allDocs.filter((d) => d.type === 'contract');
    const contractsSent = contracts.filter((d) => d.status === 'sent' || d.status === 'viewed').length;
    const contractsSigned = contracts.filter((d) => d.status === 'signed' || d.status === 'accepted').length;
    const contractsPending = contracts.filter((d) => d.status !== 'signed' && d.status !== 'accepted' && d.status !== 'cancelled').length;
    const contractExecutionRate = contracts.length > 0
      ? Math.round((contractsSigned / contracts.length) * 100)
      : 0;

    // 4. Invoices
    const invoices = allDocs.filter((d) => d.type === 'invoice');
    const paidInvoices = invoices.filter((d) => d.status === 'paid');
    const pendingInvoices = invoices.filter((d) => d.status === 'sent' || d.status === 'viewed' || d.status === 'pending_confirmation');
    const overdueInvoices = invoices.filter((d) => d.status === 'overdue');
    const paidAmount = paidInvoices.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    const pendingAmount = pendingInvoices.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    const overdueAmount = overdueInvoices.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
    const settlementRatePct = invoices.length > 0
      ? Math.round((paidInvoices.length / invoices.length) * 100)
      : 0;

    // 5. Retainers & MRR
    const activeRetainers = allRetainers.filter((r) => r.status === 'active');
    const mrr = activeRetainers.reduce((acc, s) => {
      if (s.frequency === 'monthly') return acc + s.amount;
      if (s.frequency === 'weekly') return acc + s.amount * 4;
      if (s.frequency === 'quarterly') return acc + s.amount / 3;
      if (s.frequency === 'annually') return acc + s.amount / 12;
      return acc + s.amount;
    }, 0);
    const next7Days = new Date(Date.now() + 7 * 86400000);
    const upcomingRuns = activeRetainers.filter((r) => new Date(r.nextRunDate) <= next7Days).length;

    // 6. Tasks
    const completedTasks = tasksList.filter((t) => t.status === 'completed');
    const unbilledHours = completedTasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);
    const unbilledAmount = completedTasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0) * (Number(t.billableRate) || 75), 0);

    // 7. Attention Radar Items
    const attentionItems: LifecycleFunnelStats['attentionItems'] = [];
    if (overdueInvoices.length > 0) {
      attentionItems.push({
        id: 'att-overdue',
        type: 'overdue_invoice',
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? 's' : ''}`,
        subtitle: `$${overdueAmount.toLocaleString()} awaiting immediate settlement`,
        amount: overdueAmount,
        actionLabel: 'View Overdue',
        actionLink: '/app/documents?type=invoice&status=overdue',
        badgeColor: 'red',
      });
    }

    if (completedTasks.length > 0 && unbilledAmount > 0) {
      attentionItems.push({
        id: 'att-tasks',
        type: 'unbilled_tasks',
        title: `${completedTasks.length} Completed Task${completedTasks.length > 1 ? 's' : ''} Unbilled`,
        subtitle: `${unbilledHours} hours logged ($${unbilledAmount.toLocaleString()} ready to invoice)`,
        amount: unbilledAmount,
        actionLabel: 'Generate Invoice',
        actionLink: '/app/tasks',
        badgeColor: 'yellow',
      });
    }

    if (proposalsSent > 0) {
      attentionItems.push({
        id: 'att-proposals',
        type: 'pending_proposal',
        title: `${proposalsSent} Proposal${proposalsSent > 1 ? 's' : ''} Awaiting Client Decision`,
        subtitle: `$${pendingProposalValue.toLocaleString()} active pitch pipeline`,
        amount: pendingProposalValue,
        actionLabel: 'Follow Up',
        actionLink: '/app/documents?type=proposal',
        badgeColor: 'blue',
      });
    }

    if (contractsPending > 0) {
      attentionItems.push({
        id: 'att-contracts',
        type: 'unsigned_contract',
        title: `${contractsPending} Contract${contractsPending > 1 ? 's' : ''} Pending Execution`,
        subtitle: 'Awaiting signature before project initiation',
        actionLabel: 'Review Contracts',
        actionLink: '/app/documents?type=contract',
        badgeColor: 'purple',
      });
    }

    if (upcomingRuns > 0) {
      attentionItems.push({
        id: 'att-retainer',
        type: 'upcoming_retainer',
        title: `${upcomingRuns} Retainer Billing Cycle${upcomingRuns > 1 ? 's' : ''} Due in 7 Days`,
        subtitle: 'Scheduled recurring client retainers ready to trigger',
        actionLabel: 'View Retainers',
        actionLink: '/app/recurring',
        badgeColor: 'green',
      });
    }

    return {
      proposals: {
        total: proposals.length,
        sent: proposalsSent,
        accepted: proposalsAccepted,
        rejected: proposalsRejected,
        winRatePct: proposalWinRate,
        closedValue: closedProposalValue,
        pendingValue: pendingProposalValue,
      },
      quotes: {
        total: quotes.length,
        sent: quotesSent,
        accepted: quotesAccepted,
        rejected: quotesRejected,
        winRatePct: quoteWinRate,
        closedValue: closedQuoteValue,
        pendingValue: pendingQuoteValue,
      },
      contracts: {
        total: contracts.length,
        sent: contractsSent,
        signed: contractsSigned,
        pendingSignature: contractsPending,
        executionRatePct: contractExecutionRate,
      },
      invoices: {
        totalCount: invoices.length,
        paidCount: paidInvoices.length,
        pendingCount: pendingInvoices.length,
        overdueCount: overdueInvoices.length,
        paidAmount,
        pendingAmount,
        overdueAmount,
        settlementRatePct,
      },
      retainers: {
        activeCount: activeRetainers.length,
        mrr,
        upcomingRunsCount: upcomingRuns,
      },
      tasks: {
        completedUnbilledCount: completedTasks.length,
        unbilledHours,
        unbilledAmount,
      },
      attentionItems,
    };
  }

  async getRecentActivities(): Promise<ActivityItem[]> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return [];

    const activities: ActivityItem[] = [];

    // 1. Recent Documents
    const { data: docs } = await supabase
      .from('documents')
      .select('id, document_number, type, total, created_at, status')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(5);

    (docs || []).forEach((d) => {
      activities.push({
        id: `act-doc-${d.id}`,
        type: d.type === 'invoice' ? 'invoice_created' : 'quote_sent',
        title: `${d.type.toUpperCase()} #${d.document_number} Created`,
        description: `Total amount: $${Number(d.total).toLocaleString()} (${d.status})`,
        timestamp: new Date(d.created_at).toLocaleDateString(),
        amount: Number(d.total),
      });
    });

    // 2. Recent Payments
    const { data: pays } = await supabase
      .from('payments')
      .select('id, payment_number, amount, date, status, created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(5);

    (pays || []).forEach((p) => {
      activities.push({
        id: `act-pay-${p.id}`,
        type: 'invoice_paid',
        title: `Payment Received (${p.payment_number})`,
        description: `$${Number(p.amount).toLocaleString()} settled via ledger`,
        timestamp: new Date(p.created_at || p.date).toLocaleDateString(),
        amount: Number(p.amount),
      });
    });

    // 3. Recent Expenses
    const { data: exps } = await supabase
      .from('expenses')
      .select('id, title, amount, category, date, created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(5);

    (exps || []).forEach((e) => {
      activities.push({
        id: `act-exp-${e.id}`,
        type: 'expense_logged',
        title: `Expense Logged: ${e.title}`,
        description: `$${Number(e.amount).toLocaleString()} under ${e.category}`,
        timestamp: new Date(e.created_at || e.date).toLocaleDateString(),
        amount: Number(e.amount),
      });
    });

    return activities.slice(0, 8);
  }
}

export const dashboardService = new DashboardService();

