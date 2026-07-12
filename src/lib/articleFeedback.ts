import type { ReadingText } from "@/types";
import { recordArticlePreference } from "@/lib/recommendation/preferences";
import { pushStore } from "@/lib/supabase/sync";

export type ArticleDifficultyFeedback = "too-easy" | "good" | "hard";

export interface ArticleFeedback {
  textId: string;
  title: string;
  sourceName: string | null;
  category: string;
  difficulty: string;
  feedback: ArticleDifficultyFeedback;
  createdAt: string;
  updatedAt: string;
}

const KEY = "lire.articleFeedback.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function normalize(entry: unknown): ArticleFeedback | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  if (typeof e.textId !== "string" || !e.textId) return null;
  if (e.feedback !== "too-easy" && e.feedback !== "good" && e.feedback !== "hard") return null;
  const now = new Date().toISOString();
  return {
    textId: e.textId,
    title: typeof e.title === "string" ? e.title : "",
    sourceName: typeof e.sourceName === "string" ? e.sourceName : null,
    category: typeof e.category === "string" ? e.category : "",
    difficulty: typeof e.difficulty === "string" ? e.difficulty : "",
    feedback: e.feedback,
    createdAt: typeof e.createdAt === "string" ? e.createdAt : now,
    updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : now,
  };
}

function persist(entries: ArticleFeedback[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(entries));
  void pushStore(KEY);
}

export function getArticleFeedback(): ArticleFeedback[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((entry): entry is ArticleFeedback => entry !== null);
  } catch {
    return [];
  }
}

export function getArticleFeedbackForText(textId: string): ArticleFeedback | null {
  return getArticleFeedback().find((entry) => entry.textId === textId) ?? null;
}

export function saveArticleFeedback(text: ReadingText, feedback: ArticleDifficultyFeedback, difficulty: string): ArticleFeedback[] {
  const now = new Date().toISOString();
  const existing = getArticleFeedback();
  const previous = existing.find((entry) => entry.textId === text.id);
  const entry: ArticleFeedback = {
    textId: text.id,
    title: text.title,
    sourceName: text.sourceName ?? null,
    category: text.category,
    difficulty,
    feedback,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  const next = [entry, ...existing.filter((item) => item.textId !== text.id)];
  persist(next);
  if (feedback === "too-easy") recordArticlePreference(text, "less");
  if (feedback === "hard") recordArticlePreference(text, "less");
  if (feedback === "good") recordArticlePreference(text, "more");
  return next;
}
