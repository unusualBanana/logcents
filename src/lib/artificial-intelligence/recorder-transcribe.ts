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
        "Return false unless the audio mentions a price, total cost, or any number related to spending."
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
            text: `Analyze the attached audio file. Extract key details about a transaction. The amount should be interpreted in ${currency} currency format.`,
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
