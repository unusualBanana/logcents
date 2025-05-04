"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/firebase-client";

export default function DashboardPage() {
  const refreshToken = async () => {
    const user = auth.currentUser;
    await auth.updateCurrentUser(user);
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Dashboard Page</h1>
      <Button onClick={refreshToken}>Refresh Token</Button>
    </div>
  );
}
