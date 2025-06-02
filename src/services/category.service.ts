import { adminDb } from "@/lib/firebase/firebase-admin";
import { getUserId } from "@/lib/firebase/auth-utilities";
import { ExpenseCategory } from "@/lib/models/expense-category";
import { FieldValue } from "firebase-admin/firestore";

const getUserCategoriesCollection = async () => {
  const userId = await getUserId();
  return adminDb.collection(`users/${userId}/categories`);
};

export const categoryService = {
  async getAllCategories() {
    try {
      const categoriesCollection = await getUserCategoriesCollection();
      const userCategories = await categoriesCollection.get();
      const categories = userCategories.docs.map((doc) => doc.data()) as ExpenseCategory[];
      return {
        success: true,
        categories,
        error: "",
      };
    } catch (error) {
      console.error("Error getting categories:", error);
      return {
        success: false,
        categories: [],
        error: "Failed to get categories",
      };
    }
  },

  async addCategory(category: ExpenseCategory) {
    try {
      const categoriesCollection = await getUserCategoriesCollection();
      const categoryDoc = categoriesCollection.doc();

      await categoryDoc.set({
        ...category,
        id: categoryDoc.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        error: "",
      };
    } catch (error) {
      console.error("Error adding category:", error);
      return {
        success: false,
        error: "Failed to add category",
      };
    }
  },

  async updateCategory(category: ExpenseCategory) {
    try {
      const categoriesCollection = await getUserCategoriesCollection();
      await categoriesCollection.doc(category.id).update({
        name: category.name,
        color: category.color,
        order: category.order,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        error: "",
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        success: false,
        error: "Failed to update category",
      };
    }
  },

  async deleteCategory(categoryId: string) {
    try {
      const categoriesCollection = await getUserCategoriesCollection();
      await categoriesCollection.doc(categoryId).delete();

      return {
        success: true,
        error: "",
      };
    } catch (error) {
      console.error("Error deleting category:", error);
      return {
        success: false,
        error: "Failed to delete category",
      };
    }
  }
}; 