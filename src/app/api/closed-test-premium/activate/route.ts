import { NextResponse, type NextRequest } from "next/server";
import { isAndroidAppReferrer } from "@/lib/androidApp";
import { CLOSED_TEST_PREMIUM_COOKIE, createClosedTestPremiumCookie } from "@/lib/closedTestPremiumServer";

/**
 * Some TWA/edge combinations expose android-app:// only to document.referrer,
 * not the navigation's HTTP Referer header. The app forwards that one launch
 * signal here so the server can mint the same signed, HttpOnly grant.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ active: false }, { status: 403 });
  }

  if (!isAndroidAppReferrer(request.headers.get("x-sorlio-twa-referrer"))) {
    return NextResponse.json({ active: false }, { status: 403 });
  }

  const grant = await createClosedTestPremiumCookie();
  if (!grant) return NextResponse.json({ active: false }, { status: 403 });

  const response = NextResponse.json({ active: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  response.cookies.set(CLOSED_TEST_PREMIUM_COOKIE, grant.value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: grant.maxAge,
  });
  return response;
}
