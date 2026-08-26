import { LineItem, DocumentTotals } from './types';
import { roundCurrency, safeNumber, clamp } from '../calculators/precision';

/**
 * Calculates line item total amount: quantity * unitPrice.
 * Ensures non-negative numbers and 2-decimal precision.
 */
export function calculateLineItemTotal(quantity: unknown, unitPrice: unknown): number {
  const qty = Math.max(0, safeNumber(quantity, 0));
  const price = Math.max(0, safeNumber(unitPrice, 0));
  return roundCurrency(qty * price);
}

/**
 * Centralized Document Financial Calculations
 * Order of operations:
 * 1. Subtotal = Sum of each line item's amount (quantity * unitPrice)
 * 2. Discount Amount = (Subtotal * Discount Rate %) / 100
 * 3. Subtotal After Discount = Max(0, Subtotal - Discount Amount)
 * 4. Tax Amount = (Subtotal After Discount * Tax Rate %) / 100
 * 5. Grand Total = Subtotal After Discount + Tax Amount
 */
export function calculateDocumentTotals(
  items: Array<{ quantity: number; unitPrice: number; amount?: number }>,
  taxRatePercent: unknown = 0,
  discountPercent: unknown = 0
): DocumentTotals {
  const validTaxRate = clamp(safeNumber(taxRatePercent, 0), 0, 100);
  const validDiscountRate = clamp(safeNumber(discountPercent, 0), 0, 100);

  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitPrice), 0)
  );

  const discountAmount = roundCurrency((subtotal * validDiscountRate) / 100);
  const subtotalAfterDiscount = Math.max(0, roundCurrency(subtotal - discountAmount));
  const taxAmount = roundCurrency((subtotalAfterDiscount * validTaxRate) / 100);
  const total = roundCurrency(subtotalAfterDiscount + taxAmount);

  return {
    subtotal,
    discountAmount,
    subtotalAfterDiscount,
    taxAmount,
    total,
  };
}

/**
 * Formats line items array ensuring each item has a consistent amount property
 */
export function normalizeLineItems(items: LineItem[]): LineItem[] {
  return items.map((item, index) => ({
    id: item.id || `item-${index + 1}`,
    description: (item.description || '').trim() || 'Deliverable Item',
    quantity: Math.max(1, safeNumber(item.quantity, 1)),
    unitPrice: Math.max(0, safeNumber(item.unitPrice, 0)),
    amount: calculateLineItemTotal(item.quantity, item.unitPrice),
  }));
}
