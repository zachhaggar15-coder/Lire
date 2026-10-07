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

// Semantic regressions from the independent French QA (closure matrix
// G04-G14, RC13). Each guards a specific wrong rule or answer key that an
// accent check cannot see. A qualified reviewer still signs the content off.
const allLessons = [...grammar.VERB_LESSONS, ...grammar.STRUCTURE_LESSONS];
const lessonText = (id) => {
  const lesson = allLessons.find((l) => l.id === id);
  return lesson ? [lesson.explanation, lesson.commonMistake, lesson.pattern ?? lesson.corePattern].join(" ") : "";
};
const question = (id) => grammar.GRAMMAR_QUESTIONS.find((q) => q.id === id);
const semantic = [
  ["G05 -re stem drops -re, not -e", !/vendre drop the -e/.test(lessonText("present-ir-re")) && /drop -re/.test(lessonText("present-ir-re"))],
  ["G06 imparfait teaches the être exception", /être, whose stem is ét-/.test(lessonText("imparfait"))],
  ["G06 future teaches -re verbs drop final e", /drop their final e/.test(lessonText("future-simple"))],
  ["G07 que alone does not decide the mood", !/only que before the clause signals subjunctive/.test(lessonText("subjonctif-present-formation"))],
  ["G08 allions uses all-, not aill-", !/stem aill-, with the regular nous/.test(question("subjonctif-present-irregulars-4")?.explanation ?? "") && /all-/.test(question("subjonctif-present-irregulars-4")?.explanation ?? "")],
  ["G09 participle vs agreeing adjective separated", /never agrees/.test(lessonText("participe-present-gerondif")) && /étant/.test(lessonText("participe-present-gerondif"))],
  ["G10 si rule limited to conditions", /si means whether/.test(lessonText("si-clauses-real"))],
  ["G10 penser de not limited to questions", !/only used when asking/.test(lessonText("preposition-verb-pairings"))],
  ["G10 dont: only the replaced de", !/anywhere else in the clause/.test(lessonText("relative-pronoun-dont"))],
  ["G14 object pronouns before infinitive / after in commands", /je vais le lire/.test(lessonText("object-pronouns-cod")) && /lis-le/.test(lessonText("object-pronouns-cod"))],
  ["G14 passive vs state", /la porte est fermée/.test(lessonText("voix-passive"))],
  ["G14 reflexive agreement exception", /s'est lavé les mains/.test(lessonText("passe-compose"))],
  ["G13 reported speech: still-true present allowed", /still true/.test(lessonText("reported-speech"))],
  ["G04 jacket uses celle de, not la sienne de", question("demonstratives-and-possessives-3")?.answer === "celle"],
  ["G12 si + present: no valid alternative offered", !question("si-clauses-real-2")?.choices.includes("peux")],
  ["G12 dès que: no valid alternative offered", !question("futur-anterieur-4")?.choices.includes("feront")],
  ["G12 adverb: no valid alternative offered", !question("adverb-placement-3")?.choices.includes("Il a poliment répondu.")],
  ["G12 relative: no valid alternative offered", !question("relative-pronouns-advanced-4")?.choices.includes("avec lesquels")],
  ["RC13 nous avons voyagé", /nous avons voyagé/.test(question("relative-pronouns-advanced-4")?.sentence ?? "")],
  ["G13 reported speech questions: no valid alternative offered", !question("reported-speech-1")?.choices.includes("est fatigué") && !question("reported-speech-2")?.choices.includes("arrivera")],
];
for (const [label, ok] of semantic) {
  checked += 1;
  if (!ok) problems.push(`semantic: ${label}`);
}
// No answer key may be offered twice, and every question has exactly one key.
for (const q of grammar.GRAMMAR_QUESTIONS) {
  checked += 1;
  if (new Set(q.choices).size !== q.choices.length) problems.push(`${q.id}: duplicate choices`);
}

failures = problems.length;
if (failures) {
  console.error(problems.join("\n"));
  console.error(`\nFrench content check: ${failures} failed, ${checked} passed`);
  process.exit(1);
}
console.log(`French content check: ${checked} checks passed`);
