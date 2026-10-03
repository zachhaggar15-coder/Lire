# Android Play build

Sorlio's Android app is a Trusted Web Activity for `https://sorlio.site`.

- Package ID: `app.sorlio.reader`
- Target SDK: Android 16 / API 36
- Minimum SDK: Android 6 / API 23 (required by the Play Billing bridge)
- Web manifest: `https://sorlio.site/manifest.json`
- Digital Asset Links: `https://sorlio.site/.well-known/assetlinks.json`

## Signing setup

Signing material must never be committed. Create or select the upload key locally, then configure Play App Signing in Play Console. Set `ANDROID_APP_SHA256_CERT_FINGERPRINT` in the production deployment to the SHA-256 fingerprint from Play Console's **App integrity > App signing key certificate**. If testing a locally signed build before Play signing, add both fingerprints as a comma-separated value.

`android/twa-manifest.json` deliberately keeps `fingerprints` as `[]`: it is
not the source of truth for website verification. The deployed
`/.well-known/assetlinks.json` route reads the production variable at request
time. Before each Play upload, verify the deployed endpoint contains the Play
App Signing fingerprint and the package `app.sorlio.reader`; do not copy a
certificate into the manifest, where it would drift from the live association.

The asset-links endpoint intentionally returns an empty valid array until a fingerprint is configured. This prevents an incorrect certificate from being asserted in production.

## Premium subscription setup

Sorlio uses Google Play Billing for digital Premium access in the Play-distributed Android app. In Play Console, create an auto-renewing monthly subscription with product ID `sorlio_premium_monthly`, a GBP base price of £3.99, and the required regional prices. Access has three levels, defined in `src/lib/access/limits.ts`: a guest gets one article and three word lookups per day, a free signed-in account gets three articles and ten lookups, and Premium removes both limits and unlocks the advanced study features. Reopening an already-claimed article on the same day stays free at every level.

Run every file in `supabase/migrations/` once, in filename order (`0001` through `0007`). They are idempotent and create every table the app queries, including the server-only `sorlio_subscriptions` entitlement table. See `supabase/migrations/README.md`. Create a Google Play service account, grant it access to subscription information and purchase acknowledgement, and configure the following production variables:

- `NEXT_PUBLIC_GOOGLE_PLAY_PREMIUM_PRODUCT_ID=sorlio_premium_monthly`
- `GOOGLE_PLAY_PREMIUM_PRODUCT_ID=sorlio_premium_monthly`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<complete service-account JSON on one line>`

Premium purchases require the existing passwordless Sorlio account. This is intentional: the account connects a verified Google Play purchase to an entitlement that can also be used on the website. The web version does not direct Play-app users to an external payment method.

## Temporary closed-test Premium access

Temporary Premium is disabled and fails closed. The earlier web-only mechanism
trusted TWA-shaped request metadata; raw HTTP clients can forge those headers,
so the issuer and activation route were removed. The status endpoint always
returns `active: false` and expires any cookie from the retired mechanism.

Do not re-enable `NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS` or reuse
`CLOSED_TEST_PREMIUM_COOKIE_SECRET`. Safe tester-specific access requires a
future Android binary to provide server-verifiable native proof (for example,
an authenticated tester allow-list backed by Play Integrity). Until then,
closed testers use the ordinary guest/free/subscription rules. No fake Play
purchase or Supabase subscription is created.

## Closed-test update log

### 2026-10-01 — Earlier maintenance update: saved words, onboarding, and sign-out

At the time it shipped, this web-only controlled update kept the then-existing temporary closed-test Premium entitlement enabled and did not change the Android wrapper, package, version code, or version name. That temporary entitlement has since been retired as described above; this entry is retained only as historical release context.

Implementation commit: `6df5980` (`Fix saved-word review flow and sign-out`).

- Fixed the saved-word/review contradiction: onboarding can seed words as **known**, which intentionally records vocabulary but does not create Review cards. The word sheet now labels those words as already known rather than offering a misleading “Remove from review” action. New review saves use the real saved-word store and only report success after a durable new card exists.
- Routed every vocabulary-save surface, including the reader’s mini review, learning candidates, and interactive onboarding, through the same entitlement-aware save path. Closed-test Premium uses that ordinary path; disabling the temporary entitlement restores the usual gate without deleting existing local learning data.
- Updated the interactive onboarding copy and action to reflect the reader’s actual access state. It no longer creates a demo save for an unentitled learner.
- Added a sign-out confirmation that states local learning data remains on-device. Cancel, Android Back, Escape, or a failed sign-out leave the account state unchanged and show an inline error where appropriate.
- Added regression coverage for saved-word persistence/reviewability, duplicate and failed writes, entitlement restoration, onboarding messaging, and sign-out confirmation/error behavior.

**Tester checks after deployment:** in an Android closed-test session, save a word from an article and confirm it appears in Review after reopening; verify a seeded known word says “Already known” and is absent from Review; complete the onboarding save step and confirm the copy matches closed-test Premium; then verify Settings sign-out cancel/back and a successful sign-out. In a normal browser/free-account session, verify save controls remain gated and onboarding does not create a demo Review card.

### 2026-10-03 — Closed-Test Update 1: onboarding clarity and sign-out confirmation

Web-delivered only. Android wrapper source, package, version code and version
name are unchanged; no Bubblewrap rebuild or new AAB is required.

Implementation commit: `2bfb683` (`Make onboarding save step entitlement-aware and harden sign-out`), pushed to `main` and deployed to `https://sorlio.site` through the normal Vercel workflow.

**Tester-feedback themes addressed:** onboarding / first-use clarity; a walkthrough step that could imply saving was available when it is not; and logout behaviour. These are themes from tester feedback; this entry does not record specific bug reports.

**User-facing changes**

- Onboarding save step is now an honest preview for guests and signed-in free users. It never calls the save path and creates no saved-word state. The button reads “What does saving do?” and the message says Premium lets you save vocabulary and review it later, and that nothing was saved. Genuine Premium users still save a real word through the same guarded path as the Reader.
- The tour's end summary shows “Save & Review: Premium” instead of a misleading “Words saved: 0” for readers who cannot save.
- The walkthrough no longer references temporary closed-test Premium (retired; not restored).
- Sign out already asked for confirmation (see the earlier entry). It now says “account sync and Premium access will be unavailable until you sign in again”, focuses **Cancel** first so a stray Enter cannot sign out, ignores Escape/Back while a sign-out is in flight, and shows a plain-language error (not raw Supabase text) if sign-out fails. A failed sign-out leaves the user signed in and retryable; local learning data is never touched.

**Tests:** new `scripts/test-closed-test-update-1.mjs` (51 behavioural checks: guest/free/Premium save behaviour, onboarding state, `signOut` wrapper, duplicate-submit guard, failure/retry, local-data preservation); existing account, saved-word/Review, access, security and corpus tests rerun. Full `npm test`, TypeScript, lint and production build pass. Browser checks on a mobile viewport covered guest onboarding, reload mid-tour, completion, Settings restart, Reader, Review gating and live News. A live signed-in sign-out could not be exercised without Google credentials, so it is covered by the automated flow tests only.

**Questions for testers**

1. Was it clear during onboarding which features were available to you?
2. Did the save/Review explanation make sense?
3. Did anything in onboarding imply something had been saved when it had not?
4. Was the Sign out confirmation clear?
5. Could you cancel Sign out without anything changing?
6. Did anything else feel confusing during your first few minutes using Sorlio?

## Build

### JDK requirement

The build needs a **64-bit JDK 17**. This is not a preference — the Android
Gradle Plugin used here refuses to run on an older JDK, and Bubblewrap's own
bundled runtime is 32-bit on some Windows installs, which fails with an
out-of-memory error rather than a clear message about the JDK.

Confirm the version before building:

```powershell
java -version
```

Expect `17.x` and a line mentioning `64-Bit Server VM`. If it reports anything
else, install a 64-bit JDK 17 (Temurin or Microsoft Build of OpenJDK) and point
`JAVA_HOME` at it for the session:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17"
```

A newer JDK may work, but 17 is the version this project is known to build on;
if a later JDK produces a Gradle or AGP compatibility error, drop back to 17
rather than chasing the error.

### Running the build

From the `android` directory, use Bubblewrap to update or build the generated project:

```powershell
npx @bubblewrap/cli build
```

A release build produces an APK for device testing and an Android App Bundle for Play Console. Bubblewrap will request the local keystore passwords at build time; do not add them to environment files committed to source control. If Bubblewrap's downloaded Java runtime fails with an out-of-memory error, set `JAVA_HOME` to an installed 64-bit JDK before running the build.

To confirm the project compiles without creating or using signing secrets, run `gradlew.bat assembleRelease bundleRelease` from the `android` directory. The unsigned outputs are written below `android/app/build/outputs/` and are intentionally excluded from source control.

## Release configuration

| Setting | Value | Where |
| --- | --- | --- |
| Package ID | `app.sorlio.reader` | `android/app/build.gradle`, `android/twa-manifest.json` |
| Version code | `8` | `android/app/build.gradle`, `android/twa-manifest.json` |
| Version name | `1.0.3` | `android/app/build.gradle`, `android/twa-manifest.json` |
| Launcher name | `Sorlio` | `android/twa-manifest.json` |
| Full name | `Sorlio — French Reader` | `android/twa-manifest.json`, `public/manifest.json` |
| Signing alias | `sorlio-upload` | `android/twa-manifest.json` |
| Declared permissions | none | `android/app/src/main/AndroidManifest.xml` |

`INTERNET` arrives through manifest merge from the AndroidX browser-helper
library, which is expected for a Trusted Web Activity. `POST_NOTIFICATIONS` is
declared because `enableNotifications` must stay `true`: Bubblewrap refuses to
build with Play Billing enabled otherwise ("Play Billing requires
enableNotifications to be true"). Nothing in the app sends notifications, so
the permission is never requested at runtime; if Play review asks, that is the
answer.

Version code must increase on every upload. Version name is what readers see.
Bump `versionCode` by one for each subsequent upload even if the version name
is unchanged.

Before the first Play upload, confirm the package ID and app name. **The package
ID can never be changed once the app exists in Play Console** — this is why
`app.liree.reader` was migrated to `app.sorlio.reader` before, and not after,
the first release.

> **VERIFY CURRENT GOOGLE PLAY REQUIREMENT.** Play raises the minimum
> `targetSdkVersion` for new apps roughly once a year, and separately sets
> deadlines for existing apps. This project currently targets API 36. Check the
> target API level requirement in Play Console before uploading rather than
> trusting the value recorded here.
