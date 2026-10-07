# Sorlio 1.1.0 — final release report

7 October 2026. Candidate: branch `release/sorlio-production-hardening`.
Row-by-row matrix evidence: [closure-reconciliation.md](closure-reconciliation.md).

## 1. Final verdict

**CONDITIONAL GO**

The code is release-ready: every automatable finding is fixed and verified,
and the fresh red-team pass found no new defect. The release still depends on
developer-only actions (section 15). Some of them are hard blockers: operator
legal identity, RTDN configuration, real Play purchase tests, French and
content sign-off, the signed AAB, and deploying this build. Until those are
done, the honest answer to the closing question is no.

## 2. Release SHA

| Item | Value |
|---|---|
| Branch | `release/sorlio-production-hardening` (41 commits ahead of `main`) |
| Code commit | `a147d90` (vocabulary/Review fix; later commits are documents only) |
| Production web deployment | **Not this build.** Vercel denied read access to deployments; the last local deploy worktree is `7ab5195` ("closed-test update 1"), an ancestor of this branch. Unconfirmed. |
| Production database | `blumuxrepzzdwwzomffx`, schema version 12, migrations 0001–0012 aligned |
| Android | Source 1.1.0, versionCode 9 |
| AAB produced | **No** (not built, signed or uploaded, by instruction) |

## 3. What changed

- **Vocabulary/Review (V01, raised by the developer):** a word is in Review or not — the reader shows exactly "Add to review" or "Remove from review". Removed the "Already known" dead end, the CEFR seed of 500–8,000 "known" lemmas (the level is now an estimate computed on demand, used only for difficulty and recommendations), and automatic graduation out of Review. "Remove from review" keeps the card's history; adding it back is not a new save, locally or on the server.
- **Sync/data safety:** per-identity local partitions; item-level sync with revisions and tombstones (0010); honest per-item sync results; durable writes before UI advances; no silent import eviction; review grades stored before the animation.
- **Billing/Premium:** server-authoritative entitlement; Play lifecycle (RTDN, re-verification, ownership); a device-cached status can never grant capability; checkout disabled without real Play product details.
- **AI:** Premium-only and server-enforced; explicit use only; per-user quota (0008/0009); 256 KB body cap; validated paragraph indices; bounded retries that honour Retry-After; generic error messages.
- **Privacy:** analytics, research prompts, beta list and Sentry removed; Google profile stripped on sign-in (0012); minimal feedback; retention and maintenance jobs (0011); privacy policy rewritten from the code; database region stated (Frankfurt).
- **Children:** high-privacy defaults (section 11); Children's Code assessment and DPIA drafted.
- **Content:** 490 contiguous B1–C2 extracts with editorial matter and a slur excluded; grammar orthography plus 25 semantic corrections; all 1360 translations bound to current text by hash and sentence count; three dialogue sentence-splitting defects fixed.
- **Security:** CSP and standard headers; admin sessions are random, HMAC-signed, expire after 8 h and can be revoked; patched next/sharp/source-map-js; retired endpoints removed.
- **Accessibility:** closed sheets inert; focus moved into dialogs; `lang="fr"` on French; live announcements for toast and grammar feedback; labelled lookup.
- **Product polish:** honest source labels; news-sources page works offline; changelog corrected; journey difficulty precomputed (443 ms → 9 ms); font preloads halved.
- **Android:** notification permission dropped; 1.1.0 (9).
- **Compliance docs:** Data Safety worksheet, final listing, billing test plan, French review package, analytics purge and metadata backfill plans.

## 4. Original audit findings

All 82 matrix rows are reconciled in [closure-reconciliation.md](closure-reconciliation.md). Summary:

| Status | Rows |
|---|---|
| FIXED + VERIFIED | V01 (vocabulary state, added 7 Oct), RC07, RC09, RC22–RC27, RC30, RC34, RC35, RC37, RC38, G04–G10, G12–G14 (machine-verified), C02, C04–C07, A03 |
| ALREADY FIXED + REVERIFIED | RC01–RC06, RC10–RC17, RC19–RC21, RC28, RC31–RC33, RC36, M02, F01, F03, F04, G01–G03, G11, C01, C08 |
| OPEN (partially fixed) | RC29: startup weight; must be measured on a real low-end phone |
| MANUAL ACTION REMAINS | RC08 (historical metadata), RC18, M01, M03–M05, F02, G15, C03, L01–L09, A01, A02 |
| FALSE POSITIVE / STALE | None. Several "still open" rows were stale against the snapshot (fixed after it was taken) and are listed as fixed with fresh evidence. |

## 5. Test results

Final run on `a147d90`:

- `node scripts/run-tests.mjs`: **50 suites, 50 passed · 10,470 checks, 0 failed** (the previous candidate `02e1535`: 49 suites, 10,405 checks).
- `tsc --noEmit`: 0 errors. `eslint`: 0 errors (1 warning in the untracked file `show-feedback.mjs`, which is not part of the app).
- `next build`: succeeds (verified in a clean worktree, and driven in a browser).
- `npm audit --omit=dev`: **0 vulnerabilities**. Full audit: 8 (6 high, 2 moderate), all build-time only (Tailwind 3's file watcher and the ESLint plugin). Accepted; fixing needs a Tailwind 4 migration.
- Mutation checks this session: CSP weakened → 2 failures; journey difficulty tampered → failure; vocabulary membership: legacy "known" read as in Review → 2 failures, re-adds charged as new saves → 1, lemma matching removed → 4, reactivation removed → 10.

Largest suites: public-domain provenance 4414, French content 2279, translation binding 1360, core logic 308, contextual translation 183, sync engine 111, review membership 65.

## 6. Production verification

Done against live production (read-only):

- Schema version 12; 0008–0012 objects, grants and behaviour verified earlier; migration history aligned.
- A real Google sign-in exercised the 0012 minimisation triggers.
- Analytics: 11,894 rows; latest at 00:16 UTC on 7 October; **no new rows since the migrations**, although the old build is still deployed.
- Research and beta tables: 0 rows each.
- Historical Google profile fields: 6 of 7 users and 6 identities.
- Project region: eu-central-1 (Frankfurt).

Done against a production build of this candidate (`next start`, local):

- Headers present and no CSP violations on home, journey, reader, word lookup, grammar, Premium, sources, settings and credits.
- Zero third-party requests.
- No `/api` calls while reading or tapping words.
- Retired routes return 404.
- AI, RTDN and cron endpoints refuse unauthenticated calls.
- The admin API fails closed without Redis.

**Not verified:** this build on the production domain, Google sign-in under the new COOP/CSP, and the TWA.

## 7. Privacy data map

| Data | Where | When | Retention |
|---|---|---|---|
| Learning data (progress, saved words, settings) | Device, per identity | Always | Until cleared or uninstalled |
| Same, synced | Supabase (Frankfurt) | Signed-in only | Until account deletion; tombstones purged after 180 days |
| Imported texts | Device; cloud only if sync is turned on for imports | Opt-in | As above; turning sync off deletes cloud copies |
| Account | Supabase Auth: email and provider ID (name/photo stripped) | Signed-in | Until deletion |
| Subscription records | Supabase: product, purchase/order references, state, times | Premium | While the account exists; RTDN log (hashed token) 90 days |
| AI usage counters | Supabase | Premium AI use | Short-lived counters |
| AI request text | Sent to OpenAI (`store:false`) | Explicit Premium request | Not stored by Sorlio |
| Feedback | Supabase: category, comment, page, app version | User-initiated | Per retention job |
| Operational counters | Supabase: aggregates, no identifiers | Server | Aggregate |
| Rate-limit keys | Upstash: IP or user ID keys with TTL | Requests | Minutes |
| Analytics / Sentry / research / beta | **None** in this build | — | Historical analytics awaits purge (M03) |

## 8. Premium matrix

| Feature | Free | Premium |
|---|---|---|
| Read all Sorlio texts, classics, News | ✓ | ✓ |
| Import own texts | ✓ | ✓ |
| Listen (device TTS) | ✓ | ✓ |
| Built-in dictionary lookup (offline) | ✓ | ✓ |
| Save new words | 5 a day (server-enforced) | Unlimited |
| Review saved words | Unlimited | Unlimited |
| Grammar lessons and exercises | ✓ | ✓ |
| Progress and streaks | ✓ | ✓ |
| AI word and sentence explanations | — | ✓ |
| AI translation of news and imports | — | ✓ |
| AI paraphrase practice | — | ✓ |
| Price | Free | £3.99/month, no trial |

## 9. Account/sync guarantees

**Account A's data cannot become Account B's data.**

- Every local store is keyed by identity, so B reads a different partition.
- In-flight sync carries an identity generation and is discarded if the identity changes.
- Server RPCs take an expected-user argument and refuse a mismatch with `auth.uid()`.
- RLS denies direct table access.
- The service worker never caches `/api` or private responses.

Proven by test-account-isolation (65) and test-sync-engine (111, running the real 0010 SQL). Deletion tombstones prevent a second device from resurrecting deleted data (test-account-deletion, 33). Physical two-device and TWA checks remain manual (A02).

## 10. Billing readiness

- **Can a non-paying user forge Premium?** **NO.** The server decides AI access, synced saves and the save quota. A forged device cache is display-only (test-premium-cache-authority). A guest who edits their own browser storage can exceed 5 saves locally, but that data is theirs, on their device, and cannot sync beyond the server's carry-over allowance.
- **Can HTTP success without an entitlement produce Premium UI?** **NO** (test-billing).
- **Can a refunded or revoked entitlement persist indefinitely?** **UNVERIFIED in production.** The code bounds it: RTDN, AI re-verification after 24 h, and the daily maintenance cron. RTDN push authentication is not yet configured in production (M05), and nothing has been tested with real Play purchases (F02).

## 11. Children / teen readiness

High-privacy defaults for an audience of 13 and over:

- No account needed, and nothing leaves the device without one.
- No ads, analytics, tracking, social features or public profiles.
- Google name and photo are stripped.
- AI runs only on an explicit Premium request, with point-of-use disclosure.
- Imported-text sync is opt-in.
- Data is minimised and retention limits are set.

The Children's Code assessment and DPIA are drafted but not approved (L01, L02).

## 12. Content quality

- **Grammar:** orthography and 25 semantic issues corrected and guarded by 2279 checks. **Not human-reviewed:** 304 rows await a qualified reviewer (G15). No "teacher-reviewed" claim is made.
- **Corpus:** 490 contiguous extracts from 15 works, provenance-checked against Project Gutenberg sources. Editorial matter, synopses and a racial slur are excluded. All 1360 translations are bound to their current text.
- **Human review remaining:** French sign-off (304 rows); teen-suitability spot check (55 rows, plus a full read-through of the flagged works).

## 13. Polish scorecard (1–10)

| Area | Score |
|---|---|
| Reading experience | 8 |
| Word lookup | 8 |
| Grammar | 7 (pending human review) |
| Onboarding | 8 |
| Premium/billing UX | 7 (unproven on device) |
| Accessibility | 7 (no screen-reader device pass) |
| Performance | 6 (heavy first load, below) |
| Copy/store honesty | 8 |

## 14. Remaining risks

- **First-load weight (RC29).** The home page fetches the reading corpus (~0.8 MB brotli). After mount it also fetches the broad dictionary (~1.25 MB brotli, 10.7 MB parsed); journey pacing uses its word coverage. The service worker caches both afterwards. Not yet measured on a low-end phone.
- **Untested surfaces.** Google sign-in under the new CSP/COOP, and TWA behaviour, have not been verified on the production domain.
- **Legacy data.** Old production keeps serving existing users until this build is deployed. Legacy Vercel variables remain (harmless, but misleading).
- **Machine translations** can contain mistakes. The UI says so.
- **Dev-only audit findings** (build tooling) are accepted.

## 15. Manual actions only

1. **Operator legal identity.** In `src/lib/legal.ts`, set `operatorLegalName`, `operatorCountry`, `operatorAddress`, `privacyEffectiveDate` and `termsEffectiveDate`. These are legally required for a trader selling subscriptions and for the privacy notice. Verify with `node --import ./scripts/register-alias-loader.mjs scripts/check-release-readiness.mjs`: no `legal:` TODOs.
2. **Authorise deploying this build** to Vercel production (the earlier instruction forbade it). Verify:
   - `curl -sI https://sorlio.site` shows the `Content-Security-Policy` header.
   - Google sign-in completes on the live site.
3. **Vercel → Project liree → Settings → Environment Variables (Production):**
   - Delete `NEXT_PUBLIC_DEPLOYMENT_EN`, `NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS`, `CLOSED_TEST_PREMIUM_COOKIE_SECRET` and `NEXT_PUBLIC_SENTRY_DSN`. They are retired, and the misspelt one misleads.
   - Add `RTDN_PUSH_SERVICE_ACCOUNT` and `RTDN_PUSH_AUDIENCE`; see the next item. Redeploy.
4. **RTDN** (Google Cloud Pub/Sub plus Play Console → Monetization setup), per [play-billing-manual-test.md](play-billing-manual-test.md) §A3. Without it, refunds are only caught by the daily re-check. Verify:
   - Play's "Send test notification" returns 200.
   - A `billing.rtdn_processed` count appears today.
5. **Play Console product:** `sorlio_premium_monthly`, £3.99 monthly, no trial or offer (§A1). Invite the service account (§A2). Add licence testers (§A4).
6. **Real purchase tests B01–B15** on the internal track with the final signed build (§B). They prove the real Play flows. Record evidence for each.
7. **French sign-off** by a native or qualified reviewer: [french-human-review.md](../review/french-human-review.md) (304 rows). Verify: the readiness script shows no `review:` TODO.
8. **Content suitability:** [public-domain-spot-check.md](../review/public-domain-spot-check.md) (55 rows, plus a read-through of the flagged works).
9. **Approve the Children's Code assessment and the DPIA** (`docs/privacy/`).
10. **Check processor terms and transfers** for Supabase, OpenAI, Upstash, Vercel and Google.
11. **Get a legal view on content rights:** French government RSS full text, and Gutenberg editions used commercially in the UK.
12. **Play Console declarations:**
    - Data safety, per `docs/play-data-safety.md`.
    - Target audience 13+ (not Families).
    - Content rating (IARC).
    - App access for reviewers.
    - Ads: none.
13. **Build, sign and upload the AAB** (1.1.0, 9) after items 1–12. Verify Digital Asset Links. Test on a low-end phone, including cold start (RC29) and TalkBack on a reader page.
14. **After deploy (item 2):** confirm no new analytics rows for 24 h. Then approve the analytics purge in [analytics-purge-plan.md](analytics-purge-plan.md) (11,894 rows).
15. **Approve or decline the historical Google metadata cleanup** for 6 users / 6 identities ([auth-metadata-backfill.md](auth-metadata-backfill.md)).
16. **Store listing:** capture screenshots from the signed build ([play-store-listing-final.md](../play-store-listing-final.md)) and upload.

## 16. Final launch checklist

- [x] All automated suites pass on the final commit
- [x] Typecheck, lint and production build pass
- [x] Production dependencies have no known vulnerabilities
- [x] Production schema at version 12, history aligned
- [x] Security headers verified in a production build
- [x] All translations bound to current text
- [ ] Operator legal identity filled in
- [ ] This build deployed to production and sign-in verified there
- [ ] Stale Vercel variables removed; RTDN variables set
- [ ] RTDN delivering to production
- [ ] Play product configured (no trial)
- [ ] B01–B15 passed on the signed internal build
- [ ] French human sign-off complete
- [ ] Content suitability review complete
- [ ] Children's Code assessment and DPIA approved
- [ ] Play Console declarations submitted
- [ ] Signed AAB tested on a low-end device
- [ ] Analytics purge approved and run (after deploy)
- [ ] Historical Google metadata decision made

**"Would I personally release this exact version today?"**

**NO.** The software is ready, but today it would go to paying users and
teenagers without a named legal operator, without proof that real Play
purchases, refunds and revocations work, with RTDN unconfigured, and with
French and content sign-off still outstanding.
