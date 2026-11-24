"use client";

/* Native images match the standalone homepage, which this page mirrors. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Github, Moon, Sun } from "lucide-react";
import { MissingPath } from "./MissingPath";
import home from "./DesignPractice.module.css";
import styles from "./NotFound.module.css";

const INSTALL_URL = "https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md";

function subscribeTheme(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const readTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const serverTheme = () => "light";

/** The 404 uses the homepage's header, type, tokens and footer so it reads as the same product. */
export function NotFoundView() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const toggleTheme = () => {
    const next = readTheme() === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    document.cookie = `ads-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  return (
    <div className={`${home.homepage} ${styles.page}`} data-ads-homepage data-ads-not-found>
      <a className={home.skip} href="#main">Skip to content</a>
      <header className={`${home.header} ${home.wrap}`}>
        <Link className={home.brand} href="/">
          <img className={home["brand-mark-light"]} src="/brand/peek.svg" width="44" height="44" alt="" />
          <img className={home["brand-mark-dark"]} src="/brand/peek-dark.svg" width="44" height="44" alt="" />
          <span>Agentic Design System</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/#practice">The practice</Link>
          <Link href="/#start">Get started</Link>
          <button
            className={home.theme}
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          </button>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className={`${home.hero} ${home.wrap} ${styles.main}`} aria-labelledby="not-found-title">
        <div className={styles.spread}>
          <div className={home["hero-copy"]}>
            <p className={home.eyebrow}>404 / Page not found</p>
            <h1 id="not-found-title">
              This screen
              <br />
              isn&rsquo;t here.
              <br />
              <span>The practice is.</span>
            </h1>
            <p className={home.deck}>The link may be out of date, or the page moved.</p>
            <p className={home.about}>
              <MissingPath /> Head back to the homepage, or go straight to the installation guide.
            </p>
            <Link className={home.primary} href="/">
              Back to the homepage{" "}
              <svg className={home.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M4 12h15m-6-6 6 6-6 6" />
              </svg>
            </Link>
            <p className={home.helper}>
              <a className={home["mcp-link"]} href={INSTALL_URL}>
                Add ADS to your project
              </a>
            </p>
          </div>
          <figure className={styles.ember}>
            <img src="/characters/ember-graphite-rose.webp" width="640" height="640" alt="" />
          </figure>
        </div>
      </main>

      <footer className={`${home.footer} ${home.wrap}`}>
        <p className={home["footer-copyright"]}>© ADS 2026</p>
        <div className={home["footer-links"]}>
          <a
            className={home["github-link"]}
            href="https://github.com/aa-on-ai/agentic-design-system"
            aria-label="Agentic Design System source on GitHub"
          >
            <Github aria-hidden="true" />
          </a>
        </div>
        <p className={home["footer-credit"]}>
          made with 🖤 by <a href="https://www.aarontho.com/">Aaron Thomas</a>
        </p>
      </footer>
    </div>
  );
}
