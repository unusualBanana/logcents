"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ShieldUser } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    error,
    setError,
    loading,
    signInWithGoogle,
    loginWithEmail,
    signUpWithEmail,
  } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (isSignUp) {
      await signUpWithEmail(email, password);
    } else {
      await loginWithEmail(email, password);
    }

    if (!error) {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      {isSignUp ? (
        <div className="grid gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Register Now!</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to create your account
            </p>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full cursor-pointer">
            Sign Up
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a
              href="#"
              onClick={() => setIsSignUp(false)}
              className="underline underline-offset-4"
            >
              Login
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-6">
            {error && (
              <Alert variant="destructive">
                <ShieldUser className="h-4 w-4" />
                <AlertTitle className="font-bold">Login</AlertTitle>
                <AlertDescription>Error: {error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {/* <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a> */}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className={cn("w-full cursor-pointer", loading && "opacity-50")}
            >
              Login
            </Button>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>
            <Button
              variant="outline"
              type="button"
              disabled={loading || isGoogleLoading}
              className={cn("w-full cursor-pointer", (loading || isGoogleLoading) && "opacity-50")}
              onClick={async () => {
                setIsGoogleLoading(true);
                try {
                  await signInWithGoogle();
                  await router.push("/dashboard");
                } catch (error) {
                  setError(`Failed to sign in with Google: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  setIsGoogleLoading(false);
                }
              }}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="#"
              onClick={() => setIsSignUp(true)}
              className="underline underline-offset-4"
            >
              Sign up
            </a>
          </div>
        </div>
      )}
    </form>
  );
}
