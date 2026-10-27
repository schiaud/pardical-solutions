import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Public pardical.com pages only. The demo yard and the company profile are deliberately left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/brokers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/eula`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
