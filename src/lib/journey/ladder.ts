import type { Difficulty, ReadingText } from "@/types";
import { starterTexts } from "@/data/starterTexts";
import { lookupWord } from "@/lib/dictionary/lookup";
import { tokenize } from "@/lib/words";

export const TEXTS_PER_STAGE = 5;
export const JOURNEY_BANDS: Difficulty[] = ["A1", "A2", "B1", "B2"];

const INTRINSIC_WEIGHTS = {
  sentenceLength: 0.35,
  wordCount: 0.25,
  lowFrequencyShare: 0.3,
  minutes: 0.1,
} as const;

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

  for (const band of JOURNEY_BANDS) {
    const ordered = scoreBand(starterTexts.filter((text) => text.difficulty === band));
    for (let i = 0; i < ordered.length; i += TEXTS_PER_STAGE) {
      const slice = ordered.slice(i, i + TEXTS_PER_STAGE);
      const stageIndexInBand = Math.floor(i / TEXTS_PER_STAGE);
      const globalIndex = stages.length;
      const stage: Stage = {
        globalIndex,
        band,
        indexInBand: stageIndexInBand,
        textIds: slice.map((item) => item.text.id),
        label: `${band} - Stage ${stageIndexInBand + 1}`,
      };
      stages.push(stage);
      for (const item of slice) {
        texts.push({
          id: item.text.id,
          band,
          stageIndexInBand,
          globalStageIndex: globalIndex,
          intrinsicDifficulty: item.intrinsicDifficulty,
        });
        textToStage.set(item.text.id, globalIndex);
      }
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
