import NavigationBar from "@/components/navigation/navigation-bar";
import { verifyToken } from "@/lib/firebase/auth-utilities";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await verifyToken();

  return (
    <main>
      <NavigationBar />
      <div className="pt-0 md:pt-16 pb-16 md:pb-0">{children}</div>
    </main>
  );
}
