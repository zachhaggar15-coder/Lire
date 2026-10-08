import { localRateLimitFallbackAllowed, sharedRedis } from "@/lib/server/rateLimit";

/**
 * Server-side revocation list (currently: admin sessions).
 *
 * Entries live in the shared Redis store until the thing they revoke would
 * have expired anyway. Production fails closed: if the store is missing or
 * unreachable, everything counts as revoked, so a logout can never be
 * silently ignored. Local development and previews use process memory.
 */

const memory = new Map<string, number>();

export async function revoke(key: string, ttlMs: number): Promise<void> {
  const client = sharedRedis();
  if (client) {
    await client.set(`sorlio:revoked:${key}`, "1", { px: Math.max(1000, Math.ceil(ttlMs)) });
    return;
  }
  if (!localRateLimitFallbackAllowed()) throw new Error("revocation store unavailable");
  memory.set(key, Date.now() + ttlMs);
}

export async function isRevoked(key: string): Promise<boolean> {
  const client = sharedRedis();
  if (client) {
    try {
      return (await client.exists(`sorlio:revoked:${key}`)) === 1;
    } catch {
      return true;
    }
  }
  if (!localRateLimitFallbackAllowed()) return true;
  const until = memory.get(key);
  return until !== undefined && until > Date.now();
}
