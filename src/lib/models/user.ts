import { Timestamp } from "firebase-admin/firestore";

export const UsersTable = "users";

export type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
};

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  {
    id: "general",
    name: "General",
    color: "#6E56CF", // Default purple color
  },
];

export type UserPreferences = {
  categories: ExpenseCategory[];
};

export type User = {
  id: string; // same id as auth uid
  email: string;
  preferences?: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export const getDefaultUserPreferences = (): UserPreferences => {
  return {
    categories: [...DEFAULT_CATEGORIES],
  };
};
