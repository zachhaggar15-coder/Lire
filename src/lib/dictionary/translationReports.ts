import { pushStore, recordStoreDeletion } from "@/lib/supabase/sync";

/**
 * Reader-reported translation problems.
 *
 * This replaces the old "Improve dictionary" control, which let a reader
 * overwrite their own local dictionary entry. That was developer tooling
 * wearing a consumer label: it asked someone still learning French to author a
 * lexicographic correction, it silently changed what every future tap on that
 * word said, and a mistake in it was invisible and permanent.
 *
 * A report is just a signal. It never edits what Sorlio shows. The store is
 * local today and already syncs through the same mechanism as saved words, so
 * connecting a backend later means adding a submit call at the boundary in
 * `recordTranslationReport` — nothing above it has to change.
 */

export type TranslationReportReason = "wrong-meaning" | "wrong-in-context" | "not-english" | "other";

export interface TranslationReport {
  id: string;
  /** What the reader tapped. */
  french: string;
  /** The meaning Sorlio showed them, which they are disputing. */
  shownEnglish: string;
  /** Which resolver tier produced the disputed meaning — the most useful field for triage. */
  shownSource: string;
  reason: TranslationReportReason;
  /** Optional reader-supplied correction. Never fed back into lookups. */
  suggestion: string | null;
  contextSentence: string;
  articleTitle: string;
  createdAt: string;
}

export const TRANSLATION_REPORT_REASONS: { value: TranslationReportReason; label: string }[] = [
  { value: "wrong-in-context", label: "Doesn't fit this sentence" },
  { value: "wrong-meaning", label: "Wrong meaning" },
  { value: "not-english", label: "Confusing English" },
  { value: "other", label: "Something else" },
];

const KEY = "lire.translationReports.v1";
const MAX_REPORTS = 300;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function makeId(french: string): string {
  const slug = french.trim().toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `${Date.now()}-${slug || "report"}`;
}

function normalise(entry: unknown): TranslationReport | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  if (typeof e.french !== "string" || !e.french.trim()) return null;
  const reason = TRANSLATION_REPORT_REASONS.some((option) => option.value === e.reason)
    ? (e.reason as TranslationReportReason)
    : "other";
  return {
    id: typeof e.id === "string" ? e.id : makeId(e.french),
    french: e.french.trim(),
    shownEnglish: typeof e.shownEnglish === "string" ? e.shownEnglish : "",
    shownSource: typeof e.shownSource === "string" ? e.shownSource : "unknown",
    reason,
    suggestion: typeof e.suggestion === "string" && e.suggestion.trim() ? e.suggestion.trim() : null,
    contextSentence: typeof e.contextSentence === "string" ? e.contextSentence : "",
    articleTitle: typeof e.articleTitle === "string" ? e.articleTitle : "",
    createdAt: typeof e.createdAt === "string" ? e.createdAt : new Date().toISOString(),
  };
}

function persist(reports: TranslationReport[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(reports.slice(0, MAX_REPORTS)));
    void pushStore(KEY);
  } catch {
    // Diagnostics must never cost a reader their saved vocabulary if storage
    // is full — drop the report rather than letting the write throw.
  }
}

export function getTranslationReports(): TranslationReport[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalise).filter((report): report is TranslationReport => report !== null);
  } catch {
    return [];
  }
}

export function recordTranslationReport(
  report: Omit<TranslationReport, "id" | "createdAt">
): TranslationReport[] {
  const entry = normalise({ ...report, id: makeId(report.french), createdAt: new Date().toISOString() });
  if (!entry) return getTranslationReports();
  const next = [entry, ...getTranslationReports()];
  persist(next);
  return next;
}

export function deleteTranslationReport(id: string): TranslationReport[] {
  recordStoreDeletion(KEY, id);
  const next = getTranslationReports().filter((report) => report.id !== id);
  persist(next);
  return next;
}
