import { supabase } from './supabase';
import {
  BusinessDocument,
  DocumentType,
  DocumentStatus,
  LineItem,
  loadDocumentDraft,
  saveDocumentDraft,
  clearDocumentDraft,
  getDefaultDocument,
  validateDocument,
  calculateDocumentTotals,
  calculateLineItemTotal,
  generateDocumentNumber,
  getDocumentMeta,
  generateDocumentJsonLd,
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from './documents';
import { businessService } from './businessService';

class DocumentService {
  /**
   * Fetch all documents for the authenticated user's business with filtering.
   */
  async getDocuments(filter?: {
    type?: DocumentType | 'all';
    status?: DocumentStatus | 'all';
    search?: string;
  }): Promise<BusinessDocument[]> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return [];

    let query = supabase
      .from('documents')
      .select(`
        *,
        document_items (
          id,
          description,
          quantity,
          unit_price,
          amount,
          sort_order
        )
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (filter?.type && filter.type !== 'all') {
      query = query.eq('type', filter.type as any);
    }

    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status as any);
    }

    if (filter?.search) {
      const q = filter.search.trim();
      query = query.or(`document_number.ilike.%${q}%,title.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching documents from Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => this.mapRowToDocument(row));
  }

  /**
   * Fetch a single document by its UUID.
   */
  async getDocumentById(id: string): Promise<BusinessDocument | null> {
    const business = await businessService.getCurrentBusiness();
    if (!business) return null;

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_items (
          id,
          description,
          quantity,
          unit_price,
          amount,
          sort_order
        )
      `)
      .eq('id', id)
      .eq('business_id', business.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching document by id:', error);
      throw error;
    }

    if (!data) return null;
    return this.mapRowToDocument(data);
  }

  /**
   * Fetch document by id for unauthenticated public buyers.
   */
  async getPublicDocumentById(id: string): Promise<BusinessDocument | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_items (
            id,
            description,
            quantity,
            unit_price,
            amount,
            sort_order
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (data && !error) {
        return this.mapRowToDocument(data);
      }
    } catch (err) {
      console.warn('Public doc fetch fallback:', err);
    }

    // Check localStorage cache
    try {
      const local = localStorage.getItem(`bizpilotly_public_doc_${id}`);
      if (local) return JSON.parse(local);
      const draft = localStorage.getItem(`bizpilotly_draft_invoice`);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.id === id) return parsed;
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Save (create or update) a document and its line items in Supabase.
   */
  async saveDocument(doc: BusinessDocument): Promise<BusinessDocument> {
    const business = await businessService.getOrCreateDefaultBusiness();

    // Check if doc exists in database
    let existingId: string | null = null;
    if (doc.id && doc.id.includes('-') && doc.id.length >= 32) {
      const existing = await this.getDocumentById(doc.id);
      if (existing) existingId = existing.id;
    }

    const docPayload = {
      business_id: business.id,
      customer_id: doc.client.id || null,
      type: doc.type as any,
      document_number: doc.documentNumber,
      title: doc.title || `${doc.type.toUpperCase()} #${doc.documentNumber}`,
      issue_date: doc.date || new Date().toISOString().split('T')[0],
      due_date: doc.dueDate || null,
      valid_until: doc.validUntil || null,
      status: (doc.status as any) || 'draft',
      currency: doc.currency || 'USD',
      currency_symbol: doc.currencySymbol || '$',
      subtotal: doc.subtotal || 0,
      tax_rate: doc.taxRate || 0,
      tax_amount: doc.taxAmount || 0,
      discount_rate: doc.discountRate || 0,
      discount_amount: doc.discountAmount || 0,
      total: doc.total || 0,
      notes: doc.notes || null,
      terms: doc.terms || null,
      payment_details: doc.paymentDetails ? (doc.paymentDetails as any) : null,
      business_snapshot: doc.business ? (doc.business as any) : null,
      client_snapshot: doc.client ? (doc.client as any) : null,
    };

    let documentId = existingId;

    if (existingId) {
      // Update parent document
      const { data, error } = await supabase
        .from('documents')
        .update(docPayload)
        .eq('id', existingId)
        .select('id')
        .single();

      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }
      documentId = data.id;

      // Delete old line items before re-inserting
      await supabase.from('document_items').delete().eq('document_id', documentId);
    } else {
      // For new documents, verify document_number uniqueness or fetch next sequence
      let finalDocNumber = doc.documentNumber;
      if (!finalDocNumber) {
        finalDocNumber = await this.getNextDocumentNumber(doc.type);
        docPayload.document_number = finalDocNumber;
      }

      // Insert new parent document
      const { data, error } = await supabase
        .from('documents')
        .insert(docPayload)
        .select('id')
        .single();

      if (error) {
        // If unique constraint violation on document_number, get next number and retry once
        if (error.code === '23505' || error.message?.includes('uq_business_document_number')) {
          const freshNumber = await this.getNextDocumentNumber(doc.type);
          docPayload.document_number = freshNumber;
          const retryRes = await supabase
            .from('documents')
            .insert(docPayload)
            .select('id')
            .single();
          if (retryRes.error) throw retryRes.error;
          documentId = retryRes.data.id;
        } else {
          console.error('Error creating document:', error);
          throw error;
        }
      } else {
        documentId = data.id;
      }
    }

    // Insert line items
    if (doc.items && doc.items.length > 0 && documentId) {
      const itemsPayload = doc.items.map((item, idx) => ({
        document_id: documentId!,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        amount: item.amount,
        sort_order: idx,
      }));

      const { error: itemsError } = await supabase
        .from('document_items')
        .insert(itemsPayload);

      if (itemsError) {
        console.error('Error inserting document items:', itemsError);
        throw itemsError;
      }
    }

    const saved = await this.getDocumentById(documentId!);
    if (!saved) throw new Error('Failed to retrieve saved document');
    try {
      localStorage.setItem(`bizpilotly_public_doc_${saved.id}`, JSON.stringify(saved));
    } catch {
      // ignore
    }
    return saved;
  }

  /**
   * Retrieves the authoritative next sequential document number from the database for the current business.
   * Concurrency-safe and sequence-tracked per business and document type.
   */
  async getNextDocumentNumber(type: DocumentType): Promise<string> {
    const business = await businessService.getCurrentBusiness();
    if (!business) {
      return generateDocumentNumber(type);
    }

    try {
      // 1. Try calling the dedicated Supabase RPC function
      const { data, error } = await (supabase.rpc as any)('get_next_document_number', {
        p_business_id: business.id,
        p_doc_type: type,
      });

      if (!error && data) {
        return data as string;
      }
    } catch {
      // Fallback to table sequence query if RPC is not yet executed in database
    }

    // 2. Client-side sequence fallback with database query
    const prefix =
      type === 'invoice'
        ? business.invoice_prefix || 'INV'
        : type === 'quote'
        ? business.quote_prefix || 'QTE'
        : type === 'receipt'
        ? business.receipt_prefix || 'REC'
        : business.proposal_prefix || 'PROP';

    const currentYear = new Date().getFullYear();

    const { data: existingDocs } = await supabase
      .from('documents')
      .select('document_number')
      .eq('business_id', business.id)
      .eq('type', type);

    let maxSeq = 0;
    const regex = new RegExp(`^${prefix}-${currentYear}-(\\d+)$`, 'i');

    (existingDocs || []).forEach((d) => {
      const match = d.document_number?.match(regex);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });

    const nextSeq = maxSeq + 1;
    return `${prefix.toUpperCase()}-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Delete a document by UUID and remove any associated cloud storage PDF.
   */
  async deleteDocument(id: string): Promise<boolean> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business found');

    // Query storage path before deleting row
    const { data: doc } = await supabase
      .from('documents')
      .select('pdf_storage_path')
      .eq('id', id)
      .eq('business_id', business.id)
      .maybeSingle();

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('business_id', business.id);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }

    // Clean up stored PDF if exists
    if (doc?.pdf_storage_path) {
      await supabase.storage.from('documents').remove([doc.pdf_storage_path]).catch(console.warn);
    }

    return true;
  }

  /**
   * Update the status of a document (e.g. mark as sent, paid, cancelled).
   */
  async updateStatus(id: string, newStatus: DocumentStatus): Promise<BusinessDocument> {
    const business = await businessService.getCurrentBusiness();
    if (!business) throw new Error('No active business found');

    const currentDoc = await this.getDocumentById(id);
    if (!currentDoc) throw new Error('Document not found');

    const validTransitions: Record<DocumentStatus, DocumentStatus[]> = {
      draft: ['draft', 'sent', 'viewed', 'pending_confirmation', 'paid', 'cancelled'],
      sent: ['sent', 'viewed', 'accepted', 'pending_confirmation', 'paid', 'overdue', 'cancelled'],
      viewed: ['viewed', 'accepted', 'pending_confirmation', 'paid', 'overdue', 'cancelled'],
      accepted: ['accepted', 'pending_confirmation', 'paid', 'cancelled'],
      pending_confirmation: ['pending_confirmation', 'paid', 'sent', 'cancelled'],
      overdue: ['overdue', 'pending_confirmation', 'paid', 'cancelled'],
      paid: ['paid'],
      cancelled: ['cancelled'],
    };

    const allowed = validTransitions[currentDoc.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status transition from "${currentDoc.status}" to "${newStatus}".`);
    }

    const { data, error } = await supabase
      .from('documents')
      .update({ status: newStatus as any })
      .eq('id', id)
      .eq('business_id', business.id)
      .select('id')
      .single();

    if (error) {
      console.error('Error updating document status:', error);
      throw error;
    }

    const updated = await this.getDocumentById(data.id);
    if (!updated) throw new Error('Failed to fetch updated document');
    return updated;
  }

  private mapRowToDocument(row: any): BusinessDocument {
    const rawItems = row.document_items || [];
    const items: LineItem[] = rawItems
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unit_price) || 0,
        amount: Number(item.amount) || 0,
      }));

    return {
      id: row.id,
      type: row.type as DocumentType,
      documentNumber: row.document_number,
      title: row.title,
      date: row.issue_date,
      dueDate: row.due_date || undefined,
      validUntil: row.valid_until || undefined,
      status: row.status as DocumentStatus,
      business: row.business_snapshot || {
        name: 'My Business Studio',
        email: '',
      },
      client: row.client_snapshot || {
        id: row.customer_id,
        name: 'Client',
        email: '',
      },
      items,
      subtotal: Number(row.subtotal) || 0,
      taxRate: Number(row.tax_rate) || 0,
      taxAmount: Number(row.tax_amount) || 0,
      discountRate: Number(row.discount_rate) || 0,
      discountAmount: Number(row.discount_amount) || 0,
      total: Number(row.total) || 0,
      currency: row.currency || 'USD',
      currencySymbol: row.currency_symbol || '$',
      notes: row.notes || undefined,
      terms: row.terms || undefined,
      paymentDetails: row.payment_details || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Pure / Synchronous Document Utilities for Anonymous Phase 2
  loadDraft(type: DocumentType): BusinessDocument {
    return loadDocumentDraft(type);
  }

  saveDraft(type: DocumentType, doc: BusinessDocument): boolean {
    return saveDocumentDraft(type, doc);
  }

  clearDraft(type: DocumentType): BusinessDocument {
    return clearDocumentDraft(type);
  }

  getDefault(type: DocumentType): BusinessDocument {
    return getDefaultDocument(type);
  }

  validate(doc: BusinessDocument) {
    return validateDocument(doc);
  }

  calculateTotals(items: Array<{ quantity: number; unitPrice: number }>, taxRate?: number, discountRate?: number) {
    return calculateDocumentTotals(items, taxRate, discountRate);
  }

  calculateLineItem(quantity: number, unitPrice: number) {
    return calculateLineItemTotal(quantity, unitPrice);
  }

  generateNumber(type: DocumentType) {
    return generateDocumentNumber(type);
  }

  getMeta(type: DocumentType) {
    return getDocumentMeta(type);
  }

  getJsonLd(type: DocumentType) {
    const meta = getDocumentMeta(type);
    return generateDocumentJsonLd(meta);
  }

  getCurrencies() {
    return SUPPORTED_CURRENCIES;
  }

  formatCurrency(amount: number, currencyCode?: string, customSymbol?: string) {
    return formatCurrencyAmount(amount, currencyCode, customSymbol);
  }
}

export const documentService = new DocumentService();
export * from './documents';

