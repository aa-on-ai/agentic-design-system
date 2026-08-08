import type { ReactNode } from "react";
import { SystemNav } from "./SystemNav";

export function SiteShell({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: "light" | "dark";
}) {
  return (
    <div className="site-shell">
      <SystemNav initialTheme={initialTheme} />
      <div className="site-shell-content">{children}</div>
    </div>
  );
}
