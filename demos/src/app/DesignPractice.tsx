"use client";

/* Native images support the standalone homepage export. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useSyncExternalStore } from "react";
import { Sun, Moon, Copy, Github, MessageSquareText } from "lucide-react";
import { EmberIntroduction } from "./EmberIntroduction";
import styles from "./DesignPractice.module.css";

function subscribeTheme(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const readTheme = () => document.documentElement.dataset.theme === "dark" ? "dark" : "light";
const serverTheme = () => "light";
const localAsset = (path: string) => path;

export function DesignPractice({ asset = localAsset }: { asset?: (path: string) => string }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const [copyStatus, setCopyStatus] = useState("");
  const requestRef = useRef<HTMLQuoteElement>(null);
  const toggleTheme = () => {
    const next = readTheme() === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    document.cookie = `ads-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };
  const copyRequest = async () => {
    const request = requestRef.current;
    if (!request) return;
    // Permission prompts may leave writeText pending. Manual copying stays available.
    const range = document.createRange();
    range.selectNodeContents(request);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    setCopyStatus("Request selected. Use your device’s Copy action.");
    try {
      await navigator.clipboard.writeText(request.textContent || "");
      setCopyStatus("Copied. Paste this into your coding agent.");
    } catch {
      // The selected request and manual-copy feedback remain usable.
    }
  };
  return <div className={styles.homepage} data-ads-homepage>
<a className={styles["skip"]} href="#main">Skip to content</a>
<header className={styles["header"] + " " + styles["wrap"]}><a className={styles["brand"]} href="#top"><img className={styles["brand-mark-light"]} src={asset("/brand/peek.svg")} width="44" height="44" alt="" /><img className={styles["brand-mark-dark"]} src={asset("/brand/peek-dark.svg")} width="44" height="44" alt="" /><span>Agentic Design System</span></a><nav aria-label="Main navigation"><a href="#practice">The practice</a><a href="#start">Get started</a><button className={styles["theme"]} type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}</button></nav></header>
<main id="main" tabIndex={-1}>
<section className={styles["hero"] + " " + styles["wrap"]} id="top" aria-labelledby="hero-title">
<div className={styles["hero-spread"]}><div className={styles["hero-copy"]}>
<h1 id="hero-title">Your agent.<br />Your product.<br /><span>A design practice.</span></h1>
<p className={styles["deck"]}>Make the next screen feel like it belongs.</p>
<p className={styles["about"]}>ADS gives your coding agent a way to work with your components, refine the details, and bring back a working interface. In your own repository.</p>
<a className={styles["primary"]} href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md">Add ADS to your project <svg className={styles["arrow"]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></a>
<p className={styles["helper"]}>A skill pack for the coding agent you already use.</p>
</div><figure className={styles["art"]}><img src={asset("/hero/graphite-rose-atelier.webp")} width="1536" height="864" alt="Three rose-hooded Ember companions measure, arrange and review interface components at a graphite workbench." /><figcaption>Your project is the starting point. Not a blank canvas.</figcaption></figure></div>
</section>
<section className={styles["why"] + " " + styles["wrap"]} id="practice" aria-labelledby="practice-title">
<div className={styles["practice-copy"]}><div><h2 id="practice-title">Good work deserves<br />a second look.</h2></div><p className={styles["practice-intro"]}>Your agent builds. Ember is an evidence-reading companion who helps you read what came back, without making the taste call for you. You decide what’s worth keeping.</p></div>
<ol className={styles["principles"]}><li><strong>Keep the character.</strong><span>Start with your existing product, not a new template.</span></li><li><strong>Work through the details.</strong><span>Check the real interaction, not just the screenshot.</span></li><li><strong>Be clear about the gaps.</strong><span>Separate what was checked from what still needs your judgment.</span></li></ol>
<EmberIntroduction asset={asset} />
</section>
<section className={styles["start"] + " " + styles["wrap"]} id="start" aria-labelledby="start-title"><div className={styles["start-panel"]}><div className={styles["start-copy"]}><h2 id="start-title">Bring one screen.<br />Start there.</h2><p className={styles["intro"]}>Install ADS in your project, then ask your agent for a change you can actually use.</p><div className={styles["install"]}><a className={styles["primary"]} href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md">Add ADS to your project <svg className={styles["arrow"]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></a><p className={styles["helper"]}>Choose your agent in the installation guide.</p></div></div><div><div className={styles["request"]}><p className={styles["request-label"]}><MessageSquareText aria-hidden="true" />An example request</p><blockquote ref={requestRef} id="example-request">Improve our account settings page. Keep our components and visual identity. Make saving and validation clear. Show me the working result, checked on desktop and mobile.</blockquote><div className={styles["request-actions"]}><button className={styles["copy"]} type="button" onClick={copyRequest}><Copy aria-hidden="true" />Copy example request</button><p className={styles["copy-state"]} role="status" aria-live="polite">{copyStatus}</p></div></div><p className={styles["scope"]}>The skills guide the work. Your agent runs it. You keep the final say.</p></div></div></section>
</main><footer className={styles["footer"] + " " + styles["wrap"]}><p className={styles["footer-copyright"]}>© ADS 2026</p><div className={styles["footer-links"]}><a className={styles["github-link"]} href="https://github.com/aa-on-ai/agentic-design-system" aria-label="Agentic Design System source on GitHub"><Github aria-hidden="true" /></a></div><p className={styles["footer-credit"]}>made with 🖤 by <a href="https://www.aarontho.com/">Aaron Thomas</a></p></footer>
  </div>;
}
