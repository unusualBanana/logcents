"use server";

import { adminDb } from "@/lib/firebase/firebase-admin";
import { getUserId } from "@/lib/firebase/auth-utilities";
import { CurrencySetting, SupportedCurrenciesMap } from "@/lib/models/currency-setting";
import { User } from "@/lib/models/user"; // Import User and UserPreferences types

// Helper function to get the user document reference
const getUserDocRef = async () => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return adminDb.doc(`users/${userId}`);
};

// Function to fetch currency setting for a user from the user document
export const fetchUserCurrencySetting = async (): Promise<CurrencySetting | null> => {
  try {
    const userDocRef = await getUserDocRef();
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
      const userData = docSnap.data() as User;
      // Access currency setting from preferences field
      const currencySetting = userData?.preferences?.currency;

      if (currencySetting) {
        // Optional: Validate fetched data against SupportedCurrenciesMap if needed
        if (SupportedCurrenciesMap[currencySetting.currency]) {
           return currencySetting;
        } else {
           console.warn(`Fetched unsupported currency: ${currencySetting.currency}. Returning default.`);
           return SupportedCurrenciesMap.USD; // Return default or handle as per logic
        }
      } else {
        console.log("No currency setting found in user preferences, returning default.");
        return SupportedCurrenciesMap.USD;
      }
    } else {
      console.log("User document not found, returning default currency.");
      return SupportedCurrenciesMap.USD;
    }
  } catch (error) {
    console.error("Error fetching currency setting from user document:", error);
    // Depending on how you want to handle errors, you might throw or return null/default
    // For now, returning default on error
    return SupportedCurrenciesMap.USD;
  }
};

// Function to update currency setting in the user document
export const updateUserCurrencySetting = async (
  currencySetting: CurrencySetting
): Promise<void> => {
  try {
    const userDocRef = await getUserDocRef();
    // Use merge: true to update only the preferences.currency field
    await userDocRef.set({ preferences: { currency: currencySetting } }, { merge: true });
    console.log("Currency setting updated successfully in user document");
  } catch (error) {
    console.error("Error updating currency setting in user document:", error);
    throw error; // Re-throw to allow calling component to handle errors
  }
}; 