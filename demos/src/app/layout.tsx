import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = "https://agentic-design-system.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Agentic Design System — Evidence loops for agent-built UI",
  description:
    "An open-source control plane for coding agents that build UI: define intent, capture rendered evidence, grade the result, and revise until it clears.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Agentic Design System — Evidence loops for agent-built UI",
    description:
      "Open-source skills, templates, checks, and evidence loops for coding agents that build UI.",
    siteName: "Agentic Design System",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agentic Design System — Evidence loops for agent-built UI",
    description:
      "Open-source skills, templates, checks, and evidence loops for coding agents that build UI.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "Agentic Design System",
  description:
    "An open-source control plane for coding agents that build UI, with intent templates, project baselines, rendered evidence checks, and grader-led revision loops.",
  url: siteUrl,
  codeRepository: "https://github.com/aa-on-ai/agentic-design-system",
  license: "https://github.com/aa-on-ai/agentic-design-system/blob/main/LICENSE",
  programmingLanguage: ["TypeScript", "JavaScript", "Python", "Markdown"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="ads-theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const params = new URLSearchParams(window.location.search);
              const paramTheme = params.get('theme');
              const storedTheme = window.localStorage.getItem('ads-theme');
              const theme = paramTheme === 'light' || paramTheme === 'dark'
                ? paramTheme
                : storedTheme === 'light' || storedTheme === 'dark'
                  ? storedTheme
                  : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
              document.documentElement.dataset.theme = theme;
            } catch (_) {}
          })();`}
        </Script>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body
        className={`${manrope.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
