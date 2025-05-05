"use server";

import { getUserId } from "@/lib/firebase/auth-utilities";
import { adminDb } from "@/lib/firebase/firebase-admin";
import { TransactionsTable, Transaction } from "@/lib/models/transaction";
import { UsersTable } from "@/lib/models/user";
import { FieldValue } from "firebase-admin/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { analyzeImageWithAI } from "@/lib/ai";

const getUserTransactionsCollection = (userId: string) => {
  return adminDb.collection(UsersTable).doc(userId).collection(TransactionsTable);
};

/**
 * Server action to add a new transaction
 */
export async function addTransaction(transaction: Transaction) {
  try {
    const userId = await getUserId();
    const transactionsCollection = getUserTransactionsCollection(userId);
    const transactionDoc = transactionsCollection.doc();

    await transactionDoc.set({
      ...transaction,
      id: transactionDoc.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      error: "",
    };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return {
      success: false,
      error: "Failed to add transaction",
    };
  }
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
    await getUserTransactionsCollection(await getUserId())
      .doc(transactionId)
      .delete();

    return {
      success: true,
      error: "",
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
export async function updateTransaction(transactionId: string, transaction: Transaction) {
  try {
    if (!transactionId) {
      return {
        success: false,
        error: "Transaction ID is required",
      };
    }

    // Update the transaction in Firestore using Firebase Admin
    await getUserTransactionsCollection(await getUserId())
      .doc(transactionId)
      .update({
        name: transaction.name,
        description: transaction.description || "",
        amount: transaction.amount,
        date: transaction.date,
        categoryId: transaction.categoryId,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      error: "",
    };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return {
      success: false,
      error: "Failed to update transaction",
    };
  }
}

/**
 * Server action to upload and analyze a receipt
 */
export async function uploadReceipt(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        error: "No file uploaded"
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Run both operations in parallel
    const [uploadResult, aiResponse] = await Promise.all([
      uploadImageToCloudinary(imageBuffer, await getUserId()),
      analyzeImageWithAI(imageBuffer, file.type),
    ]);

    return {
      ...aiResponse.object,
      url: uploadResult?.url
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      success: false,
      error: "Failed to process the image"
    };
  }
}