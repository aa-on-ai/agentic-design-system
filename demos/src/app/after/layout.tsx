import type { Metadata } from "next";

// Older system pages stay reachable by direct link but are kept out of search results.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function HiddenSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
