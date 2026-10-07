/**
 * The Free / Premium feature matrix — the single source of truth.
 *
 * Every gate in the app, the Premium page, Settings and the store listing
 * (docs/play-store-listing-final.md) describe these same rows. Components ask
 * `canUse(context, feature)`; none of them decide Premium rules themselves.
 *
 * Product decision (launch, Oct 2026): Free is a genuinely useful French
 * reader. Premium sells intelligence and unlimited capacity:
 *   - Free: reading, News, importing, listening, the offline dictionary,
 *     5 NEW saved words a day, unlimited review of saved words, grammar
 *     lessons and non-AI exercises, progress.
 *   - Premium: unlimited saving and every AI feature.
 *
 * Enforcement: AI and synced saves beyond the free limit are enforced by the
 * server (ai/guard.ts, sorlio_sync_push). The client mirrors the same rules so
 * the UI is honest; a guest's daily save count is device-local by design (no
 * fingerprinting).
 */

export type AccessTier = "guest" | "free" | "premium";

export type Feature =
  | "reading"
  | "news"
  | "importText"
  | "listening"
  | "dictionaryLookup"
  | "saveWord"
  | "review"
  | "grammarLessons"
  | "grammarExercises"
  | "practiceExercises"
  | "listeningPractice"
  | "comprehension"
  | "progress"
  | "unlimitedSaves"
  | "aiWordHelp"
  | "aiSentenceHelp"
  | "aiTranslation"
  | "aiPractice";

export const FREE_DAILY_NEW_SAVES = 5;

type Availability = "included" | "limited" | "premium";

interface FeatureRow {
  /** Plain-language name for UI and docs. */
  label: string;
  free: Availability;
  /** Shown in the matrix on the Premium page and in docs. */
  freeDetail?: string;
}

export const FEATURES: Record<Feature, FeatureRow> = {
  reading: { label: "Read Sorlio texts at your level", free: "included" },
  news: { label: "Read live French news", free: "included" },
  importText: { label: "Import your own French text", free: "included" },
  listening: { label: "Listen while you read", free: "included" },
  dictionaryLookup: { label: "Tap any word for its meaning (built-in dictionary)", free: "included" },
  saveWord: { label: "Save new words to review", free: "limited", freeDetail: `${FREE_DAILY_NEW_SAVES} new words a day` },
  review: { label: "Review your saved words", free: "included", freeDetail: "Unlimited" },
  grammarLessons: { label: "Grammar lessons", free: "included" },
  grammarExercises: { label: "Grammar exercises", free: "included" },
  practiceExercises: { label: "Practice exercises after reading", free: "included" },
  listeningPractice: { label: "Listening practice", free: "included" },
  comprehension: { label: "Comprehension checks", free: "included" },
  progress: { label: "Progress and streaks", free: "included" },
  unlimitedSaves: { label: "Save as many words as you like", free: "premium" },
  aiWordHelp: { label: "AI explanations of words and phrases in context", free: "premium" },
  aiSentenceHelp: { label: "AI explanations of whole sentences", free: "premium" },
  aiTranslation: { label: "Natural AI translation of news and imported texts", free: "premium" },
  aiPractice: { label: "AI-generated paraphrase practice", free: "premium" },
};

export const PREMIUM_ONLY_FEATURES = (Object.keys(FEATURES) as Feature[]).filter((key) => FEATURES[key].free === "premium");

export function isPremiumOnly(feature: Feature): boolean {
  return FEATURES[feature].free === "premium";
}
