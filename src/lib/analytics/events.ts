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
  "audio_played",
  "full_text_audio_played",
  "lesson_completed",
  "progress_page_viewed",
  "progress_comparison_displayed",
  "first_word_lookup",
  "first_word_saved",
  "initial_level_selected",
  "intro_text_completed",
  "onboarding_skipped",
  "tutorial_restarted",
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
  "rate_prompt_shown",
  "rate_app_opened",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsPrimitive = string | number | boolean | null;
export type AnalyticsPayload = Record<string, AnalyticsPrimitive | AnalyticsPrimitive[] | undefined>;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  payload: AnalyticsPayload;
  anonymousId: string | null;
  sessionId: string;
  createdAt: string;
  appVersion: string;
  deploymentEnvironment: "local" | "preview" | "production";
}

const NAME_SET = new Set<string>(ANALYTICS_EVENT_NAMES);
const MAX_PAYLOAD_PROPERTIES = 40;
const MAX_PROPERTY_NAME_LENGTH = 80;
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_LENGTH = 25;
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
  "userId",
  "user_id",
  "authenticatedUserId",
  "authenticated_user_id",
  "accountId",
  "account_id",
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

function isAllowedPrimitive(value: unknown): value is AnalyticsPrimitive {
  if (value === null) return true;
  if (typeof value === "number") return Number.isFinite(value);
  return typeof value === "string" || typeof value === "boolean";
}

function isAllowedValue(value: unknown): value is AnalyticsPrimitive | AnalyticsPrimitive[] {
  if (isAllowedPrimitive(value)) return true;
  return Array.isArray(value) && value.length <= MAX_ARRAY_LENGTH && value.every(isAllowedPrimitive);
}

function isSanitizableValue(value: unknown): value is AnalyticsPrimitive | AnalyticsPrimitive[] {
  return isAllowedPrimitive(value) || (Array.isArray(value) && value.every(isAllowedPrimitive));
}

function isOversizedString(value: AnalyticsPrimitive): boolean {
  return typeof value === "string" && value.length > MAX_STRING_LENGTH;
}

export function isAnalyticsEventName(name: string): name is AnalyticsEventName {
  return NAME_SET.has(name);
}

export function validateAnalyticsPayload(name: AnalyticsEventName, payload: AnalyticsPayload = {}): { ok: true } | { ok: false; error: string } {
  const entries = Object.entries(payload);
  if (entries.length > MAX_PAYLOAD_PROPERTIES) {
    return { ok: false, error: "Analytics payload contains too many properties." };
  }
  const required = REQUIRED_KEYS[name] ?? [];
  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      return { ok: false, error: `Missing required analytics property: ${key}` };
    }
  }
  for (const [key, value] of entries) {
    if (key.length === 0 || key.length > MAX_PROPERTY_NAME_LENGTH) {
      return { ok: false, error: "Analytics payload contains an invalid property name." };
    }
    if (BANNED_KEYS.has(key)) return { ok: false, error: `Analytics payload contains banned property: ${key}` };
    if (!isAllowedValue(value)) return { ok: false, error: `Analytics payload contains unsupported value for: ${key}` };
    if (Array.isArray(value) && value.some(isOversizedString)) {
      return { ok: false, error: `Analytics payload property contains an oversized value: ${key}` };
    }
    if (!Array.isArray(value) && isOversizedString(value)) {
      return { ok: false, error: `Analytics payload property is too long: ${key}` };
    }
  }
  return { ok: true };
}

export function sanitizeAnalyticsPayload(payload: AnalyticsPayload = {}): AnalyticsPayload {
  const out: AnalyticsPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (Object.keys(out).length >= MAX_PAYLOAD_PROPERTIES) break;
    if (
      key.length === 0 ||
      key.length > MAX_PROPERTY_NAME_LENGTH ||
      BANNED_KEYS.has(key) ||
      value === undefined ||
      !isSanitizableValue(value)
    ) continue;
    if (typeof value === "string") out[key] = value.slice(0, MAX_STRING_LENGTH);
    else if (Array.isArray(value)) {
      out[key] = value
        .slice(0, MAX_ARRAY_LENGTH)
        .map((item) => typeof item === "string" ? item.slice(0, MAX_STRING_LENGTH) : item);
    } else out[key] = value;
  }
  return out;
}
