import { pushStore } from "@/lib/supabase/sync";

const TRANSLATION_BUDGET_KEY = "lire.translationBudget.v1";
const SECOND_PASS_KEY = "lire.secondPass.v1";

export interface TranslationBudgetRecord {
  id: string;
  articleId: string;
  articleTitle: string;
  allowance: number;
  used: number;
  metTarget: boolean;
  completedAt: string;
}

export interface SecondPassRecord {
  id: string;
  articleId: string;
  articleTitle: string;
  startedAt: string;
  completedAt: string;
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

function isTranslationBudgetRecord(value: unknown): value is TranslationBudgetRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.articleId === "string" &&
    typeof item.allowance === "number" &&
    typeof item.used === "number" &&
    typeof item.metTarget === "boolean" &&
    typeof item.completedAt === "string"
  );
}

function isSecondPassRecord(value: unknown): value is SecondPassRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.articleId === "string" &&
    typeof item.startedAt === "string" &&
    typeof item.completedAt === "string"
  );
}

export function suggestedTranslationAllowance(unknownWordRatio: number | null | undefined): number {
  if (unknownWordRatio == null) return 8;
  if (unknownWordRatio <= 0.05) return 5;
  if (unknownWordRatio <= 0.1) return 8;
  if (unknownWordRatio <= 0.18) return 10;
  return 12;
}

export function getTranslationBudgetRecords(): TranslationBudgetRecord[] {
  return readArray(TRANSLATION_BUDGET_KEY, isTranslationBudgetRecord);
}

export function recordTranslationBudgetResult(record: Omit<TranslationBudgetRecord, "id">): TranslationBudgetRecord[] {
  const id = `${record.articleId}::${record.completedAt}`;
  const next = [{ ...record, id }, ...getTranslationBudgetRecords().filter((entry) => entry.id !== id)].slice(0, 300);
  persist(TRANSLATION_BUDGET_KEY, next);
  return next;
}

export function getSecondPassRecords(): SecondPassRecord[] {
  return readArray(SECOND_PASS_KEY, isSecondPassRecord);
}

export function recordSecondPass(record: Omit<SecondPassRecord, "id">): SecondPassRecord[] {
  const id = `${record.articleId}::${record.completedAt}`;
  const next = [{ ...record, id }, ...getSecondPassRecords().filter((entry) => entry.id !== id)].slice(0, 300);
  persist(SECOND_PASS_KEY, next);
  return next;
}

export function clearReadingInsightStores(): void {
  persist(TRANSLATION_BUDGET_KEY, []);
  persist(SECOND_PASS_KEY, []);
}
