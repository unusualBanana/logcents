import { Home, BarChart2, FileText, Settings } from "lucide-react";
import ActiveNavLink from "./active-nav-link";

export default function NavigationBar() {
  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Transactions",
      href: "/dashboard/transactions",
      icon: BarChart2,
    },
    // {
    //   name: "Report",
    //   href: "/dashboard/report",
    //   icon: FileText,
    // },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed z-50 w-full bg-background shadow-sm transition-all duration-300 server-nav">
      {/* Desktop navigation */}
      <div className="container mx-auto px-4 hidden sm:block">
        <div className="flex items-center h-16">
          {/* Logo on the left */}
          <div className="flex-1">
            {/* <span className="text-xl font-bold">Expense Tracker</span> */}
          </div>

          {/* Centered navigation items */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <ActiveNavLink key={item.name} href={item.href}>
                  <div className="flex flex-row space-x-2 items-center">
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                </ActiveNavLink>
              ))}
            </div>
          </div>

          {/* User profile section */}
          <div className="flex-1 flex justify-end">
            {/* <Link href="/dashboard/profile" className="text-muted-foreground hover:text-foreground">
              <span className="text-sm font-medium">Profile</span>
            </Link> */}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="container mx-auto px-4 sm:hidden border-t border-border fixed bottom-0 left-0 w-full bg-background">
        <div className="w-full flex justify-around py-2">
          {navItems.map((item) => (
            <ActiveNavLink key={item.name} href={item.href} isMobile>
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.name}</span>
            </ActiveNavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}