/**
 * Deterministic checks for high-risk French spelling errors in teaching
 * content (grammar lessons, examples, practice questions, reference tables).
 *
 * This is NOT a linguistic review — a qualified reviewer still has to sign the
 * content off (docs/review/french-human-review.md). It catches the systematic
 * failure that shipped before: French written without accents, where an
 * accent changes the word (a/à, ou/où) or the unaccented form is simply not
 * French (etre, deja, tres).
 *
 * Checks run only on French-bearing fields (example sentences, question
 * sentences/choices/answers, patterns, forms), so English explanations that
 * mention words like "present" or "decide" are not flagged.
 */

import { readFileSync } from "node:fs";

let failures = 0;
let checked = 0;
const problems = [];

/** Unaccented spellings that are never correct French words. */
const NEVER_VALID = new Set(
  [
    "etre etes deja tres apres ete etait etaient etais etions etiez francais francaise garcon meme memes fete fetes foret",
    "hopital ecole ecoles eleve eleves theatre numero verite reponse reponses premiere derniere frere freres mere meres pere",
    "peres oeuf oeufs soeur soeurs coeur noel probleme problemes systeme interet college cles gateau gateaux diner dejeuner",
    "bientot plutot aussitot tot reussi reussir reussit reussis reussissons reussite repondu repondre reponds repondez repondent",
    "telephoner preter equipe equipes resultat resultats reunion reunions decision decisions decider meteo temperature recolte",
    "musee musees legume legumes preparee prepares preparees prefere preferes preferer annee annees journee journees etude",
    "etudes etudiant etudiants idee idees periode",
  ]
    .join(" ")
    .split(" "),
);

/** "a" (avoir) directly before these is almost always the preposition à. */
const A_BEFORE = /(^|[\s(«"'])a (la|l'|mon|ton|son|ma|ta|sa|mes|tes|ses|nos|vos|leur|leurs|Paris|Lyon|temps|table|cause|moins|toutes|tous|côté|pied|propos|nouveau|peine)\b/;
/** "ou" introducing a clause about place/time is où. */
const OU_RELATIVE = /\b(jour|ville|moment|endroit|maison|pays|époque|année|soir|matin|lieu) ou\b|\bou (j'|je |tu |il |elle |nous |vous |ils |elles )habit/;

const ENGLISH_HINT = /\b(the|is|are|was|choose|which|what|why|this|that|it|its|not|only|with|have|has|does|would|could|should|pick|form|tense|verb)\b/i;

function looksFrench(text) {
  return !ENGLISH_HINT.test(text);
}

function check(where, text) {
  if (typeof text !== "string" || !text.trim() || !looksFrench(text)) return;
  checked += 1;
  const tokens = text.toLowerCase().match(/[a-zà-ÿœæ]+/g) ?? [];
  for (const token of tokens) {
    if (NEVER_VALID.has(token)) problems.push(`${where}: "${token}" is missing an accent — ${text}`);
  }
  if (A_BEFORE.test(text)) problems.push(`${where}: "a" before a determiner/place — should this be "à"? — ${text}`);
  if (OU_RELATIVE.test(text)) problems.push(`${where}: relative/place "ou" — should this be "où"? — ${text}`);
  if (/\bpasse compose\b|\bpasse simple\b/i.test(text)) problems.push(`${where}: "passé composé/simple" missing accents — ${text}`);
}

const grammar = await import("../src/lib/grammar.ts");
for (const lesson of [...grammar.VERB_LESSONS, ...grammar.STRUCTURE_LESSONS]) {
  for (const example of lesson.examples) check(`${lesson.id} example`, example.french);
  check(`${lesson.id} pattern`, lesson.pattern ?? lesson.corePattern);
  for (const ending of lesson.endings ?? lesson.keyForms ?? []) check(`${lesson.id} form`, ending);
  // English fields still must not contain the unambiguous non-words.
  for (const field of ["title", "shortTitle", "explanation", "commonMistake", "purpose"]) {
    const text = lesson[field];
    for (const token of (text?.toLowerCase().match(/[a-zà-ÿœæ]+/g) ?? [])) {
      if (["etre", "etes", "deja", "etait", "apres"].includes(token)) problems.push(`${lesson.id} ${field}: "${token}" is missing an accent`);
    }
    if (/\bpasse compose\b|\bpasse simple\b/i.test(text ?? "")) problems.push(`${lesson.id} ${field}: "passé composé/simple" missing accents`);
  }
}
for (const verb of grammar.VERB_REFERENCES) {
  check(`reference ${verb.infinitive}`, verb.infinitive);
  for (const [tense, forms] of Object.entries(verb.forms)) for (const form of forms) check(`reference ${verb.infinitive} ${tense}`, form);
}
for (const topic of grammar.STRUCTURE_REFERENCES) for (const row of topic.rows) check(`reference ${topic.id}`, row.detail.split(":").slice(1).join(":") || row.detail);
for (const q of grammar.GRAMMAR_QUESTIONS) {
  check(`${q.id} sentence`, q.sentence);
  for (const choice of q.choices) check(`${q.id} choice`, choice);
  check(`${q.id} answer`, q.answer);
  if (!q.choices.includes(q.answer)) problems.push(`${q.id}: the answer is not one of the choices`);
}

failures = problems.length;
if (failures) {
  console.error(problems.join("\n"));
  console.error(`\nFrench content check: ${failures} failed, ${checked} passed`);
  process.exit(1);
}
console.log(`French content check: ${checked} checks passed`);
