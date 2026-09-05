import { BusinessDocument, DocumentType } from './types';
import { generateDocumentNumber, getDefaultDocumentTitle } from './numbering';
import { calculateDocumentTotals } from './calculations';

const DRAFT_PREFIX = 'bizpilotly_draft_';
const SCHEMA_VERSION = 'v1';

export function getDraftStorageKey(type: DocumentType): string {
  return `${DRAFT_PREFIX}${type}_${SCHEMA_VERSION}`;
}

function getCachedSettings(): any {
  try {
    const raw = localStorage.getItem('bizpilotly_business_settings_cache');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getDefaultDocument(type: DocumentType): BusinessDocument {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const docNumber = generateDocumentNumber(type);
  const title = getDefaultDocumentTitle(type);
  const cached = getCachedSettings();

  // Clean empty line items - no dummy values to confuse the business owner
  const defaultItems = [
    {
      id: 'item-1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    },
  ];

  const totals = calculateDocumentTotals(defaultItems, 0, 0);

  const businessEntity = {
    name: cached?.name || '',
    tagline: cached?.tagline || '',
    logo: cached?.logo || undefined,
    email: cached?.email || '',
    phone: cached?.phone || '',
    address: cached?.address || '',
    website: cached?.website || undefined,
    taxNumber: cached?.taxNumber || '',
  };

  const paymentDetails = {
    bankName: cached?.bankDetails?.bankName || '',
    accountName: cached?.bankDetails?.accountName || cached?.name || '',
    accountNumber: cached?.bankDetails?.accountNumber || '',
    routingOrIban: cached?.bankDetails?.routingCode || '',
    paymentPreference: cached?.paymentPreference || 'both',
  };

  const base: any = {
    id: `doc-${Date.now().toString(36)}`,
    type,
    documentNumber: docNumber,
    title,
    date: today,
    status: type === 'receipt' ? 'paid' : 'draft',
    business: businessEntity,
    client: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
    },
    items: defaultItems,
    ...totals,
    taxRate: cached?.defaultTaxRate ?? 0,
    discountRate: 0,
    currency: cached?.currency || 'USD',
    currencySymbol: cached?.currencySymbol || '$',
    primaryColor: cached?.primaryColor || '#0B1F3A',
    notes: cached?.defaultNotes || '',
    terms: cached?.defaultPaymentTerms || '',
    signature: cached?.signature,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (type === 'invoice') {
    base.dueDate = nextMonth;
    base.paymentDetails = paymentDetails;
  } else if (type === 'quote') {
    base.validUntil = nextMonth;
  } else if (type === 'estimate') {
    base.validUntil = nextMonth;
  } else if (type === 'proposal') {
    base.validUntil = nextMonth;
    base.projectOverview = '';
    base.scope = '';
    base.deliverables = '';
    base.timeline = '';
  } else if (type === 'contract') {
    base.contractTerms = {
      parties: businessEntity.name ? `This Agreement is entered into between ${businessEntity.name} and Client.` : '',
      effectiveDate: today,
      obligations: '',
      governingLaw: '',
      terminationTerms: '',
    };
  } else if (type === 'receipt') {
    base.paymentMethod = 'Bank Transfer';
    base.paymentReference = '';
  }

  return base;
}

/**
 * Load draft from localStorage or return default document template
 */
export function loadDocumentDraft(type: DocumentType): BusinessDocument {
  try {
    const raw = localStorage.getItem(getDraftStorageKey(type));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.type === type && Array.isArray(parsed.items)) {
        // Automatically update issue date to today if draft
        const today = new Date().toISOString().split('T')[0];
        parsed.date = today;

        // Overlay cached business settings if user has saved them
        const cached = getCachedSettings();
        if (cached) {
          parsed.business = {
            ...parsed.business,
            name: cached.name || parsed.business?.name || '',
            tagline: cached.tagline !== undefined ? cached.tagline : parsed.business?.tagline,
            logo: cached.logo !== undefined ? cached.logo : parsed.business?.logo,
            email: cached.email !== undefined ? cached.email : parsed.business?.email,
            phone: cached.phone !== undefined ? cached.phone : parsed.business?.phone,
            address: cached.address !== undefined ? cached.address : parsed.business?.address,
            website: cached.website !== undefined ? cached.website : parsed.business?.website,
            taxNumber: cached.taxNumber !== undefined ? cached.taxNumber : parsed.business?.taxNumber,
          };
          if (cached.primaryColor) parsed.primaryColor = cached.primaryColor;
          if (cached.currency) {
            parsed.currency = cached.currency;
            parsed.currencySymbol = cached.currencySymbol || '$';
          }
          if (cached.bankDetails?.bankName) {
            parsed.paymentDetails = {
              ...(parsed.paymentDetails || {}),
              bankName: cached.bankDetails.bankName,
              accountName: cached.bankDetails.accountName || cached.name,
              accountNumber: cached.bankDetails.accountNumber,
              routingOrIban: cached.bankDetails.routingCode,
            };
          }
          if (cached.signature && !parsed.signature) {
            parsed.signature = cached.signature;
          }
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[BizPilotly] Failed to load draft for ${type}:`, err);
  }
  return getDefaultDocument(type);
}

/**
 * Save draft to localStorage (safe with error boundary)
 */
export function saveDocumentDraft(type: DocumentType, doc: BusinessDocument): boolean {
  try {
    localStorage.setItem(getDraftStorageKey(type), JSON.stringify(doc));
    return true;
  } catch (err) {
    console.warn(`[BizPilotly] Local draft storage failed (quota or disabled):`, err);
    return false;
  }
}

/**
 * Clears draft from localStorage and returns fresh default document
 */
export function clearDocumentDraft(type: DocumentType): BusinessDocument {
  try {
    localStorage.removeItem(getDraftStorageKey(type));
  } catch {
    // ignore
  }
  return getDefaultDocument(type);
}
