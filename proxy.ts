import { NextResponse, type NextRequest } from "next/server";
import { isAndroidAppReferrer } from "@/lib/androidApp";
import { CLOSED_TEST_PREMIUM_COOKIE, createClosedTestPremiumCookie, closedTestPremiumServerEnabled } from "@/lib/closedTestPremiumServer";

/**
 * A TWA's initial document navigation carries android-app://app.sorlio.reader
 * as its referrer. Turn that one browser-provided signal into a signed,
 * HttpOnly entitlement cookie; the client-side localStorage marker is never
 * trusted for access to a server-side AI endpoint.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const isDocument = request.method === "GET" && request.headers.get("sec-fetch-dest") === "document";
  if (!isDocument || !closedTestPremiumServerEnabled() || !isAndroidAppReferrer(request.headers.get("referer"))) return response;

  const grant = await createClosedTestPremiumCookie();
  if (!grant) return response;
  response.cookies.set(CLOSED_TEST_PREMIUM_COOKIE, grant.value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: grant.maxAge,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
