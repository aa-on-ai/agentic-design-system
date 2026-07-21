import { Github } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../../ThemeToggle";
import styles from "./trace-two.module.css";

type TraceTwoHeaderProps = {
  initialTheme: "light" | "dark";
};

export function TraceTwoHeader({ initialTheme }: TraceTwoHeaderProps) {
  return (
    <header className={styles.header}>
      <Link className={`wordmark focus-ring ${styles.wordmark}`} href="/" aria-label="Agentic Design System home">
        <span className="wordmark-mark" aria-hidden="true">A</span>
        <span>Agentic Design System</span>
      </Link>
      <nav className={styles.headerNav} aria-label="Primary navigation">
        <Link className={`${styles.headerLink} focus-ring`} href="/trace">Trace 001</Link>
        <a
          className="hero-pill hero-pill--icon focus-ring"
          href="https://github.com/aa-on-ai/agentic-design-system"
          aria-label="Agentic Design System on GitHub"
        >
          <Github size={18} strokeWidth={2.1} aria-hidden="true" />
        </a>
        <ThemeToggle initialTheme={initialTheme} />
      </nav>
    </header>
  );
}
