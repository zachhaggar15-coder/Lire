import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export const VALIDATION_ADMIN_COOKIE = "__Host-sorlio-validation-admin";

function adminToken(): string | null {
  const token = process.env.VALIDATION_ADMIN_TOKEN;
  return token?.trim() || null;
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

/** A one-way browser session value; the private admin token is never stored in a cookie. */
export function validationAdminSessionValue(): string | null {
  const token = adminToken();
  return token ? createHash("sha256").update(`sorlio-validation-admin:${token}`).digest("hex") : null;
}

export function isValidationAdminSessionValue(value: string | null | undefined): boolean {
  const expected = validationAdminSessionValue();
  return !!value && !!expected && safeEqual(value, expected);
}

function cookieValue(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  return header.match(new RegExp(`(?:^|;\\s*)${VALIDATION_ADMIN_COOKIE}=([^;]+)`))?.[1] ?? null;
}

/** Validates the private token shared by the internal validation tools. */
export function hasValidationAdminToken(request: Request): boolean {
  const token = adminToken();
  if (!token) return false;
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  return (!!bearer && safeEqual(bearer, token)) || isValidationAdminSessionValue(cookieValue(request));
}
