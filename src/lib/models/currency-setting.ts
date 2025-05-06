export type CurrencySetting = {
  currency: string;
  locale: string;
  name: string;
};

export const SupportedCurrenciesMap: {
  [key: string]: CurrencySetting;
} = {
  IDR: { currency: "IDR", locale: "id-ID", name: "Indonesian Rupiah" },
  SGD: { currency: "SGD", locale: "en-SG", name: "Singapore Dollar" },
  USD: { currency: "USD", locale: "en-US", name: "United States Dollar" },
}; 