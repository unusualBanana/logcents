import { z } from "zod";

export const TransactionsTable = "transactions";

export type Transaction = {
  id: string;
  name: string;
  description: string;
  amount: number;
  categoryId: string;  // Reference to the category ID
  receiptUrl?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export const transactionZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  amount: z.number(),
  categoryId: z.string(),
  receiptUrl: z.string().optional(),
  date: z.date(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
