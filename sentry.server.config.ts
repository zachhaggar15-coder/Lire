import * as Sentry from "@sentry/nextjs";

// Reuses the same public DSN as the client — a DSN is a write-only endpoint
// identifier, not a secret, so there's no need for a separate server-only value.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Attach local variable values to stack frames — much easier to diagnose
  // a server-side crash without needing to reproduce it locally.
  includeLocalVariables: true,
});
