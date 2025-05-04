"use client";

import { useState } from "react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { formatNumberByCurrency } from "@/lib/currency-utils";

// Example of Usage Component
const CurrencyInputExample = () => {
  const [amountIDR, setAmountIDR] = useState<number>(12500);
  const [amountUSD, setAmountUSD] = useState<number>(10.25);
  const [amountEUR, setAmountEUR] = useState<number>(9.99);
  const [amountBTC, setAmountBTC] = useState<number>(0.00123456);
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Currency Input Examples</h2>
      
      {/* IDR Example */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">IDR (Indonesian Rupiah)</label>
        <CurrencyInput
          value={amountIDR}
          onChange={setAmountIDR}
          currency="IDR"
        />
        <p className="text-sm text-gray-500">Value as number: {amountIDR}</p>
        <p className="text-sm text-gray-500">Formatted: {formatNumberByCurrency(amountIDR, "IDR", "id-ID", true)}</p>
      </div>
      
      {/* USD Example */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">USD (US Dollar)</label>
        <CurrencyInput
          value={amountUSD}
          onChange={setAmountUSD}
          currency="USD"
        />
        <p className="text-sm text-gray-500">Value as number: {amountUSD}</p>
        <p className="text-sm text-gray-500">Formatted: {formatNumberByCurrency(amountUSD, "USD", "en-US", true)}</p>
      </div>
      
      {/* EUR Example */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">EUR (Euro)</label>
        <CurrencyInput
          value={amountEUR}
          onChange={setAmountEUR}
          currency="EUR"
        />
        <p className="text-sm text-gray-500">Value as number: {amountEUR}</p>
        <p className="text-sm text-gray-500">Formatted: {formatNumberByCurrency(amountEUR, "EUR", "de-DE", true)}</p>
      </div>

      {/* BTC Example with more decimals */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">BTC (Bitcoin)</label>
        <CurrencyInput
          value={amountBTC}
          onChange={setAmountBTC}
          currency="BTC"
        />
        <p className="text-sm text-gray-500">Value as number: {amountBTC}</p>
        <p className="text-sm text-gray-500">Formatted: {formatNumberByCurrency(amountBTC, "BTC", "en-US", true)}</p>
      </div>
      
      {/* Customized appearance */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Customized Currency Input (USD)</label>
        <CurrencyInput
          value={amountUSD}
          onChange={setAmountUSD}
          currency="USD"
          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200"
          prefixClassName="text-blue-500 font-semibold"
        />
      </div>
      
      {/* Without currency prefix */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Without Currency Prefix</label>
        <CurrencyInput
          value={amountIDR}
          onChange={setAmountIDR}
          currency="IDR"
          showCurrencyPrefix={false}
        />
      </div>
    </div>
  );
};

export default function ReportPage() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Currency Input Component</h1>
      
      {/* Add the currency input example component */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <CurrencyInputExample />
      </div>
    </div>
  );
}