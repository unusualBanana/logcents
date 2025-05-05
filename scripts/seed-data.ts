import { loadEnvConfig } from "@next/env";
import { FieldValue } from "firebase-admin/firestore";
import { faker } from "@faker-js/faker";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { adminDb } from "../src/lib/firebase/firebase-admin";

// Check if we should use emulator
const useEmulator = process.env.USE_FIREBASE_EMULATOR === "true";
console.log(`Firebase emulator mode: ${useEmulator ? "enabled" : "disabled"}`);

// Table names from models
const UsersTable = "users";
const TransactionsTable = "transactions";

// Configure how many fake transactions to generate
const NUM_TRANSACTIONS = 100;
const USER_ID = ""; // Replace with your test user ID

// Generate random transaction data using faker
const generateFakeTransactions = (count: number) => {
  const transactions = [];

  // Generate transactions for the past 6 months
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  for (let i = 0; i < count; i++) {
    const hasReceipt = Math.random() > 0.7; // 30% chance of having a receipt

    transactions.push({
      name: faker.food.dish(),
      description: faker.food.description(),
      amount: faker.number.int({ min: 1, max: 300 }) * 1000,
      categoryId: "general",
      date: faker.date.between({ from: startDate, to: new Date() }),
      receiptUrl: hasReceipt
        ? faker.image.urlPicsumPhotos({
            blur: 0,
            grayscale: false,
            height: faker.number.int({ min: 100, max: 500 }),
            width: faker.number.int({ min: 100, max: 500 }),
          })
        : "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return transactions;
};

// Seed transactions for a specific user
const seedTransactions = async (userId: string) => {
  console.log(`Seeding ${NUM_TRANSACTIONS} transactions for user: ${userId}`);

  const fakeTransactions = generateFakeTransactions(NUM_TRANSACTIONS);
  const batch = adminDb.batch();

  // Get reference to the user's transactions subcollection
  const userTransactionsRef = adminDb
    .collection(UsersTable)
    .doc(userId)
    .collection(TransactionsTable);

  for (const transaction of fakeTransactions) {
    const docRef = userTransactionsRef.doc();
    batch.set(docRef, {
      id: docRef.id,
      ...transaction,
    });
    console.log(
      `Prepared transaction: ${transaction.name} (${transaction.amount})`
    );
  }

  await batch.commit();
  console.log("Transactions seeding complete!");
};

// Run the seeding with improved error handling
const seedDatabase = async () => {
  try {
    // Check if user exists first
    const userRef = adminDb.collection(UsersTable).doc(USER_ID);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`User ${USER_ID} doesn't exist. Creating user document...`);
      await userRef.set({
        id: USER_ID,
        email: "test@example.com",
        preferences: {
          categories: [],
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`Created user ${USER_ID}`);
    }

    // Seed transactions for the user
    await seedTransactions(USER_ID);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

// Execute the seeding function
seedDatabase();
