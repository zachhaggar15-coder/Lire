import type { Category } from "@/types";
import type { ScoringContext } from "@/lib/recommendation/types";
import { getInterestProfile } from "@/lib/recommendation/interests";
import { inferUserLevelNumeric } from "@/lib/recommendation/signals";
import { getKnownWords } from "@/lib/knownWords";
import { getArchive } from "@/lib/archive";

/** How far back "recently read" looks for the variety signal. */
const RECENT_DAYS = 7;

/** Gathers all the localStorage-backed state the scoring engine needs into one context object — the only place score.ts's callers need to know where that state lives. */
export function buildScoringContext(now: Date = new Date()): ScoringContext {
  const interestProfile = getInterestProfile();
  const userLevelNumeric = inferUserLevelNumeric(getKnownWords().length);

  const cutoffMs = now.getTime() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const recentCategories: Category[] = getArchive()
    .filter((entry) => entry.category && new Date(entry.completedAt).getTime() >= cutoffMs)
    .map((entry) => entry.category as Category);

  return { interestProfile, recentCategories, userLevelNumeric, now };
}
