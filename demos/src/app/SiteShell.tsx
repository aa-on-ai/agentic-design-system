"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandLockup } from "./BrandLockup";
import { SystemNav } from "./SystemNav";
import { ThemeToggle } from "./ThemeToggle";

type ScrollState = "visible" | "hidden";

export function SiteShell({ children, initialTheme }: { children: ReactNode; initialTheme: "light" | "dark" }) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const frame = useRef<number | null>(null);
  const [scrollState, setScrollState] = useState<ScrollState>("visible");

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const update = () => {
      frame.current = null;
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      const header = headerRef.current;
      const pinned = header?.querySelector(":focus-visible") !== null
        || header?.querySelector("details[open]") !== null;

      if (currentY < 96 || delta < -6 || pinned) setScrollState("visible");
      else if (currentY > 160 && delta > 8) setScrollState("hidden");

      lastScrollY.current = currentY;
    };

    const onScroll = () => {
      if (frame.current === null) frame.current = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => {
    const routeFrame = window.requestAnimationFrame(() => {
      setScrollState("visible");
      lastScrollY.current = window.scrollY;
    });
    return () => window.cancelAnimationFrame(routeFrame);
  }, [pathname]);

  return (
    <>
      <header ref={headerRef} className="site-shell-header" data-scroll-state={scrollState}>
        <Link className="brand-lockup focus-ring" href="/#top" aria-label="Agentic Design System home">
          <BrandLockup />
        </Link>
        <SystemNav />
        <nav className="site-shell-actions" aria-label="Project links and appearance">
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            aria-label="Agentic Design System on GitHub"
            className="site-shell-github hero-pill hero-pill--icon focus-ring"
          >
            <Github size={18} strokeWidth={2.1} aria-hidden="true" />
          </a>
          <ThemeToggle initialTheme={initialTheme} />
        </nav>
      </header>
      <div className="site-shell-content" data-overlay={pathname === "/" ? "true" : "false"}>
        {children}
      </div>
    </>
  );
}
