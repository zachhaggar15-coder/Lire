# Android Play build

Lire's Android app is a Trusted Web Activity for `https://liree.vercel.app`.

- Package ID: `app.liree.reader`
- Target SDK: Android 16 / API 36
- Minimum SDK: Android 6 / API 23 (required by the Play Billing bridge)
- Web manifest: `https://liree.vercel.app/manifest.json`
- Digital Asset Links: `https://liree.vercel.app/.well-known/assetlinks.json`

## Signing setup

Signing material must never be committed. Create or select the upload key locally, then configure Play App Signing in Play Console. Set `ANDROID_APP_SHA256_CERT_FINGERPRINT` in the production deployment to the SHA-256 fingerprint from Play Console's **App integrity > App signing key certificate**. If testing a locally signed build before Play signing, add both fingerprints as a comma-separated value.

The asset-links endpoint intentionally returns an empty valid array until a fingerprint is configured. This prevents an incorrect certificate from being asserted in production.

## Premium subscription setup

Lire uses Google Play Billing for digital Premium access in the Play-distributed Android app. In Play Console, create an auto-renewing monthly subscription with product ID `lire_premium_monthly`, a GBP base price of £3.99, and the required regional prices. The free tier remains usable without an account and claims one distinct article per local calendar day; reopening that article on the same day remains available.

Run the updated `supabase/schema.sql` once to create the server-only `lire_subscriptions` entitlement table. Create a Google Play service account, grant it access to subscription information and purchase acknowledgement, and configure the following production variables:

- `NEXT_PUBLIC_GOOGLE_PLAY_PREMIUM_PRODUCT_ID=lire_premium_monthly`
- `GOOGLE_PLAY_PREMIUM_PRODUCT_ID=lire_premium_monthly`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<complete service-account JSON on one line>`

Premium purchases require the existing passwordless Lire account. This is intentional: the account connects a verified Google Play purchase to an entitlement that can also be used on the website. The web version does not direct Play-app users to an external payment method.

## Build

Use a 64-bit JDK 17 or newer. From the `android` directory, use Bubblewrap to update or build the generated project:

```powershell
npx @bubblewrap/cli build
```

A release build produces an APK for device testing and an Android App Bundle for Play Console. Bubblewrap will request the local keystore passwords at build time; do not add them to environment files committed to source control. If Bubblewrap's downloaded Java runtime fails with an out-of-memory error, set `JAVA_HOME` to an installed 64-bit JDK before running the build.

To confirm the project compiles without creating or using signing secrets, run `gradlew.bat assembleRelease bundleRelease` from the `android` directory. The unsigned outputs are written below `android/app/build/outputs/` and are intentionally excluded from source control.

Before the first Play upload, confirm the package ID and app name. The package ID cannot be changed for later updates after the app is created in Play Console.
