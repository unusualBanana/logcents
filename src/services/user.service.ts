import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";
import { User, UsersTable } from "@/lib/models/user";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const userService = {
  async verifyToken(token: string) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      return {
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    } catch (error) {
      console.error("Token verification failed:", error);
      return {
        success: false,
        error: "Token verification failed",
      };
    }
  },

  async getUserIdFromToken(token: string) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new Error("Token verification failed");
    }
  },

  async upsertUser(user: User) {
    const userRef = adminDb.collection(UsersTable).doc(user.id);
    const userSnapshot = await userRef.get();

    const userData: Partial<User> = {
      email: user.email,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
    };

    if (!userSnapshot.exists) {
      userData.createdAt = FieldValue.serverTimestamp() as Timestamp;
    }

    await userRef.set(userData, { merge: true });
  }
}; 