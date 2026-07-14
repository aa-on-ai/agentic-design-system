import { Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header id="top" className="site-header">
      <a className="site-wordmark" href="#top" aria-label="Agentic Design System home">
        <span className="site-wordmark-mark" aria-hidden="true">A</span>
        <span>Agentic Design System</span>
      </a>

      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#run">Proof</a>
        <a href="#system">System</a>
        <a
          className="hero-pill hero-pill--icon"
          href="https://github.com/aa-on-ai/agentic-design-system"
          aria-label="Agentic Design System on GitHub"
        >
          <Github size={18} strokeWidth={2} aria-hidden="true" />
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
