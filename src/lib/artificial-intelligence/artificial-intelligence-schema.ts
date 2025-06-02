import { z } from "zod";

// Define the base schema without categories
export const baseReceiptSchema = z.object({
  success: z.boolean(),
  title: z
    .string()
    .describe(
      "Carefully analyze the input. Detect and extract the main title — typically the store name, or if not available, a key product name. Ensure the result is concise and accurately reflects the most prominent text."
    ),
  description: z
    .string()
    .describe(
      "Analyze the description carefully. Extract and identify each item purchased, along with its main category if available. Reformat into multiple lines, listing one item per line, for clear and easy reading."
    ),
  date: z
    .string()
    .describe(
      "Extract the transaction date. Interpret it correctly based on local date format (e.g., DD.MM.YY) and convert it to ISO format: YYYY-MM-DD. Ensure the year is accurate and not misread as the day or month."
    ),
  categoryName: z.string(),
  paymentType: z
    .enum(["credit", "debit", "cash", "other"])
    .describe("Payment type"),
  total: z.number(),
  url: z.string().optional(),
});

// Export the type for use elsewhere
export type ReceiptAnalysis = z.infer<typeof baseReceiptSchema>;

// Helper function to create the complete schema with categories
export function createTransactionSchema(
  categoryNames: string[],
  currency: string
) {
  return baseReceiptSchema.extend({
    categoryName: z
      .string()
      .describe(
        "The main category of the transaction, default to 'general' if not available. The category must be one of the following: " +
          categoryNames.join(", ")
      ),
    total: z
      .number()
      .describe(
        `Extract the total amount. The amount should be in ${currency} currency format. Return it as a full numeric value exactly as shown, without converting it to a decimal or changing its format. Do not round or shorten the number.`
      ),
  });
}
