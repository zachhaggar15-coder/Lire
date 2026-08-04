import type { ParaphraseGenerationOption } from "@/lib/ai/types";

/**
 * Validates a generated paraphrase set before it's ever shown to a learner.
 * Every rejection here means the practice builder falls back to
 * reconstruction/cloze for that sentence instead — paraphrase generation can
 * never block lesson completion.
 */
export type ParaphraseValidationResult = { ok: true } | { ok: false; reason: string };

function normalizeForCompare(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?…,;:'"«»()]/g, "");
}

/** Crude near-duplicate check: same normalized text, or one is a short prefix/suffix of the other. */
function areNearDuplicates(a: string, b: string): boolean {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  if (!na || !nb) return true;
  if (na === nb) return true;
  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length <= nb.length ? nb : na;
  return longer.length - shorter.length <= 3 && longer.startsWith(shorter.slice(0, Math.max(1, shorter.length - 2)));
}

/** Rejects an "easy paraphrase" that merely rearranges almost all the same
 * words. Character-prefix checks miss this completely even though a learner
 * can solve it without understanding the sentence. */
function isReorderedEcho(a: string, b: string): boolean {
  const aTokens = normalizeForCompare(a).split(" ").filter(Boolean);
  const bTokens = normalizeForCompare(b).split(" ").filter(Boolean);
  if (Math.min(aTokens.length, bTokens.length) < 5) return false;
  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  const shared = [...aSet].filter((token) => bSet.has(token)).length;
  const overlap = shared / Math.min(aSet.size, bSet.size);
  return overlap >= 0.85 && Math.abs(aTokens.length - bTokens.length) <= 2;
}

export function validateParaphraseSet(sourceSentence: string, options: ParaphraseGenerationOption[]): ParaphraseValidationResult {
  if (options.length !== 3) {
    return { ok: false, reason: `expected exactly 3 options, got ${options.length}` };
  }
  const correctOptions = options.filter((o) => o.isCorrect);
  if (correctOptions.length !== 1) {
    return { ok: false, reason: `expected exactly 1 correct option, got ${correctOptions.length}` };
  }
  const incorrectOptions = options.filter((o) => !o.isCorrect);
  for (const option of incorrectOptions) {
    if (!option.distinction) return { ok: false, reason: "an incorrect option is missing its distinction reason" };
    if (!option.feedback.trim()) return { ok: false, reason: "an incorrect option is missing feedback" };
  }

  const texts = options.map((o) => o.text.trim());
  if (texts.some((t) => t.length < 8)) {
    return { ok: false, reason: "an option is too short to be a real paraphrase" };
  }

  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      if (areNearDuplicates(texts[i], texts[j])) {
        return { ok: false, reason: "two options are near-identical" };
      }
    }
  }

  const correctText = correctOptions[0].text.trim();
  if (areNearDuplicates(correctText, sourceSentence) || isReorderedEcho(correctText, sourceSentence)) {
    return { ok: false, reason: "the correct option is almost identical to or only reorders the original sentence" };
  }

  return { ok: true };
}
