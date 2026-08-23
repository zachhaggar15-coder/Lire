import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // jsdom (used server-side only, in src/lib/rss/scrapeArticle.ts, to
  // extract full article text) has native-ish dynamic requires that
  // webpack/Turbopack shouldn't try to bundle — load it as a real Node
  // module at runtime instead.
  serverExternalPackages: ["jsdom"],
  async redirects() {
    return [
      {
        // sorlio.site is the canonical origin. The old Vercel domain stays
        // connected to the project so existing links keep resolving, but it
        // redirects here rather than serving a second copy of the app —
        // two live origins would split search authority and let the old
        // brand keep circulating.
        //
        // Matched on the exact old host so preview deployments, which get
        // their own *.vercel.app hostnames, are untouched. localhost is
        // likewise unaffected.
        //
        // /.well-known/ is excluded: domain-verification files should keep
        // answering directly on whichever host is asked, never via a
        // redirect, which verifiers do not follow.
        source: "/:path((?!\.well-known).*)",
        has: [{ type: "host", value: "liree.vercel.app" }],
        destination: "https://sorlio.site/:path*",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Without SENTRY_AUTH_TOKEN (only needed for source-map upload at build
  // time), this silently skips the upload step — error capture itself still
  // works, stack traces are just minified until the token is added.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  // Routes client-side events through the app's own domain, so an ad
  // blocker on the reader's device can't silently drop them.
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});
