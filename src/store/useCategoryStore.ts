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

interface CategoryState {
  categories: ExpenseCategory[];
  fetchCategories: (userId: string) => Promise<void>;
  addCategory: (category: ExpenseCategory) => Promise<void>;
  updateCategory: (category: ExpenseCategory) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>()(
  devtools((set) => ({
    categories: [...DEFAULT_CATEGORIES],
    fetchCategories: async (userId) => {
      try {
        const categoriesCollection = collection(
          db,
          `users/${userId}/categories`
        );
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
      await addCategory(category);
      set((state) => ({ categories: [...state.categories, category] }));
    },
    updateCategory: async (category: ExpenseCategory) => {
      await updateCategory(category);
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === category.id ? { ...cat, ...category } : cat
        ),
      }));
    },
    deleteCategory: async (categoryId) => {
      await deleteCategory(categoryId);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== categoryId),
      }));
    },
  }))
);
