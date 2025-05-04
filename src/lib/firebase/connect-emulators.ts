import { Auth, connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator, Firestore } from "firebase/firestore";

export function connectEmulators({ auth, db }: { auth: Auth; db: Firestore }) {
  // Check if we are in development mode
  if (process.env.NODE_ENV !== "development") return;

  console.log("🔌 Connecting to Firebase Emulators...");

  if (auth) {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
  }
  if (db) {
    connectFirestoreEmulator(db, "localhost", 8080);
  }
}
