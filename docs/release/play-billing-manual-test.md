# Play billing: configuration and manual test plan

Automated tests (`test-billing.mjs`, `test-premium-cache-authority.mjs`) cover
the server logic against fakes. These steps prove the real Play product,
signing, Pub/Sub delivery and UI on devices. They need Play Console and
Google Cloud access, so they are **manual developer actions**.

## A. One-time configuration

1. **Product** (Play Console → Monetize → Subscriptions): `sorlio_premium_monthly`,
   one auto-renewing base plan, 1 month, £3.99 (GBP) with Play's local prices.
   **No free trial, no introductory offer.** If the product has an offer, stop:
   the app and Terms say there is no trial.
2. **Service account for verification** (Cloud console → IAM): the account in
   `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` must be invited in Play Console → Users and
   permissions with "View financial data" and "Manage orders and subscriptions".
3. **Real-time developer notifications**:
   - Cloud console → Pub/Sub: create topic `sorlio-play-rtdn`; grant
     `google-play-developer-notifications@system.gserviceaccount.com` the
     Publisher role on it.
   - Create a **push** subscription to `https://sorlio.site/api/premium/rtdn`,
     with authentication enabled: choose a service account (e.g.
     `sorlio-rtdn-push@<project>.iam.gserviceaccount.com`) and set the audience
     to `https://sorlio.site/api/premium/rtdn`.
   - Vercel production env: `RTDN_PUSH_SERVICE_ACCOUNT` = that service account
     email; `RTDN_PUSH_AUDIENCE` = that audience. Redeploy.
   - Play Console → Monetize → Monetization setup → Real-time developer
     notifications: topic `projects/<project>/topics/sorlio-play-rtdn`; press
     **Send test notification**. Expected: a 200 for the push in the
     subscription's metrics, and a `billing.rtdn_processed` count in
     `sorlio_ops_counters` for today.
   - Negative check: `curl -X POST https://sorlio.site/api/premium/rtdn -d '{}'`
     must return **401**.
4. **Licence testers** (Play Console → Settings → License testing): add the
   tester Google accounts; licence responses `RESPOND_NORMALLY`.
5. **Crons**: Vercel → Project → Settings → Cron Jobs shows `/api/cron/maintenance`
   (03:30 UTC) and `/api/cron/rss-refresh`; `CRON_SECRET` is set.

## B. Test matrix (licence tester, internal testing track, final signed build)

Use two devices (D1, D2) and two Sorlio accounts (A, B). Record date, build,
result and a screenshot for each.

| # | Scenario | Steps | Expected |
|---|---|---|---|
| B01 | Price shown | Open Premium signed in as A | Monthly price from Play (UK: £3.99/month), "renews monthly", "cancel any time in Google Play", no trial wording |
| B02 | Purchase | Subscribe as A on D1 | Play sheet shows the same price; after payment the app shows "Checking with Google Play…", then "Premium is active"; AI works |
| B03 | Pending | Use the "slow card / pending" test instrument | App says payment pending; no Premium features; no "Premium is ready" |
| B04 | Declined | Use the "declined" test card | No Premium; clear message; can retry |
| B05 | Second device | Sign in as A on D2 | Premium active without buying again |
| B06 | Restore | Reinstall on D1, sign in as A, tap Restore | Premium restored, no new charge |
| B07 | Ownership conflict | On D1 (Play account that bought for A) sign in as B and Restore | B is **not** made Premium; message explains the subscription belongs to another Sorlio account |
| B08 | Cancel | Cancel in Play (Manage subscription link in Settings) | App: "Premium — cancelled, active until <date>"; AI still works until then |
| B09 | Expiry | Let the test subscription lapse (test renewals are minutes long) | Within minutes of expiry, Premium ends on both devices; saved words beyond today's 5 stay saved |
| B10 | Grace / on hold | Use the "payment declined on renewal" test | Grace: Premium continues with a payment warning; on hold: Premium ends, message to fix payment |
| B11 | Refund + revoke | Play Console → Order management → Refund with "Revoke" | App closed: on next open (and AI calls) Premium is gone on both devices within minutes (RTDN) or at most 24 h for AI (re-verification) |
| B12 | Refund without revoke | Refund, do not revoke | Access continues until the paid period ends (Play semantics) |
| B13 | Offline after purchase | Airplane mode on D1 | Settings shows Premium as last confirmed, offline note; Premium features (AI, beyond 5 new saves) pause until online — by design |
| B14 | Delete account with active sub | Delete A | Dialog warns the Play subscription is not cancelled; after deletion, cancel in Play still works |
| B15 | RTDN outage | Temporarily disable the push subscription; cancel/refund | Daily maintenance cron re-verifies within 24 h; no indefinite Premium |

## C. Pass criteria

All of B01–B15 pass on the final signed build from the internal track, with
evidence recorded. Any failure blocks release.
