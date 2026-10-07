/**
 * Learner trust: what Sorlio tells a learner about themselves must be true.
 *
 * Estimates are fine ("about 5 min", "Estimated B1"); false precision is not
 * ("84% vocabulary coverage" from a formula, "0% comprehension" when nothing
 * was asked, 600 minutes for an article left open overnight). These drive the
 * real functions behind Progress, the archive, streaks and missions.
 *
 * Runs in a non-UTC timezone on purpose (set before anything reads a date).
 */
process.env.TZ = "Europe/London";

import { readFileSync } from "node:fs";
import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

const t = createRunner("learner trust");
const control = createStorage();
installWindow(control);
control.storage.setItem("sorlio.storage.schema", "2");

const { __resetLocalStoreForTests, localStore } = await import("../src/lib/localData/store.ts");
__resetLocalStoreForTests(null);
const gamification = await import("../src/lib/gamification.ts");
const archive = await import("../src/lib/archive.ts");
const habit = await import("../src/lib/habit.ts");
const { localDateKey, localDateKeyOf } = await import("../src/lib/localDate.ts");
const { localDateKey: allowanceDateKey } = await import("../src/lib/access/saveAllowance.ts");
const storage = await import("../src/lib/storage.ts");

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// ---------------------------------------------------------------------------
await t.section("A2: no data is not zero ability", async () => {
  const { comprehensionPercent } = gamification;
  t.check("no scored comprehension → null (shown as 'Not measured yet')", comprehensionPercent([]) === null && comprehensionPercent([{ comprehensionCorrect: 0, comprehensionTotal: 0 }]) === null);
  t.check("a genuine 0 of 4 is 0%", comprehensionPercent([{ comprehensionCorrect: 0, comprehensionTotal: 4 }]) === 0);
  t.check("3 of 4 is 75%", comprehensionPercent([{ comprehensionCorrect: 3, comprehensionTotal: 4 }]) === 75);
  t.check("unscored readings do not dilute scored ones", comprehensionPercent([{ comprehensionCorrect: 3, comprehensionTotal: 4 }, { comprehensionCorrect: 0, comprehensionTotal: 0 }]) === 75);
  const progress = read("src/app/progress/page.tsx");
  const card = read("src/components/GamificationCards.tsx");
  t.check("Progress renders a null weekly comprehension as 'Not measured yet'", /weeklyComprehensionAverage === null \? "Not measured yet"/.test(progress));
  t.check("topic cards render null comprehension as 'not measured yet'", /comprehensionPercent === null \? "not measured yet"/.test(card));
});

await t.section("A1: topic progress is activity, not proficiency", async () => {
  const completions = [
    { category: "science", wordsRead: 600, comprehensionCorrect: 2, comprehensionTotal: 3 },
    { category: "science", wordsRead: 400, comprehensionCorrect: 0, comprehensionTotal: 0 },
  ];
  const topics = gamification.buildTopicProgress(completions);
  const science = topics.find((topic) => topic.category === "science");
  t.check("science: 2 readings, 1,000 words, 67% of answers", science.articlesCompleted === 2 && science.wordsRead === 1000 && science.comprehensionPercent === 67, JSON.stringify(science));
  const untouched = topics.find((topic) => topic.category === "sport");
  t.check("an untouched topic shows 0 readings and no comprehension figure", untouched.articlesCompleted === 0 && untouched.comprehensionPercent === null);
  const fields = Object.keys(science).sort().join(",");
  t.check("no level, coverage or milestone fields exist", !/level|coverage|progress|milestone/i.test(fields), fields);
  const sources = ["src/components/GamificationCards.tsx", "src/app/archive/page.tsx", "src/lib/readingAnalytics.ts", "src/lib/gamification.ts"].map(read).join("\n");
  t.check("no fabricated coverage formulas or topic 'Lv' remain", !/72 \+|vocabulary coverage|Lv \{|% coverage|Topic proficiency/i.test(sources));
});

await t.section("A3: an article left open does not count as hours of reading", async () => {
  t.check("active time under 30 s is not a reading time", archive.activeMinutesFromMs(10_000) === null && archive.activeMinutesFromMs(0) === null && archive.activeMinutesFromMs(undefined) === null);
  t.check("a short meaningful reading shows at least 1 min", archive.activeMinutesFromMs(40_000) === 1);
  t.check("whole minutes, no seconds", archive.activeMinutesFromMs(5 * 60_000 + 17_000) === 5);
  const overnight = { textId: "x", title: "X", sourceName: null, openedAt: "2026-07-14T21:00:00.000Z", completedAt: "2026-07-15T07:00:00.000Z", minutes: 4 };
  t.check("opened at 10pm, finished at 8am, no active time recorded → no time claimed", archive.estimateTimeSpentMinutes(overnight) === null);
  t.check("with active time recorded → that time", archive.estimateTimeSpentMinutes({ ...overnight, activeMinutes: 6 }) === 6);
  const article = { id: "t1", title: "T", body: "Un texte.", category: "science", difficulty: "B1", minutes: 4 };
  const completion = gamification.recordGamifiedArticleCompletion({
    text: article, difficulty: "B1", activeMinutes: null, completedAt: "2026-07-15T07:00:00.000Z", wordsRead: 120, translationsUsed: 9,
    fullTranslationUsed: true, savedWords: 0, phrasesSaved: 0, comprehensionCorrect: 0, comprehensionTotal: 0, inferenceCorrect: 0,
    inferenceAttempts: 0, summaryCompleted: false, challengeMode: "none", challengeBudget: null,
  });
  t.check("completion without active time falls back to the text's estimate (4 min), not wall-clock", completion.readingMinutes === 4, JSON.stringify(completion.readingMinutes));
  t.check("the reader records active minutes, not openedAt, at completion", /activeMinutes = activeMinutesFromMs\(/.test(read("src/components/Reader.tsx")) && !/openedAt: getProgress\(text\.id\)\.openedAt,\n\s+completedAt/.test(read("src/components/Reader.tsx")));
});

await t.section("A4: streaks follow the learner's local calendar day", async () => {
  // Europe/London in summer is UTC+1.
  const justAfterMidnight = new Date("2026-07-14T23:10:00.000Z"); // 00:10 local on 15 July
  const lateEvening = new Date("2026-07-15T22:50:00.000Z"); // 23:50 local on 15 July
  t.check("00:10 local counts for the new local day", localDateKey(justAfterMidnight) === "2026-07-15" && habit.dateKey(justAfterMidnight) === "2026-07-15");
  t.check("23:50 local counts for that local day", localDateKey(lateEvening) === "2026-07-15");
  t.check("one helper everywhere: daily saves use the same day", allowanceDateKey(justAfterMidnight) === "2026-07-15");
  t.check("timestamps map to the local day", localDateKeyOf("2026-07-14T23:10:00.000Z") === "2026-07-15");

  localStore.setItem("lire.activityDates.v1", JSON.stringify(["2026-07-13", "2026-07-14", "2026-07-15"]));
  t.check("streak counts the three local days through 00:10 on the 15th", habit.getCurrentStreak(justAfterMidnight) === 3);
  const week = habit.getStreakWeek(justAfterMidnight);
  t.check("the streak week marks the same days (Mon 13 – Wed 15) and today as Wed 15", ["2026-07-13", "2026-07-14", "2026-07-15"].every((key) => week.find((day) => day.dateKey === key)?.active) && week.find((day) => day.isToday)?.dateKey === "2026-07-15", JSON.stringify(week.map((d) => d.dateKey)));
  const grace = habit.getStreakGraceStatus(new Date("2026-07-16T23:30:00.000Z")); // 00:30 local on 17 July
  t.check("grace uses the same days (yesterday = 16 July local)", grace.eligibleDateKey === "2026-07-16", JSON.stringify(grace));

  // DST: 25 October 2026 is 25 hours long in London; calendar keys stay unique and consecutive.
  const keys = [];
  for (let hour = 0; hour < 72; hour++) keys.push(localDateKey(new Date(Date.UTC(2026, 9, 24, hour))));
  const unique = [...new Set(keys)];
  t.check("across the clock change, every day appears once and in order", unique.join() === "2026-10-24,2026-10-25,2026-10-26" && keys.filter((k) => k === "2026-10-25").length === 25, `${unique.join()} / 25 Oct hours: ${keys.filter((k) => k === "2026-10-25").length}`);
  t.check("no UTC date slicing remains in streak or mission code", !/toISOString\(\)\.slice\(0, 10\)/.test(read("src/lib/habit.ts")) && !/(createdAt|completedAt|answeredAt|lastReviewedAt\??)\.slice\(0, 10\)/.test(read("src/lib/gamification.ts")));
});

await t.section("E2: rewards never depend on avoiding help", async () => {
  const pool = new Set();
  for (let day = 1; day <= 28; day++) for (const mission of gamification.getDailyMissions(`2026-07-${String(day).padStart(2, "0")}`)) pool.add(mission.id);
  t.check("no 'translation restraint' or 'stay in French' mission is ever offered", !pool.has("translation-restraint") && !pool.has("no-full-translation"), [...pool].join());
  t.check("the replacements are offered", pool.has("second-pass") || pool.has("grammar-five"));
  const score = gamification.calculateArticleScore({ comprehensionCorrect: 2, comprehensionTotal: 2, inferenceCorrect: 0, inferenceAttempts: 0, translationsUsed: 40, translationBudget: 3, summaryCompleted: true });
  const sameWithoutLookups = gamification.calculateArticleScore({ comprehensionCorrect: 2, comprehensionTotal: 2, inferenceCorrect: 0, inferenceAttempts: 0, translationsUsed: 0, translationBudget: 3, summaryCompleted: true });
  t.check("40 lookups score the same as none", score.total === sameWithoutLookups.total, `${score.total} vs ${sameWithoutLookups.total}`);
  const copy = ["src/app/progress/page.tsx", "src/components/diagnostics/ReadingDiagnosticsCard.tsx", "src/lib/practice/diagnosticMessaging.ts", "src/app/archive/page.tsx"].map(read).join("\n");
  t.check("learner-facing copy has no independence/restraint/budget judgement", !/Reading independence|Translation restraint|Translation budget|Independent reading|more independent/i.test(copy));
});

await t.section("D2: archive history is a snapshot", async () => {
  storage.addWordToReview({ word: "maison", lemma: "maison", translations: ["house"], primaryTranslation: "house", partOfSpeech: null, gender: null, cefr: null, frequencyRank: null, articleContextSentence: "", exampleSentenceFr: "", exampleSentenceEn: "", sourceTextTitle: "Snapshot", savedAt: "2026-07-14T10:00:00.000Z", reviewCount: 0, lastReviewedAt: null, status: "learning" });
  archive.recordArchiveEntry({ textId: "snap-1", title: "Snapshot", sourceName: null, completedAt: "2026-07-14T10:05:00.000Z", activeMinutes: 5, savedWordCount: 1, phraseCount: 0 });
  storage.clearWords();
  const entry = archive.getArchive().find((e) => e.textId === "snap-1");
  t.check("deleting vocabulary later does not change the reading's saved-word count", entry.savedWordCount === 1 && entry.activeMinutes === 5);
  t.check("the archive page shows the snapshot, not a recount by title", /savedWordCount/.test(read("src/app/archive/page.tsx")) && !/sourceTextTitle === entry\.title/.test(read("src/app/archive/page.tsx")));
  t.check("history is described as recent, with its limit", /most recent completed readings \(up to \{MAX_ARCHIVE_ENTRIES\}\)/.test(read("src/app/archive/page.tsx")));
});

t.finish();
