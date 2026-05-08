"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function preferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const param = new URLSearchParams(window.location.search).get("theme");
  if (param === "light" || param === "dark") return param;
  const stored = window.localStorage.getItem("ads-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const next = preferredTheme();
    setTheme(next);
    document.documentElement.dataset.theme = next;
    setMounted(true);
  }, []);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === "dark" ? "light" : "dark";
    const btn = event.currentTarget.getBoundingClientRect();
    const root = document.documentElement;
    const img = document.querySelector<HTMLElement>(".hero-image-dark");
    const ref = img?.getBoundingClientRect();
    const cx = btn.left + btn.width / 2;
    const cy = btn.top + btn.height / 2;
    const x = ref ? cx - ref.left : cx;
    const y = ref ? cy - ref.top : cy;
    root.style.setProperty("--reveal-x", `${x}px`);
    root.style.setProperty("--reveal-y", `${y}px`);
    setTheme(next);
    root.dataset.theme = next;
    window.localStorage.setItem("ads-theme", next);
  };

  const showMoon = mounted ? theme === "light" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="hero-pill hero-pill--icon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      data-theme-state={theme}
    >
      {showMoon ? (
        <Moon size={17} strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <Sun size={17} strokeWidth={2.2} aria-hidden="true" />
      )}
    </button>
  );
}
