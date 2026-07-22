// Focused logic tests for the recommendation engine, difficulty estimation,
// and the full dictionary lookup chain (curated -> generated -> custom ->
// lemma-guess -> missing). Run with:
//   node scripts/test-core-logic.mjs
//
// custom.ts only activates with a real `window.localStorage`, so a minimal
// in-memory stub is installed below *before* any dictionary module is
// imported — every lookup.ts/custom.ts call checks for storage freshly, so
// import order doesn't matter, only call-time order does.
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  // preferences.ts, onboarding.ts, and interests.ts all fire a
  // window.dispatchEvent(...) after writing — a real DOM isn't needed to
  // exercise the read/write logic these tests care about, just something
  // that doesn't throw. Event/CustomEvent are real globals in modern Node.
  dispatchEvent: () => true,
};

import {
  contentQualityScore,
  difficultyMatchScore,
  freshnessScore,
  getStarRating,
  inferUserLevelNumeric,
  readingTimeScore,
  sourcePreferenceScore,
  unknownWordTargetScore,
} from "../src/lib/recommendation/signals.ts";
import { buildSections } from "../src/lib/recommendation/sections.ts";
import { buildScorableArticles } from "../src/lib/recommendation/build.ts";
import { buildScoringContext } from "../src/lib/recommendation/context.ts";
import { rankArticles } from "../src/lib/recommendation/score.ts";
import { estimateDifficulty } from "../src/lib/difficulty.ts";
import { texts as readingTexts } from "../src/data/texts.ts";
import { starterTexts } from "../src/data/starterTexts.ts";
import { publicDomainTexts } from "../src/data/publicDomainTexts.ts";
import { DAILY_BANK_ARTICLE_LIMIT, getDailyBankTexts, getDailyExtraReadingTexts } from "../src/lib/publicDomainBank.ts";
import { buildLadder, JOURNEY_BANDS, TEXTS_PER_STAGE } from "../src/lib/journey/ladder.ts";
import { getJourneyState, getNextTextForReader, STAGE_CLEAR_RATIO } from "../src/lib/journey/state.ts";
import { ensureGeneratedDictionary, lookupWord } from "../src/lib/dictionary/lookup.ts";
import { NOT_TRANSLATED_YET } from "../src/lib/dictionary/constants.ts";
import {
  buildComposedPhraseTranslationMatch,
  cacheDictionarySentenceTranslations,
  findContainingPhraseTranslationMatch,
  findPhraseTranslationMatch,
  translateParagraphsWithDictionary,
  translateSentencesWithDictionaryCache,
} from "../src/lib/dictionary/articleTranslation.ts";
import { recordDictionaryFeedback, getDictionaryFeedback } from "../src/lib/dictionary/feedback.ts";
import { getSavedPhrases, markPhraseKnown, savePhrase } from "../src/lib/phrases.ts";
import { getArticleFeedbackForText, saveArticleFeedback } from "../src/lib/articleFeedback.ts";
import { buildGistQuestion, buildToneQuestions, findRelatedArticles } from "../src/lib/comprehension.ts";
import {
  clearComprehensionQuestionCache,
  getOrCreateComprehensionQuestionBundle,
} from "../src/lib/comprehensionCache.ts";
import { buildInferenceChallenge } from "../src/lib/inference.ts";
import { rankLearningCandidates } from "../src/lib/learningCandidates.ts";
import { findPronounReference } from "../src/lib/pronounReferences.ts";
import { getWordFamily } from "../src/lib/dictionary/wordFamily.ts";
import { saveCustomDictionaryEntry } from "../src/lib/dictionary/custom.ts";
import { properNounDictionary } from "../src/data/dictionaries/proper-nouns.ts";
import { buildKnownWordBootstrapList, knownWordEstimateForLevel } from "../src/lib/knownWordBootstrap.ts";
import { clearKnownWords, getKnownWords } from "../src/lib/knownWords.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";
import { isAcceptableAsShortSnippet, isAcceptableReadingContent } from "../src/lib/rss/contentQuality.ts";
import {
  getHiddenSources,
  getPreferredSources,
  getSavedLaterIds,
  hideSource,
  isSavedForLater,
  isSourcePreferred,
  isSourceHidden,
  preferSource,
  removeFromSavedLater,
  saveForLater,
  unhideSource,
  unpreferSource,
} from "../src/lib/recommendation/preferences.ts";
import {
  getOnboardingLevelNumeric,
  getOnboardingState,
  saveOnboarding,
  skipOnboarding,
  updateSelectedReadingLevel,
} from "../src/lib/onboarding.ts";
import { getGoals } from "../src/lib/goals.ts";
import { itemTimestamp, mergeStoreValue } from "../src/lib/supabase/sync.ts";
import { clearWords, getSavedWords, saveWord } from "../src/lib/storage.ts";
import { defaultSpacedRepetitionFields } from "../src/lib/spacedRepetition.ts";
import { bandNumber, bandProgress, levelPointsForCompletion } from "../src/lib/levelScore.ts";
import { getStreakWeek } from "../src/lib/habit.ts";
import {
  buildCategoryProficiency,
  buildContextualReviewArticles,
  buildHeadlineComparison,
  buildTodayNewsWords,
  buildWeeklyReadingReport,
  classifyVocabularyStates,
} from "../src/lib/readingAnalytics.ts";
import {
  addXpEvent,
  awardCompletedMissions,
  buildAchievements,
  buildCollections,
  buildMastery,
  buildPersonalBests,
  buildProgressSnapshot,
  buildTopicProgress,
  calculateArticleScore,
  clearGamificationStores,
  currentStreak,
  getArticleCompletions,
  getDailyMissions,
  getMissionStatuses,
  getXpEvents,
  levelFromXp,
  longestStreak,
  quickChallengeForArticle,
  recordGamifiedArticleCompletion,
  recordReviewSuccessXp,
  recordSecondPassXp,
  recordWordSavedXp,
  translationBudgetForMode,
  xpNeededForLevel,
} from "../src/lib/gamification.ts";
import {
  VERB_REFERENCES,
  buildGrammarDashboard,
  clearGrammarStores,
  currentUnlockedLesson,
  getGrammarPracticeEvents,
  getGrammarProgress,
  getVerbLesson,
  getVerbLessons,
  isGrammarAnswerCorrect,
  markGrammarLessonComplete,
  practiceSetForLesson,
  questionsForLesson,
  recordGrammarAnswer,
  referenceForVerb,
  tenseLabel,
} from "../src/lib/grammar.ts";

// The broad generated dictionary is no longer bundled — it's fetched on
// demand so it stays out of every page's JavaScript (see
// src/data/dictionaries/generated/fr-en-generated.ts). These tests exercise
// the full curated -> generated -> lemma-guess chain, so load it up front;
// otherwise every generated-layer assertion below sees an empty layer.
await ensureGeneratedDictionary();

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`OK ${label}`);
  } else {
    failed++;
    console.log(`FAIL ${label}${detail ? ` - ${detail}` : ""}`);
  }
}

console.log("--- Recommendation signals ---");
{
  const freshNow = freshnessScore(new Date().toISOString());
  const fiveDaysOld = freshnessScore(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString());
  check("a just-published article scores near 1", freshNow > 0.95, `got ${freshNow}`);
  check("a 5-day-old article scores lower than a fresh one", fiveDaysOld < freshNow);
  check("an undated (hardcoded) article scores neutral", freshnessScore(undefined) === 0.5);
}
{
  check("exact CEFR match scores 1", difficultyMatchScore("B1", 3) === 1);
  const farOff = difficultyMatchScore("C1", 1); // C1=5, level 1 -> distance 4
  check("a far-off CEFR match scores 0 (floored)", farOff === 0);
}
{
  check("unknownWordRatio inside the ideal band scores 1", unknownWordTargetScore(0.4) === 1);
  const below = unknownWordTargetScore(0.1);
  const above = unknownWordTargetScore(0.9);
  check("below the ideal band tapers down", below < 1 && below > 0, `got ${below}`);
  check("far above the ideal band tapers toward 0", above < below, `below=${below} above=${above}`);
}
{
  check("a 2-minute read scores 1 (comfortable length)", readingTimeScore(2) === 1);
  const long = readingTimeScore(20);
  check("a very long read tapers down but never below the floor", long >= 0.3 && long < 1, `got ${long}`);
}
{
  const context = { interestProfile: {}, recentCategories: [], preferredSources: ["Le Test"], userLevelNumeric: 2 };
  check("preferred sources score higher than neutral sources", sourcePreferenceScore("Le Test", context) > sourcePreferenceScore("Other", context));
}
{
  check("good content quality scores 1", contentQualityScore("good") === 1);
  check("poor content quality scores lowest", contentQualityScore("poor") < contentQualityScore("usable"));
}
{
  check("a brand-new reader (0 known words) infers level 1", inferUserLevelNumeric(0) === 1);
  check("a reader with many known words infers a higher level", inferUserLevelNumeric(500) === 5);
}
{
  const perfect = getStarRating(0.35);
  const hard = getStarRating(0.95);
  check("a well-matched ratio gets 5 stars", perfect.stars === 5, JSON.stringify(perfect));
  check("a very high ratio gets the fewest stars", hard.stars === 2, JSON.stringify(hard));
  check("star count only ever runs 2-5", perfect.stars <= 5 && hard.stars >= 2);
}
{
  const makeArticle = (id, publishedAt, unknownWordRatio) => ({
    text: {
      id,
      title: id,
      category: "news-style",
      difficulty: "B1",
      minutes: 4,
      preview: "Preview",
      body: "Un court article de test avec assez de mots pour exister.",
      sourceName: id.startsWith("pd-") ? "Project Gutenberg" : "Live Feed",
      sourceUrl: id.startsWith("pd-") ? "https://www.gutenberg.org/ebooks/1" : "https://example.com/live",
      publishedAt,
      language: "fr",
    },
    difficulty: {
      cefr: "B1",
      label: "Hard",
      unknownWordRatio,
      dictionaryCoverage: 0.9,
      totalWords: 12,
      unknownWords: Math.round(unknownWordRatio * 12),
      knownWords: 12 - Math.round(unknownWordRatio * 12),
      sampleUnknownWords: [],
    },
    contentQuality: { label: "good", wordCount: 12, sentenceCount: 1, reason: "test" },
    score: {
      freshness: 1,
      difficultyMatch: 0,
      topicPreference: 0,
      sourcePreference: 0,
      unknownWordTarget: 0,
      readingTime: 1,
      contentQuality: 1,
      variety: 1,
      total: 0.5,
    },
    starRating: { stars: 2, label: "Hard" },
  });
  const sections = buildSections([
    makeArticle("pd-bank-1", "2026-07-12T12:00:00Z", 0.1),
    makeArticle("rss-hard-live-1", "2026-07-14T12:00:00Z", 0.95),
  ]);
  check("live news still shows hard RSS articles", sections.liveNews.some((article) => article.text.id === "rss-hard-live-1"));
  check("live news lead cards do not duplicate into latest news", !sections.latestNews.some((article) => article.text.id === "rss-hard-live-1"));
}

console.log("\n--- Difficulty estimation ---");
{
  const easy = estimateDifficulty("Le chat est noir. Le chien est grand. Elle est belle.");
  check("a short, simple, all-basic-word text estimates a low CEFR", ["A1", "A2"].includes(easy.cefr), easy.cefr);
  check("dictionary coverage is reported as a 0-1 fraction", easy.dictionaryCoverage >= 0 && easy.dictionaryCoverage <= 1);
}
{
  const empty = estimateDifficulty("");
  check("an empty text doesn't throw and returns a valid estimate", typeof empty.cefr === "string");
}
{
  // "zzznonexistentwordzzz" can't be in any dictionary layer — every
  // occurrence should count as unknown regardless of known-words state.
  const gibberish = estimateDifficulty("Zzznonexistentwordzzz zzzanotherfakewordzzz zzzthirdfakewordzzz.");
  check("text made entirely of unknown words has a high unknown ratio", gibberish.unknownWordRatio > 0.5, gibberish.unknownWordRatio);
}
{
  const withNames = estimateDifficulty("Paris et Emmanuel Macron parlent à Londres. Le chat mange une pomme.");
  check("proper nouns do not inflate unknown-word difficulty", withNames.unknownWordRatio < 0.35, JSON.stringify(withNames));
}

console.log("\n--- Public-domain reading bank ---");
{
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  check("public-domain bank has at least 700 excerpts", publicDomainTexts.length >= 700, `${publicDomainTexts.length}`);
  check("public-domain bank covers A1 through C2", levels.every((level) => publicDomainTexts.some((text) => text.difficulty === level)));
  check("public-domain excerpts keep Project Gutenberg source URLs", publicDomainTexts.every((text) => text.sourceUrl?.startsWith("https://www.gutenberg.org/ebooks/")));
  check("public-domain ids are unique", new Set(publicDomainTexts.map((text) => text.id)).size === publicDomainTexts.length);
  const dailyB1 = getDailyBankTexts({ level: "B1", limit: 8, date: new Date("2026-07-14T12:00:00Z") });
  const dailyB1Repeat = getDailyBankTexts({ level: "B1", limit: 8, date: new Date("2026-07-14T12:00:00Z") });
  const generatedExcerptSuffix = /:\s*extrait\s+\d+$/i;
  check("daily bank returns eight stable level-matched picks", dailyB1.length === 8 && dailyB1.map((text) => text.id).join(",") === dailyB1Repeat.map((text) => text.id).join(","));
  check("daily bank favours the selected CEFR level first", dailyB1.every((text) => ["B1", "A2", "B2", "A1", "C1"].includes(text.difficulty)));
  // Regression: the browser applies a strict per-level filter on top of the
  // bank result, so an explicit level must actually surface texts AT that
  // level. The starter set is A1/A2 only; a bug once floated those above every
  // B1/B2 text, so choosing B1 or B2 returned an empty list. Guard each level.
  for (const requestedLevel of ["A1", "A2", "B1", "B2"]) {
    const picks = getDailyBankTexts({ level: requestedLevel, limit: 24, date: new Date("2026-07-14T12:00:00Z") });
    const exactLevel = picks.filter((text) => text.difficulty === requestedLevel);
    check(
      `daily bank surfaces texts at exactly ${requestedLevel} when it is selected`,
      exactLevel.length > 0,
      `bank returned ${picks.map((text) => text.difficulty).join(",")}`
    );
  }
  const extraA1 = getDailyExtraReadingTexts({ level: "A1", limit: 8, date: new Date("2026-07-14T12:00:00Z") });
  check("extra reading bank excludes guided starter texts", extraA1.length > 0 && extraA1.every((text) => text.id.startsWith("pd-")));

  const ladder = buildLadder();
  const guidedStarterTexts = starterTexts.filter((text) => JOURNEY_BANDS.includes(text.difficulty));
  check("journey ladder contains the guided starter set", ladder.texts.length === guidedStarterTexts.length);
  check(
    "journey stages group at most five texts",
    ladder.stages.every((stage) => stage.textIds.length > 0 && stage.textIds.length <= TEXTS_PER_STAGE)
  );
  check(
    "journey ladder order is deterministic inside each band",
    JOURNEY_BANDS.every((band) => {
      const entries = ladder.texts.filter((text) => text.band === band);
      return entries.every((entry, index) => index === 0 || entry.intrinsicDifficulty >= entries[index - 1].intrinsicDifficulty);
    })
  );

  const a2StartStage = ladder.stages.find((stage) => stage.band === "A2");
  const a2State = getJourneyState({ selectedLevel: "A2", progressById: {}, skippedTextIds: [] });
  check(
    "placement starts at the first stage for the selected band",
    !!a2StartStage &&
      a2State.currentStageIndex === a2StartStage.globalIndex &&
      a2State.stages.filter((stage) => stage.stage.band === "A1").every((stage) => stage.optional && stage.status === "cleared")
  );

  const firstA1Stage = ladder.stages.find((stage) => stage.band === "A1");
  const clearTarget = firstA1Stage ? Math.ceil(firstA1Stage.textIds.length * STAGE_CLEAR_RATIO) : 0;
  const almostClearProgress = Object.fromEntries(
    (firstA1Stage?.textIds.slice(0, Math.max(0, clearTarget - 1)) ?? []).map((id) => [id, { status: "completed" }])
  );
  const clearProgress = Object.fromEntries((firstA1Stage?.textIds.slice(0, clearTarget) ?? []).map((id) => [id, { status: "completed" }]));
  const almostClearState = getJourneyState({ selectedLevel: "A1", progressById: almostClearProgress, skippedTextIds: [] });
  const clearState = getJourneyState({ selectedLevel: "A1", progressById: clearProgress, skippedTextIds: [] });
  check(
    "stage stays current before the clear threshold",
    !!firstA1Stage && almostClearState.stages.find((stage) => stage.stage.globalIndex === firstA1Stage.globalIndex)?.status === "current"
  );
  check(
    "stage clears at the configured threshold from progress alone",
    !!firstA1Stage &&
      clearState.stages.find((stage) => stage.stage.globalIndex === firstA1Stage.globalIndex)?.status === "cleared" &&
      clearState.currentStageIndex !== firstA1Stage.globalIndex
  );
  const skippedStageState = firstA1Stage
    ? getJourneyState({
        selectedLevel: "A1",
        progressById: {},
        skippedTextIds: firstA1Stage.textIds,
      })
    : null;
  check(
    "skipped texts do not block a stage",
    !!firstA1Stage && skippedStageState?.stages.find((stage) => stage.stage.globalIndex === firstA1Stage.globalIndex)?.status === "cleared"
  );
  const nextRecommendation = getNextTextForReader({
    selectedLevel: "A2",
    progressById: {},
    skippedTextIds: [],
    knownWords: new Set(),
    feedbackByTextId: {},
  });
  check(
    "adaptive selector chooses an unfinished text from the current stage",
    !!nextRecommendation &&
      !!a2StartStage &&
      nextRecommendation.stageIndex === a2StartStage.globalIndex &&
      a2StartStage.textIds.includes(nextRecommendation.textId) &&
      nextRecommendation.reason.length > 0
  );
  // Per-level completion score (drives the lesson-complete bar).
  check("finishing a fresh lesson awards a base of 5", levelPointsForCompletion({ savedWords: 0, wordsTapped: 0, comprehensionCorrect: 0, comprehensionTotal: 0, alreadyCompleted: false }) === 5);
  check("saved words and taps add on top, capped", levelPointsForCompletion({ savedWords: 10, wordsTapped: 4, comprehensionCorrect: 0, comprehensionTotal: 0, alreadyCompleted: false }) === 9, "5 + min(3,10) + 1");
  check("a perfect comprehension check adds a bonus", levelPointsForCompletion({ savedWords: 0, wordsTapped: 0, comprehensionCorrect: 2, comprehensionTotal: 2, alreadyCompleted: false }) === 7);
  check("re-reading a finished lesson awards nothing", levelPointsForCompletion({ savedWords: 5, wordsTapped: 5, comprehensionCorrect: 2, comprehensionTotal: 2, alreadyCompleted: true }) === 0);
  check("band maths wrap at 100", bandProgress(120) === 0.2 && bandNumber(120) === 2 && bandProgress(0) === 0 && bandNumber(0) === 1);
  // Streak week strip (Monday-first, exactly one "today", days after today are future).
  const week = getStreakWeek(new Date("2026-02-04T12:00:00Z")); // a Wednesday
  const todayIndex = week.findIndex((d) => d.isToday);
  check("streak week has seven Monday-first days", week.length === 7 && week.map((d) => d.weekdayLabel).join("") === "MTWTFSS");
  check("streak week marks exactly one day as today", week.filter((d) => d.isToday).length === 1);
  check("streak week flags days after today as future, earlier days as past", week.every((d, i) => d.isFuture === i > todayIndex));
  check("daily bank strips generated extrait numbers from titles", dailyB1.every((text) => !generatedExcerptSuffix.test(text.title)), dailyB1.map((text) => text.title).join(" | "));
  check(
    "exported public-domain articles strip generated extrait numbers from titles",
    readingTexts.filter((text) => text.id.startsWith("pd-")).every((text) => !generatedExcerptSuffix.test(text.title))
  );
  const articleTabDaily = getDailyExtraReadingTexts({
    level: "A2",
    category: "all",
    limit: DAILY_BANK_ARTICLE_LIMIT,
    date: new Date("2026-07-16T12:00:00Z"),
  });
  const articleTabSections = buildSections(
    rankArticles(buildScorableArticles(articleTabDaily, new Set()), buildScoringContext(new Date("2026-07-16T12:00:00Z")))
  );
  const expectedDailyIds = new Set(articleTabDaily.map((text) => text.id));
  check(
    "article tab daily section stays within the selected daily bank",
    articleTabSections.dailyBank.length === articleTabDaily.length &&
      articleTabSections.dailyBank.every((article) => expectedDailyIds.has(article.text.id)),
    articleTabSections.dailyBank.map((article) => article.text.id).join(",")
  );
  const dailyBankSample = getDailyBankTexts({
    level: "A2",
    limit: 1,
    date: new Date("2026-07-16T12:00:00Z"),
  })[0];
  check(
    "daily bank strips metadata-only public-domain blurbs",
    !dailyBankSample.blurbEn || !/word reading practice|public-domain french excerpt/i.test(dailyBankSample.blurbEn),
    dailyBankSample.blurbEn ?? ""
  );
}

console.log("\n--- Dictionary lookup chain ---");
{
  const result = lookupWord("bonjour");
  check("a common curated word resolves via the curated layer", result.source === "local" && result.translations.length > 0);
}
{
  const result = lookupWord("zzzznotarealfrenchwordzzzz");
  check("a nonsense word is reported missing", result.source === "missing");
  check("a missing word has no translations", result.translations.length === 0);
}
{
  const cases = [
    ["eût", "avoir"],
    ["fût", "être"],
    ["soyez", "être"],
    ["fussiez", "être"],
    ["eussiez", "avoir"],
    ["aurions", "avoir"],
    ["ayons", "avoir"],
    ["dût", "devoir"],
    ["fît", "faire"],
    ["sût", "savoir"],
    ["connût", "connaître"],
  ];
  for (const [word, lemma] of cases) {
    const result = lookupWord(word);
    check(
      `literary/core verb form '${word}' resolves to ${lemma}`,
      result.source === "local" && result.lemma === lemma && result.translations.length > 0,
      JSON.stringify(result)
    );
  }
}
{
  const cases = [
    ["accoudé", "accouder"],
    ["affaibli", "affaiblir"],
    ["atteignit", "atteindre"],
    ["buvaient", "boire"],
    ["découvrant", "découvrir"],
    ["gisaient", "gésir"],
    ["représentât", "représenter"],
    ["suivirent", "suivre"],
  ];
  for (const [word, lemma] of cases) {
    const result = lookupWord(word);
    check(
      `public-domain coverage form '${word}' resolves to ${lemma}`,
      result.source === "local" && result.lemma === lemma && result.translations.length > 0,
      JSON.stringify(result)
    );
  }
}
{
  // Round-trips through the same custom.ts flow Reader.tsx uses when an AI
  // backfill is saved — a fabricated word that isn't in any real
  // dictionary layer, so a hit here can only have come from the custom one.
  const fakeWord = "flouzeboupidon";
  const before = lookupWord(fakeWord);
  check("the fabricated test word starts out missing", before.source === "missing");

  saveCustomDictionaryEntry({
    lemma: fakeWord,
    translations: ["made-up test word"],
    partOfSpeech: "noun",
  });
  const after = lookupWord(fakeWord);
  check("after saving a custom entry, the same word resolves", after.source === "local");
  check("the custom entry's translation comes through", after.translations.includes("made-up test word"));
}
{
  // guessLemmas fallback path — a conjugated form not explicitly listed as
  // a `forms[]` entry anywhere, but guessable via the regular -er pattern.
  const result = lookupWord("mangerait");
  check("an unlisted conditional form resolves via lemma-guessing", result.source === "local", JSON.stringify(result));
}
{
  const result = lookupWord("vendrait");
  check("an unlisted -dre conditional resolves via lemma-guessing", result.lemma === "vendre", JSON.stringify(result));
}
{
  const result = lookupWord("lira");
  check("an unlisted -re future resolves via lemma-guessing", result.lemma === "lire", JSON.stringify(result));
}
{
  const result = lookupWord("s'appelle");
  check("an elided pronominal form resolves after the apostrophe", result.lemma === "appeler", JSON.stringify(result));
}
{
  // e -> è stem change (acheter family) — "achète" doesn't round-trip
  // through the plain suffix table, since the real infinitive's stem
  // spelling ("achet") differs from the conjugated stem ("achèt").
  const result = lookupWord("achète");
  check("an e/è stem-changing verb resolves via the spelling-variant guess", result.lemma === "acheter", JSON.stringify(result));
}
{
  // é -> è stem change (préférer family).
  const result = lookupWord("préfère");
  check("an é/è stem-changing verb resolves via the spelling-variant guess", result.lemma === "préférer", JSON.stringify(result));
}
{
  // Doubled-consonant stem change (appeler/jeter family).
  const result = lookupWord("appelle");
  check("a doubled-consonant stem-changing verb resolves via the spelling-variant guess", result.lemma === "appeler", JSON.stringify(result));
}
{
  const result = lookupWord("jette");
  check("jeter's doubled-t stem resolves via the spelling-variant guess", result.lemma === "jeter", JSON.stringify(result));
}
{
  // y/i alternation (payer/envoyer family).
  const result = lookupWord("paie");
  check("a y/i stem-changing verb resolves via the spelling-variant guess", result.lemma === "payer", JSON.stringify(result));
}
{
  // ç/c restoration (commencer family) — imperfect form.
  const result = lookupWord("commençait");
  check("a ç-spelling verb's imperfect resolves via the spelling-variant guess", result.lemma === "commencer", JSON.stringify(result));
}
{
  // Compound of an irregular base verb via prefix-stripping (venir family).
  const result = lookupWord("revient");
  check("a prefixed irregular-verb compound resolves via stripKnownPrefix", result.lemma === "revenir", JSON.stringify(result));
}
{
  const result = lookupWord("deviendra");
  check("another venir compound (devenir) resolves via stripKnownPrefix", result.lemma === "devenir", JSON.stringify(result));
}
{
  const result = lookupWord("retiendra");
  check("a tenir compound (retenir) resolves via stripKnownPrefix", result.lemma === "retenir", JSON.stringify(result));
}
{
  // A newly-added base irregular verb, unrelated to any compound.
  const result = lookupWord("connaissait");
  check("connaître's imperfect resolves via the expanded irregular table", result.lemma === "connaître", JSON.stringify(result));
}

console.log("\n--- Fixed-phrase lookup context (à travers / de travers / en travers) ---");
{
  // Root cause of a real reported bug: "travers" tapped alone used to
  // resolve to WikDict's one narrow standalone sense ("ribs" — a butchery
  // cut), since that's genuinely the only entry the source data has for
  // the bare noun. Curated now, but still worth locking in the sensible
  // standalone meaning as a regression test.
  const bare = lookupWord("travers");
  check("a bare 'travers' (no context) no longer resolves to the butchery sense", !bare.translations.includes("ribs"), JSON.stringify(bare));
}
{
  const result = lookupWord("travers", { previousWord: "à" });
  check("'travers' preceded by 'à' resolves to the phrase à travers (through/across)", result.lemma === "à travers" && result.translations.includes("through"), JSON.stringify(result));
}
{
  const result = lookupWord("travers", { previousWord: "de" });
  check("'travers' preceded by 'de' resolves to the phrase de travers (askew)", result.lemma === "de travers", JSON.stringify(result));
}
{
  const result = lookupWord("travers", { previousWord: "en" });
  check("'travers' preceded by 'en' resolves to the phrase en travers (crosswise)", result.lemma === "en travers", JSON.stringify(result));
}
{
  // "donc chat zut" isn't a phrase in any dictionary layer, so this should
  // fall straight through to the plain single-word lookup unaffected.
  const withoutContext = lookupWord("chat");
  const withContext = lookupWord("chat", { previousWord: "donc", nextWord: "zut" });
  check(
    "an ordinary word with no matching adjacent phrase is unaffected by context",
    withContext.lemma === withoutContext.lemma && withContext.translations.join() === withoutContext.translations.join(),
    JSON.stringify({ withoutContext, withContext })
  );
}

console.log("\n--- Idiom/phrase dictionary batch ---");
{
  const sentence = tokenizeParagraphsToSentences("Le gouvernement veut mettre fin à la crise sur fond de tensions.")[0][0];
  const mettreIndex = sentence.tokens.findIndex((token) => token.clean === "fin");
  const match = findContainingPhraseTranslationMatch(sentence.tokens, mettreIndex);
  check(
    "long-press phrase lookup finds the whole local phrase around a held middle word",
    match?.lemma === "mettre fin à" && match.translation === "to put an end to",
    JSON.stringify(match)
  );
}
{
  const sentence = tokenizeParagraphsToSentences("Le débat continue sur fond de tensions sociales.")[0][0];
  const heldIndex = sentence.tokens.findIndex((token) => token.clean === "fond");
  const match = findContainingPhraseTranslationMatch(sentence.tokens, heldIndex);
  check(
    "long-press phrase lookup resolves news framing phrases from the middle token",
    match?.lemma === "sur fond de" && match.translation === "against a backdrop of",
    JSON.stringify(match)
  );
}
{
  const sentence = tokenizeParagraphsToSentences("La petite ville reste calme.")[0][0];
  const heldIndex = sentence.tokens.findIndex((token) => token.clean === "ville");
  const match = buildComposedPhraseTranslationMatch(sentence.tokens, heldIndex);
  check(
    "long-press phrase lookup has an offline composed fallback before AI",
    match?.source === "composed" && match.translation.includes("small") && match.translation.includes("city"),
    JSON.stringify(match)
  );
}
{
  // Reflexive verbs whose meaning genuinely diverges from the plain verb —
  // the same class of bug as the "travers" fix, just for a whole family of
  // very common pronominal verbs.
  const cases = [
    ["s'agit", {}, "s'agir"],
    ["rend", { previousWord: "se", nextWord: "compte" }, "se rendre compte"],
    ["rend", { previousWord: "se" }, "se rendre"],
    ["passe", { previousWord: "se" }, "se passer"],
    ["passe", { previousWord: "se", nextWord: "de" }, "se passer de"],
    ["trouve", { previousWord: "se" }, "se trouver"],
    ["demande", { previousWord: "se" }, "se demander"],
    ["sens", { previousWord: "me" }, "se sentir"],
    ["trompe", { previousWord: "se" }, "se tromper"],
    ["souviens", { previousWord: "me" }, "se souvenir"],
    // "s'aperçoit"/"s'occupe"/"s'ennuient" tokenize as one apostrophe-joined
    // token (like "s'agit" above), so these resolve directly via a forms
    // match with no adjacent-word context needed at all.
    ["s'aperçoit", {}, "s'apercevoir"],
    ["s'occupe", {}, "s'occuper"],
    ["s'ennuient", {}, "s'ennuyer"],
    ["moque", { previousWord: "se" }, "se moquer"],
    ["débrouille", { previousWord: "se" }, "se débrouiller"],
    ["déroule", { previousWord: "se" }, "se dérouler"],
  ];
  for (const [word, ctx, expectedLemma] of cases) {
    const result = lookupWord(word, ctx);
    check(`'${word}' with context ${JSON.stringify(ctx)} resolves to ${expectedLemma}`, result.lemma === expectedLemma, JSON.stringify(result));
  }
}
{
  // avoir/faire/être idioms — the base verb is basic, but the whole phrase
  // means something a literal, word-by-word reading would never guess.
  const cases = [
    ["lieu", { previousWord: "a" }, "avoir lieu"],
    ["l'air", { previousWord: "a" }, "avoir l'air"],
    ["besoin", { previousWord: "ai", nextWord: "de" }, "avoir besoin de"],
    ["beau", { previousWord: "a" }, "avoir beau"],
    ["mal", { previousWord: "du", nextWord: "à" }, "avoir du mal à"],
    ["marre", { previousWord: "ai", nextWord: "de" }, "en avoir marre"],
    ["semblant", { previousWord: "fait", nextWord: "de" }, "faire semblant de"],
    ["mieux", { previousWord: "son" }, "faire de son mieux"],
    ["train", { previousWord: "en", nextWord: "de" }, "être en train de"],
    ["mesure", { previousWord: "en", nextWord: "de" }, "être en mesure de"],
    ["y", { previousWord: "il", nextWord: "a" }, "il y a"],
    ["vaut", { previousWord: "il", nextWord: "mieux" }, "il vaut mieux"],
  ];
  for (const [word, ctx, expectedLemma] of cases) {
    const result = lookupWord(word, ctx);
    check(`'${word}' with context ${JSON.stringify(ctx)} resolves to ${expectedLemma}`, result.lemma === expectedLemma, JSON.stringify(result));
  }
}
{
  // Common connector/adverb phrases and the "coup" family, including the
  // 3-word-beats-2-word disambiguation between "à coup sûr" and "tout à coup".
  const cases = [
    ["vient", { nextWord: "de" }, "venir de"],
    ["coup", { previousWord: "du" }, "du coup"],
    ["coup", { previousWord: "à" }, "tout à coup"],
    ["coup", { previousWord: "à", nextWord: "sûr" }, "à coup sûr"],
    ["coup", {}, "coup"],
    ["place", { previousWord: "en" }, "mettre en place"],
    ["œuvre", { previousWord: "en" }, "mettre en œuvre"],
    ["compte", { previousWord: "tient", nextWord: "de" }, "tenir compte de"],
  ];
  for (const [word, ctx, expectedLemma] of cases) {
    const result = lookupWord(word, ctx);
    check(`'${word}' with context ${JSON.stringify(ctx)} resolves to ${expectedLemma}`, result.lemma === expectedLemma, JSON.stringify(result));
  }
  // "coup" alone (no phrase context) must not be swallowed by any of the
  // "coup de ..." idioms it's curated alongside — it should show its own
  // real, correct standalone sense.
  const bareCoup = lookupWord("coup");
  check("bare 'coup' keeps its own standalone translation", bareCoup.translations.includes("blow"), JSON.stringify(bareCoup));
}
{
  // Found via scripts/lint-dictionary.mjs's triage pass — same shape of bug
  // as "travers": the generated dictionary's one WikDict sense was too
  // narrow/literal for how the word is actually used.
  const issu = lookupWord("issu");
  check("'issu' resolves to its common 'descended from' sense, not just 'issued'", issu.translations.includes("descended from"), JSON.stringify(issu));
  const muni = lookupWord("munie");
  check("'muni' (as 'munie') resolves to 'equipped with'", muni.lemma === "muni" && muni.translations.includes("equipped with"), JSON.stringify(muni));
  const imposees = lookupWord("imposées");
  check("'imposé' (as 'imposées') resolves to 'imposed', not just 'taxed'", imposees.lemma === "imposé" && imposees.translations.includes("imposed"), JSON.stringify(imposees));
  const voila = lookupWord("voilà");
  check("'voilà' is A1, not the generated dictionary's C2", voila.cefr === "A1", JSON.stringify(voila));
  const voute = lookupWord("voûté");
  check("'voûté' includes the common 'stooped' sense, not just 'vaulted'", voute.translations.includes("stooped"), JSON.stringify(voute));
  const vetu = lookupWord("vêtu");
  check("'vêtu' resolves to 'dressed', not the accent-stripped non-word 'vetu'", vetu.translations.includes("dressed"), JSON.stringify(vetu));
  const deverse = lookupWord("déverse");
  check("'déverser' (as 'déverse') resolves to 'to pour', not the mismatched 'anglais'", deverse.lemma === "déverser" && deverse.translations.includes("to pour"), JSON.stringify(deverse));
  const rapproche = lookupWord("rapproché");
  check("'rapprocher' (as 'rapproché') resolves to 'to bring closer', not the rare 'reapproach'", rapproche.lemma === "rapprocher" && rapproche.translations.includes("to bring closer"), JSON.stringify(rapproche));
  const achemine = lookupWord("achemine");
  check("'acheminer' (as 'achemine') resolves to 'to convey'/'to route'", achemine.lemma === "acheminer" && achemine.translations.includes("to convey"), JSON.stringify(achemine));
}

console.log("\n--- Expanded news and civic vocabulary ---");
{
  const cases = [
    ["cependant", {}, "cependant"],
    ["prévoit", {}, "prévoir"],
    ["réforme", {}, "réforme"],
    ["hausse", {}, "hausse"],
    ["raison", { previousWord: "en", nextWord: "de" }, "en raison de"],
    ["objectif", {}, "objectif"],
    ["incendie", {}, "incendie"],
  ];
  for (const [word, ctx, expectedLemma] of cases) {
    const result = lookupWord(word, ctx);
    check(`expanded dictionary resolves '${word}' to ${expectedLemma}`, result.lemma === expectedLemma, JSON.stringify(result));
  }

  const newsSenseCases = [
    ["escalade", {}, "escalade", "escalation"],
    ["frappes", {}, "frappe", "strike"],
    ["grève", {}, "grève", "strike"],
    ["députés", {}, "député", "member of parliament"],
    ["échéance", {}, "échéance", "deadline"],
    ["recul", {}, "recul", "decline"],
    ["essor", {}, "essor", "growth"],
    ["pouvoir", { nextWord: "d'achat" }, "pouvoir d'achat", "purchasing power"],
    ["mise", { nextWord: "en œuvre" }, "mettre en œuvre", "to implement"],
  ];
  for (const [word, ctx, expectedLemma, expectedFirstTranslation] of newsSenseCases) {
    const result = lookupWord(word, ctx);
    check(
      `news sense dictionary resolves '${word}' as ${expectedLemma} -> ${expectedFirstTranslation}`,
      result.lemma === expectedLemma && result.translations[0] === expectedFirstTranslation,
      JSON.stringify(result)
    );
  }
}

console.log("\n--- Proper names and places ---");
{
  const cases = [
    ["Paris", {}, "Paris", "proper noun (place)"],
    ["Macron", {}, "Emmanuel Macron", "proper noun (person)"],
    ["Monde", { previousWord: "le" }, "Le Monde", "proper noun (media)"],
    ["européenne", { previousWord: "union" }, "Union européenne", "proper noun (institution)"],
    ["Zach", {}, "Zach", "proper noun"],
  ];
  for (const [word, ctx, expectedLemma, expectedPart] of cases) {
    const result = lookupWord(word, ctx);
    check(
      `proper-name lookup resolves '${word}' to ${expectedLemma}`,
      result.lemma === expectedLemma && result.partOfSpeech === expectedPart,
      JSON.stringify(result)
    );
  }
  const ordinary = lookupWord("français");
  check("proper-noun list does not override ordinary dictionary words", ordinary.partOfSpeech === "adjective", JSON.stringify(ordinary));
  const properNames = new Map();
  for (const entry of properNounDictionary) properNames.set(entry.lemma.toLowerCase(), (properNames.get(entry.lemma.toLowerCase()) ?? 0) + 1);
  const duplicates = [...properNames.entries()].filter(([, count]) => count > 1);
  check("proper-noun dictionary has no duplicate lemmas", duplicates.length === 0, JSON.stringify(duplicates));
}

console.log("\n--- Dictionary article translation ---");
{
  const paragraphs = tokenizeParagraphsToSentences("Le chat mange une pomme.\n\nElle lit un livre.");
  const translated = translateParagraphsWithDictionary(paragraphs);
  check("dictionary translation preserves paragraph count", translated.length === 2, JSON.stringify(translated));
  check("dictionary translation uses local English glosses", translated[0].toLowerCase().includes("cat"), translated[0]);
  check("dictionary translation keeps punctuation", translated[0].endsWith("."), translated[0]);
  const phraseParagraphs = tokenizeParagraphsToSentences("Le rapport prend en compte les données. La ville agit à partir de lundi.");
  const phraseSentences = translateSentencesWithDictionaryCache("phrase-test", "phrase-body", phraseParagraphs);
  check("dictionary translation handles multi-word phrases as one unit", phraseSentences[0].includes("take into account"), phraseSentences[0]);
  const literalSentences = translateSentencesWithDictionaryCache("literal-phrase-test", "phrase-body", phraseParagraphs, "literal");
  check("literal dictionary translation does not collapse phrases", !literalSentences[0].includes("take into account"), literalSentences[0]);
  const phraseStart = phraseParagraphs[0][0].tokens.findIndex((token) => token.clean === "prend");
  const phraseMatch = findPhraseTranslationMatch(phraseParagraphs[0][0].tokens, phraseStart);
  check("phrase tap detection returns the full phrase", phraseMatch?.lemma === "prendre en compte", JSON.stringify(phraseMatch));
  const longPhraseParagraphs = tokenizeParagraphsToSentences("Au fur et à mesure que le débat avance, les prix sont en hausse.");
  const longPhraseSentences = translateSentencesWithDictionaryCache("long-phrase-test", "long-phrase-body", longPhraseParagraphs);
  check("dictionary translation recognises phrases longer than five words", longPhraseSentences[0].includes("Gradually"), longPhraseSentences[0]);
  check("dictionary translation recognises news adjective phrases", longPhraseSentences[0].includes("rising"), longPhraseSentences[0]);
  const punctuationPhrase = translateSentencesWithDictionaryCache(
    "punctuation-phrase-test",
    "punctuation-phrase-body",
    tokenizeParagraphsToSentences("Au, fur et à mesure que le débat avance.")
  );
  check("phrase recognition does not jump across punctuation", !punctuationPhrase[0].includes("Gradually"), punctuationPhrase[0]);
  cacheDictionarySentenceTranslations("phrase-test", "phrase-body", phraseSentences);
  const cachedSentences = translateSentencesWithDictionaryCache("phrase-test", "phrase-body", phraseParagraphs);
  check("dictionary article translation cache round-trips sentence translations", cachedSentences.join("|") === phraseSentences.join("|"));
}

console.log("\n--- Short snippets content-quality tier ---");
{
  const clean =
    "Le marché a rouvert ce matin après plusieurs semaines de travaux. Les habitants du quartier sont revenus nombreux faire leurs courses habituelles. Les commerçants se disent très satisfaits de cette reprise et tout semblait enfin calme dans les allées.";
  check(
    "a short but clean multi-sentence text fails the main quality bar",
    !isAcceptableReadingContent(clean),
    `wordCount ~${clean.split(/\s+/).length}`
  );
  check("but passes the lower short-snippet bar", isAcceptableAsShortSnippet(clean));
}
{
  const tooShort = "Un mot. Deux mots.";
  check("a genuinely tiny fragment still fails the short-snippet bar", !isAcceptableAsShortSnippet(tooShort));
}
{
  const truncated = "Le marché a rouvert ce matin après plusieurs semaines de travaux et de fermeture...";
  check(
    "a truncated teaser still fails the short-snippet bar even if short-word-count-wise it would pass",
    !isAcceptableAsShortSnippet(truncated)
  );
}

console.log("\n--- Comprehension helpers ---");
{
  const current = {
    id: "a",
    title: "Le métro gratuit divise la ville",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview: "La ville teste la gratuité des transports.",
    blurbEn: "A city is testing free public transport while residents debate the cost.",
    body: "La ville teste la gratuité des transports. Certains habitants sont prudents.",
    sourceName: "Source A",
  };
  const related = {
    ...current,
    id: "b",
    title: "Transports gratuits: le débat continue",
    sourceName: "Source B",
    preview: "Les transports gratuits font débat.",
    blurbEn: "Another publication reports on the same free public transport debate.",
  };
  const unrelated = {
    ...current,
    id: "c",
    title: "Une victoire de football",
    category: "sport",
    sourceName: "Source C",
    preview: "Une équipe gagne un match.",
    blurbEn: "A football team wins a match in the final minute.",
  };
  check("related-article helper finds a same-event article from another source", findRelatedArticles(current, [related, unrelated])[0]?.id === "b");
  const gistQuestion = buildGistQuestion(current, [related, unrelated]);
  check("gist question puts the real gist first as the answer", gistQuestion.answerIndex === 0 && gistQuestion.choices[0].includes("free public transport"));
  check("gist question does not show a generic explanation", !gistQuestion.explanation);
  const metadataCurrent = {
    ...current,
    id: "pd-meta-a",
    title: "Voyage au centre de la terre: extrait 1",
    preview: "Le professeur entre dans la salle et explique son projet aux eleves.",
    blurbEn: "An exact public-domain French excerpt from Voyage au centre de la terre by Jules Verne, selected as 235-word reading practice.",
    body: "Le professeur entre dans la salle et explique son projet aux eleves. Ils ecoutent avec attention avant de poser des questions.",
  };
  const metadataDistractor = {
    ...related,
    id: "pd-meta-b",
    preview: "Une famille attend le train pendant une longue matinee.",
    blurbEn: "An exact public-domain French excerpt from Madame Bovary by Gustave Flaubert, selected as 233-word reading practice.",
    body: "Une famille attend le train pendant une longue matinee. Le quai reste calme sous la pluie.",
  };
  const metadataGistQuestion = buildGistQuestion(metadataCurrent, [metadataDistractor, unrelated]);
  check(
    "gist question ignores public-domain word-count metadata",
    metadataGistQuestion.choices.every((choice) => !/\b\d+[\s-]word\b|reading practice|public-domain french excerpt/i.test(choice)) &&
      metadataGistQuestion.choices[0].includes("professeur"),
    metadataGistQuestion.choices.join(" | ")
  );
  const toneQuestions = buildToneQuestions(current);
  check("tone helper creates stance/tone/confidence questions", toneQuestions.length === 3 && toneQuestions.every((q) => q.choices.length >= 3));
  const inference = buildInferenceChallenge("prudents", lookupWord("prudents"), "Certains habitants sont prudents.", "Some residents are cautious.");
  check("inference challenge offers three choices", !!inference && inference.choices.length === 3);
  const cautiousText = {
    ...current,
    id: "cautious",
    title: "Une etude pourrait changer le projet",
    preview: "Selon les chercheurs, un essai prudent reste possible.",
    body: "Selon les chercheurs, le projet pourrait encore changer. Un essai est etudie avant toute decision.",
  };
  const confidenceQuestion = buildToneQuestions(cautiousText).find((q) => q.kind === "confidence");
  check(
    "confidence question marks cautious evidence as cautious",
    confidenceQuestion?.choices[confidenceQuestion.answerIndex] === "Cautious",
    `got ${confidenceQuestion?.choices[confidenceQuestion.answerIndex]}`
  );
  check(
    "confidence explanation matches the cautious answer",
    !!confidenceQuestion?.explanation?.toLowerCase().includes("caution")
  );
  clearComprehensionQuestionCache();
  const cachedFirst = getOrCreateComprehensionQuestionBundle(current, [related, unrelated]);
  const cachedSecond = getOrCreateComprehensionQuestionBundle(current, [unrelated]);
  check(
    "comprehension question cache reuses the article bundle",
    !!cachedSecond.gistQuestion &&
      !!cachedFirst.gistQuestion &&
      cachedSecond.gistQuestion.choices.join("|") === cachedFirst.gistQuestion.choices.join("|")
  );
  const candidates = rankLearningCandidates(current, new Set(), [], [{ word: "prudents", lemma: "prudent", count: 2 }], 3);
  check("learning candidates include repeatedly tapped useful words", candidates.some((candidate) => candidate.lemma === "prudent"));
}
{
  const sentence = tokenizeParagraphsToSentences("Le maire présente le projet qui divise la ville. Il promet un vote public.")[0];
  const reference = findPronounReference("qui", sentence[0].tokens, sentence[0].tokens.findIndex((token) => token.clean === "qui"), null);
  check("pronoun reference helper links relative pronouns back to a noun phrase", reference?.antecedentText.toLowerCase().includes("projet"));
}
  {
    const family = getWordFamily("décider");
    check(
      "word-family helper includes the décider family",
      family.noun.includes("décision") && family.verb.includes("décider") && family.adjective.includes("décisif")
    );
  }
  {
    const family = getWordFamily("hausse");
    check(
      "word-family helper includes news vocabulary families",
      family.verb.includes("augmenter") && family.opposites.includes("baisse") && family.commonCollocations.includes("hausse des prix"),
      JSON.stringify(family)
    );
  }

console.log("\n--- Reading analytics ---");
{
  const today = new Date().toISOString();
  const a = {
    id: "news-a",
    title: "Selon la mairie, une hausse reste possible",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview: "Selon la mairie, le projet pourrait changer.",
    body: "Selon la mairie, une hausse reste possible. Pourtant, le conseil attend un rapport.",
    sourceName: "Source A",
    publishedAt: today,
  };
  const b = {
    ...a,
    id: "news-b",
    title: "Une hausse critique le projet",
    body: "Selon les chercheurs, la hausse divise les habitants. Pourtant, le vote continue.",
    sourceName: "Source B",
  };
  const wordsAcrossNews = buildTodayNewsWords([a, b]);
  check("today news words count lemmas across sources", wordsAcrossNews.some((word) => word.lemma === "selon" && word.articleCount === 2));
  const comparison = buildHeadlineComparison(a, [b]);
  check("headline comparison builds a same-event comparison", !!comparison && comparison.left.id === "news-a" && comparison.right.id === "news-b");

  const saved = {
    word: "selon",
    lemma: "selon",
    translations: ["according to"],
    primaryTranslation: "according to",
    partOfSpeech: "preposition",
    gender: null,
    cefr: "A2",
    frequencyRank: 300,
    articleContextSentence: "Selon la mairie, une hausse reste possible.",
    exampleSentenceFr: "Selon le journal, il pleut.",
    exampleSentenceEn: "According to the newspaper, it is raining.",
    sourceTextTitle: "Test",
    savedAt: today,
    reviewCount: 0,
    lastReviewedAt: null,
    status: "learning",
    ...defaultSpacedRepetitionFields(),
  };
  const states = classifyVocabularyStates(
    [{ ...saved, status: "known" }],
    [{ articleId: "news-a", word: "selon", lemma: "selon", count: 2, updatedAt: today }],
    []
  );
  check("vocabulary state detects behavioural forgetting", states[0]?.state === "forgotten");
  const contextual = buildContextualReviewArticles([a, b], [saved], [], 2);
  check("contextual review recommends articles containing due vocabulary", contextual.length > 0 && contextual[0].dueWords[0].word === "selon");
  const report = buildWeeklyReadingReport(
    [{ textId: "news-a", title: a.title, sourceName: "Source A", completedAt: today, category: "news-style", cefr: "A2", minutes: 3, wordCount: 120 }],
    [{ ...saved, status: "known", correctCount: 3, lastReviewedAt: today }],
    ["selon", "hausse"],
    [{ id: "budget-a", articleId: "news-a", articleTitle: a.title, allowance: 8, used: 5, metTarget: true, completedAt: today }]
  );
  check("weekly report includes reading and budget metrics", report.articlesCompleted === 1 && report.translationBudgetMet === 1);
  const proficiency = buildCategoryProficiency(
    [{ textId: "news-a", title: a.title, sourceName: "Source A", completedAt: today, category: "news-style", cefr: "A2", minutes: 3, wordCount: 120 }],
    ["selon", "hausse"]
  );
  check("category proficiency includes general news", proficiency.some((item) => item.category === "news-style" && item.articles === 1));
  const emptyReport = buildWeeklyReadingReport([], [], []);
  check("empty weekly report avoids invented guidance", emptyReport.mostDifficultArea === null && emptyReport.nextFocus === null && emptyReport.strongestTopic === null);
  check("empty category proficiency is hidden", buildCategoryProficiency([], []).length === 0);
}

console.log("\n--- Recommendation preferences (hide source / save for later) ---");
{
  check("a source starts out not hidden", !isSourceHidden("Le Testeur"));
  hideSource("Le Testeur");
  check("hideSource marks it hidden", isSourceHidden("Le Testeur"));
  check("getHiddenSources includes it", getHiddenSources().includes("Le Testeur"));
  unhideSource("Le Testeur");
  check("unhideSource removes it", !isSourceHidden("Le Testeur"));
}
{
  check("a source starts out not preferred", !isSourcePreferred("Le Préféré"));
  preferSource("Le Préféré");
  check("preferSource marks it preferred", isSourcePreferred("Le Préféré"));
  check("getPreferredSources includes it", getPreferredSources().includes("Le Préféré"));
  unpreferSource("Le Préféré");
  check("unpreferSource removes it", !isSourcePreferred("Le Préféré"));
}
{
  check("an article starts out not saved for later", !isSavedForLater("test-article-1"));
  saveForLater("test-article-1");
  check("saveForLater marks it saved", isSavedForLater("test-article-1"));
  check("getSavedLaterIds includes it", getSavedLaterIds().includes("test-article-1"));
  removeFromSavedLater("test-article-1");
  check("removeFromSavedLater unmarks it", !isSavedForLater("test-article-1"));
}

console.log("\n--- Onboarding ---");
{
  check("onboarding numeric level is null before completion (this test's store is fresh for this key)", getOnboardingLevelNumeric() === null);
  clearKnownWords();
  // Bootstrap seeding is async now: it needs the generated dictionary, which
  // is fetched on demand rather than bundled (see fr-en-generated.ts).
  check("known-word bootstrap list reaches the A2 estimate", (await buildKnownWordBootstrapList("A2")).length === knownWordEstimateForLevel("A2"));
  const state = saveOnboarding("B1", ["culture", "science"], "serious");
  check("saveOnboarding marks it completed", state.completed === true);
  const stored = getOnboardingState();
  check(
    "getOnboardingState round-trips the chosen level and topics",
    stored?.level === "B1" && !!stored?.topics.includes("culture") && !!stored?.topics.includes("science"),
    JSON.stringify(stored)
  );
  check("getOnboardingState round-trips the chosen goal preset", stored?.goalPreset === "serious", JSON.stringify(stored));
  check("getOnboardingState stores the estimated known-word count", stored?.estimatedKnownWords === knownWordEstimateForLevel("B1"), JSON.stringify(stored));
  // saveOnboarding deliberately returns immediately and seeds in the
  // background, so onboarding isn't blocked on the dictionary download. Wait
  // for the seeding it kicked off (bounded, so a genuine regression still
  // fails rather than hanging) instead of re-seeding here — the point of this
  // check is that saveOnboarding causes it.
  for (let i = 0; i < 50 && getKnownWords().length < knownWordEstimateForLevel("B1"); i++) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  check("saveOnboarding seeds known words from the selected level", getKnownWords().length >= knownWordEstimateForLevel("B1"), `known=${getKnownWords().length}`);
  check("onboarding goal preset seeds reading goals", getGoals().minutesPerDay === 20 && getGoals().articlesPerDay === 2, JSON.stringify(getGoals()));
  check("getOnboardingLevelNumeric maps B1 to 3 once completed", getOnboardingLevelNumeric() === 3);
  const knownBeforeLevelChange = getKnownWords().length;
  const changed = updateSelectedReadingLevel("C2");
  check("selected level can move to C2", changed.level === "C2" && getOnboardingLevelNumeric() === 6);
  check("changing selected level does not clear known words", getKnownWords().length === knownBeforeLevelChange);
}
{
  const state = skipOnboarding();
  check("skipOnboarding still marks completed (so the prompt never nags again)", state.completed === true);
  check("skipOnboarding defaults to A2", state.level === "A2");
  check("skipOnboarding does not seed a guessed known-word list", state.seededKnownWords === 0, JSON.stringify(state));
}

console.log("\n--- Phrase bank and dictionary feedback ---");
{
  savePhrase({
    phrase: "prendre en compte",
    lemma: "prendre en compte",
    translation: "to take into account",
    partOfSpeech: "verb phrase",
    contextSentence: "Il faut prendre en compte les donnees.",
    sourceTextTitle: "Test article",
  });
  check("savePhrase stores a phrase", getSavedPhrases().some((phrase) => phrase.phrase === "prendre en compte"));
  markPhraseKnown("prendre en compte");
  check("markPhraseKnown updates phrase status", getSavedPhrases().find((phrase) => phrase.phrase === "prendre en compte")?.status === "known");
}
{
  recordDictionaryFeedback({
    type: "correction",
    input: "actuel",
    lemma: "actuel",
    previousTranslation: "actual",
    suggestedTranslation: "current",
    articleTitle: "Test article",
    contextSentence: "Le sujet actuel est important.",
  });
  check("dictionary feedback records corrections", getDictionaryFeedback().some((entry) => entry.input === "actuel" && entry.suggestedTranslation === "current"));
}

console.log("\n--- Lemma-aware saved words ---");
{
  clearWords();
  const prendreLookup = lookupWord("prendre");
  const base = {
    word: "prendre",
    lemma: prendreLookup.lemma,
    translations: prendreLookup.translations,
    primaryTranslation: prendreLookup.translations[0],
    partOfSpeech: prendreLookup.partOfSpeech,
    gender: prendreLookup.gender,
    cefr: prendreLookup.cefr,
    frequencyRank: prendreLookup.frequencyRank,
    articleContextSentence: "Il faut prendre une decision.",
    exampleSentenceFr: "Je dois prendre le train.",
    exampleSentenceEn: "I have to take the train.",
    sourceTextTitle: "Test",
    savedAt: new Date().toISOString(),
    reviewCount: 0,
    lastReviewedAt: null,
    status: "learning",
    ...defaultSpacedRepetitionFields(),
  };
  saveWord(base);
  saveWord({ ...base, word: "prend", articleContextSentence: "Il prend le train." });
  check("saved words dedupe inflected forms by lemma", getSavedWords().filter((word) => word.lemma === "prendre").length === 1);
}
{
  window.localStorage.setItem("lire.savedWords.v1", JSON.stringify(["eût"]));
  const [legacy] = getSavedWords();
  check(
    "legacy string saved words are backfilled from the current dictionary",
    legacy?.lemma === "avoir" &&
      legacy.primaryTranslation === "to have" &&
      legacy.translations.includes("to have") &&
      legacy.missingFromDictionary === false,
    JSON.stringify(legacy)
  );
}
{
  window.localStorage.setItem(
    "lire.savedWords.v1",
    JSON.stringify([
      {
        word: "eût",
        lemma: null,
        translations: [],
        primaryTranslation: NOT_TRANSLATED_YET,
        partOfSpeech: null,
        gender: null,
        cefr: null,
        frequencyRank: null,
        articleContextSentence:
          "Cependant, comme si la traversée des champs de glace eût été praticable, les préparatifs du départ se continuaient activement à la factorerie.",
        exampleSentenceFr: "On utilise « eût » dans cette phrase.",
        exampleSentenceEn: 'We use "eût" in this sentence.',
        sourceTextTitle: "Test article",
        savedAt: "2026-07-16T00:00:00.000Z",
        reviewCount: 0,
        lastReviewedAt: null,
        status: "learning",
        missingFromDictionary: true,
      },
    ])
  );
  const [rehydrated] = getSavedWords();
  check(
    "placeholder saved words are rehydrated when the dictionary now has the word",
    rehydrated?.lemma === "avoir" &&
      rehydrated.primaryTranslation === "to have" &&
      rehydrated.missingFromDictionary === false &&
      rehydrated.articleContextSentence.includes("eût été praticable"),
    JSON.stringify(rehydrated)
  );
  clearWords();
}
{
  window.localStorage.setItem(
    "lire.savedWords.v1",
    JSON.stringify([
      {
        word: "chutmonsecret",
        lemma: null,
        translations: [],
        primaryTranslation: NOT_TRANSLATED_YET,
        partOfSpeech: null,
        gender: null,
        cefr: null,
        frequencyRank: null,
        articleContextSentence: "est apparu en premier sur chutmonsecret.",
        exampleSentenceFr: "On utilise chutmonsecret dans cette phrase.",
        exampleSentenceEn: 'We use "chutmonsecret" in this sentence.',
        sourceTextTitle: "Test article",
        savedAt: "2026-07-16T00:00:00.000Z",
        reviewCount: 0,
        lastReviewedAt: null,
        status: "learning",
        missingFromDictionary: true,
      },
    ])
  );
  check(
    "source-footer missing words are removed from saved words",
    !getSavedWords().some((word) => word.word === "chutmonsecret")
  );
  clearWords();
}

console.log("\n--- Article difficulty feedback ---");
{
  const text = {
    id: "feedback-test",
    title: "Feedback test",
    category: "news-style",
    difficulty: "A2",
    minutes: 2,
    preview: "Test",
    body: "Le chat lit.",
  };
  saveArticleFeedback(text, "good", "A2");
  check("article feedback round-trips by text id", getArticleFeedbackForText("feedback-test")?.feedback === "good");
}

console.log("\n--- Gamification engine ---");
{
  clearGamificationStores();
  const first = addXpEvent({
    type: "article_completed",
    relatedId: "xp-test",
    xp: 30,
    idempotencyKey: "xp-test-once",
    createdAt: "2026-07-14T09:00:00.000Z",
  });
  const duplicate = addXpEvent({
    type: "article_completed",
    relatedId: "xp-test",
    xp: 30,
    idempotencyKey: "xp-test-once",
    createdAt: "2026-07-14T09:01:00.000Z",
  });
  check("XP events are idempotent by idempotency key", first.awarded && !duplicate.awarded && getXpEvents().length === 1);
  check("CEFR XP thresholds follow the product ladder", xpNeededForLevel(1) === 500 && xpNeededForLevel(2) === 2500 && xpNeededForLevel(5) === 10000);
  check("levelFromXp advances through CEFR bands cumulatively", levelFromXp(500).level === 2 && levelFromXp(3000).level === 3 && levelFromXp(8000).level === 4);
  check("saving a new word awards 1 XP once", recordWordSavedXp("pourtant") === 1 && recordWordSavedXp("pourtant") === 0);
}
{
  const easyBudget = translationBudgetForMode("relaxed", 500, 0.05);
  const strictBudget = translationBudgetForMode("ambitious", 500, 0.05);
  const noneBudget = translationBudgetForMode("none", 500, 0.05);
  check("translation budgets tighten by challenge mode", easyBudget > strictBudget && noneBudget === null, `${easyBudget}/${strictBudget}/${noneBudget}`);
  const metBudget = calculateArticleScore({
    comprehensionCorrect: 3,
    comprehensionTotal: 3,
    inferenceCorrect: 1,
    inferenceAttempts: 1,
    translationsUsed: 3,
    translationBudget: 5,
    summaryCompleted: true,
  });
  const missedBudget = calculateArticleScore({
    comprehensionCorrect: 3,
    comprehensionTotal: 3,
    inferenceCorrect: 1,
    inferenceAttempts: 1,
    translationsUsed: 12,
    translationBudget: 5,
    summaryCompleted: true,
  });
  check("article score rewards staying inside the translation budget", metBudget.total > missedBudget.total, `${metBudget.total}/${missedBudget.total}`);
}
{
  clearGamificationStores();
  const article = {
    id: "gamified-article",
    title: "Un test de lecture",
    sourceName: "Liree Test",
    category: "science",
    difficulty: "B1",
    minutes: 4,
    preview: "Une etude simple",
    body: "Selon une etude, les lecteurs comprennent mieux quand ils lisent avec attention. Pourtant, ils traduisent parfois trop vite.",
  };
  const completion = recordGamifiedArticleCompletion({
    text: article,
    difficulty: "B1",
    openedAt: "2026-07-14T09:00:00.000Z",
    completedAt: "2026-07-14T09:05:00.000Z",
    wordsRead: 120,
    translationsUsed: 2,
    fullTranslationUsed: false,
    savedWords: 2,
    phrasesSaved: 1,
    comprehensionCorrect: 3,
    comprehensionTotal: 3,
    inferenceCorrect: 1,
    inferenceAttempts: 1,
    summaryCompleted: true,
    challengeMode: "balanced",
    challengeBudget: 4,
  });
  const repeat = recordGamifiedArticleCompletion({
    text: article,
    difficulty: "B1",
    openedAt: "2026-07-14T09:00:00.000Z",
    completedAt: "2026-07-14T09:06:00.000Z",
    wordsRead: 120,
    translationsUsed: 2,
    fullTranslationUsed: false,
    savedWords: 2,
    phrasesSaved: 1,
    comprehensionCorrect: 3,
    comprehensionTotal: 3,
    inferenceCorrect: 1,
    inferenceAttempts: 1,
    summaryCompleted: true,
    challengeMode: "balanced",
    challengeBudget: 4,
  });
  check("article completion stores one completion per article", getArticleCompletions().length === 1);
  check("duplicate article completions do not re-award completion XP", completion.xpEarned > 0 && repeat.xpEarned === 0, `${completion.xpEarned}/${repeat.xpEarned}`);
  check("topic progress reflects completed article categories", buildTopicProgress().find((topic) => topic.category === "science")?.articlesCompleted === 1);
  check("personal bests include a highest article score record", buildPersonalBests().some((best) => best.id === "best-score" && best.value !== "No record yet"));
  check("quick challenge uses the article category label", quickChallengeForArticle(article).answer === "Science");
  const secondPassXp = recordSecondPassXp(article.id);
  check("second pass XP is awarded once", secondPassXp === 15 && recordSecondPassXp(article.id) === 0);
}
{
  const missionsToday = getDailyMissions("2026-07-14");
  const missionsTomorrow = getDailyMissions("2026-07-15");
  check("daily missions expose up to three goals", missionsToday.length > 0 && missionsToday.length <= 3);
  check("daily missions reset by date", missionsToday.map((m) => m.id).join(",") !== missionsTomorrow.map((m) => m.id).join(","));
  const missionStatuses = getMissionStatuses("2026-07-14", []);
  const missionAward = awardCompletedMissions("2026-07-14", []);
  check("mission statuses carry progress and reward state", missionStatuses.every((mission) => typeof mission.progress === "number" && typeof mission.rewarded === "boolean"));
  check("awardCompletedMissions is safe when nothing is complete", missionAward.awardedXp >= 0);
}
{
  const days = new Set(["2026-07-12", "2026-07-13", "2026-07-14"]);
  check("currentStreak counts consecutive activity backwards from today", currentStreak(days, "2026-07-14") === 3);
  check("longestStreak finds the longest run", longestStreak(new Set(["2026-07-10", "2026-07-12", "2026-07-13"])) === 2);
}
{
  const saved = [
    {
      word: "decider",
      lemma: "decider",
      translations: ["to decide"],
      primaryTranslation: "to decide",
      partOfSpeech: "verb",
      articleContextSentence: "Il faut decider vite.",
      exampleSentenceFr: "Je dois decider.",
      exampleSentenceEn: "I must decide.",
      sourceTextTitle: "Un test de lecture",
      savedAt: "2026-07-14T09:00:00.000Z",
      reviewCount: 4,
      lastReviewedAt: "2026-07-14T09:10:00.000Z",
      status: "known",
      correctCount: 4,
      incorrectCount: 0,
      lastReviewResult: "correct",
      ease: 2.5,
      nextReviewAt: null,
    },
  ];
  const mastery = buildMastery(saved, [
    { id: "tap-1", articleId: "a1", word: "decider", lemma: "decider", count: 2, updatedAt: "2026-07-14T09:00:00.000Z" },
    { id: "tap-2", articleId: "a2", word: "decider", lemma: "decider", count: 1, updatedAt: "2026-07-14T09:01:00.000Z" },
    { id: "tap-3", articleId: "a3", word: "decider", lemma: "decider", count: 1, updatedAt: "2026-07-14T09:02:00.000Z" },
  ], [
    { id: "inf-1", articleId: "a2", word: "decider", lemma: "decider", correct: true, answeredAt: "2026-07-14T09:00:00.000Z" },
    { id: "inf-2", articleId: "a3", word: "decider", lemma: "decider", correct: true, answeredAt: "2026-07-14T09:00:00.000Z" },
    { id: "inf-3", articleId: "a4", word: "decider", lemma: "decider", correct: true, answeredAt: "2026-07-14T09:00:00.000Z" },
  ]);
  check("mastery connects review success and repeated contexts", mastery[0].stageIndex >= 3, JSON.stringify(mastery[0]));
  check("collections include common verbs", buildCollections(saved, mastery).some((collection) => collection.id === "verbs" && collection.discovered === 1));
  check("achievement progress can be built from words and completions", buildAchievements(saved, mastery).length > 0);
  check("progress snapshot includes XP level and collections", buildProgressSnapshot(saved).collections.length > 0 && buildProgressSnapshot(saved).level.level >= 1);
  check("review success XP is capped but awarded", recordReviewSuccessXp("decider") > 0);
}

console.log("\n--- Grammar conjugation section ---");
{
  clearGrammarStores();
  check("verb lessons provide a complete first grammar path", getVerbLessons().length >= 8);
  check("all verb lessons have five-question practice sets", getVerbLessons().every((lesson) => practiceSetForLesson(lesson.id).length === 5));
  check("tense labels are learner-friendly", tenseLabel("passe-compose") === "Passe compose" && tenseLabel("futur-simple") === "Future simple");
}
{
  const question = questionsForLesson("passe-compose")[0];
  check("grammar answers compare accent-insensitively", isGrammarAnswerCorrect({ ...question, answer: "été" }, "ete"));
  check("wrong grammar answers are rejected", !isGrammarAnswerCorrect(question, "est"));
}
{
  const first = recordGrammarAnswer("present-er", "present-er-1", true);
  const second = recordGrammarAnswer("present-er", "present-er-2", true);
  const third = recordGrammarAnswer("present-er", "present-er-1", false);
  check("grammar progress tracks attempts and correct answers", third.attempts === 3 && third.correct === 2, JSON.stringify(third));
  check("grammar mastery increases after correct practice", first.mastery > 0 && second.mastery >= first.mastery, `${first.mastery}/${second.mastery}`);
  check("grammar lessons do not auto-complete before the five-question finish", third.completed === false);
  check("grammar practice events are stored", getGrammarPracticeEvents().length === 3);
}
{
  markGrammarLessonComplete("present-er");
  const completed = markGrammarLessonComplete("present-core-irregulars");
  const dashboard = buildGrammarDashboard(getGrammarProgress(), getGrammarPracticeEvents());
  check("grammar lessons can be marked complete", completed.completed && completed.mastery >= 70);
  check("grammar dashboard reports completed lessons", dashboard.completedLessons >= 1);
  check("grammar dashboard recommends a next lesson", !!dashboard.nextLesson?.id);
  check("current unlocked lesson skips completed lessons", currentUnlockedLesson(getGrammarProgress()).id === "present-ir-re");
}
{
  const etre = referenceForVerb("etre");
  const accented = referenceForVerb("être");
  check("verb reference resolves common verbs", etre?.forms.present.includes("je suis"));
  check("verb reference lookup tolerates accents", accented?.infinitive === "etre");
  check("reference set includes several core verbs", VERB_REFERENCES.length >= 6);
  check("lesson lookup falls back safely", getVerbLesson("missing-lesson").id === getVerbLessons()[0].id);
}

console.log("\n--- Supabase sync merge logic ---");
{
  check("itemTimestamp reads the latest of several timestamp-ish fields", itemTimestamp({ savedAt: "2020-01-01", lastReviewedAt: "2024-06-01" }) > itemTimestamp({ savedAt: "2020-01-01" }));
  check("itemTimestamp is 0 for a value with no timestamp fields", itemTimestamp({ word: "chat" }) === 0);
  check("itemTimestamp is 0 for non-objects", itemTimestamp("just a string") === 0 && itemTimestamp(null) === 0);
}
{
  const config = { key: "lire.knownWords.v1", kind: "list-of-strings" };
  const merged = mergeStoreValue(config, ["chat", "chien"], ["chien", "oiseau"]);
  check(
    "list-of-strings merge is a deduped union of local and remote",
    merged.length === 3 && ["chat", "chien", "oiseau"].every((w) => merged.includes(w)),
    JSON.stringify(merged)
  );
}
{
  const config = { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word" };
  const local = [{ word: "chat", savedAt: "2024-01-01T00:00:00Z", reviewCount: 1 }];
  const remote = [{ word: "chat", savedAt: "2024-06-01T00:00:00Z", reviewCount: 5 }];
  const merged = mergeStoreValue(config, local, remote);
  check(
    "list-by-id merge keeps whichever side has the newer timestamp for a shared id",
    merged.length === 1 && merged[0].reviewCount === 5,
    JSON.stringify(merged)
  );
}
{
  const config = { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word" };
  const local = [{ word: "chat", savedAt: "2024-06-01T00:00:00Z", reviewCount: 9 }];
  const remote = [{ word: "chat", savedAt: "2024-01-01T00:00:00Z", reviewCount: 1 }];
  const merged = mergeStoreValue(config, local, remote);
  check(
    "list-by-id merge keeps the local side when it's the newer one",
    merged.length === 1 && merged[0].reviewCount === 9,
    JSON.stringify(merged)
  );
}
{
  const config = { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word" };
  const local = [{ word: "chat" }];
  const remote = [{ word: "chien" }];
  const merged = mergeStoreValue(config, local, remote);
  check(
    "list-by-id merge keeps distinct ids from both sides",
    merged.length === 2,
    JSON.stringify(merged)
  );
}
{
  const config = { key: "lire.progress.v1", kind: "record" };
  const local = { "id-1": { status: "completed", completedAt: "2024-06-01T00:00:00Z" } };
  const remote = { "id-1": { status: "in-progress", completedAt: "2024-01-01T00:00:00Z" }, "id-2": { status: "unread" } };
  const merged = mergeStoreValue(config, local, remote);
  check(
    "record merge keeps the newer entry per key and adds remote-only keys",
    merged["id-1"].status === "completed" && merged["id-2"].status === "unread",
    JSON.stringify(merged)
  );
}
{
  check("mergeStoreValue returns local as-is when remote is null", mergeStoreValue({ key: "k", kind: "object" }, { a: 1 }, null).a === 1);
  check("mergeStoreValue returns remote as-is when local is null", mergeStoreValue({ key: "k", kind: "object" }, null, { a: 1 }).a === 1);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
