import type { Category, Difficulty, ReadingText } from "@/types";
import { publicDomainTexts } from "@/data/publicDomainTexts";
import { seededShuffle, todayKey } from "@/lib/rss/seededShuffle";

export const DAILY_BANK_ARTICLE_LIMIT = 8;
export const DAILY_RSS_ARTICLE_LIMIT = 2;

const CEFR_ORDER: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function isPublicDomainBankText(text: ReadingText): boolean {
  return text.id.startsWith("pd-");
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
  const candidates = publicDomainTexts.filter((text) => {
    if (!allowedLevels.includes(text.difficulty)) return false;
    if (categoryKey !== "all" && text.category !== categoryKey) return false;
    return true;
  });

  return seededShuffle(candidates, `${todayKey(date)}::bank::${level}::${categoryKey}`)
    .sort((a, b) => {
      const levelDistance = allowedLevels.indexOf(a.difficulty) - allowedLevels.indexOf(b.difficulty);
      return levelDistance !== 0 ? levelDistance : 0;
    })
    .slice(0, limit);
}
