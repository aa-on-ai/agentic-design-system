"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  currentSystemDestination,
  SYSTEM_DESTINATIONS,
} from "./systemNavigation";

export function SystemNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const current = currentSystemDestination(pathname);
  const currentIndex = SYSTEM_DESTINATIONS.findIndex(
    (destination) => destination.id === current,
  );
  const currentPage = SYSTEM_DESTINATIONS[currentIndex];

  useEffect(() => {
    menuRef.current?.removeAttribute("open");
  }, [pathname]);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        menuRef.current?.open &&
        !menuRef.current.contains(event.target as Node)
      ) {
        menuRef.current.removeAttribute("open");
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuRef.current?.open) {
        menuRef.current.removeAttribute("open");
        menuRef.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const renderLinks = (expanded = false) =>
    SYSTEM_DESTINATIONS.map((destination, index) => {
      const isCurrent = current === destination.id;

      return (
        <Link
          key={destination.id}
          href={destination.href}
          aria-current={isCurrent ? "page" : undefined}
          className="focus-ring"
        >
          {expanded && (
            <span className="ads-system-nav-number">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <span className="ads-system-nav-link-copy">
            <strong>{destination.label}</strong>
            {expanded && <small>{destination.description}</small>}
          </span>
          {expanded && isCurrent && (
            <span className="ads-system-nav-current">Current page</span>
          )}
        </Link>
      );
    });

  return (
    <nav className="ads-system-nav" aria-label="Agentic Design System">
      <div className="ads-system-nav-inner">
        <Link className="ads-system-nav-brand focus-ring" href="/#top">
          Agentic Design System
        </Link>
        <div className="ads-system-nav-list">{renderLinks()}</div>
        <details ref={menuRef} className="ads-system-nav-menu">
          <summary
            className="focus-ring"
            aria-label={`System pages, current page ${currentPage.label}, ${currentIndex + 1} of ${SYSTEM_DESTINATIONS.length}`}
          >
            <span className="ads-system-nav-summary-copy">
              <strong>{currentPage.label}</strong>
              <small>
                {currentIndex + 1} of {SYSTEM_DESTINATIONS.length}
              </small>
            </span>
            <ChevronDown
              className="ads-system-nav-chevron"
              size={18}
              strokeWidth={2.1}
              aria-hidden="true"
            />
          </summary>
          <button
            type="button"
            className="ads-system-nav-backdrop"
            aria-label="Close system pages"
            onClick={() => menuRef.current?.removeAttribute("open")}
          />
          <div>
            <header className="ads-system-nav-sheet-heading">
              <strong>System pages</strong>
              <span>Choose where to go next</span>
            </header>
            {renderLinks(true)}
            <a
              href="https://github.com/aa-on-ai/agentic-design-system"
              className="focus-ring ads-system-nav-github"
            >
              <span className="ads-system-nav-number">↗</span>
              <span className="ads-system-nav-link-copy">
                <strong>GitHub</strong>
                <small>Source, installation, and releases</small>
              </span>
            </a>
          </div>
        </details>
      </div>
    </nav>
  );
}
