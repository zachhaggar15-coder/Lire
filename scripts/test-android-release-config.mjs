import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("android/twa-manifest.json"));
const gradle = read("android/app/build.gradle");
const assetLinksRoute = read("src/app/.well-known/assetlinks.json/route.ts");
const releaseDocs = read("docs/android-play-build.md");

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

console.log("8 passed, 0 failed — Android release configuration is reconciled.");
