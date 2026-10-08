import { notifyStoreChanged } from "@/lib/sync/runtime";
import { localStore, type WriteFailure } from "@/lib/localData/store";

export type SavedPhraseStatus = "learning" | "known";

/** How many "Knew it" grades in a row (see review/page.tsx's GRADUATE_AFTER_CORRECT_STREAK) promote a phrase to known — same bar as words. */
export const PHRASE_GRADUATE_AFTER_CORRECT_STREAK = 3;

export interface SavedPhrase {
  phrase: string;
  lemma: string;
  translation: string;
  partOfSpeech: string | null;
  contextSentence: string;
  sourceTextTitle: string;
  savedAt: string;
  status: SavedPhraseStatus;
  updatedAt: string;
  /** Consecutive "Knew it" grades since the last "Still learning" — resets to 0 on a miss. */
  correctStreak: number;
}

const KEY = "lire.savedPhrases.v1";
const MAX_PHRASES = 500;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function clean(value: string): string {
  return value.trim().toLowerCase();
}

function normalize(entry: unknown): SavedPhrase | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  if (typeof e.phrase !== "string" || !clean(e.phrase)) return null;
  if (typeof e.translation !== "string" || !e.translation.trim()) return null;

  const now = new Date().toISOString();
  return {
    phrase: clean(e.phrase),
    lemma: typeof e.lemma === "string" && e.lemma.trim() ? clean(e.lemma) : clean(e.phrase),
    translation: e.translation.trim(),
    partOfSpeech: typeof e.partOfSpeech === "string" ? e.partOfSpeech : null,
    contextSentence: typeof e.contextSentence === "string" ? e.contextSentence : "",
    sourceTextTitle: typeof e.sourceTextTitle === "string" ? e.sourceTextTitle : "",
    savedAt: typeof e.savedAt === "string" ? e.savedAt : now,
    status: e.status === "known" ? "known" : "learning",
    updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : now,
    correctStreak: typeof e.correctStreak === "number" && e.correctStreak >= 0 ? e.correctStreak : 0,
  };
}

/** The outcome of a change to saved phrases. `phrases` is always what is actually stored. */
export type PhrasesMutation = { ok: true; phrases: SavedPhrase[] } | { ok: false; phrases: SavedPhrase[]; reason: WriteFailure };
/** Adding can also be refused at the limit; nothing is ever dropped to make room. */
export type SavePhraseResult = PhrasesMutation | { ok: false; phrases: SavedPhrase[]; reason: "limit" };

// Never truncates: saved phrases are the reader's own. The limit is enforced
// when adding (savePhrase), not by dropping the oldest on write, as it was.
function persist(next: SavedPhrase[], previous: SavedPhrase[]): PhrasesMutation {
  if (!hasStorage()) return { ok: false, phrases: previous, reason: "unavailable" };
  const result = localStore.writeItem(KEY, JSON.stringify(next));
  if (!result.ok) return { ok: false, phrases: previous, reason: result.reason };
  notifyStoreChanged(KEY);
  return { ok: true, phrases: next };
}

export function getSavedPhrases(): SavedPhrase[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStore.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((phrase): phrase is SavedPhrase => phrase !== null);
  } catch {
    return [];
  }
}

export function isPhraseSaved(phrase: string): boolean {
  const key = clean(phrase);
  return getSavedPhrases().some((saved) => saved.phrase === key);
}

export function savePhrase(phrase: Omit<SavedPhrase, "phrase" | "lemma" | "savedAt" | "status" | "updatedAt" | "correctStreak"> & { phrase: string; lemma?: string }): SavePhraseResult {
  const now = new Date().toISOString();
  const entry: SavedPhrase = {
    ...phrase,
    phrase: clean(phrase.phrase),
    lemma: clean(phrase.lemma ?? phrase.phrase),
    savedAt: now,
    status: "learning",
    updatedAt: now,
    correctStreak: 0,
  };
  const previous = getSavedPhrases();
  const existing = previous.filter((saved) => saved.phrase !== entry.phrase);
  if (existing.length === previous.length && previous.length >= MAX_PHRASES) {
    return { ok: false, phrases: previous, reason: "limit" };
  }
  return persist([entry, ...existing], previous);
}

/** Manual override (e.g. a "Known" button on the Words/Phrases pages) — marks known immediately, bypassing the review streak. */
export function markPhraseKnown(phrase: string): PhrasesMutation {
  const key = clean(phrase);
  const now = new Date().toISOString();
  const previous = getSavedPhrases();
  const next = previous.map((saved) => (saved.phrase === key ? { ...saved, status: "known" as const, correctStreak: 0, updatedAt: now } : saved));
  return persist(next, previous);
}

/**
 * Records one Review-flow grade for a phrase: a correct grade extends the
 * streak (and promotes to known once it reaches
 * PHRASE_GRADUATE_AFTER_CORRECT_STREAK), an incorrect grade resets it to 0
 * — mirrors the word-side streak in review/page.tsx's GRADUATE_AFTER_CORRECT_STREAK.
 */
export function recordPhraseReview(phrase: string, correct: boolean): PhrasesMutation {
  const key = clean(phrase);
  const now = new Date().toISOString();
  const previous = getSavedPhrases();
  const next = previous.map((saved) => {
    if (saved.phrase !== key) return saved;
    const correctStreak = correct ? saved.correctStreak + 1 : 0;
    const graduated = correct && correctStreak >= PHRASE_GRADUATE_AFTER_CORRECT_STREAK;
    return {
      ...saved,
      correctStreak: graduated ? 0 : correctStreak,
      status: graduated ? ("known" as const) : saved.status,
      updatedAt: now,
    };
  });
  return persist(next, previous);
}

export function deletePhrase(phrase: string): PhrasesMutation {
  const key = clean(phrase);
  const previous = getSavedPhrases();
  return persist(previous.filter((saved) => saved.phrase !== key), previous);
}
