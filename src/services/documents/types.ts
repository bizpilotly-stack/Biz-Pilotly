/**
 * Reusable Domain Types & Discriminated Interfaces for BizPilotly Document Engine
 */

export type DocumentType = 'invoice' | 'quote' | 'estimate' | 'proposal' | 'contract' | 'receipt';

export type DocumentStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'rejected'
  | 'signed'
  | 'declined'
  | 'paid' 
  | 'pending_confirmation' 
  | 'overdue' 
  | 'expired'
  | 'cancelled';

export interface BusinessEntity {
  name: string;
  tagline?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  taxNumber?: string;
  logo?: string;
}

export interface ClientEntity {
  id?: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface SignerInfo {
  name: string;
  email?: string;
  ipAddress?: string;
  timestamp: string;
  signatureDataUrl?: string;
}

export interface ContractTerms {
  parties?: string;
  effectiveDate?: string;
  obligations?: string;
  governingLaw?: string;
  terminationTerms?: string;
}

export interface PaymentDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingOrIban?: string;
  paypalOrStripeLink?: string;
  paymentMethod?: 'Bank Transfer' | 'Credit Card' | 'PayPal' | 'Cash' | 'Stripe' | 'Other';
  paymentReference?: string;
  paymentPreference?: 'both' | 'manual' | 'gateway';
  reportedSenderName?: string;
  reportedTransferNote?: string;
  reportedAt?: string;
}

export interface DocumentTotals {
  subtotal: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxAmount: number;
  total: number;
}

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  documentNumber: string;
  title: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  paymentMethod?: string;
  paymentReference?: string;
  projectOverview?: string;
  scope?: string;
  deliverables?: string;
  timeline?: string;
  status: DocumentStatus;
  business: BusinessEntity;
  client: ClientEntity;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  currency: string;
  currencySymbol: string;
  notes?: string;
  terms?: string;
  sourceDocumentId?: string;
  sourceDocumentNumber?: string;
  sourceDocumentType?: DocumentType;
  rejectionReason?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  signedAt?: string;
  signerInfo?: SignerInfo;
  contractTerms?: ContractTerms;
  paymentDetails?: PaymentDetails;
  signature?: {
    image: string;
    signerName: string;
    signedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}
