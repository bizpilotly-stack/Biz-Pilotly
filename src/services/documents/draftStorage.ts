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

  const defaultItems = [
    {
      id: 'item-1',
      description: type === 'receipt' ? 'Full Project Milestone Settlement' : 'Brand Identity & Web Interface Deliverables',
      quantity: 1,
      unitPrice: 2850,
      amount: 2850,
    },
    {
      id: 'item-2',
      description: type === 'receipt' ? 'Production Asset Transfer Fee' : 'Design System Guidelines & Exported Assets',
      quantity: 1,
      unitPrice: 650,
      amount: 650,
    },
  ];

  const totals = calculateDocumentTotals(defaultItems, 0, 0);

  const businessEntity = {
    name: cached?.name || 'Apex Studio Design Co.',
    tagline: cached?.tagline || 'Digital Product Strategy & Interface Engineering',
    logo: cached?.logo || undefined,
    email: cached?.email || 'hello@apexstudio.io',
    phone: cached?.phone || '+1 (555) 349-2810',
    address: cached?.address || '742 Evergreen Terrace, Suite 400, Austin, TX 78701',
    website: cached?.website || undefined,
    taxNumber: cached?.taxNumber || 'US-TX-9842104',
  };

  const paymentDetails = cached?.bankDetails?.bankName
    ? {
        bankName: cached.bankDetails.bankName,
        accountName: cached.bankDetails.accountName || cached.name || '',
        accountNumber: cached.bankDetails.accountNumber || '',
        routingOrIban: cached.bankDetails.routingCode || '',
      }
    : {
        bankName: 'Silicon Valley Commercial Bank',
        accountName: cached?.name || 'Apex Studio Design Co.',
        accountNumber: '•••• 8921',
        routingOrIban: '021000021 / US34 SVBK 0000 8921',
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
      name: 'Sarah Jenkins',
      company: 'Horizon Health Dynamics',
      email: 's.jenkins@horizonhealth.co',
      phone: '+1 (555) 892-1402',
      address: '1200 Innovation Parkway, Boston, MA 02110',
    },
    items: defaultItems,
    ...totals,
    taxRate: cached?.defaultTaxRate ?? 0,
    discountRate: 0,
    currency: cached?.currency || 'USD',
    currencySymbol: cached?.currencySymbol || '$',
    primaryColor: cached?.primaryColor || '#0B1F3A',
    notes: cached?.defaultNotes || 'Thank you for your business. Please reach out if you have any questions regarding these deliverable line items.',
    terms: cached?.defaultPaymentTerms || 'Payment is due within 30 days of invoice date. Late remittances subject to a 1.5% monthly finance charge.',
    signature: cached?.signature,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (type === 'invoice') {
    base.dueDate = nextMonth;
    base.paymentDetails = paymentDetails;
  } else if (type === 'quote') {
    base.validUntil = nextMonth;
    base.terms = 'This quote is valid for 30 calendar days from issue date. Pricing becomes fixed upon client acceptance.';
  } else if (type === 'estimate') {
    base.validUntil = nextMonth;
    base.notes = 'PROVISIONAL ESTIMATE: Quantities and costs are approximate based on initial scope and may adjust with final project specifications.';
    base.terms = 'Estimated fees are valid for 30 days. Formal confirmation and deposit required prior to production commencement.';
  } else if (type === 'proposal') {
    base.validUntil = nextMonth;
    base.projectOverview = 'Comprehensive brand strategy, user experience overhaul, and responsive design systems delivery tailored for enterprise rollout.';
    base.scope = 'Phase 1: Discovery & Architecture. Phase 2: Design Systems & Component UI. Phase 3: Interactive Prototypes & Asset Handoff.';
    base.deliverables = '1. Complete Figma UI Kit & Design Tokens\n2. Responsive Web Component Blueprints\n3. High-Fidelity Clickable Prototype\n4. Brand Style Guidelines Guidebook';
    base.timeline = 'Weeks 1-2: Discovery & Strategy\nWeeks 3-5: Interface Design & Reviews\nWeeks 6-7: Refinements & Asset Delivery';
  } else if (type === 'contract') {
    base.contractTerms = {
      parties: `This Agreement is entered into between ${businessEntity.name} ("Provider") and Horizon Health Dynamics ("Client").`,
      effectiveDate: today,
      obligations: 'Provider agrees to deliver specified design services with reasonable professional care. Client agrees to provide timely feedback and settle agreed invoices according to milestone terms.',
      governingLaw: 'State of Texas / United States',
      terminationTerms: 'Either party may terminate this agreement with 14 calendar days written notice.',
    };
    base.terms = 'Confidentiality, intellectual property assignment upon full payment, and mutual indemnification apply as defined in formal agreement terms.';
  } else if (type === 'receipt') {
    base.paymentMethod = 'Bank Transfer';
    base.paymentReference = `TXN-${Date.now().toString(36).toUpperCase()}`;
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
            name: cached.name || parsed.business?.name || 'My Business Studio',
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
