import * as Sentry from "@sentry/nextjs";

// No DSN configured (local dev without .env.local, or a fork) -> no-op, same as before Sentry existed.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 100% in dev, 10% in production — cheap enough at this app's traffic to
  // get real signal without a meaningful ingest cost.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Session Replay: only recorded for sessions that actually error, so a
  // crash comes with a video of what led to it, without paying for replay
  // storage on every normal session.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],
});

// Hook into App Router navigation transitions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
