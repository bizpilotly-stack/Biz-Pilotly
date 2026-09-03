import { supabase } from './supabase';
import { BusinessSettings } from '../types';
import { Database } from '../types/database.types';

type BusinessRow = Database['public']['Tables']['businesses']['Row'];

function rowToSettings(row: BusinessRow): BusinessSettings {
  return {
    name: row.name,
    tagline: row.tagline || '',
    logo: row.logo_url || '',
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    website: row.website || '',
    taxNumber: row.tax_number || '',
    currency: row.currency || 'NGN',
    currencySymbol: row.currency_symbol || '₦',
    defaultTaxRate: Number(row.default_tax_rate) || 0,
    invoicePrefix: row.invoice_prefix || 'INV',
    quotePrefix: row.quote_prefix || 'QTE',
    estimatePrefix: (row as any).estimate_prefix || 'EST',
    proposalPrefix: row.proposal_prefix || 'PROP',
    contractPrefix: (row as any).contract_prefix || 'CON',
    receiptPrefix: row.receipt_prefix || 'REC',
    defaultPaymentTerms: row.default_payment_terms || 'Payment due within 15 calendar days of issuance.',
    defaultNotes: row.default_notes || 'Thank you for your business.',
    bankDetails: {
      bankName: row.bank_name || '',
      accountName: row.bank_account_name || '',
      accountNumber: row.bank_account_number || '',
      routingCode: row.bank_routing_code || '',
    },
  };
}

class BusinessService {
  /**
   * Get the primary business row for the currently authenticated user.
   */
  async getCurrentBusiness(): Promise<BusinessRow | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current business:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get or automatically initialize a default business record for a new user.
   */
  async getOrCreateDefaultBusiness(): Promise<BusinessRow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User is not authenticated');

    const existing = await this.getCurrentBusiness();
    if (existing) return existing;

    const defaultName = user.user_metadata?.full_name
      ? `${user.user_metadata.full_name}'s Business`
      : 'My Business Studio';

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: defaultName,
        email: user.email || '',
        currency: 'NGN',
        currency_symbol: '₦',
        default_tax_rate: 0,
        invoice_prefix: 'INV',
        quote_prefix: 'QTE',
        estimate_prefix: 'EST',
        proposal_prefix: 'PROP',
        contract_prefix: 'CON',
        receipt_prefix: 'REC',
        default_payment_terms: 'Payment due within 15 calendar days of issuance.',
        default_notes: 'Thank you for your business. Please reach out if you have any questions.',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating default business:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get current business settings formatted for UI forms.
   */
  async getSettings(): Promise<BusinessSettings> {
    const business = await this.getOrCreateDefaultBusiness();
    return rowToSettings(business);
  }

  /**
   * Update current business settings in Supabase.
   */
  async updateSettings(settings: BusinessSettings): Promise<BusinessSettings> {
    const business = await this.getOrCreateDefaultBusiness();

    const { data, error } = await supabase
      .from('businesses')
      .update({
        name: settings.name,
        tagline: settings.tagline || null,
        logo_url: settings.logo || null,
        email: settings.email || null,
        phone: settings.phone || null,
        address: settings.address || null,
        website: settings.website || null,
        tax_number: settings.taxNumber || null,
        currency: settings.currency || 'USD',
        currency_symbol: settings.currencySymbol || '$',
        default_tax_rate: settings.defaultTaxRate ?? 0,
        invoice_prefix: settings.invoicePrefix || 'INV',
        quote_prefix: settings.quotePrefix || 'QTE',
        estimate_prefix: settings.estimatePrefix || 'EST',
        proposal_prefix: settings.proposalPrefix || 'PROP',
        contract_prefix: settings.contractPrefix || 'CON',
        receipt_prefix: settings.receiptPrefix || 'REC',
        default_payment_terms: settings.defaultPaymentTerms || null,
        default_notes: settings.defaultNotes || null,
        bank_name: settings.bankDetails?.bankName || null,
        bank_account_name: settings.bankDetails?.accountName || null,
        bank_account_number: settings.bankDetails?.accountNumber || null,
        bank_routing_code: settings.bankDetails?.routingCode || null,
      })
      .eq('id', business.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating business settings:', error);
      throw error;
    }

    return rowToSettings(data);
  }
}

export const businessService = new BusinessService();
