import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body-face",
  subsets: ["latin"],
});

const labelFont = IBM_Plex_Mono({
  variable: "--font-label-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Newsreader({
  variable: "--font-display-face",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Agentic Design System",
  description:
    "An installable design system for your coding agent. Skills and templates for intent, baseline, rubric, evidence, and grader loops on UI work.",
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
        className={`${bodyFont.variable} ${labelFont.variable} ${displayFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
