"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export type SystemDestination = "system" | "workbench" | "mcp" | "trace" | "proof";

const destinations: Array<{ id: SystemDestination; href: string; label: string }> = [
  { id: "system", href: "/#top", label: "Overview" },
  { id: "workbench", href: "/workbench", label: "Workbench" },
  { id: "mcp", href: "/mcp", label: "Evidence tools" },
  { id: "trace", href: "/trace", label: "Decision trace" },
  { id: "proof", href: "/trace/002", label: "Proof case" },
];

function currentDestination(pathname: string): SystemDestination {
  if (pathname === "/workbench") return "workbench";
  if (pathname === "/mcp") return "mcp";
  if (pathname === "/trace/002") return "proof";
  if (pathname.startsWith("/trace")) return "trace";
  return "system";
}

export function SystemNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const current = currentDestination(pathname);

  useEffect(() => {
    menuRef.current?.removeAttribute("open");
  }, [pathname]);

  const links = destinations.map((destination) => (
    <Link
      key={destination.id}
      href={destination.href}
      aria-current={current === destination.id ? "page" : undefined}
      className="focus-ring"
    >
      {destination.label}
    </Link>
  ));

  return (
    <nav className="ads-system-nav" aria-label="Agentic Design System">
      <div className="ads-system-nav-list">{links}</div>
      <details ref={menuRef} className="ads-system-nav-menu">
        <summary aria-label="Explore the system" className="focus-ring">
          <span className="ads-system-nav-summary-long">Explore the system</span>
          <span className="ads-system-nav-summary-short">Explore</span>
        </summary>
        <div>
          {links}
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            className="focus-ring"
          >
            GitHub
          </a>
        </div>
      </details>
    </nav>
  );
}
