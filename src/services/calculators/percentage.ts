import { PercentageInput, PercentageOutput, CalculationResult } from './types';
import { safeNumber, roundTo, roundPercent } from './precision';

/**
 * Pure calculation function for Multi-Mode Percentage Math.
 * Mode 1: What is X% of Y?
 * Mode 2: X is what percent of Y?
 * Mode 3: Percentage increase / decrease from X to Y
 */
export function calculatePercentage(input: PercentageInput): CalculationResult<PercentageOutput> {
  const v1 = safeNumber(input.val1, 0);
  const v2 = safeNumber(input.val2, 0);

  if (input.mode === 'what_is_x_percent_of_y') {
    const result = (v1 * v2) / 100;
    return {
      success: true,
      data: {
        text: `${v1}% of ${v2} is`,
        result: roundTo(result, 2),
        explanation: `(${v1} ÷ 100) × ${v2} = ${roundTo(result, 2)}`,
      },
    };
  }

  if (input.mode === 'x_is_what_percent_of_y') {
    if (v2 === 0) {
      return {
        success: false,
        error: 'Total amount (Y) cannot be zero when finding a percentage share.',
      };
    }
    const result = (v1 / v2) * 100;
    return {
      success: true,
      data: {
        text: `${v1} is what percent of ${v2}?`,
        result: roundPercent(result),
        unit: '%',
        explanation: `(${v1} ÷ ${v2}) × 100 = ${roundPercent(result)}%`,
      },
    };
  }

  // percentage_increase_decrease
  if (v1 === 0) {
    return {
      success: false,
      error: 'Initial base value (X) cannot be zero when calculating percentage change.',
    };
  }

  const diff = v2 - v1;
  const change = (diff / Math.abs(v1)) * 100;
  const direction = diff >= 0 ? 'increase' : 'decrease';

  return {
    success: true,
    data: {
      text: `Change from ${v1} to ${v2}:`,
      result: roundPercent(Math.abs(change)),
      unit: `% ${direction}`,
      diff: roundTo(diff, 2),
      explanation: `((${v2} - ${v1}) ÷ |${v1}|) × 100 = ${change > 0 ? '+' : ''}${roundPercent(change)}%`,
    },
  };
}
