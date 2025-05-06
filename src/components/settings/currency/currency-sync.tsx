"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";

const CurrencySync = () => {
  const { user } = useAuthStore();
  const { fetchCurrencySetting } = useCurrencyStore();

  useEffect(() => {
    if (user) {
      fetchCurrencySetting(user.uid);
    }
  }, [user, fetchCurrencySetting]);

  return null;
};

export default CurrencySync; 