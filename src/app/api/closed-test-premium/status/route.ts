import { NextResponse } from "next/server";

const RETIRED_COOKIE = "__Host-sorlio-closed-test-premium";

/**
 * The header-based grant was retired because it was forgeable outside a
 * browser. Returning a stable false status also expires every previously
 * issued cookie, invalidating stale grants after deployment.
 */
export async function GET() {
  const response = NextResponse.json(
    { active: false, unavailable: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
  response.cookies.set(RETIRED_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
