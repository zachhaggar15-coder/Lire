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

  return seededShuffle(candidates, `${todayKey(date)}::bank::${level}::${categoryKey}`)
    .sort((a, b) => {
      // Purpose-written beginner texts come first at every level. The
      // public-domain bank is 19th-century literature, so even its "A1"
      // excerpts are far above a real A1 reader; those stay available (and
      // are the only option higher up), but they shouldn't be what someone
      // meets on their first day.
      const starterFirst = Number(isStarterText(b)) - Number(isStarterText(a));
      if (starterFirst !== 0) return starterFirst;
      return allowedLevels.indexOf(a.difficulty) - allowedLevels.indexOf(b.difficulty);
    })
    .slice(0, limit)
    .map(stripMetadataOnlyBlurb);
}
