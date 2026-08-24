export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  currencySymbol?: string
): string {
  const symbol = currencySymbol || (currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : '$');
  const formattedNumber = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return amount < 0 ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function generateDocNumber(prefix: string, count: number): string {
  const currentYear = new Date().getFullYear();
  const padded = String(count).padStart(4, '0');
  return `${prefix}-${currentYear}-${padded}`;
}

export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  return Number((qty * price).toFixed(2));
}

export function calculateDocumentTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRatePercent: number = 0,
  discountPercent: number = 0
) {
  const subtotal = items.reduce((sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitPrice), 0);
  const discountAmount = Number(((subtotal * (Number(discountPercent) || 0)) / 100).toFixed(2));
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(((subtotalAfterDiscount * (Number(taxRatePercent) || 0)) / 100).toFixed(2));
  const total = Number((subtotalAfterDiscount + taxAmount).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount,
    taxAmount,
    total,
  };
}
