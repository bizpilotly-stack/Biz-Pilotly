import { ProfitMarginInput, ProfitMarginOutput, CalculationResult } from './types';
import { safeNumber, roundCurrency, roundPercent } from './precision';

/**
 * Pure calculation function for Profit Margin.
 * Formula:
 * Selling Price = Cost / (1 - Desired Margin / 100)
 * Profit = Selling Price - Cost
 * Markup (%) = (Profit / Cost) * 100
 */
export function calculateProfitMargin(input: ProfitMarginInput): CalculationResult<ProfitMarginOutput> {
  const cost = Math.max(0, safeNumber(input.cost, 0));
  const marginPercent = safeNumber(input.desiredMarginPercent, 0);

  if (marginPercent >= 100) {
    return {
      success: false,
      error: 'Desired profit margin cannot be 100% or greater.',
    };
  }

  if (marginPercent < 0) {
    return {
      success: false,
      error: 'Profit margin cannot be negative.',
    };
  }

  if (cost === 0) {
    return {
      success: true,
      data: {
        cost: 0,
        marginPercent: roundPercent(marginPercent),
        sellingPrice: 0,
        profit: 0,
        markupPercent: 0,
      },
    };
  }

  const sellingPrice = cost / (1 - marginPercent / 100);
  const profit = sellingPrice - cost;
  const markupPercent = (profit / cost) * 100;

  return {
    success: true,
    data: {
      cost: roundCurrency(cost),
      marginPercent: roundPercent(marginPercent),
      sellingPrice: roundCurrency(sellingPrice),
      profit: roundCurrency(profit),
      markupPercent: roundPercent(markupPercent),
    },
  };
}
