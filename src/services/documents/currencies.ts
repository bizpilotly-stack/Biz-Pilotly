import { CurrencyConfig } from './types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
];

export function getCurrencyConfig(code: string): CurrencyConfig {
  const match = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return match || { code: code.toUpperCase(), symbol: '₦', name: code, locale: 'en-NG' };
}

/**
 * Standard International Currency Formatter
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string = 'NGN',
  customSymbol?: string
): string {
  const safeAmt = Number.isFinite(amount) ? amount : 0;
  const config = getCurrencyConfig(currencyCode);
  const symbol = customSymbol || config.symbol;

  const formattedNumber = Math.abs(safeAmt).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return safeAmt < 0 ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`;
}
