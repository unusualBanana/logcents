import { isTokenValid } from "@/lib/firebase/auth-utilities";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if the user is authenticated
  const isAuthenticated = await isTokenValid();

  redirect(isAuthenticated ? "/dashboard" : "/login");
}
