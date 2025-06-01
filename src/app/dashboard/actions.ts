"use server";

import { transactionService } from "@/services/transaction.service";
import { currencyService } from "@/services/currency.service";

export async function getDailySpendingComparison() {
  try {
    const result = await transactionService.getDailySpendingComparison();
    if (!result.success) {
      throw new Error(result.error);
    }

    const { todayTotal, yesterdayTotal, percentageChange } = result;
    const currencySetting = await currencyService.getCurrencySetting();

    return {
      success: true,
      todayTotal,
      yesterdayTotal,
      percentageChange,
      currencySetting: currencySetting.currencySetting,
    };
  } catch (error) {
    console.error("Error getting daily spending comparison:", error);
    return {
      success: false,
      error: "Failed to get daily spending comparison",
    };
  }
}

export async function getWeeklySpendingComparison() {
  try {
    const result = await transactionService.getWeeklySpendingComparison();
    if (!result.success) {
      throw new Error(result.error);
    }

    const { currentWeekTotal, lastWeekTotal, percentageChange } = result;
    const currencySetting = await currencyService.getCurrencySetting();

    return {
      success: true,
      currentWeekTotal,
      lastWeekTotal,
      percentageChange,
      currencySetting: currencySetting.currencySetting,
    };
  } catch (error) {
    console.error("Error getting weekly spending comparison:", error);
    return {
      success: false,
      error: "Failed to get weekly spending comparison",
    };
  }
}

export async function getMonthlySpendingComparison() {
  try {
    const result = await transactionService.getMonthlySpendingComparison();
    if (!result.success) {
      throw new Error(result.error);
    }

    const { currentMonthTotal, lastMonthTotal, percentageChange } = result;
    const currencySetting = await currencyService.getCurrencySetting();

    return {
      success: true,
      currentMonthTotal,
      lastMonthTotal,
      percentageChange,
      currencySetting: currencySetting.currencySetting,
    };
  } catch (error) {
    console.error("Error getting monthly spending comparison:", error);
    return {
      success: false,
      error: "Failed to get monthly spending comparison",
    };
  }
}
