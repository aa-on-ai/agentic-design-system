"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      const next = activeTheme();
      setPendingTheme(next === visibleThemeRef.current ? null : next);
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const settleTheme = (theme: Theme) => {
    if (activeTheme() !== theme) return;
    visibleThemeRef.current = theme;
    setVisibleTheme(theme);
    setPendingTheme(null);
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
          className="hero-image hero-image--pending"
          onLoad={() => settleTheme(pendingTheme)}
        />
      ) : null}
    </div>
  );
}
