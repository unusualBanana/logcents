import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { userService } from "@/services/user.service";

export const verifyToken = async () => {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) redirect("/");

  try {
    const isValid = await userService.verifyToken(token);
    if (!isValid.success) {
      redirect("/");
    }
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
    const checkToken =  await userService.verifyToken(token);

    if (!checkToken.success) {
      return false;
    }

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
    return await userService.getUserIdFromToken(token);
  } catch (error) {
    console.log("Token verification failed:", error);
    throw new Error("Token verification failed");
  }
};
