import { CommissionInput, CommissionOutput } from './types';
import { safeNumber, roundCurrency, roundPercent, clamp } from './precision';

/**
 * Pure calculation function for Commission.
 * Formula:
 * Commission Amount = (Deal Amount * Commission Rate %) / 100
 * Remaining Amount = Deal Amount - Commission Amount
 */
export function calculateCommission(input: CommissionInput): CommissionOutput {
  const dealAmount = Math.max(0, safeNumber(input.dealAmount, 0));
  const commissionRatePercent = clamp(safeNumber(input.commissionRatePercent, 0), 0, 100);

  const commissionAmount = (dealAmount * commissionRatePercent) / 100;
  const remainingAmount = Math.max(0, dealAmount - commissionAmount);

  return {
    dealAmount: roundCurrency(dealAmount),
    commissionRatePercent: roundPercent(commissionRatePercent),
    commissionAmount: roundCurrency(commissionAmount),
    remainingAmount: roundCurrency(remainingAmount),
  };
}
