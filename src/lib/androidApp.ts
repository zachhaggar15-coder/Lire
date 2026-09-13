/**
 * Detects whether Sorlio is running inside the Play Store Android app (the
 * Trusted Web Activity) rather than a normal browser tab or installed PWA.
 *
 * A TWA launch sets document.referrer to android-app://<package>, but only on
 * the very first page load — client-side navigation and reloads lose it. So
 * the first sighting is remembered in localStorage for the rest of the
 * device's life. Call rememberAndroidAppLaunch() once on app start.
 */

export const ANDROID_PACKAGE_ID = "app.sorlio.reader";
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
const ANDROID_APP_KEY = "lire.androidApp.v1";

export function isAndroidAppReferrer(referrer: string | null | undefined): boolean {
  return typeof referrer === "string" && referrer.startsWith(`android-app://${ANDROID_PACKAGE_ID}`);
}

export function rememberAndroidAppLaunch(): void {
  if (typeof window === "undefined") return;
  if (!isAndroidAppReferrer(document.referrer)) return;
  try {
    window.localStorage.setItem(ANDROID_APP_KEY, "1");
  } catch {
    // Without storage we fall back to the referrer check alone.
  }
}

export function isAndroidApp(): boolean {
  if (typeof window === "undefined") return false;
  if (isAndroidAppReferrer(document.referrer)) return true;
  try {
    return window.localStorage.getItem(ANDROID_APP_KEY) === "1";
  } catch {
    return false;
  }
}
