export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
}

/**
 * Complete list of all 195+ sovereign countries and global regions in the world
 */
export const ALL_WORLD_COUNTRIES: CountryInfo[] = [
  // Top Popular / Primary
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'CA$' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', currencySymbol: 'GH₵' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', currencySymbol: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', currencySymbol: 'SAR' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$' },

  // A
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', currency: 'AFN', currencySymbol: '؋' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱', currency: 'ALL', currencySymbol: 'L' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', currency: 'DZD', currencySymbol: 'د.ج' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', currency: 'EUR', currencySymbol: '€' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', currency: 'AOA', currencySymbol: 'Kz' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', currency: 'XCD', currencySymbol: '$' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS', currencySymbol: '$' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', currency: 'AMD', currencySymbol: '֏' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', currency: 'EUR', currencySymbol: '€' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', currency: 'AZN', currencySymbol: '₼' },

  // B
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', currency: 'BSD', currencySymbol: '$' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', currency: 'BHD', currencySymbol: '.د.ب' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', currencySymbol: '৳' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', currency: 'BBD', currencySymbol: '$' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', currency: 'BYN', currencySymbol: 'Br' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', currency: 'EUR', currencySymbol: '€' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', currency: 'BZD', currencySymbol: '$' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', currency: 'BTN', currencySymbol: 'Nu.' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', currency: 'BOB', currencySymbol: 'Bs.' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', currency: 'BAM', currencySymbol: 'KM' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', currency: 'BWP', currencySymbol: 'P' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', currency: 'BND', currencySymbol: '$' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', currency: 'BGN', currencySymbol: 'лв' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', currency: 'BIF', currencySymbol: 'FBu' },

  // C
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', currency: 'CVE', currencySymbol: '$' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', currency: 'KHR', currencySymbol: '៛' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', currency: 'XAF', currencySymbol: 'FCFA' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', currency: 'XAF', currencySymbol: 'FCFA' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', currency: 'XAF', currencySymbol: 'FCFA' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP', currencySymbol: '$' },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', currencySymbol: '¥' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP', currencySymbol: '$' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', currency: 'KMF', currencySymbol: 'CF' },
  { code: 'CG', name: 'Congo (Brazzaville)', flag: '🇨🇬', currency: 'XAF', currencySymbol: 'FCFA' },
  { code: 'CD', name: 'Congo (Kinshasa)', flag: '🇨🇩', currency: 'CDF', currencySymbol: 'FC' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', currency: 'CRC', currencySymbol: '₡' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', currency: 'EUR', currencySymbol: '€' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', currency: 'CUP', currencySymbol: '$' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', currency: 'EUR', currencySymbol: '€' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', currency: 'CZK', currencySymbol: 'Kč' },

  // D
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK', currencySymbol: 'kr' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', currency: 'DJF', currencySymbol: 'Fdj' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲', currency: 'XCD', currencySymbol: '$' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', currency: 'DOP', currencySymbol: 'RD$' },

  // E
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', currency: 'USD', currencySymbol: '$' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', currency: 'EGP', currencySymbol: 'E£' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', currency: 'USD', currencySymbol: '$' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', currency: 'XAF', currencySymbol: 'FCFA' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', currency: 'ERN', currencySymbol: 'Nfk' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', currency: 'EUR', currencySymbol: '€' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', currency: 'SZL', currencySymbol: 'E' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB', currencySymbol: 'Br' },

  // F
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', currency: 'FJD', currencySymbol: '$' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', currency: 'EUR', currencySymbol: '€' },

  // G
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', currency: 'XAF', currencySymbol: 'FCFA' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', currency: 'GMD', currencySymbol: 'D' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', currency: 'GEL', currencySymbol: '₾' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', currency: 'EUR', currencySymbol: '€' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩', currency: 'XCD', currencySymbol: '$' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', currency: 'GTQ', currencySymbol: 'Q' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', currency: 'GNF', currencySymbol: 'FG' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', currency: 'GYD', currencySymbol: '$' },

  // H
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', currency: 'HTG', currencySymbol: 'G' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', currency: 'HNL', currencySymbol: 'L' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', currencySymbol: 'HK$' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', currency: 'HUF', currencySymbol: 'Ft' },

  // I
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', currency: 'ISK', currencySymbol: 'kr' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', currencySymbol: 'Rp' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', currency: 'IRR', currencySymbol: '﷼' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', currency: 'IQD', currencySymbol: 'ع.د' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', currency: 'ILS', currencySymbol: '₪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€' },

  // J
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', currency: 'JMD', currencySymbol: 'J$' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', currency: 'JOD', currencySymbol: 'د.ا' },

  // K
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', currency: 'KZT', currencySymbol: '₸' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', currencySymbol: 'د.ك' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬', currency: 'KGS', currencySymbol: 'с' },

  // L
  { code: 'LA', name: 'Laos', flag: '🇱🇦', currency: 'LAK', currencySymbol: '₭' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', currency: 'EUR', currencySymbol: '€' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', currency: 'LBP', currencySymbol: 'ل.ل' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', currency: 'LSL', currencySymbol: 'L' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', currency: 'LRD', currencySymbol: '$' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', currency: 'LYD', currencySymbol: 'ل.د' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', currency: 'CHF', currencySymbol: 'CHF' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', currency: 'EUR', currencySymbol: '€' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', currency: 'EUR', currencySymbol: '€' },

  // M
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', currency: 'MGA', currencySymbol: 'Ar' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', currency: 'MWK', currencySymbol: 'MK' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', currencySymbol: 'RM' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', currency: 'MVR', currencySymbol: 'Rf' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', currency: 'EUR', currencySymbol: '€' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷', currency: 'MRU', currencySymbol: 'UM' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', currency: 'MUR', currencySymbol: '₨' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', currencySymbol: 'MX$' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', currency: 'MDL', currencySymbol: 'L' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', currency: 'EUR', currencySymbol: '€' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', currency: 'MNT', currencySymbol: '₮' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', currency: 'EUR', currencySymbol: '€' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', currency: 'MAD', currencySymbol: 'د.م.' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', currency: 'MZN', currencySymbol: 'MT' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', currency: 'MMK', currencySymbol: 'K' },

  // N
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', currency: 'NAD', currencySymbol: '$' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', currency: 'NPR', currencySymbol: '₨' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: 'NZ$' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', currency: 'NIO', currencySymbol: 'C$' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK', currencySymbol: 'kr' },

  // O & P
  { code: 'OM', name: 'Oman', flag: '🇴🇲', currency: 'OMR', currencySymbol: 'ر.ع.' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', currencySymbol: '₨' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', currency: 'USD', currencySymbol: '$' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', currency: 'PGK', currencySymbol: 'K' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', currency: 'PYG', currencySymbol: '₲' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', currency: 'PEN', currencySymbol: 'S/.' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP', currencySymbol: '₱' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€' },

  // Q & R
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: 'ر.ق' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', currency: 'RON', currencySymbol: 'lei' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', currency: 'RWF', currencySymbol: 'FRw' },

  // S
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', currency: 'RSD', currencySymbol: 'дин.' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', currency: 'SCR', currencySymbol: '₨' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', currency: 'SLE', currencySymbol: 'Le' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', currency: 'EUR', currencySymbol: '€' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', currency: 'EUR', currencySymbol: '€' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', currency: 'SOS', currencySymbol: 'Sh' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', currency: 'LKR', currencySymbol: 'Rs' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', currencySymbol: 'CHF' },

  // T
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', currency: 'TWD', currencySymbol: 'NT$' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', currency: 'TZS', currencySymbol: 'TSh' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB', currencySymbol: '฿' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', currency: 'TTD', currencySymbol: 'TT$' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', currency: 'TND', currencySymbol: 'د.ت' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺' },

  // U
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX', currencySymbol: 'USh' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', currency: 'UAH', currencySymbol: '₴' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', currency: 'UYU', currencySymbol: '$U' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', currency: 'UZS', currencySymbol: "so'm" },

  // V, Y, Z
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', currency: 'VES', currencySymbol: 'Bs.S' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currency: 'VND', currencySymbol: '₫' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', currency: 'YER', currencySymbol: '﷼' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', currency: 'ZMW', currencySymbol: 'ZK' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', currency: 'ZWL', currencySymbol: '$' },

  // Global / Other
  { code: 'GLOBAL', name: 'Other Country / Global Wire', flag: '🌍', currency: 'USD', currencySymbol: '$' },
];
