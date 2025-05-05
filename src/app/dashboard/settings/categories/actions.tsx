"use server";

import { adminDb } from "@/lib/firebase/firebase-admin";
import { ExpenseCategory } from "@/lib/models/expense-category";
import { getUserId } from "@/lib/firebase/auth-utilities";

const getUserCategoriesCollection = async () => {
  const userId = await getUserId();
  return adminDb.collection(`users/${userId}/categories`);
};

export async function addCategory(category: ExpenseCategory) {
  const categoriesCollection = await getUserCategoriesCollection();
  const categoryDoc = categoriesCollection.doc();

  category.createdAt = new Date();
  category.updatedAt = new Date();
  category.id = categoryDoc.id;

  await categoryDoc.set({
    ...category,
    order: category.order, // Ensure the `order` property is saved in the database
  });
}

export async function updateCategory(category: ExpenseCategory) {
  const categoriesCollection = await getUserCategoriesCollection();
  const categoryDoc = categoriesCollection.doc(category.id!);

  category.updatedAt = new Date();

  await categoryDoc.update({
    ...category,
    order: category.order, // Ensure the `order` property is updated in the database
  });
}

export async function deleteCategory(categoryId: string) {
  const categoriesCollection = await getUserCategoriesCollection();
  const categoryDoc = categoriesCollection.doc(categoryId);
  await categoryDoc.delete();
}
