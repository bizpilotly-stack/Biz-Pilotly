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
import { emailService } from './emailService';

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
      const draftKeys = ['invoice', 'quote', 'estimate', 'proposal', 'contract', 'receipt'];
      for (const key of draftKeys) {
        const draft = localStorage.getItem(`bizpilotly_draft_${key}_v1`);
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.id === id) return parsed;
        }
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
    if (!business) {
      localStorage.setItem(`bizpilotly_draft_${doc.type}`, JSON.stringify(doc));
      return doc;
    }

    // Check if doc exists in database
    let existingId: string | null = null;
    if (doc.id && doc.id.includes('-') && doc.id.length >= 32) {
      const existing = await this.getDocumentById(doc.id);
      if (existing?.id) existingId = existing.id;
    }

    // Pack extended metadata (rejectionReason, sourceDocument, contractTerms, etc.) into client/business/payment snapshots
    const extendedMeta: Record<string, any> = {
      sourceDocumentId: doc.sourceDocumentId || null,
      sourceDocumentNumber: doc.sourceDocumentNumber || null,
      sourceDocumentType: doc.sourceDocumentType || null,
      rejectionReason: doc.rejectionReason || null,
      acceptedAt: doc.acceptedAt || null,
      rejectedAt: doc.rejectedAt || null,
      signedAt: doc.signedAt || null,
      signerInfo: doc.signerInfo || null,
      contractTerms: doc.contractTerms || null,
      projectOverview: doc.projectOverview || null,
      scope: doc.scope || null,
      deliverables: doc.deliverables || null,
      timeline: doc.timeline || null,
      signature: doc.signature || null,
    };

    const docPayload = {
      business_id: business.id,
      customer_id: doc.client?.id || null,
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
      payment_details: {
        ...(doc.paymentDetails || {}),
        _meta: extendedMeta,
      },
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
   */
  async getNextDocumentNumber(type: DocumentType): Promise<string> {
    const business = await businessService.getCurrentBusiness();
    if (!business) {
      return generateDocumentNumber(type);
    }

    try {
      const { data, error } = await (supabase.rpc as any)('get_next_document_number', {
        p_business_id: business.id,
        p_doc_type: type,
      });

      if (!error && data) {
        return data as string;
      }
    } catch {
      // Fallback
    }

    // Client-side sequence fallback with database query
    const prefix =
      type === 'invoice'
        ? business.invoice_prefix || 'INV'
        : type === 'quote'
        ? business.quote_prefix || 'QTE'
        : type === 'estimate'
        ? 'EST'
        : type === 'contract'
        ? 'CON'
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

    // Automatic Idempotent Receipt Issuance on Invoice Payment
    if (updated.type === 'invoice' && newStatus === 'paid') {
      try {
        await this.autoGenerateReceiptForInvoice(updated);
      } catch (receiptErr) {
        console.warn('Auto receipt issuance notice:', receiptErr);
      }
    }

    return updated;
  }

  /**
   * 1-Click: Generate an Invoice from an accepted Proposal
   */
  async generateInvoiceFromProposal(proposalId: string): Promise<BusinessDocument> {
    const proposal = await this.getDocumentById(proposalId) || await this.getPublicDocumentById(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    const docNumber = await this.getNextDocumentNumber('invoice');
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const newInvoice: BusinessDocument = {
      id: '',
      type: 'invoice',
      documentNumber: docNumber,
      title: `Invoice for ${proposal.title || 'Client Project'}`,
      date: today,
      dueDate,
      status: 'draft',
      business: { ...proposal.business },
      client: { ...proposal.client },
      items: proposal.items.map((it, idx) => ({ ...it, id: `item-${idx + 1}` })),
      subtotal: proposal.subtotal,
      taxRate: proposal.taxRate,
      taxAmount: proposal.taxAmount,
      discountRate: proposal.discountRate,
      discountAmount: proposal.discountAmount,
      total: proposal.total,
      currency: proposal.currency,
      currencySymbol: proposal.currencySymbol,
      notes: `Generated from Proposal #${proposal.documentNumber}.\n${proposal.notes || ''}`.trim(),
      terms: proposal.terms || 'Payment is due within 30 days of invoice date.',
      sourceDocumentId: proposal.id,
      sourceDocumentNumber: proposal.documentNumber,
      sourceDocumentType: 'proposal',
      paymentDetails: proposal.paymentDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.saveDocument(newInvoice);
  }

  /**
   * 1-Click: Generate an Invoice from an accepted Quote
   */
  async generateInvoiceFromQuote(quoteId: string): Promise<BusinessDocument> {
    const quote = await this.getDocumentById(quoteId) || await this.getPublicDocumentById(quoteId);
    if (!quote) throw new Error('Quote not found');

    const docNumber = await this.getNextDocumentNumber('invoice');
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const newInvoice: BusinessDocument = {
      id: '',
      type: 'invoice',
      documentNumber: docNumber,
      title: `Invoice for ${quote.title || 'Quote Services'}`,
      date: today,
      dueDate,
      status: 'draft',
      business: { ...quote.business },
      client: { ...quote.client },
      items: quote.items.map((it, idx) => ({ ...it, id: `item-${idx + 1}` })),
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      discountRate: quote.discountRate,
      discountAmount: quote.discountAmount,
      total: quote.total,
      currency: quote.currency,
      currencySymbol: quote.currencySymbol,
      notes: `Generated from Quote #${quote.documentNumber}.\n${quote.notes || ''}`.trim(),
      terms: quote.terms || 'Payment is due within 30 days of invoice date.',
      sourceDocumentId: quote.id,
      sourceDocumentNumber: quote.documentNumber,
      sourceDocumentType: 'quote',
      paymentDetails: quote.paymentDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.saveDocument(newInvoice);
  }

  /**
   * 1-Click: Generate an Invoice from an Estimate
   */
  async generateInvoiceFromEstimate(estimateId: string): Promise<BusinessDocument> {
    const estimate = await this.getDocumentById(estimateId) || await this.getPublicDocumentById(estimateId);
    if (!estimate) throw new Error('Estimate not found');

    const docNumber = await this.getNextDocumentNumber('invoice');
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const newInvoice: BusinessDocument = {
      id: '',
      type: 'invoice',
      documentNumber: docNumber,
      title: `Invoice for ${estimate.title || 'Estimated Services'}`,
      date: today,
      dueDate,
      status: 'draft',
      business: { ...estimate.business },
      client: { ...estimate.client },
      items: estimate.items.map((it, idx) => ({ ...it, id: `item-${idx + 1}` })),
      subtotal: estimate.subtotal,
      taxRate: estimate.taxRate,
      taxAmount: estimate.taxAmount,
      discountRate: estimate.discountRate,
      discountAmount: estimate.discountAmount,
      total: estimate.total,
      currency: estimate.currency,
      currencySymbol: estimate.currencySymbol,
      notes: `Generated from Estimate #${estimate.documentNumber}.\n${estimate.notes || ''}`.trim(),
      terms: estimate.terms || 'Payment is due within 30 days of invoice date.',
      sourceDocumentId: estimate.id,
      sourceDocumentNumber: estimate.documentNumber,
      sourceDocumentType: 'estimate',
      paymentDetails: estimate.paymentDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.saveDocument(newInvoice);
  }

  /**
   * Automatically generate an official Receipt for a paid Invoice (Idempotent).
   */
  async autoGenerateReceiptForInvoice(invoiceOrId: BusinessDocument | string): Promise<BusinessDocument> {
    let invoice: BusinessDocument | null = null;
    if (typeof invoiceOrId === 'string') {
      invoice = await this.getDocumentById(invoiceOrId) || await this.getPublicDocumentById(invoiceOrId);
    } else {
      invoice = invoiceOrId;
    }

    if (!invoice) throw new Error('Invoice not found for receipt generation');

    // 1. Idempotency Check: Verify if a receipt already exists for this invoice
    const allDocs = await this.getDocuments({ type: 'receipt' }).catch(() => []);
    const existingReceipt = allDocs.find(
      (d) => d.sourceDocumentId === invoice?.id || d.sourceDocumentNumber === invoice?.documentNumber
    );

    if (existingReceipt) {
      return existingReceipt;
    }

    // 2. Generate new receipt
    const docNumber = await this.getNextDocumentNumber('receipt');
    const today = new Date().toISOString().split('T')[0];

    const newReceipt: BusinessDocument = {
      id: '',
      type: 'receipt',
      documentNumber: docNumber,
      title: `Payment Receipt for Invoice #${invoice.documentNumber}`,
      date: today,
      status: 'paid',
      business: { ...invoice.business },
      client: { ...invoice.client },
      items: invoice.items.map((it, idx) => ({ ...it, id: `item-${idx + 1}` })),
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      discountRate: invoice.discountRate,
      discountAmount: invoice.discountAmount,
      total: invoice.total,
      currency: invoice.currency,
      currencySymbol: invoice.currencySymbol,
      notes: `Official Receipt acknowledging full settlement of Invoice #${invoice.documentNumber}.\nThank you for your business!`,
      paymentMethod: invoice.paymentDetails?.paymentMethod || 'Bank Transfer',
      paymentReference: invoice.paymentDetails?.paymentReference || `REC-PAY-${Date.now().toString(36).toUpperCase()}`,
      sourceDocumentId: invoice.id,
      sourceDocumentNumber: invoice.documentNumber,
      sourceDocumentType: 'invoice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.saveDocument(newReceipt);
  }

  /**
   * Duplicate / Clone an existing document with a fresh document number and draft status.
   */
  async duplicateDocument(documentId: string): Promise<BusinessDocument> {
    const original = await this.getDocumentById(documentId) || await this.getPublicDocumentById(documentId);
    if (!original) throw new Error('Original document not found to duplicate');

    const freshNumber = await this.getNextDocumentNumber(original.type);
    const today = new Date().toISOString().split('T')[0];

    const cloned: BusinessDocument = {
      ...original,
      id: '',
      documentNumber: freshNumber,
      title: `${original.title || original.type.toUpperCase()} (Copy)`,
      date: today,
      dueDate: original.dueDate ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] : undefined,
      validUntil: original.validUntil ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] : undefined,
      status: 'draft',
      acceptedAt: undefined,
      rejectedAt: undefined,
      signedAt: undefined,
      signerInfo: undefined,
      sourceDocumentId: original.id,
      sourceDocumentNumber: original.documentNumber,
      sourceDocumentType: original.type,
      items: original.items.map((it, idx) => ({ ...it, id: `item-${idx + 1}` })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.saveDocument(cloned);
  }

  /**
   * Fetch all documents related to a given document (e.g. Proposal -> Invoice -> Receipt).
   */
  async getRelatedDocuments(docId: string): Promise<BusinessDocument[]> {
    const all = await this.getDocuments().catch(() => []);
    const target = all.find((d) => d.id === docId);
    if (!target) return [];

    const related: BusinessDocument[] = [];

    // Find parent source document
    if (target.sourceDocumentId) {
      const parent = all.find((d) => d.id === target.sourceDocumentId);
      if (parent) related.push(parent);
    }

    // Find downstream children documents
    const children = all.filter((d) => d.sourceDocumentId === target.id);
    related.push(...children);

    return related;
  }

  /**
   * Public Client Action: Accept a Proposal or Quote
   */
  async publicAcceptDocument(docId: string, clientInfo?: { name: string; email?: string }): Promise<BusinessDocument> {
    const doc = await this.getPublicDocumentById(docId);
    if (!doc || !doc.id) throw new Error('Document not found');
    if (doc.status === 'accepted') return doc;

    const updatedDoc: BusinessDocument = {
      ...doc,
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      client: {
        ...doc.client,
        name: clientInfo?.name || doc.client.name,
        email: clientInfo?.email || doc.client.email,
      },
    };

    // Save update
    try {
      await supabase
        .from('documents')
        .update({
          status: 'accepted',
          client_snapshot: updatedDoc.client as any,
        })
        .eq('id', doc.id);
    } catch {
      // ignore public RLS if fallback
    }

    localStorage.setItem(`bizpilotly_public_doc_${doc.id}`, JSON.stringify(updatedDoc));

    // Send transactional email to business owner
    try {
      await emailService.sendTransactionalEmail({
        templateType: doc.type === 'proposal' ? 'proposal_accepted' : 'quote_accepted',
        recipientEmail: doc.business.email || 'billing@bizpilotly.com',
        recipientName: doc.business.name || 'Business Owner',
        documentId: doc.id,
        customSubject: `[Accepted] ${doc.type.toUpperCase()} #${doc.documentNumber} was accepted by ${clientInfo?.name || doc.client.name}`,
        customMessage: `Great news! Client ${clientInfo?.name || doc.client.name} has officially accepted ${doc.type.toUpperCase()} #${doc.documentNumber}. You can now generate an invoice with 1-click in your BizPilotly dashboard.`,
      });
    } catch (err) {
      console.warn('Owner notification email fallback:', err);
    }

    return updatedDoc;
  }

  /**
   * Public Client Action: Reject a Proposal or Quote
   */
  async publicRejectDocument(docId: string, reason: string, clientInfo?: { name: string; email?: string }): Promise<BusinessDocument> {
    const doc = await this.getPublicDocumentById(docId);
    if (!doc || !doc.id) throw new Error('Document not found');

    const updatedDoc: BusinessDocument = {
      ...doc,
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
    };

    try {
      await supabase
        .from('documents')
        .update({
          status: 'rejected',
        })
        .eq('id', doc.id);
    } catch {
      // ignore
    }

    localStorage.setItem(`bizpilotly_public_doc_${doc.id}`, JSON.stringify(updatedDoc));

    // Notify business owner
    try {
      await emailService.sendTransactionalEmail({
        templateType: doc.type === 'proposal' ? 'proposal_rejected' : 'quote_rejected',
        recipientEmail: doc.business.email || 'billing@bizpilotly.com',
        recipientName: doc.business.name || 'Business Owner',
        documentId: doc.id,
        customSubject: `[Feedback] ${doc.type.toUpperCase()} #${doc.documentNumber} feedback from ${clientInfo?.name || doc.client.name}`,
        customMessage: `Client ${clientInfo?.name || doc.client.name} declined ${doc.type.toUpperCase()} #${doc.documentNumber}.\nReason: "${reason}"`,
      });
    } catch (err) {
      console.warn('Owner notification fallback:', err);
    }

    return updatedDoc;
  }

  /**
   * Public Client Action: Sign a Contract
   */
  async publicSignContract(
    contractId: string,
    signerName: string,
    signerEmail: string,
    signatureDataUrl: string
  ): Promise<BusinessDocument> {
    const doc = await this.getPublicDocumentById(contractId);
    if (!doc || !doc.id) throw new Error('Contract not found');
    if (doc.status === 'signed') return doc;

    const signedAt = new Date().toISOString();
    const updatedDoc: BusinessDocument = {
      ...doc,
      status: 'signed',
      signedAt,
      // Preserve provider signature if exists, otherwise assign if none
      signature: doc.signature || {
        image: signatureDataUrl,
        signerName: doc.business.name,
        signedAt,
      },
      clientSignature: {
        image: signatureDataUrl,
        signerName,
        signedAt,
      },
      signerInfo: {
        name: signerName,
        email: signerEmail || doc.client.email,
        signedAt,
        signatureDataUrl,
      },
    };

    try {
      await supabase
        .from('documents')
        .update({
          status: 'signed',
        })
        .eq('id', doc.id);
    } catch {
      // ignore
    }

    localStorage.setItem(`bizpilotly_public_doc_${doc.id}`, JSON.stringify(updatedDoc));

    // Notify business owner
    try {
      await emailService.sendTransactionalEmail({
        templateType: 'contract_signed',
        recipientEmail: doc.business.email || 'billing@bizpilotly.com',
        recipientName: doc.business.name || 'Business Owner',
        documentId: doc.id,
        customSubject: `[Signed] Contract #${doc.documentNumber} signed by ${signerName}`,
        customMessage: `Contract #${doc.documentNumber} has been officially signed by ${signerName} on ${new Date().toLocaleDateString()}.`,
      });
    } catch (err) {
      console.warn('Owner notification fallback:', err);
    }

    return updatedDoc;
  }

  /**
   * Public Client Action: Decline a Contract
   */
  async publicDeclineContract(contractId: string, reason: string, clientInfo?: { name: string }): Promise<BusinessDocument> {
    const doc = await this.getPublicDocumentById(contractId);
    if (!doc || !doc.id) throw new Error('Contract not found');

    const updatedDoc: BusinessDocument = {
      ...doc,
      status: 'declined',
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
    };

    try {
      await supabase
        .from('documents')
        .update({
          status: 'declined',
        })
        .eq('id', doc.id);
    } catch {
      // ignore
    }

    localStorage.setItem(`bizpilotly_public_doc_${doc.id}`, JSON.stringify(updatedDoc));

    try {
      await emailService.sendTransactionalEmail({
        templateType: 'contract_declined',
        recipientEmail: doc.business.email || 'billing@bizpilotly.com',
        recipientName: doc.business.name || 'Business Owner',
        documentId: doc.id,
        customSubject: `[Contract Declined] #${doc.documentNumber} declined by ${clientInfo?.name || doc.client.name}`,
        customMessage: `Client ${clientInfo?.name || doc.client.name} declined Contract #${doc.documentNumber}.\nReason: "${reason}"`,
      });
    } catch (err) {
      console.warn('Owner notification fallback:', err);
    }

    return updatedDoc;
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

    const paymentDetails = row.payment_details || {};
    const meta = paymentDetails._meta || {};

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
      sourceDocumentId: meta.sourceDocumentId || undefined,
      sourceDocumentNumber: meta.sourceDocumentNumber || undefined,
      sourceDocumentType: meta.sourceDocumentType || undefined,
      rejectionReason: meta.rejectionReason || undefined,
      acceptedAt: meta.acceptedAt || undefined,
      rejectedAt: meta.rejectedAt || undefined,
      signedAt: meta.signedAt || undefined,
      signerInfo: meta.signerInfo || undefined,
      contractTerms: meta.contractTerms || undefined,
      projectOverview: meta.projectOverview || undefined,
      scope: meta.scope || undefined,
      deliverables: meta.deliverables || undefined,
      timeline: meta.timeline || undefined,
      signature: meta.signature || undefined,
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
