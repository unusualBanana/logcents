import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./firebase-admin";

export const verifyToken = async () => {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) redirect("/");

  try {
    await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.log("Token verification failed:", error);

    redirect("/");
  }
};

export const isTokenValid = async () => {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) return false;

  try {
    await adminAuth.verifyIdToken(token);
    return true;
  } catch (error) {
    console.log("Token verification failed:", error);
    return false;
  }
};

export const getUserId = async () => {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    throw new Error("Token is not set");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.log("Token verification failed:", error);
    throw new Error("Token verification failed");
  }
}
