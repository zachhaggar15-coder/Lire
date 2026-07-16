import {
  getValidationState,
  saveValidationState,
  type AcquisitionAttribution,
  type ValidationState,
} from "@/lib/validation/state";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"] as const;

function clean(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 160) : null;
}

function referrerSource(referrer: string | null, currentOrigin: string): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.origin === currentOrigin) return null;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function attributionFromUrl({
  href,
  referrer = null,
  now = new Date(),
}: {
  href: string;
  referrer?: string | null;
  now?: Date;
}): AcquisitionAttribution {
  const url = new URL(href, "https://liree.vercel.app");
  const params = url.searchParams;
  const utmSource = clean(params.get("utm_source"));
  const ref = clean(params.get("ref"));
  const externalReferrer = referrerSource(referrer, url.origin);
  const source = utmSource ?? ref ?? externalReferrer ?? "direct";

  return {
    source,
    medium: clean(params.get("utm_medium")),
    campaign: clean(params.get("utm_campaign")),
    content: clean(params.get("utm_content")),
    term: clean(params.get("utm_term")),
    ref,
    referrer: externalReferrer,
    landingPath: `${url.pathname}${url.search}`,
    capturedAt: now.toISOString(),
  };
}

export function hasExplicitAttribution(href: string): boolean {
  const url = new URL(href, "https://liree.vercel.app");
  return UTM_KEYS.some((key) => !!clean(url.searchParams.get(key)));
}

export function applyAttribution(
  state: ValidationState,
  attribution: AcquisitionAttribution,
  explicit = attribution.source !== "direct"
): ValidationState {
  const shouldSetFirst = !state.firstTouch || (state.firstTouch.source === "direct" && explicit);
  const shouldSetLatest = explicit || attribution.source !== "direct";
  return {
    ...state,
    firstTouch: shouldSetFirst ? attribution : state.firstTouch,
    latestTouch: shouldSetLatest ? attribution : state.latestTouch ?? attribution,
  };
}

export function captureAttributionFromBrowser(now = new Date()): ValidationState {
  if (typeof window === "undefined") return getValidationState();
  const attribution = attributionFromUrl({
    href: window.location.href,
    referrer: document.referrer || null,
    now,
  });
  const explicit = hasExplicitAttribution(window.location.href) || attribution.referrer !== null;
  return saveValidationState(applyAttribution(getValidationState(), attribution, explicit));
}
