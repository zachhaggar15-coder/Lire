export const RSS_LISTING_CDN_CACHE_CONTROL = "public, s-maxage=21600, stale-while-revalidate=86400";

/**
 * Keep browsers revalidating while Vercel serves the shared, non-personalised
 * listing from its CDN. Diagnostic, refresh and individual-item responses do
 * not use these headers.
 */
export function getRssListingCacheHeaders(): Record<string, string> {
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Vercel-CDN-Cache-Control": RSS_LISTING_CDN_CACHE_CONTROL,
  };
}
