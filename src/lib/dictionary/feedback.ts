import { pushStore } from "@/lib/supabase/sync";

export type DictionaryFeedbackType = "correction" | "missing" | "phrase";

export interface DictionaryFeedback {
  id: string;
  type: DictionaryFeedbackType;
  input: string;
  lemma: string | null;
  previousTranslation: string | null;
  suggestedTranslation: string;
  articleTitle: string;
  contextSentence: string;
  createdAt: string;
  updatedAt: string;
}

const KEY = "lire.dictionaryFeedback.v1";
const MAX_FEEDBACK = 500;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function makeId(input: string): string {
  return `${Date.now()}-${input.trim().toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "entry"}`;
}

function normalize(entry: unknown): DictionaryFeedback | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  if (typeof e.input !== "string" || !e.input.trim()) return null;
  if (typeof e.suggestedTranslation !== "string" || !e.suggestedTranslation.trim()) return null;
  const now = new Date().toISOString();
  return {
    id: typeof e.id === "string" ? e.id : makeId(e.input),
    type: e.type === "missing" || e.type === "phrase" ? e.type : "correction",
    input: e.input.trim(),
    lemma: typeof e.lemma === "string" ? e.lemma : null,
    previousTranslation: typeof e.previousTranslation === "string" ? e.previousTranslation : null,
    suggestedTranslation: e.suggestedTranslation.trim(),
    articleTitle: typeof e.articleTitle === "string" ? e.articleTitle : "",
    contextSentence: typeof e.contextSentence === "string" ? e.contextSentence : "",
    createdAt: typeof e.createdAt === "string" ? e.createdAt : now,
    updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : now,
  };
}

function persist(entries: DictionaryFeedback[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_FEEDBACK)));
  void pushStore(KEY);
}

export function getDictionaryFeedback(): DictionaryFeedback[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((entry): entry is DictionaryFeedback => entry !== null);
  } catch {
    return [];
  }
}

export function recordDictionaryFeedback(entry: Omit<DictionaryFeedback, "id" | "createdAt" | "updatedAt">): DictionaryFeedback[] {
  const now = new Date().toISOString();
  const next = [
    {
      ...entry,
      id: makeId(entry.input),
      createdAt: now,
      updatedAt: now,
    },
    ...getDictionaryFeedback(),
  ];
  persist(next);
  return next;
}

export function deleteDictionaryFeedback(id: string): DictionaryFeedback[] {
  const next = getDictionaryFeedback().filter((entry) => entry.id !== id);
  persist(next);
  return next;
}
