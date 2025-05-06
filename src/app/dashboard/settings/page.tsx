"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop, ChevronDown } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CategorySettingsCard from "@/components/settings/categories/category-settings-card";
import CurrencySettingsCard from "@/components/settings/currency/currency-settings-card";

// Context
import { useAuthStore } from "@/store/authStore";

// Types
type ThemeOption = "light" | "dark" | "system";
type ThemeProps = {
  mounted: boolean;
  currentTheme: string;
  setTheme: (theme: string) => void;
};

// Theme Components
const ThemeIcon = ({
  mounted,
  currentTheme,
}: {
  mounted: boolean;
  currentTheme: string;
}) => {
  if (!mounted) return null;

  if (currentTheme === "light") return <Sun className="h-4 w-4" />;
  if (currentTheme === "dark") return <Moon className="h-4 w-4" />;
  return <Laptop className="h-4 w-4" />;
};

const ThemeSelector = ({ mounted, currentTheme, setTheme }: ThemeProps) => {
  const themeText = !mounted
    ? "Theme"
    : currentTheme === "light"
    ? "Light"
    : currentTheme === "dark"
    ? "Dark"
    : "System";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <ThemeIcon mounted={mounted} currentTheme={currentTheme} />
            {themeText}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={currentTheme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light" className="gap-2">
              <Sun className="h-4 w-4" />
              Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className="gap-2">
              <Moon className="h-4 w-4" />
              Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" className="gap-2">
              <Laptop className="h-4 w-4" />
              System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Settings Card Components
const DisplaySettingsCard = ({
  mounted,
  currentTheme,
  setTheme,
}: ThemeProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Display Settings</CardTitle>
      <CardDescription>
        Customize the appearance of the application
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <ThemeSelector
        mounted={mounted}
        currentTheme={currentTheme}
        setTheme={setTheme}
      />
    </CardContent>
  </Card>
);

const AccountSettingsCard = ({
  onLogoutClick,
}: {
  onLogoutClick: () => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Account</CardTitle>
      <CardDescription>Manage your account settings</CardDescription>
    </CardHeader>
    <CardContent>
      <Button
        className="cursor-pointer"
        variant="destructive"
        onClick={onLogoutClick}
      >
        Logout
      </Button>
    </CardContent>
  </Card>
);

// Dialog Components
const LogoutConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
        <AlertDialogDescription>
          This will log you out of your account and redirect you to the login
          page.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Logout</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Main Settings Page Component
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(
    "light" as ThemeOption
  );
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setCurrentTheme((theme as ThemeOption) || "light");
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <DisplaySettingsCard
        mounted={mounted}
        currentTheme={currentTheme}
        setTheme={setTheme}
      />

      <CategorySettingsCard />

      <CurrencySettingsCard />

      <AccountSettingsCard onLogoutClick={() => setLogoutDialogOpen(true)} />

      <LogoutConfirmationDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />

      {/* Sync Components */}
    </div>
  );
}
