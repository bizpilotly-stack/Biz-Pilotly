import { supabase } from './supabase';
import { Payment } from '../types';
import { Database } from '../types/database.types';
import { businessService } from './businessService';

class PaymentService {
  async getPayments(filter?: { search?: string; status?: string }): Promise<Payment[]> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return [];

    let query = supabase
      .from('payments')
      .select(`
        *,
        documents (
          id,
          document_number
        ),
        customers (
          id,
          name,
          company
        )
      `)
      .eq('business_id', business.id)
      .order('date', { ascending: false });

    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status as any);
    }

    if (filter?.search) {
      const q = filter.search.trim();
      query = query.or(`payment_number.ilike.%${q}%,reference.ilike.%${q}%,notes.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      paymentNumber: row.payment_number,
      invoiceId: row.document_id || '',
      invoiceNumber: row.documents?.document_number || 'General Settlement',
      clientId: row.customer_id || '',
      clientName: row.customers ? `${row.customers.name}${row.customers.company ? ` (${row.customers.company})` : ''}` : 'Direct Client',
      amount: Number(row.amount) || 0,
      currency: row.currency || 'USD',
      currencySymbol: row.currency_symbol || '$',
      method: row.method as Payment['method'],
      date: row.date,
      status: row.status as Payment['status'],
      reference: row.reference || undefined,
      notes: row.notes || undefined,
    }));
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return null;

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        documents (
          id,
          document_number
        ),
        customers (
          id,
          name,
          company
        )
      `)
      .eq('id', id)
      .eq('business_id', business.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching payment by id:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      paymentNumber: data.payment_number,
      invoiceId: data.document_id || '',
      invoiceNumber: (data as any).documents?.document_number || 'General Settlement',
      clientId: data.customer_id || '',
      clientName: (data as any).customers
        ? `${(data as any).customers.name}${(data as any).customers.company ? ` (${(data as any).customers.company})` : ''}`
        : 'Direct Client',
      amount: Number(data.amount) || 0,
      currency: data.currency || 'USD',
      currencySymbol: data.currency_symbol || '$',
      method: data.method as Payment['method'],
      date: data.date,
      status: data.status as Payment['status'],
      reference: data.reference || undefined,
      notes: data.notes || undefined,
    };
  }

  async recordPayment(paymentData: Omit<Payment, 'id' | 'paymentNumber'>): Promise<Payment> {
    const business = await businessService.getOrCreateDefaultBusiness();
    if (!business) throw new Error('No active business found');

    // Generate clean payment number based on current count
    const { count } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id);

    const paymentNumber = `PAY-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;

    // Resolve document_id if invoiceNumber / invoiceId is provided
    let documentId: string | null = paymentData.invoiceId || null;
    if (!documentId && paymentData.invoiceNumber && paymentData.invoiceNumber !== 'General Settlement') {
      const { data: doc } = await supabase
        .from('documents')
        .select('id')
        .eq('business_id', business.id)
        .eq('document_number', paymentData.invoiceNumber)
        .maybeSingle();
      if (doc) documentId = doc.id;
    }

    // Resolve customer_id if clientId is provided
    let customerId: string | null = paymentData.clientId || null;
    if (!customerId && paymentData.clientName) {
      const cleanName = paymentData.clientName.split('(')[0].trim();
      const { data: cust } = await supabase
        .from('customers')
        .select('id')
        .eq('business_id', business.id)
        .ilike('name', `%${cleanName}%`)
        .maybeSingle();
      if (cust) customerId = cust.id;
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        business_id: business.id,
        document_id: documentId,
        customer_id: customerId,
        payment_number: paymentNumber,
        amount: paymentData.amount,
        currency: paymentData.currency || 'NGN',
        currency_symbol: paymentData.currencySymbol || '₦',
        method: paymentData.method,
        date: paymentData.date || new Date().toISOString().split('T')[0],
        status: paymentData.status as any,
        reference: paymentData.reference || null,
        notes: paymentData.notes || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error recording payment:', error);
      throw error;
    }

    // If payment is completed and attached to an invoice, check if total completed payments cover invoice total
    if (data.status === 'completed' && documentId) {
      const { data: invoice } = await supabase
        .from('documents')
        .select('total, status')
        .eq('id', documentId)
        .eq('business_id', business.id)
        .maybeSingle();

      if (invoice) {
        const { data: docPayments } = await supabase
          .from('payments')
          .select('amount')
          .eq('document_id', documentId)
          .eq('business_id', business.id)
          .eq('status', 'completed');

        const totalPaid = (docPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const invoiceTotal = Number(invoice.total) || 0;

        if (totalPaid >= invoiceTotal) {
          await supabase
            .from('documents')
            .update({ status: 'paid' as any })
            .eq('id', documentId)
            .eq('business_id', business.id);
        }
      }
    }

    const created = await this.getPaymentById(data.id);
    if (!created) throw new Error('Failed to retrieve recorded payment');
    return created;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business found');

    const updatePayload: Database['public']['Tables']['payments']['Update'] = {};
    if (updates.amount !== undefined) updatePayload.amount = updates.amount;
    if (updates.method !== undefined) updatePayload.method = updates.method;
    if (updates.date !== undefined) updatePayload.date = updates.date;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.reference !== undefined) updatePayload.reference = updates.reference || null;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes || null;

    const { error } = await supabase
      .from('payments')
      .update(updatePayload)
      .eq('id', id)
      .eq('business_id', business.id);

    if (error) {
      console.error('Error updating payment:', error);
      throw error;
    }

    const updated = await this.getPaymentById(id);
    if (!updated) throw new Error('Failed to fetch updated payment');
    return updated;
  }

  async deletePayment(id: string): Promise<boolean> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business found');

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('business_id', business.id);

    if (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }

    return true;
  }

  async getPaymentSummary() {
    const business = await businessService.getCurrentBusiness();
    const payments = await this.getPayments();
    const totalReceived = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    let overdueAmount = 0;
    let overdueCount = 0;

    if (business) {
      const { data: overdueDocs } = await supabase
        .from('documents')
        .select('total')
        .eq('business_id', business.id)
        .eq('status', 'overdue');

      if (overdueDocs) {
        overdueAmount = overdueDocs.reduce((sum, d) => sum + (Number(d.total) || 0), 0);
        overdueCount = overdueDocs.length;
      }
    }

    return {
      totalReceived,
      pendingAmount,
      overdueAmount,
      overdueCount,
      completedCount: payments.filter((p) => p.status === 'completed').length,
      pendingCount: payments.filter((p) => p.status === 'pending').length,
    };
  }
}

export const paymentService = new PaymentService();
