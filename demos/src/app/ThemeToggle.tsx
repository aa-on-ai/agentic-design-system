"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.cookie = `ads-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  const showMoon = theme === "light";

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
