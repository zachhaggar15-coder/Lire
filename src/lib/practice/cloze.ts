import type { Token } from "@/lib/words";
import type { TextSentence } from "@/lib/practice/textSentences";
import { isGeneratedDictionaryReady, lookupWord } from "@/lib/dictionary/lookup";
import { hasWordClass } from "@/lib/dictionary/partOfSpeech";
import { canonicalExerciseGloss, exerciseGlossFor } from "@/lib/practice/exerciseGloss";
import { resolveMeaning } from "@/lib/dictionary/resolveMeaning";
import { isLearnerSafeGloss } from "@/lib/dictionary/register";

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
  /**
   * What the missing word means here, shown with the question. It is what
   * makes the right option the only right one: "Il boit un ___ (coffee)"
   * rules out "thé", which would otherwise be good French too.
   */
  clue: string;
}

/**
 * A scored cloze must have exactly one right answer, and every option must be
 * French that fits the gap's grammar. Sorlio cannot parse French, so it only
 * asks when the sentence itself establishes what kind of word is missing, and
 * otherwise asks nothing. Fewer questions is the accepted cost.
 *
 * - The role comes from the word's position, not from the dictionary alone:
 *   a dictionary that says "sens" is a verb does not make it one in "au sens
 *   plein". Recognised positions:
 *     noun       determiner + ___          (gender and number from the determiner)
 *     verb       subject pronoun + ___     (person from the pronoun; tense only
 *                                           from endings unambiguous for that
 *                                           person; no auxiliaries or modals)
 *     adjective  determiner + noun + ___   (gender and number from the determiner)
 *     adverb     pronoun + verb + ___      (adverb-only words)
 *   The dictionary must agree with the role, or the word is skipped.
 * - Wrong options are other words of the same reading seen in the same role
 *   with the same agreement — never filler from another class, never agreement
 *   guessed from spelling. Fewer than two: no question.
 * - The clue is the word's own meaning in this sentence, from the meaning
 *   resolver at high confidence. A meaning that belongs to an expression the
 *   word is part of ("être porté à" for "sommes") is not the word's meaning:
 *   no question. Options whose meanings overlap the clue are dropped.
 * - Predicative and idiomatic positions ("Il fait ___ ce matin") match none of
 *   the roles, so they are never asked.
 */

/** Determiners and the agreement they fix. A null gender is not marked by the determiner. */
const DETERMINERS: Record<string, { gender: "masculine" | "feminine" | null; plural: boolean }> = {
  le: { gender: "masculine", plural: false },
  un: { gender: "masculine", plural: false },
  du: { gender: "masculine", plural: false },
  au: { gender: "masculine", plural: false },
  ce: { gender: "masculine", plural: false },
  cet: { gender: "masculine", plural: false },
  mon: { gender: "masculine", plural: false },
  ton: { gender: "masculine", plural: false },
  son: { gender: "masculine", plural: false },
  la: { gender: "feminine", plural: false },
  une: { gender: "feminine", plural: false },
  cette: { gender: "feminine", plural: false },
  ma: { gender: "feminine", plural: false },
  ta: { gender: "feminine", plural: false },
  sa: { gender: "feminine", plural: false },
  notre: { gender: null, plural: false },
  votre: { gender: null, plural: false },
  leur: { gender: null, plural: false },
  les: { gender: null, plural: true },
  des: { gender: null, plural: true },
  aux: { gender: null, plural: true },
  ces: { gender: null, plural: true },
  mes: { gender: null, plural: true },
  tes: { gender: null, plural: true },
  ses: { gender: null, plural: true },
  nos: { gender: null, plural: true },
  vos: { gender: null, plural: true },
  leurs: { gender: null, plural: true },
};

const SUBJECT_PRONOUNS: Record<string, string> = {
  je: "1sg",
  tu: "2sg",
  il: "3sg",
  elle: "3sg",
  on: "3sg",
  nous: "1pl",
  vous: "2pl",
  ils: "3pl",
  elles: "3pl",
};

/** Auxiliaries, modals and light verbs: their meaning lives in what follows ("sommes portés", "peut venir", "fait beau"). */
const EXCLUDED_VERB_FORMS = new Set(
  (
    "suis es est sommes êtes sont étais était étions étiez étaient serai seras sera serons serez seront serais serait seraient fus fut fûmes furent " +
    "ai as a avons avez ont avais avait avions aviez avaient aurai auras aura aurons aurez auront aurais aurait auraient eus eut eûmes eurent " +
    "vais vas va allons allez vont allais allait allions alliez allaient irai iras ira irons irez iront irais irait iraient " +
    "peux peut pouvons pouvez peuvent pouvais pouvait pouvaient pourra pourrait pourraient put purent " +
    "veux veut voulons voulez veulent voulais voulait voulaient voudra voudrait voudraient voulut " +
    "dois doit devons devez doivent devais devait devaient devra devrait devraient dut durent " +
    "faut fallait faudra faudrait fallut fais fait faisons faites font faisais faisait faisaient fera ferait feront fit firent"
  ).split(" ")
);
const EXCLUDED_VERB_LEMMAS = new Set(["être", "avoir", "aller", "pouvoir", "vouloir", "devoir", "falloir", "faire"]);

/** Adverbs that are grammar rather than vocabulary (negation, degree, linking). */
const FUNCTION_ADVERBS = new Set(
  "ne pas plus jamais rien très trop si aussi bien mal encore déjà même tout alors puis ensuite donc ainsi y en là ici oui non moins assez peu beaucoup tant tellement".split(" ")
);

/** Labels that make a word a function word, or ambiguous between roles ("autre": adjective / pronoun). */
const NON_CONTENT_LABELS = /pronoun|preposition|conjunction|article|determiner|possessive|demonstrative|interrogative|relative|number|numeral|interjection|contraction|phrase/i;

/** Object and adverbial clitics that can sit between a subject pronoun and its verb. */
const CLITICS = new Set(["me", "te", "se", "le", "la", "les", "lui", "leur", "nous", "vous", "ne", "y", "en"]);

type Role = "noun" | "verb" | "adjective" | "adverb";

interface Slot {
  /** Index into sentence.tokens. */
  index: number;
  text: string;
  clean: string;
  role: Role;
  /** Everything that must match for one word to replace another here. */
  agreement: string;
  lemma: string;
}

const LOOKUP_CACHE = new Map<string, ReturnType<typeof lookupWord>>();
function lookup(clean: string): ReturnType<typeof lookupWord> {
  const key = `${isGeneratedDictionaryReady() ? 1 : 0}:${clean}`;
  let result = LOOKUP_CACHE.get(key);
  if (!result) {
    if (LOOKUP_CACHE.size > 20_000) LOOKUP_CACHE.clear();
    result = lookupWord(clean);
    LOOKUP_CACHE.set(key, result);
  }
  return result;
}

/** Word tokens, each marked with whether only spaces separate it from the previous word. */
function wordsWithAdjacency(tokens: Token[]): { index: number; token: Token; joinedToPrevious: boolean }[] {
  const out: { index: number; token: Token; joinedToPrevious: boolean }[] = [];
  let gapIsSpace = false;
  tokens.forEach((token, index) => {
    if (token.isWord) {
      out.push({ index, token, joinedToPrevious: out.length > 0 && gapIsSpace });
      gapIsSpace = true;
    } else if (!/^\s+$/.test(token.text)) {
      gapIsSpace = false;
    }
  });
  return out;
}

function isPlainWord(token: Token): boolean {
  // Elided ("l'école"), hyphenated, capitalised (names) or numeric forms are never blanked or offered.
  return token.clean.length >= 3 && !/['’-]/.test(token.text) && !/^\p{Lu}/u.test(token.text) && !/\p{N}/u.test(token.text);
}

/** Tense, read only from endings that are unambiguous once the person is known from the pronoun. */
const TENSE_MARKERS: Record<string, [RegExp, string][]> = {
  "1sg": [[/rais$/, "conditional"], [/ais$/, "imperfect"], [/rai$/, "future"]],
  "2sg": [[/rais$/, "conditional"], [/ais$/, "imperfect"], [/ras$/, "future"]],
  "3sg": [[/rait$/, "conditional"], [/ait$/, "imperfect"], [/ra$/, "future"]],
  "1pl": [[/rions$/, "conditional"], [/ions$/, "imperfect"], [/rons$/, "future"]],
  "2pl": [[/riez$/, "conditional"], [/iez$/, "imperfect"], [/rez$/, "future"]],
  "3pl": [[/raient$/, "conditional"], [/aient$/, "imperfect"], [/ront$/, "future"], [/(èrent|irent|urent)$/, "past"]],
};
function verbTense(clean: string, person: string): string {
  for (const [pattern, tense] of TENSE_MARKERS[person] ?? []) if (pattern.test(clean)) return tense;
  return "present-or-other";
}

/** The role the sentence itself gives each word, or nothing when it does not. */
function slotsIn(sentence: TextSentence): Slot[] {
  const words = wordsWithAdjacency(sentence.tokens);
  const slots: Slot[] = [];
  for (let i = 1; i < words.length; i++) {
    const { index, token, joinedToPrevious } = words[i];
    if (!joinedToPrevious || !isPlainWord(token)) continue;
    const previous = words[i - 1].token.clean;
    const entry = lookup(token.clean);
    if (entry.source === "missing") continue;
    const pos = entry.partOfSpeech;
    if (NON_CONTENT_LABELS.test(pos ?? "")) continue;
    const lemma = (entry.lemma ?? token.clean).toLowerCase();
    const base = { index, text: token.text, clean: token.clean, lemma };

    const determiner = DETERMINERS[previous];
    if (determiner) {
      if (!hasWordClass(pos, "noun") || hasWordClass(pos, "verb") || hasWordClass(pos, "adverb")) continue;
      // The form must be the lemma, or its regular plural after a plural
      // determiner: a guessed lemma ("telle" read as "tell") is not a noun here.
      const regularPlural = determiner.plural && (token.clean === `${lemma}s` || token.clean === `${lemma}x`);
      if (token.clean !== lemma && !regularPlural) continue;
      const dictionaryGender = entry.gender === "masculine" || entry.gender === "feminine" ? entry.gender : null;
      const gender = determiner.gender ?? dictionaryGender;
      // The determiner and the dictionary must agree, or the noun's gender is not established.
      if (!gender || (determiner.gender && dictionaryGender && dictionaryGender !== determiner.gender)) continue;
      slots.push({ ...base, role: "noun", agreement: `${gender}-${determiner.plural ? "pl" : "sg"}` });
      continue;
    }

    const person = SUBJECT_PRONOUNS[previous];
    if (person) {
      // "il nous voit": a pronoun right after another pronoun is an object, not the subject.
      if (i >= 2 && words[i - 1].joinedToPrevious && SUBJECT_PRONOUNS[words[i - 2].token.clean]) continue;
      if (!hasWordClass(pos, "verb") || hasWordClass(pos, "noun") || hasWordClass(pos, "adjective")) continue;
      if (EXCLUDED_VERB_FORMS.has(token.clean) || EXCLUDED_VERB_LEMMAS.has(lemma)) continue;
      // An infinitive is not a finite verb ("ce qui devrait nous inquiéter").
      if (token.clean === lemma || /(er|ir|re|oir)$/.test(token.clean) && token.clean === entry.lemma) continue;
      // "nous" and "vous" are also object pronouns ("celui qui nous contredit");
      // they are the subject only when the verb carries their ending.
      if (person === "1pl" && !/ons$/.test(token.clean)) continue;
      if (person === "2pl" && !/ez$/.test(token.clean)) continue;
      slots.push({ ...base, role: "verb", agreement: `${person}-${verbTense(token.clean, person)}` });
      continue;
    }

    if (i < 2 || !words[i - 1].joinedToPrevious) continue;
    const beforePrevious = words[i - 2].token.clean;

    const nounDeterminer = DETERMINERS[beforePrevious];
    if (nounDeterminer && hasWordClass(pos, "adjective") && !hasWordClass(pos, "verb") && !hasWordClass(pos, "adverb")) {
      const nounEntry = lookup(previous);
      if (!hasWordClass(nounEntry.partOfSpeech, "noun")) continue;
      const nounGender = nounEntry.gender === "masculine" || nounEntry.gender === "feminine" ? nounEntry.gender : null;
      const gender = nounDeterminer.gender ?? nounGender;
      if (!gender) continue;
      slots.push({ ...base, role: "adjective", agreement: `${gender}-${nounDeterminer.plural ? "pl" : "sg"}` });
      continue;
    }

    // Right after "pronoun + word", that word is the finite verb ("il marche
    // vite"), whatever else the dictionary lists it as, unless it is a clitic.
    const pureAdverb = pos?.trim().toLowerCase() === "adverb";
    if (pureAdverb && !FUNCTION_ADVERBS.has(token.clean) && SUBJECT_PRONOUNS[beforePrevious] && !CLITICS.has(previous)) {
      slots.push({ ...base, role: "adverb", agreement: "adverb" });
    }
  }
  return slots;
}

const GLOSS_STOPWORDS = new Set(["the", "one", "someone", "something", "oneself", "out", "for", "with", "and"]);
function glossWords(gloss: string): Set<string> {
  return new Set(
    (gloss.toLowerCase().match(/[a-z]+/g) ?? [])
      .filter((word) => word.length >= 3 && !GLOSS_STOPWORDS.has(word))
      .map((word) => word.replace(/(ing|ed|es|s)$/, ""))
  );
}
function overlaps(a: Set<string>, b: Set<string>): boolean {
  for (const word of a) if (b.has(word)) return true;
  return false;
}

/**
 * The answer's own meaning in this sentence, or null. Only words with a
 * single sense in a curated dictionary entry are asked about, and the
 * meaning must come from reading the word in this sentence:
 * - a high-confidence, word-scoped contextual reading; or
 * - a medium-confidence one that agrees with that single curated sense.
 * Never an expression's meaning, never a context-free sense alone ("sens"
 * would come back as "to feel"), and never a reading of another word class.
 */
function clueFor(sentence: TextSentence, slot: Slot): string | null {
  const sentenceText = sentence.tokens.map((token) => token.text).join("");
  // A scored question needs a word whose meaning is not in doubt: one sense in
  // a curated entry. With two or more, the resolver can be confidently wrong
  // ("rapport" as "report" in "le rapport de la France à elle-même").
  const dictionary = canonicalExerciseGloss(slot.clean);
  if (!dictionary || dictionary.confidence !== "high" || lookup(slot.clean).translations.length !== 1) return null;
  const confident = exerciseGlossFor({ french: slot.text, sentence: sentenceText, tokens: sentence.tokens, tokenIndex: slot.index, contextOnly: true });
  if (confident) {
    if (confident.partOfSpeech && !hasWordClass(confident.partOfSpeech, slot.role)) return null;
    return confident.english;
  }
  const meaning = resolveMeaning({ tokens: sentence.tokens, tokenIndex: slot.index, contextSentence: sentenceText });
  if (meaning.abstained || meaning.partOfExpression || meaning.confidence !== "medium") return null;
  if (meaning.partOfSpeech && !meaning.partOfSpeechUncertain && !hasWordClass(meaning.partOfSpeech, slot.role)) return null;
  const english = meaning.displayEnglish.trim();
  if (!english || !isLearnerSafeGloss(english)) return null;
  // The medium reading must agree with that single curated sense. (The
  // bulk-generated layer never vouches: its sense lists are neither ordered
  // nor complete — "maillot" there is only "bathing suit".)
  if (!overlaps(glossWords(english), glossWords(dictionary.english))) return null;
  return english;
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

/**
 * A single-word cloze for a sentence, or null when no word in it makes a fair
 * question. `otherSentences` are the rest of the reading, where wrong options
 * are found in the same role.
 */
export function buildWordCloze(sentence: TextSentence, otherSentences: TextSentence[]): ClozeExercise | null {
  const pool = otherSentences.filter((other) => other.index !== sentence.index).flatMap(slotsIn);
  // A reading's repeated words are its topic, and topic words are where near
  // synonyms live (travail, emploi, métier in a text about work). They can be
  // answers, but are not offered as wrong options, which could be right.
  const lemmaCounts = new Map<string, number>();
  for (const slot of [...pool, ...slotsIn(sentence)]) lemmaCounts.set(slot.lemma, (lemmaCounts.get(slot.lemma) ?? 0) + 1);
  const candidates = slotsIn(sentence)
    .map((slot) => {
      const seen = new Set<string>([slot.clean]);
      const distractors: Slot[] = [];
      for (const other of pool) {
        if (other.role !== slot.role || other.agreement !== slot.agreement) continue;
        if (seen.has(other.clean) || other.lemma === slot.lemma || (lemmaCounts.get(other.lemma) ?? 0) > 1) continue;
        if (other.clean.includes(slot.clean) || slot.clean.includes(other.clean)) continue;
        seen.add(other.clean);
        distractors.push(other);
      }
      return { slot, distractors };
    })
    .filter(({ distractors }) => distractors.length >= 2)
    .sort((a, b) => b.distractors.length - a.distractors.length || a.slot.index - b.slot.index);

  for (const { slot, distractors } of candidates) {
    const clue = clueFor(sentence, slot);
    if (!clue) continue;
    // An option that can mean what the clue says, or anything the answer can
    // mean, could also be right: compare every sense on both sides.
    const answerWords = glossWords([clue, ...lookup(slot.clean).translations].join(" "));
    const fair = distractors
      .filter((other) => !overlaps(answerWords, glossWords(lookup(other.clean).translations.join(" "))))
      .slice(0, 3)
      .map((other) => other.text);
    if (fair.length < 2) continue;
    const prompt = rebuildFromTokens(sentence.tokens, slot.index, "___");
    return { kind: "word", sentenceIndex: sentence.index, prompt, answer: slot.text, options: stableOrder(slot.text, fair, prompt), clue };
  }
  return null;
}

/** The rest of the reading, where a sentence's wrong options come from. */
export function distractorPoolFromBody(_body: string, excludeSentenceIndex: number, allSentences: TextSentence[]): TextSentence[] {
  return allSentences.filter((sentence) => sentence.index !== excludeSentenceIndex);
}
