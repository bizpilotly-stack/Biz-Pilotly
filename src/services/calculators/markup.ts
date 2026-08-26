import { MarkupInput, MarkupOutput } from './types';
import { safeNumber, roundCurrency, roundPercent } from './precision';

/**
 * Pure calculation function for Markup.
 * Formula:
 * Profit = (Cost * Markup %) / 100
 * Selling Price = Cost + Profit
 * Profit Margin (%) = (Profit / Selling Price) * 100
 */
export function calculateMarkup(input: MarkupInput): MarkupOutput {
  const cost = Math.max(0, safeNumber(input.cost, 0));
  const markupPercent = Math.max(0, safeNumber(input.markupPercent, 0));

  const profit = (cost * markupPercent) / 100;
  const sellingPrice = cost + profit;
  const profitMarginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  return {
    cost: roundCurrency(cost),
    markupPercent: roundPercent(markupPercent),
    profit: roundCurrency(profit),
    sellingPrice: roundCurrency(sellingPrice),
    profitMarginPercent: roundPercent(profitMarginPercent),
  };
}
