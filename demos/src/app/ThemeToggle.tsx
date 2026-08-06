"use client";

import { useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const setRevealOrigin = () => {
    const button = buttonRef.current;
    const media = document.querySelector<HTMLElement>(".hero-media");
    if (!button || !media) return;

    const buttonRect = button.getBoundingClientRect();
    const mediaRect = media.getBoundingClientRect();
    document.documentElement.style.setProperty(
      "--theme-reveal-x",
      `${buttonRect.left + buttonRect.width / 2 - mediaRect.left}px`,
    );
    document.documentElement.style.setProperty(
      "--theme-reveal-y",
      `${buttonRect.top + buttonRect.height / 2 - mediaRect.top}px`,
    );
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setRevealOrigin();
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.cookie = `ads-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  const showMoon = theme === "light";

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      onPointerEnter={setRevealOrigin}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="hero-pill hero-pill--icon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      data-theme-state={theme}
    >
      <span className={`theme-toggle-icon theme-toggle-icon--moon${showMoon ? " is-visible" : ""}`} aria-hidden="true">
        <Moon size={17} strokeWidth={2.2} />
      </span>
      <span className={`theme-toggle-icon theme-toggle-icon--sun${showMoon ? "" : " is-visible"}`} aria-hidden="true">
        <Sun size={17} strokeWidth={2.2} />
      </span>
    </button>
  );
}
