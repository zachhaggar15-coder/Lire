import { captureAttributionFromBrowser } from "@/lib/analytics/attribution";
import { ensureAnonymousId, isStandalonePwa } from "@/lib/analytics/identity";
import { trackEvent } from "@/lib/analytics/client";
import { retentionReached } from "@/lib/validation/definitions";
import {
  localDate,
  rememberActiveDate,
  saveValidationState,
  updateValidationState,
  type ValidationState,
} from "@/lib/validation/state";

function dateOffset(firstSeenAt: string | null, date: string): number | null {
  if (!firstSeenAt) return null;
  const start = new Date(`${firstSeenAt.slice(0, 10)}T00:00:00.000Z`).getTime();
  const end = new Date(`${date}T00:00:00.000Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

export function initialiseValidationVisit(now = new Date()): ValidationState {
  const anonymousId = ensureAnonymousId(now);
  const attributed = captureAttributionFromBrowser(now);
  const today = localDate(now);
  const firstVisit = !attributed.firstSeenAt || attributed.activeDates.length === 0;
  const wasReturningToday = attributed.activeDates.length > 0 && !attributed.activeDates.includes(today);
  const next = rememberActiveDate(
    {
      ...attributed,
      anonymousId,
      firstSeenAt: attributed.firstSeenAt ?? now.toISOString(),
      lastSeenAt: now.toISOString(),
      pwaInstalled: isStandalonePwa() || attributed.pwaInstalled,
    },
    today
  );
  saveValidationState(next);

  trackEvent("app_opened", { firstVisit, activeDayCount: next.activeDates.length });
  if (firstVisit) trackEvent("first_visit_detected", { acquisitionSource: next.firstTouch?.source ?? "direct" });
  if (wasReturningToday) {
    const offset = dateOffset(next.firstSeenAt, today);
    updateValidationState((state) => ({
      ...state,
      lastReturnVisitAt: now.toISOString(),
      returnVisitCount: state.returnVisitCount + 1,
    }));
    trackEvent("return_visit_detected", {
      dayOffset: offset,
      rolling7: next.firstSeenAt ? retentionReached(next.firstSeenAt, next.activeDates, "rolling7") : false,
      rolling14: next.firstSeenAt ? retentionReached(next.firstSeenAt, next.activeDates, "rolling14") : false,
      rolling30: next.firstSeenAt ? retentionReached(next.firstSeenAt, next.activeDates, "rolling30") : false,
    });
  }
  if (next.activeDates.length === 2) trackEvent("second_active_day_reached", {});
  return next;
}

export function markPwaInstalled(installedAt = new Date().toISOString()): ValidationState {
  return updateValidationState((state) => ({
    ...state,
    pwaInstalled: true,
    firstPwaInstalledAt: state.firstPwaInstalledAt ?? installedAt,
  }));
}

export function markAndroidInterest(at = new Date().toISOString()): ValidationState {
  return updateValidationState((state) => ({
    ...state,
    firstAndroidInterestAt: state.firstAndroidInterestAt ?? at,
  }));
}
