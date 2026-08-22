import { pushStore } from "@/lib/supabase/sync";

/**
 * Folding the retired CEFR-band scores into the XP total.
 *
 * The old completion screen kept a separate score per CEFR band — "A2 · 63/100
 * to next tier" — awarded roughly 5–11 points per finished lesson. Those points
 * recorded real work, so deleting the store would wipe progress a reader
 * earned; but keeping it would preserve the very implication being removed,
 * that finishing enough A2 texts advances you to B1.
 *
 * The migration keeps the effort and drops the claim: every band's score is
 * summed into one number and converted to XP, after which the CEFR dimension no
 * longer exists anywhere in progression.
 *
 * Runs once and records that it has, so a reader who keeps using the app cannot
 * have the same historical points credited twice.
 */

const LEGACY_LEVEL_SCORE_KEY = "lire.levelScore.v1";
const MIGRATION_KEY = "lire.progression.cefrToLireLevel.v1";

/**
 * XP per legacy band point.
 *
 * A finished lesson was worth about 8 band points and is worth 20 XP under the
 * new economy, so 2 keeps a reader's accumulated total in roughly the same
 * proportion to their activity. Erring low is deliberate: the new curve starts
 * much faster than the old one, so an under-conversion still leaves nobody
 * lower than they were.
 */
const XP_PER_LEGACY_POINT = 2;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export interface LegacyProgressionMigration {
  /** True when there was legacy progress to convert. */
  migrated: boolean;
  /** Total legacy band points found across all CEFR levels. */
  legacyPoints: number;
  /** XP credited as a result. */
  awardedXp: number;
}

/** Reads the retired per-CEFR store without resurrecting any of its behaviour. */
export function readLegacyBandPoints(): number {
  if (!hasStorage()) return 0;
  try {
    const raw = window.localStorage.getItem(LEGACY_LEVEL_SCORE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return 0;
    return Object.values(parsed as Record<string, unknown>).reduce<number>((sum, value) => {
      return typeof value === "number" && Number.isFinite(value) && value > 0 ? sum + value : sum;
    }, 0);
  } catch {
    return 0;
  }
}

export function hasRunLegacyMigration(): boolean {
  if (!hasStorage()) return false;
  return window.localStorage.getItem(MIGRATION_KEY) !== null;
}

/**
 * Converts legacy band points to XP exactly once.
 *
 * `awardXp` is injected rather than imported so this stays testable and so the
 * dependency runs one way: progression owns the migration, gamification owns
 * the XP ledger.
 */
export function migrateLegacyProgression(
  awardXp: (xp: number) => void
): LegacyProgressionMigration {
  if (!hasStorage() || hasRunLegacyMigration()) {
    return { migrated: false, legacyPoints: 0, awardedXp: 0 };
  }

  const legacyPoints = readLegacyBandPoints();
  const awardedXp = Math.round(legacyPoints * XP_PER_LEGACY_POINT);
  if (awardedXp > 0) awardXp(awardedXp);

  try {
    window.localStorage.setItem(
      MIGRATION_KEY,
      JSON.stringify({ migratedAt: new Date().toISOString(), legacyPoints, awardedXp })
    );
    // The legacy store is left in place rather than deleted: it is no longer
    // read by anything, and keeping it means a bug in this conversion can be
    // investigated against the real data instead of a guess.
    void pushStore(MIGRATION_KEY);
  } catch {
    // A failed marker write would only risk re-crediting on a later run, which
    // is better than failing the app start.
  }

  return { migrated: awardedXp > 0, legacyPoints, awardedXp };
}
