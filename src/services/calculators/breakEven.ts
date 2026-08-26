import { BreakEvenInput, BreakEvenOutput, CalculationResult } from './types';
import { safeNumber, roundCurrency, roundPercent } from './precision';

/**
 * Pure calculation function for Break-Even Analysis.
 * Formula:
 * Contribution Margin = Price Per Unit - Variable Cost Per Unit
 * Break-Even Units = Math.ceil(Fixed Costs / Contribution Margin)
 * Break-Even Revenue = Break-Even Units * Price Per Unit
 * Margin Ratio (%) = (Contribution Margin / Price Per Unit) * 100
 */
export function calculateBreakEven(input: BreakEvenInput): CalculationResult<BreakEvenOutput> {
  const fixedCosts = Math.max(0, safeNumber(input.fixedCosts, 0));
  const pricePerUnit = Math.max(0, safeNumber(input.pricePerUnit, 0));
  const variableCost = Math.max(0, safeNumber(input.variableCostPerUnit, 0));

  const contributionMargin = pricePerUnit - variableCost;

  if (pricePerUnit <= 0) {
    return {
      success: false,
      error: 'Price per unit must be greater than zero.',
    };
  }

  if (contributionMargin <= 0) {
    return {
      success: false,
      error: 'Price per unit must be greater than variable cost to reach break-even.',
    };
  }

  const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;
  const marginRatioPercent = (contributionMargin / pricePerUnit) * 100;

  return {
    success: true,
    data: {
      fixedCosts: roundCurrency(fixedCosts),
      pricePerUnit: roundCurrency(pricePerUnit),
      variableCost: roundCurrency(variableCost),
      contributionMargin: roundCurrency(contributionMargin),
      breakEvenUnits,
      breakEvenRevenue: roundCurrency(breakEvenRevenue),
      marginRatioPercent: roundPercent(marginRatioPercent),
    },
  };
}
