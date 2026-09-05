import { businessService } from './businessService';
import { documentService } from './documentService';

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annually';

export interface RecurringItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface RecurringSchedule {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  title: string;
  amount: number;
  currency: string;
  frequency: RecurringFrequency;
  nextRunDate: string;
  status: 'active' | 'paused';
  autoSendEmail: boolean;
  items: RecurringItem[];
  createdAt: string;
  lastGeneratedAt?: string;
}

const STORAGE_KEY_PREFIX = 'bizpilotly_recurring_';

class RecurringInvoiceService {
  async getSchedules(): Promise<RecurringSchedule[]> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return [];

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${business.id}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }

    // Default sample if empty for demo
    const sample: RecurringSchedule[] = [
      {
        id: 'rec_sample_1',
        businessId: business.id,
        clientId: 'cust_sample_1',
        clientName: 'Apex Digital Agency',
        clientEmail: 'billing@apexdigital.com',
        title: 'Monthly SEO & Marketing Retainer',
        amount: 250000,
        currency: 'NGN',
        frequency: 'monthly',
        nextRunDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'active',
        autoSendEmail: true,
        items: [
          { id: '1', description: 'Monthly Content Strategy & Link Building', quantity: 1, unitPrice: 250000, total: 250000 },
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    this.saveSchedules(business.id, sample);
    return sample;
  }

  async createSchedule(data: Omit<RecurringSchedule, 'id' | 'businessId' | 'createdAt'>): Promise<RecurringSchedule> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No business active');

    const current = await this.getSchedules();
    const newSchedule: RecurringSchedule = {
      ...data,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSchedule, ...current];
    this.saveSchedules(business.id, updated);
    return newSchedule;
  }

  async updateStatus(id: string, status: 'active' | 'paused'): Promise<void> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return;

    const current = await this.getSchedules();
    const updated = current.map((s) => (s.id === id ? { ...s, status } : s));
    this.saveSchedules(business.id, updated);
  }

  async deleteSchedule(id: string): Promise<void> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return;

    const current = await this.getSchedules();
    const updated = current.filter((s) => s.id !== id);
    this.saveSchedules(business.id, updated);
  }

  async triggerGenerateNow(schedule: RecurringSchedule): Promise<string> {
    const business = await businessService.getCurrentBusiness();
    const docNumber = await documentService.getNextDocumentNumber('invoice');

    // Generate actual invoice in documentService
    const doc = await documentService.saveDocument({
      id: `doc_${Date.now()}`,
      type: 'invoice',
      documentNumber: docNumber,
      title: `${schedule.title} (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'sent',
      business: {
        name: business?.name || 'My Studio',
        email: business?.email || '',
      },
      client: {
        id: schedule.clientId,
        name: schedule.clientName,
        email: schedule.clientEmail,
      },
      items: schedule.items.map((i) => ({
        id: i.id,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        amount: i.total,
      })),
      subtotal: schedule.amount,
      taxRate: 0,
      taxAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      total: schedule.amount,
      currency: schedule.currency || 'NGN',
      currencySymbol: '₦',
      notes: `Automated ${schedule.frequency} retainer invoice. Thank you for your continued partnership.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Advance next run date
    const current = await this.getSchedules();
    const nextDate = this.calculateNextDate(schedule.nextRunDate, schedule.frequency);
    const updated = current.map((s) =>
      s.id === schedule.id ? { ...s, nextRunDate: nextDate, lastGeneratedAt: new Date().toISOString() } : s
    );
    if (schedule.businessId) {
      this.saveSchedules(schedule.businessId, updated);
    }

    return doc.id || '';
  }

  private calculateNextDate(currentDateStr: string, frequency: RecurringFrequency): string {
    const d = new Date(currentDateStr);
    if (frequency === 'weekly') d.setDate(d.getDate() + 7);
    else if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (frequency === 'quarterly') d.setMonth(d.getMonth() + 3);
    else if (frequency === 'annually') d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }

  private saveSchedules(businessId: string, list: RecurringSchedule[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${businessId}`, JSON.stringify(list));
    } catch {
      // storage error
    }
  }
}

export const recurringInvoiceService = new RecurringInvoiceService();
