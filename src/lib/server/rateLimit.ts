import { Redis } from "@upstash/redis";

const buckets = new Map<string, { count: number; resetAt: number }>();

function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

let redisClient: Redis | null | undefined;

function redis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const credentials = redisCredentials();
  redisClient = credentials ? new Redis(credentials) : null;
  return redisClient;
}

/**
 * Vercel injects this header at the edge. Do not use x-forwarded-for or
 * x-real-ip here: callers can supply those themselves and bypass a limit.
 */
export function clientIp(request: Request): string {
  return request.headers.get("x-vercel-forwarded-for")?.trim() || "unknown";
}

function localRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/**
 * Memory buckets are useful for local development and preview smoke tests,
 * but they are not a security boundary across production serverless workers.
 */
export function localRateLimitFallbackAllowed(
  env: { NODE_ENV?: string; VERCEL_ENV?: string } = process.env,
): boolean {
  return env.NODE_ENV !== "production" || env.VERCEL_ENV === "development" || env.VERCEL_ENV === "preview";
}

/**
 * Uses the project Redis store when configured, which makes limits consistent
 * across serverless instances. Production fails closed if the shared limiter
 * is absent or unavailable; an instance-local bucket is only used for local
 * development and preview smoke tests.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const client = redis();
  if (!client) {
    return localRateLimitFallbackAllowed() ? localRateLimit(key, limit, windowMs) : false;
  }

  const redisKey = `sorlio:rate-limit:${key}`;
  try {
    // INCR and expiry must be one atomic operation. If a process died between
    // two commands, the key could otherwise become permanent and block that
    // caller forever. Repair a missing TTL defensively as well.
    const count = await client.eval<[number], number>(
      `local count = redis.call("INCR", KEYS[1])
       local ttl = redis.call("PTTL", KEYS[1])
       if count == 1 or ttl < 0 then
         redis.call("PEXPIRE", KEYS[1], ARGV[1])
       end
       return count`,
      [redisKey],
      [Math.max(1, Math.ceil(windowMs))],
    );
    return count <= limit;
  } catch {
    return localRateLimitFallbackAllowed() ? localRateLimit(key, limit, windowMs) : false;
  }
}
