"use client";

import { Github, X } from "lucide-react";
import Link from "next/link";
import type { MouseEvent, RefObject } from "react";
import { ThemeToggle } from "./ThemeToggle";
import {
  type SystemDestination,
  SYSTEM_DESTINATIONS,
} from "./systemNavigation";
import type { MenuPhase } from "./useSystemNavMenu";

export function SystemNavSheet({
  current,
  currentIndex,
  initialTheme,
  phase,
  visible,
  sheetRef,
  close,
  onDestinationClick,
}: {
  current: SystemDestination;
  currentIndex: number;
  initialTheme: "light" | "dark";
  phase: MenuPhase;
  visible: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  close: (restoreFocus?: boolean) => void;
  onDestinationClick: (
    event: MouseEvent<HTMLAnchorElement>,
    destination: (typeof SYSTEM_DESTINATIONS)[number],
  ) => void;
}) {
  return (
    <div
      className="ads-system-nav-layer"
      data-state={phase}
      data-visible={visible ? "true" : "false"}
      aria-hidden={phase === "closing" ? "true" : undefined}
    >
      <button
        type="button"
        className="ads-system-nav-backdrop"
        aria-label="Close system pages"
        onClick={() => close()}
      />
      <div
        ref={sheetRef}
        id="ads-system-nav-sheet"
        className="ads-system-nav-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ads-system-nav-sheet-title"
        inert={!visible ? true : undefined}
      >
        <header className="ads-system-nav-sheet-heading">
          <div>
            <strong id="ads-system-nav-sheet-title">System pages</strong>
            <span>
              {currentIndex + 1} of {SYSTEM_DESTINATIONS.length}, choose where
              to go next
            </span>
          </div>
          <button
            type="button"
            className="ads-system-nav-sheet-close focus-ring"
            aria-label="Close system pages"
            onClick={() => close()}
          >
            <X size={18} strokeWidth={2.1} aria-hidden="true" />
          </button>
        </header>

        <div className="ads-system-nav-sheet-links">
          {SYSTEM_DESTINATIONS.map((destination, index) => {
            const isCurrent = current === destination.id;
            return (
              <Link
                key={destination.id}
                href={destination.href}
                aria-current={isCurrent ? "page" : undefined}
                className="focus-ring"
                onClick={(event) =>
                  onDestinationClick(event, destination)
                }
              >
                <span className="ads-system-nav-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="ads-system-nav-link-copy">
                  <strong>{destination.label}</strong>
                  <small>{destination.description}</small>
                </span>
                {isCurrent && (
                  <span className="ads-system-nav-current">Current page</span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="ads-system-nav-sheet-utilities">
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            className="focus-ring"
          >
            <Github size={18} strokeWidth={2.1} aria-hidden="true" />
            <span>GitHub</span>
          </a>
          <div>
            <span>Appearance</span>
            <ThemeToggle initialTheme={initialTheme} />
          </div>
        </div>
      </div>
    </div>
  );
}
