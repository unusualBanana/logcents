import { Timestamp } from "firebase-admin/firestore";
import { ExpenseCategory } from "./expense-category";
import { CurrencySetting } from "./currency-setting";

export const UsersTable = "users";

export type UserPreferences = {
  categories: ExpenseCategory[];
  currency?: CurrencySetting;
};

export type User = {
  id: string; // same id as auth uid
  email: string;
  preferences?: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
