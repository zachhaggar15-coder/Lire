import type { DictionaryEntry, DictionaryLookupResult } from "@/lib/dictionary/types";
import { frEnDictionary } from "@/data/dictionaries/fr-en";
import { newsSenseDictionary } from "@/data/dictionaries/news-senses";
import { coreSenseDictionary } from "@/data/dictionaries/core-senses";
import { phraseBankDictionary } from "@/data/dictionaries/phrase-bank";
import { properNounDictionary } from "@/data/dictionaries/proper-nouns";
import { articleCoverageDictionary } from "@/data/dictionaries/article-coverage";
import { loadGeneratedDictionary } from "@/data/dictionaries/generated/fr-en-generated";
import { enFrDictionary } from "@/data/dictionaries/en-fr";
import { guessLemmas } from "@/lib/dictionary/lemmatize";
import { getCustomDictionaryEntry } from "@/lib/dictionary/custom";

/**
 * Offline, instant word lookup. Never calls a network API — this is the
 * "Kindle-like" fast path. Two dictionary layers, checked in order:
 *   1. The hand-curated dictionary (fr-en.ts) — better examples, CEFR
 *      levels, gender, and explicitly-listed conjugated forms.
 *   2. The generated dictionary (generated/fr-en-generated.ts) — much
 *      broader coverage from WikDict/Wiktionary data, no forms/examples/
 *      CEFR, used only for words the curated dictionary doesn't have.
 * Within each layer: exact lemma, then inflected forms. If neither layer's
 * lemma/forms match, a rule-based lemma guess (lemmatize.ts) is tried
 * against both layers; otherwise the word is reported missing.
 */

const byLemma = new Map<string, DictionaryEntry>();
const byForm = new Map<string, DictionaryEntry>();
const properByLemma = new Map<string, DictionaryEntry>();
const properByForm = new Map<string, DictionaryEntry>();

for (const entry of frEnDictionary) {
  byLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    byForm.set(form.toLowerCase(), entry);
  }
}

// News/common-reading overrides intentionally win over the older curated
// starter entries and the broad generated WikDict layer. This fixes cases
// where a generated first gloss is technically valid but wrong for articles
// ("escalade" -> escalation before rock climbing, "frappes" -> strikes
// before the verb "to hit").
for (const entry of newsSenseDictionary) {
  byLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    byForm.set(form.toLowerCase(), entry);
  }
}

// Core high-frequency vocabulary. These are single words a reader meets in
// almost every sentence and which previously had no curated entry at all, so
// they resolved through the generated layer's arbitrary sense order — "sur"
// came back as "sour", "moi" as "ego", "ne" as "NE". See core-senses.ts.
for (const entry of coreSenseDictionary) {
  byLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    byForm.set(form.toLowerCase(), entry);
  }
}

// Phrase-bank entries are intentionally high priority: if a reader long-presses
// "mettre fin à" or "sur fond de", the phrase meaning should win before any
// generated literal word sense can produce a plausible-but-wrong gloss.
for (const entry of phraseBankDictionary) {
  byLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    byForm.set(form.toLowerCase(), entry);
  }
}

// Proper nouns stay in their own maps and only claim a general-lookup slot
// when no ordinary word already owns it — as a lemma *or* as an inflected
// form. Checking the lemma alone wasn't enough: "Claire" is a common first
// name, but "claire" is also the feminine of the adjective "clair", and since
// byLemma is consulted before byForm the name won, so a reader tapping
// "une pièce claire" was told the word meant "Claire". A capitalised
// occurrence still resolves to the name through properByLemma below.
for (const entry of properNounDictionary) {
  const lemmaKey = entry.lemma.toLowerCase();
  properByLemma.set(lemmaKey, entry);
  if (!byLemma.has(lemmaKey) && !byForm.has(lemmaKey)) byLemma.set(lemmaKey, entry);
  for (const form of entry.forms ?? []) {
    const formKey = form.toLowerCase();
    properByForm.set(formKey, entry);
    if (!byForm.has(formKey) && !byLemma.has(formKey)) byForm.set(formKey, entry);
  }
}

const generatedByLemma = new Map<string, DictionaryEntry>();
const generatedByForm = new Map<string, DictionaryEntry>();
const articleCoverageByLemma = new Map<string, DictionaryEntry>();
const articleCoverageByForm = new Map<string, DictionaryEntry>();

/**
 * The generated layer is loaded on demand rather than bundled — see the note
 * in data/dictionaries/generated/fr-en-generated.ts. Until it resolves these
 * maps are empty and lookups fall back to the curated dictionary, which
 * covers the common vocabulary a reader hits first; the broad layer fills in
 * a moment later.
 */
let generatedReady: Promise<void> | null = null;

export function isGeneratedDictionaryReady(): boolean {
  return generatedByLemma.size > 0;
}

/**
 * A gloss that is a bare abbreviation or code rather than a word: "NE", "SSE",
 * "RC", "DINK", "CoQ".
 *
 * WikDict mixes these in with ordinary senses and the export preserved no
 * domain tags, so they sort like any other translation. 1,592 generated
 * entries lead with one, and they cluster on common words — "est" showed as
 * "SSE" (a compass bearing), "glace" as "ICE", "non" as "NOT". Since the
 * reader only sees the first gloss, an abbreviation there is simply a wrong
 * answer.
 */
function isBareAbbreviation(translation: string): boolean {
  const trimmed = translation.trim();
  if (trimmed.length === 0 || trimmed.length > 5) return false;
  if (!/[A-Z]/.test(trimmed)) return false;
  // No lowercase letters at all, e.g. "SSE" or "N.E." — "CoQ" and "PhD" keep
  // a capital lead, so require the whole token to be caps/punctuation/digits.
  return /^[A-Z0-9.\-/]+$/.test(trimmed);
}

/**
 * The spelled-out form of an acronym, which WikDict stores as an ordinary
 * sense: "case" -> "double income, no kids" (DINK).
 *
 * Only the comma is used as the signal. Length is not: plenty of correct
 * glosses are long, and a word-count rule demoted real ones — "au milieu de"
 * lost "in the middle of" to "amid", which is a worse answer for a learner.
 */
function isAcronymExpansion(translation: string): boolean {
  return translation.includes(",");
}

/**
 * Moves abbreviations and acronym expansions to the back of the list instead
 * of dropping them. A reader on a technical text may genuinely want "CoQ", and
 * nothing is lost by keeping it — it just stops being the headline answer.
 * Falls back to the original order if every sense looks like one of these, so
 * a word can never end up with no translation at all.
 */
function preferPlainGlosses(translations: string[]): string[] {
  const noisy = (t: string) => isBareAbbreviation(t) || isAcronymExpansion(t);
  const plain = translations.filter((t) => !noisy(t));
  if (plain.length === 0) return translations;
  return [...plain, ...translations.filter(noisy)];
}

/** Loads and indexes the broad generated dictionary. Idempotent and safe to call from anywhere. */
export function ensureGeneratedDictionary(): Promise<void> {
  if (!generatedReady) {
    generatedReady = loadGeneratedDictionary()
      .then((entries) => {
        for (const raw of entries) {
          // Reorder once here, at index time, rather than on every lookup.
          const entry: DictionaryEntry = { ...raw, translations: preferPlainGlosses(raw.translations) };
          generatedByLemma.set(entry.lemma.toLowerCase(), entry);
          for (const form of entry.forms ?? []) {
            generatedByForm.set(form.toLowerCase(), entry);
          }
        }
      })
      .catch(() => {
        // Offline or chunk fetch failed: curated lookups keep working, and a
        // later call can retry rather than being stuck on a rejected promise.
        generatedReady = null;
      });
  }
  return generatedReady;
}

/**
 * Safety net so no screen is left permanently on curated-only coverage.
 *
 * Screens that care about full coverage call ensureGeneratedDictionary()
 * explicitly (via useGeneratedDictionary) so they can re-render when it
 * lands. But lookupWord is called from plenty of incidental places, and a
 * miss there is the strongest possible signal that the broad layer is worth
 * fetching — so a miss also kicks the load off in the background. The current
 * call still returns the curated answer; subsequent ones get full coverage.
 */
function warmGeneratedDictionaryInBackground(): void {
  if (generatedReady || typeof window === "undefined") return;
  void ensureGeneratedDictionary();
}

for (const entry of articleCoverageDictionary) {
  articleCoverageByLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    articleCoverageByForm.set(form.toLowerCase(), entry);
  }
}

const enByLemma = new Map<string, DictionaryEntry>();
const enByForm = new Map<string, DictionaryEntry>();

for (const entry of enFrDictionary) {
  enByLemma.set(entry.lemma.toLowerCase(), entry);
  for (const form of entry.forms ?? []) {
    enByForm.set(form.toLowerCase(), entry);
  }
}

/**
 * Drops the part of speech when the entry was reached by a rule-based lemma
 * guess rather than an exact lemma or a form the entry actually lists.
 *
 * The stored part of speech describes the *lemma*, and a guess can cross word
 * classes: "murmura" (a verb form) strips to the noun "murmure", so the reader
 * was told a verb was a noun; "lève" reached "lever", whose generated entry is
 * tagged noun. Beyond misleading the reader, that label feeds the example
 * generator, which then builds its sentence around the wrong word class.
 *
 * The translations are still worth showing — a guess usually lands on the
 * right family — so the part of speech is kept for grammar heuristics that
 * need it (reflexive detection, for one) and merely flagged, leaving the UI
 * to decide not to state it as fact.
 */
function withUncertainPartOfSpeech(result: DictionaryLookupResult): DictionaryLookupResult {
  return { ...result, partOfSpeechUncertain: true };
}

function toResult(input: string, entry: DictionaryEntry | null): DictionaryLookupResult {
  if (!entry) {
    return {
      input,
      lemma: null,
      translations: [],
      partOfSpeech: null,
      gender: null,
      frequencyRank: null,
      cefr: null,
      examples: [],
      source: "missing",
    };
  }
  return {
    input,
    lemma: entry.lemma,
    translations: entry.translations,
    partOfSpeech: entry.partOfSpeech ?? null,
    gender: entry.gender ?? null,
    frequencyRank: entry.frequencyRank ?? null,
    cefr: entry.cefr ?? null,
    examples: entry.examples ?? [],
    source: "local",
  };
}

/** The immediately adjacent words in the sentence a tapped word came from — see the phrase-detection note on lookupWord below. */
export interface LookupContext {
  previousWord?: string | null;
  nextWord?: string | null;
}

function lookupExact(key: string): DictionaryEntry | null {
  return (
    byLemma.get(key) ??
    byForm.get(key) ??
    generatedByLemma.get(key) ??
    generatedByForm.get(key) ??
    getCustomDictionaryEntry(key) ??
    articleCoverageByLemma.get(key) ??
    articleCoverageByForm.get(key) ??
    null
  );
}

function looksLikeProperNoun(rawWord: string): boolean {
  const trimmed = rawWord.trim();
  if (!trimmed || trimmed.includes(" ")) return false;
  const first = trimmed.match(/\p{L}/u)?.[0];
  return !!first && first === first.toUpperCase() && first !== first.toLowerCase();
}

function fallbackProperNoun(rawWord: string): DictionaryEntry | null {
  const clean = rawWord.trim();
  if (!looksLikeProperNoun(clean)) return null;
  return {
    lemma: clean,
    translations: [clean],
    partOfSpeech: "proper noun",
    notes: "Capitalized unknown word: treated as a likely proper name/place rather than a missing dictionary word.",
  };
}

/**
 * Looks up a French word offline. Accepts either an already-cleaned word
 * or a raw one — cleaning here too keeps this usable as a standalone
 * module. Order: curated lemma, curated forms, generated lemma, generated
 * forms, then a rule-based lemma guess (lemmatize.ts) tried against both
 * layers; otherwise "missing" (never falls back to AI).
 *
 * When `context` is given, a fixed-expression check runs first: the
 * three-word combination ("<previous> <word> <next>") if both neighbours
 * are known, then each two-word combination ("<previous> <word>", "<word>
 * <next>") — longest/most-specific match first, same principle as
 * lemmatize.ts's suffix ordering. Many common French phrases (à travers,
 * de travers, tout à coup, quand même, se rendre compte, tenir compte de,
 * ...) are built from a word whose *standalone* meaning is different —
 * sometimes much rarer or outright misleading — than its meaning inside
 * the phrase (e.g. tapping "travers" inside "à travers" would otherwise
 * resolve to the rare standalone noun sense "ribs" instead of
 * "through/across"; tapping "rend" inside "se rend compte" would otherwise
 * resolve to "rendre" = "to give back" instead of "se rendre compte" = "to
 * realize"). This only ever changes the result when the word combination
 * is itself a real dictionary entry, so it's a no-op for the vast majority
 * of word combinations that aren't a known phrase — same safety property
 * as guessLemmas.
 */
export function lookupWord(rawWord: string, context?: LookupContext): DictionaryLookupResult {
  const clean = rawWord.trim().toLowerCase();
  if (!clean) return toResult(rawWord, null);

  const prev = context?.previousWord?.trim().toLowerCase();
  const next = context?.nextWord?.trim().toLowerCase();

  if (prev && next) {
    const threeWord = lookupExact(`${prev} ${clean} ${next}`);
    if (threeWord) return toResult(rawWord, threeWord);
  }
  if (prev) {
    const phrase = lookupExact(`${prev} ${clean}`);
    if (phrase) return toResult(rawWord, phrase);
  }
  if (next) {
    const phrase = lookupExact(`${clean} ${next}`);
    if (phrase) return toResult(rawWord, phrase);
  }

  const exact = byLemma.get(clean);
  if (exact) return toResult(rawWord, exact);

  const viaForm = byForm.get(clean);
  if (viaForm) return toResult(rawWord, viaForm);

  if (looksLikeProperNoun(rawWord)) {
    const proper = properByLemma.get(clean) ?? properByForm.get(clean);
    if (proper) return toResult(rawWord, proper);
  }

  // Past the curated layer: whatever this word is, the broad layer is the one
  // that would answer it, so make sure it's on its way in.
  warmGeneratedDictionaryInBackground();

  const generatedExact = generatedByLemma.get(clean);
  if (generatedExact) return toResult(rawWord, generatedExact);

  const generatedViaForm = generatedByForm.get(clean);
  if (generatedViaForm) return toResult(rawWord, generatedViaForm);

  const customExact = getCustomDictionaryEntry(clean);
  if (customExact) return toResult(rawWord, customExact);

  const articleCoverageExact = articleCoverageByLemma.get(clean) ?? articleCoverageByForm.get(clean);
  if (articleCoverageExact) return toResult(rawWord, articleCoverageExact);

  for (const guess of guessLemmas(clean)) {
    const viaGuess =
      byLemma.get(guess) ??
      byForm.get(guess) ??
      generatedByLemma.get(guess) ??
      generatedByForm.get(guess) ??
      getCustomDictionaryEntry(guess);
    if (viaGuess) {
      // An exact hit on the guessed lemma is safe; anything else crossed a
      // form boundary we inferred, so the stored part of speech may not
      // describe the word the reader actually tapped.
      const exactLemmaHit = viaGuess.lemma.toLowerCase() === guess;
      const result = toResult(rawWord, viaGuess);
      return exactLemmaHit && guess === clean ? result : withUncertainPartOfSpeech(result);
    }
  }

  const apostropheIndex = Math.max(rawWord.lastIndexOf("'"), rawWord.lastIndexOf("\u2019"));
  if (apostropheIndex >= 0 && apostropheIndex < rawWord.length - 1) {
    const elidedTail = rawWord.slice(apostropheIndex + 1);
    const elidedProper = fallbackProperNoun(elidedTail);
    if (elidedProper) return toResult(rawWord, elidedProper);
  }

  return toResult(rawWord, fallbackProperNoun(rawWord));
}

/**
 * Looks up an English word against the (much smaller, not yet UI-wired)
 * English → French dictionary. Same exact-lemma → forms → missing order;
 * no lemmatiser fallback here since en-fr.ts is small and hand-curated.
 */
export function lookupEnglishWord(rawWord: string): DictionaryLookupResult {
  const clean = rawWord.trim().toLowerCase();
  if (!clean) return toResult(rawWord, null);

  const exact = enByLemma.get(clean);
  if (exact) return toResult(rawWord, exact);

  const viaForm = enByForm.get(clean);
  if (viaForm) return toResult(rawWord, viaForm);

  return toResult(rawWord, null);
}
