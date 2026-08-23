import type { MetadataRoute } from "next";
import { productionDomain } from "@/lib/validation/config";

/**
 * Sitemap for the stable, publicly meaningful routes.
 *
 * Deliberately not every route. The reader has ~1,370 prerendered article
 * pages, and listing them all would produce a sitemap dominated by content
 * whose value is behind the daily allowance anyway — plus RSS-sourced texts
 * rotate, so their URLs are not stable enough to promise a crawler.
 *
 * The routes below are the ones that are stable, self-explanatory, and worth
 * arriving on cold.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = productionDomain();
  const now = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/articles", priority: 0.8, changeFrequency: "daily" },
    { path: "/live-news", priority: 0.7, changeFrequency: "daily" },
    { path: "/premium", priority: 0.6, changeFrequency: "monthly" },
    { path: "/grammar", priority: 0.5, changeFrequency: "monthly" },
    { path: "/dictionary", priority: 0.5, changeFrequency: "monthly" },
    { path: "/sources", priority: 0.3, changeFrequency: "monthly" },
    { path: "/changelog", priority: 0.3, changeFrequency: "weekly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${origin}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
