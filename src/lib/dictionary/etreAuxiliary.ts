/**
 * The verbs that form their compound tenses with être (plus any pronominal
 * verb, which is recognised by its pronoun, not by this list).
 *
 * "être + participle" is a compound past only for these. With any other verb
 * it is a passive or a description: "nous sommes portés à …" (we are inclined
 * to), "la ville est située …", "il est fatigué". Calling those passé composé
 * teaches the wrong analysis, so anything outside the list gets no tense.
 */
// Accented forms on purpose: folding accents would let "entre" (between)
// pass for "entré" and "ne" for "né".
const ETRE_PARTICIPLES = [
  "allé", "venu", "arrivé", "parti", "reparti", "entré", "rentré", "sorti", "ressorti",
  "monté", "remonté", "descendu", "redescendu", "tombé", "retombé", "resté", "retourné",
  "né", "mort", "devenu", "redevenu", "revenu", "parvenu", "survenu", "intervenu",
  "provenu", "advenu", "passé", "repassé", "décédé", "apparu", "accouru",
];

const PARTICIPLE_SET = new Set(ETRE_PARTICIPLES);

/** True for a past participle (any agreement) of a verb that takes être: "allée", "partis", "nées". */
export function isEtreAuxiliaryParticiple(word: string): boolean {
  const lower = word.toLowerCase().normalize("NFC");
  if (PARTICIPLE_SET.has(lower)) return true;
  for (const ending of ["es", "e", "s"]) {
    if (lower.endsWith(ending) && PARTICIPLE_SET.has(lower.slice(0, -ending.length))) return true;
  }
  return false;
}
