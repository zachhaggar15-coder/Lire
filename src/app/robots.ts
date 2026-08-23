import type { MetadataRoute } from "next";
import { productionDomain } from "@/lib/validation/config";

/**
 * Crawler rules, pinned to the canonical origin.
 *
 * The disallow list is the set of routes that either hold nothing a search
 * result should point at, or that only make sense to the person already
 * signed in: the internal admin dashboard, the account-deletion flow, and
 * the API and Sentry tunnel routes.
 *
 * `/privacy` and `/account/delete` differ here on purpose. Play requires the
 * deletion page to be publicly reachable, and it is — it just should not be
 * competing for search traffic, so it is excluded from the sitemap and from
 * crawling while staying available to anyone with the link.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = productionDomain();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/monitoring", "/account/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
