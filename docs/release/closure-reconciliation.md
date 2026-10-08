# Release-closure matrix reconciliation

Reconciles the independent release-closure matrix (82 rows, snapshot of HEAD
`86f995e`, 7 October 2026) against release candidate `release/sorlio-production-hardening`
and production project `blumuxrepzzdwwzomffx`, also on 7 October 2026.

Evidence key: test suite names refer to `node scripts/run-tests.mjs` (counts
are from the final run on the release candidate). "Build" means a production
`next build` + `next start` of the candidate, driven in a browser. "Prod" means
read-only SQL against the production project.

Statuses: **FIXED + VERIFIED**, **ALREADY FIXED + REVERIFIED**, **FALSE POSITIVE / STALE**,
**MANUAL ACTION REMAINS**, **OPEN**.

## Rows the matrix marked STILL OPEN or CLAIMED FIXED — MUST REVERIFY

| Finding | Matrix status | Current reality | Action taken | Evidence/test | Final status | Launch blocker |
|---|---|---|---|---|---|---|
| RC02 A→B private data via origin-wide stores / in-flight work | Must reverify | Every store is partitioned per identity; in-flight work carries an identity generation and is dropped on switch | None needed this pass | test-account-isolation (65), test-sync-engine (111) | ALREADY FIXED + REVERIFIED | No (device check in A02) |
| RC03 Whole-store uploads lost edits / resurrected deletes | Must reverify | Item-level sync with revisions and tombstones (0010, live in prod); old clients still work | None | test-sync-engine (111, real 0010 SQL in PGlite), test-legacy-build-compat (12); prod schema 12 | ALREADY FIXED + REVERIFIED | No |
| RC04 Sync reported success when all uploads failed | Must reverify | Result is per item; failures and pending queue stay visible | None | test-sync-engine, test-persistence-failures (44) | ALREADY FIXED + REVERIFIED | No |
| RC05 Sentry after consent withdrawal | Must reverify | No Sentry package in package.json, lockfile or node_modules; no Sentry code in src | None | Build: zero third-party requests on home, reader, lookup; CSP connect-src allows only self + Supabase | ALREADY FIXED + REVERIFIED | No (old deployment still live: M01) |
| RC06 Sync restored analytics identity | Must reverify | Analytics, validation and research code removed; no analytics key is synced | None | test-security-regressions (52); build: /api/analytics 404 | ALREADY FIXED + REVERIFIED | No |
| RC07 Data Safety mismatched processing | Still open | Worksheet rewritten for the privacy-minimised build (b0895d7) | Rewrote docs/play-data-safety.md | Diffed against code: no analytics, research, beta or Sentry; device-local IDs declared | FIXED + VERIFIED (document) | Console entry is manual (L04) |
| RC08 Google profile metadata copied | Must reverify | 0012 triggers strip new sign-ins (verified with a real sign-in); 6 of 7 existing accounts still hold historical fields | None in code | Prod: 6 users / 6 identities with name/avatar fields | MANUAL ACTION REMAINS (M04 approval) | Yes until approved cleanup |
| RC09 Forged cache unlocks local Premium offline | Still open | Device-cached status can no longer confer any paid capability; offline Premium pauses paid features | `fromDeviceCache` + `confersPremium` (a95e218) | test-premium-cache-authority (20), test-access-model (80) | FIXED + VERIFIED | No |
| RC10 HTTP 200 + isPremium:false → success | Must reverify | Purchase success requires a verified entitlement in the body | None | test-billing (65) | ALREADY FIXED + REVERIFIED | Real UI in F02 |
| RC11 Refund/revoke not reconciled | Must reverify | RTDN route + daily re-verification; AI re-verifies after 24 h | None in code | test-billing; build: unauthenticated RTDN POST → 401 | ALREADY FIXED + REVERIFIED (code) | RTDN not configured in prod (M05) |
| RC12 UI advanced despite failed persistence | Must reverify | Mutators check typed write results before advancing; tombstones after writes | None | test-persistence-failures (44), test-saved-word-review-flow (23) | ALREADY FIXED + REVERIFIED | No |
| RC13 French accents lost in grammar | Must reverify | Orthography restored and checked by machine | None this pass | test-french-content (2279) | ALREADY FIXED + REVERIFIED (machine) | Human sign-off G15 |
| RC14 Stitched "exact" excerpts | Must reverify | 490 contiguous extracts, one source paragraph per paragraph | None this pass | test-public-domain-provenance (4414 offline; 5394 online earlier this session) | ALREADY FIXED + REVERIFIED | No |
| RC15 Dictionary attribution not discoverable | Must reverify | /credits lists dictionary, literature and software licences | None | Build: /credits renders all sections | ALREADY FIXED + REVERIFIED | No |
| RC16 sharp/source-map-js advisories | Must reverify | sharp 0.35.5, source-map-js 1.2.2 installed | None | `npm ls`; `npm audit --omit=dev`: 0 vulnerabilities | ALREADY FIXED + REVERIFIED | No |
| RC17 Deletion left records / ignored sign-out errors | Must reverify | Server deletion cascades; device cleanup and existence check | None | test-account-deletion (33) | ALREADY FIXED + REVERIFIED | Second-device check A02 |
| RC19 Beta endpoint | Must reverify | Route removed | None | Build: /api/android-beta 404; prod table: 0 rows | ALREADY FIXED + REVERIFIED | No (old deployment: M01) |
| RC20 Analytics IDs accepted huge strings | Must reverify | Endpoint removed | None | Build: /api/analytics 404; prod: last row 00:16 UTC 7 Oct, none since migrations | ALREADY FIXED + REVERIFIED | No |
| RC21 Caller level entered system prompt | Must reverify | All four AI routes allowlist the CEFR level | None | test-security-regressions, test-ai-cost-controls (66) | ALREADY FIXED + REVERIFIED | No |
| RC22 Admin cookie replayable, no server expiry | Still open | Random session ID, HMAC, 8 h expiry, server-side revocation (f9626dd) | Rebuilt admin sessions | test-admin-session (24); build: admin page shows only the token form | FIXED + VERIFIED | No |
| RC23 Config drift / typo env key | Must reverify | Env example rewritten; deployment environment derived from VERCEL_ENV at build | next.config env (04129bd) | test-security-regressions; verified `VERCEL_ENV=production` → "production" | FIXED + VERIFIED (code) | Stale Vercel vars: manual hygiene |
| RC24 Closed sheets focusable | Still open | Closed sheets are `inert`; focus moves into the open sheet | 5ec33f6 | Build: 3 closed sheets inert, open word sheet focused on Close | FIXED + VERIFIED | No |
| RC25 French text inherited lang=en | Still open | Reader, grammar, review, sheets, cards marked `lang="fr"` | 5ec33f6 | Build: sentences and answer choices carry lang=fr | FIXED + VERIFIED | Screen-reader device check (A01) |
| RC26 Review grade lost on navigation | Must reverify | Grade stored synchronously before the 760 ms animation | d45ddac | test-saved-word-review-flow (ordering check) | FIXED + VERIFIED | No |
| RC27 81st import evicted the oldest | Must reverify | No eviction; import refused at limit with a message | 8c58c66 | test-import-capacity (9) | FIXED + VERIFIED | No |
| RC28 Research prompt locked out before save | Must reverify | Research feature removed | None | Build: /research-prompts 404; prod: 0 rows | ALREADY FIXED + REVERIFIED | No |
| RC29 Startup weight on low-end phones | Still open | Ladder scoring moved to build time (443 ms → 9 ms, identical routes); font preloads halved (294 → 175 KB). Home still fetches the reading corpus (~0.8 MB brotli) and, after mount, the broad dictionary (~1.25 MB brotli) by design | 772de33, 4a1541b | Build measurements; test-core-logic staleness check | OPEN (partially fixed) | Not alone; measure on a real low-end phone (A01) |
| RC30 Hard-coded price allowed checkout | Must reverify | Checkout disabled without Play product details; "Try again" | b90b87e | Build: signed-out Premium page offers sign-in only | FIXED + VERIFIED | Real product in F02 |
| RC31 Wrong line item / pending acknowledged | Must reverify | Expected SKU and completed state decide entitlement and acknowledgement | None | test-billing (65) | ALREADY FIXED + REVERIFIED | No |
| RC32 Next 16.3.6 | Must reverify | next 16.3.8 installed and built | None | `npm ls next`; audit 0 (prod) | ALREADY FIXED + REVERIFIED | No |
| RC33 Regex tests overstated proof | Must reverify | Sync, billing, deletion and quota suites run real SQL; mutation checks done this session | Added mutation checks for new tests | Mutations caught: CSP (2 checks), journey difficulty staleness | ALREADY FIXED + REVERIFIED | No |
| RC34 Provider 429/401 retried; raw errors shown | Still open | Bounded retries honour Retry-After, no retry on permanent errors; generic messages only | 2ba0ce9 | test-ai-cost-controls (66) | FIXED + VERIFIED | No |
| RC35 100k paragraph-break indices; unsubscribe | Must reverify | Indices validated; body capped at 256 KB; unsubscribe removed | 2ba0ce9 | test-ai-cost-controls | FIXED + VERIFIED | No |
| RC36 Sentry/Resend claims inaccurate | Must reverify | Both removed; feedback stored in DB with minimal fields | None | test-security-regressions; privacy page | ALREADY FIXED + REVERIFIED | No |
| RC37 Lire credits, jargon | Must reverify | Source labels and changelog corrected | 702c090, f473c80 | Build: card labels "Written for Sorlio" / "Classic literature" / "News" | FIXED + VERIFIED | No |
| RC38 Store copy overstated features | Still open | Final listing written against the build (168bfb9) | docs/play-store-listing-final.md | Claims checklist in the document | FIXED + VERIFIED (copy) | Screenshots + upload manual |
| F01 Free/Premium contract | Must reverify | Free core + 5 new saves/day (server-enforced, day clamped ±1); Premium unlimited saves + AI | None | test-access-model (80), test-billing; build Premium page; red team below | ALREADY FIXED + REVERIFIED | No |
| F03 Private imports synced/sent without scope | Must reverify | AI explicit only; imported-text sync opt-in | None | Build: no /api calls while reading or tapping words | ALREADY FIXED + REVERIFIED | No |
| F04 Closed-test Premium survives | Must reverify | No grant path in code | None | Build: /api/closed-test 404; test-access-model | ALREADY FIXED + REVERIFIED | Delete stale Vercel vars (hygiene) |
| G04–G10, G12–G14 French semantic errors | Still open | 25 semantic corrections (jacket construction, -re stems, allions, que/si/dont/penser de, ambiguous keys, voyagé) | 9735e09 | test-french-content: 20 targeted semantic checks + duplicate-choice check | FIXED + VERIFIED (machine) | Human sign-off G15 |
| C02 Editorial matter in bodies | Still open | Illustration tags, scene breaks, synopses and slur barrier excluded; pd-c2-603/607 clean | Repair pipeline | test-public-domain-provenance | FIXED + VERIFIED | No |
| C04 Stale translations of old source | Still open | All 1360 translations bound by source hash and sentence count; 124 regenerated after splitter fixes | 41d6ff0 | verify-precomputed-translations in the suite (1360/1360) | FIXED + VERIFIED | No |
| C05 Rejected dictionary import cached forever | Still open | Rejected import is forgotten; retried on `online` | 4630766 | test-dictionary-recovery (7) | FIXED + VERIFIED | No |
| C06 Hidden sources unrecoverable when RSS health fails | Still open | Preferences always rendered; diagnostics only outside production | 79824f3 | Build: /sources lists preferences with no network data | FIXED + VERIFIED | No |
| C07 Grammar feedback/toast unannounced; lookup unlabeled | Still open | role=status + focus on feedback; toast live region; labelled search | 5ec33f6 | Build: answering moves focus to the role=status feedback | FIXED + VERIFIED | No |
| C08 Account says synced after failure | Must reverify | Latest failure/dirty state overrides history | None | test-sync-engine | ALREADY FIXED + REVERIFIED | No |
| A03 CSP/security headers | Must reverify | CSP + nosniff, DENY, HSTS, COOP, Permissions-Policy | 04129bd | Build: no CSP violations across pages; test-security-regressions (6 header checks, mutation-tested) | FIXED + VERIFIED | Google sign-in on deployed build (M01) |
| V01 Reader vocabulary state: false "Already known", seeded CEFR "known" words, terminal graduation (raised by the developer, 7 Oct) | New (release-blocking) | Confirmed on this branch: the reader let a 500–8,000-lemma level seed and legacy marks override saved cards; "Already known" was a dead end; 3× "Knew it" removed cards from Review; re-saving a known card did nothing | Binary membership (reviewMembership.ts); remove keeps history; CEFR estimate computed, never stored; graduation removed; Words page In review / Not in review | test-review-membership (65, incl. real-Postgres sync and server quota); 4 mutations caught; manual browser pass on legacy data | FIXED + VERIFIED | No |
| UX01 Learner-trust pass (A1–G1, raised by the developer, 8 Oct): false-precision metrics, 0% for no data, wall-clock minutes, UTC streak days, silent caps, rewards for avoiding help, phrase "Known", hide-source on imports, misleading copy | New | 21 of 23 items still present or partly present on this branch (B2 already fixed) | 4 commits plus walkthrough fixes; see learner-trust-pass.md | test-learner-trust (82, non-UTC TZ); manual walkthrough on a production build | FIXED + VERIFIED | No |

## Rows already marked confirmed, manual, or blocker

| Finding | Matrix status | Current reality | Final status | Launch blocker |
|---|---|---|---|---|
| RC01 AI quota schema missing in prod | Manual | 0008–0012 applied; schema version 12 | ALREADY FIXED + REVERIFIED | No |
| RC18 Operator identity | Manual | Name, country, address, effective dates still placeholders; database region now filled (Frankfurt) | MANUAL ACTION REMAINS | **Yes** |
| M01 Production runs old build | Manual | Production web and Play still run the old release | MANUAL ACTION REMAINS (deploy decision) | **Yes** |
| M02 Migration safety | Manual | Closed: applied, verified, history aligned | ALREADY FIXED + REVERIFIED | No |
| M03 Historical analytics | Manual | 11,894 rows; no new row since 00:16 UTC 7 Oct | MANUAL ACTION REMAINS (deploy, then approval) | Yes |
| M04 Historical Google metadata | Manual | 6 users / 6 identities affected | MANUAL ACTION REMAINS (approval) | Yes |
| M05 RTDN/cron configuration | Manual | RTDN push identity not set in Vercel | MANUAL ACTION REMAINS | **Yes** |
| F02 Real Play lifecycle | Manual | Plan: docs/release/play-billing-manual-test.md | MANUAL ACTION REMAINS | **Yes** |
| G01–G03, G11 | Confirmed fixed | Still correct | ALREADY FIXED + REVERIFIED | No |
| G15 Native/qualified French sign-off | Manual | 304 rows await verdicts | MANUAL ACTION REMAINS | **Yes** |
| C01 A1/A2 literary passages | Confirmed fixed | Bank is B1–C2 only | ALREADY FIXED + REVERIFIED | No |
| C03 Teen suitability read-through | Manual | 55 spot-check rows await verdicts | MANUAL ACTION REMAINS | **Yes** |
| L01 Children's Code | Manual | Assessment drafted (docs/privacy/childrens-code-assessment.md) | MANUAL ACTION REMAINS (sign-off) | Yes |
| L02 DPIA | Manual | Drafted (docs/privacy/dpia.md) | MANUAL ACTION REMAINS (approval) | Yes |
| L03 Processor contracts/transfers | Manual | Region verified; contracts not | MANUAL ACTION REMAINS | Yes |
| L04 Play audience/rating declarations | Manual | Worksheet ready | MANUAL ACTION REMAINS | Yes |
| L05 AI safety/reporting | Manual | Explicit-only AI, disclosure on Premium page; reporting via in-app feedback | MANUAL ACTION REMAINS (policy sign-off) | No |
| L06 Rights/complaints/retention operation | Manual | Maintenance cron exists; operator process not | MANUAL ACTION REMAINS | No |
| L07 Content rights (RSS, Gutenberg) | Manual | Attribution present; legal view not | MANUAL ACTION REMAINS | Yes |
| L08 Subscription terms | Manual | Terms written; operator identity missing | MANUAL ACTION REMAINS | Yes (with RC18) |
| L09 Storage classification | Manual | No analytics; storage is strictly necessary | MANUAL ACTION REMAINS (record) | No |
| A01 Final signed AAB / device | Manual | Source 1.1.0 (9); not built or signed by instruction | MANUAL ACTION REMAINS | **Yes** |
| A02 TWA storage / second device | Manual | Needs real devices | MANUAL ACTION REMAINS | Yes |
