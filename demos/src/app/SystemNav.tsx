"use client";

import { ChevronDown, Menu as MenuIcon } from "lucide-react";
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

  const renderLinks = (showCurrentLabel = false) => destinations.map((destination) => {
    const isCurrent = current === destination.id;

    return (
      <Link
        key={destination.id}
        href={destination.href}
        aria-current={isCurrent ? "page" : undefined}
        className="focus-ring"
      >
        <span>{destination.label}</span>
        {showCurrentLabel && isCurrent && (
          <span className="ads-system-nav-current">Current</span>
        )}
      </Link>
    );
  });

  return (
    <nav className="ads-system-nav" aria-label="Agentic Design System">
      <div className="ads-system-nav-list">{renderLinks()}</div>
      <details ref={menuRef} className="ads-system-nav-menu">
        <summary className="focus-ring">
          <MenuIcon size={18} strokeWidth={2.1} aria-hidden="true" />
          <span>Menu</span>
          <ChevronDown className="ads-system-nav-chevron" size={16} strokeWidth={2.1} aria-hidden="true" />
        </summary>
        <div>
          {renderLinks(true)}
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
