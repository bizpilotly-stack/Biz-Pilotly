import { DiscountInput, DiscountOutput } from './types';
import { safeNumber, roundCurrency, roundPercent, clamp } from './precision';

/**
 * Pure calculation function for Discount.
 * Formula:
 * Discount Amount = (Original Price * Discount %) / 100
 * Final Price = Original Price - Discount Amount
 * Savings % = Discount %
 */
export function calculateDiscount(input: DiscountInput): DiscountOutput {
  const originalPrice = Math.max(0, safeNumber(input.originalPrice, 0));
  const discountPercent = clamp(safeNumber(input.discountPercent, 0), 0, 100);

  const discountAmount = (originalPrice * discountPercent) / 100;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    originalPrice: roundCurrency(originalPrice),
    discountPercent: roundPercent(discountPercent),
    discountAmount: roundCurrency(discountAmount),
    finalPrice: roundCurrency(finalPrice),
    savingsPercent: roundPercent(discountPercent),
  };
}
