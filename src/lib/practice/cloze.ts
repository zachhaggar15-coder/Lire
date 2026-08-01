import { tokenize, type Token } from "@/lib/words";
import type { TextSentence } from "@/lib/practice/textSentences";

export type ClozeKind = "word" | "phrase";

export interface ClozeExercise {
  kind: ClozeKind;
  sentenceIndex: number;
  /** The sentence with the blanked span replaced by "___". */
  prompt: string;
  /** The exact original text of the blanked span. */
  answer: string;
  /** Shuffled answer options, including the correct one. */
  options: string[];
}

const STOPWORDS = new Set([
  "le", "la", "les", "l", "un", "une", "des", "de", "du", "et", "ou", "mais", "que", "qui",
  "à", "au", "aux", "en", "ce", "cette", "ces", "il", "elle", "ils", "elles", "on", "je", "tu",
  "nous", "vous", "y", "se", "s", "ne", "pas", "est", "sont", "être", "avoir", "a", "ai", "as",
]);

/** A blank-worthy content word: real word, long enough, not a bare function word, not first/last chip. */
function contentWordIndices(tokens: Token[]): number[] {
  const wordIndices = tokens.map((t, i) => ({ t, i })).filter(({ t }) => t.isWord);
  return wordIndices
    .filter(({ t }, position) => {
      if (t.clean.length < 3) return false;
      if (STOPWORDS.has(t.clean)) return false;
      // Avoid blanking the very first or very last word of the sentence.
      if (position === 0 || position === wordIndices.length - 1) return false;
      return true;
    })
    .map(({ i }) => i);
}

function rebuildFromTokens(tokens: Token[], omit: Set<number>, placeholder: string): string {
  return tokens
    .map((token, i) => (omit.has(i) ? (omit.has(i - 1) ? "" : placeholder) : token.text))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Builds a single-word cloze from a sentence, or null if no suitable word exists. */
export function buildWordCloze(sentence: TextSentence, distractorPool: string[]): ClozeExercise | null {
  const candidates = contentWordIndices(sentence.tokens);
  if (candidates.length === 0) return null;
  const pickIndex = candidates[Math.floor(Math.random() * candidates.length)];
  const answerToken = sentence.tokens[pickIndex];
  const prompt = rebuildFromTokens(sentence.tokens, new Set([pickIndex]), "___");
  const options = buildOptions(answerToken.text, distractorPool);
  if (options.length < 2) return null;
  return { kind: "word", sentenceIndex: sentence.index, prompt, answer: answerToken.text, options };
}

/** Builds a two-word-phrase cloze from a sentence, or null if no suitable phrase exists. */
export function buildPhraseCloze(sentence: TextSentence, distractorPool: string[]): ClozeExercise | null {
  const wordIndices = sentence.tokens.map((t, i) => ({ t, i })).filter(({ t }) => t.isWord);
  if (wordIndices.length < 5) return null; // need room either side of a 2-word span
  // Pick a starting position that leaves at least one real word on each side.
  const validStarts = wordIndices.slice(1, -2).map(({ i }) => i);
  if (validStarts.length === 0) return null;
  const startTokenIndex = validStarts[Math.floor(Math.random() * validStarts.length)];
  // Find the very next word token to make a 2-word span (may include an interstitial
  // non-word token like an apostrophe-less space, kept intact for a natural phrase).
  const nextWordPos = wordIndices.findIndex(({ i }) => i > startTokenIndex);
  if (nextWordPos === -1) return null;
  const endTokenIndex = wordIndices[nextWordPos].i;
  const omit = new Set<number>();
  for (let i = startTokenIndex; i <= endTokenIndex; i++) omit.add(i);
  const answer = sentence.tokens
    .slice(startTokenIndex, endTokenIndex + 1)
    .map((t) => t.text)
    .join("")
    .trim();
  if (!/[\p{L}]/u.test(answer)) return null;
  const prompt = rebuildFromTokens(sentence.tokens, omit, "___");
  const options = buildOptions(answer, distractorPool, true);
  if (options.length < 2) return null;
  return { kind: "phrase", sentenceIndex: sentence.index, prompt, answer, options };
}

function buildOptions(answer: string, pool: string[], isPhrase = false): string[] {
  const cleanAnswer = answer.toLowerCase().trim();
  const seen = new Set([cleanAnswer]);
  const distractors: string[] = [];
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  for (const candidate of shuffledPool) {
    const clean = candidate.toLowerCase().trim();
    if (!clean || seen.has(clean)) continue;
    // Avoid a distractor that's a substring of the answer or vice versa (ambiguous credit).
    if (!isPhrase && (clean.includes(cleanAnswer) || cleanAnswer.includes(clean))) continue;
    seen.add(clean);
    distractors.push(candidate);
    if (distractors.length >= 3) break;
  }
  if (distractors.length === 0) return [];
  const options = [answer, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

/** Content words drawn from the whole article, for use as cloze distractors. */
export function distractorPoolFromBody(body: string, excludeSentenceIndex: number, allSentences: TextSentence[]): string[] {
  const words = new Set<string>();
  for (const sentence of allSentences) {
    if (sentence.index === excludeSentenceIndex) continue;
    for (const token of sentence.tokens) {
      if (token.isWord && token.clean.length >= 3 && !STOPWORDS.has(token.clean)) {
        words.add(token.text);
      }
    }
  }
  if (words.size >= 6) return Array.from(words);
  // Very short articles: fall back to tokenising the raw body for a slightly larger pool.
  return Array.from(new Set(tokenize(body).filter((t) => t.isWord && t.clean.length >= 3).map((t) => t.text)));
}
