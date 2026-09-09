import { supabase } from '../supabase';
import {
  CheckoutBreakdown,
  CheckoutSessionResult,
  CreateCheckoutSessionRequest,
  PaymentRoutingContext,
  PlatformFeeSettings,
  RoutingDecision,
} from './types';
import { DEFAULT_PLATFORM_FEE_SETTINGS, buildCheckoutBreakdown } from './feeEngine';
import { paymentRoutingEngine } from './routingEngine';

class PaymentEngineService {
  private cachedPlatformSettings: PlatformFeeSettings | null = null;
  private cacheTimestamp: number = 0;

  /**
   * Authoritatively fetches platform fee settings from Supabase with memory caching
   */
  async getPlatformSettings(): Promise<PlatformFeeSettings> {
    const now = Date.now();
    if (this.cachedPlatformSettings && now - this.cacheTimestamp < 60000) {
      return this.cachedPlatformSettings;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('platform_payment_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const row = data as any;
        const settings: PlatformFeeSettings = {
          flutterwaveEnabled: row.flutterwave_enabled ?? true,
          flutterwavePriority: row.flutterwave_priority ?? 1,
          squadEnabled: row.squad_enabled ?? true,
          squadPriority: row.squad_priority ?? 2,
          stripeEnabled: row.stripe_enabled ?? false,
          stripePriority: row.stripe_priority ?? 3,
          feePercentage: Number(row.fee_percentage) || 0.005,
          currencies: {
            NGN: {
              percentage: Number(row.fee_percentage) || 0.005,
              maxCap: Number(row.cap_ngn) || 10000,
              minFee: Number(row.min_ngn) || 0,
            },
            USD: {
              percentage: Number(row.fee_percentage) || 0.005,
              maxCap: Number(row.cap_usd) || 10,
              minFee: Number(row.min_usd) || 0,
            },
            GBP: {
              percentage: Number(row.fee_percentage) || 0.005,
              maxCap: Number(row.cap_gbp) || 10,
              minFee: Number(row.min_gbp) || 0,
            },
            EUR: {
              percentage: Number(row.fee_percentage) || 0.005,
              maxCap: Number(row.cap_eur) || 10,
              minFee: Number(row.min_eur) || 0,
            },
          },
          platformFeePayer: row.platform_fee_payer || 'customer',
          gatewayFeePayer: row.gateway_fee_payer || 'customer',
        };

        this.cachedPlatformSettings = settings;
        this.cacheTimestamp = now;
        return settings;
      }
    } catch (err) {
      console.warn('[PaymentEngineService] Using default fee settings:', err);
    }

    return DEFAULT_PLATFORM_FEE_SETTINGS;
  }

  /**
   * Runs the routing engine for a given invoice and business context
   */
  async routePayment(context: PaymentRoutingContext): Promise<RoutingDecision> {
    const settings = await this.getPlatformSettings();
    return paymentRoutingEngine.selectPaymentProvider(context, settings);
  }

  /**
   * Previews the transparent checkout breakdown for an invoice before checkout initialization
   */
  async getCheckoutBreakdown(
    invoiceAmount: number,
    currency: string,
    merchantCountry: string = 'NG',
    customerCountry: string = 'NG',
    businessPreference?: any
  ): Promise<{ decision: RoutingDecision; breakdown?: CheckoutBreakdown }> {
    const settings = await this.getPlatformSettings();
    const context: PaymentRoutingContext = {
      merchantCountry,
      customerCountry,
      currency,
      amount: invoiceAmount,
      businessPreference,
    };

    const decision = paymentRoutingEngine.selectPaymentProvider(context, settings);
    if (!decision.isAvailable || !decision.selectedProvider) {
      return { decision };
    }

    const isInternational = merchantCountry !== customerCountry;
    const breakdown = buildCheckoutBreakdown(
      invoiceAmount,
      currency,
      decision.selectedProvider,
      isInternational,
      settings
    );

    return { decision, breakdown };
  }

  /**
   * Initializes a secure checkout session by delegating to the routed provider
   */
  async initializeInvoicePayment(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResult> {
    const settings = await this.getPlatformSettings();
    const context: PaymentRoutingContext = {
      merchantCountry: request.merchantCountry || 'NG',
      customerCountry: request.customerCountry || 'NG',
      currency: request.currency,
      amount: request.amount,
    };

    const decision = paymentRoutingEngine.selectPaymentProvider(context, settings);
    if (!decision.isAvailable || !decision.selectedProvider) {
      throw new Error(decision.unavailabilityReason || 'Payment is unavailable for this invoice.');
    }

    const provider = paymentRoutingEngine.getProvider(decision.selectedProvider);
    if (!provider) {
      throw new Error(`Provider "${decision.selectedProvider}" is not registered.`);
    }

    // Retrieve business subaccount ID if configured
    let subaccountId: string | undefined;
    if (request.businessId) {
      try {
        const { data: bpc } = await (supabase as any)
          .from('business_payment_configs')
          .select('provider_subaccount_id')
          .eq('business_id', request.businessId)
          .eq('provider', decision.selectedProvider)
          .maybeSingle();

        if (bpc?.provider_subaccount_id) {
          subaccountId = bpc.provider_subaccount_id;
        }
      } catch {
        // Fallback to direct routing
      }
    }

    return provider.createCheckoutSession(request, subaccountId);
  }
}

export const paymentEngineService = new PaymentEngineService();
