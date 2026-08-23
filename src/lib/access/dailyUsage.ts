import { DAILY_FREE_ACCESS_KEY, localDateKey } from "@/lib/premium/freeAccess";

/**
 * What has been used today, on this device.
 *
 * Deliberately *not* keyed by user. That is what makes signing in carry usage
 * forward instead of resetting it: a guest who has read their article and used
 * their three lookups keeps those counts when they authenticate, and simply
 * gains the larger free-account ceiling. Keying by user would make
 * sign-in — and sign-out, and switching accounts — a daily-limit reset.
 *
 * Local-only, matching the philosophy of the free-article gate this replaces.
 * A determined person can clear their storage; that is accepted rather than
 * met with anti-abuse infrastructure for anonymous users. What it does prevent
 * is the loophole being a normal, discoverable part of the product.
 *
 * Fails open throughout. If storage is unavailable the reader keeps reading —
 * being locked out of a language app by a privacy setting is a worse failure
 * than an uncounted lesson.
 */

const USAGE_KEY = "lire.access.dailyUsage.v1";

export interface DailyUsage {
  dateKey: string;
  /** Distinct article ids opened today. Reopening one is free, so ids are stored rather than a count. */
  articleIds: string[];
  /** Word lookups used today. */
  lookups: number;
}

function emptyUsage(date: Date): DailyUsage {
  return { dateKey: localDateKey(date), articleIds: [], lookups: 0 };
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * Today's usage, migrating the single-article record this supersedes.
 *
 * The old store held `{ dateKey, articleId }` for the one free article. Read
 * once here so somebody mid-day does not get a second free article merely
 * because the format changed.
 */
export function getDailyUsage(date = new Date()): DailyUsage {
  if (!hasStorage()) return emptyUsage(date);
  const today = localDateKey(date);

  try {
    const raw = window.localStorage.getItem(USAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<DailyUsage> | null) : null;
    if (parsed && parsed.dateKey === today) {
      return {
        dateKey: today,
        articleIds: Array.isArray(parsed.articleIds) ? parsed.articleIds.filter((id): id is string => typeof id === "string") : [],
        lookups: typeof parsed.lookups === "number" && parsed.lookups > 0 ? Math.floor(parsed.lookups) : 0,
      };
    }
  } catch {
    // Unreadable usage is treated as none used, which errs towards letting
    // someone read.
  }

  return migrateLegacyFreeArticle(today);
}

function migrateLegacyFreeArticle(today: string): DailyUsage {
  try {
    const raw = window.localStorage.getItem(DAILY_FREE_ACCESS_KEY);
    const legacy = raw ? (JSON.parse(raw) as { dateKey?: string; articleId?: string } | null) : null;
    if (legacy?.dateKey === today && typeof legacy.articleId === "string") {
      return { dateKey: today, articleIds: [legacy.articleId], lookups: 0 };
    }
  } catch {
    // Same posture as above.
  }
  return { dateKey: today, articleIds: [], lookups: 0 };
}

function persist(usage: DailyUsage): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {
    // Restricted storage must not stop someone using the app.
  }
}

/** True when this article has already been counted today, so reopening it is free. */
export function hasOpenedArticleToday(articleId: string, date = new Date()): boolean {
  return getDailyUsage(date).articleIds.includes(articleId);
}

/** Records an article as opened. Returns the usage after recording. */
export function recordArticleOpened(articleId: string, date = new Date()): DailyUsage {
  const usage = getDailyUsage(date);
  if (usage.articleIds.includes(articleId)) return usage;
  const next = { ...usage, articleIds: [...usage.articleIds, articleId] };
  persist(next);
  return next;
}

/** Records one word lookup. Returns the usage after recording. */
export function recordLookup(date = new Date()): DailyUsage {
  const usage = getDailyUsage(date);
  const next = { ...usage, lookups: usage.lookups + 1 };
  persist(next);
  return next;
}

/** Test seam, and used when a day rolls over in a long-lived session. */
export function resetDailyUsage(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(USAGE_KEY);
  } catch {
    // Nothing useful to do.
  }
}
