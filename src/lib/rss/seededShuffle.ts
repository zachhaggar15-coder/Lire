/**
 * Deterministic, seeded shuffle — used to pick "today's" reading selection
 * so it's stable for every request during the same day but changes the
 * next day. Never use Math.random() for this: it reseeds on every call, so
 * a plain random pick would change on every page refresh.
 */

/** Simple 32-bit string hash (FNV-1a-ish), used to turn a seed string into a numeric seed. */
function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** mulberry32: a small, fast, deterministic PRNG — good enough for a shuffle, not for anything cryptographic. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle driven by a seeded PRNG — same seed always produces the same order. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = mulberry32(hashSeed(seed));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Today's date as YYYY-MM-DD (UTC), the seed's date component. */
export function todayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
