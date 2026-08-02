import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // jsdom (used server-side only, in src/lib/rss/scrapeArticle.ts, to
  // extract full article text) has native-ish dynamic requires that
  // webpack/Turbopack shouldn't try to bundle — load it as a real Node
  // module at runtime instead.
  serverExternalPackages: ["jsdom"],
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
