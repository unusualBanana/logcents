import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { SupportedCurrenciesMap } from "../models/currency-setting";
import { categoryService } from "@/services/category.service";
import { currencyService } from "@/services/currency.service";
import { createTransactionSchema } from "./artificial-intelligence-schema";

// Function to analyze image with AI
export async function analyzeImageWithAI(
  imageBuffer: Buffer,
  fileType: string
) {
  // get categories and currency settings
  const { categories } = await categoryService.getAllCategories();
  const { currencySetting } = await currencyService.getCurrencySetting();
  const defaultCurrency = SupportedCurrenciesMap.USD;

  const categoryNames = categories.map((category) => category.name);
  const currency = currencySetting?.currency || defaultCurrency.currency;

  return generateObject({
    model: google("gemini-1.5-flash-latest"),
    schema: createTransactionSchema(categoryNames, currency),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze the attached receipt image. Extract key details. The receipt amount should be interpreted in ${currency} currency format.`,
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
