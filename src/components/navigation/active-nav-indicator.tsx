"use client";

import { usePathname } from "next/navigation";

interface ActiveNavIndicatorProps {
  href: string;
  isMobile?: boolean;
}

export default function ActiveNavIndicator({ href, isMobile = false }: ActiveNavIndicatorProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  if (!isActive) return null;
  
  return isMobile ? (
    <span className="absolute -top-2 h-1 w-10 bg-primary rounded-full" />
  ) : (
    <span className="absolute -bottom-3 h-1 w-full bg-primary rounded-full" />
  );
}