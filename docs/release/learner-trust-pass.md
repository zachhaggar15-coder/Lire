# Learner-trust UX pass

8 October 2026. Branch `release/sorlio-production-hardening`.
Standard: estimates are fine, false precision is not.

Commits:

| Commit | Contents |
|---|---|
| `2e518cb` | Honest learner progress metrics |
| `01f6f49` | Protect imported and historical learner data |
| `9bb8af9` | Simplify review and recommendation UX |
| `a52e20f` | Align reader interactions and learner-facing copy |
| `8d07282` | Walkthrough fixes |

Tests: `scripts/test-learner-trust.mjs` (82 checks, run in a non-UTC timezone), plus updates to core-logic, persistence-failures, rate-prompt and saved-word-review-flow.

Final gate on `8d07282`: **51 suites, 10,549 checks, 0 failed**; `tsc` 0; `eslint src scripts` 0; `npm audit --omit=dev` 0 vulnerabilities; `next build` passes.

| Finding | Status before | What changed | Why simpler / more accurate | Tests |
|---|---|---|---|---|
| A1 False-precision metrics | Still present | Topic cards show readings completed, words read and comprehension answers. Removed: "Lv N", "72% + 4%/article vocabulary coverage", the archive's "Topic proficiency" (CEFR+ score and coverage), and the weekly "coverage rise", "most difficult area" and "strongest topic". | Shows only what Sorlio knows; deletes formulas rather than improving them. | A1 section |
| A2 Zero shown as ability | Still present | One `comprehensionPercent` returns null with no answers ("Not measured yet"); a real 0 of N stays 0%; 3 of 4 is 75%. | No denominator, no number. | A2 section |
| A3 Wall-clock reading time | Still present (active tracker unused) | Active foreground minutes recorded at completion (whole minutes, at least 1, nothing under 30 s); otherwise "about N min" from text length. Never opened-to-finished time. | Reuses the existing tracker; no migration; old records fall back to the estimate. | A3 section |
| A4 Streak day boundaries | Still present (UTC ISO dates + local getDay) | One `localDate.ts` helper used by streaks, the streak week, grace days, missions, personal bests and the daily save limit. | Three competing helpers became one; no timezone library. | A4 section (Europe/London, midnight, DST) |
| A5 Imported-text eviction / delete | Partially fixed (no eviction already) | Delete asks for confirmation; the limit message says what to do; "N of 80" shown. | Confirmation (option A) fits the page; no undo machinery. | A5/D1 section |
| B1 Phrase "Known" | Still present | Phrases stay in Review; three correct in a row shows "Mastered" (information only). The "Known" button and terminal state are gone; old "known" phrases read as mastered. | Same model as words; no SRS rewrite. | B1/B2 section |
| B2 Fake phrase example | Already fixed (context sentence shown) | Regression guard only. | — | B1/B2 section |
| B3 Review completion copy | Partially fixed ("Reviewed" already) | "Reviewed N · X remembered · Y needed another look". | Uses counts the page already had. | B3 section |
| B4 Same word, new meaning | Partially fixed (copy) | The new meaning is added to the card (on re-save, or via "Add this meaning to your card" in the sheet); the copy says "This word is already in Review". | One card per word, kept honest; no sense-level cards. | B4 section |
| C1 Hide source | Still present | Only real news sources can be preferred or hidden; hiding leaves an in-place Undo plus "Manage hidden sources"; an old "Imported text" hide no longer hides imports. | One rule (`hasHideableSource`) used everywhere. | C1/C2 section |
| C2 Recommendation feedback | Still present | More/Less like this show a pressed state and a one-line status; Prefer shows "… readings come first". | No dashboard or scores. | C1/C2 section |
| C3 Saved for later | Still present (never listed) | Own section on Lessons when non-empty; resolves saved items from anywhere (News, lessons, imports). | One list, one place. | C3/F4 section |
| C4 Import defaults | Still present | Topic defaults to "General" (shown as General, kept out of topic stats and interest learning); level starts at the learner's own level, labelled as such. | Optional flag instead of a taxonomy change. | C4/C5 section |
| C5 Edit imports | Still present | Edit reuses the import form and keeps the text's id. | No versions or drafts. | C4/C5 section |
| D1 Silent caps | Phrases 500 and summaries 200 still silently trimmed | Both refuse a new item at the limit and say so; nothing is dropped. The reading history is a rolling 500, described as such. | Cap kept; silence removed. | D1 section |
| D2 Archive snapshots | Still present | Active minutes, saved-word count and phrase count are snapshotted at completion; old entries show nothing rather than a recount by title. | Optional fields; no backfill. | D2 section |
| E1 Lookup-shaming copy | Still present | "Lookup use" and "lookups per 100 words"; trends phrased as more or fewer than recent readings; "Independent reading." removed. | Facts, not judgement. | E2 section |
| E2 Rewards for avoiding help | Still present | "Translation restraint" and "Stay in French" missions became "Read it again" and "Practise grammar"; the achievement became "Second Reading"; the article score and personal bests no longer reward fewer lookups; challenge XP removed. | One-for-one replacements; no new gamification. | E2 section |
| F1 Reader help copy | Still present ("Hold a word") | "Tap a word… Sorlio recognises common expressions automatically…". | Matches the real gesture. | F section |
| F2 Listening labels | Still present | "Previous paragraph" / "Last paragraph" (aria-label and title). | Labels match behaviour; no audio timeline. | F section |
| F3 Rating prompt | Still present (3 lessons) | 7 lessons on at least 3 local days; no sentiment gate; "Not now" unchanged. | Two counters. | F section, test-rate-prompt |
| F4 Internal links | One `<a>` left | Compact cards use `next/link`. | — | C3/F4 section |
| F5 Onboarding overclaims | Still present | No "to fluent reading"; levels shown as "A1 · Beginner … C2 · Very advanced", not word counts. | — | F section |
| G1 "Settings" tab | Still present | The tab and hub are "You"; sub-pages go "Back to You"; real preferences sit under "Account and settings". No route changes. | Copy and layout only. | F section |

## Deliberately not implemented

- **B2:** already fixed before this pass; a regression test was added.
- **Separate cards per word sense (B4):** this would need a storage and SRS change. The limitation is documented: one card per word holds every meaning. The smallest safe future step is an optional `meanings: {meaning, sentence}[]` on the card, shown on the Words page.
- **A3 historical reconstruction:** old records fall back to the text's length estimate by design.
- **Removing a phrase from Review without deleting it:** phrases have no reader save path. The Words page delete remains the control. A future pass could reuse `removedFromReviewAt` for phrases if phrase saving returns.

## Manual walkthrough (production build, legacy data seeded)

- **New user:** onboarding copy and level names.
- **Free/returning user:**
  - Progress shows activity, "not measured yet" and 75%.
  - Reading history shows "about 3 min" for an article left open overnight (it previously showed hours), and "6 min reading · 2 words saved" from a snapshot.
  - Saved for later is visible on Lessons.
  - Phrases show In review and Mastered.
- **Heavy user:**
  - Import list shows "1 of 80".
  - Edit kept the id and changed the topic from General to Culture.
  - An old "Imported text" hide no longer hides imports.
- **Walkthrough fix:** a "Fewest translations" personal best was found and removed.

Covered by tests rather than the browser: News card controls (no live RSS locally), the midnight and DST cases, and the cap limits.
