/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Source maps are not published: nothing needs them in production.
  productionBrowserSourceMaps: false,
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
        // redirects here rather than serving a second copy of the app.
        // Matched on the exact old host so preview deployments are untouched.
        // /.well-known/ is excluded: domain-verification files must answer
        // directly, never via a redirect.
        source: "/:path((?!\.well-known).*)",
        has: [{ type: "host", value: "liree.vercel.app" }],
        destination: "https://sorlio.site/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
