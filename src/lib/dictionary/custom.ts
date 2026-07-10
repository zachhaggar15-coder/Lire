import type { DictionaryEntry } from "@/lib/dictionary/types";
import { pushStore } from "@/lib/supabase/sync";

/**
 * Browser-only custom dictionary entries. These are created from explicit AI
 * backfills on missing words, so the next tap can resolve instantly without
 * asking AI again. Server-side callers simply see an empty custom layer.
 */

const KEY = "lire.customDictionary.v1";
const MAX_ENTRIES = 500;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function clean(value: string): string {
  return value.trim().toLowerCase();
}

function normalise(entry: unknown): DictionaryEntry | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  if (typeof e.lemma !== "string" || !clean(e.lemma)) return null;
  if (!Array.isArray(e.translations)) return null;

  const translations = e.translations.filter((t): t is string => typeof t === "string" && !!t.trim());
  if (translations.length === 0) return null;

  return {
    lemma: clean(e.lemma),
    forms: Array.isArray(e.forms) ? e.forms.filter((f): f is string => typeof f === "string" && !!f.trim()).map(clean) : undefined,
    translations,
    partOfSpeech: typeof e.partOfSpeech === "string" ? e.partOfSpeech : undefined,
    gender:
      e.gender === "masculine" || e.gender === "feminine" || e.gender === "both"
        ? e.gender
        : undefined,
    examples:
      Array.isArray(e.examples) &&
      e.examples.every(
        (example) =>
          example &&
          typeof example === "object" &&
          typeof (example as Record<string, unknown>).fr === "string" &&
          typeof (example as Record<string, unknown>).en === "string"
      )
        ? (e.examples as DictionaryEntry["examples"])
        : undefined,
  };
}

export function getCustomDictionaryEntries(): DictionaryEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalise).filter((entry): entry is DictionaryEntry => entry !== null);
  } catch {
    return [];
  }
}

export function getCustomDictionaryEntry(wordOrLemma: string): DictionaryEntry | null {
  const key = clean(wordOrLemma);
  if (!key) return null;
  return getCustomDictionaryEntries().find((entry) => entry.lemma === key || entry.forms?.includes(key)) ?? null;
}

export function saveCustomDictionaryEntry(entry: DictionaryEntry): DictionaryEntry[] {
  if (!hasStorage()) return [];
  const normalised = normalise(entry);
  if (!normalised) return getCustomDictionaryEntries();

  const existing = getCustomDictionaryEntries().filter((item) => item.lemma !== normalised.lemma);
  const next = [normalised, ...existing].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  void pushStore(KEY);
  return next;
}
