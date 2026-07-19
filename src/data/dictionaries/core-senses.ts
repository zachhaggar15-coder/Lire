import type { DictionaryEntry } from "@/lib/dictionary/types";

/**
 * Core high-frequency vocabulary, hand-checked.
 *
 * These are the words a reader meets in almost every sentence, and until now
 * none of them had a curated entry — they fell through to the generated
 * WikDict layer, which stores senses in no particular order. Since the reader
 * only ever sees `translations[0]`, that produced confidently wrong answers on
 * the most common words in the language:
 *
 *   sur    -> "sour"            (the rare adjective, not the preposition "on")
 *   ne     -> "NE"              (a country abbreviation, not the negation)
 *   moi    -> "self / ego / Ich"  (Freud, and a German gloss)
 *   non    -> "NOT"
 *   ça     -> "id"
 *   vers   -> "verse"           (not "towards")
 *   comme  -> "almost"          (not "like / as")
 *   si     -> "yes / no"        (not "if")
 *   rien   -> "next to nothing"
 *   peu    -> "much"            (the opposite of "little")
 *   point  -> "stitch / lace"
 *   contre -> "block"
 *   mr     -> "RC"
 *
 * An audit over the app's own corpus ranked these by how often a reader
 * actually meets them: `pas` appears 237 times, `en` 220, `ne` 190, `sur` 87.
 * A wrong gloss here is worth more damage than a hundred wrong glosses in the
 * long tail.
 *
 * Scope is deliberately narrow. Every entry here is a word with no existing
 * curated entry, so this layer corrects the generated dictionary without ever
 * shadowing the richer hand-written entries in fr-en.ts (which carry examples
 * and CEFR data this layer doesn't). A test enforces that.
 */
export const coreSenseDictionary: DictionaryEntry[] = [
  // --- Negation and its pieces ---------------------------------------------
  { lemma: "ne", forms: ["n'"], translations: ["not"], partOfSpeech: "negation particle", cefr: "A1", notes: "Pairs with pas/jamais/rien/plus: \"je ne sais pas\". Often dropped in speech." },
  { lemma: "pas", translations: ["not"], partOfSpeech: "negation adverb", cefr: "A1", notes: "The second half of \"ne ... pas\". A separate noun \"un pas\" means a step." },
  { lemma: "rien", translations: ["nothing", "anything"], partOfSpeech: "indefinite pronoun", cefr: "A1", notes: "With ne: \"je ne vois rien\" — I see nothing." },
  { lemma: "non", translations: ["no", "not"], partOfSpeech: "adverb", cefr: "A1" },
  { lemma: "jamais", translations: ["never", "ever"], partOfSpeech: "adverb", cefr: "A1" },
  { lemma: "aucun", forms: ["aucune", "aucuns", "aucunes"], translations: ["no", "none", "not any"], partOfSpeech: "adjective/pronoun", cefr: "A2" },
  { lemma: "guère", translations: ["hardly", "scarcely"], partOfSpeech: "adverb", cefr: "B1" },

  // --- Prepositions ---------------------------------------------------------
  { lemma: "sur", translations: ["on", "onto", "about"], partOfSpeech: "preposition", cefr: "A1", notes: "\"Sur la table\" — on the table. The identical adjective meaning \"sour\" is rare." },
  { lemma: "sous", translations: ["under", "beneath", "below"], partOfSpeech: "preposition", cefr: "A1" },
  { lemma: "sans", forms: ["s'en"], translations: ["without"], partOfSpeech: "preposition", cefr: "A1" },
  { lemma: "vers", translations: ["towards", "around", "about"], partOfSpeech: "preposition", cefr: "A2", notes: "Also time: \"vers midi\" — around noon. The noun \"un vers\" (a line of verse) is unrelated." },
  { lemma: "contre", translations: ["against", "versus"], partOfSpeech: "preposition", cefr: "A2" },
  { lemma: "chez", translations: ["at the home of", "at", "among"], partOfSpeech: "preposition", cefr: "A1", notes: "\"Chez moi\" — at my place; \"chez le médecin\" — at the doctor's." },
  { lemma: "entre", translations: ["between", "among"], partOfSpeech: "preposition", cefr: "A2" },
  { lemma: "pendant", translations: ["during", "for"], partOfSpeech: "preposition", cefr: "A2" },
  { lemma: "depuis", translations: ["since", "for"], partOfSpeech: "preposition", cefr: "A2", notes: "\"Depuis deux ans\" — for two years, and still going." },
  { lemma: "devant", translations: ["in front of", "before"], partOfSpeech: "preposition", cefr: "A2" },
  { lemma: "derrière", translations: ["behind"], partOfSpeech: "preposition", cefr: "A2" },
  { lemma: "avant", translations: ["before"], partOfSpeech: "preposition", cefr: "A1" },
  { lemma: "parmi", translations: ["among"], partOfSpeech: "preposition", cefr: "B1" },
  { lemma: "auprès", translations: ["beside", "close to", "with"], partOfSpeech: "preposition", cefr: "B1" },

  // --- Pronouns -------------------------------------------------------------
  { lemma: "moi", translations: ["me", "I"], partOfSpeech: "stressed pronoun", cefr: "A1", notes: "Used after prepositions and for emphasis: \"chez moi\", \"moi, je pense...\"." },
  { lemma: "toi", translations: ["you"], partOfSpeech: "stressed pronoun", cefr: "A1" },
  { lemma: "eux", translations: ["them"], partOfSpeech: "stressed pronoun", cefr: "A2" },
  { lemma: "ça", translations: ["that", "it"], partOfSpeech: "demonstrative pronoun", cefr: "A1", notes: "Informal short form of \"cela\"." },
  { lemma: "cela", translations: ["that", "it"], partOfSpeech: "demonstrative pronoun", cefr: "A2" },
  { lemma: "ceci", translations: ["this"], partOfSpeech: "demonstrative pronoun", cefr: "A2" },
  { lemma: "celui", forms: ["celle", "ceux", "celles"], translations: ["the one", "those"], partOfSpeech: "demonstrative pronoun", cefr: "B1" },
  { lemma: "dont", translations: ["whose", "of which", "including"], partOfSpeech: "relative pronoun", cefr: "B1" },
  { lemma: "quoi", translations: ["what"], partOfSpeech: "interrogative pronoun", cefr: "A1" },
  { lemma: "chacun", forms: ["chacune"], translations: ["each one", "everyone"], partOfSpeech: "indefinite pronoun", cefr: "A2" },
  { lemma: "quelqu'un", translations: ["someone", "somebody"], partOfSpeech: "indefinite pronoun", cefr: "A1" },
  { lemma: "personne", translations: ["nobody", "person"], partOfSpeech: "pronoun/noun", cefr: "A2", notes: "With ne it means nobody: \"il n'y a personne\". Alone, \"une personne\" is a person." },

  // --- Conjunctions and connectors -----------------------------------------
  { lemma: "comme", translations: ["like", "as", "since"], partOfSpeech: "conjunction/adverb", cefr: "A1" },
  { lemma: "si", forms: ["s'"], translations: ["if", "so", "whether"], partOfSpeech: "conjunction/adverb", cefr: "A1", notes: "Also the contradicting \"yes\" after a negative question." },
  { lemma: "parce", translations: ["because"], partOfSpeech: "conjunction", cefr: "A1", notes: "Only ever appears as \"parce que\"." },
  { lemma: "puisque", translations: ["since", "as"], partOfSpeech: "conjunction", cefr: "B1" },
  { lemma: "lorsque", translations: ["when"], partOfSpeech: "conjunction", cefr: "B1" },
  { lemma: "tandis", translations: ["while", "whereas"], partOfSpeech: "conjunction", cefr: "B1", notes: "Appears as \"tandis que\"." },
  { lemma: "ainsi", translations: ["thus", "so", "in this way"], partOfSpeech: "adverb", cefr: "B1" },
  { lemma: "alors", translations: ["then", "so"], partOfSpeech: "adverb", cefr: "A1" },

  // --- Common adverbs -------------------------------------------------------
  { lemma: "bien", translations: ["well", "quite", "indeed"], partOfSpeech: "adverb", cefr: "A1" },
  { lemma: "mieux", translations: ["better"], partOfSpeech: "adverb", cefr: "A2", notes: "The comparative of \"bien\". The adjective equivalent is \"meilleur\"." },
  { lemma: "peu", translations: ["little", "few", "not very"], partOfSpeech: "adverb", cefr: "A1", notes: "\"Un peu\" — a little. On its own it leans negative: \"peu de gens\" — few people." },
  { lemma: "seulement", translations: ["only", "just"], partOfSpeech: "adverb", cefr: "A2" },
  { lemma: "enfin", translations: ["finally", "at last", "well"], partOfSpeech: "adverb", cefr: "A2" },
  { lemma: "près", translations: ["near", "close"], partOfSpeech: "adverb", cefr: "A1", notes: "\"Près de\" — near to." },
  { lemma: "tant", translations: ["so much", "so many"], partOfSpeech: "adverb", cefr: "B1" },
  { lemma: "autant", translations: ["as much", "as many"], partOfSpeech: "adverb", cefr: "B1" },
  { lemma: "plutôt", translations: ["rather", "instead"], partOfSpeech: "adverb", cefr: "B1" },
  { lemma: "surtout", translations: ["especially", "above all"], partOfSpeech: "adverb", cefr: "A2" },
  { lemma: "partout", translations: ["everywhere"], partOfSpeech: "adverb", cefr: "A2" },
  { lemma: "dehors", translations: ["outside"], partOfSpeech: "adverb", cefr: "A2" },
  { lemma: "dedans", translations: ["inside"], partOfSpeech: "adverb", cefr: "A2" },

  // --- Interjections and address -------------------------------------------
  { lemma: "oui", translations: ["yes"], partOfSpeech: "adverb", cefr: "A1" },
  { lemma: "ah", translations: ["ah", "oh"], partOfSpeech: "interjection", cefr: "A1" },
  { lemma: "oh", translations: ["oh"], partOfSpeech: "interjection", cefr: "A1" },
  { lemma: "eh", translations: ["hey", "eh"], partOfSpeech: "interjection", cefr: "A2" },
  { lemma: "hélas", translations: ["alas", "unfortunately"], partOfSpeech: "interjection", cefr: "B1" },
  { lemma: "adieu", translations: ["farewell", "goodbye"], partOfSpeech: "interjection", cefr: "B1" },
  { lemma: "madame", forms: ["mme", "mesdames"], translations: ["madam", "Mrs", "ma'am"], partOfSpeech: "noun", gender: "feminine", cefr: "A1" },
  { lemma: "monsieur", forms: ["mr", "messieurs"], translations: ["sir", "Mr", "gentleman"], partOfSpeech: "noun", gender: "masculine", cefr: "A1" },
  { lemma: "mademoiselle", forms: ["mlle"], translations: ["miss"], partOfSpeech: "noun", gender: "feminine", cefr: "A2" },

  // --- Everyday nouns whose generated first gloss was wrong ----------------
  { lemma: "pièce", forms: ["pièces"], translations: ["room", "piece", "coin", "play"], partOfSpeech: "noun", gender: "feminine", cefr: "A2", notes: "\"Un appartement de trois pièces\" — a three-room flat. In theatre, a play." },
  { lemma: "couleur", forms: ["couleurs"], translations: ["colour", "color"], partOfSpeech: "noun", gender: "feminine", cefr: "A1" },
  { lemma: "ascenseur", forms: ["ascenseurs"], translations: ["lift", "elevator"], partOfSpeech: "noun", gender: "masculine", cefr: "A2" },
  { lemma: "étage", forms: ["étages"], translations: ["floor", "storey"], partOfSpeech: "noun", gender: "masculine", cefr: "A1" },
  { lemma: "salon", forms: ["salons"], translations: ["living room", "lounge"], partOfSpeech: "noun", gender: "masculine", cefr: "A2" },
  { lemma: "voisin", forms: ["voisine", "voisins", "voisines"], translations: ["neighbour", "neighbor"], partOfSpeech: "noun", gender: "masculine", cefr: "A2", notes: "Also an adjective meaning neighbouring." },
  { lemma: "traversée", forms: ["traversées"], translations: ["crossing"], partOfSpeech: "noun", gender: "feminine", cefr: "B1" },
  { lemma: "chose", forms: ["choses"], translations: ["thing"], partOfSpeech: "noun", gender: "feminine", cefr: "A1" },
  { lemma: "fois", translations: ["time", "occasion"], partOfSpeech: "noun", gender: "feminine", cefr: "A1", notes: "Counting occurrences: \"trois fois\" — three times." },
  { lemma: "jour", forms: ["jours"], translations: ["day", "daylight"], partOfSpeech: "noun", gender: "masculine", cefr: "A1" },
  { lemma: "mois", translations: ["month"], partOfSpeech: "noun", gender: "masculine", cefr: "A1" },
  { lemma: "an", forms: ["ans"], translations: ["year"], partOfSpeech: "noun", gender: "masculine", cefr: "A1" },
  { lemma: "femme", forms: ["femmes"], translations: ["woman", "wife"], partOfSpeech: "noun", gender: "feminine", cefr: "A1" },
  { lemma: "fille", forms: ["filles"], translations: ["girl", "daughter"], partOfSpeech: "noun", gender: "feminine", cefr: "A1" },
  { lemma: "garçon", forms: ["garçons"], translations: ["boy"], partOfSpeech: "noun", gender: "masculine", cefr: "A1" },
  { lemma: "voix", translations: ["voice", "vote"], partOfSpeech: "noun", gender: "feminine", cefr: "A2" },
  { lemma: "chemin", forms: ["chemins"], translations: ["path", "way", "road"], partOfSpeech: "noun", gender: "masculine", cefr: "A2" },
  { lemma: "côté", forms: ["côtés"], translations: ["side"], partOfSpeech: "noun", gender: "masculine", cefr: "A2", notes: "\"À côté de\" — next to." },
  { lemma: "lumière", forms: ["lumières"], translations: ["light"], partOfSpeech: "noun", gender: "feminine", cefr: "A2" },
  { lemma: "peur", translations: ["fear"], partOfSpeech: "noun", gender: "feminine", cefr: "A1", notes: "\"Avoir peur\" — to be afraid." },
  { lemma: "peine", forms: ["peines"], translations: ["difficulty", "sorrow", "sentence"], partOfSpeech: "noun", gender: "feminine", cefr: "B1", notes: "\"À peine\" — hardly; in law, a sentence." },
  { lemma: "raison", forms: ["raisons"], translations: ["reason"], partOfSpeech: "noun", gender: "feminine", cefr: "A2", notes: "\"Avoir raison\" — to be right." },
  { lemma: "bout", forms: ["bouts"], translations: ["end", "tip", "piece"], partOfSpeech: "noun", gender: "masculine", cefr: "A2" },
  { lemma: "conseil", forms: ["conseils"], translations: ["advice", "council"], partOfSpeech: "noun", gender: "masculine", cefr: "A2" },
  { lemma: "lettre", forms: ["lettres"], translations: ["letter"], partOfSpeech: "noun", gender: "feminine", cefr: "A1" },
  { lemma: "point", forms: ["points"], translations: ["point", "dot", "full stop"], partOfSpeech: "noun", gender: "masculine", cefr: "A2" },
  { lemma: "dieu", forms: ["dieux"], translations: ["god"], partOfSpeech: "noun", gender: "masculine", cefr: "A2" },
  { lemma: "comte", forms: ["comtes"], translations: ["count", "earl"], partOfSpeech: "noun", gender: "masculine", cefr: "B1" },
  { lemma: "capitaine", forms: ["capitaines"], translations: ["captain"], partOfSpeech: "noun", gender: "masculine", cefr: "B1" },
  { lemma: "chien", forms: ["chiens", "chienne"], translations: ["dog"], partOfSpeech: "noun", gender: "masculine", cefr: "A1" },

  // --- Adjectives whose generated first gloss was wrong ---------------------
  { lemma: "clair", forms: ["claire", "clairs", "claires"], translations: ["bright", "light", "clear"], partOfSpeech: "adjective", cefr: "A2" },
  { lemma: "gentil", forms: ["gentille", "gentils", "gentilles"], translations: ["kind", "nice"], partOfSpeech: "adjective", cefr: "A1" },
  { lemma: "fou", forms: ["folle", "fous", "folles"], translations: ["mad", "crazy"], partOfSpeech: "adjective", cefr: "B1" },
  { lemma: "propre", forms: ["propres"], translations: ["clean", "own"], partOfSpeech: "adjective", cefr: "A2", notes: "Before the noun it means \"own\": \"ma propre voiture\"." },
  { lemma: "seul", forms: ["seule", "seuls", "seules"], translations: ["alone", "only", "single"], partOfSpeech: "adjective", cefr: "A2" },

  // --- Verbs whose entry was tagged with the wrong part of speech ----------
  { lemma: "lever", forms: ["lève", "lèves", "levons", "levez", "lèvent", "levé", "levée", "levait", "levèrent"], translations: ["to raise", "to lift"], partOfSpeech: "verb (infinitive)", cefr: "A2", notes: "Reflexive \"se lever\" means to get up." },
  { lemma: "sembler", forms: ["semble", "semblent", "semblait", "semblé"], translations: ["to seem", "to appear"], partOfSpeech: "verb (infinitive)", cefr: "A2" },
  { lemma: "craindre", forms: ["crains", "craint", "craignons", "craignez", "craignent", "craignait"], translations: ["to fear", "to be afraid of"], partOfSpeech: "verb (infinitive)", cefr: "B1" },
  { lemma: "voici", translations: ["here is", "here are"], partOfSpeech: "presentative", cefr: "A2" },
];
