import type { ReadingText } from "@/types";
import type { DifficultyEstimate } from "@/lib/difficulty";
import type { ScorableArticle } from "@/lib/recommendation/types";
import { estimateDifficulty } from "@/lib/difficulty";
import { analyseContentQuality } from "@/lib/rss/contentQuality";

/** A neutral placeholder for the rare case a non-French text reaches scoring (see the same guard in ReadingCard/Reader) — French dictionary-based scoring doesn't apply to it. */
const NEUTRAL_DIFFICULTY: DifficultyEstimate = {
  cefr: "B1",
  label: "Good level",
  wordCount: 0,
  avgSentenceLength: 0,
  dictionaryCoverage: 0.5,
  unknownWordRatio: 0.1,
};

/** Converts raw reading texts into the shape the scoring engine works with, computing difficulty and content-quality once per article. */
export function buildScorableArticles(texts: ReadingText[], knownWords: Set<string>): ScorableArticle[] {
  return texts.map((text) => ({
    text,
    difficulty: text.language === "en" ? NEUTRAL_DIFFICULTY : estimateDifficulty(text.body, knownWords),
    contentQuality: analyseContentQuality(text.body),
  }));
}
