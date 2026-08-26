/**
 * Financial & Decimal Precision Helper Utilities
 * Avoids JavaScript IEEE-754 floating-point inaccuracies (e.g. 0.1 + 0.2 = 0.30000000000000004)
 */

/**
 * Safely parse any input into a finite number. Returns fallback if NaN or infinite.
 */
export function safeNumber(val: unknown, fallback: number = 0): number {
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : fallback;
  }
  if (typeof val === 'string') {
    const parsed = parseFloat(val.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * Rounds a number to a specific decimal places using epsilon correction.
 */
export function roundTo(val: number, decimals: number = 2): number {
  if (!Number.isFinite(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

/**
 * Currency rounding (2 decimal places)
 */
export function roundCurrency(val: number): number {
  return roundTo(val, 2);
}

/**
 * Percentage rounding (2 decimal places)
 */
export function roundPercent(val: number): number {
  return roundTo(val, 2);
}

/**
 * Clamp a number between min and max bounds
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
