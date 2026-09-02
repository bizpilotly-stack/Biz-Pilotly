import { supabase } from './supabase';
import { BusinessDocument, Client } from '../types';

export interface ClientPortalStatement {
  client: Client;
  business: {
    name: string;
    email: string;
    phone?: string;
    logo?: string;
    currency: string;
    currencySymbol: string;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
  };
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  documents: BusinessDocument[];
}

class ClientPortalService {
  async getClientStatement(clientId: string): Promise<ClientPortalStatement | null> {
    try {
      // 1. Fetch customer details
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      const client: Client = customerData
        ? {
            id: customerData.id,
            name: customerData.name,
            email: customerData.email || '',
            phone: customerData.phone || '',
            company: customerData.company || '',
            address: customerData.address || '',
            currency: 'NGN',
            totalBilled: 0,
            amountPaid: 0,
            balance: 0,
            status: customerData.status || 'active',
            createdAt: customerData.created_at,
          }
        : {
            id: clientId,
            name: 'Valued Client',
            company: '',
            email: 'client@company.com',
            phone: '',
            address: '',
            currency: 'NGN',
            totalBilled: 0,
            amountPaid: 0,
            balance: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
          };

      // 2. Fetch associated documents
      let docs: BusinessDocument[] = [];
      if (customerData) {
        const { data: docsData } = await supabase
          .from('documents')
          .select('*')
          .eq('customer_id', clientId)
          .order('date', { ascending: false });

        if (docsData) {
          docs = docsData.map((d: any) => ({
            id: d.id,
            type: d.type,
            documentNumber: d.document_number,
            title: d.title || `${d.type.toUpperCase()} #${d.document_number}`,
            business: {
              name: 'Studio & Associates',
              email: 'billing@studio.com',
            },
            client: {
              name: client.name,
              email: client.email,
              company: client.company,
            },
            date: d.date,
            dueDate: d.due_date,
            status: d.status,
            items: (d.items as any[]) || [],
            subtotal: Number(d.subtotal) || 0,
            taxRate: Number(d.tax_rate) || 0,
            taxAmount: Number(d.tax_amount) || 0,
            discountRate: Number(d.discount_rate) || 0,
            discountAmount: Number(d.discount_amount) || 0,
            total: Number(d.total) || 0,
            currency: d.currency || 'NGN',
            currencySymbol: d.currency_symbol || '₦',
            notes: d.notes,
            paymentDetails: {
              bankName: 'Guaranty Trust Bank (GTBank)',
              accountName: 'Studio & Associates Ltd',
              accountNumber: '0123456789',
            },
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      }

      // Sample fallback if empty
      if (docs.length === 0) {
        docs = [
          {
            id: 'doc_sample_1',
            type: 'invoice',
            documentNumber: 'INV-0012',
            title: 'Design & Branding Deliverables',
            business: {
              name: 'Studio & Associates',
              email: 'billing@studio.com',
            },
            client: {
              name: client.name,
              email: client.email,
              company: client.company,
            },
            date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
            status: 'sent',
            items: [{ id: '1', description: 'Brand Identity Design', quantity: 1, unitPrice: 350000, amount: 350000 }],
            subtotal: 350000,
            taxRate: 0,
            taxAmount: 0,
            discountRate: 0,
            discountAmount: 0,
            total: 350000,
            currency: 'NGN',
            currencySymbol: '₦',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'doc_sample_2',
            type: 'receipt',
            documentNumber: 'REC-0008',
            title: 'Website Development Deposit',
            business: {
              name: 'Studio & Associates',
              email: 'billing@studio.com',
            },
            client: {
              name: client.name,
              email: client.email,
              company: client.company,
            },
            date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
            status: 'paid',
            items: [{ id: '1', description: '50% Initial Project Deposit', quantity: 1, unitPrice: 200000, amount: 200000 }],
            subtotal: 200000,
            taxRate: 0,
            taxAmount: 0,
            discountRate: 0,
            discountAmount: 0,
            total: 200000,
            currency: 'NGN',
            currencySymbol: '₦',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }

      const totalInvoiced = docs.filter((d) => d.type === 'invoice').reduce((acc, d) => acc + d.total, 0);
      const totalPaid = docs.filter((d) => d.status === 'paid').reduce((acc, d) => acc + d.total, 0);
      const outstandingBalance = Math.max(0, totalInvoiced - totalPaid);

      return {
        client,
        business: {
          name: 'Studio & Associates',
          email: 'billing@studio.com',
          phone: '+234 800 000 0000',
          currency: 'NGN',
          currencySymbol: '₦',
          bankName: 'Guaranty Trust Bank (GTBank)',
          bankAccountName: 'Studio & Associates Ltd',
          bankAccountNumber: '0123456789',
        },
        totalInvoiced,
        totalPaid,
        outstandingBalance,
        documents: docs,
      };
    } catch (err) {
      console.error('Error fetching portal statement:', err);
      return null;
    }
  }
}

export const clientPortalService = new ClientPortalService();
