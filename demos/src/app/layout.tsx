import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
