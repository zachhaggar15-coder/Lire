import { NextResponse } from "next/server";
import {
  VALIDATION_ADMIN_COOKIE,
  hasValidationAdminToken,
  validationAdminSessionValue,
} from "@/lib/admin/auth";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store, max-age=0" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

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
  const token = typeof submitted === "string" ? submitted.trim() : "";
  const authorized = hasValidationAdminToken(
    new Request(request.url, { headers: { authorization: `Bearer ${token}` } }),
  );
  const sessionValue = validationAdminSessionValue();
  if (!authorized || !sessionValue) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const response = json({ ok: true });
  response.cookies.set(VALIDATION_ADMIN_COOKIE, sessionValue, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return response;
}

export async function DELETE() {
  const response = json({ ok: true });
  response.cookies.set(VALIDATION_ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
