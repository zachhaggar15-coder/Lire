import { NextResponse } from "next/server";

/**
 * Read the fingerprint at request time, not at build time.
 *
 * Without this, Next.js prerenders the route during the build and bakes
 * whatever `ANDROID_APP_SHA256_CERT_FINGERPRINT` held at that moment into a
 * static file. Setting the variable in the host's dashboard then appears to do
 * nothing, and the route keeps serving `[]` — which reads as "asset links are
 * broken" rather than "you need to rebuild". Since the value comes from Play
 * Console *after* the first upload, that ordering bites exactly once, at the
 * least convenient time.
 *
 * The Cache-Control header below still gives the CDN a 5-minute cache, so
 * serving this per-request costs nothing in practice.
 */
export const dynamic = "force-dynamic";

const PACKAGE_NAME = "app.sorlio.reader";

function fingerprints(): string[] {
  return (process.env.ANDROID_APP_SHA256_CERT_FINGERPRINT ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
}

export async function GET() {
  const sha256CertFingerprints = fingerprints();
  const statements = sha256CertFingerprints.length
    ? [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: PACKAGE_NAME,
            sha256_cert_fingerprints: sha256CertFingerprints,
          },
        },
      ]
    : [];

  return NextResponse.json(statements, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
