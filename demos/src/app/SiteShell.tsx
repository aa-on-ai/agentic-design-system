"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SystemNav } from "./SystemNav";

export function SiteShell({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: "light" | "dark";
}) {
  const pathname = usePathname();
  if (pathname === "/") return <>{children}</>;
  return (
    <div className="site-shell">
      <SystemNav initialTheme={initialTheme} />
      <div className="site-shell-content">{children}</div>
    </div>
  );
}
