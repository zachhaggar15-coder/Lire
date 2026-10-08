/**
 * Word-class tests on a dictionary part-of-speech label ("verb (infinitive)",
 * "adverb phrase", "adjective / past participle", ...).
 *
 * Matches whole words only. A substring test (`pos.includes("verb")`) is
 * also true for "adverb", "adverb phrase" and "adverbial pronoun", which is
 * how "hier" was once treated as a verb and given the example "J'aime hier."
 */
export type WordClass = "verb" | "noun" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction";

export function hasWordClass(partOfSpeech: string | null | undefined, wordClass: WordClass): boolean {
  if (!partOfSpeech) return false;
  return new RegExp(`(^|[^a-z])${wordClass}([^a-z]|$)`, "i").test(partOfSpeech);
}
