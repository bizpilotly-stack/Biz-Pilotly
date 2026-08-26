import { ProfitInput, ProfitOutput } from './types';
import { safeNumber, roundCurrency, roundPercent } from './precision';

/**
 * Pure calculation function for Gross and Net Business Profit.
 * Formula:
 * Total Costs = Direct Costs + Overhead Costs
 * Gross Profit = Revenue - Direct Costs
 * Pre-Tax Profit = Revenue - Total Costs
 * Tax = Pre-Tax Profit > 0 ? (Pre-Tax Profit * Tax Rate) / 100 : 0
 * Net Profit = Pre-Tax Profit - Tax
 * Margins = (Profit / Revenue) * 100
 */
export function calculateProfit(input: ProfitInput): ProfitOutput {
  const revenue = Math.max(0, safeNumber(input.revenue, 0));
  const directCosts = Math.max(0, safeNumber(input.directCosts, 0));
  const overheadCosts = Math.max(0, safeNumber(input.overheadCosts, 0));
  const taxRate = Math.max(0, safeNumber(input.taxRate, 0));

  const totalCosts = roundCurrency(directCosts + overheadCosts);
  const grossProfit = roundCurrency(revenue - directCosts);
  const preTaxNetProfit = roundCurrency(revenue - totalCosts);
  
  const estimatedTax = preTaxNetProfit > 0 
    ? roundCurrency((preTaxNetProfit * taxRate) / 100)
    : 0;

  const netProfit = roundCurrency(preTaxNetProfit - estimatedTax);

  const grossMarginPercent = revenue > 0 
    ? roundPercent((grossProfit / revenue) * 100)
    : 0;

  const netMarginPercent = revenue > 0 
    ? roundPercent((netProfit / revenue) * 100)
    : 0;

  return {
    revenue: roundCurrency(revenue),
    directCosts: roundCurrency(directCosts),
    overheadCosts: roundCurrency(overheadCosts),
    totalCosts,
    grossProfit,
    grossMarginPercent,
    preTaxNetProfit,
    estimatedTax,
    netProfit,
    netMarginPercent,
  };
}
