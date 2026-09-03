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
    badgeLabel: 'Formal Price Offer',
    shortDescription: 'Generate itemized formal price quotes with line items, validity period, discounts, and client acceptance workflow.',
    route: '/documents/quote',
    seoTitle: 'Free Online Quote Generator & Client Approval Hub | BizPilotly',
    seoDescription: 'Create formal project quotes with instant client Accept/Reject buttons and automatic 1-click invoice conversion.',
    relatedTypes: ['invoice', 'estimate', 'proposal', 'receipt'],
  },
  {
    type: 'estimate',
    title: 'Estimate',
    badgeLabel: 'Provisional Pricing',
    shortDescription: 'Draft provisional project estimates indicating approximate costs for initial client budgeting before final agreement.',
    route: '/documents/estimate',
    seoTitle: 'Free Online Project Estimate Generator | BizPilotly',
    seoDescription: 'Create clean provisional project estimates with approximate rates, item breakdowns, and 1-click conversion to invoices.',
    relatedTypes: ['quote', 'invoice', 'proposal'],
  },
  {
    type: 'proposal',
    title: 'Proposal',
    badgeLabel: 'Project Pitch & Scope',
    shortDescription: 'Structure comprehensive project proposals with narrative overviews, deliverables, milestone timelines, and terms.',
    route: '/documents/proposal',
    seoTitle: 'Free Business Project Proposal Generator | BizPilotly',
    seoDescription: 'Create clear, structured client proposals with scope, deliverable pricing, and client Accept/Reject actions.',
    relatedTypes: ['contract', 'quote', 'invoice'],
  },
  {
    type: 'contract',
    title: 'Contract',
    badgeLabel: 'Legal Service Agreement',
    shortDescription: 'Draft formal client service contracts with party definitions, obligations, terms, effective dates, and e-signatures.',
    route: '/documents/contract',
    seoTitle: 'Free Online Contract Maker & Client Signature Hub | BizPilotly',
    seoDescription: 'Create legal client contracts and service agreements with digital signature workflows and decline feedback.',
    relatedTypes: ['proposal', 'invoice', 'receipt'],
  },
  {
    type: 'receipt',
    title: 'Receipt',
    badgeLabel: 'Payment Acknowledgment',
    shortDescription: 'Issue official payment receipts confirming received client deposits, milestone settlements, or retainer fees.',
    route: '/documents/receipt',
    seoTitle: 'Free Payment Receipt Maker & PDF Generator | BizPilotly',
    seoDescription: 'Generate instant business payment receipts with settlement methods, transaction references, and printable layouts.',
    relatedTypes: ['invoice', 'quote', 'contract'],
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
