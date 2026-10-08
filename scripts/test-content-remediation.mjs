/**
 * Teaching correctness: what Sorlio teaches confidently must be dependable,
 * and where it cannot be, Sorlio abstains. Covers the October 2026 content
 * audit: honest news difficulty, fail-closed examples, provenance-free gist
 * questions, no inferred tone scoring, conservative grammar notes, fair cloze,
 * targeted French/translation fixes, CEFR relabels, a finite Review default,
 * and that stale generated content cannot survive the upgrade.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

const t = createRunner("content remediation");
const control = createStorage();
installWindow(control);
control.storage.setItem("sorlio.storage.schema", "2");

const { __resetLocalStoreForTests, localStore } = await import("../src/lib/localData/store.ts");
__resetLocalStoreForTests(null);
const { ensureGeneratedDictionary, lookupWord } = await import("../src/lib/dictionary/lookup.ts");
await ensureGeneratedDictionary();

const { editorialLevel, isLevelUnrated, levelFit, recordedLevel, UNRATED_RECORD_LEVEL } = await import("../src/lib/readingLevel.ts");
const { rssReadingTextToReadingText, settleFeedLevel } = await import("../src/lib/rss/adaptReadingText.ts");
const { bankTextToRssReadingText } = await import("../src/lib/rss/candidatePool.ts");
const { scoreArticle } = await import("../src/lib/recommendation/score.ts");
const { buildScoringContext } = await import("../src/lib/recommendation/context.ts");
const { buildScorableArticles } = await import("../src/lib/recommendation/build.ts");
const { hasWordClass } = await import("../src/lib/dictionary/partOfSpeech.ts");
const exampleModule = await import("../src/lib/dictionary/exampleGenerator.ts");
const { isRetiredTemplateExample, learnerExample } = exampleModule;
const storage = await import("../src/lib/storage.ts");
const { buildGistQuestion } = await import("../src/lib/comprehension.ts");
const { buildComprehensionQuestionBundle, getOrCreateComprehensionQuestionBundle } = await import("../src/lib/comprehensionCache.ts");
const { isMetadataOnlyBlurb } = await import("../src/lib/readingSummaries.ts");
const { buildGrammarNotes } = await import("../src/lib/practice/grammarNotes.ts");
const { buildContextualTranslation } = await import("../src/lib/dictionary/contextualTranslation.ts");
const { tokenizeParagraphsToSentences } = await import("../src/lib/words.ts");
const { allSentencesInText } = await import("../src/lib/practice/textSentences.ts");
const { buildWordCloze, distractorPoolFromBody } = await import("../src/lib/practice/cloze.ts");
const { starterTexts } = await import("../src/data/starterTexts.ts");
const { publicDomainTexts } = await import("../src/data/publicDomainTexts.ts");
const { texts, getTextById } = await import("../src/data/texts.ts");
const { LEVEL_RELABELS } = await import("../src/data/levelRelabels.ts");
const { buildLadder, getLadderText } = await import("../src/lib/journey/ladder.ts");
const { JOURNEY_SECTIONS } = await import("../src/lib/journey/sections.ts");
const { getNextTextForReader } = await import("../src/lib/journey/state.ts");
const { getJourneyText } = await import("../src/lib/journey/ladder.ts");
const { DEFAULT_REVIEW_PREFERENCES, getReviewPreferences } = await import("../src/lib/reviewPreferences.ts");
const { buildReviewQueue, defaultSpacedRepetitionFields } = await import("../src/lib/spacedRepetition.ts");

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const code = (path) => read(path).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function rssDto(overrides = {}) {
  return {
    id: "rss-lemonde-abc",
    title: "La ville teste les transports gratuits",
    category: "news-style",
    difficulty: null,
    readingTimeMinutes: 3,
    language: "fr",
    originalText: "La ville teste les transports gratuits.\n\nLes habitants sont partagés.",
    sourceName: "Le Monde",
    sourceUrl: "https://example.org/a",
    publishedAt: new Date().toISOString(),
    retrievedAt: new Date().toISOString(),
    sourceId: "lemonde",
    sourceSiteUrl: null,
    attributionText: null,
    reuseBasis: null,
    reuseTermsUrl: null,
    reuseTermsCheckedAt: null,
    materialModifications: "",
    blurbEn: null,
    isShortSnippet: false,
    ...overrides,
  };
}

await t.section("News difficulty is honest (1-5)", async () => {
  const conversion = code("src/lib/rss/rssToReadingText.ts");
  t.check("1. live RSS is no longer assigned B1: the feed converter sets no level", /difficulty: null,/.test(conversion) && !/difficulty: "B1"/.test(conversion));
  const news = rssReadingTextToReadingText(rssDto());
  t.check("1. a live article reaches the app unrated, with no level to show", news.levelUnrated === true && isLevelUnrated(news) && editorialLevel(news) === null);
  const oldCached = settleFeedLevel({ ...news, levelUnrated: undefined, difficulty: "B1" });
  t.check("1. news cached by an older build (blanket B1, no flag) is read as unrated", editorialLevel(oldCached) === null);

  const a1 = starterTexts.find((text) => text.difficulty === "A1");
  const fallback = rssReadingTextToReadingText(bankTextToRssReadingText(a1, Date.now()));
  t.check("2. a bundled reading served as fallback keeps its own level", editorialLevel(fallback) === "A1", fallback.difficulty);
  const oldFallback = settleFeedLevel({ ...fallback, difficulty: "B1", levelUnrated: undefined });
  t.check("2. a fallback reading cached with the old blanket B1 gets its real level back", editorialLevel(oldFallback) === "A1");

  const card = code("src/components/ReadingCard.tsx");
  t.check("3/4. the card shows a level only from editorialLevel, and 'News' otherwise", /const level = editorialLevel\(text\)/.test(card) && /\{level \?\? "News"\} · \{text\.minutes\} min/.test(card));
  t.check("3/4. the content estimator never supplies a level or fit on the card", !/difficulty\.cefr|difficulty\.label|FIT_LABELS|text\.difficulty/.test(card));
  t.check("3. fit compares assigned levels only", levelFit("B1", "B1") === "Good fit" && levelFit("A2", "B1") === "Easier" && levelFit("B2", "B1") === "Challenging" && levelFit("C1", "B1") === "Hard");
  const header = code("src/components/Reader.tsx");
  t.check("4. the reader header, completion row and history follow the same rule", /\{editorialLevel\(text\) \?\? "News"\} - \{text\.minutes\} min/.test(header) && /level=\{editorialLevel\(text\)\}/.test(header) && /cefr: editorialLevel\(text\)/.test(header));
  t.check("4. 'For you, this one looks easy' (from the estimator) is gone", !/For you, this one looks/.test(header));

  const [scoredNews, scoredA2] = buildScorableArticles([news, starterTexts.find((text) => text.difficulty === "A2")], new Set());
  const forLevel = (level) => ({ ...buildScoringContext(), userLevelNumeric: LEVELS.indexOf(level) + 1 });
  const newsMatches = LEVELS.map((level) => scoreArticle(scoredNews, forLevel(level)).difficultyMatch);
  t.check("5. an unrated article scores the same level match for every reader (no hidden B1)", new Set(newsMatches).size === 1, newsMatches.join(","));
  t.check("5. a levelled reading matches best at its own level", scoreArticle(scoredA2, forLevel("A2")).difficultyMatch === 1 && scoreArticle(scoredA2, forLevel("C1")).difficultyMatch < 1);
  const browser = code("src/components/ArticleBrowserPage.tsx");
  t.check("5. a level filter never matches an unrated article", /editorialLevel\(article\.text\) !== difficultyFilter/.test(browser));
  t.check("5. history records 'unrated', not a level, for news", recordedLevel(news) === UNRATED_RECORD_LEVEL && recordedLevel(a1) === "A1");
});

await t.section("Examples fail closed (6-11)", async () => {
  t.check("6. 'adverb' is not the word class 'verb'", !hasWordClass("adverb", "verb") && !hasWordClass("adverb phrase", "verb") && !hasWordClass("adverbial pronoun", "verb") && hasWordClass("verb (infinitive)", "verb") && hasWordClass("adverb", "adverb"));
  t.check("6. no example generator remains", exampleModule.generateFallbackExample === undefined);
  const TEMPLATE = /^(J'aime|C'est très|Je vois (?:un|une|les)|On utilise «)/;
  const cases = [
    ["hier", "Hier, il a plu toute la journée."],
    ["vite", "Elle marche vite pour attraper le bus."],
    ["souvent", "Nous allons souvent au marché."],
    ["toujours", "Il arrive toujours en retard."],
    ["maison", "La maison est au bout de la rue."],
    ["rouge", "Elle porte une robe rouge."],
    ["prendre", "Il faut prendre le train de huit heures."],
    ["dormir", "Les enfants vont dormir tôt."],
    ["se souvenir", "Je voudrais me souvenir de ce jour."],
  ];
  for (const [word, sentence] of cases) {
    const lookup = lookupWord(word);
    const withContext = learnerExample({ curated: lookup.examples[0] ?? null, contextSentence: sentence, sentenceTranslation: null });
    const bare = learnerExample({ curated: lookup.examples[0] ?? null });
    const ok =
      !TEMPLATE.test(withContext.fr) &&
      !TEMPLATE.test(bare.fr) &&
      (withContext.fr === sentence || withContext.fr === lookup.examples[0]?.fr) &&
      (bare.fr === "" || bare.fr === lookup.examples[0]?.fr);
    t.check(`7-10. "${word}" (${lookup.partOfSpeech ?? "?"}): the reading's sentence, a curated example or nothing`, ok, `${withContext.fr} | ${bare.fr}`);
  }
  t.check("11. no context and no curated example: no example at all", JSON.stringify(learnerExample({})) === JSON.stringify({ fr: "", en: "" }));
  t.check("11. a reading sentence is never paired with a one-word gloss", learnerExample({ contextSentence: "Hier, il pleuvait." }).en === "");

  // Data saved by older builds is cleaned on read.
  const legacy = [
    { word: "hier", exampleSentenceFr: "J'aime hier.", exampleSentenceEn: "I like to yesterday." },
    { word: "vite", exampleSentenceFr: "J'aime vite.", exampleSentenceEn: "I like to quickly." },
    { word: "souvent", exampleSentenceFr: "J'aime souvent.", exampleSentenceEn: "I like to often." },
    { word: "toujours", exampleSentenceFr: "J'aime toujours.", exampleSentenceEn: "I like to always." },
    { word: "chat", exampleSentenceFr: "Je vois un chat.", exampleSentenceEn: "I see a cat." },
  ].map((entry) => ({
    ...entry,
    lemma: entry.word,
    translations: ["x"],
    primaryTranslation: "x",
    partOfSpeech: "adverb",
    gender: null,
    cefr: null,
    frequencyRank: null,
    articleContextSentence: `Une phrase avec ${entry.word}.`,
    sourceTextTitle: "Texte",
    savedAt: "2026-09-01T00:00:00.000Z",
    reviewCount: 4,
    lastReviewedAt: "2026-09-20T00:00:00.000Z",
    status: "learning",
    missingFromDictionary: false,
    ...defaultSpacedRepetitionFields(),
    nextReviewAt: "2026-10-01T00:00:00.000Z",
  }));
  localStore.setItem("lire.savedWords.v1", JSON.stringify(legacy));
  const cleaned = storage.getSavedWords();
  t.check(
    "11/36. examples made by the old templates are dropped on read, whichever word",
    cleaned.length === legacy.length && cleaned.every((word) => !TEMPLATE.test(word.exampleSentenceFr) && !/I like to|I see a/.test(word.exampleSentenceEn)),
    cleaned.map((word) => word.exampleSentenceFr).join(" | ")
  );
  t.check(
    "37. the words themselves, their translations and Review history are untouched",
    cleaned.every((word, i) => word.word === legacy[i].word && word.reviewCount === 4 && word.nextReviewAt === "2026-10-01T00:00:00.000Z" && word.primaryTranslation === "x")
  );
  t.check("a real curated example is not mistaken for a template", !isRetiredTemplateExample("J'aime le chocolat.", "I like chocolate.", ["aimer"]));
});

await t.section("Gist questions (12-15)", async () => {
  const classic = publicDomainTexts[0];
  t.check("12. the classics' provenance line is recognised as metadata", publicDomainTexts.every((text) => isMetadataOnlyBlurb(text.blurbEn)));
  const others = starterTexts.filter((text) => text.blurbEn).slice(0, 6);
  t.check("12/13. a classic with only provenance gets no gist question", buildGistQuestion(classic, others) === null);
  t.check("13. no provenance text can become an option anywhere", buildGistQuestion(others[0], [classic, ...publicDomainTexts.slice(1, 4)]) === null);
  const withSummary = starterTexts.filter((text) => text.blurbEn && !isMetadataOnlyBlurb(text.blurbEn));
  const q = buildGistQuestion(withSummary[0], withSummary.slice(100, 140));
  t.check("14. a reading with a real summary still gets a gist question", !!q && q.choices.length >= 3 && q.choices.every((choice) => !/unabridged extract|Project Gutenberg/i.test(choice)), JSON.stringify(q));
  const positions = new Set();
  let allCorrect = true;
  for (const text of withSummary.slice(0, 40)) {
    const question = buildGistQuestion(text, withSummary.slice(200, 260));
    if (!question) continue;
    positions.add(question.answerIndex);
    if (!question.choices[question.answerIndex].startsWith(text.blurbEn.split(/[.!?]/)[0].slice(0, 20))) allCorrect = false;
    const again = buildGistQuestion(text, withSummary.slice(200, 260));
    if (again.answerIndex !== question.answerIndex) allCorrect = false;
  }
  t.check("15. the right answer is not always in the same place", positions.size >= 3, [...positions].join(","));
  t.check("15. it is still the right answer, and stable across rebuilds", allCorrect);
});

await t.section("Tone and stance (16-19)", async () => {
  const speech = { ...starterTexts[0], id: "t-speech", category: "news-style", body: "« Je suis inquiet », dit Paul. Le maire présente le budget de la ville." };
  const quoted = { ...speech, id: "t-quote", body: "Selon une habitante, « c'est une catastrophe ». Le conseil vote demain." };
  const negated = { ...speech, id: "t-neg", body: "Le projet n'est pas un succès, mais il n'est pas une crise non plus." };
  const literary = { ...publicDomainTexts.find((text) => text.category === "news-style"), id: "pd-test" };
  for (const [label, text] of [["16. character emotion", speech], ["17. quoted emotion", quoted], ["negation", negated], ["18. a literary classic filed under news", literary]]) {
    t.check(`${label}: no author-tone or stance question is scored`, buildComprehensionQuestionBundle(text, []).toneQuestions.length === 0);
  }
  t.check("19. there were no curated tone questions to keep: none exist in the reading data", !/toneQuestions|stanceAnswer/.test(read("src/data/starterTexts.ts") + read("src/data/texts.ts")));
});

await t.section("Grammar notes (20-24)", async () => {
  const notes = (text) => buildGrammarNotes([{ index: 0, text, tokens: [] }], 6);
  const titles = (text) => notes(text).map((note) => note.title);
  t.check("20. 'Nous sommes portés à…' is not called passé composé", !titles("Nous sommes portés à tenir nos convictions pour évidentes.").includes("Passé composé with être"));
  t.check("20. nor is a description ('elle est fatiguée') or a present passive ('la ville est située')", !titles("Elle est fatiguée.").length && !titles("La ville est située au bord du fleuve.").includes("Passé composé with être"));
  t.check("21. a genuine être passé composé still is", titles("Elle est partie très tôt.").includes("Passé composé with être") && titles("Il est né à Lyon.").includes("Passé composé with être"));
  t.check("22. 'se dénient mutuellement' is reciprocal, not self-action", titles("Les deux camps se dénient mutuellement le droit de parler.").includes("Reciprocal verb (each other)"));
  t.check("23. a genuine reflexive is still identified", titles("Chaque matin, il se lave avant de partir.").includes("Reflexive verb"));
  t.check("24. an ambiguous or lexical pronominal gets the broad, accurate note", titles("Je me souviens de ce jour.").includes("Pronominal verb") && titles("Ils se regardent sans rien dire.").includes("Pronominal verb"));
  t.check("24. 's'il' (si + il) is not a pronominal verb", titles("S'il pleut, nous restons.").length === 0);

  const word = (sentenceText, needle) => {
    const sentence = tokenizeParagraphsToSentences(sentenceText)[0][0];
    const index = sentence.tokens.findIndex((token) => token.isWord && token.clean === needle);
    return buildContextualTranslation({ tokens: sentence.tokens, tokenIndex: index, contextSentence: sentence.text, lookup: lookupWord(sentence.tokens[index].text) });
  };
  const portes = word("Nous sommes portés à tenir nos convictions pour évidentes.", "portés");
  t.check("20. the word card for 'portés' claims no past tense", !/passe compose|compound/.test(portes.grammar?.tense ?? ""), JSON.stringify(portes.grammar));
  const partie = word("Elle est partie très tôt.", "partie");
  t.check("21. the word card for 'partie' after 'est' is a compound past", /passe compose|compound/.test(partie.grammar?.tense ?? ""), JSON.stringify(partie.grammar));
  const belle = word("Elle est belle ce soir.", "belle");
  t.check("an adjective after être is not given a past tense", !belle.grammar?.tense, JSON.stringify(belle.grammar));
});

await t.section("Cloze (25-27)", async () => {
  let built = 0;
  let mismatched = [];
  for (const text of starterTexts.filter((_, i) => i % 9 === 0)) {
    const sentences = allSentencesInText(text);
    for (const sentence of sentences.slice(0, 4)) {
      const exercise = buildWordCloze(sentence, distractorPoolFromBody(text.body, sentence.index, sentences));
      if (!exercise) continue;
      built++;
      const profile = (w) => {
        const lookup = lookupWord(w);
        return { classes: ["noun", "verb", "adjective", "adverb"].filter((c) => hasWordClass(lookup.partOfSpeech, c)).join(), gender: lookup.gender ?? null };
      };
      const answer = profile(exercise.answer);
      for (const option of exercise.options) {
        const p = profile(option);
        if (p.classes !== answer.classes || (answer.classes === "noun" && p.gender !== answer.gender) || /['’\s]/.test(option) || /^\p{Lu}/u.test(option)) mismatched.push(`${exercise.prompt} :: ${exercise.answer} vs ${option}`);
      }
      if (!exercise.options.includes(exercise.answer) || exercise.answer.trim().includes(" ")) mismatched.push(`bad answer ${exercise.answer}`);
    }
  }
  t.check("25/26. every option shares the answer's word class (and gender for nouns); no multi-word or elided spans", mismatched.length === 0, mismatched.slice(0, 3).join(" | "));
  t.check("27. valid clozes are still generated across the corpus", built > 100, String(built));
});

await t.section("Translations and French fixes (28-29)", async () => {
  const store = {};
  const dir = new URL("../src/data/precomputed/", import.meta.url);
  for (const file of readdirSync(dir)) if (file.endsWith(".json")) Object.assign(store, JSON.parse(readFileSync(new URL(file, dir), "utf8")));
  const hash = (body) => createHash("sha256").update(body).digest("hex").slice(0, 32);
  const edited = {
    "starter-a1-035": ["Elles sont rouges, orange, jaunes et marron.", "red, orange, yellow and brown"],
    "starter-a2-153": ["Une fois le mur sec", "Once the wall was dry"],
    "starter-a1-018": ["Le trajet dure une heure.", "The journey takes an hour"],
    "starter-a2-029": ["des choses que je ne faisais plus", "things I had stopped doing"],
    "starter-a2-132": ["bien moins chère qu'une veste neuve en magasin", "much cheaper than a new one"],
    "starter-a2-070": ["à seize heures pour moi et dix heures du matin pour lui", "four in the afternoon for me and ten in the morning for him"],
    "starter-a1-074": ["Mon sac est prêt depuis hier soir.", "My bag has been ready since last night"],
    "pd-c2-694": [null, "romantic conquests at court"],
    "pd-c2-720": [null, "lawyer's office"],
    "pd-c1-558": [null, "kept his lips sealed"],
    "pd-b2-480": [null, "these letters"],
    "starter-b2-210": [null, "may have gradually weakened"],
    "pd-c1-590": [null, "Deeply moved"],
    "starter-c1-001": [null, "willingly accepted vulnerability"],
  };
  for (const [id, [french, english]] of Object.entries(edited)) {
    const text = getTextById(id);
    const entry = store[id];
    const sentences = tokenizeParagraphsToSentences(text.body).flat().map((s) => s.text);
    t.check(
      `28. ${id}: corrected, and its translation is bound to the current French`,
      (!french || text.body.includes(french)) && entry.sourceHash === hash(text.body) && entry.sentences.length === sentences.length && entry.sentences.some((s) => s.includes(english))
    );
  }
  const stale = ["Elles sont rouges, oranges", "Une fois sec, la couleur", "La route dure une heure", "des choses oubliées", "dans un magasin neuf", "quatre heures pour lui", "Hier soir, je prépare"];
  t.check("the corrected French is gone from the corpus", stale.every((phrase) => !texts.some((text) => text.body.includes(phrase))));
  const translations = JSON.stringify(store);
  t.check("the mistranslations are gone", !/had had good fortunes at court|returned to his study|stuck to his lips|these types that came|All moved, he|This consented vulnerability/.test(translations));
  t.check("29. every live text still has exactly one bound translation entry", texts.every((text) => store[text.id]?.sourceHash === hash(text.body)) && Object.keys(store).length === texts.length);
});

await t.section("CEFR relabels and the Journey (30-33)", async () => {
  for (const [id, relabel] of Object.entries(LEVEL_RELABELS)) {
    const text = getTextById(id);
    t.check(`30. ${id} resolves at ${relabel.to} (was ${relabel.from})`, !!text && text.difficulty === relabel.to);
  }
  const ladder = buildLadder();
  t.check("31. every Journey stage holds only texts of its own band", ladder.stages.every((stage) => stage.textIds.every((id) => ladder.textById.get(id).difficulty === stage.band)));
  t.check("31. sections list only texts of their band", JOURNEY_SECTIONS.every((section) => section.textIds.every((id) => !ladder.textById.get(id) || ladder.textById.get(id).difficulty === section.band)));
  for (const id of ["starter-b1-230", "starter-b2-210"]) {
    t.check(`31. ${id} now reads on the ${LEVEL_RELABELS[id].to} route`, getLadderText(id)?.band === LEVEL_RELABELS[id].to);
  }
  for (const level of LEVELS) {
    localStore.removeItem("lire.journey.v1");
    const first = getNextTextForReader({ selectedLevel: level });
    const text = first && getJourneyText(first.textId);
    t.check(`32. first reading at ${level} resolves to a ${level} text`, !!text && text.difficulty === level, text?.id);
  }
  t.check("33. ids are unchanged, so progress, saved readings and history still find relabelled texts", Object.keys(LEVEL_RELABELS).every((id) => getTextById(id)?.id === id));
  t.check("the two English-language extracts are no longer shipped", !getTextById("pd-b1-240") && !getTextById("pd-b1-250"));
});

await t.section("Review default (34-35)", async () => {
  t.check("34. a finite default session of 20", DEFAULT_REVIEW_PREFERENCES.sessionLength === 20 && getReviewPreferences().sessionLength === 20);
  const now = Date.parse("2026-10-08T12:00:00Z");
  const due = Array.from({ length: 30 }, (_, i) => ({ word: `mot${i}`, ...defaultSpacedRepetitionFields(), reviewCount: 2, status: "learning", nextReviewAt: "2026-10-01T00:00:00.000Z" }));
  const before = JSON.stringify(due);
  const queue = buildReviewQueue(due, now);
  const session = queue.slice(0, getReviewPreferences().sessionLength);
  t.check("34. capping a session changes no card's schedule", JSON.stringify(due) === before && session.length === 20);
  t.check("35. the cards beyond the cap stay due for the next session", buildReviewQueue(due.filter((w) => !session.includes(w)), now).length === 10);
  const page = code("src/app/review/page.tsx");
  t.check("35. a capped session says how many are still ready instead of 'All done'", /remainingDue > 0 \? "Session done" : "All done!"/.test(page) && /Keep going/.test(page));
});

await t.section("Cache safety (36-37)", async () => {
  const text = starterTexts.find((item) => item.blurbEn);
  localStore.setItem(
    "lire.comprehensionQuestions.v1",
    JSON.stringify([{ textId: text.id, signature: "2:0:0", version: 2, createdAt: "", updatedAt: "", source: "local", gistQuestion: { id: "g", prompt: "?", choices: ["An unabridged extract (100 words) from X"], answerIndex: 0 }, toneQuestions: [{ id: "x", kind: "stance", prompt: "?", choices: ["Sceptical"], answerIndex: 0 }] }])
  );
  const bundle = getOrCreateComprehensionQuestionBundle(text, starterTexts.filter((item) => item.blurbEn).slice(300, 340));
  t.check("36. questions cached by an older build are discarded and rebuilt", bundle.toneQuestions.length === 0 && !JSON.stringify(bundle).includes("unabridged"));
  t.check("36. grammar notes, cloze and practice plans are never stored, so they are always current", !/localStore|localStorage/.test(read("src/lib/practice/grammarNotes.ts") + read("src/lib/practice/cloze.ts") + read("src/lib/practice/session.ts")));
});

await t.section("UI from the previous pass is intact (38-45)", async () => {
  const picker = code("src/components/FirstRunOnboarding.tsx");
  t.check("38/39. two-screen onboarding opens the first reading directly", /Get started/.test(picker) && /Start first reading/.test(picker) && /router\.push\(`\/reader\//.test(picker));
  t.check("40. Lessons hero", /<NextActionHero/.test(code("src/components/JourneyMap.tsx")));
  t.check("41. You hub", /title="Library"/.test(code("src/app/settings/page.tsx")));
  t.check("42. one Start review", />\s*Start review\s*</.test(code("src/app/review/page.tsx")));
  t.check("43. completion details behind a disclosure", /Session details/.test(code("src/components/LessonCompleteScreen.tsx")));
  t.check("44. news card actions behind •••", /•••/.test(code("src/components/ReadingCard.tsx")));
  t.check("45. reading options closed by default", !/READING_HELP_SEEN_KEY/.test(read("src/components/Reader.tsx")));
});

t.finish();
