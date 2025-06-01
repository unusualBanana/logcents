import { userService } from "@/services/user.service";
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

  try {
    // Verify token and get user data
    const verificationResult = await userService.verifyToken(token);
    if (!verificationResult.success) {
      return NextResponse.json({
        success: false,
        message: verificationResult.error,
      });
    }

    const { uid, email } = verificationResult;
    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    // Upsert user data
    await userService.upsertUser({
      id: uid,
      email: email,
    });

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
  } catch (error) {
    console.error("Error setting token:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to set token",
    });
  }
}
