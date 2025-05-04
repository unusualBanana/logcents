import { Timestamp } from "firebase-admin/firestore";

export const NotesTable = "notes";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};