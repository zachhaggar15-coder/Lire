/**
 * localStorage-backed list of words/lemmas the user already knows.
 * Deliberately separate from SavedWord: marking a word "known" from the
 * reader never creates a flashcard — it just goes on this list so it can
 * be skipped/de-emphasised. A saved word can also become known later (via
 * the Review page's "Mark as known"), which adds it here too.
 */

import { pushStore } from "@/lib/supabase/sync";

const KEY = "lire.knownWords.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function clean(wordOrLemma: string): string {
  return wordOrLemma.trim().toLowerCase();
}

export function getKnownWords(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((w): w is string => typeof w === "string") : [];
  } catch {
    return [];
  }
}

function persist(words: string[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(words));
  void pushStore(KEY);
}

export function isKnown(wordOrLemma: string): boolean {
  if (!wordOrLemma) return false;
  return getKnownWords().includes(clean(wordOrLemma));
}

export function markKnown(wordOrLemma: string): string[] {
  const key = clean(wordOrLemma);
  if (!key) return getKnownWords();
  const words = getKnownWords();
  if (words.includes(key)) return words;
  const next = [...words, key];
  persist(next);
  return next;
}

export function markKnownBatch(wordsOrLemmas: string[]): string[] {
  const existing = getKnownWords();
  const next = new Set(existing);
  for (const word of wordsOrLemmas) {
    const key = clean(word);
    if (key) next.add(key);
  }
  const out = [...next];
  if (out.length !== existing.length) persist(out);
  return out;
}

export function removeKnown(wordOrLemma: string): string[] {
  const key = clean(wordOrLemma);
  const next = getKnownWords().filter((w) => w !== key);
  persist(next);
  return next;
}

export function clearKnownWords(): void {
  persist([]);
}
