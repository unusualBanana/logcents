import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { SupportedCurrenciesMap } from "../models/currency-setting";
import { categoryService } from "@/services/category.service";
import { currencyService } from "@/services/currency.service";
import { createTransactionSchema } from "./artificial-intelligence-schema";
import { z } from "zod";

export async function analyzeAudioWithAI(
  audioBuffer: Buffer,
  mimeType: string
) {
  // get categories and currency settings
  const { categories } = await categoryService.getAllCategories();
  const { currencySetting } = await currencyService.getCurrencySetting();
  const defaultCurrency = SupportedCurrenciesMap.USD;

  const categoryNames = categories.map((category) => category.name);
  const currency = currencySetting?.currency || defaultCurrency.currency;

  const customAudioSchema = createTransactionSchema(
    categoryNames,
    currency
  ).extend({
    success: z
      .boolean()
      .describe(
        "Return false if the audio is empty, unclear, or contains no mention of any price, total cost, or number related to spending. Return true only if there is a clear indication of a transaction with a specific amount."
      ),
    title: z
      .string()
      .describe(
        "If the audio explicitly mentions a store name, extract it. If not, extract the name of the product, service, or transaction purpose mentioned. Do not guess or assume anything not directly stated in the audio."
      ),
    description: z
      .string()
      .describe(
        "Only list items that are explicitly mentioned in the audio. If no items are mentioned, return an empty string. Do not make assumptions about items."
      ),
    date: z
      .string()
      .describe(
        "Only extract the date if explicitly mentioned in the audio. If no date is mentioned, return an empty string. Do not guess or assume dates."
      ),
    total: z
      .number()
      .describe(
        `Only extract the total amount if explicitly mentioned in the audio. If no amount is mentioned, return 0. When an amount is mentioned, it should be in ${currency} currency format. Return it as a full numeric value exactly as shown, without converting it to a decimal or changing its format. Do not round or shorten the number.`
      ),
    categoryName: z
      .string()
      .describe(
        "Only specify a category if the transaction type is clearly mentioned in the audio. If not clear, return 'general'. The category must be one of the following: " +
          categoryNames.join(", ")
      ),
    paymentType: z
      .enum(["credit", "debit", "cash", "other"])
      .describe(
        "Only specify payment type if explicitly mentioned in the audio. If not mentioned, return 'other'. Do not make assumptions about payment method."
      ),
  });

  return generateObject({
    model: google("gemini-1.5-flash-latest"),
    schema: customAudioSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze the attached audio file. Extract key details about a transaction ONLY if there is a clear mention of a price or total amount. If no price or amount is mentioned, return success: false. The amount should be interpreted in ${currency} currency format. Do not make assumptions or generate placeholder data when no clear transaction is detected.`,
          },
          {
            type: "file",
            mimeType: mimeType,
            data: audioBuffer,
          },
        ],
      },
    ],
  });
}
