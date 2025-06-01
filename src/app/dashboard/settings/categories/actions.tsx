"use server";

import { categoryService } from "@/services/category.service";
import { ExpenseCategory } from "@/lib/models/expense-category";

export async function addCategory(category: ExpenseCategory) {
  return categoryService.addCategory(category);
}

export async function updateCategory(category: ExpenseCategory) {
  return categoryService.updateCategory(category);
}

export async function deleteCategory(categoryId: string) {
  return categoryService.deleteCategory(categoryId);
}
