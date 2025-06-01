import { create } from "zustand";
import {
  ExpenseCategory,
  DEFAULT_CATEGORIES,
} from "@/lib/models/expense-category";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-client";
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/app/dashboard/settings/categories/actions";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/store/authStore";

interface CategoryState {
  categories: ExpenseCategory[];
  fetchCategories: () => Promise<void>;
  addCategory: (category: ExpenseCategory) => Promise<void>;
  updateCategory: (category: ExpenseCategory) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

const getUserId = () => {
  const userId = useAuthStore.getState().user?.uid;
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
};

export const useCategoryStore = create<CategoryState>()(
  devtools((set, get) => ({
    categories: [...DEFAULT_CATEGORIES],

    fetchCategories: async () => {
      try {
        const userId = getUserId();
        const categoriesCollection = collection(db, `users/${userId}/categories`);
        const snapshot = await getDocs(categoriesCollection);

        const userCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ExpenseCategory[];

        set({ categories: [...DEFAULT_CATEGORIES, ...userCategories] });
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },

    addCategory: async (category) => {
      try {
        await addCategory(category);
        await get().fetchCategories();
      } catch (error) {
        console.error("Error adding category:", error);
      }
    },

    updateCategory: async (category) => {
      try {
        await updateCategory(category);
        await get().fetchCategories();
      } catch (error) {
        console.error("Error updating category:", error);
      }
    },

    deleteCategory: async (categoryId) => {
      try {
        await deleteCategory(categoryId);
        await get().fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },
  }))
);
