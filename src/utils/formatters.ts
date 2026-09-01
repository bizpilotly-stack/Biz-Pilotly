export function formatCurrency(
  amount: number,
  currencyCode: string = 'NGN',
  currencySymbol?: string
): string {
  const symbol = currencySymbol || (
    currencyCode === 'NGN' ? '₦' :
    currencyCode === 'USD' ? '$' :
    currencyCode === 'GBP' ? '£' :
    currencyCode === 'EUR' ? '€' :
    currencyCode === 'CAD' ? 'CA$' :
    currencyCode === 'GHS' ? 'GH₵' :
    currencyCode === 'KES' ? 'KSh' :
    currencyCode === 'ZAR' ? 'R' : '₦'
  );
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

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function getUserLocale(): string {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
}

export function formatDate(dateString?: string, timeZone?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const tz = timeZone || getUserTimezone();
    const locale = getUserLocale();

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: tz,
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string, timeZone?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const tz = timeZone || getUserTimezone();
    const locale = getUserLocale();

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return dateString;
  }
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 5
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  const errors: string[] = [];
  if (!hasMinLength) errors.push('At least 8 characters');
  if (!hasUppercase) errors.push('At least one uppercase letter (A-Z)');
  if (!hasLowercase) errors.push('At least one lowercase letter (a-z)');
  if (!hasNumber) errors.push('At least one number (0-9)');
  if (!hasSpecialChar) errors.push('At least one special character (!@#$%^&*)');

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  return {
    isValid: score === 5,
    score,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    errors,
  };
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
