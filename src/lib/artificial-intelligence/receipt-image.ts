import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { adminDb } from "../firebase/firebase-admin";
import { getUserId } from "../firebase/auth-utilities";
import { ExpenseCategory } from "../models/expense-category";
import { User } from "../models/user";
import { SupportedCurrenciesMap } from "../models/currency-setting";

// Define the base schema without categories
const baseReceiptSchema = z.object({
  success: z
    .boolean()
    .describe("Whether the image was successfully analyzed")
    .default(true),
  title: z
    .string()
    .describe(
      "Carefully analyze the attached receipt image. Detect and extract the main title — typically the store name, or if not available, a key product name. Ensure the result is concise and accurately reflects the most prominent text."
    ),
  description: z
    .string()
    .describe(
      "Analyze the receipt description carefully. Extract and identify each item purchased, along with its main category if available. Reformat the receipt into multiple lines, listing one item per line, for clear and easy reading."
    ),
  date: z
    .string()
    .describe(
      "Extract the transaction date from the receipt. Interpret it correctly based on local date format (e.g., DD.MM.YY) and convert it to ISO format: YYYY-MM-DD. Ensure the year is accurate and not misread as the day or month."
    ),
  categoryName: z.string(),
  paymentType: z
    .enum(["credit", "debit", "cash", "other"])
    .describe("Payment type"),
  total: z
    .number(),
  url: z.string().optional(),
});

// Export the type for use elsewhere
export type ReceiptAnalysis = z.infer<typeof baseReceiptSchema>;

// Function to analyze image with AI
export async function analyzeImageWithAI(
  imageBuffer: Buffer,
  fileType: string
) {
  // get categories from db
  const userId = await getUserId();
  const userDoc = await adminDb.collection("users").doc(userId).get();
  const userData = userDoc.data() as User | undefined;
  const currencySetting = userData?.preferences?.currency || SupportedCurrenciesMap.USD

  const userCategories = await adminDb
    .collection("users")
    .doc(userId)
    .collection("categories")
    .get();
  const categories = userCategories.docs.map((doc) =>
    doc.data()
  ) as ExpenseCategory[];
  const categoryNames = categories.map((category) => category.name);

  // Create the complete schema with categories
  const receiptAnalysisSchema = baseReceiptSchema.extend({
    categoryName: z
      .string()
      .describe(
        "The main category of the transaction, default to 'general' if not available. The category must be one of the following: " +
          categoryNames.join(", ")
      ),
    total: z
      .number()
      .describe(
        `Extract the total amount from the receipt. The amount should be in ${currencySetting.currency} currency format. Return it as a full numeric value exactly as shown, without converting it to a decimal or changing its format. Do not round or shorten the number.`
      ),
  });

  return generateObject({
    model: google("gemini-1.5-flash-latest"),
    schema: receiptAnalysisSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze the attached receipt image. Extract key details. The receipt amount should be interpreted in ${currencySetting.currency} currency format.`,
          },
          {
            type: "image",
            image: imageBuffer,
            mimeType: fileType,
          },
        ],
      },
    ],
  });
}
