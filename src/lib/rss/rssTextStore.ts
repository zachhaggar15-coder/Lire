import { Redis } from "@upstash/redis";
import type { ReadingText } from "@/types";
import { cleanReadingTextSourceNoise } from "@/lib/rss/sourceNoise";

/**
 * Optional server-side persistence for RSS texts, so a direct link to an
 * RSS article survives a new tab or app restart (sessionStorage alone only
 * covers the current tab/session — see rssTextCache.ts for that layer).
 *
 * Backed by Upstash Redis (the REST-based Redis Vercel now recommends in
 * place of the deprecated @vercel/kv package). Entirely optional: if no
 * credentials are configured, every function here silently no-ops and the
 * app behaves exactly as it did before — RSS reader links just don't
 * survive a fresh tab, same as today.
 *
 * Supports both env var naming conventions Vercel's Redis integrations use
 * depending on how the store was provisioned:
 *   - KV_REST_API_URL / KV_REST_API_TOKEN (older "Vercel KV" naming)
 *   - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (Upstash-native naming)
 */

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days — long enough that a link shared today doesn't quietly die by the weekend
const KEY_PREFIX = "lire:rssText:";

function getCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

let client: Redis | null | undefined;

function getClient(): Redis | null {
  if (client !== undefined) return client;
  const creds = getCredentials();
  client = creds ? new Redis(creds) : null;
  return client;
}

/** Persists a batch of RSS texts, keyed by id, with a TTL. No-ops if unconfigured. */
export async function putPersistedRssTexts(texts: ReadingText[]): Promise<void> {
  const redis = getClient();
  if (!redis) return;
  try {
    const pipeline = redis.pipeline();
    for (const text of texts) {
      pipeline.set(KEY_PREFIX + text.id, cleanReadingTextSourceNoise(text), { ex: TTL_SECONDS });
    }
    if (pipeline.length() > 0) await pipeline.exec();
  } catch {
    // Redis unreachable/misconfigured — persistence is a nice-to-have, not fatal.
  }
}

/**
 * Fetches one previously-persisted RSS text by id. Returns null if
 * unconfigured, expired, or not found.
 *
 * Sliding expiration: a successful read refreshes the TTL back to the full
 * window, so an article link that keeps getting opened (shared in a group
 * chat, revisited over days) stays alive indefinitely, while one nobody
 * looks at still ages out. Fire-and-forget — a failed refresh just means
 * the existing TTL keeps counting down, never breaks the read itself.
 */
export async function getPersistedRssText(id: string): Promise<ReadingText | null> {
  const redis = getClient();
  if (!redis) return null;
  try {
    const value = await redis.get<ReadingText>(KEY_PREFIX + id);
    if (!value) return null;
    const sanitized = cleanReadingTextSourceNoise(value);
    if (sanitized === value) {
      redis.expire(KEY_PREFIX + id, TTL_SECONDS).catch(() => {});
    } else {
      redis.set(KEY_PREFIX + id, sanitized, { ex: TTL_SECONDS }).catch(() => {});
    }
    return sanitized;
  } catch {
    return null;
  }
}

const CANDIDATE_POOL_KEY_PREFIX = "lire:candidatePool:";
const CURRENT_CANDIDATE_POOL_KEY = `${CANDIDATE_POOL_KEY_PREFIX}current`;
const CANDIDATE_POOL_REFRESH_LOCK_KEY = `${CANDIDATE_POOL_KEY_PREFIX}refresh-lock`;
const CANDIDATE_POOL_TTL_SECONDS = 60 * 60 * 24 * 7;
const CANDIDATE_POOL_REFRESH_LOCK_SECONDS = 3 * 60;

export interface CandidatePoolPersistenceResult {
  ok: boolean;
  configured: boolean;
  reason: string;
}

export function isRssPersistenceConfigured(): boolean {
  return getCredentials() !== null;
}

/**
 * Shares the built RSS candidate pool across every serverless instance, keyed
 * by calendar day (see todayKey() in seededShuffle.ts). Without this, each
 * cold-started instance has its own empty in-memory cache (see
 * candidatePoolCache in api/rss-texts/route.ts) and would rebuild
 * independently — meaning different instances (and therefore different
 * requests) could serve different-looking "today" selections, and there's
 * no guarantee any of them ever notices the calendar day has changed. A
 * shared store fixes both: every instance converges on the same promoted
 * pool, while the dated keys retain several days of last-known-good content.
 * Missing credentials return null; the public route then serves its bundled
 * fallback immediately rather than rebuilding in a user's request.
 */
export async function getPersistedCandidatePool<T>(dateKey: string): Promise<T | null> {
  const redis = getClient();
  if (!redis) return null;
  try {
    const value = await redis.get<T>(CANDIDATE_POOL_KEY_PREFIX + dateKey);
    return value ?? null;
  } catch {
    return null;
  }
}

/** Returns the newest successfully promoted pool, regardless of its calendar day. */
export async function getCurrentPersistedCandidatePool<T>(): Promise<T | null> {
  const redis = getClient();
  if (!redis) return null;
  try {
    const value = await redis.get<T>(CURRENT_CANDIDATE_POOL_KEY);
    return value ?? null;
  } catch {
    return null;
  }
}

/**
 * Saves to a staging key first, verifies that it can be read back, then
 * atomically promotes both the dated key and the shared `current` key. A
 * failed refresh therefore never overwrites the last known-good pool.
 */
export async function promotePersistedCandidatePool(
  dateKey: string,
  pool: { builtAt: number }
): Promise<CandidatePoolPersistenceResult> {
  const redis = getClient();
  if (!redis) {
    return { ok: false, configured: false, reason: "RSS persistence is not configured" };
  }

  const stageKey = `${CANDIDATE_POOL_KEY_PREFIX}staging:${dateKey}:${pool.builtAt}`;

  try {
    await redis.set(stageKey, pool, { ex: 10 * 60 });
    const staged = await redis.get<{ builtAt?: number }>(stageKey);
    if (!staged || staged.builtAt !== pool.builtAt) {
      return {
        ok: false,
        configured: true,
        reason: "Redis staging readback did not match the completed pool",
      };
    }

    await redis
      .multi()
      .set(CANDIDATE_POOL_KEY_PREFIX + dateKey, pool, { ex: CANDIDATE_POOL_TTL_SECONDS })
      .set(CURRENT_CANDIDATE_POOL_KEY, pool, { ex: CANDIDATE_POOL_TTL_SECONDS })
      .del(stageKey)
      .exec();

    const promoted = await redis.get<{ builtAt?: number }>(CURRENT_CANDIDATE_POOL_KEY);
    if (!promoted || promoted.builtAt !== pool.builtAt) {
      return {
        ok: false,
        configured: true,
        reason: "Redis promotion readback did not match the completed pool",
      };
    }

    return { ok: true, configured: true, reason: "Candidate pool persisted and verified" };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      reason: error instanceof Error ? error.message : "Redis persistence failed",
    };
  }
}

export type CandidatePoolRefreshLockResult =
  | { status: "acquired"; token: string }
  | { status: "busy" }
  | { status: "failed"; reason: string };

/** Acquires a cross-instance lock so only one expensive RSS rebuild runs. */
export async function acquireCandidatePoolRefreshLock(): Promise<CandidatePoolRefreshLockResult> {
  const redis = getClient();
  if (!redis) return { status: "failed", reason: "RSS persistence is not configured" };
  const token = `${Date.now()}:${crypto.randomUUID()}`;

  try {
    const result = await redis.set(CANDIDATE_POOL_REFRESH_LOCK_KEY, token, {
      ex: CANDIDATE_POOL_REFRESH_LOCK_SECONDS,
      nx: true,
    });
    return result === "OK" ? { status: "acquired", token } : { status: "busy" };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Redis refresh lock failed",
    };
  }
}

export async function releaseCandidatePoolRefreshLock(token: string): Promise<void> {
  const redis = getClient();
  if (!redis) return;

  try {
    const script = redis.createScript<number>(
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end"
    );
    await script.eval([CANDIDATE_POOL_REFRESH_LOCK_KEY], [token]);
  } catch {
    // The lock has a short TTL, so a failed cleanup cannot wedge refreshes.
  }
}
