/**
 * Provider-Agnostic Payment Gateway Architecture for BizPilotly
 */

export interface CheckoutSessionOptions {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: 'paystack' | 'stripe' | 'manual';
  reference: string;
}

export interface PaymentGatewayDriver {
  providerName: 'paystack' | 'stripe' | 'manual';
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult>;
  verifyTransaction(referenceOrSessionId: string): Promise<{ isSuccessful: boolean; amount: number; currency: string }>;
}

/**
 * Stripe Payment Gateway Driver Implementation
 */
export class StripeGatewayDriver implements PaymentGatewayDriver {
  providerName = 'stripe' as const;

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    // In production: delegates to Supabase Edge Function to create Stripe Checkout Session
    return {
      sessionId: `cs_stripe_${options.invoiceId}_${Date.now()}`,
      checkoutUrl: `https://checkout.stripe.com/pay/${options.invoiceId}`,
      provider: 'stripe',
      reference: `str_${Date.now()}`,
    };
  }

  async verifyTransaction(_sessionId: string): Promise<{ isSuccessful: boolean; amount: number; currency: string }> {
    return { isSuccessful: true, amount: 0, currency: 'USD' };
  }
}

/**
 * Paystack Payment Gateway Driver Implementation
 */
export class PaystackGatewayDriver implements PaymentGatewayDriver {
  providerName = 'paystack' as const;

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    // In production: delegates to Supabase Edge Function to initialize Paystack Transaction
    return {
      sessionId: `pstk_${options.invoiceId}_${Date.now()}`,
      checkoutUrl: `https://checkout.paystack.com/${options.invoiceId}`,
      provider: 'paystack',
      reference: `pstk_ref_${Date.now()}`,
    };
  }

  async verifyTransaction(_reference: string): Promise<{ isSuccessful: boolean; amount: number; currency: string }> {
    return { isSuccessful: true, amount: 0, currency: 'NGN' };
  }
}

/**
 * Payment Gateway Manager / Registry
 */
class PaymentGatewayManager {
  private drivers: Map<string, PaymentGatewayDriver> = new Map();
  private defaultProvider: 'stripe' | 'paystack' | 'manual' = 'manual';

  constructor() {
    this.registerDriver(new StripeGatewayDriver());
    this.registerDriver(new PaystackGatewayDriver());
  }

  registerDriver(driver: PaymentGatewayDriver) {
    this.drivers.set(driver.providerName, driver);
  }

  getDriver(provider?: 'stripe' | 'paystack' | 'manual'): PaymentGatewayDriver {
    const name = provider || this.defaultProvider;
    const driver = this.drivers.get(name);
    if (!driver) {
      throw new Error(`Payment gateway driver "${name}" is not configured.`);
    }
    return driver;
  }

  setDefaultProvider(provider: 'stripe' | 'paystack' | 'manual') {
    this.defaultProvider = provider;
  }
}

export const paymentGateway = new PaymentGatewayManager();
