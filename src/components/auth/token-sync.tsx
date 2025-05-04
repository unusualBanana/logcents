"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase-client";
import { setAuthToken } from "@/store/authStore";

const TokenSync = () => {
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (authUser) => {
      if (authUser) {
        const token = await authUser.getIdToken();
        await setAuthToken(token);
      } else {
        await setAuthToken("");
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default TokenSync;