# Google Play Data safety worksheet — Sorlio 1.1.0

Prepared from the code on `release/sorlio-production-hardening`, not from the
earlier closed-test build. These are **recommended answers**; nothing has been
submitted to Play Console. Re-check this sheet against the code before every
submission that changes what leaves the device.

The earlier sheet described optional analytics, research prompts, an Android
beta list and Sentry crash reporting. All four were removed from the app; this
release collects none of them. Historical rows from the old build are being
deleted separately (docs/release/analytics-purge-plan.md) — the form describes
what this version collects.

## Summary answers

| Question | Answer | Basis |
|---|---|---|
| Does your app collect or share any of the required user data types? | **Yes** | Optional account: email, account ID, synced learning data, purchases |
| Is all of the user data collected by your app encrypted in transit? | **Yes** | HTTPS only (HSTS, `upgrade-insecure-requests`) |
| Do you provide a way for users to request that their data is deleted? | **Yes** | In-app (Settings → Account → Delete account) and https://sorlio.site/account/delete |
| Data shared with third parties | **None** | Supabase, Vercel, OpenAI, Upstash and Google act as service providers; Play treats that as not sharing |
| Is your app's data collection required? | Account, sync and purchase data are **optional**: Sorlio works fully without an account |
| Independent security review | No |

## Data types collected

For every row: **Collected** = leaves the device to a server Sorlio controls or
a service provider acting for it. **Not shared.**

### Personal info → Email address
- **Collected:** yes, only when the reader signs in with Google. **Optional.**
- **Purposes:** Account management, App functionality (shown in Settings so the reader knows which account is signed in).
- **Source:** Supabase Auth (`auth.users.email`). The Google name and photo Supabase receives are stripped by migration 0012.
- **Retention:** until the account is deleted.

### Personal info → User IDs
- **Collected:** yes, only with an account. **Optional.**
- **What:** the Supabase account ID (and Google's subject ID, which Supabase needs to recognise a returning account).
- **Purposes:** Account management, App functionality, Fraud prevention / security (one subscription belongs to one account).
- **Source:** `auth.users`, `auth.identities`; the account ID keys every synced row.

### Financial info → Purchase history
- **Collected:** yes, when a signed-in reader subscribes. **Optional.**
- **What:** Google Play purchase token, order ID, product, subscription state, expiry, renewal and acknowledgement flags. No card or bank details (Google handles payment).
- **Purposes:** App functionality (Premium), Account management, Fraud prevention (ownership).
- **Source:** `sorlio_subscriptions`; Google Play notification log stores only a SHA-256 of the token, 90 days.

### App activity → Other user-generated content
- **Collected:** yes, with an account (synced learning data); and, only if the reader turns on "Sync imported texts", their imported texts. **Optional.**
- **What:** saved words and phrases, known words, reading progress and history, goals, settings, grammar/practice progress; imported texts only with the opt-in.
- **Purposes:** App functionality (sync between the reader's devices), Account management.
- **Source:** `sorlio_sync_items` (and legacy `sorlio_user_data`). Imported-text sync defaults to off; turning it off deletes the cloud copies.

### App activity → Other user-generated content (feedback)
- **Collected:** yes, only when the reader sends feedback or reports an AI answer. **Optional.**
- **What:** category, screen/feature, article or word concerned, the comment typed; for an AI report, the word and the AI answer. Linked to the account ID if signed in (so it is deleted with the account), never to an email.
- **Purposes:** App functionality / product improvement (fixing reported errors).
- **Retention:** 12 months (`sorlio_maintenance`).

### App activity → Other user-generated content (AI requests) — **processed ephemerally**
- **Collected:** yes, only when a Premium reader taps an AI action.
- **What:** the word and surrounding sentence, or the text the reader asked to translate (including an imported text, only if they ask), plus their reading level. No name, email or account ID is sent to OpenAI.
- **Ephemeral:** tick "Data is processed ephemerally": Sorlio does not store the request or the answer (OpenAI `store: false`; OpenAI may keep API data up to 30 days for abuse monitoring under its terms).
- **Purposes:** App functionality.
- **Also stored:** a per-account daily count of AI requests (no content), 30 days, for cost/abuse limits — covered by "User IDs".

## Data types NOT collected (answer "No")

- Location (precise or approximate). IP addresses reach the host and are used only to rate-limit abuse (held ≤ 15 minutes); they are not used to derive location. Confirm this reading of Play's guidance before submitting.
- Name, phone, address, other personal info (Google profile fields are stripped).
- Device or other IDs: no advertising ID, no device ID, no analytics or install IDs.
- App info and performance: no crash logs or diagnostics (Sentry removed). Server-side daily totals (`sorlio_ops_counters`) contain no user or device data.
- Health, messages, photos, audio, files, calendar, contacts, web browsing.
- In-app search history: lookups run on the device.
- Speech: listening uses the device's own text-to-speech engine; Sorlio sends nothing.

## Android permissions (merged release manifest, versionCode 9)

`INTERNET`, `ACCESS_NETWORK_STATE` (browser helper), `com.android.vending.BILLING`
(Play Billing), and an app-internal receiver permission. No notifications, no
location, camera, microphone, contacts or storage.
Verified by `scripts/test-android-release-config.mjs` and the built bundle.

## Account deletion

- **In app:** Settings → Account → Delete account.
- **Without the app (Play's required URL):** https://sorlio.site/account/delete
- **Deleted:** the account, all synced learning data and imported texts, subscription records, AI usage counts, save-limit counters, and any feedback linked to the account. Device copies stay until the reader clears the app or uninstalls.
- **Not deleted / not cancelled:** a Google Play subscription must be cancelled in Play; the app says so before deletion.

## Service providers (not "sharing" under Play's definition)

Supabase (accounts, sync, subscriptions, feedback), Vercel (hosting), OpenAI
(AI features, Premium), Upstash (rate limits, news cache, admin-session
revocation — no learning data), Google (sign-in; Play billing and
subscription status). Confirm each provider's data processing terms before
submission (docs/privacy/dpia.md, processors section).
