export type ResearchContextValue = string | number | boolean | null;
export type ResearchContext = Record<string, ResearchContextValue>;

const STRING_LIMITS = {
  anonymousId: 160,
  firstSeenAt: 40,
  frenchLevel: 20,
  firstTouchSource: 160,
  firstTouchMedium: 160,
  firstTouchCampaign: 160,
  latestTouchSource: 160,
  acquisitionSource: 160,
  articleId: 160,
} as const;

const BOOLEAN_KEYS = ["isReturningUser", "pwaInstalled"] as const;
const COUNT_KEYS = [
  "articlesStarted",
  "articlesCompleted",
  "readingSessionsCompleted",
  "wordsSaved",
  "reviewsCompleted",
  "currentStreak",
] as const;

const MAX_CONTEXT_COUNT = 1_000_000;

function cleanString(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function cleanCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(MAX_CONTEXT_COUNT, Math.max(0, Math.trunc(value)));
}

/**
 * Reduces caller-supplied research context to the product's documented,
 * low-sensitivity behavioural fields. Unknown and nested values are dropped,
 * and every retained value has a strict bound.
 */
export function sanitizeResearchContext(input: unknown): ResearchContext {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const raw = input as Record<string, unknown>;
  const safe: ResearchContext = {};

  for (const [key, max] of Object.entries(STRING_LIMITS)) {
    const value = cleanString(raw[key], max);
    if (value !== null) safe[key] = value;
  }
  for (const key of BOOLEAN_KEYS) {
    if (typeof raw[key] === "boolean") safe[key] = raw[key];
  }
  for (const key of COUNT_KEYS) {
    const value = cleanCount(raw[key]);
    if (value !== null) safe[key] = value;
  }

  return safe;
}
