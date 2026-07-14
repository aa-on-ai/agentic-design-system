import Image from "next/image";
import { Github } from "lucide-react";
import { InstallCommand } from "./InstallCommand";
import { ThemeToggle } from "./ThemeToggle";

export function Hero() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-card">
        <div className="hero-media" aria-hidden="true">
          <Image
            src="/hero/creative-pipeline-light.png"
            alt=""
            width={1536}
            height={1024}
            priority
            className="hero-image hero-image-light"
          />
          <Image
            src="/hero/creative-pipeline-dark.png"
            alt=""
            width={1536}
            height={1024}
            priority
            className="hero-image hero-image-dark"
          />
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-toolbar">
          <a
            href="https://github.com/aa-on-ai/agentic-design-system"
            aria-label="Agentic Design System on GitHub"
            className="hero-pill hero-pill--icon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Github size={17} strokeWidth={2.2} aria-hidden="true" />
          </a>
          <ThemeToggle />
        </div>

        <div className="hero-card-inner">
          <span className="hero-wordmark" aria-label="Agentic Design System">
            Agentic Design System
          </span>
          <h1 id="hero-title">A review loop for the UI your coding agent builds.</h1>
          <p className="hero-lede">
            ADS is an open-source control plane for intent, project context, rendered evidence,
            and revision. It keeps design judgment human and makes the agent&rsquo;s work inspectable.
          </p>

          <div className="hero-install" role="group" aria-label="Install command">
            <p className="hero-install-label">give this to your agent</p>
            <InstallCommand variant="strip" />
          </div>

          <HeroProofRail />
        </div>
      </div>
    </section>
  );
}

function HeroProofRail() {
  return (
    <aside className="hero-proof" aria-labelledby="hero-proof-title">
      <div className="hero-proof-heading">
        <p className="hero-proof-kicker">real run · orders screen</p>
        <h2 id="hero-proof-title">Rendered gates, not a promise.</h2>
      </div>
      <ol className="hero-proof-trail">
        <li>
          <span className="hero-proof-iteration">iter1</span>
          <span className="hero-proof-metrics">12 axe · 114 touch</span>
          <span className="hero-proof-verdict hero-proof-verdict--revise">needs_revision</span>
        </li>
        <li>
          <span className="hero-proof-iteration">iter2</span>
          <span className="hero-proof-metrics">12 axe · 12 touch</span>
          <span className="hero-proof-verdict hero-proof-verdict--revise">needs_revision</span>
        </li>
        <li>
          <span className="hero-proof-iteration">iter3</span>
          <span className="hero-proof-metrics">0 axe · 0 touch</span>
          <span className="hero-proof-verdict hero-proof-verdict--pass">satisfied</span>
        </li>
      </ol>
      <a
        className="hero-proof-link"
        href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/loop-demo/RUN-REPORT.md"
      >
        <span>4 states · 3 breakpoints</span>
        <span aria-hidden="true">Inspect receipt →</span>
        <span className="sr-only">Inspect the Orders run report on GitHub</span>
      </a>
    </aside>
  );
}
