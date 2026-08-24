import { Expense, ExpenseCategory } from '../types';
import { INITIAL_EXPENSES } from '../mock/expenses';

const STORAGE_KEY = 'saas_expenses_data';

class ExpenseService {
  private getStored(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return INITIAL_EXPENSES;
  }

  private saveStored(expenses: Expense[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch {
      // ignore
    }
  }

  async getExpenses(filter?: { category?: string; search?: string }): Promise<Expense[]> {
    await new Promise((res) => setTimeout(res, 80));
    let list = this.getStored();

    if (filter?.category && filter.category !== 'all') {
      list = list.filter((e) => e.category === filter.category);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.vendor.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    return list;
  }

  async addExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
    await new Promise((res) => setTimeout(res, 100));
    const list = this.getStored();
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now().toString(36)}`,
    };
    list.unshift(newExpense);
    this.saveStored(list);
    return newExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    let list = this.getStored();
    list = list.filter((e) => e.id !== id);
    this.saveStored(list);
    return true;
  }

  async getExpenseSummary() {
    const list = this.getStored();
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
