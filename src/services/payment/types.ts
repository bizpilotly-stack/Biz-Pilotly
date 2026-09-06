/**
 * BizPilotly Global Payment Engine — Types & Interfaces
 */

export type SupportedPaymentProvider = 'flutterwave' | 'squad' | 'stripe';

export type PaymentLifecycleStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'CHARGEBACK';

export type SettlementLifecycleStatus =
  | 'PENDING'
  | 'SETTLED'
  | 'FAILED'
  | 'REVERSED';

export type MerchantOnboardingStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFICATION_REQUIRED'
  | 'ACTIVE'
  | 'RESTRICTED'
  | 'SUSPENDED';

export type PreferredProviderSetting = 'auto' | 'flutterwave' | 'squad' | 'stripe';

export interface CurrencyFeeConfig {
  percentage: number; // e.g., 0.005 for 0.5%
  maxCap: number;     // e.g., 10000 for NGN, 10 for USD/GBP/EUR
  minFee: number;     // e.g., 0
}

export interface PlatformFeeSettings {
  flutterwaveEnabled: boolean;
  flutterwavePriority: number;
  squadEnabled: boolean;
  squadPriority: number;
  stripeEnabled: boolean;
  stripePriority: number;
  feePercentage: number;
  currencies: Record<string, CurrencyFeeConfig>;
  platformFeePayer: 'customer' | 'merchant';
  gatewayFeePayer: 'customer' | 'merchant';
}

export interface ProviderCapability {
  supportedMerchantCountries: string[]; // ISO 2-letter codes (e.g. ['NG', 'GH', 'KE', 'US', 'GB'])
  supportedCurrencies: string[];        // ['NGN', 'USD', 'GBP', 'EUR', 'KES', 'GHS', 'ZAR']
  supportedCustomerCountries: string[]; // ['*'] or specific
  supportsCustomerFeePassThrough: boolean;
  supportsSplitSettlement: boolean;
  supportsMultiCurrencySettlement: boolean;
  supportsRecurringBilling: boolean;
  maxTransactionLimit?: number;
  minTransactionLimit?: number;
}

export interface PaymentRoutingContext {
  merchantCountry: string;
  customerCountry: string;
  currency: string;
  amount: number;
  paymentMethod?: 'card' | 'bank_transfer' | 'ussd' | 'mobile_money' | 'all';
  businessPreference?: PreferredProviderSetting;
  merchantOnboardingStatus?: Record<SupportedPaymentProvider, MerchantOnboardingStatus>;
  merchantSubaccountIds?: Partial<Record<SupportedPaymentProvider, string>>;
}

export interface RoutingDecision {
  isAvailable: boolean;
  selectedProvider?: SupportedPaymentProvider;
  reason: string;
  unavailabilityReason?: string;
  evaluatedProviders: Array<{
    provider: SupportedPaymentProvider;
    isEligible: boolean;
    disqualificationReason?: string;
    priority: number;
  }>;
}

export interface BizPilotlyFeeBreakdown {
  invoiceAmount: number;
  currency: string;
  percentageRate: number;
  calculatedFee: number;
  cappedFee: number;
  effectivePlatformFee: number;
}

export interface CheckoutBreakdown {
  invoiceAmount: number;
  bizpilotlyServiceFee: number;
  paymentProcessingFee: number;
  customerTotalPayable: number;
  currency: string;
  currencySymbol: string;
  selectedProvider: SupportedPaymentProvider;
  providerPassThroughSupported: boolean;
}

export interface CreateCheckoutSessionRequest {
  invoiceId: string;
  invoiceNumber: string;
  businessId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerCountry?: string;
  merchantCountry?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: SupportedPaymentProvider;
  reference: string;
  breakdown: CheckoutBreakdown;
}
