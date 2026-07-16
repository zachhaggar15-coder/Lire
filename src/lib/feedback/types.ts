export const FEEDBACK_CATEGORIES = [
  "useful",
  "too_easy",
  "too_difficult",
  "translation_issue",
  "dictionary_issue",
  "article_issue",
  "confusing",
  "technical_problem",
  "other",
  "return_reason",
  "disappearance_survey",
  "session_reaction",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackSentiment = "positive" | "neutral" | "negative" | null;

export interface FeedbackInput {
  category: FeedbackCategory;
  sentiment?: FeedbackSentiment;
  page: string;
  feature: string;
  articleId?: string | null;
  affectedTerm?: string | null;
  comment?: string | null;
  sessionId?: string | null;
  anonymousId?: string | null;
  userId?: string | null;
}

const CATEGORY_SET = new Set<string>(FEEDBACK_CATEGORIES);

function clean(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

export function normalizeFeedbackInput(input: unknown): { ok: true; value: FeedbackInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid feedback." };
  const raw = input as Record<string, unknown>;
  const category = typeof raw.category === "string" && CATEGORY_SET.has(raw.category) ? (raw.category as FeedbackCategory) : null;
  if (!category) return { ok: false, error: "Choose a feedback category." };
  const sentiment = raw.sentiment === "positive" || raw.sentiment === "neutral" || raw.sentiment === "negative" ? raw.sentiment : null;
  return {
    ok: true,
    value: {
      category,
      sentiment,
      page: clean(raw.page, 300) ?? "/",
      feature: clean(raw.feature, 80) ?? "general",
      articleId: clean(raw.articleId, 160),
      affectedTerm: clean(raw.affectedTerm, 160),
      comment: clean(raw.comment, 2000),
      sessionId: clean(raw.sessionId, 160),
      anonymousId: clean(raw.anonymousId, 160),
      userId: clean(raw.userId, 160),
    },
  };
}
