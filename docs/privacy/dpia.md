# Data protection impact assessment (DPIA) — Sorlio 1.1.0

**Status: DRAFT for the controller's approval. Not legal advice.**
**[ADVICE]** marks questions for a qualified adviser. Controller identity:
see src/lib/legal.ts (placeholders until supplied).

## 1. Why a DPIA

The service is likely to be used by children (13–17), offers AI processing of
learner text, optional cloud sync of private imported texts, and paid
subscriptions. The UK Children's Code expects a DPIA for services likely to
be accessed by children.

## 2. Processing described

| Purpose | Data | Subjects | Lawful basis (UK GDPR) | Where | Retention |
|---|---|---|---|---|---|
| Reading, learning (no account) | Learning data | All users | Not processed by us (device only) | Device | Until cleared/uninstalled |
| Account | Email, account ID, Google subject ID, sign-in records (Supabase) | Account holders | Contract (6(1)(b)) | Supabase ([region]) | Until deletion |
| Sync | Learning data; imported texts only with opt-in | Account holders | Contract | Supabase | Until deletion / opt-out; deletion records 180 days |
| Premium | Play purchase token, order ID, state, expiry | Subscribers | Contract; legal obligation where applicable | Supabase; Google Play | While account exists; notification log 90 days (hashed token) |
| AI features | Word/sentence/text the reader asks about, reading level; daily request count | Premium subscribers | Contract | OpenAI (US); count in Supabase | Not stored by Sorlio; OpenAI up to 30 days (abuse); counts 30 days |
| Feedback / AI reports | Category, screen, item, comment; account ID if signed in | Senders | Legitimate interests | Supabase | 12 months |
| Security / abuse prevention | IP address (rate limits), hosting logs | All visitors | Legitimate interests | Upstash; Vercel | ≤15 minutes; Vercel log retention |
| Operations | Daily counts with no identifiers | — | Not personal data | Supabase | 400 days |

## 3. Necessity and proportionality

- No account is required to use the core app; accounts exist for sync and Premium only.
- Removed in this release: product analytics, research prompts, beta mailing list, crash reporting (Sentry), Google profile name/photo.
- Imported-text sync is opt-in and reversible; AI is never invoked automatically.
- Payment card data is never received (Google Play is the payment processor).
- Retention is enforced by `sorlio_maintenance()` on a daily schedule.

## 4. Risks and controls

| Risk to individuals | Likelihood | Severity | Controls | Residual |
|---|---|---|---|---|
| One account's private data appearing in another's on a shared device | Low | High | Per-identity partitions; identity checks in every sync RPC; tests (account isolation, sync engine) | Low |
| Deleted data resurrected by a stale device | Low | Medium | Durable tombstones, revision CAS, purge watermark; account deletion invalidates tokens | Low |
| Private imported text exposed | Low | High | Local by default; opt-in sync; not sent to AI unless asked; excluded from feedback | Low |
| Unsuitable content for teenagers | Medium | Medium | Content exclusions; official news sources only; AI safety rules; report button | Medium until human content review done |
| AI output wrong or inappropriate | Medium | Low–Medium | Explicit invocation; disclosure; reporting; generic error handling | Medium |
| International transfer (OpenAI, Vercel, Upstash: US) | — | Medium | Providers' DPAs with SCCs / UK Addendum (to confirm) | **[ADVICE]** confirm transfer mechanism per provider |
| Unauthorised access to admin feedback reader | Low | Medium | Expiring, revocable sessions; rate limits; no email in feedback | Low |
| Payment disputes / wrong entitlement | Low | Medium | Server-side verification, RTDN, freshness bounds, ownership checks | Low (manual Play test still required) |
| Historical data from earlier test builds (analytics, Google profile fields) | Certain (exists) | Low–Medium | Purge plan and backfill prepared; await approval | Open until executed |

## 5. Consultation

- Users: none formally. **[ADVICE]** whether consultation with learners/parents is expected.
- Processors: DPAs to be confirmed (Supabase, Vercel, OpenAI, Upstash, Google).

## 6. Outcome

No high residual risk identified that would require prior consultation with
the ICO, **subject to**: the human content review, processor/transfer
confirmation, executing the approved historical-data cleanups, and an
operated inbox for rights requests and AI reports.

Approved by (controller): ______________________ Date: __________
Review date: before any change that adds a new data type or processor, and at least yearly.
