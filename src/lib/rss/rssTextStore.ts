import { Redis } from "@upstash/redis";
import type { ReadingText } from "@/types";

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

const TTL_SECONDS = 60 * 60 * 48; // 48 hours — matches how long a shared link is likely to matter
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
    await Promise.all(
      texts.map((text) => redis.set(KEY_PREFIX + text.id, text, { ex: TTL_SECONDS }))
    );
  } catch {
    // Redis unreachable/misconfigured — persistence is a nice-to-have, not fatal.
  }
}

/** Fetches one previously-persisted RSS text by id. Returns null if unconfigured, expired, or not found. */
export async function getPersistedRssText(id: string): Promise<ReadingText | null> {
  const redis = getClient();
  if (!redis) return null;
  try {
    const value = await redis.get<ReadingText>(KEY_PREFIX + id);
    return value ?? null;
  } catch {
    return null;
  }
}

const CANDIDATE_POOL_KEY_PREFIX = "lire:candidatePool:";
/**
 * Slightly more than a full day, so a pool built late in the day (close to
 * the UTC rollover) is still there for the first few hours of the next one
 * while it gets rebuilt.
 */
const CANDIDATE_POOL_TTL_SECONDS = 60 * 60 * 30;

/**
 * Shares the built RSS candidate pool across every serverless instance, keyed
 * by calendar day (see todayKey() in seededShuffle.ts). Without this, each
 * cold-started instance has its own empty in-memory cache (see
 * candidatePoolCache in api/rss-texts/route.ts) and would rebuild
 * independently — meaning different instances (and therefore different
 * requests) could serve different-looking "today" selections, and there's
 * no guarantee any of them ever notices the calendar day has changed. A
 * shared, date-keyed store fixes both: every instance converges on the same
 * pool for the day, and a new day always misses (forcing exactly one real
 * rebuild, wherever the next request happens to land) rather than serving
 * stale content indefinitely. No-ops (returns null / does nothing) if no
 * Redis credentials are configured — behaviour then matches the old
 * in-memory-only cache, just without the cross-instance sharing.
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

export async function putPersistedCandidatePool(dateKey: string, pool: unknown): Promise<void> {
  const redis = getClient();
  if (!redis) return;
  try {
    await redis.set(CANDIDATE_POOL_KEY_PREFIX + dateKey, pool, { ex: CANDIDATE_POOL_TTL_SECONDS });
  } catch {
    // Best-effort only — the in-memory cache in route.ts still works without this.
  }
}
