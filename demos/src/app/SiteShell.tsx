"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "./BrandLockup";
import { ThemeToggle } from "./ThemeToggle";

export function SiteShell({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: "light" | "dark";
}) {
  return (
    <>
      <header className="site-shell-header">
        <div className="site-shell-header-inner">
          <Link
            className="brand-lockup focus-ring"
            href="/#top"
            aria-label="Agentic Design System home"
          >
            <BrandLockup />
          </Link>
          <nav
            className="site-shell-actions"
            aria-label="Project links and appearance"
          >
            <a
              href="https://github.com/aa-on-ai/agentic-design-system"
              aria-label="Agentic Design System on GitHub"
              className="site-shell-github hero-pill hero-pill--icon focus-ring"
            >
              <Github size={18} strokeWidth={2.1} aria-hidden="true" />
            </a>
            <ThemeToggle initialTheme={initialTheme} />
          </nav>
        </div>
      </header>
      <div className="site-shell-content">{children}</div>
    </>
  );
}
