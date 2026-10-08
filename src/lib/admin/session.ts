import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Admin browser sessions (the feedback reader).
 *
 * Each sign-in mints its own session: a random id and an expiry, signed with
 * the admin token. The server checks the signature, the expiry and a
 * revocation list on every request, so
 *   - a copied cookie stops working when it expires, on logout (its id is
 *     revoked server-side), and when the admin token is rotated (the signature
 *     no longer verifies);
 *   - two sign-ins never share a value, and nothing about the admin token can
 *     be derived from a cookie.
 *
 * Pure: the token, clock and revocation lookup are passed in (see auth.ts).
 */

export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;
const VERSION = "v2";

export interface AdminSessionDeps {
  token: string | null;
  nowMs: number;
  isRevoked: (sessionId: string) => Promise<boolean>;
}

function sign(token: string, payload: string): string {
  return createHmac("sha256", token).update(`sorlio-admin-session:${payload}`).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminSession(token: string, nowMs: number, sessionId = randomBytes(18).toString("base64url")) {
  const expiresAt = Math.floor(nowMs / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = `${VERSION}.${sessionId}.${expiresAt}`;
  return { value: `${payload}.${sign(token, payload)}`, sessionId, expiresAt };
}

/** Parses and checks signature and expiry. Does not consult revocation. */
export function readAdminSession(token: string | null, value: string | null | undefined, nowMs: number) {
  if (!token || !value) return null;
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) return null;
  const [, sessionId, expiresRaw, signature] = parts;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(sessionId) || !/^\d{1,12}$/.test(expiresRaw)) return null;
  if (!safeEqual(signature, sign(token, `${VERSION}.${sessionId}.${expiresRaw}`))) return null;
  const expiresAt = Number(expiresRaw);
  const now = Math.floor(nowMs / 1000);
  // Expired, or claims a lifetime longer than any session we issue.
  if (expiresAt <= now || expiresAt > now + ADMIN_SESSION_TTL_SECONDS) return null;
  return { sessionId, expiresAt };
}

export async function isValidAdminSession(value: string | null | undefined, deps: AdminSessionDeps): Promise<boolean> {
  const session = readAdminSession(deps.token, value, deps.nowMs);
  if (!session) return false;
  return !(await deps.isRevoked(session.sessionId));
}

/** The admin token itself, presented as a bearer credential (scripts, curl). */
export function isAdminBearer(authorization: string | null, token: string | null): boolean {
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return !!token && !!bearer && safeEqual(bearer, token);
}
