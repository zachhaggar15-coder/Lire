import { closedTestPremiumEnabled } from "@/lib/closedTestPremium";

/** Server-only secret. The public enable flag is not sufficient to mint this cookie. */
const COOKIE_SECRET_ENV = "CLOSED_TEST_PREMIUM_COOKIE_SECRET";
export const CLOSED_TEST_PREMIUM_COOKIE = "__Host-sorlio-closed-test-premium";
const COOKIE_VERSION = "v1";
const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function secret(): string | null {
  const value = process.env[COOKIE_SECRET_ENV];
  return value && value.length >= 32 ? value : null;
}

/**
 * Both settings are required. Missing the secret deliberately fails closed so
 * a production flag can never accidentally trust a browser-supplied value.
 */
export function closedTestPremiumServerEnabled(): boolean {
  return closedTestPremiumEnabled() && secret() !== null;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

async function signingKey(): Promise<CryptoKey | null> {
  const value = secret();
  if (!value) return null;
  return crypto.subtle.importKey("raw", new TextEncoder().encode(value), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(payload: string): Promise<string | null> {
  const key = await signingKey();
  if (!key) return null;
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64Url(new Uint8Array(signature));
}

function cookieValue(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${CLOSED_TEST_PREMIUM_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

export interface ClosedTestPremiumGrant {
  /** Random, signed cookie identifier used only for temporary AI rate limiting. */
  principal: string;
}

/** Creates a short-lived, HttpOnly cookie after a genuine TWA document launch. */
export async function createClosedTestPremiumCookie(): Promise<{ value: string; maxAge: number } | null> {
  if (!closedTestPremiumServerEnabled()) return null;
  const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
  const principal = crypto.randomUUID();
  const payload = `${COOKIE_VERSION}.${expiresAt}.${principal}`;
  const signature = await sign(payload);
  return signature ? { value: `${payload}.${signature}`, maxAge: COOKIE_MAX_AGE_SECONDS } : null;
}

/**
 * Verifies the server-issued entitlement. A hand-written cookie value, the
 * public feature flag, and the client Android marker are all insufficient.
 */
export async function closedTestPremiumGrant(request: Request): Promise<ClosedTestPremiumGrant | null> {
  if (!closedTestPremiumServerEnabled()) return null;
  const raw = cookieValue(request);
  if (!raw) return null;
  const [version, expiresRaw, principal, signature, ...extra] = raw.split(".");
  if (extra.length || version !== COOKIE_VERSION || !principal || !signature) return null;
  const expiresAt = Number(expiresRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return null;
  const signatureBytes = fromBase64Url(signature);
  const key = await signingKey();
  if (!signatureBytes || !key) return null;
  const signatureBuffer = signatureBytes.buffer.slice(
    signatureBytes.byteOffset,
    signatureBytes.byteOffset + signatureBytes.byteLength,
  ) as ArrayBuffer;
  const verified = await crypto.subtle.verify("HMAC", key, signatureBuffer, new TextEncoder().encode(`${version}.${expiresAt}.${principal}`));
  return verified ? { principal } : null;
}
