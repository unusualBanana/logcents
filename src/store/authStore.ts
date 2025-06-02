import { create } from "zustand";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase/firebase-client";
import posthog from "posthog-js";

export const setAuthToken = async (token: string | null) => {
  await fetch("/auth/set-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
};

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string;
  setError: (error: string) => void;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    loading: true,
    error: "",

    setError: (error: string) => set({ error }),

    signInWithGoogle: async () => {
      set({ error: "" });
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          await setAuthToken(await result.user.getIdToken(true));
          set({ user: result.user });
        }
      } catch (error) {
        const err = error as { message?: string; code?: string };
        console.error("Error signing in with Google", err);
        set({ error: err.message || "Failed to sign in with Google" });
      }
    },

    loginWithEmail: async (email: string, password: string) => {
      set({ error: "" });
      try {
        if (!email || !password) {
          set({ error: "Email and password are required" });
          return;
        }
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (userCredential.user) {
          await setAuthToken(await userCredential.user.getIdToken(true));
          set({ user: userCredential.user });
        }
      } catch (error) {
        const err = error as { message?: string; code?: string };
        console.error("Error signing in with email/password", err);
        set({
          error:
            err.code === "auth/user-not-found" ||
            err.code === "auth/wrong-password"
              ? "Invalid email or password"
              : err.message || "Failed to login",
        });
      }
    },

    signUpWithEmail: async (email: string, password: string) => {
      set({ error: "" });
      try {
        if (!email || !password) {
          set({ error: "Email and password are required" });
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (userCredential.user) {
          await setAuthToken(await userCredential.user.getIdToken());
          set({ user: userCredential.user });
        }
      } catch (error) {
        const err = error as { message?: string; code?: string };
        console.error("Error signing up with email/password", err);
        set({
          error:
            err.code === "auth/email-already-in-use"
              ? "Email is already in use"
              : err.code === "auth/weak-password"
              ? "Password should be at least 6 characters"
              : err.message || "Failed to sign up",
        });
      }
    },

    logout: async () => {
      set({ error: "" });
      try {
        await Promise.all([setAuthToken(null), signOut(auth)]);

        set({ user: null });
      } catch (error) {
        const err = error as { message?: string };
        console.error("Error signing out", err);
        set({ error: err.message || "Failed to sign out" });
      }
    },

    // Initialize auth state
    initAuthState: (() => {
      onAuthStateChanged(auth, (authUser) => {
        if (process.env.NODE_ENV === 'production') {
          if (authUser) {
            posthog.identify(authUser.uid, {
              email: authUser.email,
              name: authUser.displayName,
            });
          } else {
            posthog.reset();
          }
        }
        set({ user: authUser, loading: false });
      });
    })(),
  };
});
