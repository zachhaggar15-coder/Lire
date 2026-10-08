# Sorlio 1.1.0 (9) — final release pass, 8 October 2026

The verified starting commit is `14216bb68970fe6e8a7b8824abd08828382c62dd`.
It includes `1adf072`, `aa2deb8` and `af94736`. Live `main` initially remained
at `edcc8a453f7175bbe5946d8bb6e75f76ade98a23`; the release history was local,
75 commits ahead, and is to be published without force-pushing.

## Release changes

- Operator and controller: Zachary Haggar, trading as Sorlio.
- Legal address: 58 Ockford Road, Godalming, Surrey, GU7 1RF, United Kingdom.
- Support/privacy contact: Sorlio@proton.me.
- Terms and Privacy effective date: 8 October 2026.
- Readiness checking still blocks legal placeholders and unused Android
  notification permission. Previous optional manual content-review sheets are
  reported as advisory; no review verdicts have been fabricated.
- Android build instructions now describe the current free access model,
  applied schema version 12, Google sign-in and authenticated RTDN setup.
- Store copy contains no unfinished teacher-review claim.
- The Data Safety worksheet no longer mislabels AI requests as ephemeral while
  processor abuse-monitoring retention may apply; the current Play definition
  was checked against Google's official guidance.

## Validation

- Full existing gate: 54 suites, 10,712 checks, zero failures.
- Translation binding: 1,358 / 1,358.
- TypeScript: zero errors. ESLint: zero errors; an existing untracked local
  feedback helper has one unused-import warning and is excluded from release.
- Production dependency audit: zero vulnerabilities.
- Production build: 4,116 generated pages. Windows sandbox path resolution
  required the build to run with the permitted host filesystem access.
- Android Gradle release bundle builds using the installed 64-bit JDK 17.
  Package `app.sorlio.reader`, version 1.1.0 (9), target API 36.
  The generated AAB is unsigned; use the existing upload key locally as described
  in [android-play-build.md](../android-play-build.md), then upload internally.

## Production preparation

Vercel project: `liree` (`prj_NYbQpCHn8acsEhWkyZFdNXtQkkOp`), production
branch `main`, domain `https://sorlio.site`.

Current code no longer uses the four retired settings:
`NEXT_PUBLIC_DEPLOYMENT_EN`, `NEXT_PUBLIC_CLOSED_TEST_PREMIUM_ACCESS`,
`CLOSED_TEST_PREMIUM_COOKIE_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`.
They were removed from Production; Sentry's existing Preview scope was preserved.

The public Play product ID is verified as `sorlio_premium_monthly`.
The server product setting is stored as a non-readable Vercel secret and is
normalised to the same supplied ID before deployment. Existing Play verification
credentials and the configured app certificate fingerprint are preserved.

`RTDN_PUSH_AUDIENCE` and `RTDN_PUSH_SERVICE_ACCOUNT` are absent. Complete their
Google Cloud/Play setup using the actual authenticated push subscription; do not
invent values. This does not prevent the website release. Real purchase,
restore and cancellation/revocation tests remain necessary on an internal Play
installation.

The August store screenshots show obsolete UI and must not be used for this
release. The existing feature graphic can be reused; current production captures
are delivered separately from the frozen source candidate. Final device shots
should show the Play-distributed app and the actual Play offer.

## Freeze and release evidence

Commit this pass, record its exact SHA, publish the release branch, wait for
available CI, then merge and deploy the committed candidate through Vercel's
Git integration. Final candidate/merge/deployment identifiers and production
smoke-test results are recorded in the release report delivered with this pass.
No post-freeze polish or content audit is required.

Historical analytics, legacy profile metadata, user data and production schema
are outside this pass and have not been changed.
