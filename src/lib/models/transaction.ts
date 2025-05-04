export const TransactionsTable = "transactions";

export type Transaction = {
  id: string;
  name: string;
  description: string;
  amount: number;
  categoryId: string;  // Reference to the category ID
  receiptUrl?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};
