import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("android/twa-manifest.json"));
const gradle = read("android/app/build.gradle");
const assetLinksRoute = read("src/app/.well-known/assetlinks.json/route.ts");
const releaseDocs = read("docs/android-play-build.md");
const androidManifest = read("android/app/src/main/AndroidManifest.xml");
const delegationService = read("android/app/src/main/java/app/sorlio/reader/DelegationService.java");

const gradlePackage = gradle.match(/applicationId\s+["']([^"']+)["']/)?.[1];
const gradleVersionCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
const gradleVersionName = gradle.match(/versionName\s+["']([^"']+)["']/)?.[1];
const routePackage = assetLinksRoute.match(/PACKAGE_NAME\s*=\s*["']([^"']+)["']/)?.[1];

assert.equal(manifest.packageId, gradlePackage, "TWA and Gradle package IDs must match");
assert.equal(manifest.packageId, routePackage, "TWA and Digital Asset Links package IDs must match");
assert.equal(manifest.appVersionCode, gradleVersionCode, "TWA and Gradle version codes must match");
assert.equal(manifest.appVersionName, gradleVersionName, "TWA and Gradle version names must match");
assert.deepEqual(manifest.fingerprints, [], "TWA fingerprints stay empty because production env is authoritative");
assert.match(assetLinksRoute, /ANDROID_APP_SHA256_CERT_FINGERPRINT/, "asset links must read the production fingerprint variable");
assert.match(assetLinksRoute, /force-dynamic/, "asset links must read the fingerprint at request time");
assert.match(releaseDocs, /not the source of truth for website verification/, "release docs must name the authoritative fingerprint source");

// Sorlio sends no notifications, so it must not ask for the permission
// (Play's Data safety and the store listing say so).
assert.doesNotMatch(androidManifest, /POST_NOTIFICATIONS/, "the app must not request the notification permission");
assert.doesNotMatch(androidManifest, /NotificationPermissionRequestActivity/, "no notification permission prompt activity");
assert.equal(manifest.enableNotifications, false, "TWA notification delegation stays off");
// Play Billing in a TWA runs through the Digital Goods handler registered on
// DelegationService. Bubblewrap ties that service to enableNotifications, so
// turning notifications off must not disable it.
const delegation = androidManifest.match(/<service[^>]*android:name="\.DelegationService"[^>]*>/s)?.[0] ?? "";
assert.match(delegation, /android:enabled="true"/, "DelegationService must stay enabled for Play Billing");
assert.match(delegation, /android:exported="true"/, "DelegationService must stay exported for Play Billing");
assert.match(delegationService, /registerExtraCommandHandler\(new DigitalGoodsRequestHandler/, "Digital Goods handler must be registered");
assert.match(androidManifest, /playbilling\.provider\.PaymentActivity/, "Play Billing payment activity must be declared");
assert.ok(manifest.features?.playBilling?.enabled === true, "Play Billing feature stays enabled");

console.log("17 passed, 0 failed — Android release configuration is reconciled.");
