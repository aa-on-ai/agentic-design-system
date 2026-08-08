"use client";

import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  currentSystemDestination,
  SYSTEM_DESTINATIONS,
} from "./systemNavigation";

type MenuPhase = "closed" | "opening" | "open" | "closing";

const NAVIGATION_HANDOFF_KEY = "ads:system-navigation-handoff";
const MENU_EXIT_MS = 220;

export function SystemNav() {
  const pathname = usePathname();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const openingFrameRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const [menuPhase, setMenuPhase] = useState<MenuPhase>("closed");
  const [menuVisible, setMenuVisible] = useState(false);
  const current = currentSystemDestination(pathname);
  const currentIndex = SYSTEM_DESTINATIONS.findIndex(
    (destination) => destination.id === current,
  );
  const currentPage = SYSTEM_DESTINATIONS[currentIndex];
  const menuMounted = menuPhase !== "closed";
  const menuExpanded = menuPhase === "opening" || menuPhase === "open";

  const scrollNavigationIntoPlace = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const navigationTop =
      anchor.getBoundingClientRect().top + window.scrollY;
    root.style.scrollBehavior = "auto";
    window.scrollTo({
      top: navigationTop,
      behavior: "auto",
    });
    root.style.scrollBehavior = previousBehavior;
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    if (openingFrameRef.current !== null) {
      cancelAnimationFrame(openingFrameRef.current);
      openingFrameRef.current = null;
    }
    if (phaseTimerRef.current !== null) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    setMenuVisible(false);
    setMenuPhase((phase) =>
      phase === "closed" || phase === "closing" ? phase : "closing",
    );
    if (restoreFocus) {
      requestAnimationFrame(() => menuTriggerRef.current?.focus());
    }
  }, []);

  const openMenu = useCallback(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setMenuPhase("opening");
    setMenuVisible(reduceMotion);
    if (reduceMotion) {
      setMenuPhase("open");
      return;
    }
    openingFrameRef.current = requestAnimationFrame(() => {
      openingFrameRef.current = requestAnimationFrame(() => {
        openingFrameRef.current = null;
        setMenuVisible(true);
        phaseTimerRef.current = window.setTimeout(() => {
          phaseTimerRef.current = null;
          setMenuPhase((phase) => (phase === "opening" ? "open" : phase));
        }, MENU_EXIT_MS);
      });
    });
  }, []);

  const toggleMenu = () => {
    if (menuExpanded) closeMenu();
    else openMenu();
  };

  const handleDestinationClick = (
    event: MouseEvent<HTMLAnchorElement>,
    destinationId: (typeof SYSTEM_DESTINATIONS)[number]["id"],
    destinationHref: string,
  ) => {
    const isPrimaryNavigation =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;

    closeMenu(false);
    if (!isPrimaryNavigation) return;

    if (destinationId === current) {
      event.preventDefault();
      scrollNavigationIntoPlace();
      return;
    }

    sessionStorage.setItem(
      NAVIGATION_HANDOFF_KEY,
      JSON.stringify({
        pathname: new URL(destinationHref, window.location.origin).pathname,
      }),
    );
  };

  useLayoutEffect(() => {
    const rawHandoff = sessionStorage.getItem(NAVIGATION_HANDOFF_KEY);
    if (!rawHandoff) return;

    try {
      const handoff = JSON.parse(rawHandoff) as {
        pathname?: string;
      };
      sessionStorage.removeItem(NAVIGATION_HANDOFF_KEY);
      if (handoff.pathname !== pathname) return;
      scrollNavigationIntoPlace();
    } catch {
      sessionStorage.removeItem(NAVIGATION_HANDOFF_KEY);
    }
  }, [pathname, scrollNavigationIntoPlace]);

  useEffect(() => {
    if (menuPhase !== "closing") return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timeout = window.setTimeout(
      () => setMenuPhase("closed"),
      reduceMotion ? 0 : MENU_EXIT_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [menuPhase]);

  useEffect(() => {
    if (!menuMounted) return;
    document.documentElement.dataset.systemMenuOpen = "true";
    return () => {
      delete document.documentElement.dataset.systemMenuOpen;
    };
  }, [menuMounted]);

  useEffect(() => {
    if (menuPhase !== "open") return;
    const currentLink = sheetRef.current?.querySelector<HTMLAnchorElement>(
      "a[aria-current='page']",
    );
    currentLink?.focus({ preventScroll: true });
  }, [menuPhase]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuExpanded) {
        closeMenu();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeMenu, menuExpanded]);

  useEffect(() => {
    if (!menuExpanded) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !menuContainerRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [closeMenu, menuExpanded]);

  useEffect(
    () => () => {
      if (openingFrameRef.current !== null) {
        cancelAnimationFrame(openingFrameRef.current);
      }
      if (phaseTimerRef.current !== null) {
        window.clearTimeout(phaseTimerRef.current);
      }
      delete document.documentElement.dataset.systemMenuOpen;
    },
    [],
  );

  const renderLinks = (expanded = false) =>
    SYSTEM_DESTINATIONS.map((destination, index) => {
      const isCurrent = current === destination.id;

      return (
        <Link
          key={destination.id}
          href={destination.href}
          scroll={false}
          aria-current={isCurrent ? "page" : undefined}
          className="focus-ring"
          onClick={(event) =>
            handleDestinationClick(
              event,
              destination.id,
              destination.href,
            )
          }
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
    <>
      <span
        ref={anchorRef}
        className="ads-system-nav-anchor"
        aria-hidden="true"
      />
      <nav
        ref={navRef}
        id="system-navigation"
        className="ads-system-nav"
        aria-label="Agentic Design System"
      >
        <div className="ads-system-nav-inner">
          <Link className="ads-system-nav-brand focus-ring" href="/#top">
            Agentic Design System
          </Link>
          <div className="ads-system-nav-list">{renderLinks()}</div>
          <div ref={menuContainerRef} className="ads-system-nav-menu">
            <button
              ref={menuTriggerRef}
              type="button"
              className="ads-system-nav-trigger focus-ring"
              aria-expanded={menuExpanded}
              aria-controls="ads-system-nav-sheet"
              aria-label={`System pages, current page ${currentPage.label}, ${currentIndex + 1} of ${SYSTEM_DESTINATIONS.length}`}
              onClick={toggleMenu}
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
            </button>
            {menuMounted && (
              <div
                className="ads-system-nav-layer"
                data-state={menuPhase}
                data-visible={menuVisible ? "true" : "false"}
                aria-hidden={menuPhase === "closing" ? "true" : undefined}
              >
                <button
                  type="button"
                  className="ads-system-nav-backdrop"
                  aria-label="Close system pages"
                  onClick={() => closeMenu()}
                />
                <div
                  ref={sheetRef}
                  id="ads-system-nav-sheet"
                  className="ads-system-nav-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="ads-system-nav-sheet-title"
                  inert={!menuVisible ? true : undefined}
                >
                  <header className="ads-system-nav-sheet-heading">
                    <div>
                      <strong id="ads-system-nav-sheet-title">
                        System pages
                      </strong>
                      <span>Choose where to go next</span>
                    </div>
                    <button
                      type="button"
                      className="ads-system-nav-sheet-close focus-ring"
                      aria-label="Close system pages"
                      onClick={() => closeMenu()}
                    >
                      <X size={18} strokeWidth={2.1} aria-hidden="true" />
                    </button>
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
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
