/**
 * Generated cloze must be fair: one right answer, every option good grammar
 * for the gap, and a clue that is the tested word's own meaning. Covers the
 * independent verifier's failures and sweeps a corpus sample with a checker
 * that does not reuse the generator's rules.
 */
import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

const t = createRunner("cloze");
installWindow(createStorage());
const { ensureGeneratedDictionary, lookupWord } = await import("../src/lib/dictionary/lookup.ts");
await ensureGeneratedDictionary();
const { buildWordCloze, distractorPoolFromBody } = await import("../src/lib/practice/cloze.ts");
const { allSentencesInText } = await import("../src/lib/practice/textSentences.ts");
const { exerciseGlossFor } = await import("../src/lib/practice/exerciseGloss.ts");
const { resolveMeaning } = await import("../src/lib/dictionary/resolveMeaning.ts");
const { hasWordClass } = await import("../src/lib/dictionary/partOfSpeech.ts");
const { buildPracticePlan } = await import("../src/lib/practice/session.ts");
const { getTextById } = await import("../src/data/texts.ts");
const { starterTexts } = await import("../src/data/starterTexts.ts");
const { publicDomainTexts } = await import("../src/data/publicDomainTexts.ts");
const { getNextTextForReader } = await import("../src/lib/journey/state.ts");
const { getJourneyText } = await import("../src/lib/journey/ladder.ts");

const clozesFor = (body) => {
  const sentences = allSentencesInText({ body });
  return sentences.map((sentence) => buildWordCloze(sentence, distractorPoolFromBody(body, sentence.index, sentences))).filter(Boolean);
};
const clozesForText = (text) => clozesFor(text.body);

await t.section("The verifier's failures", async () => {
  const c1 = getTextById("starter-c1-001");
  const c1Clozes = clozesForText(c1);
  const PLURAL_VERBS = /^(dénient|reconnaissent)$/;
  t.check("1. 'On ___' never offers plural finite verbs", c1Clozes.every((c) => !c.options.some((o) => PLURAL_VERBS.test(o))), c1Clozes.map((c) => c.options.join("/")).join(" | "));
  const onTient = clozesFor("On tient le débat pour une évidence.\n\nIls reconnaissent le problème. Les camps se dénient le droit de parler. Il devient difficile de parler. Elle tient bon.");
  t.check("1. 'On tient …' with plural verbs in the reading: no plural option offered", onTient.every((c) => c.answer !== "tient" || c.options.every((o) => !/ent$/.test(o) || o === "tient")));

  t.check("2. 'au sens plein': sens is never a cloze answer, so never taught as 'to feel'", c1Clozes.every((c) => c.answer !== "sens"));
  const sensClue = exerciseGlossFor({ french: "sens", sentence: "Car débattre, au sens plein, ne consiste pas à faire coexister des opinions contraires.", contextOnly: true });
  t.check("2. and no context-only clue ever says 'to feel' for it", !sensClue || !/feel|smell/.test(sensClue.english), JSON.stringify(sensClue));

  t.check("3. no token cloze on 'sommes' in 'Nous sommes portés à…'", c1Clozes.every((c) => c.answer !== "sommes"));
  const sommesClue = exerciseGlossFor({ french: "sommes", sentence: "Nous sommes portés à tenir nos convictions pour évidentes.", contextOnly: true });
  t.check("3. the expression's meaning is never a single token's clue", !sommesClue || !/inclined|tend/.test(sommesClue.english), JSON.stringify(sommesClue));

  const weather = clozesFor("Il fait beau ce matin.\n\nHier, il faisait chaud. Il fait froid le soir. Le café est chaud.");
  t.check("4. 'Il fait ___ ce matin' is never scored on beau (chaud would also be right)", weather.every((c) => c.answer !== "beau"));
  const a1 = clozesForText(getTextById("starter-a1-001"));
  t.check("4. nor in the A1 text it came from", a1.every((c) => c.answer !== "beau" && !c.options.includes("beau")), a1.map((c) => `${c.prompt} ${c.answer}`).join(" | "));
});

await t.section("Valid clozes still appear", async () => {
  const body = [
    "Le matin, Léa prépare un café dans la cuisine. Elle porte une robe rouge. Elle ouvre la fenêtre.",
    "Le soir, son frère prend un vélo pour rentrer. Il porte une veste noire. Il mange une pomme. Il marche vite.",
    "Le dimanche, leur père lit un livre au jardin. Elle porte une jupe longue. Elle regarde un film. Elle chante souvent.",
    "Leur mère achète un gâteau au marché. Il conduit une voiture blanche. Il ferme la porte. Il parle lentement.",
  ].join("\n\n");
  const all = clozesFor(body);
  const role = (c) => {
    const before = c.prompt.split("___")[0].trim().split(/\s+/).slice(-2);
    const last = before[before.length - 1]?.toLowerCase();
    if (["un", "une", "le", "la", "les", "des", "du", "au", "son", "sa"].includes(last)) return "noun";
    if (["il", "elle", "on", "ils", "elles", "je", "tu", "nous", "vous"].includes(last)) return "verb";
    if (hasWordClass(lookupWord(c.answer).partOfSpeech, "adjective")) return "adjective";
    return "adverb";
  };
  const roles = new Set(all.map(role));
  t.check("5. a noun cloze is generated", roles.has("noun"), all.map((c) => `${role(c)}:${c.answer}`).join(", "));
  t.check("6. an adjective cloze is generated", roles.has("adjective"), all.map((c) => `${role(c)}:${c.answer}`).join(", "));
  t.check("7. a finite-verb cloze is generated", roles.has("verb"), all.map((c) => `${role(c)}:${c.answer}`).join(", "));
  // One cloze per sentence, and a verb with more fair options wins, so adverbs get their own reading.
  const adverbs = clozesFor("Il marche vite.\n\nElle chante souvent.\n\nIl parle lentement.\n\nElle lit rarement.");
  t.check("8. an adverb cloze is generated", adverbs.some((c) => ["vite", "souvent", "lentement", "rarement"].includes(c.answer) && c.options.every((o) => ["vite", "souvent", "lentement", "rarement"].includes(o))), JSON.stringify(adverbs[0]));
  t.check("every question carries its clue, shown with it", all.every((c) => typeof c.clue === "string" && c.clue.length > 1));
  for (const id of ["starter-a1-001", "starter-a2-038"]) {
    t.check(`9. ${id} still gets unambiguous clozes`, clozesForText(getTextById(id)).length > 0);
  }
  t.check("10. a sentence with no established role gets no question", clozesFor("Il fait beau.\n\nIl fait froid.") .length === 0);
  const plan = buildPracticePlan({ ...getTextById("starter-a1-001"), body: "Il fait beau. Il fait froid. Il fait chaud." });
  t.check("10. a plan with no fair cloze simply has fewer activities", Array.isArray(plan.activities) && plan.activities.every((a) => a.kind !== "cloze"));
});

/** An independent check of one generated item. Returns the problems found. */
function audit(c) {
  const problems = [];
  const options = c.options.map((o) => o.toLowerCase());
  if (new Set(options).size !== options.length) problems.push("duplicate options");
  if (!options.includes(c.answer.toLowerCase())) problems.push("answer missing");
  if (c.options.some((o) => /\s|['’]/.test(o))) problems.push("multi-word or elided option");
  if (c.options.some((o) => /^\p{Lu}/u.test(o))) problems.push("capitalised option");
  const before = c.prompt.split("___")[0].trim().split(/\s+/);
  const left = (before[before.length - 1] ?? "").toLowerCase();
  const DET = { le: "m", un: "m", du: "m", au: "m", ce: "m", cet: "m", mon: "m", ton: "m", son: "m", la: "f", une: "f", cette: "f", ma: "f", ta: "f", sa: "f" };
  const PLURAL_DET = new Set(["les", "des", "aux", "ces", "mes", "tes", "ses", "nos", "vos", "leurs"]);
  const PRON = { je: "1sg", tu: "2sg", il: "3sg", elle: "3sg", on: "3sg", nous: "1pl", vous: "2pl", ils: "3pl", elles: "3pl" };
  for (const option of options) {
    const entry = lookupWord(option);
    if (DET[left] || PLURAL_DET.has(left)) {
      if (!hasWordClass(entry.partOfSpeech, "noun") || hasWordClass(entry.partOfSpeech, "verb")) problems.push(`${option}: not a noun after "${left}"`);
      if (DET[left] && entry.gender && ((DET[left] === "m" && entry.gender === "feminine") || (DET[left] === "f" && entry.gender === "masculine"))) problems.push(`${option}: gender clashes with "${left}"`);
      if (PLURAL_DET.has(left) && !/[sx]$/.test(option)) problems.push(`${option}: singular after "${left}"`);
    } else if (PRON[left]) {
      if (!hasWordClass(entry.partOfSpeech, "verb")) problems.push(`${option}: not a verb after "${left}"`);
      if (option === (entry.lemma ?? "").toLowerCase()) problems.push(`${option}: infinitive after "${left}"`);
      const person = PRON[left];
      if (person === "3pl" && !/(ent|ont)$/.test(option)) problems.push(`${option}: not 3rd plural`);
      if (person === "3sg" && /ent$/.test(option) && !/(enir|entir)$/.test(entry.lemma ?? "")) problems.push(`${option}: plural form after "${left}"`);
      if (person === "1pl" && !/ons$/.test(option)) problems.push(`${option}: not nous form`);
      if (person === "2pl" && !/ez$/.test(option)) problems.push(`${option}: not vous form`);
    }
  }
  // The clue must be the answer's own, word-level meaning in this sentence.
  // Resolve the token at the blank, not the first word spelled like the answer.
  const sentence = allSentencesInText({ body: c.prompt.replace("___", c.answer) })[0];
  const blankAt = c.prompt.indexOf("___");
  let offset = 0;
  let index = -1;
  sentence.tokens.forEach((token, i) => {
    if (index === -1 && token.isWord && offset >= blankAt && token.text === c.answer) index = i;
    offset += token.text.length;
  });
  const meaning = resolveMeaning({ tokens: sentence.tokens, tokenIndex: index, contextSentence: sentence.text });
  if (meaning.partOfExpression) problems.push(`clue taken from the expression "${meaning.partOfExpression}"`);
  if (/^(fait|faisait)$/.test(left)) problems.push("weather/idiom slot");
  return problems;
}

await t.section("Corpus sample", async () => {
  const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const sample = [];
  for (const level of LEVELS) sample.push(...starterTexts.filter((text) => text.difficulty === level).filter((_, i) => i % 4 === 0).slice(0, 25));
  for (const level of LEVELS) {
    const first = getNextTextForReader({ selectedLevel: level });
    const text = first && getJourneyText(first.textId);
    if (text && !sample.includes(text)) sample.push(text);
  }
  sample.push(...publicDomainTexts.filter((_, i) => i % 40 === 0));
  let items = 0;
  const failures = [];
  for (const text of sample) {
    for (const c of clozesForText(text)) {
      items++;
      const problems = audit(c);
      if (problems.length) failures.push(`${text.id}: ${c.prompt.slice(0, 70)} [${c.answer}: ${c.options.join("/")}] ${problems.join("; ")}`);
    }
  }
  console.log(`   sampled ${sample.length} readings, ${items} cloze items`);
  t.check("the sample covers every level, the first readings and classics", sample.length >= 150);
  t.check("every sampled cloze passes the independent checks", failures.length === 0, `${failures.length} — ${failures.slice(0, 4).join(" || ")}`);
  t.check("clozes are still produced across the sample", items > 200, String(items));
});

t.finish();
