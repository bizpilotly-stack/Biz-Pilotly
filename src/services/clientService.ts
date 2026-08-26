import { supabase } from './supabase';
import { Client } from '../types';
import { Database } from '../types/database.types';
import { businessService } from './businessService';

class ClientService {
  async getClients(filter?: { search?: string; status?: string }): Promise<Client[]> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return [];

    let query = supabase
      .from('customers')
      .select(`
        *,
        documents (
          id,
          document_number,
          type,
          total,
          issue_date,
          status
        ),
        payments (
          amount,
          status
        )
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status as any);
    }

    if (filter?.search) {
      const q = filter.search.trim();
      query = query.or(`name.ilike.%${q}%,company.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    return (data || []).map((row: any) => {
      const docs = row.documents || [];
      const pays = row.payments || [];

      const totalBilled = docs
        .filter((d: any) => d.type === 'invoice' && d.status !== 'cancelled' && d.status !== 'draft')
        .reduce((sum: number, d: any) => sum + (Number(d.total) || 0), 0);

      const amountPaid = pays
        .filter((p: any) => p.status === 'completed')
        .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

      const balance = Math.max(0, totalBilled - amountPaid);

      return {
        id: row.id,
        name: row.name,
        company: row.company || '',
        email: row.email || '',
        phone: row.phone || '',
        address: row.address || '',
        website: row.website || '',
        currency: row.currency || 'USD',
        status: row.status as 'active' | 'inactive' | 'lead',
        notes: row.notes || '',
        totalBilled,
        amountPaid,
        balance,
        createdAt: row.created_at,
        recentDocuments: docs.slice(0, 5).map((d: any) => ({
          id: d.id,
          number: d.document_number,
          type: d.type,
          amount: Number(d.total) || 0,
          date: d.issue_date,
          status: d.status,
        })),
      };
    });
  }

  async getClientById(id: string): Promise<Client | null> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return null;

    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        documents (
          id,
          document_number,
          type,
          total,
          issue_date,
          status
        ),
        payments (
          amount,
          status
        )
      `)
      .eq('id', id)
      .eq('business_id', business.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching client by id:', error);
      throw error;
    }

    if (!data) return null;

    const docs = (data as any).documents || [];
    const pays = (data as any).payments || [];

    const totalBilled = docs
      .filter((d: any) => d.type === 'invoice' && d.status !== 'cancelled' && d.status !== 'draft')
      .reduce((sum: number, d: any) => sum + (Number(d.total) || 0), 0);

    const amountPaid = pays
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

    const balance = Math.max(0, totalBilled - amountPaid);

    return {
      id: data.id,
      name: data.name,
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      website: data.website || '',
      currency: data.currency || 'USD',
      status: data.status as 'active' | 'inactive' | 'lead',
      notes: data.notes || '',
      totalBilled,
      amountPaid,
      balance,
      createdAt: data.created_at,
      recentDocuments: docs.map((d: any) => ({
        id: d.id,
        number: d.document_number,
        type: d.type,
        amount: Number(d.total) || 0,
        date: d.issue_date,
        status: d.status,
      })),
    };
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'totalBilled' | 'amountPaid' | 'balance'>): Promise<Client> {
    const business = await businessService.getOrCreateDefaultBusiness();

    const { data, error } = await supabase
      .from('customers')
      .insert({
        business_id: business.id,
        name: clientData.name,
        company: clientData.company || null,
        email: clientData.email || null,
        phone: clientData.phone || null,
        address: clientData.address || null,
        website: clientData.website || null,
        currency: clientData.currency || 'USD',
        status: (clientData.status as any) || 'active',
        notes: clientData.notes || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      website: data.website || '',
      currency: data.currency || 'USD',
      status: data.status as 'active' | 'inactive' | 'lead',
      notes: data.notes || '',
      totalBilled: 0,
      amountPaid: 0,
      balance: 0,
      createdAt: data.created_at,
      recentDocuments: [],
    };
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business found');

    const updatePayload: Database['public']['Tables']['customers']['Update'] = {};
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.company !== undefined) updatePayload.company = updates.company || null;
    if (updates.email !== undefined) updatePayload.email = updates.email || null;
    if (updates.phone !== undefined) updatePayload.phone = updates.phone || null;
    if (updates.address !== undefined) updatePayload.address = updates.address || null;
    if (updates.website !== undefined) updatePayload.website = updates.website || null;
    if (updates.currency !== undefined) updatePayload.currency = updates.currency;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes || null;

    const { data, error } = await supabase
      .from('customers')
      .update(updatePayload)
      .eq('id', id)
      .eq('business_id', business.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }

    return this.getClientById(data.id) as Promise<Client>;
  }

  async deleteClient(id: string): Promise<boolean> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business found');

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('business_id', business.id);

    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }

    return true;
  }
}

export const clientService = new ClientService();
