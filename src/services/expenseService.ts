import { supabase } from './supabase';
import { Expense, ExpenseCategory } from '../types';
import { Database } from '../types/database.types';
import { businessService } from './businessService';

class ExpenseService {
  async getExpenses(filter?: { category?: string; search?: string }): Promise<Expense[]> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return [];

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('business_id', business.id)
      .order('date', { ascending: false });

    if (filter?.category && filter.category !== 'all') {
      query = query.eq('category', filter.category as any);
    }

    if (filter?.search) {
      const q = filter.search.trim();
      query = query.or(`title.ilike.%${q}%,vendor.ilike.%${q}%,notes.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category as ExpenseCategory,
      amount: Number(row.amount) || 0,
      currency: row.currency || 'USD',
      currencySymbol: row.currency_symbol || '$',
      date: row.date,
      vendor: row.vendor || '',
      paymentMethod: row.payment_method || '',
      status: row.status as Expense['status'],
      receiptAttached: Boolean(row.receipt_attached),
      notes: row.notes || undefined,
    }));
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return null;

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('business_id', business.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching expense by id:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      category: data.category as ExpenseCategory,
      amount: Number(data.amount) || 0,
      currency: data.currency || 'USD',
      currencySymbol: data.currency_symbol || '$',
      date: data.date,
      vendor: data.vendor || '',
      paymentMethod: data.payment_method || '',
      status: data.status as Expense['status'],
      receiptAttached: Boolean(data.receipt_attached),
      notes: data.notes || undefined,
    };
  }

  async addExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
    const business = await businessService.getOrCreateDefaultBusiness();
    if (!business) throw new Error('No active business found');

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        business_id: business.id,
        title: expenseData.title,
        category: expenseData.category as any,
        amount: expenseData.amount,
        currency: expenseData.currency || 'USD',
        currency_symbol: expenseData.currencySymbol || '$',
        date: expenseData.date || new Date().toISOString().split('T')[0],
        vendor: expenseData.vendor || null,
        payment_method: expenseData.paymentMethod || null,
        status: (expenseData.status as any) || 'cleared',
        receipt_attached: Boolean(expenseData.receiptAttached),
        notes: expenseData.notes || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      category: data.category as ExpenseCategory,
      amount: Number(data.amount) || 0,
      currency: data.currency || 'USD',
      currencySymbol: data.currency_symbol || '$',
      date: data.date,
      vendor: data.vendor || '',
      paymentMethod: data.payment_method || '',
      status: data.status as Expense['status'],
      receiptAttached: Boolean(data.receipt_attached),
      notes: data.notes || undefined,
    };
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business found');

    const updatePayload: Database['public']['Tables']['expenses']['Update'] = {};
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.category !== undefined) updatePayload.category = updates.category;
    if (updates.amount !== undefined) updatePayload.amount = updates.amount;
    if (updates.date !== undefined) updatePayload.date = updates.date;
    if (updates.vendor !== undefined) updatePayload.vendor = updates.vendor || null;
    if (updates.paymentMethod !== undefined) updatePayload.payment_method = updates.paymentMethod || null;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.receiptAttached !== undefined) updatePayload.receipt_attached = Boolean(updates.receiptAttached);
    if (updates.notes !== undefined) updatePayload.notes = updates.notes || null;

    const { error } = await supabase
      .from('expenses')
      .update(updatePayload)
      .eq('id', id)
      .eq('business_id', business.id);

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    const updated = await this.getExpenseById(id);
    if (!updated) throw new Error('Failed to fetch updated expense');
    return updated;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business found');

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('business_id', business.id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }

    return true;
  }

  async getExpenseSummary() {
    const list = await this.getExpenses();
    const totalExpenses = list.reduce((sum, e) => sum + e.amount, 0);

    const categories: Record<ExpenseCategory, number> = {
      Software: 0,
      Marketing: 0,
      Transport: 0,
      Equipment: 0,
      Contractors: 0,
      Utilities: 0,
      Other: 0,
    };

    list.forEach((e) => {
      if (categories[e.category] !== undefined) {
        categories[e.category] += e.amount;
      } else {
        categories.Other += e.amount;
      }
    });

    return {
      totalExpenses,
      categories,
      count: list.length,
    };
  }
}

export const expenseService = new ExpenseService();
