export const DAILY_FREE_ACCESS_KEY = "lire.access.dailyArticle.v1";

export interface DailyFreeAccess {
  dateKey: string;
  articleId: string;
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyFreeAccess(date = new Date()): DailyFreeAccess | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DAILY_FREE_ACCESS_KEY) ?? "null") as Partial<DailyFreeAccess> | null;
    if (!parsed || parsed.dateKey !== localDateKey(date) || typeof parsed.articleId !== "string") return null;
    return { dateKey: parsed.dateKey, articleId: parsed.articleId };
  } catch {
    return null;
  }
}

/** Claims today's anonymous article. Reopening the same article remains free. */
export function claimDailyFreeArticle(articleId: string, date = new Date()): boolean {
  const existing = getDailyFreeAccess(date);
  if (existing) return existing.articleId === articleId;
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      DAILY_FREE_ACCESS_KEY,
      JSON.stringify({ dateKey: localDateKey(date), articleId } satisfies DailyFreeAccess)
    );
    return true;
  } catch {
    // Restricted storage must not prevent someone using the free tier.
    return true;
  }
}
