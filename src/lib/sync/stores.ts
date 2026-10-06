/**
 * The local stores that are backed up to a signed-in account.
 *
 * This list must match `sorlio_sync_stores` in
 * supabase/migrations/0010_item_sync.sql — the server refuses unknown stores.
 * scripts/test-sync-engine.mjs checks the two lists agree.
 *
 * Each store is split into items for sync:
 *   list-by-id       one item per element, keyed by `idField`
 *   list-of-strings  one item per string (data: true)
 *   record           one item per key
 *   object           a single item "__value__" holding the whole object
 *
 * Deliberately absent:
 *   - lire.rssTexts.offline — offline copies of public news; a device cache.
 *   - lire.validation.v1 — retired analytics state.
 *   - AI response caches — derived data, and they can contain fragments of
 *     imported (private) text.
 */

export type StoreKind = "list-by-id" | "list-of-strings" | "record" | "object";

export interface SyncedStoreConfig {
  key: string;
  kind: StoreKind;
  idField?: string;
  /** Where items that arrive from another device are placed in a list. */
  insertNew?: "start" | "end";
  /** Only synced when the account has opted in (see syncPreferences.ts). */
  optIn?: "importedTexts";
}

export const OBJECT_ITEM_ID = "__value__";

export const SYNCED_STORES: SyncedStoreConfig[] = [
  { key: "lire.savedWords.v1", kind: "list-by-id", idField: "word", insertNew: "start" },
  { key: "lire.knownWords.v1", kind: "list-of-strings" },
  { key: "lire.archive.v1", kind: "list-by-id", idField: "textId", insertNew: "start" },
  { key: "lire.progress.v1", kind: "record" },
  { key: "lire.journey.v1", kind: "object" },
  // Retired per-CEFR band score. Still synced so a device that has not yet
  // run the migration can convert it to XP; nothing writes to it any more.
  { key: "lire.levelScore.v1", kind: "record" },
  { key: "lire.progress.lastOpened", kind: "object" },
  { key: "lire.progression.cefrToLireLevel.v1", kind: "object" },
  { key: "lire.customTexts.v1", kind: "list-by-id", idField: "id", insertNew: "start", optIn: "importedTexts" },
  { key: "lire.customDictionary.v1", kind: "list-by-id", idField: "lemma" },
  { key: "lire.interestProfile.v1", kind: "object" },
  { key: "lire.recommendation.hiddenSources.v1", kind: "list-of-strings" },
  { key: "lire.recommendation.preferredSources.v1", kind: "list-of-strings" },
  { key: "lire.recommendation.savedLater.v1", kind: "list-of-strings" },
  { key: "lire.onboarding.v1", kind: "object" },
  { key: "lire.activityDates.v1", kind: "list-of-strings" },
  { key: "lire.streakGrace.v1", kind: "object" },
  { key: "lire.settings.v1", kind: "object" },
  { key: "lire.syncPreferences.v1", kind: "object" },
  { key: "lire.goals.v1", kind: "object" },
  { key: "lire.reviewPrefs.v1", kind: "object" },
  { key: "lire.savedPhrases.v1", kind: "list-by-id", idField: "phrase", insertNew: "start" },
  { key: "lire.dictionaryFeedback.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.articleFeedback.v1", kind: "list-by-id", idField: "textId" },
  { key: "lire.comprehensionQuestions.v1", kind: "list-by-id", idField: "textId" },
  { key: "lire.wordTapStats.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.inferredWords.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.translationBudget.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.secondPass.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.gamification.xpEvents.v1", kind: "list-by-id", idField: "id", insertNew: "start" },
  { key: "lire.gamification.articleCompletions.v1", kind: "list-by-id", idField: "id", insertNew: "start" },
  { key: "lire.gamification.achievements.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.gamification.passport.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.gamification.mastery.v1", kind: "list-by-id", idField: "word" },
  { key: "lire.grammar.progress.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.grammar.practiceEvents.v1", kind: "list-by-id", idField: "id" },
  { key: "lire.practiceCompleted.v1", kind: "list-of-strings" },
  { key: "lire.listeningPracticeCompleted.v1", kind: "list-of-strings" },
  { key: "lire.lookupStats.v1", kind: "list-by-id", idField: "textId" },
  { key: "lire.sessionRecords.v1", kind: "list-by-id", idField: "textId" },
  { key: "lire.translationReports.v1", kind: "list-by-id", idField: "id" },
];

const BY_KEY = new Map(SYNCED_STORES.map((config) => [config.key, config]));

export function configForKey(key: string): SyncedStoreConfig | undefined {
  return BY_KEY.get(key);
}
