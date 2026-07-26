import type { Category, Difficulty, ReadingText } from "@/types";
import { starterTexts } from "@/data/starterTexts";
import { lookupWord } from "@/lib/dictionary/lookup";
import { tokenize } from "@/lib/words";
import { JOURNEY_SECTIONS, sectionedTextIds } from "@/lib/journey/sections";

export const TEXTS_PER_STAGE = 5;
export const ROUTE_STAGES_PER_BAND = 10;
export const JOURNEY_BANDS: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const INTRINSIC_WEIGHTS = {
  sentenceLength: 0.35,
  wordCount: 0.25,
  lowFrequencyShare: 0.3,
  minutes: 0.1,
} as const;

type AutoStageTheme = Category | "mixed";

const AUTO_STAGE_LABELS: Record<AutoStageTheme, string[]> = {
  "everyday life": ["Everyday scenes", "Home and routine", "People and places", "Daily choices"],
  sport: ["Sport and movement", "Active life", "Games and effort", "Body and practice"],
  culture: ["Culture and stories", "Art and ideas", "Music and memory", "French life"],
  science: ["How things work", "Nature and science", "Everyday science", "Curious questions"],
  "news-style": ["Local reports", "Public life", "News practice", "Civic moments"],
  mixed: ["Mixed practice", "Real-world reads", "Short readings", "Fresh practice"],
};

export interface LadderText {
  id: string;
  band: Difficulty;
  stageIndexInBand: number;
  globalStageIndex: number;
  intrinsicDifficulty: number;
}

export interface Stage {
  globalIndex: number;
  band: Difficulty;
  indexInBand: number;
  textIds: string[];
  label: string;
  themes: StageTheme[];
}

export interface StageTheme {
  id: string;
  title: string;
  textIds: string[];
}

export interface BuiltLadder {
  stages: Stage[];
  texts: LadderText[];
  textToStage: Map<string, number>;
  textById: Map<string, ReadingText>;
}

interface RawScore {
  text: ReadingText;
  sentenceLength: number;
  wordCount: number;
  lowFrequencyShare: number;
  minutes: number;
}

let cached: BuiltLadder | null = null;

function sentenceCount(body: string): number {
  return Math.max(1, (body.match(/[.!?\u2026]+(?:\s|$)/g) ?? []).length);
}

function normalize(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  if (max <= min) return 0;
  return (value - min) / (max - min);
}

function isLowFrequencyWord(surface: string): boolean {
  const lookup = lookupWord(surface);
  if (lookup.frequencyRank != null) return lookup.frequencyRank >= 4500;
  return surface.length >= 9;
}

function rawScore(text: ReadingText): RawScore {
  const tokens = tokenize(text.body).filter((token) => token.isWord && token.clean);
  const wordCount = tokens.length;
  const lowFrequencyCount = tokens.filter((token) => isLowFrequencyWord(token.text)).length;
  return {
    text,
    sentenceLength: wordCount / sentenceCount(text.body),
    wordCount,
    lowFrequencyShare: wordCount === 0 ? 0 : lowFrequencyCount / wordCount,
    minutes: text.minutes,
  };
}

function autoStageTheme(texts: ReadingText[]): AutoStageTheme {
  const counts = new Map<Category, number>();
  for (const text of texts) counts.set(text.category, (counts.get(text.category) ?? 0) + 1);
  const [topCategory, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? [];
  if (!topCategory || !topCount) return "mixed";
  return topCount >= Math.ceil(texts.length / 2) ? topCategory : "mixed";
}

function autoStageLabel(texts: ReadingText[], stageNumber: number): string {
  const labels = AUTO_STAGE_LABELS[autoStageTheme(texts)];
  return labels[(stageNumber - 1) % labels.length];
}

function compactThemeTitle(title: string): string {
  return title
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s+in daily life$/i, "")
    .replace(/^The\s+/i, "")
    .trim();
}

function groupedStageLabel(themes: StageTheme[]): string {
  const titles = themes.map((theme) => compactThemeTitle(theme.title));
  if (titles.length <= 2) return titles.join(" + ");
  return `${titles[0]} + ${titles[titles.length - 1]}`;
}

function groupThemesForRoute(themes: StageTheme[]): StageTheme[][] {
  if (themes.length <= ROUTE_STAGES_PER_BAND) return themes.map((theme) => [theme]);

  return Array.from({ length: ROUTE_STAGES_PER_BAND }, (_, index) => {
    const start = Math.floor((index * themes.length) / ROUTE_STAGES_PER_BAND);
    const end = Math.floor(((index + 1) * themes.length) / ROUTE_STAGES_PER_BAND);
    return themes.slice(start, Math.max(start + 1, end));
  });
}

function scoreBand(texts: ReadingText[]): Array<{ text: ReadingText; intrinsicDifficulty: number }> {
  const raw = texts.map(rawScore);
  const ranges = {
    sentenceLength: [Math.min(...raw.map((item) => item.sentenceLength)), Math.max(...raw.map((item) => item.sentenceLength))],
    wordCount: [Math.min(...raw.map((item) => item.wordCount)), Math.max(...raw.map((item) => item.wordCount))],
    lowFrequencyShare: [Math.min(...raw.map((item) => item.lowFrequencyShare)), Math.max(...raw.map((item) => item.lowFrequencyShare))],
    minutes: [Math.min(...raw.map((item) => item.minutes)), Math.max(...raw.map((item) => item.minutes))],
  } as const;

  return raw
    .map((item) => {
      const intrinsicDifficulty =
        normalize(item.sentenceLength, ranges.sentenceLength[0], ranges.sentenceLength[1]) * INTRINSIC_WEIGHTS.sentenceLength +
        normalize(item.wordCount, ranges.wordCount[0], ranges.wordCount[1]) * INTRINSIC_WEIGHTS.wordCount +
        normalize(item.lowFrequencyShare, ranges.lowFrequencyShare[0], ranges.lowFrequencyShare[1]) * INTRINSIC_WEIGHTS.lowFrequencyShare +
        normalize(item.minutes, ranges.minutes[0], ranges.minutes[1]) * INTRINSIC_WEIGHTS.minutes;
      return { text: item.text, intrinsicDifficulty: Math.round(intrinsicDifficulty * 10000) / 10000 };
    })
    .sort((a, b) => a.intrinsicDifficulty - b.intrinsicDifficulty || a.text.id.localeCompare(b.text.id));
}

export function buildLadder(): BuiltLadder {
  if (cached) return cached;

  const stages: Stage[] = [];
  const texts: LadderText[] = [];
  const textToStage = new Map<string, number>();
  const textById = new Map(starterTexts.map((text) => [text.id, text]));

  const sectioned = sectionedTextIds();
  const difficultyById = new Map<string, number>();

  for (const band of JOURNEY_BANDS) {
    // Intrinsic difficulty is scored across the whole band (sections included),
    // so every LadderText still carries a comparable difficulty value.
    for (const scored of scoreBand(starterTexts.filter((text) => text.difficulty === band))) {
      difficultyById.set(scored.text.id, scored.intrinsicDifficulty);
    }

    const stageThemes: StageTheme[] = [];
    const pushTheme = (theme: StageTheme) => {
      if (theme.textIds.length > 0) stageThemes.push(theme);
    };

    let indexInBand = 0;
    const pushStage = (themes: StageTheme[]) => {
      const textIds = themes.flatMap((theme) => theme.textIds);
      const globalIndex = stages.length;
      stages.push({ globalIndex, band, indexInBand, textIds, label: groupedStageLabel(themes), themes });
      for (const id of textIds) {
        texts.push({
          id,
          band,
          stageIndexInBand: indexInBand,
          globalStageIndex: globalIndex,
          intrinsicDifficulty: difficultyById.get(id) ?? 0,
        });
        textToStage.set(id, globalIndex);
      }
      indexInBand += 1;
    };

    // 1) Explicit themed sections first, in authored order and authored reading
    //    order (NOT re-sorted by difficulty) — this is where vocabulary threads.
    for (const section of JOURNEY_SECTIONS.filter((s) => s.band === band)) {
      const ids = section.textIds.filter((id) => textById.has(id));
      pushTheme({ id: section.id, title: section.title, textIds: ids });
    }

    // 2) Everything else in the band, difficulty-sorted and chunked into route themes.
    //    Sort by the SAME whole-band difficulty recorded above: re-scoring just
    //    the remainder would renormalise over a different range and could order
    //    the stages differently from the intrinsicDifficulty each text carries.
    const remaining = starterTexts
      .filter((text) => text.difficulty === band && !sectioned.has(text.id))
      .sort(
        (a, b) =>
          (difficultyById.get(a.id) ?? 0) - (difficultyById.get(b.id) ?? 0) || a.id.localeCompare(b.id)
      );
    let stageNumber = 1;
    for (let i = 0; i < remaining.length; i += TEXTS_PER_STAGE) {
      const slice = remaining.slice(i, i + TEXTS_PER_STAGE);
      pushTheme({
        id: `${band.toLowerCase()}-practice-${stageNumber}`,
        title: autoStageLabel(slice, stageNumber),
        textIds: slice.map((text) => text.id),
      });
      stageNumber += 1;
    }

    for (const themes of groupThemesForRoute(stageThemes)) {
      pushStage(themes);
    }
  }

  cached = { stages, texts, textToStage, textById };
  return cached;
}

export function getStageForText(textId: string): Stage | null {
  const ladder = buildLadder();
  const stageIndex = ladder.textToStage.get(textId);
  return stageIndex == null ? null : ladder.stages[stageIndex] ?? null;
}

export function getLadderText(textId: string): LadderText | null {
  return buildLadder().texts.find((text) => text.id === textId) ?? null;
}

export function getJourneyText(textId: string): ReadingText | null {
  return buildLadder().textById.get(textId) ?? null;
}
