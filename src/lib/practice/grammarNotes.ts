import type { TextSentence } from "@/lib/practice/textSentences";
import { isEtreAuxiliaryParticiple } from "@/lib/dictionary/etreAuxiliary";

/**
 * Contextual grammar notes: a small curated table of common French
 * constructions, each with a regex trigger. Generation is fully deterministic
 * (no AI call, nothing to cache) — we scan the sentences of a reading against
 * the table and surface the first sentence that matches each construction,
 * grounded in the exact source text.
 *
 * Deliberately modest in scope: a handful of high-value, well-understood
 * patterns rather than an attempt at full grammatical coverage. Explanations
 * are worded to describe what's happening in *this* sentence, not to assert
 * a universal rule.
 */
export interface GrammarNote {
  title: string;
  sourceSentence: string;
  /** Exact substring of sourceSentence that should be highlighted — always verified to exist. */
  highlight: string;
  explanation: string;
  compare?: string;
}

interface GrammarRule {
  title: string;
  trigger: RegExp;
  /** Given the regex match, returns the span to highlight (defaults to the full match). */
  highlightFrom?: (match: RegExpMatchArray) => string;
  /** Last check on a match; returning false abstains for this sentence. */
  accept?: (match: RegExpMatchArray, sentence: string) => boolean;
  /** A more specific title/explanation when the sentence makes the sub-type clear. */
  refine?: (match: RegExpMatchArray, sentence: string) => Partial<Pick<GrammarRule, "title" | "explanation" | "compare">> | null;
  explanation: string;
  compare?: string;
}

const APOSTROPHE = "['’]";

/** "Each other" made explicit. Without one of these, a plural pronominal verb may be reciprocal or reflexive, so Sorlio does not say which. */
const RECIPROCAL_MARKERS = /(?:mutuellement|réciproquement|l['’]une? l['’]autre|les une?s les autres|entre eux|entre elles)/iu;

/** Grooming and body verbs, where se/me/te can only mean the person themselves. */
const LITERAL_REFLEXIVE_STEMS = /^(?:lav|lèv|lev|couch|habill|déshabill|réveill|bross|maquill|ras|peign|douch|essui|sèch|séch)/iu;

/** Words ending in -er/-ir/-re that are not infinitives, so "il va cher" is not a near future. */
const NOT_INFINITIVES = new Set(["hier", "cher", "fier", "mer", "hiver", "amer", "notre", "votre", "entre", "contre", "autre", "soir", "désir", "plaisir", "avenir", "loisir", "père", "mère", "frère", "lumière", "manière", "matière", "première", "dernière", "arrière", "derrière", "guère", "très"]);

const RULES: GrammarRule[] = [
  {
    title: "Indirect question with si",
    // Only demander/savoir followed by si (allowing an object pronoun before
    // and one adverb between: "on me demande souvent si"). Any "si" later in a sentence
    // was matched before, which turned "si grand" and "si tu viens" into
    // indirect questions.
    trigger: /\b(?:(?:me|te|se|nous|vous|lui|leur)\s+)?(demande|demandes|demandent|demandait|demandaient|demandé|demander|sais|sait|savez|savons|savent|savait|savoir|ignore|ignorait)\s+(?:(?:souvent|toujours|parfois|encore|aussi|alors|bien|même)\s+)?(?:si\b|s['’]ils?\b)/iu,
    highlightFrom: (m) => m[0],
    explanation:
      "After verbs like demander or savoir, si can introduce an indirect yes/no question — it works like English \"whether\" or \"if\" here, not like an \"if\" condition.",
    compare: '"Est-ce que tu aimes ça ?" → "Il me demande si j\'aime ça."',
  },
  {
    title: "Il faut que + subjunctive",
    trigger: /\bil faut que\b/i,
    explanation:
      "Il faut que expresses necessity and is followed by the subjunctive mood, used because the sentence is about what should happen rather than a plain fact.",
    compare: '"Il faut que tu viennes" (you need to come) vs. "Tu viens" (you are coming).',
  },
  {
    title: "Pronominal verb",
    // se/s' are always clitic pronouns (but not the s' of s'il, which is si);
    // me/te/nous/vous count only after their own subject ("je me", "nous
    // nous"), since on their own they are often plain object pronouns.
    trigger: new RegExp(
      `(?:\\bje\\s+(?:ne\\s+)?m(?:e\\s+|${APOSTROPHE})|\\btu\\s+(?:ne\\s+)?t(?:e\\s+|${APOSTROPHE})|\\bnous\\s+(?:ne\\s+)?nous\\s+|\\bvous\\s+(?:ne\\s+)?vous\\s+|\\bse\\s+|\\bs${APOSTROPHE}(?!ils?\\b))(\\p{L}+)`,
      "iu"
    ),
    highlightFrom: (m) => m[0],
    refine: (m, sentence) => {
      if (RECIPROCAL_MARKERS.test(sentence)) {
        return {
          title: "Reciprocal verb (each other)",
          explanation:
            "Here the pronoun means \"each other\": the people involved do the action to one another, and a word like mutuellement or l'un l'autre makes that explicit.",
          compare: '"Ils se parlent" (they talk to each other) vs. "Ils parlent" (they talk).',
        };
      }
      if (LITERAL_REFLEXIVE_STEMS.test(m[1] ?? "")) {
        return {
          title: "Reflexive verb",
          explanation: "The pronoun refers back to the subject: the person does the action to themselves.",
          compare: '"Je lave la voiture" (I wash the car) vs. "Je me lave" (I wash myself).',
        };
      }
      return null;
    },
    explanation:
      "The verb comes with a pronoun that matches its subject (me, te, se, nous, vous). Pronominal verbs can describe an action on oneself (se laver), on each other (se parler), or simply be how the verb is built, with a meaning of its own (se souvenir de — to remember).",
    compare: '"Je me souviens" (I remember): the pronoun is part of the verb se souvenir.',
  },
  {
    title: "Passé composé with être",
    trigger: /\b(je|tu|il|elle|on|nous|vous|ils|elles)\s+(?:ne\s+|n['’])?(suis|es|est|sommes|êtes|sont)\s+(?:(?:pas|déjà|bien|enfin|jamais|encore|toujours|vite)\s+)?(\p{L}+)/iu,
    highlightFrom: (m) => m[0],
    // Only verbs that take être. "Nous sommes portés à …" and "elle est
    // fatiguée" are present tense with a participle or adjective — a passive
    // or a description — and get no note rather than a wrong one.
    accept: (m) => isEtreAuxiliaryParticiple(m[3] ?? ""),
    explanation:
      "A small group of French verbs (mostly of movement or change of state, like aller, venir, partir, naître) form the passé composé with être instead of avoir, and the past participle agrees with the subject in gender and number.",
    compare: '"Il est allé" (he went) vs. "Elle est allée" (she went).',
  },
  {
    title: "Comparison with plus / moins",
    trigger: /\b(plus|moins)\s+(\p{L}+)\s+que\b/iu,
    highlightFrom: (m) => m[0],
    // "ne … plus rien que" and "n'… plus que" mean "only"/"no longer", not a comparison.
    accept: (m, sentence) =>
      !["rien", "personne", "jamais", "aucun", "aucune", "guère"].includes((m[2] ?? "").toLowerCase()) &&
      !new RegExp(`\\bn(?:e\\s|['’])[^.;:!?]*\\b${m[1]}\\s+${m[2]}\\s+que\\b`, "iu").test(sentence),
    explanation:
      "Plus ... que and moins ... que build a comparison between two things — the equivalent of English \"more ... than\" and \"less ... than\".",
    compare: '"plus grand que" (bigger than) vs. "moins grand que" (smaller than).',
  },
  {
    title: "Futur proche (aller + infinitive)",
    trigger: /\b(je vais|tu vas|il va|elle va|on va|nous allons|vous allez|ils vont|elles vont)\s+(\p{L}+(?:er|ir|re))\b/iu,
    highlightFrom: (m) => m[0],
    accept: (m) => !NOT_INFINITIVES.has((m[2] ?? "").toLowerCase()),
    explanation:
      "Aller followed directly by an infinitive describes something about to happen — the near future, much like English \"going to\".",
    compare: '"Je vais manger" (I am going to eat) vs. "Je mange" (I am eating).',
  },
];

/** Scans a reading's sentences and returns up to `limit` grounded grammar notes, one per matched construction. */
export function buildGrammarNotes(sentences: TextSentence[], limit = 3): GrammarNote[] {
  const notes: GrammarNote[] = [];
  const usedTitles = new Set<string>();
  for (const rule of RULES) {
    if (notes.length >= limit) break;
    for (const sentence of sentences) {
      if (usedTitles.has(rule.title)) break;
      const match = sentence.text.match(rule.trigger);
      if (!match) continue;
      if (rule.accept && !rule.accept(match, sentence.text)) continue;
      const refined = rule.refine?.(match, sentence.text) ?? null;
      const highlight = (rule.highlightFrom ? rule.highlightFrom(match) : match[0]).trim();
      // Guardrail from the spec: never show a highlight that isn't actually in the sentence.
      if (!highlight || !sentence.text.includes(highlight)) continue;
      notes.push({
        title: refined?.title ?? rule.title,
        sourceSentence: sentence.text.trim(),
        highlight,
        explanation: refined?.explanation ?? rule.explanation,
        compare: refined?.compare ?? rule.compare,
      });
      usedTitles.add(rule.title);
      break;
    }
  }
  return notes;
}
