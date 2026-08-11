"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type MenuPhase = "closed" | "opening" | "open" | "closing";
export type SystemNavMenu = {
  phase: MenuPhase;
  visible: boolean;
  mounted: boolean;
  expanded: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  sheetRef: RefObject<HTMLDivElement | null>;
  close: (restoreFocus?: boolean) => void;
  toggle: () => void;
};

const MENU_EXIT_MS = 220;

export function useSystemNavMenu(): SystemNavMenu {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const openingFrameRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const [visible, setVisible] = useState(false);
  const mounted = phase !== "closed";
  const expanded = phase === "opening" || phase === "open";

  const clearTimers = useCallback(() => {
    if (openingFrameRef.current !== null) {
      cancelAnimationFrame(openingFrameRef.current);
      openingFrameRef.current = null;
    }
    if (phaseTimerRef.current !== null) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const close = useCallback(
    (restoreFocus = true) => {
      clearTimers();
      setVisible(false);
      setPhase((current) =>
        current === "closed" || current === "closing" ? current : "closing",
      );
      if (restoreFocus) {
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    },
    [clearTimers],
  );

  const open = useCallback(() => {
    clearTimers();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setPhase("opening");
    setVisible(reduceMotion);
    if (reduceMotion) {
      setPhase("open");
      return;
    }
    openingFrameRef.current = requestAnimationFrame(() => {
      openingFrameRef.current = requestAnimationFrame(() => {
        openingFrameRef.current = null;
        setVisible(true);
        phaseTimerRef.current = window.setTimeout(() => {
          phaseTimerRef.current = null;
          setPhase((current) =>
            current === "opening" ? "open" : current,
          );
        }, MENU_EXIT_MS);
      });
    });
  }, [clearTimers]);

  const toggle = useCallback(() => {
    if (expanded) close();
    else open();
  }, [close, expanded, open]);

  useEffect(() => {
    if (phase !== "closing") return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timeout = window.setTimeout(
      () => setPhase("closed"),
      reduceMotion ? 0 : MENU_EXIT_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.systemMenuOpen = "true";
    return () => {
      delete document.documentElement.dataset.systemMenuOpen;
    };
  }, [mounted]);

  useEffect(() => {
    if (phase !== "open") return;
    sheetRef.current
      ?.querySelector<HTMLAnchorElement>("a[aria-current='page']")
      ?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      )
        close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [close, expanded]);

  useEffect(
    () => () => {
      clearTimers();
      delete document.documentElement.dataset.systemMenuOpen;
    },
    [clearTimers],
  );

  return {
    phase,
    visible,
    mounted,
    expanded,
    containerRef,
    triggerRef,
    sheetRef,
    close,
    toggle,
  };
}
