import { supabase } from './supabase';
import { BusinessSettings } from '../types';
import { Database } from '../types/database.types';

type BusinessRow = Database['public']['Tables']['businesses']['Row'];

const CACHE_KEY = 'bizpilotly_business_settings_cache';

function getLocalCache(): Partial<BusinessSettings> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalCache(settings: BusinessSettings): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function rowToSettings(row: BusinessRow): BusinessSettings {
  const cached = getLocalCache();
  return {
    name: row.name || cached.name || 'My Business Studio',
    tagline: row.tagline || cached.tagline || '',
    logo: row.logo_url || cached.logo || '',
    email: row.email || cached.email || '',
    phone: row.phone || cached.phone || '',
    address: row.address || cached.address || '',
    website: row.website || cached.website || '',
    taxNumber: row.tax_number || cached.taxNumber || '',
    currency: row.currency || cached.currency || 'NGN',
    currencySymbol: row.currency_symbol || cached.currencySymbol || '₦',
    defaultTaxRate: Number(row.default_tax_rate) || cached.defaultTaxRate || 0,
    invoicePrefix: row.invoice_prefix || cached.invoicePrefix || 'INV',
    quotePrefix: row.quote_prefix || cached.quotePrefix || 'QTE',
    estimatePrefix: (row as any).estimate_prefix || cached.estimatePrefix || 'EST',
    proposalPrefix: row.proposal_prefix || cached.proposalPrefix || 'PROP',
    contractPrefix: (row as any).contract_prefix || cached.contractPrefix || 'CON',
    receiptPrefix: row.receipt_prefix || cached.receiptPrefix || 'REC',
    primaryColor: (row as any).primary_color || cached.primaryColor || '#0B1F3A',
    defaultPaymentTerms: row.default_payment_terms || cached.defaultPaymentTerms || 'Payment due within 15 calendar days of issuance.',
    defaultNotes: row.default_notes || cached.defaultNotes || 'Thank you for your business.',
    bankDetails: {
      bankName: row.bank_name || cached.bankDetails?.bankName || '',
      accountName: row.bank_account_name || cached.bankDetails?.accountName || '',
      accountNumber: row.bank_account_number || cached.bankDetails?.accountNumber || '',
      routingCode: row.bank_routing_code || cached.bankDetails?.routingCode || '',
    },
    signature: cached.signature,
  };
}

class BusinessService {
  /**
   * Get the primary business row for the currently authenticated user.
   */
  async getCurrentBusiness(): Promise<BusinessRow | null> {
    try {
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
        console.warn('Notice fetching current business from supabase:', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.warn('Network error fetching current business:', err);
      return null;
    }
  }

  /**
   * Get or automatically initialize a default business record for a new user.
   */
  async getOrCreateDefaultBusiness(): Promise<BusinessRow | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

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
          proposal_prefix: 'PROP',
          receipt_prefix: 'REC',
          default_payment_terms: 'Payment due within 15 calendar days of issuance.',
          default_notes: 'Thank you for your business. Please reach out if you have any questions.',
        })
        .select('*')
        .single();

      if (error) {
        console.warn('Notice creating default business row:', error.message);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  /**
   * Get current business settings formatted for UI forms.
   */
  async getSettings(): Promise<BusinessSettings> {
    const business = await this.getCurrentBusiness();
    if (business) {
      const s = rowToSettings(business);
      setLocalCache(s);
      return s;
    }

    const cached = getLocalCache();
    return {
      name: cached.name || 'My Business Studio',
      tagline: cached.tagline || '',
      logo: cached.logo || '',
      email: cached.email || '',
      phone: cached.phone || '',
      address: cached.address || '',
      website: cached.website || '',
      taxNumber: cached.taxNumber || '',
      currency: cached.currency || 'NGN',
      currencySymbol: cached.currencySymbol || '₦',
      defaultTaxRate: cached.defaultTaxRate || 0,
      invoicePrefix: cached.invoicePrefix || 'INV',
      quotePrefix: cached.quotePrefix || 'QTE',
      estimatePrefix: cached.estimatePrefix || 'EST',
      proposalPrefix: cached.proposalPrefix || 'PROP',
      contractPrefix: cached.contractPrefix || 'CON',
      receiptPrefix: cached.receiptPrefix || 'REC',
      primaryColor: cached.primaryColor || '#0B1F3A',
      defaultPaymentTerms: cached.defaultPaymentTerms || 'Payment due within 15 calendar days of issuance.',
      defaultNotes: cached.defaultNotes || 'Thank you for your business.',
      bankDetails: {
        bankName: cached.bankDetails?.bankName || '',
        accountName: cached.bankDetails?.accountName || '',
        accountNumber: cached.bankDetails?.accountNumber || '',
        routingCode: cached.bankDetails?.routingCode || '',
      },
      signature: cached.signature,
    };
  }

  /**
   * Update current business settings in Supabase with resilient local cache fallback.
   */
  async updateSettings(settings: BusinessSettings): Promise<BusinessSettings> {
    // 1. Always cache immediately so user changes are never lost
    setLocalCache(settings);

    try {
      const business = await this.getOrCreateDefaultBusiness();

      if (business) {
        // Attempt full update
        const updatePayload: Record<string, any> = {
          name: settings.name,
          tagline: settings.tagline || null,
          logo_url: settings.logo || null,
          email: settings.email || null,
          phone: settings.phone || null,
          address: settings.address || null,
          website: settings.website || null,
          tax_number: settings.taxNumber || null,
          currency: settings.currency || 'NGN',
          currency_symbol: settings.currencySymbol || '₦',
          default_tax_rate: settings.defaultTaxRate ?? 0,
          invoice_prefix: settings.invoicePrefix || 'INV',
          quote_prefix: settings.quotePrefix || 'QTE',
          proposal_prefix: settings.proposalPrefix || 'PROP',
          receipt_prefix: settings.receiptPrefix || 'REC',
          default_payment_terms: settings.defaultPaymentTerms || null,
          default_notes: settings.defaultNotes || null,
          bank_name: settings.bankDetails?.bankName || null,
          bank_account_name: settings.bankDetails?.accountName || null,
          bank_account_number: settings.bankDetails?.accountNumber || null,
          bank_routing_code: settings.bankDetails?.routingCode || null,
        };

        const { data, error } = await supabase
          .from('businesses')
          .update(updatePayload)
          .eq('id', business.id)
          .select('*')
          .maybeSingle();

        if (error) {
          console.warn('Supabase partial update notice:', error.message);
        } else if (data) {
          const merged = rowToSettings(data);
          merged.signature = settings.signature;
          merged.primaryColor = settings.primaryColor || '#0B1F3A';
          merged.estimatePrefix = settings.estimatePrefix || 'EST';
          merged.contractPrefix = settings.contractPrefix || 'CON';
          setLocalCache(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('Settings saved locally:', err);
    }

    return settings;
  }
}

export const businessService = new BusinessService();
