import { adminDb } from "@/lib/firebase/firebase-admin";
import { getUserId } from "@/lib/firebase/auth-utilities";
import { CurrencySetting } from "@/lib/models/currency-setting";
import { FieldValue } from "firebase-admin/firestore";

const getUserDocRef = async () => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return adminDb.doc(`users/${userId}`);
};

export const currencyService = {
  async updateCurrencySetting(setting: CurrencySetting) {
    try {
      const userDocRef = await getUserDocRef();
      await userDocRef.update({
        "preferences.currency": setting,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        error: "",
      };
    } catch (error) {
      console.error("Error updating currency setting:", error);
      return {
        success: false,
        error: "Failed to update currency setting",
      };
    }
  },

  async getCurrencySetting() {
    try {
      const userDocRef = await getUserDocRef();
      const userDoc = await userDocRef.get();
      const userData = userDoc.data();
      
      return {
        success: true,
        currencySetting: userData?.preferences?.currency,
        error: "",
      };
    } catch (error) {
      console.error("Error getting currency setting:", error);
      return {
        success: false,
        error: "Failed to get currency setting",
      };
    }
  }
}; 