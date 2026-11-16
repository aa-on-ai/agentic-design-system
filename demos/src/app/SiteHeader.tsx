"use client";
/* eslint-disable @next/next/no-img-element */
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";
import styles from "./DesignPractice.module.css";
function subscribeTheme(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const readTheme = () => document.documentElement.dataset.theme === "dark" ? "dark" : "light";
const serverTheme = () => "light";
export function SiteHeader({asset = (p: string) => p}: {asset?: (p: string) => string}) {
 const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
 const toggleTheme = () => {const next = readTheme() === "light" ? "dark" : "light"; document.documentElement.dataset.theme = next; document.cookie = `ads-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;};
 return <header className={styles["header"] + " " + styles["wrap"]}><Link className={styles["brand"]} href="/"><img className={styles["brand-mark-light"]} src={asset("/brand/peek.svg")} width="44" height="44" alt="" /><img className={styles["brand-mark-dark"]} src={asset("/brand/peek-dark.svg")} width="44" height="44" alt="" /><span>Agentic Design System</span></Link><nav aria-label="Main navigation"><Link href="/#practice">The practice</Link><Link className={styles["examples-nav"]} href="/examples/account-settings">Examples</Link><Link href="/#start">Get started</Link><button className={styles["theme"]} type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}</button></nav></header>;
}
