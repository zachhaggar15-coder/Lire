import type { ContextualTranslationGrammar } from "@/lib/dictionary/contextualTranslation";

/**
 * What a conjugated French form contributes in English, as opposed to what its
 * dictionary entry says.
 *
 * Tapping "a" in "il a dit" answered "to have". That is a correct fact about
 * `avoir` and a useless answer about this sentence: the reader is looking at a
 * third-person auxiliary and being handed an infinitive. The resolver had no
 * concept of a surface gloss at all — every verb path returned the lemma's
 * translation, so the distinction between "what this word means" and "which
 * dictionary entry it belongs to" simply did not exist.
 *
 * This module supplies the first half of that distinction. It is deliberately
 * small: enough English morphology to inflect a lemma gloss into the form the
 * sentence is actually using, plus exact tables for the two verbs a learner
 * meets constantly and which are irregular in both languages.
 */

export interface SurfaceGloss {
  /** What the token contributes here — "has", "said", "is". */
  english: string;
  /**
   * A short plain-language note on the token's grammatical job, shown only
   * when it explains why the token's meaning and the sentence's meaning differ
   * — auxiliaries and clitics, mostly.
   */
  role: string | null;
}

/**
 * Exact surface forms for être and avoir.
 *
 * Both are wildly irregular in French and in English, and both appear far more
 * often as auxiliaries than as main verbs, so a reader meets these exact forms
 * constantly. Deriving them from a rule would be more code and less accurate.
 */
const ETRE_FORMS: Record<string, string> = {
  suis: "am",
  es: "are",
  est: "is",
  sommes: "are",
  "êtes": "are",
  etes: "are",
  sont: "are",
  "étais": "was",
  etais: "was",
  "était": "was",
  etait: "was",
  "étions": "were",
  etions: "were",
  "étiez": "were",
  etiez: "were",
  "étaient": "were",
  etaient: "were",
  serai: "will be",
  seras: "will be",
  sera: "will be",
  serons: "will be",
  serez: "will be",
  seront: "will be",
  serais: "would be",
  serait: "would be",
  seraient: "would be",
  sois: "be",
  soit: "be",
  soient: "be",
  "été": "been",
  ete: "been",
  fut: "was",
  furent: "were",
};

const AVOIR_FORMS: Record<string, string> = {
  ai: "have",
  as: "have",
  a: "has",
  avons: "have",
  avez: "have",
  ont: "have",
  avais: "had",
  avait: "had",
  avions: "had",
  aviez: "had",
  avaient: "had",
  aurai: "will have",
  aura: "will have",
  aurons: "will have",
  aurez: "will have",
  auront: "will have",
  aurais: "would have",
  aurait: "would have",
  auraient: "would have",
  aie: "have",
  ait: "have",
  aient: "have",
  eu: "had",
  eut: "had",
  eurent: "had",
};

/**
 * Irregular English past participles, keyed by the bare verb.
 *
 * Only needed where "-ed" would be wrong. Anything not listed falls through to
 * the regular rule below.
 */
const IRREGULAR_PAST: Record<string, string> = {
  say: "said",
  go: "gone",
  do: "done",
  make: "made",
  take: "taken",
  come: "come",
  see: "seen",
  give: "given",
  find: "found",
  think: "thought",
  buy: "bought",
  bring: "brought",
  put: "put",
  leave: "left",
  win: "won",
  lose: "lost",
  hold: "held",
  keep: "kept",
  write: "written",
  read: "read",
  hear: "heard",
  feel: "felt",
  meet: "met",
  pay: "paid",
  send: "sent",
  build: "built",
  understand: "understood",
  become: "become",
  begin: "begun",
  break: "broken",
  choose: "chosen",
  drink: "drunk",
  eat: "eaten",
  fall: "fallen",
  forget: "forgotten",
  get: "got",
  know: "known",
  learn: "learnt",
  run: "run",
  sell: "sold",
  sit: "sat",
  sleep: "slept",
  speak: "spoken",
  spend: "spent",
  stand: "stood",
  teach: "taught",
  tell: "told",
  wear: "worn",
  rise: "risen",
  set: "set",
  cost: "cost",
  hit: "hit",
  let: "let",
  cut: "cut",
  lead: "led",
  mean: "meant",
  sing: "sung",
  drive: "driven",
  grow: "grown",
  show: "shown",
  throw: "thrown",
  wake: "woken",
};

const IRREGULAR_THIRD_PERSON: Record<string, string> = {
  be: "is",
  have: "has",
  do: "does",
  go: "goes",
};

/** Strips the citation "to " and any parenthetical qualifier from a dictionary gloss. */
export function bareVerb(gloss: string): string {
  return gloss
    .replace(/\([^)]*\)/g, " ")
    .replace(/^\s*to\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a dictionary gloss looks like a verb citation form. */
export function isVerbGloss(gloss: string): boolean {
  return /^\s*to\s+\S/i.test(gloss);
}

function pastParticiple(verb: string): string {
  const head = verb.split(" ")[0];
  const rest = verb.slice(head.length);
  const irregular = IRREGULAR_PAST[head];
  if (irregular) return irregular + rest;
  if (/e$/.test(head)) return `${head}d${rest}`;
  if (/[^aeiou]y$/.test(head)) return `${head.slice(0, -1)}ied${rest}`;
  return `${head}ed${rest}`;
}

function thirdPerson(verb: string): string {
  const head = verb.split(" ")[0];
  const rest = verb.slice(head.length);
  const irregular = IRREGULAR_THIRD_PERSON[head];
  if (irregular) return irregular + rest;
  if (/(?:s|sh|ch|x|z|o)$/.test(head)) return `${head}es${rest}`;
  if (/[^aeiou]y$/.test(head)) return `${head.slice(0, -1)}ies${rest}`;
  return `${head}s${rest}`;
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * The surface gloss for a token, or null when the lemma gloss is already the
 * right answer.
 *
 * Returning null matters as much as returning a value: for an uninflected noun
 * or adjective the dictionary gloss *is* what the token contributes, and
 * inventing a separate surface form there would add noise without adding
 * meaning.
 */
export function surfaceGlossFor(input: {
  /** The tapped form, cleaned. */
  clean: string;
  /** Dictionary lemma, when known. */
  lemma: string | null;
  /** The lemma's leading dictionary gloss. */
  lemmaGloss: string | null;
  grammar: ContextualTranslationGrammar | null;
  /** True when this form is serving as the auxiliary of a compound tense. */
  isAuxiliary?: boolean;
}): SurfaceGloss | null {
  const clean = fold(input.clean);
  const lemmaKey = fold(input.lemma ?? "");

  // être and avoir first: their forms are exact, and they are the ones a
  // reader is most likely to tap without recognising.
  const etre = ETRE_FORMS[clean] ?? ETRE_FORMS[input.clean.toLowerCase()];
  if (etre && (lemmaKey === "etre" || lemmaKey === "" || lemmaKey === "être")) {
    return {
      english: etre,
      role: input.isAuxiliary
        ? "Auxiliary form of être, used here to build a past tense"
        : `Form of être (to be)`,
    };
  }
  const avoir = AVOIR_FORMS[clean] ?? AVOIR_FORMS[input.clean.toLowerCase()];
  if (avoir && (lemmaKey === "avoir" || lemmaKey === "")) {
    return {
      english: avoir,
      role: input.isAuxiliary
        ? "Auxiliary form of avoir, used here to build a past tense"
        : `Form of avoir (to have)`,
    };
  }

  const gloss = input.lemmaGloss?.trim();
  if (!gloss || !isVerbGloss(gloss)) return null;
  const verb = bareVerb(gloss);
  if (!verb) return null;

  const grammar = input.grammar;
  const form = (grammar?.form ?? "").toLowerCase();
  const tense = (grammar?.tense ?? "").toLowerCase();
  const mood = (grammar?.mood ?? "").toLowerCase();

  // Past participle — the commonest case a reader taps in a narrative, and the
  // one where an infinitive answer is most obviously unhelpful.
  if (form.includes("participle") || tense.includes("passe compose") || tense.includes("compound")) {
    return { english: pastParticiple(verb), role: "Past participle" };
  }
  if (tense === "imperfect") {
    return { english: `was ${gerund(verb)}`, role: "Imperfect — an ongoing or repeated past action" };
  }
  if (tense === "future") {
    return { english: `will ${verb}`, role: "Future tense" };
  }
  if (tense === "conditional") {
    return { english: `would ${verb}`, role: "Conditional" };
  }
  if (mood.includes("imperative")) {
    return { english: verb, role: "Imperative — giving an instruction" };
  }
  if (tense === "present" && grammar?.person === "third" && grammar?.number === "singular") {
    return { english: thirdPerson(verb), role: null };
  }
  if (tense === "present") {
    return { english: verb, role: null };
  }
  return null;
}

function gerund(verb: string): string {
  const head = verb.split(" ")[0];
  const rest = verb.slice(head.length);
  if (/e$/.test(head) && !/ee$/.test(head)) return `${head.slice(0, -1)}ing${rest}`;
  return `${head}ing${rest}`;
}

/**
 * A plain-language note for tokens whose English contribution is not a word of
 * its own — clitics, negation particles, contractions.
 *
 * These are exactly the cases where pretending a one-to-one mapping exists
 * misleads: "ne" has no English word, it is half a discontinuous negation, and
 * saying so is more useful than any gloss.
 */
export function functionWordRole(clean: string, sentence: string): string | null {
  // Elisions arrive as one token ("j'en", "s'en"), so the role belongs to the
  // lexical tail rather than to the whole surface form.
  const elided = fold(clean).match(/^(?:[cdjlmnst]|qu)['’](.+)$/u);
  const key = elided?.[1] ?? fold(clean);
  const sentenceKey = fold(sentence);
  switch (key) {
    case "ne":
    case "n'":
      return "Part of the negative construction ne … pas — English uses a single word";
    case "en":
      return sentenceKey.includes(" en ") || sentenceKey.startsWith("en ")
        ? "Pronoun standing in for a de-phrase already mentioned"
        : null;
    case "y":
      return "Pronoun standing in for a place or an à-phrase already mentioned";
    case "se":
    case "s'":
      return "Reflexive pronoun — marks the verb as acting on its own subject";
    case "le":
    case "la":
    case "les":
      return null;
    default:
      return null;
  }
}
