import type { ReadingText } from "@/types";
import { gistTextForReadingText, isMetadataOnlyBlurb } from "@/lib/readingSummaries";

export interface MultipleChoiceQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
}

export interface ToneQuestion extends MultipleChoiceQuestion {
  kind: "stance" | "tone" | "confidence";
}

const STOPWORDS = new Set([
  "avec",
  "dans",
  "des",
  "du",
  "elle",
  "est",
  "les",
  "leur",
  "mais",
  "par",
  "pas",
  "pour",
  "que",
  "qui",
  "sur",
  "une",
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
]);

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function cleanWords(text: string): string[] {
  return (
    normalise(text)
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((word) => word.length > 2 && !STOPWORDS.has(word)) ?? []
  );
}

function keywordSet(text: ReadingText): Set<string> {
  const blurb = text.blurbEn && !isMetadataOnlyBlurb(text.blurbEn) ? text.blurbEn : "";
  return new Set(cleanWords(`${text.title} ${text.preview} ${blurb} ${text.body.slice(0, 400)}`).slice(0, 18));
}

function overlapScore(a: ReadingText, b: ReadingText): number {
  const aWords = keywordSet(a);
  const bWords = keywordSet(b);
  let overlap = 0;
  for (const word of aWords) {
    if (bWords.has(word)) overlap++;
  }
  const sourceBonus = a.sourceName && b.sourceName && a.sourceName !== b.sourceName ? 1.5 : 0;
  const categoryBonus = a.category === b.category ? 0.75 : 0;
  return overlap + sourceBonus + categoryBonus;
}

export function findRelatedArticles(current: ReadingText, candidates: ReadingText[], limit = 3): ReadingText[] {
  const seenSources = new Set<string>();
  if (current.sourceName) seenSources.add(current.sourceName);

  const scored = candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => ({ candidate, score: overlapScore(current, candidate) }))
    .filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score);

  const picked: ReadingText[] = [];
  for (const { candidate } of scored) {
    if (candidate.sourceName && seenSources.has(candidate.sourceName)) continue;
    picked.push(candidate);
    if (candidate.sourceName) seenSources.add(candidate.sourceName);
    if (picked.length >= limit) break;
  }
  return picked;
}

function gist(text: ReadingText): string {
  return gistTextForReadingText(text);
}

/** A real English summary: present, and not provenance ("An unabridged extract … from …"). */
function hasGenuineSummary(text: ReadingText): boolean {
  return !!text.blurbEn?.trim() && !isMetadataOnlyBlurb(text.blurbEn);
}

/**
 * Shared keywords at or above this mean the candidate is probably about the
 * same story — another outlet's report of the same event, or the next part of
 * a series — so its summary could also be a right answer.
 */
const SAME_STORY_OVERLAP = 3;

function sharedKeywords(a: ReadingText, b: ReadingText): number {
  const bWords = keywordSet(b);
  let shared = 0;
  for (const word of keywordSet(a)) if (bWords.has(word)) shared++;
  return shared;
}

function gistDistractors(current: ReadingText, candidates: ReadingText[]): string[] {
  const correct = gist(current);
  return candidates
    .filter((candidate) => candidate.id !== current.id && hasGenuineSummary(candidate))
    .filter((candidate) => sharedKeywords(current, candidate) < SAME_STORY_OVERLAP)
    .map((candidate) => ({ candidate, overlap: overlapScore(current, candidate) }))
    .sort((a, b) => b.overlap - a.overlap)
    .map(({ candidate }) => gist(candidate))
    .filter((choice, index, all) => choice && choice !== correct && all.indexOf(choice) === index)
    .slice(0, 3);
}

/**
 * A gist question needs a real summary of this text and at least two real
 * summaries of other, unrelated texts to stand beside it. Without them Sorlio
 * asks nothing: no invented options, no French fragments, and never
 * provenance ("An unabridged extract (162 words) from …") presented as the
 * meaning of the passage.
 */
export function canBuildGistQuestion(current: ReadingText, candidates: ReadingText[]): boolean {
  return hasGenuineSummary(current) && gistDistractors(current, candidates).length >= 2;
}

/** Stable per text, so the right answer is not always in the same place and a re-render never moves it. */
function answerPosition(seed: string, choiceCount: number): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
  return (hash >>> 0) % choiceCount;
}

/** Callers check canBuildGistQuestion first; this returns null when the question cannot be built honestly. */
export function buildGistQuestion(current: ReadingText, candidates: ReadingText[]): MultipleChoiceQuestion | null {
  if (!hasGenuineSummary(current)) return null;
  const distractors = gistDistractors(current, candidates);
  if (distractors.length < 2) return null;
  const answerIndex = answerPosition(current.id, distractors.length + 1);
  const choices = [...distractors];
  choices.splice(answerIndex, 0, gist(current));
  return {
    id: `gist-${current.id}`,
    prompt: "What is the general gist of the article?",
    choices,
    answerIndex,
  };
}
