/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // jsdom (used server-side only, in src/lib/rss/scrapeArticle.ts, to
  // extract full article text) has native-ish dynamic requires that
  // webpack/Turbopack shouldn't try to bundle — load it as a real Node
  // module at runtime instead.
  serverExternalPackages: ["jsdom"],
};

export default nextConfig;
