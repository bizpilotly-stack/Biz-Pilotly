import { DocumentType } from './types';

export interface DocumentGeneratorMeta {
  type: DocumentType;
  title: string;
  badgeLabel: string;
  shortDescription: string;
  route: string;
  seoTitle: string;
  seoDescription: string;
  relatedTypes: DocumentType[];
}

export const DOCUMENT_REGISTRY: DocumentGeneratorMeta[] = [
  {
    type: 'invoice',
    title: 'Invoice',
    badgeLabel: 'Billing Statement',
    shortDescription: 'Create clean, professional, print-ready invoices for clients with instant tax, discount, and total calculations.',
    route: '/documents/invoice',
    seoTitle: 'Free Online Invoice Generator & PDF Creator | BizPilotly',
    seoDescription: 'Generate professional freelance and business invoices in seconds. No account required. Calculate taxes, discounts, and print or save as PDF.',
    relatedTypes: ['quote', 'receipt', 'proposal'],
  },
  {
    type: 'quote',
    title: 'Quote',
    badgeLabel: 'Price Estimate',
    shortDescription: 'Generate itemized project quotes and pricing estimates for client approval before commencing work.',
    route: '/documents/quote',
    seoTitle: 'Free Online Quote & Estimate Generator | BizPilotly',
    seoDescription: 'Create formal project cost estimates and quotes for client sign-off. Free, instant, and printable with zero login required.',
    relatedTypes: ['invoice', 'proposal', 'receipt'],
  },
  {
    type: 'receipt',
    title: 'Receipt',
    badgeLabel: 'Payment Acknowledgment',
    shortDescription: 'Issue official payment receipts confirming received client deposits, milestone payments, or retainer fees.',
    route: '/documents/receipt',
    seoTitle: 'Free Payment Receipt Maker & PDF Generator | BizPilotly',
    seoDescription: 'Generate instant business payment receipts with settlement methods, transaction references, and printable layouts.',
    relatedTypes: ['invoice', 'quote', 'proposal'],
  },
  {
    type: 'proposal',
    title: 'Proposal',
    badgeLabel: 'Project Pitch',
    shortDescription: 'Structure detailed project proposals with scope descriptions, deliverable milestones, and terms for prospective clients.',
    route: '/documents/proposal',
    seoTitle: 'Free Business Project Proposal Generator | BizPilotly',
    seoDescription: 'Create clear, structured client proposals with project narrative, deliverables pricing, and payment terms.',
    relatedTypes: ['quote', 'invoice', 'receipt'],
  },
];

export function getDocumentMeta(type: DocumentType): DocumentGeneratorMeta {
  return DOCUMENT_REGISTRY.find((d) => d.type === type) || DOCUMENT_REGISTRY[0];
}

export function generateDocumentJsonLd(meta: DocumentGeneratorMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': `BizPilotly ${meta.title} Generator`,
    'url': `https://bizpilotly.com${meta.route}`,
    'description': meta.seoDescription,
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
  };
}
