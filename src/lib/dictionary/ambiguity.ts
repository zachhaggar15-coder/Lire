import type { DictionaryLookupResult } from "@/lib/dictionary/types";

/**
 * How ambiguous a word is, independently of which dictionary answered it.
 *
 * The confidence model this replaces graded answers purely by source trust:
 * curated layers were "high", the generated layer was "low" unless it had a
 * single sense. Auditing that against contrasting sentence pairs showed it
 * failing in both directions at once.
 *
 * Confidently wrong, because trust was absolute: `tour` is a hand-curated
 * core-senses entry, so "tower" was shown at high confidence for "c'est son
 * tour" (his turn) and "un tour en ville" (a stroll) alike. Same for `droit`
 * ("right", never law or straight) and `place`. The resolver never asked
 * whether the word had other common senses at all.
 *
 * Needlessly slow, because breadth was mistaken for doubt: `chat` sits in the
 * generated layer with three listed glosses ("cat", "tomcat", "tag"), so it
 * was graded low and escalated to the network — a concrete noun with one
 * obvious meaning, costing an API round-trip per tap.
 *
 * Sense *count* alone can't separate those cases: `chat` has three glosses and
 * one meaning, `tour` has three glosses and three meanings. What matters is
 * how many materially different meanings a reader must choose between, and
 * whether the choice depends on the sentence.
 */

/** Strips the noise that makes two spellings of one sense look like two senses. */
function normaliseSense(sense: string): string {
  return sense
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/^(?:to|a|an|the)\s+/, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when two senses are near-enough the same idea that offering both is not a real choice. */
function sameIdea(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  // "cat" / "tomcat", "city" / "inner city": one contains the other.
  if (a.includes(b) || b.includes(a)) return true;
  // Shared word: "to put" / "to put on", "police officer" / "officer".
  const aWords = new Set(a.split(" "));
  if (b.split(" ").some((word) => word.length > 2 && aWords.has(word))) return true;
  // Shared stem, to catch inflectional and spelling variants: "realize" /
  // "realise", "travelling" / "travel".
  return a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5);
}

/**
 * How many materially different meanings a sense list actually offers.
 *
 * ["cat", "tomcat", "tag"] is 2, not 3. ["tower", "turn", "trick"] is 3.
 */
export function materiallyDistinctSenses(translations: string[]): number {
  const groups: string[][] = [];
  for (const raw of translations) {
    const sense = normaliseSense(raw);
    if (!sense) continue;
    const existing = groups.find((group) => group.some((member) => sameIdea(member, sense)));
    if (existing) existing.push(sense);
    else groups.push([sense]);
  }
  return groups.length;
}

/**
 * Words whose correct meaning genuinely flips with the sentence, where a
 * lexical answer on its own is not trustworthy no matter which layer supplied
 * it.
 *
 * This is deliberately an explicit list rather than something derived from the
 * data. The dictionaries record which senses exist; nothing in them records
 * that choosing between those senses *requires the sentence*. For `tour`, the
 * curated ordering is a reasonable guess at the commonest sense and a coin
 * flip for any particular occurrence — which is exactly the distinction this
 * list carries and the sense list cannot.
 *
 * Membership does not mean Lire refuses to answer. It means a bare dictionary
 * gloss is not enough: a context rule has to select the sense, or confidence
 * drops and the tap escalates. See CONTEXT_SENSE_RULES for the frames that
 * resolve most of these locally.
 */
const CONTEXT_AMBIGUOUS_WORDS = new Set(
  [
    // Words with no safe default: the leading gloss is a coin flip for any
    // given sentence, so nothing but the frame can settle them. "tour" is
    // tower or turn depending only on its article; "fait" is a fact or the
    // verb faire; "pas" is a footstep or half the negation.
    "encore", "bien", "meme", "depuis", "sens", "temps", "parti", "tour",
    "fait", "place", "droit", "point", "coup", "pas",
    "plus", "personne", "propre", "compte", "comptes",
    "ancien", "certain", "seul", "seconde", "livre", "somme",
    "mode", "poste", "voile", "critique", "physique", "politique",
    "manche", "moule", "greve", "office", "note", "piece", "carte",
  ]
    // Deliberately *not* diacritic-folded. Folding conflates distinct words:
    // "côté" (side, unambiguous and very common in prose) would collide with
    // "cote" (rating, quote), and every tap on the common one would escalate.
    .map((word) => word.toLowerCase())
);

/*
 * The highly polysemous verbs — passer, prendre, mettre, tenir, suivre,
 * arriver, trouver and the rest — are deliberately *not* listed above.
 *
 * They were, briefly, and it was too blunt: most of them have a dominant
 * default that is right whenever no special frame applies. "suivre" means to
 * follow unless it governs a course; "tenir" means to hold unless it is
 * "tenir à". Listing them forced an escalation on the ordinary reading of a
 * correct, unambiguous answer — a network call to be told "to follow".
 *
 * They are covered instead by the generic sense-count rule below, which
 * catches exactly the ones that really are wide open ("arriver" lists six
 * unrelated meanings, "passer" three) and leaves the narrow ones local. The
 * frames that override the default live in CONTEXT_SENSE_RULES.
 */

function fold(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Above this many materially different senses, a word needs the sentence to
 * decide even if nobody listed it as ambiguous.
 *
 * Three is the threshold because two distinct senses are usually a dominant
 * one plus a rarer one ("femme" as woman or wife, "maison" as house or home),
 * where the leading gloss is right the overwhelming majority of the time.
 * Once a third unrelated meaning appears, leading-gloss-wins stops being a
 * reasonable bet.
 */
const MATERIAL_SENSE_LIMIT = 3;

/**
 * Whether a bare lexical answer for this word should be treated as
 * provisional rather than authoritative.
 */
export function isContextAmbiguous(lookup: DictionaryLookupResult, tappedText: string): boolean {
  const candidates = [fold(tappedText), fold(lookup.lemma ?? "")].filter(Boolean);
  if (candidates.some((candidate) => CONTEXT_AMBIGUOUS_WORDS.has(candidate))) return true;

  // The sense-count heuristic stands in for editorial judgement, so it only
  // applies where there is none. A curated entry's leading gloss was chosen by
  // a person; counting its senses and second-guessing that made "vers"
  // (towards / around / about) look like a three-way choice when all three are
  // the same preposition, and every tap on it escalated. Where a curated
  // ordering genuinely isn't enough, the word is listed above instead.
  if (lookup.layer !== "generated") return false;
  return materiallyDistinctSenses(lookup.translations) >= MATERIAL_SENSE_LIMIT;
}

/** Exposed for tests and diagnostics — see scripts/test-meaning-resolution.mjs. */
export function isRegisteredAmbiguousWord(word: string): boolean {
  return CONTEXT_AMBIGUOUS_WORDS.has(fold(word));
}

/**
 * Do two English renderings say materially the same thing?
 *
 * Used to decide whether independent sources corroborate each other. Kept
 * deliberately loose: sources phrase things differently ("to realise" vs
 * "realises that"), and demanding string equality would read almost every
 * agreement as a conflict.
 */
export function sensesAgree(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = normaliseSense(a ?? "");
  const right = normaliseSense(b ?? "");
  if (!left || !right) return false;
  if (sameIdea(left, right)) return true;
  // Fall back to content-word overlap, so "comes to understand the problem"
  // and "to realise" don't count as agreement but "the political party" and
  // "party" do.
  const stop = new Set(["the", "a", "an", "of", "to", "in", "it", "is", "was", "that", "this", "and", "for", "on", "at", "be"]);
  const content = (value: string) => value.split(" ").filter((word) => word.length > 2 && !stop.has(word));
  const leftWords = content(left);
  const rightWords = content(right);
  if (leftWords.length === 0 || rightWords.length === 0) return false;
  const shared = leftWords.filter((word) => rightWords.some((other) => sameIdea(word, other)));
  return shared.length / Math.min(leftWords.length, rightWords.length) >= 0.5;
}
