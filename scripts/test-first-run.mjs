/**
 * First run and product hierarchy: a new learner reaches French in one
 * decision; a returning learner sees the next action first; deeper tools
 * stay one tap away. Drives the real onboarding state and journey choice;
 * checks the screens' structure where the behaviour is presentational.
 */
import { readFileSync } from "node:fs";
import { createStorage, createRunner, installWindow } from "./lib/fakeBrowser.mjs";

const t = createRunner("first run");
const control = createStorage();
installWindow(control);
control.storage.setItem("sorlio.storage.schema", "2");

const { __resetLocalStoreForTests, localStore } = await import("../src/lib/localData/store.ts");
__resetLocalStoreForTests(null);
const onboarding = await import("../src/lib/onboarding.ts");
const { getNextTextForReader } = await import("../src/lib/journey/state.ts");
const { getJourneyText } = await import("../src/lib/journey/ladder.ts");

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const code = (path) => read(path).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

await t.section("1. New learner: one decision, then a reading", async () => {
  const picker = code("src/components/FirstRunOnboarding.tsx");
  t.check("the first screen says what Sorlio is", /Learn French by reading it\./.test(picker) && /Get started/.test(picker));
  t.check("the level question leads with plain descriptions", /How comfortable are you reading French\?/.test(picker) && /I can follow everyday French/.test(picker) && /More levels/.test(picker));
  t.check("A2, B1 and B2 first; A1, C1 and C2 behind More levels", /MAIN_LEVELS[\s\S]{0,200}"A2"[\s\S]{0,120}"B1"[\s\S]{0,120}"B2"/.test(picker) && /MORE_LEVELS[\s\S]{0,200}"A1"[\s\S]{0,120}"C1"[\s\S]{0,120}"C2"/.test(picker));
  t.check("no topics, goal, account, sign-in or Premium during first run", !/topic|goal|sign in|signIn|account|Premium|£/i.test(picker));
  t.check("no overclaims", !/fluent|known words|\d,\d{3} words/i.test(picker));
  t.check("Start first reading opens the journey's next reading", /Start first reading/.test(picker) && /getNextTextForReader\(\{ selectedLevel: level \}\)/.test(picker) && /router\.push\(`\/reader\//.test(picker));
  t.check("levels are a keyboard-reachable radio group", /role="radiogroup"/.test(picker) && /role="radio"/.test(picker) && /aria-checked=\{selected\}/.test(picker));

  t.check("a brand-new learner has no onboarding state", onboarding.getOnboardingState() === null);
  onboarding.saveOnboarding("B1", []);
  const state = onboarding.getOnboardingState();
  t.check("choosing a level completes first run, with no tour queued", state.completed && state.walkthroughCompleted && !state.walkthroughReplay);
  t.check("no goal or topics were set", state.goalPreset === undefined && state.topics.length === 0);
  for (const level of ["A2", "B1", "B2"]) {
    const first = getNextTextForReader({ selectedLevel: level });
    const text = first && getJourneyText(first.textId);
    t.check(`${level}: the first reading is a short ${level} text`, !!text && text.difficulty === level && text.minutes <= 3, text ? `${text.id} ${text.minutes} min` : "none");
  }
});

await t.section("2. First reading: help appears when it matters", async () => {
  const reader = code("src/components/Reader.tsx");
  t.check("a one-time tap coach mark", /CoachMark text="Tap any word/.test(reader) && /hasSeenReaderTip\("tap-word"\)/.test(reader));
  t.check("the first save explains Review once", /Added to Review\. We'll bring this word back later\./.test(reader) && /markReaderTipSeen\("first-save"\)/.test(reader));
});

await t.section("3/10. Completion: next action first, details behind a disclosure", async () => {
  const screen = code("src/components/LessonCompleteScreen.tsx");
  t.check("one summary line: XP, words saved, streak", /`\+\$\{levelProgress\.xpAwarded\} XP`/.test(screen) && /words saved/.test(screen) && /day streak/.test(screen));
  const details = screen.indexOf("Session details");
  t.check("diagnostics, stats, Sorlio Level and rating sit under Session details", details > -1 && screen.indexOf("<ReadingDiagnosticsCard") > details && screen.indexOf("Sorlio Level") > details && screen.indexOf("<RateSorlioCard") > details);
  t.check("the primary action is the next step; Review is offered when words were saved", /onClick=\{onPrimaryAction\}/.test(screen) && /stats\.savedWords > 0 && \(\s*<Link href=\{reviewHref\}/.test(screen) && /Review \{stats\.savedWords\} saved/.test(screen));
  t.check("a daily goal is offered once, skippably, after a reading", /Want a small daily target\?/.test(screen) && /"Not now"/.test(screen));
  onboarding.setGoalPreset("light");
  t.check("choosing 5 min stores a goal", onboarding.getOnboardingState().goalPreset === "light");
});

await t.section("4. Returning learner: no onboarding replay", async () => {
  // A learner who finished the old picker but never the old tour.
  localStore.setItem("lire.onboarding.v1", JSON.stringify({ completed: true, level: "B1", topics: [], estimatedKnownWords: 2000, seededKnownWords: 0, updatedAt: "2026-09-01T00:00:00.000Z", walkthroughCompleted: false, walkthroughStep: null }));
  const state = onboarding.getOnboardingState();
  const home = code("src/app/page.tsx");
  t.check("home shows the tour only on an explicit replay", /else if \(state\.walkthroughReplay\)/.test(home) && !/!state\.walkthroughCompleted/.test(home));
  t.check("so this learner is not sent through the tour", state.completed && !state.walkthroughReplay);
  const nav = code("src/components/BottomNav.tsx");
  t.check("and has the bottom navigation", /state\?\.completed === true && state\.walkthroughReplay !== true/.test(nav));
  onboarding.resetWalkthrough();
  t.check("Replay the tutorial still works", onboarding.getOnboardingState().walkthroughReplay === true);
  onboarding.completeWalkthrough();
});

await t.section("5. Lessons: the next action dominates", async () => {
  const journey = code("src/components/JourneyMap.tsx");
  const library = code("src/components/ArticleBrowserPage.tsx");
  t.check("no Premium card above the lessons", !/PremiumPromoCard/.test(library));
  t.check("a hero card leads with the next reading", /<NextActionHero/.test(journey) && journey.indexOf("<NextActionHero") < journey.indexOf("Change level"));
  t.check("levels are in a sheet behind Change level, not six permanent pills", /setLevelSheetOpen\(true\)/.test(journey) && /<BottomSheet open=\{levelSheetOpen\}[\s\S]{0,600}<LevelSwitcher/.test(journey));
  t.check("Jump ahead is under More options", /More options<\/summary>[\s\S]{0,400}Jump ahead/.test(journey));
});

await t.section("6. You: a learner hub with settings behind a gear", async () => {
  const hub = code("src/app/settings/page.tsx");
  const prefs = code("src/app/settings/preferences/page.tsx");
  t.check("the tab is You", /label: "You"/.test(code("src/components/BottomNav.tsx")));
  t.check("Your week first, then Library, Learn and Account", hub.indexOf("Your week") < hub.indexOf('title="Library"') && hub.indexOf('title="Library"') < hub.indexOf('title="Learn"') && hub.indexOf('title="Learn"') < hub.indexOf('title="Account"'));
  t.check("vocabulary, phrases, history, grammar and progress are reachable", ["/words", "/words?tab=phrases", "/archive", "/grammar", "/progress"].every((href) => hub.includes(`href="${href}"`)));
  t.check("the gear opens Settings", /href="\/settings\/preferences" aria-label="Settings"/.test(hub));
  t.check("Settings keeps the configuration", ["Reading level", "Theme", "Font size", "English help", "AccountCard", "Replay the tutorial", "/privacy"].every((needle) => prefs.includes(needle)));
});

await t.section("7. Review: one obvious start", async () => {
  const review = code("src/app/review/page.tsx");
  t.check("count, time and one Start review button", /\{readyCount\} \{readyNoun\} ready/.test(review) && /About \{Math\.max\(1/.test(review) && />\s*Start review\s*</.test(review));
  t.check("direction, phrases and length stay under Review options", /Review options[\s\S]{0,900}ReviewDirectionToggle[\s\S]{0,400}SessionLengthToggle/.test(review));
  t.check("calm empty and caught-up states", /No words in Review yet/.test(review) && /You&rsquo;re caught up\./.test(review));
});

await t.section("8. News: a card answers 'do I want to read this?'", async () => {
  const card = code("src/components/ReadingCard.tsx");
  t.check(
    "level · minutes · fit on one line, from the assigned level only (news shows neither)",
    /\{level \?\? "News"\} · \{text\.minutes\} min/.test(card) && /const level = editorialLevel\(text\)/.test(card) && /levelFit\(level, readerLevel\)/.test(card) && !/text\.difficulty/.test(card)
  );
  t.check("no star label on the card", !/starRating\.label/.test(card));
  t.check("source and Save visible", /learnerSourceLabel\(text\)/.test(card) && /aria-pressed=\{savedLater\}/.test(card));
  t.check("advanced actions and Undo kept behind •••", /•••[\s\S]*More like this[\s\S]*Hide source/.test(card) && />\s*Undo\s*</.test(card));
});

await t.section("9. Reader: text first, Listen and English obvious", async () => {
  const reader = code("src/components/Reader.tsx");
  t.check("Listen and English help stay in the toolbar; options are collapsed", /Listen to article/.test(reader) && /English help/.test(reader) && /Reading options/.test(reader));
});

t.finish();
