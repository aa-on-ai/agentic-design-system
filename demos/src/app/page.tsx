import type { Metadata } from "next";
import { HomepageReady } from "./HomepageReady";
import { HeroMedia } from "./HeroMedia";
import { InstallCommand } from "./InstallCommand";
import { ReleaseClose } from "./ReleaseClose";
import { SiteFooter } from "./SiteFooter";
import { WorkshopRun } from "./WorkshopRun";
import { SITE_DESCRIPTION, SITE_NAME, SOCIAL_IMAGE_ALT } from "./site";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        alt: SOCIAL_IMAGE_ALT,
      },
    ],
  },
};

export default function Home() {
  return (
    <main
      className="theme-page sm:min-h-screen"
      data-ads-homepage
      data-page-ready="pending"
    >
      <HomepageReady />
      <p className="sr-only">
        Agentic Design System is a repo-local skill pack for coding agents. This
        page shows its input, browser checks, corrected screen, evidence report,
        and separate grader verdict.
      </p>

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-workshop" id="top">
          <HeroMedia />
          <div className="hero-scrim" aria-hidden="true" />

          <div className="hero-copy">
            <p className="hero-kicker">
              <span>Open source</span> repo-local interface skill pack
            </p>
            <h1 id="hero-title">
              A design system for agents.
              <br />
              <em>Proof for humans.</em>
            </h1>
            <p className="hero-lede">
              The system installs skills, templates, and rendered checks into
              your project. It turns an interface request into a brief, a
              browser-tested repair, evidence, and a review verdict before your
              coding agent calls the work done.
            </p>
            <div className="hero-actions">
              <div className="hero-install">
                <InstallCommand variant="strip" />
                <a
                  className="install-guide-link focus-ring"
                  href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md"
                >
                  Codex example, choose your agent and activate the system
                </a>
              </div>
              <a className="tour-link focus-ring" href="#assembly-line">
                Follow the interface repair
              </a>
            </div>
          </div>

          <div className="hero-job-ticket" aria-hidden="true">
            <span>Example run</span>
            <b>Orders / interface review</b>
            <small>Input, evidence, and verdict</small>
          </div>
          <div className="hero-track-mouth" aria-hidden="true">
            <i />
            <i />
          </div>
        </div>
      </section>

      <WorkshopRun />

      <ReleaseClose />

      <SiteFooter />
    </main>
  );
}
