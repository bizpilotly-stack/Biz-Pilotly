import { BusinessSettings } from '../types';

export const INITIAL_SETTINGS: BusinessSettings = {
  name: 'Studio North Creative LLC',
  tagline: 'Digital Product Design & Technology Consulting',
  logo: '',
  email: 'hello@studionorth.co',
  phone: '+1 (555) 300-4500',
  address: '450 Mission St, Suite 300, San Francisco, CA 94105',
  website: 'https://studionorth.co',
  taxNumber: 'US-EIN-94-3829104',
  currency: 'NGN',
  currencySymbol: '₦',
  defaultTaxRate: 0,
  invoicePrefix: 'INV',
  quotePrefix: 'QTE',
  receiptPrefix: 'REC',
  proposalPrefix: 'PROP',
  defaultPaymentTerms: 'Payment due within 15 calendar days of issuance.',
  defaultNotes: 'Thank you for your business. Please reach out if you have any questions.',
  bankDetails: {
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountName: 'Studio North Creative Ltd',
    accountNumber: '0123456789',
    routingCode: '',
  }
};
