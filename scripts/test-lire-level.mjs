import { readFileSync } from "node:fs";

// Progression modules read localStorage at call time, so a minimal in-memory
// stub must exist before they are imported.
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    get length() {
      return store.size;
    },
    key: (i) => [...store.keys()][i] ?? null,
  },
  dispatchEvent: () => true,
};

const { xpForLevel, totalXpToReachLevel, lireLevelFromXp, xpProgressWithinLevel, lireLevelChange } = await import(
  "../src/lib/progression/lireLevel.ts"
);
const { migrateLegacyProgression, readLegacyBandPoints, hasRunLegacyMigration } = await import(
  "../src/lib/progression/migration.ts"
);

/**
 * Lire Level, and the removal of CEFR as a progression ladder.
 *
 * Two systems used to advance a reader through A1, A2, B1, B2 on points alone:
 * gamification.ts titled each XP level with a CEFR band, and levelScore.ts kept
 * a per-band score shown as "A2 - 63/100 to next tier". Neither measured
 * comprehension, so both implied a proficiency claim that reading volume cannot
 * support.
 *
 * These tests pin the separation: XP drives Lire Level and nothing else, and
 * CEFR survives only where it describes how hard the French is.
 */

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) passed++;
  else {
    failed++;
    failures.push(`${label}${detail ? ` - ${detail}` : ""}`);
  }
}

console.log("--- Lire Level is derived only from XP ---");
{
  const zero = lireLevelFromXp(0);
  check("no XP is Level 1", zero.level === 1, String(zero.level));
  check("a fresh reader has no progress into the level", zero.xpIntoLevel === 0);
  check("the first level costs the base amount", zero.xpForNextLevel === xpForLevel(1), String(zero.xpForNextLevel));

  check("one XP short of the threshold stays put", lireLevelFromXp(xpForLevel(1) - 1).level === 1);
  check("hitting the threshold advances one level", lireLevelFromXp(xpForLevel(1)).level === 2);
  check("levels accumulate", lireLevelFromXp(totalXpToReachLevel(5)).level === 5);
  check(
    "progress is a 0-1 fraction",
    xpProgressWithinLevel(xpForLevel(1) / 2) > 0.4 && xpProgressWithinLevel(xpForLevel(1) / 2) < 0.6
  );
  check("negative XP is floored", lireLevelFromXp(-500).level === 1);
}
{
  // The curve must be unbounded. The old one stopped at six levels because
  // there were only six CEFR bands to name them after.
  const high = lireLevelFromXp(500000);
  check("the ladder continues far past six levels", high.level > 40, String(high.level));
  check("a high level still reports a next target", high.xpForNextLevel > 0);
}
{
  check("each level costs more than the last", xpForLevel(2) > xpForLevel(1) && xpForLevel(10) > xpForLevel(9));
  check("the first level is reachable quickly", xpForLevel(1) <= 100, String(xpForLevel(1)));
  check("level 20 costs meaningfully more than level 1", xpForLevel(20) > xpForLevel(1) * 5);
}

console.log("--- Reaching a threshold does not advance CEFR ---");
{
  // The core regression: crossing any amount of XP changes only the number.
  const before = lireLevelFromXp(0);
  const after = lireLevelFromXp(100000);
  check("levelling up produces a numeric level", typeof after.level === "number" && after.level > before.level);
  check("a Lire Level carries no CEFR label", !("title" in after), JSON.stringify(Object.keys(after)));
  for (const key of Object.keys(after)) {
    check(`no CEFR band appears in the level shape (${key})`, !/^(A1|A2|B1|B2|C1|C2)$/.test(String(after[key])));
  }
}
{
  const change = lireLevelChange(xpForLevel(1) + 10, 20);
  check("a change reports the XP awarded", change.xpAwarded === 20);
  check(
    "a change reports before and after",
    change.before.totalXp === xpForLevel(1) - 10 && change.after.totalXp === xpForLevel(1) + 10
  );
  check("crossing a level is flagged", change.levelledUp === true);

  const flat = lireLevelChange(10, 0);
  check("a re-read awards nothing and does not level up", flat.xpAwarded === 0 && flat.levelledUp === false);
  check("a negative award is floored", lireLevelChange(100, -50).xpAwarded === 0);
}

console.log("--- Migration preserves accumulated old progress ---");
{
  store.clear();
  store.set("lire.levelScore.v1", JSON.stringify({ A1: 100, A2: 47, B1: 0, B2: 0, C1: 0, C2: 0 }));
  check("legacy band points are read across all levels", readLegacyBandPoints() === 147, String(readLegacyBandPoints()));

  let awarded = 0;
  const result = migrateLegacyProgression((xp) => {
    awarded += xp;
  });
  check("migration reports it ran", result.migrated === true);
  check("all bands are folded into one total", result.legacyPoints === 147);
  check("legacy progress becomes XP", awarded > 0 && awarded === result.awardedXp, String(awarded));
  check("the conversion is proportional to the work done", awarded === 294, String(awarded));
  check("migration is marked complete", hasRunLegacyMigration() === true);

  let secondAward = 0;
  const again = migrateLegacyProgression((xp) => {
    secondAward += xp;
  });
  check("a second run credits nothing", secondAward === 0 && again.migrated === false);
}
{
  store.clear();
  let awarded = 0;
  const result = migrateLegacyProgression((xp) => {
    awarded += xp;
  });
  check("a reader with no legacy progress is unaffected", result.migrated === false && awarded === 0);
}
{
  store.clear();
  store.set("lire.levelScore.v1", "not json");
  check("corrupt legacy data reads as zero rather than throwing", readLegacyBandPoints() === 0);
}
{
  // A reader mid-way through the old ladder must not end up lower than before.
  store.clear();
  store.set("lire.levelScore.v1", JSON.stringify({ A1: 100, A2: 100, B1: 60, B2: 0, C1: 0, C2: 0 }));
  let awarded = 0;
  migrateLegacyProgression((xp) => {
    awarded += xp;
  });
  const migratedLevel = lireLevelFromXp(awarded).level;
  check("substantial old progress lands well up the new ladder", migratedLevel >= 4, `level ${migratedLevel} from ${awarded} XP`);
}

console.log("--- CEFR is gone from progression logic ---");
{
  const gamification = readFileSync(new URL("../src/lib/gamification.ts", import.meta.url), "utf8");
  // Matches the declaration, not prose: the file explains in a comment what
  // was removed and why, and that explanation should not fail its own test.
  check("no CEFR-titled level ladder remains", !/const LEVEL_TITLES\s*=/.test(gamification));
  check("no level is assigned a CEFR title", !/title:\s*LEVEL_TITLES/.test(gamification));
  check("no CEFR-named XP thresholds remain", !/CEFR_LEVEL_THRESHOLDS/.test(gamification));
  check("the level shape has no title field", !/export interface ReaderLevel \{[^}]*title: string/s.test(gamification));
  check("the level curve is delegated to the progression module", /lireLevelFromXp/.test(gamification));
}
{
  let stillPresent = true;
  try {
    readFileSync(new URL("../src/lib/levelScore.ts", import.meta.url), "utf8");
  } catch {
    stillPresent = false;
  }
  check("the per-CEFR band score module is deleted", stillPresent === false);
}

console.log("--- No production UI shows CEFR as a progression ladder ---");
{
  const cards = readFileSync(new URL("../src/components/GamificationCards.tsx", import.meta.url), "utf8");
  check("the CEFR step bar is removed from the progress card", !/aria-label="CEFR progress"/.test(cards));
  check("the progress card has no CEFR step array", !/cefrSteps/.test(cards));
  check("the progress card names Lire Level", /Lire Level \{level\.level\}/.test(cards));

  const complete = readFileSync(new URL("../src/components/LessonCompleteScreen.tsx", import.meta.url), "utf8");
  check("the completion screen no longer shows a per-band score", !/to next tier/.test(complete));
  check("the completion screen no longer lists every CEFR level as bars", !/TAUGHT_LEVELS/.test(complete));
  check("the completion screen shows Lire Level", /Lire Level \{shownLevel\.level\}/.test(complete));
  check("reading difficulty is labelled separately", /Reading difficulty/.test(complete));
  check("the completion screen imports no band maths", !/bandProgress|bandNumber/.test(complete));
}

console.log("--- CEFR remains available as content difficulty ---");
{
  const types = readFileSync(new URL("../src/types.ts", import.meta.url), "utf8");
  check("Difficulty still describes text difficulty", /export type Difficulty =[\s\S]{0,120}"B2"/.test(types));

  const ladder = readFileSync(new URL("../src/lib/journey/ladder.ts", import.meta.url), "utf8");
  check("the journey ladder still uses CEFR bands for lesson difficulty", /A1|A2|B1|B2/.test(ladder));

  const onboarding = readFileSync(new URL("../src/lib/onboarding.ts", import.meta.url), "utf8");
  check("onboarding still records a reading-difficulty preference", /A1|A2|B1|B2/.test(onboarding));
}

if (failures.length > 0) {
  console.log("");
  for (const failure of failures) console.log(`FAIL ${failure}`);
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
