"use client";

import { useEffect, useState } from "react";

const MIN_SCROLL_DELTA = 12;
const TOP_SAFE_ZONE = 96;

export function useRailVisibility(menuExpanded: boolean, pathname: string) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHidden(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    let previousY = window.scrollY;
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const nextY = Math.max(0, window.scrollY);
      const delta = nextY - previousY;

      if (nextY <= TOP_SAFE_ZONE) setHidden(false);
      else if (Math.abs(delta) >= MIN_SCROLL_DELTA) setHidden(delta > 0);

      previousY = nextY;
    };

    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [menuExpanded]);

  return menuExpanded ? false : hidden;
}
