import { pushStore } from "@/lib/supabase/sync";

const TAP_KEY = "lire.wordTapStats.v1";
const INFERENCE_KEY = "lire.inferredWords.v1";

export interface StoredWordTap {
  id?: string;
  articleId: string;
  word: string;
  lemma: string | null;
  count: number;
  updatedAt: string;
}

export interface StoredInference {
  id?: string;
  articleId: string;
  word: string;
  lemma: string | null;
  correct: boolean;
  answeredAt: string;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readArray<T>(key: string, guard: (value: unknown) => value is T): T[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

function persist(key: string, value: unknown): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  void pushStore(key);
}

function recordId(articleId: string, word: string): string {
  return `${articleId}::${word.toLowerCase()}`;
}

function isStoredWordTap(value: unknown): value is StoredWordTap {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.articleId === "string" && typeof item.word === "string" && typeof item.count === "number";
}

function isStoredInference(value: unknown): value is StoredInference {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.articleId === "string" && typeof item.word === "string" && typeof item.correct === "boolean";
}

export function recordWordTap(articleId: string, word: string, lemma: string | null): StoredWordTap[] {
  const key = recordId(articleId, word);
  const now = new Date().toISOString();
  const taps = readArray(TAP_KEY, isStoredWordTap);
  let found = false;
  const next = taps.map((tap) => {
    if (recordId(tap.articleId, tap.word) !== key) return tap.id ? tap : { ...tap, id: recordId(tap.articleId, tap.word) };
    found = true;
    return { ...tap, id: key, lemma, count: tap.count + 1, updatedAt: now };
  });
  if (!found) next.unshift({ id: key, articleId, word, lemma, count: 1, updatedAt: now });
  persist(TAP_KEY, next.slice(0, 1000));
  return next;
}

export function getWordTapsForArticle(articleId: string): StoredWordTap[] {
  return readArray(TAP_KEY, isStoredWordTap).filter((tap) => tap.articleId === articleId);
}

export function getAllWordTaps(): StoredWordTap[] {
  return readArray(TAP_KEY, isStoredWordTap);
}

export function recordInferenceResult(articleId: string, word: string, lemma: string | null, correct: boolean): StoredInference[] {
  const now = new Date().toISOString();
  const key = recordId(articleId, word);
  const next = [
    { id: key, articleId, word, lemma, correct, answeredAt: now },
    ...readArray(INFERENCE_KEY, isStoredInference)
      .filter((entry) => !(entry.articleId === articleId && entry.word === word))
      .map((entry) => (entry.id ? entry : { ...entry, id: recordId(entry.articleId, entry.word) })),
  ];
  persist(INFERENCE_KEY, next.slice(0, 1000));
  return next;
}

export function getInferenceResult(articleId: string, word: string): StoredInference | null {
  return readArray(INFERENCE_KEY, isStoredInference).find((entry) => entry.articleId === articleId && entry.word === word) ?? null;
}

export function getAllInferenceResults(): StoredInference[] {
  return readArray(INFERENCE_KEY, isStoredInference);
}

export function clearWordLearningStores(): void {
  persist(TAP_KEY, []);
  persist(INFERENCE_KEY, []);
}
