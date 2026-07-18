import type { SavedWord, WordStatus } from "@/types";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { generateFallbackExample } from "@/lib/dictionary/exampleGenerator";
import { lookupWord } from "@/lib/dictionary/lookup";
import { markKnown } from "@/lib/knownWords";
import { computeNextSchedule, defaultSpacedRepetitionFields, type ReviewResult } from "@/lib/spacedRepetition";
import { recordActivityToday } from "@/lib/habit";
import { recordWordSavedXp } from "@/lib/gamification";
import { pushStore } from "@/lib/supabase/sync";
import { isSourceFooterText } from "@/lib/rss/sourceNoise";

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

function isPlaceholderTranslation(value: string): boolean {
  return value === NOT_TRANSLATED_YET || value === "Translation unavailable";
}

function dictionaryBackfill(word: string) {
  const lookup = lookupWord(word);
  const fallbackExample = generateFallbackExample({
    word,
    lemma: lookup.lemma,
    partOfSpeech: lookup.partOfSpeech,
    gender: lookup.gender,
    translations: lookup.translations,
  });
  const firstExample = lookup.examples[0];

  if (lookup.source !== "local" || lookup.translations.length === 0) {
    return {
      found: false,
      lookup,
      exampleSentenceFr: fallbackExample.fr,
      exampleSentenceEn: fallbackExample.en,
    };
  }

  return {
    found: true,
    lookup,
    exampleSentenceFr: firstExample?.fr ?? fallbackExample.fr,
    exampleSentenceEn: firstExample?.en ?? fallbackExample.en,
  };
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
    // Legacy plain-string saves carry no dictionary data at all — re-look it
    // up so the generated fallback example can still be word-specific
    // (real part of speech/gender/translation) rather than fully generic.
    const backfill = dictionaryBackfill(word);
    const lookup = backfill.lookup;
    return {
      word,
      lemma: backfill.found ? lookup.lemma : null,
      translations: backfill.found ? lookup.translations : [],
      primaryTranslation: backfill.found ? lookup.translations[0] : NOT_TRANSLATED_YET,
      partOfSpeech: backfill.found ? lookup.partOfSpeech : null,
      gender: backfill.found ? lookup.gender : null,
      cefr: backfill.found ? lookup.cefr : null,
      frequencyRank: backfill.found ? lookup.frequencyRank : null,
      articleContextSentence: "",
      exampleSentenceFr: backfill.exampleSentenceFr,
      exampleSentenceEn: backfill.exampleSentenceEn,
      sourceTextTitle: "",
      savedAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewedAt: null,
      status: "learning",
      missingFromDictionary: !backfill.found,
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

  const partOfSpeech = typeof e.partOfSpeech === "string" ? e.partOfSpeech : null;
  const gender = typeof e.gender === "string" ? e.gender : null;
  const missingFromDictionary =
    typeof e.missingFromDictionary === "boolean" ? e.missingFromDictionary : translations.length === 0;
  const shouldBackfill =
    missingFromDictionary ||
    translations.length === 0 ||
    isPlaceholderTranslation(primaryTranslation);
  const backfill = shouldBackfill ? dictionaryBackfill(e.word) : null;
  const resolvedLookup = backfill?.found ? backfill.lookup : null;
  const resolvedTranslations = resolvedLookup?.translations ?? translations;
  const resolvedPartOfSpeech = resolvedLookup?.partOfSpeech ?? partOfSpeech;
  const resolvedGender = resolvedLookup?.gender ?? gender;
  const fallbackExample = generateFallbackExample({
    word: e.word,
    lemma: resolvedLookup?.lemma ?? (typeof e.lemma === "string" ? e.lemma : null),
    partOfSpeech: resolvedPartOfSpeech,
    gender: resolvedGender,
    translations: resolvedTranslations,
  });
  const resolvedExampleFr =
    backfill?.found
      ? backfill.exampleSentenceFr
      : typeof e.exampleSentenceFr === "string" && e.exampleSentenceFr
        ? e.exampleSentenceFr
        : fallbackExample.fr;
  const resolvedExampleEn =
    backfill?.found
      ? backfill.exampleSentenceEn
      : typeof e.exampleSentenceEn === "string" && e.exampleSentenceEn
        ? e.exampleSentenceEn
        : fallbackExample.en;
  const resolvedMissingFromDictionary = resolvedLookup ? false : missingFromDictionary;

  if (resolvedMissingFromDictionary && resolvedTranslations.length === 0 && isSourceFooterText(articleContextSentence)) {
    return null;
  }

  return {
    word: e.word,
    lemma: resolvedLookup?.lemma ?? (typeof e.lemma === "string" ? e.lemma : null),
    translations: resolvedTranslations,
    primaryTranslation: resolvedLookup?.translations[0] ?? primaryTranslation,
    partOfSpeech: resolvedPartOfSpeech,
    gender: resolvedGender,
    cefr: resolvedLookup?.cefr ?? (typeof e.cefr === "string" ? e.cefr : null),
    frequencyRank: resolvedLookup?.frequencyRank ?? (typeof e.frequencyRank === "number" ? e.frequencyRank : null),
    articleContextSentence,
    exampleSentenceFr: resolvedExampleFr,
    exampleSentenceEn: resolvedExampleEn,
    // old field was `sourceId`; new field is `sourceTextTitle`.
    sourceTextTitle:
      (typeof e.sourceTextTitle === "string" && e.sourceTextTitle) ||
      (typeof e.sourceId === "string" && e.sourceId) ||
      "",
    savedAt,
    reviewCount: typeof e.reviewCount === "number" ? e.reviewCount : 0,
    lastReviewedAt: typeof e.lastReviewedAt === "string" ? e.lastReviewedAt : null,
    status: isValidStatus(e.status) ? e.status : "learning",
    missingFromDictionary: resolvedMissingFromDictionary,
    ease: typeof e.ease === "number" ? e.ease : defaultSpacedRepetitionFields().ease,
    nextReviewAt: typeof e.nextReviewAt === "string" ? e.nextReviewAt : null,
    correctCount: typeof e.correctCount === "number" ? e.correctCount : 0,
    incorrectCount: typeof e.incorrectCount === "number" ? e.incorrectCount : 0,
    lastReviewResult:
      e.lastReviewResult === "correct" || e.lastReviewResult === "incorrect" ? e.lastReviewResult : null,
  };
}

/**
 * Saved words are the most valuable thing this app holds, so a write here must
 * never throw into a tap handler. It used to: an unguarded setItem meant that
 * once the origin's localStorage filled up (historically from the unbounded
 * per-article translation cache — see articleTranslation.ts), the very act of
 * saving a word raised QuotaExceededError, the word was silently lost, and the
 * XP/activity bookkeeping after it never ran.
 *
 * Returns whether the write landed so callers can tell the user when it didn't,
 * rather than showing a success toast for a word that wasn't stored.
 */
function persist(words: SavedWord[]): boolean {
  if (!hasStorage()) return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(words));
  } catch {
    return false;
  }
  // Best-effort, fire-and-forget — no-ops if sync isn't configured or no
  // one's signed in. See src/lib/supabase/sync.ts.
  void pushStore(KEY);
  return true;
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
  const lookup = lookupWord(word);
  const lemma = lookup.lemma?.toLowerCase();
  return getSavedWords().some((w) => w.word === word || (!!lemma && w.lemma?.toLowerCase() === lemma));
}

/**
 * Save a word with status "learning" or "unsure". No-ops if the word is already saved — the
 * original saved context and status are kept, even if tapped again in a
 * new sentence later.
 */
export interface SaveWordResult {
  words: SavedWord[];
  /** False when the write was rejected (quota) — the caller should say so rather than confirm a save that didn't happen. */
  persisted: boolean;
}

export function saveWord(entry: SavedWord): SaveWordResult {
  const words = getSavedWords();
  const entryLemma = entry.lemma?.toLowerCase();
  if (words.some((w) => w.word === entry.word || (!!entryLemma && w.lemma?.toLowerCase() === entryLemma))) {
    return { words, persisted: true };
  }
  const next = [entry, ...words];
  if (!persist(next)) return { words, persisted: false };
  // Only credit progress for a word that actually made it to storage.
  recordWordSavedXp(entry.lemma ?? entry.word);
  recordActivityToday();
  return { words: next, persisted: true };
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
  const lookup = lookupWord(word);
  const lemma = lookup.lemma?.toLowerCase();
  const target = words.find((w) => w.word === word || (!!lemma && w.lemma?.toLowerCase() === lemma));
  const next = words.map((w) => (w.word === word || (!!lemma && w.lemma?.toLowerCase() === lemma) ? { ...w, status: "known" as const } : w));
  persist(next);
  markKnown(word);
  if (target?.lemma) markKnown(target.lemma);
  return next;
}

export function deleteWord(word: string): SavedWord[] {
  const lookup = lookupWord(word);
  const lemma = lookup.lemma?.toLowerCase();
  const next = getSavedWords().filter((w) => w.word !== word && (!lemma || w.lemma?.toLowerCase() !== lemma));
  persist(next);
  return next;
}

export function clearWords(): void {
  persist([]);
}
