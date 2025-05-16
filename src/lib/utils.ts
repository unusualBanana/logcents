import imageCompression from "browser-image-compression";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrencySetting } from "@/lib/models/currency-setting";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as a long date string (e.g., "Friday, October 27, 2023").
 * @param dateInput The date to format (Date object or string).
 * @param locale The locale to use for formatting (e.g., "en-US"). Defaults to "en-US".
 * @returns The formatted date string.
 */
export function formatLongDate(
  dateInput: Date | string,
  locale: string = "en-US"
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Handle invalid date input
  }
  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

/**
 * Converts HEIC/HEIF images to JPEG format
 * @param heicFile HEIC/HEIF file to convert
 * @returns Promise resolving to a converted JPEG File or null if conversion fails
 */
export async function convertHeicToJpeg(heicFile: File): Promise<File | null> {
  try {
    // Dynamic import
    const heic2anyModule = await import("heic2any");
    const heic2any = heic2anyModule.default;

    // Convert the HEIC file to JPEG
    const convertedBlob = (await heic2any({
      blob: heicFile,
      toType: "image/jpeg",
      quality: 0.6,
    })) as Blob;

    // Create a new filename
    const newFilename = heicFile.name
      .replace(/\.(heic|heif)$/i, ".jpg")
      .replace(/\s+/g, "_");

    return new File([convertedBlob], newFilename, { type: "image/jpeg" });
  } catch (error) {
    console.error("HEIC conversion error:", error);
    return null;
  }
}

/**
 * Compresses a JPEG image file.
 * @param file The image file to compress.
 * @returns Promise resolving to a compressed File or null if compression fails.
 */
export const compressJpegImage = async (file: File): Promise<File | null> => {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.7,
    useWebWorker: true,
  });
  console.log("Compressed file:", compressedFile);
  return compressedFile;
};

export function formatCurrency(amount: number, currencySetting: CurrencySetting) {
  // Simple currency formatting. Adjust as needed.
  return new Intl.NumberFormat(currencySetting.locale, {
    style: "currency",
    currency: currencySetting.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
