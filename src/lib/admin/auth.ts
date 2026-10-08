import "server-only";

import { isAdminBearer, isValidAdminSession, readAdminSession, type AdminSessionDeps } from "@/lib/admin/session";
import { isRevoked, revoke } from "@/lib/server/revocations";

// A new cookie name: sessions issued by the old deterministic scheme are
// simply never read again.
export const ADMIN_SESSION_COOKIE = "__Host-sorlio-admin-session";

export function adminToken(): string | null {
  return process.env.VALIDATION_ADMIN_TOKEN?.trim() || null;
}

function deps(): AdminSessionDeps {
  return { token: adminToken(), nowMs: Date.now(), isRevoked: (id) => isRevoked(`admin-session:${id}`) };
}

export async function isAdminSessionCookie(value: string | null | undefined): Promise<boolean> {
  return isValidAdminSession(value, deps());
}

function cookieValue(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  return header.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`))?.[1] ?? null;
}

/** Admin token as a bearer header, or a valid, unexpired, unrevoked session cookie. */
export async function hasAdminAccess(request: Request): Promise<boolean> {
  if (isAdminBearer(request.headers.get("authorization"), adminToken())) return true;
  return isAdminSessionCookie(cookieValue(request));
}

/** Revokes the request's session server-side so a copied cookie stops working. */
export async function revokeAdminSession(request: Request): Promise<void> {
  const session = readAdminSession(adminToken(), cookieValue(request), Date.now());
  if (!session) return;
  const ttlMs = Math.max(1000, session.expiresAt * 1000 - Date.now());
  await revoke(`admin-session:${session.sessionId}`, ttlMs);
}
