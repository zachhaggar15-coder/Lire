import type { Difficulty } from "@/types";
import { pushStore } from "@/lib/supabase/sync";

/**
 * Per-CEFR-level proficiency score.
 *
 * The existing gamification module tracks one global XP total and a single
 * reader level. That answers "how much have you read overall", but it can't
 * answer "how am I doing at B1 specifically" — and the lesson-complete screen
 * shows exactly that: a bar for the level you just read at, filling up as you
 * finish more texts at that level.
 *
 * Each CEFR level keeps its own running score. Completing a text adds points
 * to the score for that text's level (see {@link levelPointsForCompletion}).
 * The bar on the completion screen shows progress within the current 100-point
 * band, so every handful of lessons produces a visible, satisfying jump.
 */

const LEVEL_SCORE_KEY = "lire.levelScore.v1";

/** One filled bar = this many points. Crossing it rolls to the next band. */
export const LEVEL_SCORE_BAND = 100;

/** The four levels the app actually teaches, in order — used for the breakdown. */
export const TAUGHT_LEVELS: Difficulty[] = ["A1", "A2", "B1", "B2"];

export type LevelScores = Record<Difficulty, number>;

const EMPTY_SCORES: LevelScores = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readAll(): LevelScores {
  if (!hasStorage()) return { ...EMPTY_SCORES };
  try {
    const raw = window.localStorage.getItem(LEVEL_SCORE_KEY);
    if (!raw) return { ...EMPTY_SCORES };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...EMPTY_SCORES };
    const out = { ...EMPTY_SCORES };
    for (const level of Object.keys(EMPTY_SCORES) as Difficulty[]) {
      const value = (parsed as Record<string, unknown>)[level];
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        out[level] = Math.round(value);
      }
    }
    return out;
  } catch {
    return { ...EMPTY_SCORES };
  }
}

function persist(all: LevelScores): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(LEVEL_SCORE_KEY, JSON.stringify(all));
    void pushStore(LEVEL_SCORE_KEY);
  } catch {
    // A full quota shouldn't break finishing a lesson; the score is a nicety.
  }
}

export function getLevelScores(): LevelScores {
  return readAll();
}

export function getLevelScore(level: Difficulty): number {
  return readAll()[level] ?? 0;
}

export interface LevelScoreChange {
  level: Difficulty;
  before: number;
  after: number;
  delta: number;
}

/**
 * Add points to a level's score. Returns before/after/delta so the completion
 * screen can animate the bar from the old value to the new one.
 */
export function addLevelScore(level: Difficulty, points: number): LevelScoreChange {
  const all = readAll();
  const before = all[level] ?? 0;
  const delta = Math.max(0, Math.round(points));
  const after = before + delta;
  all[level] = after;
  persist(all);
  return { level, before, after, delta };
}

/** Progress (0–1) through the current 100-point band. */
export function bandProgress(score: number): number {
  const withinBand = ((score % LEVEL_SCORE_BAND) + LEVEL_SCORE_BAND) % LEVEL_SCORE_BAND;
  return withinBand / LEVEL_SCORE_BAND;
}

/** Which band the score sits in (1-based), e.g. 120 → band 2. */
export function bandNumber(score: number): number {
  return Math.floor(score / LEVEL_SCORE_BAND) + 1;
}

export interface LevelPointsInput {
  savedWords: number;
  wordsTapped: number;
  comprehensionCorrect: number;
  comprehensionTotal: number;
  /** Re-reading an already-finished text shouldn't keep inflating the score. */
  alreadyCompleted: boolean;
}

/**
 * Points a single completion is worth.
 *
 * Finishing is the main thing (base 5), so every lesson moves the bar. Saving
 * and tapping words shows engagement and adds a little on top; getting the
 * comprehension check fully right adds a small bonus. Kept deliberately modest
 * and capped so a band (100 pts) is roughly 10–15 lessons — frequent visible
 * progress without trivialising the bar. Re-reads award nothing.
 */
export function levelPointsForCompletion(input: LevelPointsInput): number {
  if (input.alreadyCompleted) return 0;
  let points = 5;
  points += Math.min(3, input.savedWords);
  if (input.wordsTapped > 0) points += 1;
  if (input.comprehensionTotal > 0 && input.comprehensionCorrect === input.comprehensionTotal) {
    points += 2;
  }
  return points;
}

export function clearLevelScores(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(LEVEL_SCORE_KEY);
    void pushStore(LEVEL_SCORE_KEY);
  } catch {
    // ignore
  }
}
