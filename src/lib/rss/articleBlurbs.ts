import { summarizeArticlesForBlurbs } from "@/lib/ai/openai";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";

/**
 * Fills in `blurbEn` on candidate-pool items — the home page's "what is
 * this about" English summary, shown on the card before a reader taps in.
 * Deliberately NOT the same pattern as "Ask AI for nuance"/"Ask AI to
 * explain" (which only ever run on an explicit per-reader tap): a blurb has
 * to exist before anyone taps anything, so it's generated once per
 * candidate-pool build (every CANDIDATE_POOL_TTL_MS, see the RSS route) and
 * shared across every reader until the pool refreshes, not per page view.
 *
 * Batched (a handful of articles per OpenAI call, run concurrently) rather
 * than one call per article, to keep the number of requests — and the
 * cost — per pool refresh small and roughly constant regardless of how
 * many candidates are in the pool.
 */

const CHUNK_SIZE = 12;
/** Enough for a real summary; short enough to keep a batch request small. */
const EXCERPT_LENGTH = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Mutates `items` in place, setting `blurbEn` wherever a summary came back.
 * Best-effort throughout: no `OPENAI_API_KEY`, a timed-out or malformed
 * batch response, or any other failure just leaves `blurbEn: null` for the
 * affected articles — never throws, never blocks the candidate pool from
 * being returned.
 */
export async function attachEnglishBlurbs(items: RssReadingText[]): Promise<void> {
  if (items.length === 0) return;
  const chunks = chunk(items, CHUNK_SIZE);

  // Concurrent, not sequential — bounds total wall time to roughly one
  // request's worth, not the sum of every chunk, so this can't blow past
  // the RSS route's own timeout budget on a large pool.
  await Promise.allSettled(
    chunks.map(async (group) => {
      const results = await summarizeArticlesForBlurbs(
        group.map((t) => ({ id: t.id, title: t.title, excerpt: t.originalText.slice(0, EXCERPT_LENGTH) }))
      );
      const byId = new Map(results.map((r) => [r.id, r.blurbEn]));
      for (const item of group) {
        const blurb = byId.get(item.id);
        if (blurb) item.blurbEn = blurb;
      }
    })
  );
}
