import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: "Token cleared successfully",
  });

  res.cookies.delete("token")

  return res;
}
