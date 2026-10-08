"use client";

import { useEffect } from "react";

/**
 * Last-resort error screen when the root layout itself fails. Plain, branded
 * and recoverable — no stack traces or provider messages. Errors are not sent
 * to any third party; server-side failures appear in Vercel's function logs.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Visible in the browser console only, for the person debugging locally.
    console.error(error.digest ? `Sorlio error ${error.digest}` : "Sorlio error");
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FFFCF4", color: "#1f1d1a" }}>
        <main style={{ maxWidth: 420, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 22 }}>Something went wrong</h1>
          <p style={{ lineHeight: 1.5, color: "#5b554a" }}>
            Sorlio hit an unexpected problem. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ marginTop: 16, minHeight: 48, padding: "0 24px", borderRadius: 999, border: 0, background: "#2f5d50", color: "#fff", fontWeight: 600 }}
          >
            Try again
          </button>
          <p style={{ marginTop: 16 }}>
            {/* A full page load on purpose: the app shell itself failed. */}
            <button type="button" onClick={() => window.location.assign("/")} style={{ background: "none", border: 0, color: "#2f5d50", textDecoration: "underline", minHeight: 44 }}>
              Go to the home page
            </button>
          </p>
        </main>
      </body>
    </html>
  );
}
