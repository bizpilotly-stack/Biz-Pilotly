import {
  SupportedPaymentProvider,
  ProviderCapability,
  PaymentRoutingContext,
  CreateCheckoutSessionRequest,
  CheckoutSessionResult,
} from '../types';

export abstract class PaymentProvider {
  abstract readonly providerName: SupportedPaymentProvider;
  abstract readonly displayName: string;
  abstract readonly priority: number;

  abstract getCapabilities(): ProviderCapability;

  /**
   * Evaluates whether this provider is capable of processing this specific transaction scenario.
   */
  canProcess(context: PaymentRoutingContext): { isEligible: boolean; reason?: string } {
    const caps = this.getCapabilities();
    const merchantCountry = (context.merchantCountry || 'NG').toUpperCase();
    const currency = (context.currency || 'USD').toUpperCase();
    const amount = Number(context.amount) || 0;

    // 1. Merchant Country Support
    if (!caps.supportedMerchantCountries.includes('*') && !caps.supportedMerchantCountries.includes(merchantCountry)) {
      return {
        isEligible: false,
        reason: `${this.displayName} does not support merchants based in country: ${merchantCountry}`,
      };
    }

    // 2. Currency Support
    if (!caps.supportedCurrencies.includes(currency)) {
      return {
        isEligible: false,
        reason: `${this.displayName} does not support processing currency: ${currency}`,
      };
    }

    // 3. Amount Limits
    if (caps.minTransactionLimit && amount < caps.minTransactionLimit) {
      return {
        isEligible: false,
        reason: `Amount (${amount} ${currency}) is below ${this.displayName} minimum transaction limit of ${caps.minTransactionLimit}`,
      };
    }

    if (caps.maxTransactionLimit && amount > caps.maxTransactionLimit) {
      return {
        isEligible: false,
        reason: `Amount (${amount} ${currency}) exceeds ${this.displayName} maximum transaction limit of ${caps.maxTransactionLimit}`,
      };
    }

    // 4. Merchant Onboarding Verification (if status provided)
    if (context.merchantOnboardingStatus) {
      const status = context.merchantOnboardingStatus[this.providerName];
      if (status && status !== 'ACTIVE' && status !== 'PENDING') {
        return {
          isEligible: false,
          reason: `Merchant onboarding for ${this.displayName} is in status: ${status}`,
        };
      }
    }

    return { isEligible: true };
  }

  /**
   * Initializes a payment checkout session.
   * In client-side execution: delegates to secure Supabase Edge Function to protect API secrets.
   */
  abstract createCheckoutSession(
    request: CreateCheckoutSessionRequest,
    subaccountId?: string
  ): Promise<CheckoutSessionResult>;

  /**
   * Verifies a transaction status from provider reference or transaction ID.
   */
  abstract verifyTransaction(
    reference: string
  ): Promise<{ isSuccessful: boolean; amount: number; currency: string; fee?: number; rawData?: any }>;
}
