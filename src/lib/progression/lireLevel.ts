/**
 * Sorlio Level — the app's progression ladder.
 *
 * This replaces two systems that both used CEFR bands as a progression tier,
 * which meant accumulating points appeared to raise the reader's French
 * proficiency:
 *
 *   - gamification.ts titled each XP level with a CEFR band, so crossing an XP
 *     threshold moved someone from "A1 Starter" to "A2 Reader" to "B1 Bridge".
 *   - levelScore.ts kept a per-CEFR score in 100-point bands, so the completion
 *     screen showed "A2 · 63/100 to next tier" and rolled over into the next
 *     band once enough lessons were finished.
 *
 * Neither measured comprehension. Both implied a proficiency claim that reading
 * volume cannot support: a reader who finishes forty A1 texts has demonstrated
 * persistence, not B1 ability.
 *
 * Sorlio Level makes no such claim. It counts meaningful activity and nothing
 * else, and it is deliberately unbounded — there is no top rung to reach and no
 * band whose name says anything about French. CEFR keeps its real job of
 * describing how hard a text is; see `Difficulty` in types.ts.
 */

/**
 * XP needed to advance *from* `level` to the next one.
 *
 * Gently quadratic: early levels arrive quickly so a new reader sees movement
 * in their first session, and the cost grows steadily so a high level reflects
 * sustained use rather than a weekend. Unlike the ladder it replaces this has
 * no ceiling, which is the point — the old curve stopped at six levels because
 * there were only six CEFR bands to name them after.
 *
 * Calibration parameters, not derived constants: tune them here rather than
 * anywhere else.
 */
const BASE_XP = 80;
const LINEAR_GROWTH = 40;
const QUADRATIC_GROWTH = 4;

export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level)) - 1;
  return BASE_XP + LINEAR_GROWTH * n + QUADRATIC_GROWTH * n * n;
}

/** Total XP needed to *reach* `level` from zero. */
export function totalXpToReachLevel(level: number): number {
  let total = 0;
  for (let step = 1; step < Math.max(1, Math.floor(level)); step++) total += xpForLevel(step);
  return total;
}

export interface LireLevel {
  /** 1-based, unbounded. */
  level: number;
  /** Lifetime XP. */
  totalXp: number;
  /** XP earned since reaching the current level. */
  xpIntoLevel: number;
  /** XP required to move from the current level to the next. */
  xpForNextLevel: number;
  /** 0–1 through the current level, for a progress bar. */
  progress: number;
}

/**
 * Where a lifetime XP total sits on the ladder.
 *
 * Iterative rather than closed-form because the curve is meant to stay easy to
 * change; the loop is bounded by the level reached, which is small for any
 * realistic XP total.
 */
export function lireLevelFromXp(totalXp: number): LireLevel {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const xpForNextLevel = xpForLevel(level);
  return {
    level,
    totalXp: xp,
    xpIntoLevel: remaining,
    xpForNextLevel,
    progress: xpForNextLevel === 0 ? 0 : Math.min(1, remaining / xpForNextLevel),
  };
}

/** Progress through the current level only — for callers that need just the bar. */
export function xpProgressWithinLevel(totalXp: number): number {
  return lireLevelFromXp(totalXp).progress;
}

/**
 * A Sorlio Level movement caused by one activity, for the completion screen.
 *
 * Derived from the XP ledger rather than from a parallel score: the completion
 * screen used to animate a per-CEFR band that nothing else in the app knew
 * about, so the number it celebrated and the reader's actual progression were
 * two different things.
 */
export interface LireLevelChange {
  xpAwarded: number;
  before: LireLevel;
  after: LireLevel;
  /** True when this activity crossed into a new Sorlio Level. */
  levelledUp: boolean;
}

export function lireLevelChange(totalXpAfter: number, xpAwarded: number): LireLevelChange {
  const after = lireLevelFromXp(totalXpAfter);
  const before = lireLevelFromXp(Math.max(0, totalXpAfter - Math.max(0, xpAwarded)));
  return { xpAwarded: Math.max(0, xpAwarded), before, after, levelledUp: after.level > before.level };
}
