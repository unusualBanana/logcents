"use server";

import { currencyService } from "@/services/currency.service";
import { CurrencySetting } from "@/lib/models/currency-setting";

export async function updateCurrencySetting(setting: CurrencySetting) {
  return currencyService.updateCurrencySetting(setting);
}

export async function getCurrencySetting() {
  return currencyService.getCurrencySetting();
} 