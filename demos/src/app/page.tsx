import { ArrowDown, ArrowUpRight, Github } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BrandLockup } from "./BrandLockup";
import { HomepageReady } from "./HomepageReady";
import { HeroMedia } from "./HeroMedia";
import { InstallCommand } from "./InstallCommand";
import { ReleaseClose } from "./ReleaseClose";
import { SiteFooter } from "./SiteFooter";
import { ThemeToggle } from "./ThemeToggle";
import { WorkshopRun } from "./WorkshopRun";
import { SITE_DESCRIPTION, SITE_NAME, SOCIAL_IMAGE_ALT } from "./site";

type HomeProps = {
  searchParams: Promise<{ theme?: string | string[] }>;
};

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

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const requestedTheme = Array.isArray(params.theme) ? params.theme[0] : params.theme;
  const storedTheme = cookieStore.get("ads-theme")?.value;
  const initialTheme = requestedTheme === "light" || requestedTheme === "dark"
    ? requestedTheme
    : storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : "light";

  return (
    <main className="theme-page sm:min-h-screen" data-ads-homepage data-page-ready="pending">
      <HomepageReady />
      <p className="sr-only">
        Agentic Design System is a repo-local skill pack for coding agents. This page shows its input,
        browser checks, corrected screen, evidence report, and separate grader verdict.
      </p>

      <section className="hero-section" aria-labelledby="hero-title">
        <header className="site-header">
          <a
            className="brand-lockup focus-ring"
            href="#top"
            aria-label="Agentic Design System home"
          >
            <BrandLockup />
          </a>
          <nav className="hero-toolbar" aria-label="Primary navigation">
            <a
              href="https://github.com/aa-on-ai/agentic-design-system"
              aria-label="Agentic Design System on GitHub"
              className="hero-pill hero-pill--icon focus-ring focus-visible:outline"
            >
              <Github size={18} strokeWidth={2.1} aria-hidden="true" />
            </a>
            <ThemeToggle initialTheme={initialTheme} />
          </nav>
        </header>

        <div className="hero-workshop" id="top">
          <HeroMedia initialTheme={initialTheme} />
          <div className="hero-scrim" aria-hidden="true" />

          <div className="hero-copy">
            <p className="hero-kicker"><span>Open source</span> repo-local UI skill pack</p>
            <h1 id="hero-title">A design system for agents.<br /><em>Proof for humans.</em></h1>
            <p className="hero-lede">
              ADS installs skills, templates, and rendered checks into your project. It turns a UI
              request into a brief, a browser-tested repair, evidence, and a review verdict before
              your coding agent calls the work done.
            </p>
            <div className="hero-actions">
              <div className="hero-install">
                <InstallCommand variant="strip" />
                <a
                  className="install-guide-link focus-ring"
                  href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md"
                >
                  Codex example · choose your agent and activate ADS
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
              <a className="tour-link focus-ring" href="#assembly-line">
                See one UI run <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hero-job-ticket" aria-hidden="true">
            <span>Live run</span><b>Orders / UI review</b><small>input · evidence · verdict</small>
          </div>
          <div className="hero-track-mouth" aria-hidden="true"><i /><i /></div>
        </div>
      </section>

      <WorkshopRun />

      <ReleaseClose />

      <SiteFooter />
    </main>
  );
}
