export type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
  order: number; // Added order property
};

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  {
    id: "general",
    name: "General",
    color: "#6E56CF", // Default purple color
    order: 0, // Default order value
  },
];
