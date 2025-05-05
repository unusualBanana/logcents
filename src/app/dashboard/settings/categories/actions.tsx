'use server';

import { adminDb } from '@/lib/firebase/firebase-admin';
import { ExpenseCategory } from '@/lib/models/expense-category';
import { getUserId } from '@/lib/firebase/auth-utilities';

const getUserCategoriesCollection = (userId: string) => {
  return adminDb.collection(`users/${userId}/categories`);
};

export async function addCategory(category: ExpenseCategory) {
  const userId = await getUserId();
  const categoriesCollection = getUserCategoriesCollection(userId);
  const categoryDoc = categoriesCollection.doc(category.id);
  await categoryDoc.set({
    ...category,
    order: category.order, // Ensure the `order` property is saved in the database
  });
}

export async function updateCategory(category: ExpenseCategory) {
  const userId = await getUserId();
  const categoriesCollection = getUserCategoriesCollection(userId);
  const categoryDoc = categoriesCollection.doc(category.id);
  await categoryDoc.update({
    ...category,
    order: category.order, // Ensure the `order` property is updated in the database
  });
}

export async function deleteCategory(categoryId: string) {
  const userId = await getUserId();
  const categoriesCollection = getUserCategoriesCollection(userId);
  const categoryDoc = categoriesCollection.doc(categoryId);
  await categoryDoc.delete();
}