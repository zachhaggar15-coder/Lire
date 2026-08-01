import type { TextSentence } from "@/lib/practice/textSentences";

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
  explanation: string;
  compare?: string;
}

const RULES: GrammarRule[] = [
  {
    title: "Indirect question with si",
    trigger: /\b(demande|demander|demandé|sais|savez|sait|voit|vois|vu)\b[^.?!]*\bsi\b/i,
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
    title: "Reflexive verb",
    trigger: /\b(je me|tu te|il se|elle se|on se|nous nous|vous vous|ils se|elles se|s'|se)\s+\p{L}+/iu,
    highlightFrom: (m) => m[0],
    explanation:
      "A reflexive pronoun (me/te/se/nous/vous) shows the subject is acting on itself — many everyday verbs about routines (se lever, se laver) are built this way in French but not in English.",
    compare: '"Je lave la voiture" (I wash the car) vs. "Je me lave" (I wash myself).',
  },
  {
    title: "Passé composé with être",
    trigger: /\b(je suis|tu es|il est|elle est|on est|nous sommes|vous êtes|ils sont|elles sont)\s+\p{L}+é(e)?(s)?\b/iu,
    highlightFrom: (m) => m[0],
    explanation:
      "A small group of French verbs (mostly of movement, like aller, venir, partir) form the past tense with être instead of avoir, and the past participle agrees with the subject in gender and number.",
    compare: '"Il est allé" (he went) vs. "Elle est allée" (she went).',
  },
  {
    title: "Comparison with plus / moins",
    trigger: /\b(plus|moins)\s+\p{L}+\s+que\b/iu,
    highlightFrom: (m) => m[0],
    explanation:
      "Plus ... que and moins ... que build a comparison between two things — the equivalent of English \"more ... than\" and \"less ... than\".",
    compare: '"plus grand que" (bigger than) vs. "moins grand que" (smaller than).',
  },
  {
    title: "Futur proche (aller + infinitive)",
    trigger: /\b(je vais|tu vas|il va|elle va|on va|nous allons|vous allez|ils vont|elles vont)\s+\p{L}+(er|ir|re)\b/iu,
    highlightFrom: (m) => m[0],
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
      const highlight = (rule.highlightFrom ? rule.highlightFrom(match) : match[0]).trim();
      // Guardrail from the spec: never show a highlight that isn't actually in the sentence.
      if (!highlight || !sentence.text.includes(highlight)) continue;
      notes.push({
        title: rule.title,
        sourceSentence: sentence.text.trim(),
        highlight,
        explanation: rule.explanation,
        compare: rule.compare,
      });
      usedTitles.add(rule.title);
      break;
    }
  }
  return notes;
}
