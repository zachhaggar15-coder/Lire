export const ANALYTICS_CONSENT_KEY = "lire.privacy.analyticsConsent.v1";
export const ANALYTICS_CONSENT_EVENT = "lire:analytics-consent-changed";

export type AnalyticsConsent = "granted" | "denied";

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === "granted";
}

function clearAnalyticsIdentifiers(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("lire.analytics.localEvents.v1");
    window.localStorage.removeItem("lire.validation.v1");
    window.sessionStorage.removeItem("lire.analytics.session.v1");
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith("lire.analytics.once.")) window.sessionStorage.removeItem(key);
    }
  } catch {
    // Privacy controls must remain usable when storage is restricted.
  }
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
    if (consent === "denied") clearAnalyticsIdentifiers();
  } catch {
    // The in-memory event still lets the current page respect the choice.
  }
  window.dispatchEvent(new CustomEvent<AnalyticsConsent>(ANALYTICS_CONSENT_EVENT, { detail: consent }));
}

export function subscribeToAnalyticsConsent(callback: (consent: AnalyticsConsent | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleConsent = (event: Event) => callback((event as CustomEvent<AnalyticsConsent>).detail ?? getAnalyticsConsent());
  const handleStorage = (event: StorageEvent) => {
    if (event.key === ANALYTICS_CONSENT_KEY) callback(getAnalyticsConsent());
  };
  window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
    window.removeEventListener("storage", handleStorage);
  };
}
