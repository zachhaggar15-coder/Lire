/**
 * Persistence for the reader's "Summarise it" box.
 *
 * This used to be component state only: a learner would write a summary in
 * their own words — genuinely the most effortful thing the reader asks of
 * them — and it was thrown away the moment they navigated off the article,
 * with no way to get it back. The text was read exactly once, to set a
 * boolean for the completion gamification. Keeping it means a second pass on
 * an article can show what you understood the first time.
 *
 * Stored per article id, oldest entries evicted past MAX_SUMMARIES so this
 * can't become the next unbounded consumer of the localStorage quota (see
 * the article translation cache in dictionary/articleTranslation.ts).
 */

const KEY = "lire.articleSummaries.v1";
const MAX_SUMMARIES = 200;
/** Longer than any reasonable summary; guards against a runaway paste filling storage. */
const MAX_SUMMARY_LENGTH = 4000;

export interface ArticleSummary {
  textId: string;
  summary: string;
  updatedAt: string;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function normalize(entry: unknown): ArticleSummary | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  if (typeof e.textId !== "string" || !e.textId) return null;
  if (typeof e.summary !== "string") return null;
  return {
    textId: e.textId,
    summary: e.summary.slice(0, MAX_SUMMARY_LENGTH),
    updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : new Date(0).toISOString(),
  };
}

function readAll(): ArticleSummary[] {
  if (!hasStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((entry): entry is ArticleSummary => entry !== null);
  } catch {
    return [];
  }
}

/** Returns the saved summary for an article, or "" if there isn't one. */
export function getArticleSummary(textId: string): string {
  return readAll().find((entry) => entry.textId === textId)?.summary ?? "";
}

/**
 * Saves (or clears, when blank) the summary for one article. Never throws —
 * a failed write costs the draft, not the reading session.
 */
export function saveArticleSummary(textId: string, summary: string): void {
  if (!hasStorage()) return;
  const trimmed = summary.trim().slice(0, MAX_SUMMARY_LENGTH);
  const others = readAll().filter((entry) => entry.textId !== textId);
  const next = trimmed
    ? [{ textId, summary: trimmed, updatedAt: new Date().toISOString() }, ...others]
    : others;

  try {
    window.localStorage.setItem(KEY, JSON.stringify(next.slice(0, MAX_SUMMARIES)));
  } catch {
    // Storage full or unavailable — nothing useful to do here.
  }
}
