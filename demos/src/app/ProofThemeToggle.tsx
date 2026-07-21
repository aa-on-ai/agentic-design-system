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

export function ProofThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const next = preferredTheme();
    document.documentElement.dataset.theme = next;
    const frame = window.requestAnimationFrame(() => setTheme(next));

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      const param = new URLSearchParams(window.location.search).get("theme");
      if (param === "light" || param === "dark" || window.localStorage.getItem("ads-theme")) {
        return;
      }
      const systemTheme = event.matches ? "light" : "dark";
      document.documentElement.dataset.theme = systemTheme;
      setTheme(systemTheme);
    };

    media.addEventListener("change", syncSystemTheme);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", syncSystemTheme);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("ads-theme", next);
    document.cookie = `ads-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;

    const url = new URL(window.location.href);
    if (url.searchParams.has("theme")) {
      url.searchParams.set("theme", next);
      window.history.replaceState(null, "", url);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="hero-pill hero-pill--icon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span className="theme-icon theme-icon--moon">
        <Moon size={17} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="theme-icon theme-icon--sun">
        <Sun size={17} strokeWidth={2.2} aria-hidden="true" />
      </span>
    </button>
  );
}
