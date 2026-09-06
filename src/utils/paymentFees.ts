/**
 * Utility for calculating transparent payment processing and platform handling fees.
 * 
 * Rules:
 * - Local NGN: Flutterwave Gateway (1.4%, capped at ₦2,000) + BizPilotly Platform Fee (1.0%)
 * - International (USD, GBP, EUR, etc.): Flutterwave Gateway (3.8%) + BizPilotly Platform Fee (1.0%) = 4.8%
 */

export interface PaymentFeeCalculation {
  invoiceTotal: number;
  gatewayFee: number;
  platformFee: number;
  totalFee: number;
  totalPayable: number;
  currency: string;
}

export function calculateProcessingFee(invoiceTotal: number, currency: string = 'NGN'): PaymentFeeCalculation {
  const isNGN = currency.toUpperCase() === 'NGN' || currency === '₦';
  const total = Math.max(0, Number(invoiceTotal) || 0);

  let gatewayFee = 0;
  let platformFee = 0;

  if (isNGN) {
    // Flutterwave local NGN rate: 1.4% capped at ₦2,000
    gatewayFee = Math.min(total * 0.014, 2000);
    // BizPilotly Platform Handling fee: 1.0%
    platformFee = total * 0.01;
  } else {
    // International rate: 3.8% Flutterwave + 1.0% BizPilotly = 4.8%
    gatewayFee = total * 0.038;
    platformFee = total * 0.01;
  }

  // Round to 2 decimal places
  gatewayFee = Math.round((gatewayFee + Number.EPSILON) * 100) / 100;
  platformFee = Math.round((platformFee + Number.EPSILON) * 100) / 100;
  const totalFee = Math.round((gatewayFee + platformFee + Number.EPSILON) * 100) / 100;
  const totalPayable = Math.round((total + totalFee + Number.EPSILON) * 100) / 100;

  return {
    invoiceTotal: total,
    gatewayFee,
    platformFee,
    totalFee,
    totalPayable,
    currency,
  };
}
