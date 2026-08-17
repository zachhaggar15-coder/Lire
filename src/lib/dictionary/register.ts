/**
 * Which English glosses are fit to lead, and which are fit to teach.
 *
 * `oignons` came back as "arse". The gloss is attested — it is real French
 * slang — but it sat first in a bulk WikDict import whose sense ordering
 * carries no editorial judgement, and everything downstream treated position
 * one as "the meaning". Practice generation then used it as a vocabulary clue,
 * so a learner reading about buying vegetables was taught a vulgarity.
 *
 * The lesson generalises past that one word: an attested sense is not
 * automatically an appropriate learner-facing answer. This module scores how
 * suitable a gloss is for a learner, so a vulgar or archaic reading can be
 * pushed behind the ordinary one without being deleted — a reader on a text
 * that genuinely uses the slang sense can still reach it.
 */

export type SenseRegister = "standard" | "figurative" | "technical" | "regional" | "rare" | "archaic" | "vulgar";

/**
 * Glosses that are vulgar in English, or that translate a French vulgarity.
 *
 * Matched as whole words so "assess" and "classic" are not caught by "ass",
 * and "shitake" is not caught by "shit".
 */
const VULGAR_TERMS = [
  "arse", "ass", "arsehole", "asshole", "bollocks", "bugger", "bullshit", "cock",
  "crap", "cunt", "dick", "dickhead", "fuck", "fucking", "jerk off", "piss",
  "prick", "pussy", "shag", "shit", "slut", "twat", "wank", "wanker", "whore",
  "bastard", "bitch", "boob", "boobs", "tit", "tits", "turd", "screw",
];

/** Markers a lexicographer leaves on a gloss that is not the everyday reading. */
const REGISTER_MARKERS: { register: SenseRegister; patterns: RegExp[] }[] = [
  { register: "vulgar", patterns: [/\b(?:vulg|vulgar|slang|coarse|offensive|taboo)\b/i] },
  { register: "archaic", patterns: [/\b(?:archaic|obsolete|dated|old[- ]fashioned|poetic|literary)\b/i] },
  { register: "technical", patterns: [/\b(?:anat|anatomy|bot|botany|zool|chem|chemistry|med|medicine|math|maths|physics|law|legal|naut|nautical|mil|military|typography|geol|comput|computing|ling|linguistics)\b/i] },
  { register: "regional", patterns: [/\b(?:dial|dialect|regional|quebec|québec|belg|belgian|swiss|helvet|canad|african)\b/i] },
  { register: "figurative", patterns: [/\b(?:fig|figurative|figuratively|metaphor)\b/i] },
  { register: "rare", patterns: [/\b(?:rare|rarely|uncommon|specialist)\b/i] },
];

/**
 * Glosses that are almost never the learner-facing sense of a common word.
 *
 * These are concrete anatomical or crude readings that French dictionaries
 * record for otherwise everyday nouns — "oignon" (onion, but also a bunion and
 * a vulgarity), "chatte", "boules". Listed as English glosses rather than
 * French words so the check works for any French entry that lands on them.
 */
const NON_LEARNER_GLOSSES = new Set([
  "bunion", "bunyon", "buckeye", "arsehole", "asshole", "backside", "behind",
  "genitals", "genitalia", "testicle", "testicles", "breast", "breasts",
]);

function normalise(gloss: string): string {
  return gloss.toLowerCase().replace(/[^a-z\s'-]/g, " ").replace(/\s+/g, " ").trim();
}

function containsWord(haystack: string, needle: string): boolean {
  if (needle.includes(" ")) return haystack.includes(needle);
  return new RegExp(`(?:^|\\s)${needle}(?:\\s|$)`, "i").test(haystack);
}

/** Classifies a single English gloss. */
export function classifyRegister(gloss: string): SenseRegister {
  const raw = gloss.toLowerCase();
  // Parenthetical or bracketed markers first — they are explicit lexicographer
  // intent and outrank anything inferred from the wording.
  for (const { register, patterns } of REGISTER_MARKERS) {
    if (patterns.some((pattern) => pattern.test(raw))) return register;
  }
  const words = normalise(gloss);
  if (VULGAR_TERMS.some((term) => containsWord(words, term))) return "vulgar";
  if (NON_LEARNER_GLOSSES.has(words)) return "rare";
  return "standard";
}

/**
 * Whether a gloss is safe to put in front of a learner as the meaning of a
 * word, absent any context saying otherwise.
 *
 * Deliberately strict, because this gates teaching material. A sense excluded
 * here is still reachable — it stays in the alternatives list, and a
 * confidently-resolved context can still surface it.
 */
export function isLearnerSafeGloss(gloss: string): boolean {
  const register = classifyRegister(gloss);
  return register === "standard" || register === "figurative" || register === "technical";
}

/**
 * Reorders a sense list so learner-appropriate readings lead.
 *
 * Nothing is discarded. A vulgar or rare sense keeps its place in the list and
 * simply stops being the answer a reader gets by default, which is the whole
 * distinction between "this sense exists" and "this is what the word means".
 */
export function preferLearnerSenses(translations: string[]): string[] {
  const rank = (gloss: string): number => {
    switch (classifyRegister(gloss)) {
      case "standard":
        return 0;
      case "figurative":
        return 1;
      case "technical":
        return 2;
      case "regional":
        return 3;
      case "rare":
        return 4;
      case "archaic":
        return 5;
      case "vulgar":
        return 6;
    }
  };
  // A stable sort by rank keeps the dictionary's own ordering inside each
  // band, so this only ever moves a sense past a *more* suitable one.
  return translations
    .map((gloss, index) => ({ gloss, index, rank: rank(gloss) }))
    .sort((a, b) => (a.rank !== b.rank ? a.rank - b.rank : a.index - b.index))
    .map((entry) => entry.gloss);
}

/** The first gloss a learner should see, or null when every sense is unsuitable. */
export function leadingLearnerSense(translations: string[]): string | null {
  return preferLearnerSenses(translations).find(isLearnerSafeGloss) ?? null;
}
