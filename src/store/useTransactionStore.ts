import { create } from "zustand";
import { Timestamp } from "firebase/firestore";
import { Transaction } from "@/lib/models/transaction";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-client";

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  hasMore: boolean;
  lastVisible: Timestamp | null;
  fetchTransactions: (userId: string, nextPage?: boolean) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  hasMore: true,
  lastVisible: null,

  fetchTransactions: async (userId: string, nextPage = false) => {
    set({ loading: true });
    try {
      const { transactions, lastVisible } = get();
      const baseQuery = query(
        collection(db, `users/${userId}/transactions`),
        orderBy("date", "desc"),
        limit(10),
        ...(nextPage && lastVisible ? [startAfter(lastVisible)] : [])
      );

      const snapshot = await getDocs(baseQuery);
      const newTransactions = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        receiptUrl: doc.data().receiptUrl || "",
        date: doc.data().date.toDate(), // Convert Firestore Timestamp to Date
      })) as Transaction[];

      set({
        transactions: nextPage ? [...transactions, ...newTransactions] : newTransactions,
        hasMore: newTransactions.length === 10,
        lastVisible: snapshot.docs[snapshot.docs.length - 1]?.data().date || null,
      });
    } catch (error) {
      console.error("Error fetching transactions", error);
    } finally {
      set({ loading: false });
    }
  },
}));