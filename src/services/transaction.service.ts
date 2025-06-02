import { adminDb } from "@/lib/firebase/firebase-admin";
import { getUserId } from "@/lib/firebase/auth-utilities";
import { TransactionsTable, Transaction } from "@/lib/models/transaction";
import { UsersTable } from "@/lib/models/user";
import { FieldValue } from "firebase-admin/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { analyzeImageWithAI } from "@/lib/artificial-intelligence/receipt-image";
import { analyzeAudioWithAI } from "@/lib/artificial-intelligence/recorder-transcribe";

const getUserTransactionsCollection = (userId: string) => {
  return adminDb
    .collection(UsersTable)
    .doc(userId)
    .collection(TransactionsTable);
};

export const transactionService = {
  async addTransaction(transaction: Transaction) {
    try {
      const userId = await getUserId();
      const transactionsCollection = getUserTransactionsCollection(userId);
      const transactionDoc = transactionsCollection.doc();

      await transactionDoc.set({
        ...transaction,
        id: transactionDoc.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
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
  },

  async deleteTransaction(transactionId: string) {
    try {
      if (!transactionId) {
        return {
          success: false,
          error: "Transaction ID is required",
        };
      }

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
  },

  async updateTransaction(transactionId: string, transaction: Transaction) {
    try {
      if (!transactionId) {
        return {
          success: false,
          error: "Transaction ID is required",
        };
      }

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
  },

  async uploadReceipt(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file uploaded");
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
      url: uploadResult?.url,
    };
  },

  async transcribeAudio(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the audio with AI
    const result = await analyzeAudioWithAI(buffer, file.type);
    if (!result.object.success) {
      throw new Error("Failed to transcribe audio");
    }

    return result.object;
  },

  async getDailySpendingComparison() {
    try {
      const userId = await getUserId();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const todayTransactionsSnapshot = await adminDb
        .collection(`users/${userId}/transactions`)
        .where("date", ">=", today)
        .where("date", "<", tomorrow)
        .get();

      let todayTotal = 0;
      todayTransactionsSnapshot.forEach((doc) => {
        todayTotal += doc.data().amount || 0;
      });

      const yesterdayTransactionsSnapshot = await adminDb
        .collection(`users/${userId}/transactions`)
        .where("date", ">=", yesterday)
        .where("date", "<", today)
        .get();

      let yesterdayTotal = 0;
      yesterdayTransactionsSnapshot.forEach((doc) => {
        yesterdayTotal += doc.data().amount || 0;
      });

      let percentageChange = 0;
      if (yesterdayTotal > 0) {
        percentageChange =
          ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
      }

      return {
        success: true,
        todayTotal,
        yesterdayTotal,
        percentageChange,
      };
    } catch (error) {
      console.error("Error getting daily spending comparison:", error);
      return {
        success: false,
        error: "Failed to get daily spending comparison",
      };
    }
  },

  async getWeeklySpendingComparison() {
    try {
      const userId = await getUserId();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfWeek.getDate() - 7);

      const endOfLastWeek = new Date(startOfWeek);

      const currentWeekTransactionsSnapshot = await adminDb
        .collection(`users/${userId}/transactions`)
        .where("date", ">=", startOfWeek)
        .where("date", "<", endOfWeek)
        .get();

      let currentWeekTotal = 0;
      currentWeekTransactionsSnapshot.forEach((doc) => {
        currentWeekTotal += doc.data().amount || 0;
      });

      const lastWeekTransactionsSnapshot = await adminDb
        .collection(`users/${userId}/transactions`)
        .where("date", ">=", startOfLastWeek)
        .where("date", "<", endOfLastWeek)
        .get();

      let lastWeekTotal = 0;
      lastWeekTransactionsSnapshot.forEach((doc) => {
        lastWeekTotal += doc.data().amount || 0;
      });

      let percentageChange = 0;
      if (lastWeekTotal > 0) {
        percentageChange =
          ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      }

      return {
        success: true,
        currentWeekTotal,
        lastWeekTotal,
        percentageChange,
      };
    } catch (error) {
      console.error("Error getting weekly spending comparison:", error);
      return {
        success: false,
        error: "Failed to get weekly spending comparison",
      };
    }
  },

  async getMonthlySpendingComparison() {
    try {
      const userId = await getUserId();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const startOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      const currentMonthTransactionsSnapshot = await adminDb
        .collection(`users/${userId}/transactions`)
        .where("date", ">=", startOfMonth)
        .where("date", "<", endOfMonth)
        .get();

      let currentMonthTotal = 0;
      currentMonthTransactionsSnapshot.forEach((doc) => {
        currentMonthTotal += doc.data().amount || 0;
      });

      const lastMonthTransactionsSnapshot = await adminDb
        .collection(`users/${userId}/transactions`)
        .where("date", ">=", startOfLastMonth)
        .where("date", "<", endOfLastMonth)
        .get();

      let lastMonthTotal = 0;
      lastMonthTransactionsSnapshot.forEach((doc) => {
        lastMonthTotal += doc.data().amount || 0;
      });

      let percentageChange = 0;
      if (lastMonthTotal > 0) {
        percentageChange =
          ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      }

      return {
        success: true,
        currentMonthTotal,
        lastMonthTotal,
        percentageChange,
      };
    } catch (error) {
      console.error("Error getting monthly spending comparison:", error);
      return {
        success: false,
        error: "Failed to get monthly spending comparison",
      };
    }
  },
};
