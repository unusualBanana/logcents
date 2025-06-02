import { LoginForm } from "@/components/auth/login-form";
import { isTokenValid } from "@/lib/firebase/auth-utilities";
import { GalleryVerticalEnd } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function LoginPage() {
  const isAuthenticated = await isTokenValid();
  if (isAuthenticated) redirect("/");

  return (
    <div className="min-h-svh flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <Card>
          <CardContent className="p-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
