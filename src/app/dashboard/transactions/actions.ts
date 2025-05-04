"use server";

import { getUserId } from "@/lib/firebase/auth-utilities";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { TransactionsTable } from "@/lib/models/transaction";
import { UsersTable } from "@/lib/models/user";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Server action to add a new transaction
 */
export async function addTransaction(formData: FormData) {
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const receiptUrl = formData.get("receiptUrl") as string;

  if (!name || isNaN(amount) || !date) {
    return {
      error: "Name, amount, and date are required",
    };
  }

  const transaction = {
    name,
    amount,
    date: new Date(date), // Use plain Date
    description,
    receiptUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save the transaction to Firestore
  await adminDb
    .collection(UsersTable)
    .doc(await getUserId())
    .collection(TransactionsTable)
    .add(transaction);

  return {
    success: true,
  };
}

/**
 * Server action to delete a transaction
 */
export async function deleteTransaction(transactionId: string) {
  try {
    if (!transactionId) {
      return {
        success: false,
        error: "Transaction ID is required",
      };
    }

    // Delete the transaction using Firebase Admin
    await adminDb
      .collection(UsersTable)
      .doc(await getUserId())
      .collection(TransactionsTable)
      .doc(transactionId)
      .delete();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return {
      success: false,
      error: "Failed to delete transaction",
    };
  }
}

/**
 * Server action to update an existing transaction
 */
export async function updateTransaction(transactionId: string, formData: FormData) {
  try {
    if (!transactionId) {
      return {
        success: false,
        error: "Transaction ID is required",
      };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const date = formData.get("date") as string;

    if (!name || isNaN(amount) || !date) {
      return {
        success: false,
        error: "Name, amount, and date are required",
      };
    }

    // Update the transaction in Firestore using Firebase Admin
    await adminDb
      .collection(UsersTable)
      .doc(await getUserId())
      .collection(TransactionsTable)
      .doc(transactionId)
      .update({
        name,
        description: description || "",
        amount,
        date: new Date(date),
        updatedAt: FieldValue.serverTimestamp(),
      });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return {
      success: false,
      error: "Failed to update transaction",
    };
  }
}