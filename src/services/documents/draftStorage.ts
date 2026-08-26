import { BusinessDocument, DocumentType } from './types';
import { generateDocumentNumber, getDefaultDocumentTitle } from './numbering';
import { calculateDocumentTotals } from './calculations';

const DRAFT_PREFIX = 'bizpilotly_draft_';
const SCHEMA_VERSION = 'v1';

export function getDraftStorageKey(type: DocumentType): string {
  return `${DRAFT_PREFIX}${type}_${SCHEMA_VERSION}`;
}

export function getDefaultDocument(type: DocumentType): BusinessDocument {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const docNumber = generateDocumentNumber(type);
  const title = getDefaultDocumentTitle(type);

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

  const base: any = {
    id: `doc-${Date.now().toString(36)}`,
    type,
    documentNumber: docNumber,
    title,
    date: today,
    status: type === 'receipt' ? 'paid' : 'draft',
    business: {
      name: 'Apex Studio Design Co.',
      tagline: 'Digital Product Strategy & Interface Engineering',
      email: 'hello@apexstudio.io',
      phone: '+1 (555) 349-2810',
      address: '742 Evergreen Terrace, Suite 400, Austin, TX 78701',
      taxNumber: 'US-TX-9842104',
    },
    client: {
      name: 'Sarah Jenkins',
      company: 'Horizon Health Dynamics',
      email: 's.jenkins@horizonhealth.co',
      phone: '+1 (555) 892-1402',
      address: '1200 Innovation Parkway, Boston, MA 02110',
    },
    items: defaultItems,
    ...totals,
    taxRate: 0,
    discountRate: 0,
    currency: 'USD',
    currencySymbol: '$',
    notes: 'Thank you for your business. Please reach out if you have any questions regarding these deliverable line items.',
    terms: 'Payment is due within 30 days of invoice date. Late remittances subject to a 1.5% monthly finance charge.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (type === 'invoice') {
    base.dueDate = nextMonth;
    base.paymentDetails = {
      bankName: 'Silicon Valley Commercial Bank',
      accountName: 'Apex Studio Design Co.',
      accountNumber: '•••• 8921',
      routingOrIban: '021000021 / US34 SVBK 0000 8921',
    };
  } else if (type === 'quote' || type === 'proposal') {
    base.validUntil = nextMonth;
    if (type === 'proposal') {
      base.projectOverview = 'Comprehensive brand strategy, user experience overhaul, and responsive design systems delivery tailored for enterprise rollout.';
    }
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
