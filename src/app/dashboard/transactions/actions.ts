"use server";

import { transactionService } from "@/services/transaction.service";
import { Transaction } from "@/lib/models/transaction";

/**
 * Server action to add a new transaction
 */
export async function addTransaction(transaction: Transaction) {
  return transactionService.addTransaction(transaction);
}

/**
 * Server action to delete a transaction
 */
export async function deleteTransaction(transactionId: string) {
  return transactionService.deleteTransaction(transactionId);
}

/**
 * Server action to update an existing transaction
 */
export async function updateTransaction(transactionId: string, transaction: Transaction) {
  return transactionService.updateTransaction(transactionId, transaction);
}

/**
 * Server action to upload and analyze a receipt
 */
export async function uploadReceipt(formData: FormData) {
  return transactionService.uploadReceipt(formData);
}