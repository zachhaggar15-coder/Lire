import type { DictionaryEntry } from "@/lib/dictionary/types";

/**
 * Local English → French dictionary. Not wired into any UI yet — this
 * exists for architectural symmetry with fr-en.ts, so a future "look up an
 * English word" feature (or reverse flashcards) can reuse the exact same
 * `DictionaryEntry` shape and lookup logic without a new data model.
 * A modest hand-curated starter set; expand as needed.
 */
export const enFrDictionary: DictionaryEntry[] = [
  { lemma: "the", translations: ["le", "la", "les"], partOfSpeech: "definite article", cefr: "A1" },
  { lemma: "a", forms: ["an"], translations: ["un", "une"], partOfSpeech: "indefinite article", cefr: "A1" },
  { lemma: "to be", forms: ["is", "are", "was", "were"], translations: ["être"], partOfSpeech: "verb", cefr: "A1" },
  { lemma: "to have", forms: ["has", "had"], translations: ["avoir"], partOfSpeech: "verb", cefr: "A1" },
  { lemma: "to go", forms: ["goes", "went"], translations: ["aller"], partOfSpeech: "verb", cefr: "A1" },
  { lemma: "to do", forms: ["does", "did", "to make"], translations: ["faire"], partOfSpeech: "verb", cefr: "A1" },
  { lemma: "city", forms: ["town"], translations: ["ville"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "team", translations: ["équipe"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "night", translations: ["nuit"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "sleep", translations: ["sommeil"], partOfSpeech: "noun", cefr: "A2" },
  { lemma: "market", translations: ["marché"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "coffee", translations: ["café"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "bread", translations: ["pain"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "cheese", translations: ["fromage"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "child", forms: ["children"], translations: ["enfant"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "friend", translations: ["ami", "amie"], partOfSpeech: "noun", cefr: "A1" },
  { lemma: "big", forms: ["large"], translations: ["grand", "grande"], partOfSpeech: "adjective", cefr: "A1" },
  { lemma: "small", forms: ["little"], translations: ["petit", "petite"], partOfSpeech: "adjective", cefr: "A1" },
  { lemma: "good", translations: ["bon", "bonne"], partOfSpeech: "adjective", cefr: "A1" },
  { lemma: "free (no cost)", translations: ["gratuit", "gratuite"], partOfSpeech: "adjective", cefr: "A2" },
  { lemma: "yesterday", translations: ["hier"], partOfSpeech: "adverb", cefr: "A1" },
  { lemma: "today", translations: ["aujourd'hui"], partOfSpeech: "adverb", cefr: "A1" },
  { lemma: "often", translations: ["souvent"], partOfSpeech: "adverb", cefr: "A2" },
  { lemma: "and", translations: ["et"], partOfSpeech: "conjunction", cefr: "A1" },
  { lemma: "but", translations: ["mais"], partOfSpeech: "conjunction", cefr: "A1" },
  { lemma: "or", translations: ["ou"], partOfSpeech: "conjunction", cefr: "A1" },
  { lemma: "with", translations: ["avec"], partOfSpeech: "preposition", cefr: "A1" },
  { lemma: "for", translations: ["pour"], partOfSpeech: "preposition", cefr: "A1" },
  { lemma: "to think", forms: ["thinks", "thought"], translations: ["penser"], partOfSpeech: "verb", cefr: "A1" },
  { lemma: "to say", forms: ["says", "said", "to tell"], translations: ["dire"], partOfSpeech: "verb", cefr: "A1" },
];
