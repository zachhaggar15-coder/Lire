import type { SavedWord, WordStatus } from "@/types";
import { FALLBACK_EXAMPLE_EN, FALLBACK_EXAMPLE_FR, NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { markKnown } from "@/lib/knownWords";
import { computeNextSchedule, defaultSpacedRepetitionFields, type ReviewResult } from "@/lib/spacedRepetition";
import { recordActivityToday } from "@/lib/habit";

/**
 * localStorage-backed store for saved words (version 1, no backend).
 * All functions are safe to call on the server: they no-op when there
 * is no window/localStorage.
 */

const KEY = "lire.savedWords.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function isValidStatus(v: unknown): v is WordStatus {
  return v === "learning" || v === "unsure" || v === "known";
}

/**
 * Normalise a raw stored entry into the current SavedWord shape. Handles:
 *   1. a plain string (earliest format — pre-dates any translation data)
 *   2. the AI-era object (single `translation` string, no `status`/`gender`/
 *      `frequencyRank`/`translations[]`)
 *   3. the current shape (passed through, with defaults filled in)
 * Returns null for anything unusable.
 */
function normalize(entry: unknown): SavedWord | null {
  if (typeof entry === "string") {
    const word = entry.trim().toLowerCase();
    if (!word) return null;
    return {
      word,
      lemma: null,
      translations: [],
      primaryTranslation: NOT_TRANSLATED_YET,
      partOfSpeech: null,
      gender: null,
      cefr: null,
      frequencyRank: null,
      articleContextSentence: "",
      exampleSentenceFr: FALLBACK_EXAMPLE_FR,
      exampleSentenceEn: FALLBACK_EXAMPLE_EN,
      sourceTextTitle: "",
      savedAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewedAt: null,
      status: "learning",
      missingFromDictionary: true,
      ...defaultSpacedRepetitionFields(),
    };
  }

  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  if (typeof e.word !== "string" || !e.word) return null;

  // savedAt may be a number (very old epoch ms) or an ISO string.
  let savedAt: string;
  if (typeof e.savedAt === "number") savedAt = new Date(e.savedAt).toISOString();
  else if (typeof e.savedAt === "string") savedAt = e.savedAt;
  else savedAt = new Date().toISOString();

  // translations[] is the current field; the AI-era shape only had a
  // single `translation` string (and used "Translation unavailable" as its
  // own placeholder, which isn't a real translation worth keeping).
  let translations: string[];
  if (Array.isArray(e.translations)) {
    translations = e.translations.filter((t): t is string => typeof t === "string");
  } else if (typeof e.translation === "string" && e.translation && e.translation !== "Translation unavailable") {
    translations = [e.translation];
  } else {
    translations = [];
  }

  const primaryTranslation =
    typeof e.primaryTranslation === "string" && e.primaryTranslation
      ? e.primaryTranslation
      : translations[0] ?? NOT_TRANSLATED_YET;

  // Older saves only had `contextSentence` (or the earliest `context`) and no
  // separate learner example — treat the article sentence the same as
  // before, and give the example fields a sensible fallback.
  const articleContextSentence =
    (typeof e.articleContextSentence === "string" && e.articleContextSentence) ||
    (typeof e.contextSentence === "string" && e.contextSentence) ||
    (typeof e.context === "string" && e.context) ||
    "";

  return {
    word: e.word,
    lemma: typeof e.lemma === "string" ? e.lemma : null,
    translations,
    primaryTranslation,
    partOfSpeech: typeof e.partOfSpeech === "string" ? e.partOfSpeech : null,
    gender: typeof e.gender === "string" ? e.gender : null,
    cefr: typeof e.cefr === "string" ? e.cefr : null,
    frequencyRank: typeof e.frequencyRank === "number" ? e.frequencyRank : null,
    articleContextSentence,
    exampleSentenceFr: typeof e.exampleSentenceFr === "string" && e.exampleSentenceFr ? e.exampleSentenceFr : FALLBACK_EXAMPLE_FR,
    exampleSentenceEn: typeof e.exampleSentenceEn === "string" && e.exampleSentenceEn ? e.exampleSentenceEn : FALLBACK_EXAMPLE_EN,
    // old field was `sourceId`; new field is `sourceTextTitle`.
    sourceTextTitle:
      (typeof e.sourceTextTitle === "string" && e.sourceTextTitle) ||
      (typeof e.sourceId === "string" && e.sourceId) ||
      "",
    savedAt,
    reviewCount: typeof e.reviewCount === "number" ? e.reviewCount : 0,
    lastReviewedAt: typeof e.lastReviewedAt === "string" ? e.lastReviewedAt : null,
    status: isValidStatus(e.status) ? e.status : "learning",
    missingFromDictionary:
      typeof e.missingFromDictionary === "boolean" ? e.missingFromDictionary : translations.length === 0,
    ease: typeof e.ease === "number" ? e.ease : defaultSpacedRepetitionFields().ease,
    nextReviewAt: typeof e.nextReviewAt === "string" ? e.nextReviewAt : null,
    correctCount: typeof e.correctCount === "number" ? e.correctCount : 0,
    incorrectCount: typeof e.incorrectCount === "number" ? e.incorrectCount : 0,
    lastReviewResult:
      e.lastReviewResult === "correct" || e.lastReviewResult === "incorrect" ? e.lastReviewResult : null,
  };
}

function persist(words: SavedWord[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(words));
}

/**
 * Read all saved words, migrating any legacy entries to the current shape.
 * If migration changed anything, the normalised list is written back.
 */
export function getSavedWords(): SavedWord[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const migrated = parsed
      .map(normalize)
      .filter((w): w is SavedWord => w !== null);

    // Persist back if the on-disk form differs (i.e. a migration happened).
    if (JSON.stringify(migrated) !== raw) persist(migrated);
    return migrated;
  } catch {
    return [];
  }
}

export function isWordSaved(word: string): boolean {
  return getSavedWords().some((w) => w.word === word);
}

/**
 * Save a word with status "learning" or "unsure" (see the reader's
 * three-action word sheet). No-ops if the word is already saved — the
 * original saved context and status are kept, even if tapped again in a
 * new sentence later.
 */
export function saveWord(entry: SavedWord): SavedWord[] {
  const words = getSavedWords();
  if (words.some((w) => w.word === entry.word)) return words;
  const next = [entry, ...words];
  persist(next);
  recordActivityToday();
  return next;
}

/**
 * Records the result of a review: bumps reviewCount/lastReviewedAt (as
 * before) and updates the spaced-repetition schedule (ease, nextReviewAt,
 * correctCount/incorrectCount, lastReviewResult) — see
 * src/lib/spacedRepetition.ts for the actual scheduling logic. Returns the
 * updated list.
 */
export function recordReviewResult(word: string, result: ReviewResult): SavedWord[] {
  const next = getSavedWords().map((w) => {
    if (w.word !== word) return w;
    const schedule = computeNextSchedule(w, result);
    return {
      ...w,
      reviewCount: w.reviewCount + 1,
      lastReviewedAt: new Date().toISOString(),
      ...schedule,
    };
  });
  persist(next);
  recordActivityToday();
  return next;
}

/**
 * Marks an already-saved word as known: flips its status (it stays in
 * storage as a record, visible on the Words page, but Review excludes it
 * from then on) and adds the word — and its lemma, if any — to the known-
 * words list, so reader highlighting/lookups have one source of truth.
 */
export function markWordAsKnown(word: string): SavedWord[] {
  const words = getSavedWords();
  const target = words.find((w) => w.word === word);
  const next = words.map((w) => (w.word === word ? { ...w, status: "known" as const } : w));
  persist(next);
  markKnown(word);
  if (target?.lemma) markKnown(target.lemma);
  return next;
}

export function deleteWord(word: string): SavedWord[] {
  const next = getSavedWords().filter((w) => w.word !== word);
  persist(next);
  return next;
}

export function clearWords(): void {
  persist([]);
}
