import type { Category, Difficulty, ReadingText } from "@/types";
import { hashString } from "@/lib/hash";
import { stripMetadataOnlyBlurb } from "@/lib/readingSummaries";
import { notifyStoreChanged } from "@/lib/sync/runtime";
import { localStore, type WriteFailure } from "@/lib/localData/store";

const KEY = "lire.customTexts.v1";
const MAX_CUSTOM_TEXTS = 80;
/** Imported text limits. Far above a long article; keeps device storage and (opt-in) sync bounded. */
export const MAX_IMPORT_CHARS = 50_000;
export const MAX_IMPORT_TITLE_CHARS = 200;

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
    const raw = localStore.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(isReadingText).map(stripMetadataOnlyBlurb) : [];
  } catch {
    return [];
  }
}

function persist(texts: ReadingText[]): WriteFailure | null {
  if (!hasStorage()) return "unavailable";
  const result = localStore.writeItem(KEY, JSON.stringify(texts.slice(0, MAX_CUSTOM_TEXTS)));
  if (!result.ok) return result.reason;
  notifyStoreChanged(KEY);
  return null;
}

export type SaveCustomTextResult = { ok: true; text: ReadingText } | { ok: false; reason: WriteFailure | "too-long" | "empty" };

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

export function saveCustomText(input: CustomTextInput): SaveCustomTextResult {
  const title = (input.title.trim() || "Imported French text").slice(0, MAX_IMPORT_TITLE_CHARS);
  const body = input.body.trim();
  if (!body) return { ok: false, reason: "empty" };
  if (body.length > MAX_IMPORT_CHARS) return { ok: false, reason: "too-long" };
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
  const failure = persist([text, ...existing]);
  return failure ? { ok: false, reason: failure } : { ok: true, text };
}

export type DeleteCustomTextResult = { ok: true; texts: ReadingText[] } | { ok: false; texts: ReadingText[]; reason: WriteFailure };

export function deleteCustomText(id: string): DeleteCustomTextResult {
  const current = read();
  const next = current.filter((text) => text.id !== id);
  const failure = persist(next);
  return failure ? { ok: false, texts: current, reason: failure } : { ok: true, texts: next };
}
