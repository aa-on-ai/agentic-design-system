import type { Metadata } from "next";
import { DesignPractice } from "./DesignPractice";
import { HomepageReady } from "./HomepageReady";
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
    <>
      <DesignPractice />
      <HomepageReady />
    </>
  );
}
