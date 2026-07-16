export type DeploymentEnvironment = "local" | "preview" | "production";
export type ValidationTargetStatus = "insufficient-data" | "below-target" | "approaching-target" | "meeting-target";

export interface ValidationGoal {
  id: string;
  label: string;
  numeratorLabel: string;
  denominatorLabel: string;
  targetRate: number;
  minimumSampleSize: number;
}

export interface ValidationFeatureFlags {
  analyticsEnabled: boolean;
  androidBetaCtaEnabled: boolean;
  feedbackEnabled: boolean;
  postSessionPromptsEnabled: boolean;
  productDisappearanceSurveyEnabled: boolean;
  adminDashboardEnabled: boolean;
  betaBannerEnabled: boolean;
  emailConfirmationEnabled: boolean;
}

function envFlag(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value == null || value === "") return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

export function deploymentEnvironment(): DeploymentEnvironment {
  const explicit = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV;
  if (explicit === "production" || explicit === "preview" || explicit === "local") return explicit;
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "preview";
  return "local";
}

export function appVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local";
}

export function productionDomain(): string {
  return process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || "https://liree.vercel.app";
}

export const VALIDATION_FEATURES: ValidationFeatureFlags = {
  analyticsEnabled: envFlag("NEXT_PUBLIC_ANALYTICS_ENABLED", true),
  androidBetaCtaEnabled: envFlag("NEXT_PUBLIC_ANDROID_BETA_CTA_ENABLED", true),
  feedbackEnabled: envFlag("NEXT_PUBLIC_FEEDBACK_ENABLED", true),
  postSessionPromptsEnabled: envFlag("NEXT_PUBLIC_POST_SESSION_PROMPTS_ENABLED", true),
  productDisappearanceSurveyEnabled: envFlag("NEXT_PUBLIC_PRODUCT_DISAPPEARANCE_SURVEY_ENABLED", true),
  adminDashboardEnabled: envFlag("NEXT_PUBLIC_ADMIN_DASHBOARD_ENABLED", true),
  betaBannerEnabled: envFlag("NEXT_PUBLIC_BETA_BANNER_ENABLED", true),
  emailConfirmationEnabled: envFlag("NEXT_PUBLIC_EMAIL_CONFIRMATION_ENABLED", false),
};

export const VALIDATION_GOALS: ValidationGoal[] = [
  {
    id: "first_reading_selection",
    label: "First-time visitors select a reading",
    numeratorLabel: "reading selections",
    denominatorLabel: "first-time dashboard visitors",
    targetRate: 0.3,
    minimumSampleSize: 30,
  },
  {
    id: "article_openers_meaningful_session",
    label: "Article openers complete a meaningful session",
    numeratorLabel: "meaningful sessions",
    denominatorLabel: "article openers",
    targetRate: 0.5,
    minimumSampleSize: 30,
  },
  {
    id: "meaningful_users_activated",
    label: "Meaningful-session users become activated",
    numeratorLabel: "activated users",
    denominatorLabel: "meaningful-session users",
    targetRate: 0.25,
    minimumSampleSize: 30,
  },
  {
    id: "activated_rolling_7_return",
    label: "Activated users return within seven days",
    numeratorLabel: "rolling 7-day returns",
    denominatorLabel: "activated users",
    targetRate: 0.2,
    minimumSampleSize: 20,
  },
  {
    id: "recruited_three_sessions",
    label: "Recruited testers complete three sessions within fourteen days",
    numeratorLabel: "three-session testers",
    denominatorLabel: "recruited testers",
    targetRate: 0.2,
    minimumSampleSize: 20,
  },
  {
    id: "activated_android_click",
    label: "Activated users click the Android beta CTA",
    numeratorLabel: "Android CTA clicks",
    denominatorLabel: "activated users",
    targetRate: 0.15,
    minimumSampleSize: 30,
  },
  {
    id: "android_form_completion",
    label: "Android beta form starters complete submission",
    numeratorLabel: "form completions",
    denominatorLabel: "form starts",
    targetRate: 0.3,
    minimumSampleSize: 30,
  },
  {
    id: "strongly_activated_android_join",
    label: "Strongly activated users join the Android beta",
    numeratorLabel: "Android beta joins",
    denominatorLabel: "strongly activated users",
    targetRate: 0.2,
    minimumSampleSize: 20,
  },
];

export function validationTargetStatus({
  numerator,
  denominator,
  targetRate,
  minimumSampleSize,
}: {
  numerator: number;
  denominator: number;
  targetRate: number;
  minimumSampleSize: number;
}): ValidationTargetStatus {
  if (denominator < minimumSampleSize) return "insufficient-data";
  const rate = denominator === 0 ? 0 : numerator / denominator;
  if (rate >= targetRate) return "meeting-target";
  if (rate >= targetRate * 0.75) return "approaching-target";
  return "below-target";
}

export function shouldSendAnalytics({
  environment = deploymentEnvironment(),
  analyticsEnabled = VALIDATION_FEATURES.analyticsEnabled,
  includeNonProduction = envFlag("NEXT_PUBLIC_ANALYTICS_INCLUDE_NON_PRODUCTION", false),
}: {
  environment?: DeploymentEnvironment;
  analyticsEnabled?: boolean;
  includeNonProduction?: boolean;
} = {}): boolean {
  if (!analyticsEnabled) return false;
  if (environment === "production") return true;
  return includeNonProduction;
}
