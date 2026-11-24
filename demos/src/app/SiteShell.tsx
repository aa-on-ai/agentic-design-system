"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SystemNav } from "./SystemNav";

/*
 * Routes that use the system nav. Everything else, including the homepage and the 404,
 * renders its own homepage-style header. Add a prefix here when a new route needs the nav.
 */
const SYSTEM_NAV_PREFIXES = ["/workbench", "/mcp", "/trace", "/before", "/after"];

const usesSystemNav = (pathname: string | null) =>
  !!pathname && SYSTEM_NAV_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export function SiteShell({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: "light" | "dark";
}) {
  const pathname = usePathname();
  if (!usesSystemNav(pathname)) return <>{children}</>;
  return (
    <div className="site-shell">
      <SystemNav initialTheme={initialTheme} />
      <div className="site-shell-content">{children}</div>
    </div>
  );
}
