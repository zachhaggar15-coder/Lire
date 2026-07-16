import { VALIDATION_GOALS, validationTargetStatus, type ValidationGoal } from "@/lib/validation/config";

export interface AnalyticsEventRow {
  id?: string;
  event_name: string;
  anonymous_id: string | null;
  user_id: string | null;
  session_id: string | null;
  payload: Record<string, unknown> | null;
  app_version?: string | null;
  deployment_environment?: string | null;
  created_at: string;
}

export interface AndroidBetaRow {
  email_normalized?: string | null;
  anonymous_id?: string | null;
  user_id?: string | null;
  source?: string | null;
  french_level?: string | null;
  uses_android?: boolean | null;
  motivation?: string | null;
  desired_improvement?: string | null;
  first_touch_source?: string | null;
  is_returning_user?: boolean | null;
  articles_completed?: number | null;
  reading_sessions_completed?: number | null;
  created_at: string;
}

export interface FeedbackRow {
  category: string;
  sentiment: string | null;
  page: string | null;
  feature: string | null;
  comment: string | null;
  anonymous_id?: string | null;
  user_id?: string | null;
  created_at: string;
}

export interface ResearchPromptRow {
  prompt_type: string;
  response: string;
  comment: string | null;
  created_at: string;
}

export interface AdminValidationReport {
  generatedAt: string;
  dateRange: { from: string; to: string };
  overview: Record<string, number>;
  acquisition: Array<Record<string, string | number>>;
  funnel: Array<{ step: string; count: number; previousCount: number | null; conversionFromPrevious: number | null }>;
  retention: Record<string, number>;
  cohorts: Array<Record<string, string | number>>;
  learningBehaviour: Record<string, number>;
  androidDemand: Record<string, unknown>;
  feedback: Record<string, unknown>;
  goals: Array<ValidationGoal & { numerator: number; denominator: number; rate: number | null; status: string }>;
}

function userKey(row: { user_id?: string | null; anonymous_id?: string | null }): string {
  return row.user_id || row.anonymous_id || "unknown";
}

function pct(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function sourceFor(row: AnalyticsEventRow): string {
  const payload = row.payload ?? {};
  const source = payload.acquisitionSource;
  return typeof source === "string" && source ? source : "unknown";
}

function uniqueUsers(rows: Array<{ user_id?: string | null; anonymous_id?: string | null }>): Set<string> {
  return new Set(rows.map(userKey).filter((key) => key !== "unknown"));
}

function countEvents(events: AnalyticsEventRow[], name: string): number {
  return events.filter((event) => event.event_name === name).length;
}

function uniqueEventUsers(events: AnalyticsEventRow[], name: string): number {
  return uniqueUsers(events.filter((event) => event.event_name === name)).size;
}

function median(values: number[]): number {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
}

function retention(events: AnalyticsEventRow[]) {
  const byUser = new Map<string, Set<string>>();
  for (const event of events.filter((item) => item.event_name === "app_opened")) {
    const key = userKey(event);
    if (key === "unknown") continue;
    const set = byUser.get(key) ?? new Set<string>();
    set.add(event.created_at.slice(0, 10));
    byUser.set(key, set);
  }

  let eligible = 0;
  let day1 = 0;
  let day2 = 0;
  let exactDay7 = 0;
  let rolling7 = 0;
  let rolling14 = 0;
  let rolling30 = 0;
  for (const dates of byUser.values()) {
    const sorted = [...dates].sort();
    if (sorted.length === 0) continue;
    eligible++;
    const first = new Date(`${sorted[0]}T00:00:00.000Z`).getTime();
    const offsets = new Set(sorted.slice(1).map((date) => Math.round((new Date(`${date}T00:00:00.000Z`).getTime() - first) / (24 * 60 * 60 * 1000))));
    if (offsets.has(1)) day1++;
    if (offsets.has(2)) day2++;
    if (offsets.has(7)) exactDay7++;
    if ([...offsets].some((offset) => offset >= 1 && offset <= 7)) rolling7++;
    if ([...offsets].some((offset) => offset >= 1 && offset <= 14)) rolling14++;
    if ([...offsets].some((offset) => offset >= 1 && offset <= 30)) rolling30++;
  }
  return { eligible, day1, day2, exactDay7, rolling7, rolling14, rolling30 };
}

function firstUseWeek(date: string): string {
  const d = new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export function buildAdminValidationReport({
  events,
  beta,
  feedback,
  research,
  from,
  to,
}: {
  events: AnalyticsEventRow[];
  beta: AndroidBetaRow[];
  feedback: FeedbackRow[];
  research: ResearchPromptRow[];
  from: string;
  to: string;
}): AdminValidationReport {
  const allUsers = uniqueUsers(events);
  const activatedUsers = uniqueUsers(events.filter((event) => event.event_name === "user_activated"));
  const stronglyActivatedUsers = uniqueUsers(events.filter((event) => event.event_name === "user_strongly_activated"));
  const retained = retention(events);
  const betaUsers = uniqueUsers(beta);
  const overview = {
    uniqueUsers: allUsers.size,
    newUsers: uniqueEventUsers(events, "first_visit_detected"),
    returningUsers: uniqueEventUsers(events, "return_visit_detected"),
    meaningfulReadingSessions: countEvents(events, "meaningful_reading_session_completed"),
    articleCompletions: countEvents(events, "article_completed"),
    activatedUsers: activatedUsers.size,
    stronglyActivatedUsers: stronglyActivatedUsers.size,
    habitFormingUsers: uniqueEventUsers(events, "habit_forming_usage_reached"),
    androidBetaRegistrations: beta.length,
    feedbackSubmissions: feedback.length,
  };

  const sourceMap = new Map<string, AnalyticsEventRow[]>();
  for (const event of events) {
    const source = sourceFor(event);
    sourceMap.set(source, [...(sourceMap.get(source) ?? []), event]);
  }
  const acquisition = [...sourceMap.entries()].map(([source, rows]) => {
    const users = uniqueUsers(rows).size;
    const selected = uniqueEventUsers(rows, "reading_card_selected");
    const meaningful = uniqueEventUsers(rows, "meaningful_reading_session_completed");
    const activated = uniqueEventUsers(rows, "user_activated");
    const returned = uniqueEventUsers(rows, "return_visit_detected");
    const betaCount = beta.filter((row) => (row.first_touch_source ?? row.source ?? "unknown") === source).length;
    return {
      source,
      users,
      articleSelectionRate: pct(selected, users),
      meaningfulSessionRate: pct(meaningful, users),
      activationRate: pct(activated, users),
      rolling7ReturnRate: pct(returned, users),
      androidBetaRate: pct(betaCount, users),
    };
  }).sort((a, b) => Number(b.users) - Number(a.users));

  const funnelSteps = [
    ["Dashboard viewed", "dashboard_viewed"],
    ["Article selected", "reading_card_selected"],
    ["Reading session started", "reading_session_started"],
    ["Meaningful session completed", "meaningful_reading_session_completed"],
    ["Article completed", "article_completed"],
    ["Learning action performed", "word_lookup_opened"],
    ["User activated", "user_activated"],
    ["User returned", "return_visit_detected"],
  ] as const;
  let previousCount: number | null = null;
  const funnel = funnelSteps.map(([step, eventName]) => {
    const count = eventName === "word_lookup_opened" ? uniqueUsers(events.filter((event) => ["word_lookup_opened", "word_saved", "phrase_support_opened", "sentence_support_opened", "comprehension_completed"].includes(event.event_name))).size : uniqueEventUsers(events, eventName);
    const row = { step, count, previousCount, conversionFromPrevious: previousCount === null ? null : pct(count, previousCount) };
    previousCount = count;
    return row;
  });

  const firstByUser = new Map<string, string>();
  for (const event of events.filter((item) => item.event_name === "app_opened").sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    const key = userKey(event);
    if (key !== "unknown" && !firstByUser.has(key)) firstByUser.set(key, event.created_at);
  }
  const cohorts = [...firstByUser.entries()].reduce<Map<string, { users: number; activated: number; retained7: number }>>((acc, [key, date]) => {
    const week = firstUseWeek(date);
    const bucket = acc.get(week) ?? { users: 0, activated: 0, retained7: 0 };
    bucket.users++;
    if (activatedUsers.has(key)) bucket.activated++;
    const userEvents = events.filter((event) => userKey(event) === key);
    if (retention(userEvents).rolling7 > 0) bucket.retained7++;
    acc.set(week, bucket);
    return acc;
  }, new Map());

  const sessionEvents = events.filter((event) => event.event_name === "meaningful_reading_session_completed");
  const learningBehaviour = {
    medianArticleDurationMs: median(sessionEvents.map((event) => Number(event.payload?.durationMs ?? 0))),
    medianActiveReadingMs: median(sessionEvents.map((event) => Number(event.payload?.activeMs ?? 0))),
    medianWordsLookedUp: median(sessionEvents.map((event) => Number(event.payload?.wordLookups ?? 0))),
    medianWordsSaved: median(sessionEvents.map((event) => Number(event.payload?.wordsSaved ?? 0))),
    phraseSupportUsers: uniqueEventUsers(events, "phrase_support_opened"),
    sentenceSupportUsers: uniqueEventUsers(events, "sentence_support_opened"),
    comprehensionCompletions: countEvents(events, "comprehension_completed"),
    reviewParticipants: uniqueEventUsers(events, "review_session_started"),
    grammarParticipants: uniqueEventUsers(events, "grammar_session_started"),
    aiExplanationUsers: uniqueUsers(events.filter((event) => event.event_name === "ai_word_explanation_requested" || event.event_name === "ai_sentence_explanation_requested")).size,
  };

  const motivations = new Map<string, number>();
  const desired = new Map<string, number>();
  for (const row of beta) {
    if (row.motivation) motivations.set(row.motivation, (motivations.get(row.motivation) ?? 0) + 1);
    if (row.desired_improvement) desired.set(row.desired_improvement, (desired.get(row.desired_improvement) ?? 0) + 1);
  }
  const androidDemand = {
    ctaImpressions: countEvents(events, "android_beta_cta_viewed"),
    ctaClicks: countEvents(events, "android_beta_clicked"),
    formStarts: countEvents(events, "android_beta_form_started"),
    formSubmissions: beta.length,
    clickToSubmissionRate: pct(beta.length, countEvents(events, "android_beta_clicked")),
    registrationAmongActivatedUsers: pct([...betaUsers].filter((key) => activatedUsers.has(key)).length, activatedUsers.size),
    registrationAmongStronglyActivatedUsers: pct([...betaUsers].filter((key) => stronglyActivatedUsers.has(key)).length, stronglyActivatedUsers.size),
    registrationAmongRetainedUsers: pct(beta.filter((row) => row.is_returning_user).length, overview.returningUsers),
    frenchLevelDistribution: Object.fromEntries(groupCount(beta.map((row) => row.french_level ?? "unknown"))),
    androidOwnership: Object.fromEntries(groupCount(beta.map((row) => row.uses_android === true ? "android" : row.uses_android === false ? "not_android" : "unknown"))),
    motivations: [...motivations.entries()].slice(0, 20),
    desiredImprovements: [...desired.entries()].slice(0, 20),
  };

  const feedbackCategories = groupCount(feedback.map((row) => row.category));
  const researchCategories = groupCount(research.map((row) => row.prompt_type));
  const feedbackSummary = {
    categories: Object.fromEntries(feedbackCategories),
    researchPromptResponses: Object.fromEntries(researchCategories),
    recentComments: feedback.filter((row) => row.comment).slice(0, 20).map((row) => ({
      category: row.category,
      feature: row.feature ?? "general",
      comment: row.comment ?? "",
      createdAt: row.created_at,
    })),
  };

  const goalNumbers: Record<string, { numerator: number; denominator: number }> = {
    first_reading_selection: { numerator: countEvents(events, "reading_card_selected"), denominator: countEvents(events, "dashboard_viewed") },
    article_openers_meaningful_session: { numerator: countEvents(events, "meaningful_reading_session_completed"), denominator: countEvents(events, "article_opened") },
    meaningful_users_activated: { numerator: activatedUsers.size, denominator: uniqueEventUsers(events, "meaningful_reading_session_completed") },
    activated_rolling_7_return: { numerator: retained.rolling7, denominator: activatedUsers.size },
    recruited_three_sessions: { numerator: countEvents(events, "third_reading_session_completed"), denominator: allUsers.size },
    activated_android_click: { numerator: uniqueEventUsers(events, "android_beta_clicked"), denominator: activatedUsers.size },
    android_form_completion: { numerator: beta.length, denominator: countEvents(events, "android_beta_form_started") },
    strongly_activated_android_join: { numerator: [...betaUsers].filter((key) => stronglyActivatedUsers.has(key)).length, denominator: stronglyActivatedUsers.size },
  };

  return {
    generatedAt: new Date().toISOString(),
    dateRange: { from, to },
    overview,
    acquisition,
    funnel,
    retention: {
      eligibleUsers: retained.eligible,
      day1: pct(retained.day1, retained.eligible),
      day2: pct(retained.day2, retained.eligible),
      exactDay7: pct(retained.exactDay7, retained.eligible),
      rolling7: pct(retained.rolling7, retained.eligible),
      rolling14: pct(retained.rolling14, retained.eligible),
      rolling30: pct(retained.rolling30, retained.eligible),
      strongActivationUsers: stronglyActivatedUsers.size,
      habitFormingUsers: overview.habitFormingUsers,
    },
    cohorts: [...cohorts.entries()].map(([week, value]) => ({
      week,
      users: value.users,
      activationRate: pct(value.activated, value.users),
      rolling7ReturnRate: pct(value.retained7, value.users),
    })),
    learningBehaviour,
    androidDemand,
    feedback: feedbackSummary,
    goals: VALIDATION_GOALS.map((goal) => {
      const numbers = goalNumbers[goal.id] ?? { numerator: 0, denominator: 0 };
      return {
        ...goal,
        ...numbers,
        rate: numbers.denominator === 0 ? null : Math.round((numbers.numerator / numbers.denominator) * 1000) / 1000,
        status: validationTargetStatus({ ...numbers, targetRate: goal.targetRate, minimumSampleSize: goal.minimumSampleSize }),
      };
    }),
  };
}

function groupCount(values: string[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const value of values) out.set(value, (out.get(value) ?? 0) + 1);
  return out;
}
