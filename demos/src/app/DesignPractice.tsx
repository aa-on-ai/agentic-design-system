"use client";

/* Native images support the standalone homepage export. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { Copy, Github, MessageSquareText, Plug, ArrowRight } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { EmberIntroduction } from "./EmberIntroduction";
import styles from "./DesignPractice.module.css";

const localAsset = (path: string) => path;

export function DesignPractice({ asset = localAsset }: { asset?: (path: string) => string }) {
  const [copyStatus, setCopyStatus] = useState("");
  const requestRef = useRef<HTMLQuoteElement>(null);
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
<SiteHeader asset={asset} />
<main id="main" tabIndex={-1}>
<section className={styles["hero"] + " " + styles["wrap"]} id="top" aria-labelledby="hero-title">
<div className={styles["hero-spread"]}><div className={styles["hero-copy"]}>
<h1 id="hero-title">Your agent.<br />Your product.<br /><span>A design practice.</span></h1>
<p className={styles["deck"]}>Make the next screen feel like it belongs.</p>
<p className={styles["about"]}>ADS gives your coding agent a way to work with your components, refine the details, and bring back a working interface. In your own repository.</p>
<a className={styles["primary"]} href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md">Add ADS to your project <svg className={styles["arrow"]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></a>
<p className={styles["helper"]}>A skill pack for the coding agent you already use.</p>
<a className={styles["mcp-link"]} href="https://github.com/aa-on-ai/agentic-design-system/blob/main/packages/ads-mcp/README.md#client-configuration">Connect via MCP <Plug size={18} strokeWidth={1.75} aria-hidden="true" /></a>
</div><figure className={styles["art"]}><img src={asset("/hero/graphite-rose-atelier.webp")} width="1536" height="864" alt="Three rose-hooded Ember companions measure, arrange and review interface components at a graphite workbench." /><figcaption>Your project is the starting point. Not a blank canvas.</figcaption></figure></div>
</section>
<section className={styles["why"] + " " + styles["wrap"]} id="practice" aria-labelledby="practice-title">
<div className={styles["practice-copy"]}><div><h2 id="practice-title">Good work deserves<br />a second look.</h2></div><p className={styles["practice-intro"]}>Your agent builds. Ember is an evidence-reading companion who helps you read what came back, without making the taste call for you. You decide what’s worth keeping.</p></div>
<ol className={styles["principles"]}><li><strong>Keep the character.</strong><span>Start with your existing product, not a new template.</span></li><li><strong>Work through the details.</strong><span>Check the real interaction, not just the screenshot.</span></li><li><strong>Be clear about the gaps.</strong><span>Separate what was checked from what still needs your judgment.</span></li></ol>
<EmberIntroduction asset={asset} />
</section>
<section className={styles["examples-section"] + " " + styles.wrap} id="examples" aria-labelledby="examples-title"><div className={styles["examples-heading"]}><div><p className={styles["examples-kicker"]}>From the workshop</p><h2 id="examples-title">See what came back.</h2></div><div><p>One account-settings prompt. Three models. Each tried with and without ADS, then given a chance to revise.</p><a className={styles.primary} href="/examples/account-settings">Explore the examples <ArrowRight size={20} aria-hidden="true" /></a></div></div><a className={styles["examples-spread"]} href="/examples/account-settings" aria-label="Compare the account-settings examples"><figure><figcaption>Without ADS</figcaption><img src={asset("/examples/account-settings/astra-baseline-desktop-chromium-viewport.png")} width="1280" height="800" alt="Account settings built by Astra without ADS" loading="lazy" /></figure><figure><figcaption>With ADS</figcaption><img src={asset("/examples/account-settings/astra-ads-desktop-chromium-viewport.png")} width="1280" height="800" alt="Account settings built by Astra with ADS" loading="lazy" /></figure></a><p className={styles["examples-caption"]}>Shown here: GPT-6 Astra, high reasoning. Small, synthetic examples to inspect, not a leaderboard.</p></section>
<section className={styles["start"] + " " + styles["wrap"]} id="start" aria-labelledby="start-title"><div className={styles["start-panel"]}><div className={styles["start-copy"]}><h2 id="start-title">Bring one screen.<br />Start there.</h2><p className={styles["intro"]}>Install ADS in your project, then ask your agent for a change you can actually use.</p><div className={styles["install"]}><a className={styles["primary"]} href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md">Add ADS to your project <svg className={styles["arrow"]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></a><p className={styles["helper"]}>Choose your agent in the installation guide.</p></div><div className={styles["mcp-setup"]}><h3>Connect via MCP</h3><p>Give your agent tools to render interfaces, evaluate results, and trace design evidence.</p><a className={styles["mcp-link"]} href="https://github.com/aa-on-ai/agentic-design-system/blob/main/packages/ads-mcp/README.md#client-configuration">Set up the MCP server <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></a></div></div><div><div className={styles["request"]}><p className={styles["request-label"]}><MessageSquareText aria-hidden="true" />An example request</p><blockquote ref={requestRef} id="example-request">Improve our account settings page. Keep our components and visual identity. Make saving and validation clear. Show me the working result, checked on desktop and mobile.</blockquote><div className={styles["request-actions"]}><button className={styles["copy"]} type="button" onClick={copyRequest}><Copy aria-hidden="true" />Copy example request</button><p className={styles["copy-state"]} role="status" aria-live="polite">{copyStatus}</p></div></div><p className={styles["scope"]}>The skills guide the work. Your agent runs it. You keep the final say.</p></div></div></section>
</main><footer className={styles["footer"] + " " + styles["wrap"]}><p className={styles["footer-copyright"]}>© ADS 2026</p><div className={styles["footer-links"]}><a className={styles["github-link"]} href="https://github.com/aa-on-ai/agentic-design-system" aria-label="Agentic Design System source on GitHub"><Github aria-hidden="true" /></a></div><p className={styles["footer-credit"]}>made with 🖤 by <a href="https://www.aarontho.com/">Aaron Thomas</a></p></footer>
  </div>;
}
