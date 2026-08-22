import {
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsConsent,
  hasAnalyticsConsent,
  setAnalyticsConsent,
} from "../src/lib/privacy/analyticsConsent.ts";

const values = new Map([
  ["lire.analytics.localEvents.v1", "[]"],
  ["lire.validation.v1", "{}"],
]);
const sessionValues = new Map([
  ["lire.analytics.session.v1", "{}"],
  ["lire.analytics.once.page:/", "1"],
]);
const events = [];

function storage(map) {
  return {
    get length() { return map.size; },
    getItem(key) { return map.get(key) ?? null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); },
    key(index) { return [...map.keys()][index] ?? null; },
  };
}

globalThis.CustomEvent = class CustomEvent extends Event {
  constructor(type, init = {}) {
    super(type);
    this.detail = init.detail;
  }
};
globalThis.window = {
  localStorage: storage(values),
  sessionStorage: storage(sessionValues),
  dispatchEvent(event) { events.push(event); return true; },
  addEventListener() {},
  removeEventListener() {},
};

function check(label, condition) {
  if (!condition) throw new Error(`FAIL: ${label}`);
  console.log(`OK ${label}`);
}

check("consent begins unset", getAnalyticsConsent() === null);
setAnalyticsConsent("granted");
check("grant is persisted", hasAnalyticsConsent());
check("grant dispatches a change event", events.at(-1)?.type === ANALYTICS_CONSENT_EVENT && events.at(-1)?.detail === "granted");
setAnalyticsConsent("denied");
check("denial is persisted", getAnalyticsConsent() === "denied");
check("denial clears local analytics events", !values.has("lire.analytics.localEvents.v1"));
check("denial clears validation identifiers", !values.has("lire.validation.v1"));
check("denial clears the analytics session", !sessionValues.has("lire.analytics.session.v1"));
check("denial clears track-once markers", !sessionValues.has("lire.analytics.once.page:/"));

console.log("\n8 passed, 0 failed.");
