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

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

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

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  documentNumber: string;
  title: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
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
  projectOverview?: string;
  scope?: string;
  deliverables?: string;
  timeline?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDetails?: {
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
  };
  signature?: {
    image: string;
    signerName: string;
    signedAt: string;
  };
  clientSignature?: {
    image: string;
    signerName: string;
    signerTitle?: string;
    signedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  currency: string;
  totalBilled: number;
  amountPaid: number;
  balance: number;
  status: 'active' | 'inactive' | 'lead';
  notes?: string;
  createdAt: string;
  recentDocuments?: {
    id: string;
    number: string;
    type: DocumentType;
    amount: number;
    date: string;
    status: DocumentStatus;
  }[];
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  currencySymbol: string;
  method: 'Bank Transfer' | 'Credit Card' | 'PayPal' | 'Cash' | 'Stripe' | 'Other';
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  reference?: string;
  notes?: string;
}

export type ExpenseCategory = 
  | 'Software'
  | 'Marketing'
  | 'Transport'
  | 'Equipment'
  | 'Contractors'
  | 'Utilities'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  currencySymbol: string;
  date: string;
  vendor: string;
  paymentMethod: string;
  status: 'cleared' | 'pending' | 'reimbursed';
  receiptAttached?: boolean;
  notes?: string;
}

export interface MonthlyFinancialSummary {
  month: string;
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export interface ProfitMetrics {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  monthlyBreakdown: MonthlyFinancialSummary[];
}

export interface DashboardStats {
  revenue: number;
  outstandingInvoices: number;
  expenses: number;
  profit: number;
  revenueChangePct: number;
  outstandingCount: number;
  expenseChangePct: number;
  profitMarginPct: number;
}

export interface LifecycleFunnelStats {
  proposals: {
    total: number;
    sent: number;
    accepted: number;
    rejected: number;
    winRatePct: number;
    closedValue: number;
    pendingValue: number;
  };
  quotes: {
    total: number;
    sent: number;
    accepted: number;
    rejected: number;
    winRatePct: number;
    closedValue: number;
    pendingValue: number;
  };
  contracts: {
    total: number;
    sent: number;
    signed: number;
    pendingSignature: number;
    executionRatePct: number;
  };
  invoices: {
    totalCount: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    settlementRatePct: number;
  };
  retainers: {
    activeCount: number;
    mrr: number;
    upcomingRunsCount: number;
  };
  tasks: {
    completedUnbilledCount: number;
    unbilledHours: number;
    unbilledAmount: number;
  };
  attentionItems: {
    id: string;
    type: 'overdue_invoice' | 'unbilled_tasks' | 'pending_proposal' | 'unsigned_contract' | 'upcoming_retainer';
    title: string;
    subtitle: string;
    amount?: number;
    actionLabel: string;
    actionLink: string;
    badgeColor: 'red' | 'yellow' | 'blue' | 'purple' | 'green';
  }[];
}

export interface ActivityItem {
  id: string;
  type: 'invoice_created' | 'invoice_paid' | 'quote_sent' | 'client_added' | 'expense_logged';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  currencySymbol?: string;
  link?: string;
}

export interface BusinessSettings {
  name: string;
  tagline: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxNumber: string;
  currency: string;
  currencySymbol: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  quotePrefix: string;
  receiptPrefix: string;
  proposalPrefix: string;
  estimatePrefix?: string;
  contractPrefix?: string;
  defaultPaymentTerms: string;
  defaultNotes: string;
  primaryColor?: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingCode: string;
  };
  signature?: {
    image: string;
    signerName: string;
    signedAt: string;
  };
  brands?: {
    id: string;
    name: string;
    email: string;
    currency: string;
    logo?: string;
    isDefault?: boolean;
  }[];
}

export interface CalculatorMeta {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: 'pricing' | 'growth' | 'finance' | 'sales';
  iconName: string;
  formula: string;
  formulaDescription: string;
  exampleScenario: string;
  exampleCalculation: string;
  relatedCalculators: { title: string; slug: string }[];
  targetDocumentCTA: {
    text: string;
    buttonLabel: string;
    link: string;
  };
}

export * from './database.types';
