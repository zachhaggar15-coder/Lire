import type { ReadingText } from "@/types";
import { buildGistQuestion, type MultipleChoiceQuestion, type ToneQuestion } from "@/lib/comprehension";
import { notifyStoreChanged } from "@/lib/sync/runtime";
import { localStore } from "@/lib/localData/store";

const KEY = "lire.comprehensionQuestions.v1";
// 3: bundles built before provenance was recognised and before automatic tone
// questions were withdrawn are discarded, never shown again.
const CACHE_VERSION = 3;
let memoryCache: CachedComprehensionQuestionBundle[] = [];

export interface ComprehensionQuestionBundle {
  /** Null when the text has no English blurb to build honest options from — see canBuildGistQuestion. */
  gistQuestion: MultipleChoiceQuestion | null;
  toneQuestions: ToneQuestion[];
}

interface CachedComprehensionQuestionBundle extends ComprehensionQuestionBundle {
  textId: string;
  signature: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  source: "local";
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readCache(): CachedComprehensionQuestionBundle[] {
  if (!hasStorage()) return memoryCache;
  try {
    const raw = localStore.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCachedBundle) : [];
  } catch {
    return [];
  }
}

function isQuestion(value: unknown): value is MultipleChoiceQuestion {
  if (!value || typeof value !== "object") return false;
  const question = value as Record<string, unknown>;
  return (
    typeof question.id === "string" &&
    typeof question.prompt === "string" &&
    Array.isArray(question.choices) &&
    question.choices.every((choice) => typeof choice === "string") &&
    typeof question.answerIndex === "number"
  );
}

function isToneQuestion(value: unknown): value is ToneQuestion {
  if (!isQuestion(value)) return false;
  const question = value as unknown as { kind?: unknown };
  return question.kind === "stance" || question.kind === "tone" || question.kind === "confidence";
}

function isCachedBundle(value: unknown): value is CachedComprehensionQuestionBundle {
  if (!value || typeof value !== "object") return false;
  const bundle = value as Record<string, unknown>;
  return (
    typeof bundle.textId === "string" &&
    typeof bundle.signature === "string" &&
    bundle.version === CACHE_VERSION &&
    (bundle.gistQuestion === null || isQuestion(bundle.gistQuestion)) &&
    Array.isArray(bundle.toneQuestions) &&
    bundle.toneQuestions.every(isToneQuestion)
  );
}

function persist(cache: CachedComprehensionQuestionBundle[]): void {
  if (!hasStorage()) {
    memoryCache = cache;
    return;
  }
  localStore.writeItem(KEY, JSON.stringify(cache));
  notifyStoreChanged(KEY);
}

function signatureFor(text: ReadingText): string {
  const input = [text.id, text.title, text.preview, text.blurbEn ?? "", text.body].join("\n");
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return `${CACHE_VERSION}:${input.length}:${hash >>> 0}`;
}

export function buildComprehensionQuestionBundle(
  text: ReadingText,
  candidates: ReadingText[]
): ComprehensionQuestionBundle {
  return {
    gistQuestion: buildGistQuestion(text, candidates),
    // No tone or stance questions. They were inferred from keyword counts,
    // which cannot tell the author's view from a quoted or described
    // character's ("inquiet" in someone's mouth made the author "sceptical"),
    // nor see negation. A scored answer has to be known, and none of these
    // were, so Sorlio asks none.
    toneQuestions: [],
  };
}

export function getOrCreateComprehensionQuestionBundle(
  text: ReadingText,
  candidates: ReadingText[]
): ComprehensionQuestionBundle {
  if (candidates.length === 0) return buildComprehensionQuestionBundle(text, candidates);

  const signature = signatureFor(text);
  const cache = readCache();
  const cached = cache.find((bundle) => bundle.textId === text.id && bundle.signature === signature);
  if (cached) {
    return {
      gistQuestion: cached.gistQuestion,
      toneQuestions: cached.toneQuestions,
    };
  }

  const created = buildComprehensionQuestionBundle(text, candidates);
  const now = new Date().toISOString();
  persist([
    {
      ...created,
      textId: text.id,
      signature,
      version: CACHE_VERSION,
      createdAt: now,
      updatedAt: now,
      source: "local",
    },
    ...cache.filter((bundle) => bundle.textId !== text.id).slice(0, 99),
  ]);
  return created;
}

export function clearComprehensionQuestionCache(): void {
  persist([]);
}
