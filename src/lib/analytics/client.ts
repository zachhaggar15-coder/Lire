"use client";

import { attributionFromUrl } from "@/lib/analytics/attribution";
import { deviceCategory, ensureAnonymousId, isStandalonePwa } from "@/lib/analytics/identity";
import { getBrowserSession } from "@/lib/analytics/session";
import {
  sanitizeAnalyticsPayload,
  validateAnalyticsPayload,
  type AnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsPayload,
} from "@/lib/analytics/events";
import { appVersion, deploymentEnvironment, shouldSendAnalytics } from "@/lib/validation/config";
import { getValidationState } from "@/lib/validation/state";

const LOCAL_EVENT_KEY = "lire.analytics.localEvents.v1";
const MAX_LOCAL_EVENTS = 120;

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function appendLocalEvent(event: AnalyticsEvent & { suppressed?: boolean }) {
  if (!hasStorage()) return;
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    window.localStorage.setItem(LOCAL_EVENT_KEY, JSON.stringify([event, ...list].slice(0, MAX_LOCAL_EVENTS)));
  } catch {
    // Analytics must never break the app.
  }
}

function enrichedPayload(payload: AnalyticsPayload): AnalyticsPayload {
  if (typeof window === "undefined") return payload;
  const state = getValidationState();
  const attribution = state.latestTouch ?? attributionFromUrl({ href: window.location.href, referrer: document.referrer || null });
  return sanitizeAnalyticsPayload({
    ...payload,
    path: window.location.pathname,
    deviceCategory: deviceCategory(),
    pwaStandalone: isStandalonePwa(),
    acquisitionSource: attribution.source,
    acquisitionMedium: attribution.medium,
    acquisitionCampaign: attribution.campaign,
    returningUser: !!state.firstSeenAt && state.activeDates.length > 1,
    frenchLevel: payload.frenchLevel,
  });
}

export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  try {
    const cleanPayload = enrichedPayload(payload);
    const validation = validateAnalyticsPayload(name, cleanPayload);
    if (!validation.ok) return;

    const now = new Date();
    const env = deploymentEnvironment();
    const event: AnalyticsEvent = {
      name,
      payload: cleanPayload,
      anonymousId: ensureAnonymousId(now),
      sessionId: getBrowserSession(now).id,
      createdAt: now.toISOString(),
      appVersion: appVersion(),
      deploymentEnvironment: env,
    };
    const send = shouldSendAnalytics({ environment: env });
    appendLocalEvent({ ...event, suppressed: !send });
    if (!send) return;

    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never block reading.
  }
}

export function trackOnce(key: string, name: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;
  const storageKey = `lire.analytics.once.${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // If sessionStorage is unavailable, tracking once is best-effort.
  }
  trackEvent(name, payload);
}

export function getLocalAnalyticsEvents(): Array<AnalyticsEvent & { suppressed?: boolean }> {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
