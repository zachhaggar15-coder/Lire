import { cacheStore, paraphraseCacheKey } from "@/lib/ai/cache";
import type { ParaphraseDistinctionKind, ParaphraseGenerationRequest, ParaphraseGenerationResult } from "@/lib/ai/types";
import { validateParaphraseSet } from "@/lib/practice/paraphraseValidation";
import type { TextSentence } from "@/lib/practice/textSentences";
import { getAccessToken } from "@/lib/supabase/auth";

/**
 * Paraphrase-recognition exercise: pick the closest paraphrase of a sentence
 * from the text, assessing comprehension rather than exact word recall.
 * Generation is LLM-based (rule-based can't reliably produce a *specific-
 * reason* wrong answer — see paraphraseValidation.ts) and cached per
 * sentence, same amortization as word/sentence explanations. Every result is
 * validated before being shown; an ineligible sentence or a failed/invalid
 * generation simply means no paraphrase activity is offered for that slot —
 * see session.ts's round-robin, which already degrades gracefully.
 */
export interface ParaphraseOption {
  id: string;
  text: string;
  isCorrect: boolean;
  distinction: ParaphraseDistinctionKind | null;
  feedback: string;
}

export interface ParaphraseExercise {
  sentenceIndex: number;
  sourceSentence: string;
  /** Exactly 3, shuffled. */
  options: ParaphraseOption[];
}

const MIN_WORDS = 6;
const MAX_WORDS = 28;
/** More than this many capitalized words after the first (a rough proper-noun signal) means the sentence leans too heavily on names to paraphrase meaningfully. */
const MAX_CAPITALIZED_BEYOND_FIRST = 3;

/** Whether a sentence is a reasonable candidate: a real, self-contained sentence, not too short to paraphrase meaningfully, not too long/convoluted, not overly dependent on proper nouns. */
export function isEligibleForParaphrase(sentence: TextSentence): boolean {
  const text = sentence.text.trim();
  if (!/[.!?…]["'’»)]?$/.test(text)) return false;
  if (!/^[\p{Lu}«"'(]/u.test(text)) return false;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < MIN_WORDS || words.length > MAX_WORDS) return false;

  const capitalizedBeyondFirst = words.slice(1).filter((w) => /^[\p{Lu}]/u.test(w)).length;
  if (capitalizedBeyondFirst > MAX_CAPITALIZED_BEYOND_FIRST) return false;

  return true;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toExercise(sentence: TextSentence, result: ParaphraseGenerationResult): ParaphraseExercise {
  const options: ParaphraseOption[] = result.options.map((o, i) => ({
    id: `option-${i}`,
    text: o.text,
    isCorrect: o.isCorrect,
    distinction: o.distinction,
    feedback: o.feedback,
  }));
  return { sentenceIndex: sentence.index, sourceSentence: sentence.text.trim(), options: shuffle(options) };
}

async function fetchOnce(req: ParaphraseGenerationRequest): Promise<ParaphraseGenerationResult | null> {
  try {
    // The route requires a signed-in Premium account (src/lib/ai/guard.ts);
    // without the token it answers 401 and paraphrase generation is skipped,
    // which this function already treats as "no exercise available".
    const token = await getAccessToken();
    const res = await fetch("/api/ai/paraphrase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as ParaphraseGenerationResult | null;
    if (!body || !Array.isArray(body.options)) return null;
    const validation = validateParaphraseSet(req.sentence, body.options);
    if (!validation.ok) return null;
    return body;
  } catch {
    return null;
  }
}

/**
 * Builds one paraphrase exercise for an eligible sentence, cache-first.
 * Retries generation once on failure/invalid output (never caching a bad
 * result — cache is only ever populated with an already-validated set).
 * Returns null if generation is unavailable or never produces a valid set;
 * the caller (PracticeOverlay) treats null as "no paraphrase activity this
 * time," not an error.
 */
export async function buildParaphraseExercise(
  sentence: TextSentence,
  articleTitle: string | null,
  level: string
): Promise<ParaphraseExercise | null> {
  const key = paraphraseCacheKey(sentence.text);
  const cached = cacheStore.get<ParaphraseGenerationResult>(key);
  if (cached) return toExercise(sentence, cached);

  const req: ParaphraseGenerationRequest = { sentence: sentence.text.trim(), articleTitle, level };
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await fetchOnce(req);
    if (result) {
      cacheStore.set(key, result);
      return toExercise(sentence, result);
    }
  }
  return null;
}

/** Picks one random eligible sentence not already used by another practice activity in this session. */
export function pickParaphraseCandidateSentence(sentences: TextSentence[], usedIndices: Set<number>): TextSentence | null {
  const eligible = sentences.filter((s) => isEligibleForParaphrase(s) && !usedIndices.has(s.index));
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export function checkParaphraseAnswer(exercise: ParaphraseExercise, selectedId: string): boolean {
  return exercise.options.find((o) => o.id === selectedId)?.isCorrect ?? false;
}
