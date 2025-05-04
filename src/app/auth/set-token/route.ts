import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";
import { User, UsersTable } from "@/lib/models/user";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (token === undefined || token === null) {
    // Clear token functionality
    const res = NextResponse.json({
      success: true,
      message: "Token cleared successfully",
    });
    res.cookies.delete("token");
    return res;
  }

  if (!token) {
    return NextResponse.json({ success: false, message: "Token is required" });
  }

  // Verify token
  const decodedToken = await adminAuth.verifyIdToken(token);
  const { uid, email } = decodedToken;

  if (!email) {
    return NextResponse.json({
      success: false,
      message: "Email is required",
    });
  }

  const userData = {
    id: uid,
    email: email,
  } as User;
  await userCollectionUpsert(userData);

  const res = NextResponse.json({
    success: true,
    message: "Token set successfully",
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}

const userCollectionUpsert = async (user: User) => {
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
};
