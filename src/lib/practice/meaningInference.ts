import type { ReadingText } from "@/types";
import { buildInferenceChallenge, type InferenceChallenge } from "@/lib/inference";
import { lookupWord } from "@/lib/dictionary/lookup";
import { selectInferenceWords } from "@/lib/learningCandidates";
import { allSentencesInText } from "@/lib/practice/textSentences";
import { resolveMeaning } from "@/lib/dictionary/resolveMeaning";

/**
 * "Guess this word from context" exercises, built from the text just read.
 *
 * These used to fire inside the reading flow: tapping certain words hid the
 * meaning behind a quiz first. That inverted the deal a tap makes — a reader
 * who taps has already decided they need help, and making them earn the answer
 * punishes exactly the moment they reached for support. The exercise itself is
 * good, so it moves here, where the reader has chosen to practise and guessing
 * is the point.
 */

export interface MeaningInferenceExercise {
  challenge: InferenceChallenge;
  /** The sentence the word appeared in, shown as the context to reason from. */
  contextSentence: string;
  /** Which sentence of the text this came from, so other builders don't reuse it. */
  sentenceIndex: number;
}

/**
 * Builds up to `limit` inference exercises for a text.
 *
 * Only words whose contextual meaning Sorlio is confident about become
 * questions: a quiz whose "correct" answer is a low-confidence guess would
 * mark a reader wrong for being right. The answer shown is the resolved
 * contextual meaning, so practice agrees with what the reader saw while
 * reading.
 */
export function buildMeaningInferenceExercises(
  text: ReadingText,
  knownWords: Set<string>,
  limit = 2
): MeaningInferenceExercise[] {
  const candidates = selectInferenceWords(text, knownWords, limit * 3);
  if (candidates.size === 0) return [];

  const exercises: MeaningInferenceExercise[] = [];
  const usedWords = new Set<string>();

  for (const sentence of allSentencesInText(text)) {
    // At most one question per sentence. Two questions about the same sentence
    // read as the app repeating itself, and the rest of the practice session
    // assumes each activity owns a distinct sentence.
    let claimedThisSentence = false;
    for (let index = 0; index < sentence.tokens.length && !claimedThisSentence; index++) {
      if (exercises.length >= limit) return exercises;
      const token = sentence.tokens[index];
      if (!token.isWord || usedWords.has(token.clean)) continue;
      if (!candidates.has(token.clean)) continue;

      const meaning = resolveMeaning({
        tokens: sentence.tokens,
        tokenIndex: index,
        contextSentence: sentence.text,
      });
      if (meaning.abstained || meaning.confidence === "low") continue;
      // An expression's meaning belongs to the whole phrase, so quizzing the
      // single word the reader happened to land on would be unfair.
      if (meaning.partOfExpression) continue;

      const challenge = buildInferenceChallenge(
        token.clean,
        lookupWord(token.text),
        sentence.text,
        meaning.displayEnglish,
        meaning.displayEnglish
      );
      if (!challenge) continue;

      usedWords.add(token.clean);
      claimedThisSentence = true;
      exercises.push({ challenge, contextSentence: sentence.text, sentenceIndex: sentence.index });
    }
  }

  return exercises;
}
