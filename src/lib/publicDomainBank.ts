import type { Category, Difficulty, ReadingText } from "@/types";
import { publicDomainTexts } from "@/data/publicDomainTexts";
import { starterTexts } from "@/data/starterTexts";
import { seededShuffle, todayKey } from "@/lib/rss/seededShuffle";
import { stripMetadataOnlyBlurb } from "@/lib/readingSummaries";

export const DAILY_BANK_ARTICLE_LIMIT = 8;
export const DAILY_RSS_ARTICLE_LIMIT = 2;

const CEFR_ORDER: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function isPublicDomainBankText(text: ReadingText): boolean {
  return text.id.startsWith("pd-");
}

/** Original beginner texts written for the app — see data/starterTexts.ts. */
export function isStarterText(text: ReadingText): boolean {
  return text.id.startsWith("starter-");
}

export function adjacentLevels(level: Difficulty): Difficulty[] {
  const index = CEFR_ORDER.indexOf(level);
  if (index === -1) return CEFR_ORDER;
  return [
    level,
    CEFR_ORDER[index - 1],
    CEFR_ORDER[index + 1],
    CEFR_ORDER[index - 2],
    CEFR_ORDER[index + 2],
  ].filter((item): item is Difficulty => !!item);
}

export function getDailyBankTexts({
  level,
  category,
  limit = DAILY_BANK_ARTICLE_LIMIT,
  date = new Date(),
}: {
  level: Difficulty;
  category?: Category | "all";
  limit?: number;
  date?: Date;
}): ReadingText[] {
  const allowedLevels = adjacentLevels(level);
  const categoryKey = category ?? "all";
  const candidates = [...starterTexts, ...publicDomainTexts].filter((text) => {
    if (!allowedLevels.includes(text.difficulty)) return false;
    if (categoryKey !== "all" && text.category !== categoryKey) return false;
    return true;
  });
  const starterCandidates = candidates.filter(isStarterText);
  const beginnerStarterOnly = (level === "A1" || level === "A2") && starterCandidates.length > 0;
  const pool = beginnerStarterOnly ? starterCandidates : candidates;

  return seededShuffle(pool, `${todayKey(date)}::bank::${level}::${categoryKey}`)
    .sort((a, b) => {
      // Texts at exactly the requested level lead, then the nearest
      // neighbours. This has to come before the starter-first preference:
      // the starter set is A1/A2 only, so preferring it unconditionally
      // floated beginner texts above every B1/B2 text and — combined with
      // the browser's strict per-level filter — left an explicit B1 or B2
      // selection showing nothing at all.
      const distanceA = Math.abs(CEFR_ORDER.indexOf(a.difficulty) - CEFR_ORDER.indexOf(level));
      const distanceB = Math.abs(CEFR_ORDER.indexOf(b.difficulty) - CEFR_ORDER.indexOf(level));
      if (distanceA !== distanceB) return distanceA - distanceB;
      // Within the same level, purpose-written texts come first. The
      // public-domain bank is 19th-century literature, so even its "A1"
      // excerpts read far above a real beginner; they stay available but
      // shouldn't be what someone meets first at any level we've written for.
      return Number(isStarterText(b)) - Number(isStarterText(a));
    })
    .slice(0, limit)
    .map(stripMetadataOnlyBlurb);
}
