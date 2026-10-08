import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminToken, revokeAdminSession } from "@/lib/admin/auth";
import { ADMIN_SESSION_TTL_SECONDS, createAdminSession, isAdminBearer } from "@/lib/admin/session";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store, max-age=0" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

/** Signs in to the feedback reader: exchanges the admin token for a fresh, expiring session. */
export async function POST(request: Request) {
  if (!(await rateLimit(`admin-session:${clientIp(request)}`, 8, 15 * 60_000))) {
    return json({ ok: false, error: "Too many attempts. Try again later." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  const submitted = typeof body === "object" && body !== null ? (body as { token?: unknown }).token : null;
  const token = adminToken();
  if (!token || typeof submitted !== "string" || !isAdminBearer(`Bearer ${submitted.trim()}`, token)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const session = createAdminSession(token, Date.now());
  const response = json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session.value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  return response;
}

/** Signs out: revokes the session server-side, then clears the cookie. */
export async function DELETE(request: Request) {
  try {
    await revokeAdminSession(request);
  } catch {
    return json({ ok: false, error: "Could not sign out. Please try again." }, 503);
  }
  const response = json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
