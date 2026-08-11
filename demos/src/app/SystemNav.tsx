"use client";

import { ChevronDown, Github } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { BrandLockup } from "./BrandLockup";
import { SystemNavSheet } from "./SystemNavSheet";
import { ThemeToggle } from "./ThemeToggle";
import {
  currentSystemDestination,
  SYSTEM_DESTINATIONS,
} from "./systemNavigation";
import { useRailVisibility } from "./useRailVisibility";
import { useSystemNavMenu } from "./useSystemNavMenu";

export function SystemNav({
  initialTheme,
}: {
  initialTheme: "light" | "dark";
}) {
  const pathname = usePathname();
  const current = currentSystemDestination(pathname);
  const currentIndex = SYSTEM_DESTINATIONS.findIndex(
    (destination) => destination.id === current,
  );
  const currentPage = SYSTEM_DESTINATIONS[currentIndex];
  const {
    phase,
    visible,
    mounted,
    expanded,
    containerRef,
    triggerRef,
    sheetRef,
    close,
    toggle,
  } = useSystemNavMenu();
  const railScrollState = useRailVisibility(expanded, pathname);

  const handleDestinationClick = (
    event: MouseEvent<HTMLAnchorElement>,
    destination: (typeof SYSTEM_DESTINATIONS)[number],
  ) => {
    close(false);
    if (destination.id !== current) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      id="system-navigation"
      className="ads-system-nav"
      aria-label="Agentic Design System"
      data-scroll-state={railScrollState}
    >
      <div className="ads-system-nav-inner">
        <Link
          className="brand-lockup focus-ring"
          href="/"
          aria-label="Agentic Design System home"
        >
          <BrandLockup />
        </Link>

        <div className="ads-system-nav-list">
          {SYSTEM_DESTINATIONS.map((destination) => {
            const isCurrent = current === destination.id;
            return (
              <Link
                key={destination.id}
                href={destination.href}
                aria-current={isCurrent ? "page" : undefined}
                className="focus-ring"
                onClick={(event) =>
                  handleDestinationClick(event, destination)
                }
              >
                {destination.label}
              </Link>
            );
          })}
        </div>

        <div className="ads-system-nav-actions">
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            aria-label="Agentic Design System on GitHub"
            className="ads-system-nav-icon focus-ring"
          >
            <Github size={18} strokeWidth={2.1} aria-hidden="true" />
          </a>
          <ThemeToggle initialTheme={initialTheme} />
        </div>

        <div ref={containerRef} className="ads-system-nav-menu">
          <button
            ref={triggerRef}
            type="button"
            className="ads-system-nav-trigger focus-ring"
            aria-expanded={expanded}
            aria-controls="ads-system-nav-sheet"
            aria-label={`Menu, current page ${currentPage.label}, ${currentIndex + 1} of ${SYSTEM_DESTINATIONS.length}`}
            onClick={toggle}
          >
            <span className="ads-system-nav-summary-copy">
              <strong>{currentPage.label}</strong>
              <small>Menu</small>
            </span>
            <ChevronDown
              className="ads-system-nav-chevron"
              size={18}
              strokeWidth={2.1}
              aria-hidden="true"
            />
          </button>
          {mounted && (
            <SystemNavSheet
              current={current}
              currentIndex={currentIndex}
              initialTheme={initialTheme}
              phase={phase}
              visible={visible}
              sheetRef={sheetRef}
              close={close}
              onDestinationClick={handleDestinationClick}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
