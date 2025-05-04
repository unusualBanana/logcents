"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import ActiveNavIndicator from "./active-nav-indicator";

interface ActiveNavLinkProps {
  href: string;
  children: React.ReactNode;
  isMobile?: boolean;
}

export default function ActiveNavLink({ href, children, isMobile = false }: ActiveNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={cn(
        isMobile 
          ? "flex flex-col items-center py-1 px-3 relative transition-colors"
          : "flex items-center justify-center px-3 py-2 rounded-md transition-colors relative",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      <ActiveNavIndicator href={href} isMobile={isMobile} />
    </Link>
  );
}