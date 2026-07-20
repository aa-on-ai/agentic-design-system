"use client";

import { useEffect } from "react";

export function HomepageReady() {
  useEffect(() => {
    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (cancelled) return;
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        document.querySelector("[data-ads-homepage]")?.setAttribute("data-page-ready", "true");
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
