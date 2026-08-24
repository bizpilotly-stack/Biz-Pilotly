import { Payment } from '../types';
import { INITIAL_PAYMENTS } from '../mock/payments';

const STORAGE_KEY = 'saas_payments_data';

class PaymentService {
  private getStored(): Payment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return INITIAL_PAYMENTS;
  }

  private saveStored(payments: Payment[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    } catch {
      // ignore
    }
  }

  async getPayments(filter?: { search?: string; status?: string }): Promise<Payment[]> {
    await new Promise((res) => setTimeout(res, 80));
    let list = this.getStored();

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q) ||
          p.invoiceNumber.toLowerCase().includes(q) ||
          (p.reference && p.reference.toLowerCase().includes(q))
      );
    }

    if (filter?.status && filter.status !== 'all') {
      list = list.filter((p) => p.status === filter.status);
    }

    return list;
  }

  async recordPayment(paymentData: Omit<Payment, 'id' | 'paymentNumber'>): Promise<Payment> {
    await new Promise((res) => setTimeout(res, 120));
    const list = this.getStored();
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now().toString(36)}`,
      paymentNumber: `PAY-2026-${String(list.length + 45).padStart(4, '0')}`,
    };
    list.unshift(newPayment);
    this.saveStored(list);
    return newPayment;
  }

  async getPaymentSummary() {
    const list = this.getStored();
    const totalReceived = list
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = list
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalReceived,
      pendingAmount,
      completedCount: list.filter((p) => p.status === 'completed').length,
      pendingCount: list.filter((p) => p.status === 'pending').length,
    };
  }
}

export const paymentService = new PaymentService();
