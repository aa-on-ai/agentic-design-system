"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const next = preferredTheme();
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("ads-theme", next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="theme-toggle rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 active:scale-[0.98]"
    >
      <span aria-hidden="true" className="theme-toggle__icon">
        {theme === "dark" ? (
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
            <path d="M8 1.2a.7.7 0 0 1 .7.7v1.05a.7.7 0 1 1-1.4 0V1.9a.7.7 0 0 1 .7-.7Zm4.81 2a.7.7 0 0 1 0 .99l-.74.74a.7.7 0 0 1-.99-.99l.74-.74a.7.7 0 0 1 .99 0ZM8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6.1 2.3a.7.7 0 1 1 0 1.4h-1.05a.7.7 0 1 1 0-1.4h1.05ZM11.08 11.08a.7.7 0 0 1 .99 0l.74.74a.7.7 0 1 1-.99.99l-.74-.74a.7.7 0 0 1 0-.99ZM8 12.35a.7.7 0 0 1 .7.7v1.05a.7.7 0 1 1-1.4 0v-1.05a.7.7 0 0 1 .7-.7ZM3.93 11.08a.7.7 0 0 1 .99.99l-.74.74a.7.7 0 1 1-.99-.99l.74-.74ZM3.65 8a.7.7 0 0 1-.7.7H1.9a.7.7 0 1 1 0-1.4h1.05a.7.7 0 0 1 .7.7Zm.28-4.8.74.74a.7.7 0 1 1-.99.99l-.74-.74a.7.7 0 1 1 .99-.99Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
            <path d="M13.8 10.27A5.8 5.8 0 0 1 5.73 2.2a6.1 6.1 0 1 0 8.07 8.07Z" />
          </svg>
        )}
      </span>
    </button>
  );
}
