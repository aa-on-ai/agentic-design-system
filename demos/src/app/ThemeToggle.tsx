"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

type ViewTransitionHandle = {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
};

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransitionHandle;
};

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const transitionRef = useRef<ViewTransitionHandle | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const sequenceRef = useRef(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    });
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const revealGeometry = () => {
    const button = buttonRef.current;
    if (!button) return { x: window.innerWidth - 48, y: 48, radius: window.innerWidth };

    const buttonRect = button.getBoundingClientRect();
    const x = buttonRect.left + buttonRect.width / 2;
    const y = buttonRect.top + buttonRect.height / 2;
    return {
      x,
      y,
      radius: Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)),
    };
  };

  const applyTheme = (next: Theme) => {
    flushSync(() => setTheme(next));
    document.documentElement.dataset.theme = next;
    document.cookie = `ads-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    const current = root.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transitionDocument = document as TransitionDocument;
    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;

    transitionRef.current?.skipTransition();
    animationRef.current?.cancel();

    if (reduceMotion || !transitionDocument.startViewTransition) {
      root.dataset.themeTransition = "synchronized";
      applyTheme(next);
      window.setTimeout(() => {
        if (sequenceRef.current === sequence) delete root.dataset.themeTransition;
      }, reduceMotion ? 1 : 420);
      return;
    }

    const { x, y, radius } = revealGeometry();
    const transition = transitionDocument.startViewTransition(() => {
      root.dataset.themeTransition = "radial";
      applyTheme(next);
    });
    transitionRef.current = transition;

    transition.ready.then(() => {
      if (sequenceRef.current !== sequence) return;
      animationRef.current = root.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 560,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    }).catch(() => undefined);

    transition.finished.finally(() => {
      if (sequenceRef.current !== sequence) return;
      delete root.dataset.themeTransition;
      transitionRef.current = null;
      animationRef.current = null;
    });
  };

  const showMoon = theme === "light";

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="theme-toggle hero-pill hero-pill--icon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
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
