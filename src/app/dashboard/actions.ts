'use server';

import { adminDb } from "@/lib/firebase/firebase-admin";
import { getUserId } from "@/lib/firebase/auth-utilities";
import { User } from "@/lib/models/user";

export async function getDailySpendingComparison() {
  try {
    const userId = await getUserId();

    // Fetch user's currency setting
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data() as User | undefined;
    const currencySetting = userData?.preferences?.currency || { locale: 'en-US', currency: 'USD', name: 'US Dollar' };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Start of yesterday

    // Query transactions using Date objects and the correct 'date' field
    const todayTransactionsSnapshot = await adminDb.collection(`users/${userId}/transactions`)
      .where('date', '>=', today)
      .where('date', '<', tomorrow)
      .get();

    console.log("Today transactions snapshot:", todayTransactionsSnapshot.docs.map(doc => doc.data()));

    let todayTotal = 0;
    todayTransactionsSnapshot.forEach(doc => {
      // Assuming an 'amount' field in transactions
      todayTotal += doc.data().amount || 0;
    });

    const yesterdayTransactionsSnapshot = await adminDb.collection(`users/${userId}/transactions`)
      .where('date', '>=', yesterday)
      .where('date', '<', today)
      .get();

    console.log("Yesterday transactions snapshot:", yesterdayTransactionsSnapshot.docs.map(doc => doc.data()));
    

    let yesterdayTotal = 0;
    yesterdayTransactionsSnapshot.forEach(doc => {
      yesterdayTotal += doc.data().amount || 0;
    });

    let percentageChange = 0;
    if (yesterdayTotal > 0) {
      percentageChange = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
    } else if (todayTotal > 0) {
      // If yesterday had no spending but today does, it's infinite growth.
      // Representing this as 100% growth from 0 is one way, or handle as a special case.
      // For simplicity, let's treat it as a significant positive change.
      // Maybe a very large number or a specific indicator.
      // Let's use 100% for now as a simple representation of growth from zero.
      percentageChange = 100; // Or handle differently based on desired display
    }
     if (todayTotal === 0 && yesterdayTotal === 0) {
       percentageChange = 0; // No change if both are zero
     }


    return {
      today: todayTotal,
      yesterday: yesterdayTotal,
      percentageChange: percentageChange,
      currencySetting: currencySetting,
    };

  } catch (error) {
    console.error("Error fetching daily spending comparison:", error);
    // Return default or error state
    return {
      today: 0,
      yesterday: 0,
      percentageChange: 0,
      error: "Failed to fetch data.",
      currencySetting: { locale: 'en-US', currency: 'USD', name: 'US Dollar' },
    };
  }
}

export async function getWeeklySpendingComparison() {
  try {
    const userId = await getUserId();

    // Fetch user's currency setting
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data() as User | undefined;
    const currencySetting = userData?.preferences?.currency || { locale: 'en-US', currency: 'USD', name: 'US Dollar' };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Calculate the start of the current week (assuming Sunday is the start of the week)
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Go back to the most recent Sunday

    // Calculate the start of next week
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(currentWeekStart.getDate() + 7);

    // Calculate the start of the previous week
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);

    // Query transactions for the current week
    const currentWeekTransactionsSnapshot = await adminDb.collection(`users/${userId}/transactions`)
      .where('date', '>=', currentWeekStart)
      .where('date', '<', nextWeekStart)
      .get();

    let currentWeekTotal = 0;
    currentWeekTransactionsSnapshot.forEach(doc => {
      currentWeekTotal += doc.data().amount || 0;
    });

    // Query transactions for the previous week
    const lastWeekTransactionsSnapshot = await adminDb.collection(`users/${userId}/transactions`)
      .where('date', '>=', lastWeekStart)
      .where('date', '<', currentWeekStart)
      .get();

    let lastWeekTotal = 0;
    lastWeekTransactionsSnapshot.forEach(doc => {
      lastWeekTotal += doc.data().amount || 0;
    });

    let percentageChange = 0;
    if (lastWeekTotal > 0) {
      percentageChange = ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    } else if (currentWeekTotal > 0) {
      percentageChange = 100; // Growth from zero
    }
     if (currentWeekTotal === 0 && lastWeekTotal === 0) {
       percentageChange = 0; // No change if both are zero
     }


    return {
      currentWeek: currentWeekTotal,
      lastWeek: lastWeekTotal,
      percentageChange: percentageChange,
      currencySetting: currencySetting,
    };

  } catch (error) {
    console.error("Error fetching weekly spending comparison:", error);
    return {
      currentWeek: 0,
      lastWeek: 0,
      percentageChange: 0,
      error: "Failed to fetch weekly data.",
      currencySetting: { locale: 'en-US', currency: 'USD', name: 'US Dollar' },
    };
  }
}

export async function getMonthlySpendingComparison() {
   try {
    const userId = await getUserId();

    // Fetch user's currency setting
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data() as User | undefined;
    const currencySetting = userData?.preferences?.currency || { locale: 'en-US', currency: 'USD', name: 'US Dollar' };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Calculate the start of the current month
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate the start of next month
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Calculate the start of the previous month
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Query transactions for the current month
    const currentMonthTransactionsSnapshot = await adminDb.collection(`users/${userId}/transactions`)
      .where('date', '>=', currentMonthStart)
      .where('date', '<', nextMonthStart)
      .get();

    let currentMonthTotal = 0;
    currentMonthTransactionsSnapshot.forEach(doc => {
      currentMonthTotal += doc.data().amount || 0;
    });

    // Query transactions for the previous month
    const lastMonthTransactionsSnapshot = await adminDb.collection(`users/${userId}/transactions`)
      .where('date', '>=', lastMonthStart)
      .where('date', '<', currentMonthStart)
      .get();

    let lastMonthTotal = 0;
    lastMonthTransactionsSnapshot.forEach(doc => {
      lastMonthTotal += doc.data().amount || 0;
    });

    let percentageChange = 0;
    if (lastMonthTotal > 0) {
      percentageChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      percentageChange = 100; // Growth from zero
    }
     if (currentMonthTotal === 0 && lastMonthTotal === 0) {
       percentageChange = 0; // No change if both are zero
     }


    return {
      currentMonth: currentMonthTotal,
      lastMonth: lastMonthTotal,
      percentageChange: percentageChange,
      currencySetting: currencySetting,
    };

  } catch (error) {
    console.error("Error fetching monthly spending comparison:", error);
    return {
      currentMonth: 0,
      lastMonth: 0,
      percentageChange: 0,
      error: "Failed to fetch monthly data.",
      currencySetting: { locale: 'en-US', currency: 'USD', name: 'US Dollar' },
    };
  }
} 