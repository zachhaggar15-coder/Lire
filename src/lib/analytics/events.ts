export const ANALYTICS_EVENT_NAMES = [
  "app_opened",
  "dashboard_viewed",
  "first_visit_detected",
  "onboarding_started",
  "onboarding_completed",
  "content_section_opened",
  "reading_card_viewed",
  "reading_card_selected",
  "article_opened",
  "reading_session_started",
  "reading_progress_25",
  "reading_progress_50",
  "reading_progress_75",
  "article_completed",
  "meaningful_reading_session_completed",
  "reading_session_abandoned",
  "reread_started",
  "comprehension_started",
  "comprehension_completed",
  "word_lookup_opened",
  "word_marked_known",
  "word_marked_unsure",
  "word_saved",
  "phrase_support_opened",
  "sentence_support_opened",
  "ai_word_explanation_requested",
  "ai_sentence_explanation_requested",
  "speech_playback_used",
  "review_session_started",
  "review_answer_submitted",
  "review_session_completed",
  "grammar_session_started",
  "grammar_session_completed",
  "daily_activity_recorded",
  "streak_extended",
  "return_visit_detected",
  "second_active_day_reached",
  "third_reading_session_completed",
  "user_activated",
  "user_strongly_activated",
  "habit_forming_usage_reached",
  "pwa_install_prompt_shown",
  "pwa_install_clicked",
  "pwa_install_dismissed",
  "pwa_installed",
  "android_beta_cta_viewed",
  "android_beta_clicked",
  "android_beta_form_started",
  "android_beta_joined",
  "feedback_opened",
  "feedback_submitted",
  "session_reaction_submitted",
  "return_reason_submitted",
  "disappearance_survey_submitted",
  "changelog_opened",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsPrimitive = string | number | boolean | null;
export type AnalyticsPayload = Record<string, AnalyticsPrimitive | AnalyticsPrimitive[] | undefined>;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  payload: AnalyticsPayload;
  anonymousId: string | null;
  authenticatedUserId?: string | null;
  sessionId: string;
  createdAt: string;
  appVersion: string;
  deploymentEnvironment: "local" | "preview" | "production";
}

const NAME_SET = new Set<string>(ANALYTICS_EVENT_NAMES);
const BANNED_KEYS = new Set([
  "articleBody",
  "body",
  "fullText",
  "importedText",
  "translation",
  "sentence",
  "selectedSentence",
  "openAiResponse",
  "aiResponse",
  "email",
  "comment",
  "note",
  "personalText",
]);

const REQUIRED_KEYS: Partial<Record<AnalyticsEventName, string[]>> = {
  reading_card_selected: ["articleId"],
  article_opened: ["articleId"],
  reading_session_started: ["articleId"],
  article_completed: ["articleId"],
  meaningful_reading_session_completed: ["articleId", "activeMs", "maxProgressPercent"],
  android_beta_clicked: ["source"],
  android_beta_cta_viewed: ["source"],
  android_beta_joined: ["source"],
  feedback_submitted: ["category"],
};

function isAllowedValue(value: unknown): boolean {
  if (value == null) return true;
  if (["string", "number", "boolean"].includes(typeof value)) return true;
  return Array.isArray(value) && value.every((item) => item == null || ["string", "number", "boolean"].includes(typeof item));
}

export function isAnalyticsEventName(name: string): name is AnalyticsEventName {
  return NAME_SET.has(name);
}

export function validateAnalyticsPayload(name: AnalyticsEventName, payload: AnalyticsPayload = {}): { ok: true } | { ok: false; error: string } {
  const required = REQUIRED_KEYS[name] ?? [];
  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      return { ok: false, error: `Missing required analytics property: ${key}` };
    }
  }
  for (const [key, value] of Object.entries(payload)) {
    if (BANNED_KEYS.has(key)) return { ok: false, error: `Analytics payload contains banned property: ${key}` };
    if (!isAllowedValue(value)) return { ok: false, error: `Analytics payload contains unsupported value for: ${key}` };
    if (typeof value === "string" && value.length > 500) return { ok: false, error: `Analytics payload property is too long: ${key}` };
  }
  return { ok: true };
}

export function sanitizeAnalyticsPayload(payload: AnalyticsPayload = {}): AnalyticsPayload {
  const out: AnalyticsPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (BANNED_KEYS.has(key) || value === undefined || !isAllowedValue(value)) continue;
    if (typeof value === "string") out[key] = value.slice(0, 500);
    else out[key] = value;
  }
  return out;
}
