import { PaymentProvider } from './PaymentProvider';
import {
  ProviderCapability,
  CreateCheckoutSessionRequest,
  CheckoutSessionResult,
} from '../types';
import { buildCheckoutBreakdown } from '../feeEngine';
import { supabase } from '../../supabase';

export class SquadProvider extends PaymentProvider {
  readonly providerName = 'squad' as const;
  readonly displayName = 'Squad';
  readonly priority = 2;

  getCapabilities(): ProviderCapability {
    return {
      supportedMerchantCountries: ['NG'],
      supportedCurrencies: ['NGN', 'USD', 'GBP', 'KES'],
      supportedCustomerCountries: ['*'], // Global cards accepted
      supportsCustomerFeePassThrough: true,
      supportsSplitSettlement: true,
      supportsMultiCurrencySettlement: true,
      supportsRecurringBilling: true,
      minTransactionLimit: 100, // ₦100 min
      maxTransactionLimit: 50000000,
    };
  }

  async createCheckoutSession(
    request: CreateCheckoutSessionRequest,
    subaccountId?: string
  ): Promise<CheckoutSessionResult> {
    const isInternational = (request.customerCountry || 'NG') !== (request.merchantCountry || 'NG');
    const breakdown = buildCheckoutBreakdown(
      request.amount,
      request.currency,
      this.providerName,
      isInternational
    );

    // Call secure Supabase Edge Function to initialize the Squad session
    try {
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          provider: 'squad',
          invoiceId: request.invoiceId,
          invoiceNumber: request.invoiceNumber,
          businessId: request.businessId,
          amount: request.amount,
          currency: request.currency,
          customerEmail: request.customerEmail,
          customerName: request.customerName,
          customerCountry: request.customerCountry,
          merchantCountry: request.merchantCountry,
          subaccountId,
          successUrl: request.successUrl,
          cancelUrl: request.cancelUrl,
          metadata: request.metadata,
        },
      });

      if (!error && data?.checkoutUrl) {
        return {
          sessionId: data.sessionId || `sqd_${request.invoiceId}_${Date.now()}`,
          checkoutUrl: data.checkoutUrl,
          provider: 'squad',
          reference: data.reference || `SQD-${request.invoiceNumber}-${Date.now()}`,
          breakdown,
        };
      }
    } catch (err) {
      console.warn('[SquadProvider] Edge function invocation fallback:', err);
    }

    const txRef = `SQD-${request.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
    return {
      sessionId: `sqd_session_${Date.now()}`,
      checkoutUrl: `https://checkout.squadco.com/pay/${txRef}`,
      provider: 'squad',
      reference: txRef,
      breakdown,
    };
  }

  async verifyTransaction(
    reference: string
  ): Promise<{ isSuccessful: boolean; amount: number; currency: string; fee?: number; rawData?: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          action: 'verify',
          provider: 'squad',
          reference,
        },
      });

      if (!error && data) {
        return {
          isSuccessful: data.status === 'success' || data.isSuccessful,
          amount: Number(data.amount) || 0,
          currency: data.currency || 'NGN',
          fee: Number(data.fee) || 0,
          rawData: data,
        };
      }
    } catch (err) {
      console.warn('[SquadProvider] Verification error:', err);
    }

    return { isSuccessful: false, amount: 0, currency: 'NGN' };
  }
}
