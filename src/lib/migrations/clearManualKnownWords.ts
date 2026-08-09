import { buildKnownWordBootstrapList } from "@/lib/knownWordBootstrap";
import { getKnownWords, removeKnown } from "@/lib/knownWords";
import { getOnboardingState } from "@/lib/onboarding";
import { getSavedWords } from "@/lib/storage";

/**
 * One-time cleanup of words marked "known" by the reader's retired Known
 * button (removed when the word card was simplified to a single Save toggle).
 *
 * That button wrote the word and its lemma into lire.knownWords.v1 and then
 * deleted the word from the saved-word deck, so those marks survive only as
 * bare strings in the known list — where they still grey the word out while
 * reading, with no remaining UI to undo them.
 *
 * The known list has no provenance field, and two other sources write to it
 * that must survive untouched:
 *   - the onboarding seed (500-8000 lemmas for the chosen level), and
 *   - review graduations, which also keep a saved-word row at status "known".
 * Both are reconstructable: the seed is deterministic for a given level, and
 * graduations are exactly the saved words still carrying "known". Anything in
 * the list that is neither came from the retired button.
 */

const MIGRATION_KEY = "lire.migrations.clearManualKnown.v1";

/**
 * If the seed rebuild comes back materially short of what onboarding recorded
 * seeding, the generated dictionary didn't load (buildKnownWordBootstrapList
 * degrades to the curated list rather than throwing). Treating that partial
 * list as the whole seed would delete thousands of legitimately known words,
 * so the migration aborts and stays unmarked to retry on a later launch.
 */
const SEED_COMPLETENESS_RATIO = 0.9;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export async function clearManualKnownWords(): Promise<void> {
  if (!hasStorage()) return;
  if (window.localStorage.getItem(MIGRATION_KEY)) return;

  const known = getKnownWords();
  if (known.length === 0) {
    window.localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
    return;
  }

  const onboarding = getOnboardingState();
  const seededCount = onboarding?.seededKnownWords ?? 0;

  let seed = new Set<string>();
  if (seededCount > 0) {
    let seedList: string[];
    try {
      seedList = await buildKnownWordBootstrapList(onboarding?.level ?? "A1");
    } catch {
      return;
    }
    if (seedList.length < seededCount * SEED_COMPLETENESS_RATIO) return;
    seed = new Set(seedList.map((lemma) => lemma.toLowerCase()));
  }

  const graduated = new Set<string>();
  for (const word of getSavedWords()) {
    if (word.status !== "known") continue;
    graduated.add(word.word.toLowerCase());
    if (word.lemma) graduated.add(word.lemma.toLowerCase());
  }

  // removeKnown one at a time rather than rewriting the array wholesale: it
  // records a per-key deletion so the change propagates through Supabase sync
  // instead of looking like a stale local copy.
  for (const entry of known) {
    if (seed.has(entry) || graduated.has(entry)) continue;
    removeKnown(entry);
  }

  window.localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
}
