import { FALLBACK_EXAMPLE_EN, FALLBACK_EXAMPLE_FR } from "@/lib/dictionary/constants";

/**
 * A learner example for a saved word, in this order:
 *   1. the sentence the reader met the word in, with its translation;
 *   2. a curated dictionary example;
 *   3. nothing.
 *
 * Sorlio used to fill the gap with word-class templates ("J'aime X.", "C'est
 * très X.", "Je vois un X."). They cannot be made safe: the dictionary gives
 * verbs no transitivity, adjectives no gradability and many nouns no gender,
 * and a substring part-of-speech match sent adverbs into the verb frame
 * ("J'aime hier." / "I like to yesterday."). No example is better than
 * invented French, so nothing is generated.
 */

export interface LearnerExample {
  fr: string;
  en: string;
}

export interface LearnerExampleInput {
  /** The dictionary's first curated example, if any. */
  curated?: LearnerExample | null;
  /** The sentence from the reading. */
  contextSentence?: string | null;
  /** Its translation, when Sorlio has one. */
  sentenceTranslation?: string | null;
}

/** The example to store with a saved word; empty strings when there is none. */
export function learnerExample({ curated, contextSentence, sentenceTranslation }: LearnerExampleInput): LearnerExample {
  if (curated?.fr && curated.en) return { fr: curated.fr, en: curated.en };
  const sentence = contextSentence?.trim();
  if (sentence) return { fr: sentence, en: sentenceTranslation?.trim() ?? "" };
  return { fr: "", en: "" };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * True for an example produced by the retired templates, so data saved by an
 * older build (on this device or synced from another) is cleaned on read.
 * Matches only a template built around this word, paired with its English
 * template, so a real curated example is never mistaken for one.
 */
export function isRetiredTemplateExample(fr: string, en: string, terms: Array<string | null | undefined>): boolean {
  if (fr === FALLBACK_EXAMPLE_FR || en === FALLBACK_EXAMPLE_EN) return true;
  return terms
    .map((term) => term?.trim())
    .filter((term): term is string => !!term)
    .some((term) => {
      const t = escapeRegExp(term);
      return (
        (new RegExp(`^J'aime ${t}\\.$`).test(fr) && /^I like to /.test(en)) ||
        (new RegExp(`^C'est très ${t}\\.$`).test(fr) && /^It's very /.test(en)) ||
        (new RegExp(`^Je vois (?:un|une|les) ${t}\\.$`).test(fr) && /^I see (?:a|the) /.test(en)) ||
        (new RegExp(`^On utilise « ${t} » dans cette phrase\\.$`).test(fr) && /^We use "/.test(en))
      );
    });
}
