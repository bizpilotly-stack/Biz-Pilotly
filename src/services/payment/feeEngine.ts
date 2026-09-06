import {
  PlatformFeeSettings,
  BizPilotlyFeeBreakdown,
  CheckoutBreakdown,
  SupportedPaymentProvider,
} from './types';

/**
 * Authoritative default platform fee settings
 * 0.5% across all currencies with strict caps
 */
export const DEFAULT_PLATFORM_FEE_SETTINGS: PlatformFeeSettings = {
  flutterwaveEnabled: true,
  flutterwavePriority: 1,
  squadEnabled: true,
  squadPriority: 2,
  stripeEnabled: false,
  stripePriority: 3,
  feePercentage: 0.005, // 0.5%
  currencies: {
    NGN: {
      percentage: 0.005,
      maxCap: 10000.0, // ₦10,000 cap
      minFee: 0.0,
    },
    USD: {
      percentage: 0.005,
      maxCap: 10.0, // $10 cap
      minFee: 0.0,
    },
    GBP: {
      percentage: 0.005,
      maxCap: 10.0, // £10 cap
      minFee: 0.0,
    },
    EUR: {
      percentage: 0.005,
      maxCap: 10.0, // €10 cap
      minFee: 0.0,
    },
  },
  platformFeePayer: 'customer',
  gatewayFeePayer: 'customer',
};

/**
 * Calculates the exact BizPilotly Platform Service Fee.
 * Follows:
 *   percentage_fee = invoice_amount * fee_percentage (0.005)
 *   platform_fee = min(percentage_fee, currency_maximum)
 *   if min_fee: platform_fee = max(currency_minimum, platform_fee)
 */
export function calculateBizPilotlyServiceFee(
  invoiceAmount: number,
  currency: string = 'USD',
  settings: PlatformFeeSettings = DEFAULT_PLATFORM_FEE_SETTINGS
): BizPilotlyFeeBreakdown {
  const cleanAmount = Math.max(0, Number(invoiceAmount) || 0);
  const upperCurrency = (currency || 'USD').toUpperCase();
  const config = settings.currencies[upperCurrency] || {
    percentage: settings.feePercentage || 0.005,
    maxCap: 10.0,
    minFee: 0.0,
  };

  const percentageRate = config.percentage ?? 0.005;
  const rawCalculatedFee = cleanAmount * percentageRate;

  // Apply maximum cap
  const maxCap = config.maxCap ?? Infinity;
  let cappedFee = Math.min(rawCalculatedFee, maxCap);

  // Apply minimum fee if configured
  const minFee = config.minFee ?? 0;
  if (minFee > 0 && cleanAmount > 0) {
    cappedFee = Math.max(minFee, cappedFee);
  }

  // Precise financial rounding (2 decimal places)
  const effectivePlatformFee = Math.round((cappedFee + Number.EPSILON) * 100) / 100;
  const roundedCalculated = Math.round((rawCalculatedFee + Number.EPSILON) * 100) / 100;

  return {
    invoiceAmount: cleanAmount,
    currency: upperCurrency,
    percentageRate,
    calculatedFee: roundedCalculated,
    cappedFee,
    effectivePlatformFee,
  };
}

/**
 * Computes estimated provider processing fee for checkout preview.
 * (Note: Production execution uses the provider's official customer-fee pass-through API).
 */
export function estimateProviderProcessingFee(
  amount: number,
  currency: string,
  provider: SupportedPaymentProvider,
  isInternational: boolean = false
): number {
  const cleanAmount = Math.max(0, Number(amount) || 0);
  const upperCurrency = (currency || 'USD').toUpperCase();

  if (provider === 'flutterwave') {
    if (upperCurrency === 'NGN' && !isInternational) {
      // Flutterwave local NGN: 1.4%, capped at ₦2,000
      const fee = Math.min(cleanAmount * 0.014, 2000);
      return Math.round((fee + Number.EPSILON) * 100) / 100;
    }
    // Flutterwave international / FX: 3.8%
    const fee = cleanAmount * 0.038;
    return Math.round((fee + Number.EPSILON) * 100) / 100;
  }

  if (provider === 'squad') {
    if (upperCurrency === 'NGN' && !isInternational) {
      // Squad local NGN: 1.0%, capped at ₦1,000
      const fee = Math.min(cleanAmount * 0.01, 1000);
      return Math.round((fee + Number.EPSILON) * 100) / 100;
    }
    // Squad international: 3.5%
    const fee = cleanAmount * 0.035;
    return Math.round((fee + Number.EPSILON) * 100) / 100;
  }

  return 0;
}

/**
 * Builds the complete transparent checkout breakdown for the customer.
 */
export function buildCheckoutBreakdown(
  invoiceAmount: number,
  currency: string,
  provider: SupportedPaymentProvider,
  isInternational: boolean = false,
  settings: PlatformFeeSettings = DEFAULT_PLATFORM_FEE_SETTINGS
): CheckoutBreakdown {
  const cleanAmount = Math.max(0, Number(invoiceAmount) || 0);
  const upperCurrency = (currency || 'USD').toUpperCase();
  const symbol =
    upperCurrency === 'NGN' ? '₦' : upperCurrency === 'GBP' ? '£' : upperCurrency === 'EUR' ? '€' : '$';

  const platformFeeRes = calculateBizPilotlyServiceFee(cleanAmount, upperCurrency, settings);
  const providerFee = estimateProviderProcessingFee(cleanAmount, upperCurrency, provider, isInternational);

  const customerTotalPayable =
    Math.round((cleanAmount + platformFeeRes.effectivePlatformFee + providerFee + Number.EPSILON) * 100) / 100;

  return {
    invoiceAmount: cleanAmount,
    bizpilotlyServiceFee: platformFeeRes.effectivePlatformFee,
    paymentProcessingFee: providerFee,
    customerTotalPayable,
    currency: upperCurrency,
    currencySymbol: symbol,
    selectedProvider: provider,
    providerPassThroughSupported: true,
  };
}
