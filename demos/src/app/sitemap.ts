import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://agentic-design-system.vercel.app",
      lastModified: new Date("2026-07-13"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
