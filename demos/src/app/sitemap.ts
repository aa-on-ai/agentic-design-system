import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

const LAST_MODIFIED = new Date("2026-11-26T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  // Only the homepage is listed. The older system pages are noindexed and reachable by direct link.
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
