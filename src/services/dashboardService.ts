import { DashboardStats, ActivityItem } from '../types';
import { supabase } from './supabase';
import { businessService } from './businessService';

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

