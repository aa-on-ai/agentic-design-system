"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

function activeTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function heroSource(theme: Theme) {
  return `/hero/creative-pipeline-${theme}.png`;
}

export function HeroMedia({ initialTheme }: { initialTheme: Theme }) {
  const visibleThemeRef = useRef<Theme>(initialTheme);
  const [visibleTheme, setVisibleTheme] = useState<Theme>(initialTheme);
  const [pendingTheme, setPendingTheme] = useState<Theme | null>(null);
  const [revealReady, setRevealReady] = useState(false);

  const settleTheme = useCallback((theme: Theme) => {
    if (activeTheme() !== theme) return;
    visibleThemeRef.current = theme;
    setVisibleTheme(theme);
    setPendingTheme(null);
    setRevealReady(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      const next = activeTheme();
      setRevealReady(false);
      setPendingTheme(next === visibleThemeRef.current ? null : next);
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pendingTheme || !revealReady) return;
    const fallback = window.setTimeout(() => settleTheme(pendingTheme), 900);
    return () => window.clearTimeout(fallback);
  }, [pendingTheme, revealReady, settleTheme]);

  const startReveal = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => setRevealReady(true)));
  };

  return (
    <div className="hero-media" aria-hidden="true">
      <Image
        src={heroSource(visibleTheme)}
        alt=""
        fill
        sizes="100vw"
        preload
        className="hero-image"
      />
      {pendingTheme ? (
        <Image
          key={pendingTheme}
          src={heroSource(pendingTheme)}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          className={`hero-image hero-image--pending${revealReady ? " is-revealing" : ""}`}
          onLoad={startReveal}
          onTransitionEnd={(event) => {
            if (event.propertyName === "clip-path") settleTheme(pendingTheme);
          }}
        />
      ) : null}
    </div>
  );
}
