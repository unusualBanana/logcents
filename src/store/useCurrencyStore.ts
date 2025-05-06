import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CurrencySetting, SupportedCurrenciesMap } from "@/lib/models/currency-setting";
import { db } from "@/lib/firebase/firebase-client";
import { doc, getDoc } from "firebase/firestore";
import { updateUserCurrencySetting } from "@/app/dashboard/settings/currency/actions";
import { User } from "@/lib/models/user";

const DEFAULT_CURRENCY: CurrencySetting = SupportedCurrenciesMap.IDR;

interface CurrencyState {
  currencySetting: CurrencySetting;
  fetchCurrencySetting: (userId: string) => Promise<void>;
  updateCurrencySetting: (currency: CurrencySetting) => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  devtools((set) => ({
    currencySetting: DEFAULT_CURRENCY,
    fetchCurrencySetting: async (userId) => {
      if (!userId) {
        console.error("User ID is required to fetch currency setting");
        set({ currencySetting: DEFAULT_CURRENCY });
        return;
      }

      try {
        const userDocRef = doc(db, `users/${userId}`);
        const docSnap = await getDoc(userDocRef);

        let fetchedSetting: CurrencySetting | undefined;

        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          fetchedSetting = userData?.preferences?.currency;
        }

        if (fetchedSetting && SupportedCurrenciesMap[fetchedSetting.currency]) {
           set({ currencySetting: fetchedSetting });
        } else {
           console.log("Currency setting not found or invalid, setting default and saving.");
           set({ currencySetting: DEFAULT_CURRENCY });
           await updateUserCurrencySetting(DEFAULT_CURRENCY);
        }
      } catch (error) {
         console.error("Failed to fetch or set default currency setting:", error);
         set({ currencySetting: DEFAULT_CURRENCY });
      }
    },
    updateCurrencySetting: async (currency) => {
      try {
         await updateUserCurrencySetting(currency);
         set({ currencySetting: currency });
      } catch (error) {
         console.error("Failed to update currency setting:", error);
      }
    },
  }))
); 