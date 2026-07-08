import { FALLBACK_EXAMPLE_EN, FALLBACK_EXAMPLE_FR } from "@/lib/dictionary/constants";

/**
 * Builds a real, word-specific, beginner-friendly example sentence when a
 * dictionary entry has no `examples[]` of its own — replaces the old fixed
 * "Je vois ce mot dans un texte." / "I see this word in a text." fallback,
 * which named no actual word and taught nothing. Deliberately simple,
 * rule-based part-of-speech templates rather than a real generator: wrong
 * gender agreement or a slightly odd English gloss is an acceptable
 * trade-off for "always names the real word, no network call."
 */

export interface FallbackExampleInput {
  word: string;
  lemma?: string | null;
  partOfSpeech?: string | null;
  gender?: string | null;
  translations?: string[];
}

export interface FallbackExample {
  fr: string;
  en: string;
}

/** Strips a leading "to " from an infinitive gloss like "to eat" -> "eat". */
function bareVerbGloss(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/^to\s+/i, "").trim();
  return cleaned || null;
}

/** Common French feminine noun endings — used only when the dictionary has no real gender data, to pick "un"/"une" a bit better than a fixed guess. */
const LIKELY_FEMININE_ENDINGS = /(tion|sion|té|tié|ette|elle|esse|ance|ence|ure|ie)$/i;

function guessArticle(term: string, gender: string | null): "un" | "une" {
  if (gender === "feminine") return "une";
  if (gender === "masculine") return "un";
  return LIKELY_FEMININE_ENDINGS.test(term) ? "une" : "un";
}

export function generateFallbackExample(input: FallbackExampleInput): FallbackExample {
  const term = (input.lemma || input.word || "").trim();
  if (!term) return { fr: FALLBACK_EXAMPLE_FR, en: FALLBACK_EXAMPLE_EN };

  const pos = (input.partOfSpeech ?? "").toLowerCase();
  const gloss = input.translations?.[0]?.trim() || null;

  if (pos.includes("verb")) {
    return { fr: `J'aime ${term}.`, en: `I like to ${bareVerbGloss(gloss ?? undefined) ?? term}.` };
  }

  if (pos.includes("adjective")) {
    return { fr: `C'est très ${term}.`, en: `It's very ${gloss ?? term}.` };
  }

  if (pos.includes("noun")) {
    if (pos.includes("plural")) {
      return { fr: `Je vois les ${term}.`, en: `I see the ${gloss ?? term}.` };
    }
    const article = guessArticle(term, input.gender ?? null);
    return { fr: `Je vois ${article} ${term}.`, en: `I see a ${gloss ?? term}.` };
  }

  return { fr: `On utilise « ${term} » dans cette phrase.`, en: `We use "${term}" in this sentence.` };
}
