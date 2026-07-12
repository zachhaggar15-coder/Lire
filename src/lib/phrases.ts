import { pushStore } from "@/lib/supabase/sync";

export type SavedPhraseStatus = "learning" | "known";

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
  };
}

function persist(phrases: SavedPhrase[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(phrases.slice(0, MAX_PHRASES)));
  void pushStore(KEY);
}

export function getSavedPhrases(): SavedPhrase[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
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

export function savePhrase(phrase: Omit<SavedPhrase, "phrase" | "lemma" | "savedAt" | "status" | "updatedAt"> & { phrase: string; lemma?: string }): SavedPhrase[] {
  const now = new Date().toISOString();
  const entry: SavedPhrase = {
    ...phrase,
    phrase: clean(phrase.phrase),
    lemma: clean(phrase.lemma ?? phrase.phrase),
    savedAt: now,
    status: "learning",
    updatedAt: now,
  };
  const existing = getSavedPhrases().filter((saved) => saved.phrase !== entry.phrase);
  const next = [entry, ...existing];
  persist(next);
  return next;
}

export function markPhraseKnown(phrase: string): SavedPhrase[] {
  const key = clean(phrase);
  const now = new Date().toISOString();
  const next = getSavedPhrases().map((saved) => (saved.phrase === key ? { ...saved, status: "known" as const, updatedAt: now } : saved));
  persist(next);
  return next;
}

export function deletePhrase(phrase: string): SavedPhrase[] {
  const key = clean(phrase);
  const next = getSavedPhrases().filter((saved) => saved.phrase !== key);
  persist(next);
  return next;
}
