/**
 * Rule-based French morphological fallback. Not a real NLP lemmatiser —
 * just a small, ordered suffix→replacement table covering the most common
 * regular conjugation and agreement patterns. Used only as a last resort in
 * lookupWord, after an exact lemma match and an exact `forms[]` match have
 * both missed, so it catches inflections an entry didn't explicitly list
 * (e.g. an imperfect or conditional form of a verb whose dictionary entry
 * only lists a few present-tense forms).
 *
 * Safety property: a wrong guess is harmless. `guessLemmas` only produces
 * candidate strings; the caller checks each candidate against the real
 * dictionary and simply moves on if it isn't a known lemma. So it's fine
 * for this rule table to be a little permissive.
 */

interface Rule {
  suffix: string;
  replacement: string;
}

const IRREGULAR_LEMMAS: Record<string, string[]> = {
  suis: ["être"],
  es: ["être"],
  est: ["être"],
  sommes: ["être"],
  êtes: ["être"],
  sont: ["être"],
  étais: ["être"],
  était: ["être"],
  étaient: ["être"],
  sera: ["être"],
  seront: ["être"],
  serait: ["être"],
  ai: ["avoir"],
  as: ["avoir"],
  a: ["avoir"],
  avons: ["avoir"],
  avez: ["avoir"],
  ont: ["avoir"],
  avais: ["avoir"],
  avait: ["avoir"],
  avaient: ["avoir"],
  aura: ["avoir"],
  auront: ["avoir"],
  aurait: ["avoir"],
  vais: ["aller"],
  vas: ["aller"],
  va: ["aller"],
  allons: ["aller"],
  allez: ["aller"],
  vont: ["aller"],
  irai: ["aller"],
  ira: ["aller"],
  iront: ["aller"],
  fait: ["faire"],
  fais: ["faire"],
  faisons: ["faire"],
  faites: ["faire"],
  font: ["faire"],
  fera: ["faire"],
  feront: ["faire"],
  peux: ["pouvoir"],
  peut: ["pouvoir"],
  pouvons: ["pouvoir"],
  pouvez: ["pouvoir"],
  peuvent: ["pouvoir"],
  pouvait: ["pouvoir"],
  veux: ["vouloir"],
  veut: ["vouloir"],
  voulons: ["vouloir"],
  voulez: ["vouloir"],
  veulent: ["vouloir"],
  dois: ["devoir"],
  doit: ["devoir"],
  devons: ["devoir"],
  devez: ["devoir"],
  doivent: ["devoir"],
  dit: ["dire"],
  dis: ["dire"],
  dites: ["dire"],
  disent: ["dire"],
  prend: ["prendre"],
  prends: ["prendre"],
  prenons: ["prendre"],
  prenez: ["prendre"],
  prennent: ["prendre"],
  pris: ["prendre"],
  mis: ["mettre"],
  mise: ["mettre"],
  mises: ["mettre"],
};

// Longer, more specific suffixes are tried before shorter generic ones —
// enforced by sorting once below, so the order they're written in here only
// matters as a tiebreaker between same-length suffixes.
const RULES: Rule[] = [
  // -er verbs: future / conditional
  { suffix: "eraient", replacement: "er" },
  { suffix: "erions", replacement: "er" },
  { suffix: "eriez", replacement: "er" },
  { suffix: "erais", replacement: "er" },
  { suffix: "erait", replacement: "er" },
  { suffix: "erons", replacement: "er" },
  { suffix: "eront", replacement: "er" },
  { suffix: "erai", replacement: "er" },
  { suffix: "eras", replacement: "er" },
  { suffix: "era", replacement: "er" },

  // Imperfect endings are shared by the -er and -re groups (only -ir verbs
  // insert "iss" before them, handled separately below), so both a "+er"
  // and a "+re" candidate are generated — a wrong one is harmless, it just
  // won't match anything in the dictionary.
  { suffix: "aient", replacement: "er" },
  { suffix: "aient", replacement: "re" },
  { suffix: "ions", replacement: "er" },
  { suffix: "ions", replacement: "re" },
  { suffix: "iez", replacement: "er" },
  { suffix: "iez", replacement: "re" },
  { suffix: "ais", replacement: "er" },
  { suffix: "ais", replacement: "re" },
  { suffix: "ait", replacement: "er" },
  { suffix: "ait", replacement: "re" },
  { suffix: "ant", replacement: "er" },
  { suffix: "ées", replacement: "er" },
  { suffix: "és", replacement: "er" },
  { suffix: "ée", replacement: "er" },
  { suffix: "é", replacement: "er" },

  // Present-tense -ons/-ez/-ent are also shared by -er and -re verbs.
  { suffix: "ons", replacement: "er" },
  { suffix: "ons", replacement: "re" },
  { suffix: "ez", replacement: "er" },
  { suffix: "ez", replacement: "re" },
  { suffix: "ent", replacement: "er" },
  { suffix: "ent", replacement: "re" },
  { suffix: "es", replacement: "er" },
  { suffix: "e", replacement: "er" },

  // -ir verbs (regular "finir" group): imperfect / present participle
  { suffix: "issaient", replacement: "ir" },
  { suffix: "issions", replacement: "ir" },
  { suffix: "issiez", replacement: "ir" },
  { suffix: "issais", replacement: "ir" },
  { suffix: "issait", replacement: "ir" },
  { suffix: "issant", replacement: "ir" },

  // -ir verbs: present tense
  { suffix: "iraient", replacement: "ir" },
  { suffix: "irions", replacement: "ir" },
  { suffix: "iriez", replacement: "ir" },
  { suffix: "irais", replacement: "ir" },
  { suffix: "irait", replacement: "ir" },
  { suffix: "irons", replacement: "ir" },
  { suffix: "iront", replacement: "ir" },
  { suffix: "irai", replacement: "ir" },
  { suffix: "iras", replacement: "ir" },
  { suffix: "ira", replacement: "ir" },
  { suffix: "issons", replacement: "ir" },
  { suffix: "issez", replacement: "ir" },
  { suffix: "issent", replacement: "ir" },
  { suffix: "is", replacement: "ir" },
  { suffix: "it", replacement: "ir" },

  // -re and -dre verbs: future / conditional. Both variants are useful:
  // "lira" -> "lire", while "vendra" -> "vendre".
  { suffix: "draient", replacement: "dre" },
  { suffix: "drions", replacement: "dre" },
  { suffix: "driez", replacement: "dre" },
  { suffix: "drais", replacement: "dre" },
  { suffix: "drait", replacement: "dre" },
  { suffix: "drons", replacement: "dre" },
  { suffix: "dront", replacement: "dre" },
  { suffix: "drai", replacement: "dre" },
  { suffix: "dras", replacement: "dre" },
  { suffix: "dra", replacement: "dre" },
  { suffix: "raient", replacement: "re" },
  { suffix: "rions", replacement: "re" },
  { suffix: "riez", replacement: "re" },
  { suffix: "rais", replacement: "re" },
  { suffix: "rait", replacement: "re" },
  { suffix: "rons", replacement: "re" },
  { suffix: "ront", replacement: "re" },
  { suffix: "rai", replacement: "re" },
  { suffix: "ras", replacement: "re" },
  { suffix: "ra", replacement: "re" },

  // Plural / feminine agreement (nouns & adjectives)
  { suffix: "aux", replacement: "al" },
  { suffix: "ales", replacement: "al" },
  { suffix: "euses", replacement: "eur" },
  { suffix: "euse", replacement: "eur" },
  { suffix: "trices", replacement: "teur" },
  { suffix: "trice", replacement: "teur" },
  { suffix: "ières", replacement: "ier" },
  { suffix: "ière", replacement: "ier" },
  { suffix: "ères", replacement: "er" },
  { suffix: "ère", replacement: "er" },
  { suffix: "ives", replacement: "if" },
  { suffix: "ive", replacement: "if" },
  { suffix: "ches", replacement: "c" },
  { suffix: "che", replacement: "c" },
  { suffix: "ques", replacement: "c" },
  { suffix: "que", replacement: "c" },
  { suffix: "es", replacement: "" },
  { suffix: "e", replacement: "" },
  { suffix: "s", replacement: "" },
  { suffix: "x", replacement: "" },

  // -re verbs (regular "vendre" group): present tense
  { suffix: "s", replacement: "re" },
  { suffix: "d", replacement: "re" },
];

const SORTED_RULES = [...RULES].sort((a, b) => b.suffix.length - a.suffix.length);

const MIN_STEM_LENGTH = 2;

/**
 * Returns candidate lemma guesses for a word, longest/most-specific suffix
 * match first, with exact duplicates removed. Doesn't check them against
 * any dictionary — that's the caller's job (see lookupWord).
 */
export function guessLemmas(word: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  function add(candidate: string) {
    if (candidate === word || seen.has(candidate)) return;
    seen.add(candidate);
    candidates.push(candidate);
  }

  function addRuleGuesses(target: string) {
    for (const rule of SORTED_RULES) {
      if (!target.endsWith(rule.suffix)) continue;

      const stem = target.slice(0, target.length - rule.suffix.length);
      if (stem.length < MIN_STEM_LENGTH) continue;

      add(stem + rule.replacement);
    }
  }

  const forms = [word];
  const apostropheIndex = Math.max(word.lastIndexOf("'"), word.lastIndexOf("\u2019"));
  if (apostropheIndex >= 0 && apostropheIndex < word.length - 1) {
    forms.push(word.slice(apostropheIndex + 1));
  }

  for (const form of forms) {
    for (const irregular of IRREGULAR_LEMMAS[form] ?? []) add(irregular);
    add(form);
    addRuleGuesses(form);
  }

  return candidates;
}
