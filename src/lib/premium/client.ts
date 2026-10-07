import { getSupabaseClient } from "@/lib/supabase/client";
import { activeIdentity, readJson, storeFor, writeJson } from "@/lib/localData/store";
import { FREE_PREMIUM_STATUS, parsePremiumStatus, type PremiumStatus } from "@/lib/premium/types";

/**
 * Fetching the account's entitlement from the server.
 *
 * Rules (each one closes a hole the audit found):
 *   - Guests are never Premium.
 *   - Any HTTP answer from the server is authoritative: 401/403/4xx/5xx-with-
 *     body never fall back to a cached "Premium".
 *   - Only a network failure (no answer at all) may use the cache, and only a
 *     cache that (a) lives in this account's partition, (b) was confirmed by
 *     the server within OFFLINE_CACHE_MS, and (c) has an unexpired, valid
 *     expiry. Switching accounts therefore can never carry Premium across.
 *   - The cache is a display hint and nothing more: it is returned with
 *     `fromDeviceCache: true`, and confersPremium() never grants capability
 *     from it. Forging it therefore unlocks nothing — not local saves, not AI
 *     (refused by the server), not synced saves (refused by the database).
 */

const CACHE_KEY = "lire.premium.status.v1";
export const OFFLINE_CACHE_MS = 72 * 60 * 60 * 1000;

interface CachedStatus {
  userId: string;
  status: PremiumStatus;
  confirmedAt: string;
}

function readCache(userId: string, now: number): PremiumStatus | null {
  const identity = activeIdentity();
  if (identity.kind !== "account" || identity.userId !== userId) return null;
  const cached = readJson<CachedStatus | null>(CACHE_KEY, null, storeFor(identity));
  if (!cached || cached.userId !== userId) return null;
  const confirmed = Date.parse(cached.confirmedAt);
  if (!Number.isFinite(confirmed) || confirmed > now || now - confirmed > OFFLINE_CACHE_MS) return null;
  const parsed = parsePremiumStatus(cached.status, now);
  return parsed.isPremium ? { ...parsed, stale: true, fromDeviceCache: true } : null;
}

function writeCache(userId: string, status: PremiumStatus): void {
  const identity = activeIdentity();
  if (identity.kind !== "account" || identity.userId !== userId) return;
  writeJson(CACHE_KEY, { userId, status, confirmedAt: new Date().toISOString() } satisfies CachedStatus, storeFor(identity));
}

export type StatusFetcher = (token: string) => Promise<Response>;

const defaultFetcher: StatusFetcher = (token) =>
  fetch("/api/premium/status", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });

/** The signed-in session, if any. Injectable so tests need no live auth client. */
export type SessionSource = () => Promise<{ access_token: string; user: { id: string } } | null>;

const defaultSession: SessionSource = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
};

export async function fetchPremiumStatus(
  fetcher: StatusFetcher = defaultFetcher,
  now = Date.now(),
  getSession: SessionSource = defaultSession,
): Promise<PremiumStatus> {
  const session = await getSession();
  if (!session) return FREE_PREMIUM_STATUS;
  const userId = session.user.id.toLowerCase();

  let response: Response;
  try {
    response = await fetcher(session.access_token);
  } catch {
    // No answer at all: offline or the server is unreachable.
    return readCache(userId, now) ?? { ...FREE_PREMIUM_STATUS, unverified: true };
  }
  if (!response.ok) {
    // The server answered, and the answer is not "Premium".
    return { ...FREE_PREMIUM_STATUS, unverified: response.status >= 500 };
  }
  const body = await response.json().catch(() => null);
  const status = parsePremiumStatus(body, now);
  writeCache(userId, status);
  return status;
}
