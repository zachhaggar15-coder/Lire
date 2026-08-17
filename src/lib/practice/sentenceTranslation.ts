import type { ReadingText } from "@/types";
import { getPrecomputedTranslation } from "@/lib/ai/precomputedTranslations";
import { allSentencesInText } from "@/lib/practice/textSentences";

/**
 * A natural English translation of one sentence, for practice feedback.
 *
 * Reconstruction closes a loop: the learner assembles the French and is then
 * shown what they built. That only works if the English is genuinely natural —
 * showing a dictionary-composed rendering ("je me suis réveillée tard" → "i me
 * to be wake late") as the reward for getting the sentence right would teach
 * the wrong thing at the exact moment the learner is paying most attention.
 *
 * So this only ever returns a translation a human would recognise as English:
 * the precomputed article translation, which is the same source the reader's
 * "Show English" uses. When there isn't one, it returns null and the caller
 * shows the French alone rather than inventing something.
 */

const cache = new Map<string, Promise<string[] | null>>();

function sentencesFor(text: ReadingText): Promise<string[] | null> {
  let pending = cache.get(text.id);
  if (!pending) {
    pending = getPrecomputedTranslation(text.id)
      .then((result) => result?.sentences ?? null)
      .catch(() => null);
    cache.set(text.id, pending);
  }
  return pending;
}

/**
 * The natural English for a sentence, or null when no trustworthy one exists.
 *
 * Indexed rather than matched on text: `allSentencesInText` and the
 * precomputed store are built from the same flattening of the same body, so
 * position is exact, while string matching would break on any whitespace or
 * punctuation difference.
 */
export async function naturalSentenceTranslation(
  text: ReadingText,
  sentenceIndex: number
): Promise<string | null> {
  const sentences = await sentencesFor(text);
  if (!sentences) return null;
  // A length mismatch means the stored translation belongs to a different
  // version of this article, so the indices no longer line up and any answer
  // would be the wrong sentence.
  if (sentences.length !== allSentencesInText(text).length) return null;
  const english = sentences[sentenceIndex]?.trim();
  return english || null;
}
