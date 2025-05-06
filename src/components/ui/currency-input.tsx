"use client";

import { Input } from "@/components/ui/input";
import {
  formatNumberByCurrency,
  getCurrencyDefaultLocale,
  getDecimalSeparator,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  currency: string;
  locale?: string;
  showCurrencyPrefix?: boolean;
  prefixClassName?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currency,
  locale,
  className,
  placeholder = "0",
  id,
  name,
  required = false,
  disabled = false,
  showCurrencyPrefix = true,
  prefixClassName,
  ...props
}: CurrencyInputProps) {
  // If no locale is provided, determine the appropriate one for the currency
  const effectiveLocale = locale || getCurrencyDefaultLocale(currency);

  // State management
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Update internal state when external value changes (but not while user is typing)
  useEffect(() => {
    if (!isFocused && value !== undefined) {
      const rawValue = value.toString();
      setInputValue(rawValue);
    }
  }, [value, isFocused]);

  // Handle user input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Get decimal separator for proper validation
    const decimalSeparator = getDecimalSeparator(effectiveLocale);

    // Clean the input to only allow digits and one decimal separator
    const validValue = newValue
      .replace(decimalSeparator, ".") // Convert to standard decimal point
      .replace(/[^\d.]/g, "") // Remove non-numeric characters
      .replace(/(\..*)\./g, "$1"); // Keep only one decimal point

    setInputValue(validValue);

    // Update parent component with numeric value
    const numericValue = parseFloat(validValue) || 0;
    onChange(numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputValue(value.toString());
    // Call any onFocus handler passed in props
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Call any onBlur handler passed in props
    props.onBlur?.(e);
  };

  // Get the formatted value for display when not focused
  const formattedValue = formatNumberByCurrency(
    value,
    currency,
    effectiveLocale,
    false
  );

  return (
    <div className="relative">
      {showCurrencyPrefix && (
        <div
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10",
            prefixClassName
          )}
        >
          {/* Display currency symbol instead of code */}
          {new Intl.NumberFormat(effectiveLocale, { style: 'currency', currency: currency }).formatToParts(0).find(part => part.type === 'currency')?.value}
        </div>
      )}
      <Input
        id={id}
        name={name}
        type={isFocused ? "number" : "text"} // Use number type when focused for mobile keyboards
        inputMode="decimal" // Better numeric keyboard on mobile
        value={isFocused ? inputValue : formattedValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(showCurrencyPrefix ? "pl-12" : "", className)}
        aria-label={`${currency} amount input`}
        {...props}
      />
    </div>
  );
}

/**
 * Formats a date as a long date string (e.g., "Friday, October 27, 2023").
 * @param dateInput The date to format (Date object or string).
 * @param locale The locale to use for formatting (e.g., "en-US"). Defaults to "en-US".
 * @returns The formatted date string.
 */
/*
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
*/

/**
 * Converts HEIC/HEIF images to JPEG format
 * @param heicFile HEIC/HEIF file to convert
 * @returns Promise resolving to a converted JPEG File or null if conversion fails
 */
/*
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
*/

/**
 * Compresses a JPEG image file.
 * @param file The image file to compress.
 * @returns Promise resolving to a compressed File or null if compression fails.
 */
/*
export const compressJpegImage = async (file: File): Promise<File | null> => {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.7,
    useWebWorker: true,
  });
  console.log("Compressed file:", compressedFile);
  return compressedFile;
};
*/
