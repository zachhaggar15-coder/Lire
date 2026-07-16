import { pushStore } from "@/lib/supabase/sync";

export const VALIDATION_STATE_KEY = "lire.validation.v1";

export interface AcquisitionAttribution {
  source: string;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  ref: string | null;
  referrer: string | null;
  landingPath: string;
  capturedAt: string;
}

export interface ValidationState {
  anonymousId: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  lastReturnVisitAt: string | null;
  firstActivatedAt: string | null;
  stronglyActivatedAt: string | null;
  habitFormingAt: string | null;
  firstArticleOpenedAt: string | null;
  firstArticleCompletedAt: string | null;
  firstWordSavedAt: string | null;
  firstReviewCompletedAt: string | null;
  firstPwaInstalledAt: string | null;
  firstAndroidInterestAt: string | null;
  activeDates: string[];
  meaningfulSessionCount: number;
  meaningfulSessionDates: string[];
  completedArticleCount: number;
  readingSessionsCompleted: number;
  totalWordsSaved: number;
  totalLearningActions: number;
  totalReviewsCompleted: number;
  totalGrammarSessions: number;
  firstTouch: AcquisitionAttribution | null;
  latestTouch: AcquisitionAttribution | null;
  returnVisitCount: number;
  pwaInstalled: boolean | null;
  dismissedPromptIds: string[];
  answeredPromptIds: string[];
}

export function emptyValidationState(): ValidationState {
  return {
    anonymousId: null,
    firstSeenAt: null,
    lastSeenAt: null,
    lastReturnVisitAt: null,
    firstActivatedAt: null,
    stronglyActivatedAt: null,
    habitFormingAt: null,
    firstArticleOpenedAt: null,
    firstArticleCompletedAt: null,
    firstWordSavedAt: null,
    firstReviewCompletedAt: null,
    firstPwaInstalledAt: null,
    firstAndroidInterestAt: null,
    activeDates: [],
    meaningfulSessionCount: 0,
    meaningfulSessionDates: [],
    completedArticleCount: 0,
    readingSessionsCompleted: 0,
    totalWordsSaved: 0,
    totalLearningActions: 0,
    totalReviewsCompleted: 0,
    totalGrammarSessions: 0,
    firstTouch: null,
    latestTouch: null,
    returnVisitCount: 0,
    pwaInstalled: null,
    dismissedPromptIds: [],
    answeredPromptIds: [],
  };
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function attribution(value: unknown): AcquisitionAttribution | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.source !== "string" || typeof raw.landingPath !== "string" || typeof raw.capturedAt !== "string") return null;
  return {
    source: raw.source,
    medium: typeof raw.medium === "string" ? raw.medium : null,
    campaign: typeof raw.campaign === "string" ? raw.campaign : null,
    content: typeof raw.content === "string" ? raw.content : null,
    term: typeof raw.term === "string" ? raw.term : null,
    ref: typeof raw.ref === "string" ? raw.ref : null,
    referrer: typeof raw.referrer === "string" ? raw.referrer : null,
    landingPath: raw.landingPath,
    capturedAt: raw.capturedAt,
  };
}

function normalise(raw: unknown): ValidationState {
  const base = emptyValidationState();
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Record<string, unknown>;
  return {
    ...base,
    anonymousId: typeof value.anonymousId === "string" ? value.anonymousId : null,
    firstSeenAt: typeof value.firstSeenAt === "string" ? value.firstSeenAt : null,
    lastSeenAt: typeof value.lastSeenAt === "string" ? value.lastSeenAt : null,
    lastReturnVisitAt: typeof value.lastReturnVisitAt === "string" ? value.lastReturnVisitAt : null,
    firstActivatedAt: typeof value.firstActivatedAt === "string" ? value.firstActivatedAt : null,
    stronglyActivatedAt: typeof value.stronglyActivatedAt === "string" ? value.stronglyActivatedAt : null,
    habitFormingAt: typeof value.habitFormingAt === "string" ? value.habitFormingAt : null,
    firstArticleOpenedAt: typeof value.firstArticleOpenedAt === "string" ? value.firstArticleOpenedAt : null,
    firstArticleCompletedAt: typeof value.firstArticleCompletedAt === "string" ? value.firstArticleCompletedAt : null,
    firstWordSavedAt: typeof value.firstWordSavedAt === "string" ? value.firstWordSavedAt : null,
    firstReviewCompletedAt: typeof value.firstReviewCompletedAt === "string" ? value.firstReviewCompletedAt : null,
    firstPwaInstalledAt: typeof value.firstPwaInstalledAt === "string" ? value.firstPwaInstalledAt : null,
    firstAndroidInterestAt: typeof value.firstAndroidInterestAt === "string" ? value.firstAndroidInterestAt : null,
    activeDates: stringArray(value.activeDates),
    meaningfulSessionCount: typeof value.meaningfulSessionCount === "number" ? value.meaningfulSessionCount : 0,
    meaningfulSessionDates: stringArray(value.meaningfulSessionDates),
    completedArticleCount: typeof value.completedArticleCount === "number" ? value.completedArticleCount : 0,
    readingSessionsCompleted: typeof value.readingSessionsCompleted === "number" ? value.readingSessionsCompleted : 0,
    totalWordsSaved: typeof value.totalWordsSaved === "number" ? value.totalWordsSaved : 0,
    totalLearningActions: typeof value.totalLearningActions === "number" ? value.totalLearningActions : 0,
    totalReviewsCompleted: typeof value.totalReviewsCompleted === "number" ? value.totalReviewsCompleted : 0,
    totalGrammarSessions: typeof value.totalGrammarSessions === "number" ? value.totalGrammarSessions : 0,
    firstTouch: attribution(value.firstTouch),
    latestTouch: attribution(value.latestTouch),
    returnVisitCount: typeof value.returnVisitCount === "number" ? value.returnVisitCount : 0,
    pwaInstalled: typeof value.pwaInstalled === "boolean" ? value.pwaInstalled : null,
    dismissedPromptIds: stringArray(value.dismissedPromptIds),
    answeredPromptIds: stringArray(value.answeredPromptIds),
  };
}

export function localDate(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function getValidationState(): ValidationState {
  if (!hasStorage()) return emptyValidationState();
  try {
    const raw = window.localStorage.getItem(VALIDATION_STATE_KEY);
    if (!raw) return emptyValidationState();
    return normalise(JSON.parse(raw));
  } catch {
    return emptyValidationState();
  }
}

export function saveValidationState(state: ValidationState): ValidationState {
  if (!hasStorage()) return state;
  window.localStorage.setItem(VALIDATION_STATE_KEY, JSON.stringify(state));
  void pushStore(VALIDATION_STATE_KEY);
  return state;
}

export function updateValidationState(updater: (state: ValidationState) => ValidationState): ValidationState {
  return saveValidationState(updater(getValidationState()));
}

export function rememberActiveDate(state: ValidationState, date: string): ValidationState {
  return state.activeDates.includes(date)
    ? state
    : { ...state, activeDates: [...state.activeDates, date].slice(-400) };
}

export function rememberMeaningfulSessionDate(state: ValidationState, date: string): ValidationState {
  return state.meaningfulSessionDates.includes(date)
    ? state
    : { ...state, meaningfulSessionDates: [...state.meaningfulSessionDates, date].slice(-400) };
}

export function markPromptDismissed(promptId: string): ValidationState {
  return updateValidationState((state) => ({
    ...state,
    dismissedPromptIds: state.dismissedPromptIds.includes(promptId)
      ? state.dismissedPromptIds
      : [...state.dismissedPromptIds, promptId],
  }));
}

export function markPromptAnswered(promptId: string): ValidationState {
  return updateValidationState((state) => ({
    ...state,
    answeredPromptIds: state.answeredPromptIds.includes(promptId)
      ? state.answeredPromptIds
      : [...state.answeredPromptIds, promptId],
  }));
}
