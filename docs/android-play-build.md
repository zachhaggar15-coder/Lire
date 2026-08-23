# Android Play build

Sorlio's Android app is a Trusted Web Activity for `https://liree.vercel.app`.

- Package ID: `app.sorlio.reader`
- Target SDK: Android 16 / API 36
- Minimum SDK: Android 6 / API 23 (required by the Play Billing bridge)
- Web manifest: `https://liree.vercel.app/manifest.json`
- Digital Asset Links: `https://liree.vercel.app/.well-known/assetlinks.json`

## Signing setup

Signing material must never be committed. Create or select the upload key locally, then configure Play App Signing in Play Console. Set `ANDROID_APP_SHA256_CERT_FINGERPRINT` in the production deployment to the SHA-256 fingerprint from Play Console's **App integrity > App signing key certificate**. If testing a locally signed build before Play signing, add both fingerprints as a comma-separated value.

The asset-links endpoint intentionally returns an empty valid array until a fingerprint is configured. This prevents an incorrect certificate from being asserted in production.

## Premium subscription setup

Sorlio uses Google Play Billing for digital Premium access in the Play-distributed Android app. In Play Console, create an auto-renewing monthly subscription with product ID `sorlio_premium_monthly`, a GBP base price of £3.99, and the required regional prices. Access has three levels, defined in `src/lib/access/limits.ts`: a guest gets one article and three word lookups per day, a free signed-in account gets three articles and ten lookups, and Premium removes both limits and unlocks the advanced study features. Reopening an already-claimed article on the same day stays free at every level.

Run `supabase/release-migration.sql` once. It is the consolidated, idempotent migration for a release database and creates every table the app queries, including the server-only `lire_subscriptions` entitlement table. Create a Google Play service account, grant it access to subscription information and purchase acknowledgement, and configure the following production variables:

- `NEXT_PUBLIC_GOOGLE_PLAY_PREMIUM_PRODUCT_ID=sorlio_premium_monthly`
- `GOOGLE_PLAY_PREMIUM_PRODUCT_ID=sorlio_premium_monthly`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<complete service-account JSON on one line>`

Premium purchases require the existing passwordless Sorlio account. This is intentional: the account connects a verified Google Play purchase to an entitlement that can also be used on the website. The web version does not direct Play-app users to an external payment method.

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
| Version code | `1` | `android/app/build.gradle` |
| Version name | `1.0.0` | `android/app/build.gradle` |
| Launcher name | `Sorlio` | `android/twa-manifest.json` |
| Full name | `Sorlio — French Reader` | `android/twa-manifest.json`, `public/manifest.json` |
| Signing alias | `sorlio-upload` | `android/twa-manifest.json` |
| Declared permissions | none | `android/app/src/main/AndroidManifest.xml` |

The app declares no permissions of its own. `INTERNET` arrives through manifest
merge from the AndroidX browser-helper library, which is expected for a Trusted
Web Activity. `POST_NOTIFICATIONS` was removed along with the TWA's
`enableNotifications`, because nothing in the app sends notifications; asking
for a permission the app never uses is a question Play review can reasonably
ask about and there was no answer worth giving.

Version code must increase on every upload. Version name is what readers see.
For the first release, `versionCode 1` / `versionName 1.0.0` is correct; bump
`versionCode` by one for each subsequent upload even if the version name is
unchanged.

Before the first Play upload, confirm the package ID and app name. **The package
ID can never be changed once the app exists in Play Console** — this is why
`app.liree.reader` was migrated to `app.sorlio.reader` before, and not after,
the first release.

> **VERIFY CURRENT GOOGLE PLAY REQUIREMENT.** Play raises the minimum
> `targetSdkVersion` for new apps roughly once a year, and separately sets
> deadlines for existing apps. This project currently targets API 36. Check the
> target API level requirement in Play Console before uploading rather than
> trusting the value recorded here.
