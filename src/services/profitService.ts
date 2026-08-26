import { ProfitMetrics, MonthlyFinancialSummary } from '../types';
import { supabase } from './supabase';
import { businessService } from './businessService';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class ProfitService {
  async getProfitMetrics(): Promise<ProfitMetrics> {
    const financials = await this.getMonthlyFinancials();

    const totalRevenue = financials.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = financials.reduce((sum, m) => sum + m.expenses, 0);
    const grossProfit = totalRevenue;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0
        ? Math.round(((netProfit / totalRevenue) * 100 + Number.EPSILON) * 10) / 10
        : 0;

    return {
      totalRevenue,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin,
      monthlyBreakdown: financials,
    };
  }

  async getMonthlyFinancials(): Promise<MonthlyFinancialSummary[]> {
    const business = await businessService.getCurrentBusiness();
    if (!business) {
      return this.getEmptyMonthlyBreakdown();
    }

    const businessCurrency = business.currency || 'USD';

    // 1. Fetch completed payments matching business currency
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, date, status, currency')
      .eq('business_id', business.id)
      .eq('status', 'completed');

    // 2. Fetch active expenses matching business currency
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, date, status, currency')
      .eq('business_id', business.id);

    // Initialize 12 months for current year
    const currentYear = new Date().getFullYear();
    const monthsMap: Record<number, { revenue: number; expenses: number }> = {};
    for (let i = 0; i < 12; i++) {
      monthsMap[i] = { revenue: 0, expenses: 0 };
    }

    (payments || []).forEach((p) => {
      if (!p.currency || p.currency === businessCurrency) {
        const d = new Date(p.date);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          monthsMap[m].revenue += Number(p.amount) || 0;
        }
      }
    });

    (expenses || []).forEach((e) => {
      if (e.status !== 'reimbursed' && (!e.currency || e.currency === businessCurrency)) {
        const d = new Date(e.date);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          monthsMap[m].expenses += Number(e.amount) || 0;
        }
      }
    });

    const currentMonthIndex = new Date().getMonth();
    const result: MonthlyFinancialSummary[] = [];

    for (let i = 0; i <= currentMonthIndex; i++) {
      const rev = monthsMap[i].revenue;
      const exp = monthsMap[i].expenses;
      const gross = rev;
      const net = rev - exp;
      const margin = rev > 0 ? Math.round(((net / rev) * 100 + Number.EPSILON) * 10) / 10 : 0;

      result.push({
        month: MONTH_NAMES[i],
        revenue: rev,
        expenses: exp,
        grossProfit: gross,
        netProfit: net,
        profitMargin: margin,
      });
    }

    return result.length > 0 ? result : this.getEmptyMonthlyBreakdown();
  }

  private getEmptyMonthlyBreakdown(): MonthlyFinancialSummary[] {
    const currentMonthIndex = new Date().getMonth();
    const result: MonthlyFinancialSummary[] = [];
    for (let i = 0; i <= currentMonthIndex; i++) {
      result.push({
        month: MONTH_NAMES[i],
        revenue: 0,
        expenses: 0,
        grossProfit: 0,
        netProfit: 0,
        profitMargin: 0,
      });
    }
    return result;
  }
}

export const profitService = new ProfitService();
