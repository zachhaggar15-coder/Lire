import type { Category, Difficulty, ReadingText } from "@/types";
import { hashString } from "@/lib/hash";
import { stripMetadataOnlyBlurb } from "@/lib/readingSummaries";
import { pushStore } from "@/lib/supabase/sync";

const KEY = "lire.customTexts.v1";
const MAX_CUSTOM_TEXTS = 80;

export interface CustomTextInput {
  title: string;
  body: string;
  category: Category;
  difficulty: Difficulty;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read(): ReadingText[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(isReadingText).map(stripMetadataOnlyBlurb) : [];
  } catch {
    return [];
  }
}

function persist(texts: ReadingText[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(texts.slice(0, MAX_CUSTOM_TEXTS)));
  void pushStore(KEY);
}

function isReadingText(value: unknown): value is ReadingText {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.body === "string" &&
    typeof item.preview === "string" &&
    typeof item.minutes === "number"
  );
}

function previewFor(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 180);
}

function minutesFor(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 170));
}

export function getCustomTexts(): ReadingText[] {
  return read();
}

export function getCustomTextById(id: string): ReadingText | undefined {
  return read().find((text) => text.id === id);
}

export function saveCustomText(input: CustomTextInput): ReadingText {
  const title = input.title.trim() || "Imported French text";
  const body = input.body.trim();
  const createdAt = new Date().toISOString();
  const id = `custom-${hashString(`${title}\n${body}`).slice(0, 12)}`;
  const text: ReadingText = {
    id,
    title,
    category: input.category,
    difficulty: input.difficulty,
    minutes: minutesFor(body),
    preview: previewFor(body),
    blurbEn: null,
    body,
    sourceName: "Imported text",
    publishedAt: createdAt,
    language: "fr",
  };
  const existing = read().filter((item) => item.id !== id);
  persist([text, ...existing]);
  return text;
}

export function deleteCustomText(id: string): ReadingText[] {
  const next = read().filter((text) => text.id !== id);
  persist(next);
  return next;
}
