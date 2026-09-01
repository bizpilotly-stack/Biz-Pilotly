import { CurrencyConfig } from './types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', locale: 'es-AR' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', locale: 'ar-QA' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', locale: 'rw-RW' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', locale: 'ar-SA' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', locale: 'sw-TZ' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', locale: 'en-UG' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
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
