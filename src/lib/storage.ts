import type { SavedWord, WordStatus } from "@/types";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { isRetiredTemplateExample, learnerExample } from "@/lib/dictionary/exampleGenerator";
import { lookupWord } from "@/lib/dictionary/lookup";
import { findVocabularyCards, isInReview, VocabularyIndex } from "@/lib/reviewMembership";
import { computeNextSchedule, defaultSpacedRepetitionFields, type ReviewResult } from "@/lib/spacedRepetition";
import { recordActivityToday } from "@/lib/habit";
import { recordWordSavedXp } from "@/lib/gamification";
import { notifyStoreChanged } from "@/lib/sync/runtime";
import { isSourceFooterText } from "@/lib/rss/sourceNoise";
import { localStore, type WriteFailure } from "@/lib/localData/store";

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
  const found = lookup.source === "local" && lookup.translations.length > 0;
  // A curated example or none — never a generated one (see exampleGenerator).
  const example = learnerExample({ curated: found ? lookup.examples[0] : null });
  return {
    found,
    lookup,
    exampleSentenceFr: example.fr,
    exampleSentenceEn: example.en,
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
  const storedExampleFr = typeof e.exampleSentenceFr === "string" ? e.exampleSentenceFr : "";
  const storedExampleEn = typeof e.exampleSentenceEn === "string" ? e.exampleSentenceEn : "";
  // An example made by the retired templates ("J'aime hier.") is dropped on
  // read, whichever build or device saved it; the word, its translations and
  // its Review history are untouched.
  const storedIsTemplate = isRetiredTemplateExample(storedExampleFr, storedExampleEn, [
    e.word,
    typeof e.lemma === "string" ? e.lemma : null,
    resolvedLookup?.lemma,
  ]);
  const resolvedExample = backfill?.found
    ? { fr: backfill.exampleSentenceFr, en: backfill.exampleSentenceEn }
    : storedExampleFr && !storedIsTemplate && storedExampleFr !== articleContextSentence
      ? { fr: storedExampleFr, en: storedExampleEn }
      : // Older builds stored the reading sentence beside a one-word gloss
        // ("Hier, il pleuvait." - "yesterday"); pair it with its own
        // translation, or with nothing.
        learnerExample({
          contextSentence: articleContextSentence,
          sentenceTranslation: typeof e.sentenceTranslation === "string" ? e.sentenceTranslation : null,
        });
  const resolvedExampleFr = resolvedExample.fr;
  const resolvedExampleEn = resolvedExample.en;
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
    // Deliberately not re-derived from a fresh lookup: this records what the
    // reader was shown at save time, and re-resolving it later without their
    // sentence in hand would replace a contextual answer with a generic one.
    contextualMeaning: typeof e.contextualMeaning === "string" && e.contextualMeaning.trim() ? e.contextualMeaning.trim() : null,
    partOfExpression: typeof e.partOfExpression === "string" && e.partOfExpression.trim() ? e.partOfExpression.trim() : null,
    lemmaGloss: typeof e.lemmaGloss === "string" && e.lemmaGloss.trim() ? e.lemmaGloss.trim() : null,
    sentenceTranslation: typeof e.sentenceTranslation === "string" && e.sentenceTranslation.trim() ? e.sentenceTranslation.trim() : null,
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
    // Present only on a removed card, so every other card stays byte-identical
    // to what older builds wrote (no rewrite, and no sync churn, on upgrade).
    ...(typeof e.removedFromReviewAt === "string" && e.removedFromReviewAt ? { removedFromReviewAt: e.removedFromReviewAt } : {}),
  };
}

/** The card as it is stored when in Review: the removal marker absent, not null. */
function inReviewCard(card: SavedWord): SavedWord {
  const { removedFromReviewAt: _removed, ...rest } = card;
  return { ...rest, status: card.status === "known" ? "learning" : card.status };
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
function persist(words: SavedWord[]): WriteFailure | null {
  if (!hasStorage()) return "unavailable";
  // If the stored list could not be read, writing now would replace words we
  // could not see. Refuse until it can be read again.
  if (unreadable) return "error";
  const result = localStore.writeItem(KEY, JSON.stringify(words));
  if (!result.ok) return result.reason;
  // Schedules a sync for signed-in accounts; a no-op for guests.
  notifyStoreChanged(KEY);
  return null;
}

/** Set when the stored list exists but cannot be read or parsed. */
let unreadable = false;

/** The outcome of a change to saved words. `words` is always what is actually stored. */
export type WordsMutation = { ok: true; words: SavedWord[] } | { ok: false; words: SavedWord[]; reason: WriteFailure };

function mutation(next: SavedWord[], previous: SavedWord[]): WordsMutation {
  const failure = persist(next);
  return failure ? { ok: false, words: previous, reason: failure } : { ok: true, words: next };
}

/**
 * Read all saved words, migrating any legacy entries to the current shape.
 * If migration changed anything, the normalised list is written back.
 */
export function getSavedWords(): SavedWord[] {
  if (!hasStorage()) return [];
  let raw: string | null;
  try {
    raw = localStore.getItem(KEY);
  } catch {
    unreadable = true;
    return [];
  }
  if (!raw) {
    unreadable = false;
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      unreadable = true;
      return [];
    }
    unreadable = false;

    const migrated = parsed
      .map(normalize)
      .filter((w): w is SavedWord => w !== null);

    // Persist back if the on-disk form differs (i.e. a migration happened).
    if (JSON.stringify(migrated) !== raw) persist(migrated);
    return migrated;
  } catch {
    unreadable = true;
    return [];
  }
}

/**
 * True when a card exists for this word, in Review or not. Reactivating an
 * existing card is never a new save, so the free daily limit does not apply.
 */
export function hasVocabularyCard(word: string, lemma: string | null | undefined): boolean {
  return findVocabularyCards(getSavedWords(), word, lemma).length > 0;
}

export interface SaveWordResult {
  words: SavedWord[];
  /** False when the write was rejected — the caller should say so rather than confirm a save that didn't happen. */
  persisted: boolean;
  /** True only when this action added a new card: the only case that is a new save. */
  created: boolean;
  /** True when an existing card that was not in Review was put back (history kept). */
  reactivated: boolean;
  /**
   * The meaning this save added to an existing card, when the word was met
   * again with a different meaning (e.g. "compte" as "account", then in "se
   * rendre compte"). Sorlio keeps one card per word, not one per sense, so the
   * new meaning is added to that card instead of being lost.
   */
  addedMeaning?: string | null;
}

/** The meaning shown when this entry was saved, if the card does not have it yet. */
function newMeaningFor(card: SavedWord, entry: SavedWord): string | null {
  const meaning = (entry.contextualMeaning ?? entry.primaryTranslation ?? "").trim();
  if (!meaning || meaning === NOT_TRANSLATED_YET) return null;
  const known = [card.primaryTranslation, ...card.translations].map((value) => value.trim().toLowerCase());
  return known.includes(meaning.toLowerCase()) ? null : meaning;
}

function withMeaning(card: SavedWord, meaning: string | null): SavedWord {
  return meaning ? { ...card, translations: [...card.translations, meaning] } : card;
}

/**
 * "Add to review". Exactly one of three things happens:
 *   - the word (or its lemma) already has a card in Review: nothing changes;
 *   - it has a card that is not in Review (removed, or legacy "known"): that
 *     card is put back, keeping its review history and schedule;
 *   - it has no card: the new card is stored.
 */
export function addWordToReview(entry: SavedWord): SaveWordResult {
  const words = getSavedWords();
  const existing = findVocabularyCards(words, entry.word, entry.lemma);
  const active = existing.find((card) => isInReview(card) && card.word === entry.word) ?? existing.find(isInReview);
  if (active) {
    const meaning = newMeaningFor(active, entry);
    if (!meaning) return { words, persisted: true, created: false, reactivated: false };
    const next = words.map((card) => (card === active ? withMeaning(card, meaning) : card));
    // Failing to add the extra meaning leaves the card as it was, still in Review.
    if (persist(next)) return { words, persisted: true, created: false, reactivated: false };
    return { words: next, persisted: true, created: false, reactivated: false, addedMeaning: meaning };
  }

  if (existing.length > 0) {
    const target = existing.find((card) => card.word === entry.word) ?? existing[0];
    const meaning = newMeaningFor(target, entry);
    const next = words.map((card) => (card === target ? withMeaning(inReviewCard(card), meaning) : card));
    if (persist(next)) return { words, persisted: false, created: false, reactivated: false };
    recordActivityToday();
    return { words: next, persisted: true, created: false, reactivated: true, addedMeaning: meaning };
  }

  const next = [inReviewCard(entry), ...words];
  if (persist(next)) return { words, persisted: false, created: false, reactivated: false };
  // Only credit progress for a word that actually made it to storage.
  recordWordSavedXp(entry.lemma ?? entry.word);
  recordActivityToday();
  return { words: next, persisted: true, created: true, reactivated: false };
}

/** Adds a meaning to the word's card in Review (the reader met it with a new meaning). */
export function addMeaningToWord(word: string, lemma: string | null | undefined, meaning: string): WordsMutation {
  const previous = getSavedWords();
  const card = new VocabularyIndex(previous).activeCard(word, lemma);
  const trimmed = meaning.trim();
  if (!card || !trimmed || card.translations.some((t) => t.trim().toLowerCase() === trimmed.toLowerCase())) return { ok: true, words: previous };
  return mutation(previous.map((item) => (item === card ? withMeaning(item, trimmed) : item)), previous);
}

/**
 * "Remove from review": every card for this word that is in Review is taken
 * out of it. The card and its history stay, so the word can be added back
 * (and doing so is not a new save). Deleting a card outright is deleteWord.
 */
export function removeWordFromReview(word: string, lemma: string | null | undefined): WordsMutation {
  const previous = getSavedWords();
  const targets = new Set(findVocabularyCards(previous, word, lemma).filter(isInReview));
  if (targets.size === 0) return { ok: true, words: previous };
  const removedAt = new Date().toISOString();
  const next = previous.map((card) => (targets.has(card) ? { ...card, removedFromReviewAt: removedAt } : card));
  return mutation(next, previous);
}

/**
 * Records the result of a review: bumps reviewCount/lastReviewedAt (as
 * before) and updates the spaced-repetition schedule (ease, nextReviewAt,
 * correctCount/incorrectCount, lastReviewResult) — see
 * src/lib/spacedRepetition.ts for the actual scheduling logic. Returns the
 * updated list.
 */
export function recordReviewResult(word: string, result: ReviewResult): WordsMutation {
  const previous = getSavedWords();
  const next = previous.map((w) => {
    if (w.word !== word) return w;
    const schedule = computeNextSchedule(w, result);
    return {
      ...w,
      reviewCount: w.reviewCount + 1,
      lastReviewedAt: new Date().toISOString(),
      ...schedule,
    };
  });
  const outcome = mutation(next, previous);
  // Activity only counts once the review is actually stored.
  if (outcome.ok) recordActivityToday();
  return outcome;
}

/**
 * Deletes one card permanently, review history included (the Words page's
 * delete). Only that exact card: a lemma guess must never delete another one.
 */
export function deleteWord(word: string): WordsMutation {
  const current = getSavedWords();
  const next = current.filter((w) => w.word !== word);
  return mutation(next, current);
}

export function clearWords(): WordsMutation {
  return mutation([], getSavedWords());
}
