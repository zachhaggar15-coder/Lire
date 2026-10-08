import { tokenize, type Token } from "@/lib/words";
import type { TextSentence } from "@/lib/practice/textSentences";
import { lookupWord } from "@/lib/dictionary/lookup";
import { hasWordClass, type WordClass } from "@/lib/dictionary/partOfSpeech";
import { exerciseGlossFor } from "@/lib/practice/exerciseGloss";

export type ClozeKind = "word";

export interface ClozeExercise {
  kind: ClozeKind;
  sentenceIndex: number;
  /** The sentence with the blanked word replaced by "___". */
  prompt: string;
  /** The exact original text of the blanked word. */
  answer: string;
  /** Answer options, including the correct one, in a stable order. */
  options: string[];
}

/**
 * A cloze is offered only when it is a fair question: one content word
 * blanked, and at least two wrong options from the same reading that would
 * fit the gap grammatically — same word class, and for nouns the same gender
 * and number, so the article in front of the gap gives nothing away; for
 * verbs and adjectives the same ending, so agreement gives nothing away. No
 * proper nouns or numbers, which would test recall of facts rather than
 * French. When no word in a sentence passes, that sentence gets no cloze.
 *
 * There used to be a "phrase" cloze that blanked any two adjacent words
 * ("elle ___ café" → "prépare un"). Adjacent words are not a unit, so it is
 * gone.
 */

const STOPWORDS = new Set([
  "le", "la", "les", "l", "un", "une", "des", "de", "du", "et", "ou", "mais", "que", "qui",
  "à", "au", "aux", "en", "ce", "cette", "ces", "il", "elle", "ils", "elles", "on", "je", "tu",
  "nous", "vous", "y", "se", "s", "ne", "pas", "est", "sont", "être", "avoir", "a", "ai", "as",
]);

const BLANKABLE: WordClass[] = ["noun", "verb", "adjective", "adverb"];

/** Verb endings that carry person, number or tense; a distractor must share the answer's. */
const VERB_ENDINGS = ["aient", "erons", "eront", "erez", "erai", "eras", "era", "ions", "iez", "ait", "ais", "ent", "ons", "ez", "ée", "ées", "és", "é", "er", "ir", "re", "it", "is", "e", "es", "s", "t", "x"];
/** Adjective agreement endings. */
const ADJECTIVE_ENDINGS = ["es", "e", "s", "x"];

/** Labels that make a word a function word or ambiguous between roles ("après": preposition / adverb, "son": possessive adjective). */
const NON_CONTENT_LABELS = /pronoun|preposition|conjunction|article|determiner|possessive|demonstrative|interrogative|relative|number|numeral|interjection|contraction|phrase/i;

interface WordProfile {
  text: string;
  /** vowel, h or consonant: the gap's neighbour may elide or liaise ("se" + "aime" is "s'aime"), so options must start alike. */
  onset: "vowel" | "h" | "consonant";
  wordClass: WordClass;
  gender: string | null;
  plural: boolean;
  ending: string;
}

function ending(clean: string, endings: string[]): string {
  return endings.find((suffix) => clean.endsWith(suffix)) ?? "";
}

function profile(token: Token): WordProfile | null {
  if (!token.isWord || token.clean.length < 3 || STOPWORDS.has(token.clean)) return null;
  // An elided form ("d'environ") is two words; blanking or offering it breaks the sentence.
  if (/['’-]/.test(token.text)) return null;
  // Proper nouns and numbers test facts, not French.
  if (/\p{N}/u.test(token.text) || /^\p{Lu}/u.test(token.text)) return null;
  const lookup = lookupWord(token.clean);
  if (lookup.source === "missing") return null;
  const pos = lookup.partOfSpeech;
  if (NON_CONTENT_LABELS.test(pos ?? "")) return null;
  // Exactly one blankable class, or the word's role in the sentence is unknown.
  const classes = BLANKABLE.filter((wordClass) => hasWordClass(pos, wordClass));
  if (classes.length !== 1) return null;
  const wordClass = classes[0];
  const plural = /[sx]$/.test(token.clean) && (lookup.lemma ?? "").toLowerCase() !== token.clean;
  const first = token.clean.normalize("NFD").charAt(0);
  return {
    text: token.text,
    onset: /[aeiouy]/.test(first) ? "vowel" : first === "h" ? "h" : "consonant",
    wordClass,
    gender: lookup.gender ?? null,
    plural,
    ending: wordClass === "verb" ? ending(token.clean, VERB_ENDINGS) : wordClass === "adjective" ? ending(token.clean, ADJECTIVE_ENDINGS) : "",
  };
}

/** Would `candidate` fit the answer's gap just as well, grammatically? */
function fitsSameGap(answer: WordProfile, candidate: WordProfile): boolean {
  if (candidate.wordClass !== answer.wordClass || candidate.onset !== answer.onset) return false;
  if (candidate.text.toLowerCase() === answer.text.toLowerCase()) return false;
  const a = answer.text.toLowerCase();
  const c = candidate.text.toLowerCase();
  if (a.includes(c) || c.includes(a)) return false;
  switch (answer.wordClass) {
    case "noun":
      return !!answer.gender && candidate.gender === answer.gender && candidate.plural === answer.plural;
    case "verb":
      return candidate.ending === answer.ending;
    case "adjective":
      return candidate.ending === answer.ending && (!answer.gender || !candidate.gender || candidate.gender === answer.gender);
    default:
      return true;
  }
}

function rebuildFromTokens(tokens: Token[], omit: number, placeholder: string): string {
  return tokens
    .map((token, i) => (i === omit ? placeholder : token.text))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Stable per prompt, so options never reshuffle on re-render and the answer's place is not predictable. */
function stableOrder(answer: string, distractors: string[], seed: string): string[] {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
  const position = (hash >>> 0) % (distractors.length + 1);
  const options = [...distractors];
  options.splice(position, 0, answer);
  return options;
}

/** Builds a single-word cloze from a sentence, or null if no word in it makes a fair question. */
export function buildWordCloze(sentence: TextSentence, distractorPool: string[]): ClozeExercise | null {
  const wordPositions = sentence.tokens.map((token, index) => ({ token, index })).filter(({ token }) => token.isWord);
  const poolProfiles = distractorPool
    .map((word) => tokenize(word).find((token) => token.isWord))
    .filter((token): token is Token => !!token)
    .map(profile)
    .filter((item): item is WordProfile => !!item);

  let best: { index: number; answer: WordProfile; distractors: string[] } | null = null;
  for (let position = 1; position < wordPositions.length - 1; position++) {
    // Positions 0 and last are skipped: keep a real word on each side of the gap.
    const { token, index } = wordPositions[position];
    const answer = profile(token);
    if (!answer) continue;
    // The exercise shows the answer's English as its clue; that is what makes
    // the right option the only right one. No dependable gloss, no question.
    const sentenceText = sentence.tokens.map((t) => t.text).join("");
    if (!exerciseGlossFor({ french: answer.text, sentence: sentenceText })) continue;
    const distractors = [...new Map(poolProfiles.filter((c) => fitsSameGap(answer, c)).map((c) => [c.text.toLowerCase(), c.text])).values()].slice(0, 3);
    if (distractors.length < 2) continue;
    if (!best || distractors.length > best.distractors.length) best = { index, answer, distractors };
  }
  if (!best) return null;
  const { index, answer, distractors } = best;
  const prompt = rebuildFromTokens(sentence.tokens, index, "___");
  return { kind: "word", sentenceIndex: sentence.index, prompt, answer: answer.text, options: stableOrder(answer.text, distractors, prompt) };
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
