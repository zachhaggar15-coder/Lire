import { NextResponse } from "next/server";

const PACKAGE_NAME = "app.liree.reader";

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
