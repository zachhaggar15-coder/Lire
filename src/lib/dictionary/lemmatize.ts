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
  { suffix: "issons", replacement: "ir" },
  { suffix: "issez", replacement: "ir" },
  { suffix: "issent", replacement: "ir" },
  { suffix: "is", replacement: "ir" },
  { suffix: "it", replacement: "ir" },

  // Plural / feminine agreement (nouns & adjectives)
  { suffix: "aux", replacement: "al" },
  { suffix: "euses", replacement: "eur" },
  { suffix: "euse", replacement: "eur" },
  { suffix: "ières", replacement: "ier" },
  { suffix: "ière", replacement: "ier" },
  { suffix: "ères", replacement: "er" },
  { suffix: "ère", replacement: "er" },
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

  for (const rule of SORTED_RULES) {
    if (!word.endsWith(rule.suffix)) continue;

    const stem = word.slice(0, word.length - rule.suffix.length);
    if (stem.length < MIN_STEM_LENGTH) continue;

    const candidate = stem + rule.replacement;
    if (candidate === word || seen.has(candidate)) continue;

    seen.add(candidate);
    candidates.push(candidate);
  }

  return candidates;
}
