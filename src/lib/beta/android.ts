import type { ValidationBehaviourContext } from "@/lib/validation/context";

export type AndroidBetaSource =
  | "dashboard"
  | "article_completion"
  | "settings"
  | "progress"
  | "pwa_install_area"
  | "post_session_prompt"
  | "changelog";

export interface AndroidBetaInput {
  email: string;
  source: AndroidBetaSource;
  currentPath: string;
  frenchLevel?: string | null;
  usesAndroid?: boolean | null;
  currentLearningTools?: string | null;
  motivation?: string | null;
  desiredImprovement?: string | null;
  context: ValidationBehaviourContext;
}

export interface NormalizedAndroidBetaInput {
  email: string;
  emailNormalized: string;
  source: AndroidBetaSource;
  currentPath: string;
  frenchLevel: string | null;
  usesAndroid: boolean | null;
  currentLearningTools: string | null;
  motivation: string | null;
  desiredImprovement: string | null;
  context: ValidationBehaviourContext;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_SET = new Set<AndroidBetaSource>([
  "dashboard",
  "article_completion",
  "settings",
  "progress",
  "pwa_install_area",
  "post_session_prompt",
  "changelog",
]);

function cleanText(value: unknown, max = 1000): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

export function normalizeAndroidBetaInput(input: unknown): { ok: true; value: NormalizedAndroidBetaInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid beta registration." };
  const raw = input as Record<string, unknown>;
  const email = cleanText(raw.email, 254);
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  const source = typeof raw.source === "string" && SOURCE_SET.has(raw.source as AndroidBetaSource) ? (raw.source as AndroidBetaSource) : null;
  if (!source) return { ok: false, error: "Missing beta source." };
  const context = raw.context && typeof raw.context === "object" ? (raw.context as ValidationBehaviourContext) : null;
  if (!context) return { ok: false, error: "Missing validation context." };
  return {
    ok: true,
    value: {
      email,
      emailNormalized: email.toLowerCase(),
      source,
      currentPath: cleanText(raw.currentPath, 500) ?? "/",
      frenchLevel: cleanText(raw.frenchLevel, 20),
      usesAndroid: typeof raw.usesAndroid === "boolean" ? raw.usesAndroid : null,
      currentLearningTools: cleanText(raw.currentLearningTools),
      motivation: cleanText(raw.motivation),
      desiredImprovement: cleanText(raw.desiredImprovement),
      context,
    },
  };
}

export function mergeAndroidBetaMetadata(
  existing: Record<string, unknown> | null,
  next: NormalizedAndroidBetaInput,
  now = new Date().toISOString()
): Record<string, unknown> {
  return {
    ...(existing ?? {}),
    email: next.email,
    email_normalized: next.emailNormalized,
    french_level: next.frenchLevel ?? existing?.french_level ?? null,
    uses_android: next.usesAndroid ?? existing?.uses_android ?? null,
    current_learning_tools: next.currentLearningTools ?? existing?.current_learning_tools ?? null,
    motivation: next.motivation ?? existing?.motivation ?? null,
    desired_improvement: next.desiredImprovement ?? existing?.desired_improvement ?? null,
    source: next.source,
    current_path: next.currentPath,
    first_touch_source: next.context.firstTouchSource,
    first_touch_medium: next.context.firstTouchMedium,
    first_touch_campaign: next.context.firstTouchCampaign,
    latest_touch_source: next.context.latestTouchSource,
    is_returning_user: next.context.isReturningUser,
    pwa_installed: next.context.pwaInstalled,
    articles_started: next.context.articlesStarted,
    articles_completed: next.context.articlesCompleted,
    reading_sessions_completed: next.context.readingSessionsCompleted,
    words_saved: next.context.wordsSaved,
    reviews_completed: next.context.reviewsCompleted,
    current_streak: next.context.currentStreak,
    updated_at: now,
  };
}
