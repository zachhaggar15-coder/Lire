/**
 * Security headers for every response.
 *
 * The CSP has no nonce: nonces force every page to render per request, and
 * ~4,000 reader pages are statically generated. Without one, App Router's
 * inline bootstrap scripts need 'unsafe-inline'. What the policy still
 * guarantees: no script from any other origin, no eval in production, no
 * plugins, no framing, no <base> or form hijacking, and network access only
 * to this site and the Supabase project (the only origin the browser talks
 * to; OpenAI, Upstash and Google Play verification are server-side).
 *
 * One exception: Chrome checks a PaymentRequest's payment-method identifier
 * against connect-src, so Play Billing in the Android app needs exactly
 * https://play.google.com/billing (no request is sent to it by the page).
 */
function securityHeaders() {
  const isDev = process.env.NODE_ENV === "development";
  const supabaseOrigin = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
    } catch {
      return "";
    }
  })();
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' https://play.google.com/billing${supabaseOrigin ? ` ${supabaseOrigin}` : ""}${isDev ? " ws: wss:" : ""}`,
    "media-src 'self' blob:",
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    // Payment stays allowed for this origin: Play Billing in the Android app
    // runs through the Payment Request API.
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=(), browsing-topics=(), payment=(self)" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
  ];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The deployment environment, fixed at build time so client code cannot
  // depend on a dashboard variable being spelled right (production once had
  // NEXT_PUBLIC_DEPLOYMENT_EN). An explicit NEXT_PUBLIC_DEPLOYMENT_ENV still
  // wins; otherwise Vercel's own VERCEL_ENV, else "local".
  env: {
    NEXT_PUBLIC_DEPLOYMENT_ENV: process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || process.env.VERCEL_ENV || "local",
  },
  // Source maps are not published: nothing needs them in production.
  productionBrowserSourceMaps: false,
  // jsdom (used server-side only, in src/lib/rss/scrapeArticle.ts, to
  // extract full article text) has native-ish dynamic requires that
  // webpack/Turbopack shouldn't try to bundle — load it as a real Node
  // module at runtime instead.
  serverExternalPackages: ["jsdom"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders() }];
  },
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
