"use client";

import { useEffect, useRef, useState } from "react";

const MIN_SCROLL_DELTA = 12;
const FLOATING_ACTIVATION_Y = 96;
const PAGE_TOP_THRESHOLD = 1;

export type RailScrollState = "static" | "hidden" | "visible";

export function useRailVisibility(menuExpanded: boolean, pathname: string) {
  const [railState, setRailState] = useState<RailScrollState>("static");
  const railStateRef = useRef<RailScrollState>("static");

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let pendingDirection = 0;
    let accumulatedDelta = 0;
    let frame: number | null = null;

    const commitRailState = (nextState: RailScrollState) => {
      if (railStateRef.current === nextState) return;
      railStateRef.current = nextState;
      setRailState(nextState);
    };

    const update = () => {
      frame = null;
      const nextY = Math.max(0, window.scrollY);
      const delta = nextY - previousY;
      previousY = nextY;

      if (nextY <= PAGE_TOP_THRESHOLD) {
        pendingDirection = 0;
        accumulatedDelta = 0;
        commitRailState("static");
        return;
      }

      if (Math.abs(delta) < 0.5) return;

      const nextDirection = delta > 0 ? 1 : -1;
      if (nextDirection !== pendingDirection) {
        pendingDirection = nextDirection;
        accumulatedDelta = 0;
      }
      accumulatedDelta += Math.abs(delta);

      if (
        railStateRef.current === "static" &&
        nextY >= FLOATING_ACTIVATION_Y &&
        nextDirection > 0
      ) {
        accumulatedDelta = 0;
        commitRailState("hidden");
        return;
      }

      if (accumulatedDelta < MIN_SCROLL_DELTA) return;
      accumulatedDelta = 0;

      if (nextDirection < 0) commitRailState("visible");
      else if (railStateRef.current !== "static") commitRailState("hidden");
    };

    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(() => {
      frame = null;
      previousY = Math.max(0, window.scrollY);
      commitRailState(
        previousY > FLOATING_ACTIVATION_Y ? "hidden" : "static",
      );
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return menuExpanded ? "visible" : railState;
}
