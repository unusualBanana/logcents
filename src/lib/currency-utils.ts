/**
 * Currency formatting and utility functions
 */

// Get the decimal separator for a specific locale
export const getDecimalSeparator = (locale: string): string => {
  const numberWithDecimal = 1.1;
  const formatter = new Intl.NumberFormat(locale);
  return formatter.formatToParts(numberWithDecimal).find(part => part.type === 'decimal')?.value || '.';
};

// Get the thousand separator for a specific locale
export const getThousandSeparator = (locale: string): string => {
  const numberWithThousands = 1000;
  const formatter = new Intl.NumberFormat(locale);
  return formatter.formatToParts(numberWithThousands).find(part => part.type === 'group')?.value || ',';
};

// Currency configuration types
export interface CurrencyOptions {
  fractionDigits: number;
}

// Define currency-specific options
export const getCurrencyOptions = (currency: string): CurrencyOptions => {
  const options = {
    fractionDigits: 2, // Default for most currencies
  };

  // Currency-specific configurations
  switch (currency.toUpperCase()) {
    case 'IDR':
    case 'JPY':
    case 'KRW':
    case 'VND':
      options.fractionDigits = 0; // These currencies typically don't use decimals
      break;
    case 'BHD':
    case 'KWD':
    case 'OMR':
      options.fractionDigits = 3; // These currencies use 3 decimal places
      break;
    case 'BTC':
      options.fractionDigits = 8; // Bitcoin can use up to 8 decimals (satoshis)
      break;
  }

  return options;
};

// Get default locale for currency if not specified
export const getCurrencyDefaultLocale = (currency: string): string => {
  const localeMap: Record<string, string> = {
    'IDR': 'id-ID',
    'JPY': 'ja-JP',
    'KRW': 'ko-KR',
    'USD': 'en-US',
    'EUR': 'de-DE', // Common locale for Euro
    'GBP': 'en-GB',
    'CNY': 'zh-CN',
    'INR': 'en-IN',
    'BRL': 'pt-BR',
  };

  return localeMap[currency.toUpperCase()] || 'en-US'; // Default fallback
};

// Format a number according to currency and locale rules
export const formatNumberByCurrency = (
  value: number, 
  currency: string, 
  locale: string,
  includeCurrency: boolean = true
): string => {
  if (value === undefined || value === null || isNaN(value)) return "";
  
  // Get currency formatting options
  const options = getCurrencyOptions(currency);
  
  // Create formatter
  const formatter = new Intl.NumberFormat(locale, {
    style: includeCurrency ? "currency" : "decimal",
    currency: currency,
    minimumFractionDigits: options.fractionDigits,
    maximumFractionDigits: options.fractionDigits
  });

  // Format the number
  let formatted = formatter.format(value);
  
  // Remove currency symbol if not required
  if (!includeCurrency) {
    formatted = formatted.replace(/^[^\d.,]+\s?/, '');
  }
  
  return formatted;
};

// Parse a string number with locale-specific separators to a JS number
export const parseLocaleNumber = (stringNumber: string, locale: string): number => {
  if (!stringNumber) return 0;
  
  const decimalSeparator = getDecimalSeparator(locale);
  const thousandSeparator = getThousandSeparator(locale);
  
  // Remove thousand separators and normalize the decimal separator to a dot
  const normalizedValue = stringNumber
    .replace(new RegExp(`\\${thousandSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`, 'g'), '.');
  
  // Parse the normalized value
  return parseFloat(normalizedValue) || 0;
};