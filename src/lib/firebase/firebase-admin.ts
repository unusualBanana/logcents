import { credential } from "firebase-admin";
import { getApps, ServiceAccount, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
} as ServiceAccount;

const appCredential =
  process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_ENABLED === "true"
    ? credential.applicationDefault()
    : credential.cert(serviceAccount);

const app =
  getApps()[0] ||
  initializeApp({
    credential: appCredential,
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
