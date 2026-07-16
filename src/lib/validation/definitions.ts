import { rememberActiveDate, rememberMeaningfulSessionDate, type ValidationState } from "@/lib/validation/state";

export interface ReadingSessionSignals {
  activeMs: number;
  maxProgressPercent: number;
  completed: boolean;
  learningActions: number;
}

export interface TimedSessionRecord {
  startedAt: string;
  completedAt: string;
  meaningful: boolean;
  learningActions: number;
}

export type RetentionKind =
  | "day1"
  | "day2"
  | "exactDay7"
  | "rolling7"
  | "rolling14"
  | "rolling30";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

function daysBetween(first: string, later: string): number {
  const start = new Date(`${dayKey(first)}T00:00:00.000Z`).getTime();
  const end = new Date(`${dayKey(later)}T00:00:00.000Z`).getTime();
  return Math.round((end - start) / DAY_MS);
}

export function isMeaningfulReadingSession(signals: ReadingSessionSignals): boolean {
  if (signals.completed) return true;
  if (signals.maxProgressPercent >= 50 && signals.activeMs >= 45_000) return true;
  if (signals.learningActions >= 2 && signals.activeMs >= 30_000) return true;
  return false;
}

export function isActivated({
  meaningfulSessionCount,
  learningActionCount,
}: {
  meaningfulSessionCount: number;
  learningActionCount: number;
}): boolean {
  return meaningfulSessionCount >= 1 && learningActionCount >= 1;
}

export function isStronglyActivated({
  firstSeenAt,
  sessions,
}: {
  firstSeenAt: string | null;
  sessions: TimedSessionRecord[];
}): boolean {
  if (!firstSeenAt) return false;
  const qualifying = sessions.filter(
    (session) => session.meaningful && daysBetween(firstSeenAt, session.completedAt) >= 0 && daysBetween(firstSeenAt, session.completedAt) <= 7
  );
  return qualifying.length >= 2 && new Set(qualifying.map((session) => dayKey(session.completedAt))).size >= 2;
}

export function isHabitForming({
  firstSeenAt,
  activeDates,
  sessions,
}: {
  firstSeenAt: string | null;
  activeDates: string[];
  sessions: TimedSessionRecord[];
}): boolean {
  if (!firstSeenAt) return false;
  const datesWithinWindow = activeDates.filter((date) => daysBetween(firstSeenAt, date) >= 0 && daysBetween(firstSeenAt, date) <= 14);
  const meaningfulWithinWindow = sessions.filter(
    (session) => session.meaningful && daysBetween(firstSeenAt, session.completedAt) >= 0 && daysBetween(firstSeenAt, session.completedAt) <= 14
  );
  return new Set(datesWithinWindow).size >= 3 && meaningfulWithinWindow.length >= 3;
}

export function retentionReached(firstSeenAt: string, activeDates: string[], kind: RetentionKind): boolean {
  const offsets = new Set(activeDates.map((date) => daysBetween(firstSeenAt, date)).filter((offset) => offset > 0));
  if (kind === "day1") return offsets.has(1);
  if (kind === "day2") return offsets.has(2);
  if (kind === "exactDay7") return offsets.has(7);
  if (kind === "rolling7") return [...offsets].some((offset) => offset >= 1 && offset <= 7);
  if (kind === "rolling14") return [...offsets].some((offset) => offset >= 1 && offset <= 14);
  return [...offsets].some((offset) => offset >= 1 && offset <= 30);
}

export function applyReadingSessionToState({
  state,
  completedAt,
  signals,
}: {
  state: ValidationState;
  completedAt: string;
  signals: ReadingSessionSignals;
}): { state: ValidationState; meaningful: boolean; activatedNow: boolean; strongNow: boolean; habitNow: boolean } {
  const meaningful = isMeaningfulReadingSession(signals);
  const date = dayKey(completedAt);
  let next = rememberActiveDate(
    {
      ...state,
      readingSessionsCompleted: state.readingSessionsCompleted + 1,
      totalLearningActions: state.totalLearningActions + signals.learningActions,
    },
    date
  );
  if (meaningful) {
    next = rememberMeaningfulSessionDate(
      {
        ...next,
        meaningfulSessionCount: next.meaningfulSessionCount + 1,
      },
      date
    );
  }

  const activated = isActivated({
    meaningfulSessionCount: next.meaningfulSessionCount,
    learningActionCount: next.totalLearningActions,
  });
  const activatedNow = activated && !next.firstActivatedAt;
  if (activatedNow) next = { ...next, firstActivatedAt: completedAt };

  const pseudoSessions = next.meaningfulSessionDates.map((sessionDate) => ({
    startedAt: `${sessionDate}T00:00:00.000Z`,
    completedAt: `${sessionDate}T12:00:00.000Z`,
    meaningful: true,
    learningActions: 1,
  }));
  const strong = isStronglyActivated({ firstSeenAt: next.firstSeenAt, sessions: pseudoSessions });
  const strongNow = strong && !next.stronglyActivatedAt;
  if (strongNow) next = { ...next, stronglyActivatedAt: completedAt };

  const habit = isHabitForming({
    firstSeenAt: next.firstSeenAt,
    activeDates: next.activeDates,
    sessions: pseudoSessions,
  });
  const habitNow = habit && !next.habitFormingAt;
  if (habitNow) next = { ...next, habitFormingAt: completedAt };

  return { state: next, meaningful, activatedNow, strongNow, habitNow };
}
