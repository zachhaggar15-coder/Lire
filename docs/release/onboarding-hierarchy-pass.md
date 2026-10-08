# Onboarding and product-hierarchy pass

8 October 2026. Branch `release/sorlio-production-hardening`.

Closed testers said onboarding needed work. Goal: a new learner is reading French within a minute; a returning learner sees the next action at once.

## Onboarding: before and after

| | Before | After |
|---|---|---|
| Screens before the first French | 3 | 2 |
| Taps before the first French | 4 at least | 3 |

**Before (3 screens, at least 4 taps):**

1. A level picker: four illustrated cards, "I already know my CEFR level", and an optional topics-and-daily-goal panel. Tap "Start first lesson".
2. A tour intro: "Take the 1-minute tour" (five steps) or "Skip, start reading".
3. Home: a Premium card above the journey, six level pills, header statistics. Tap "Start lesson".

**After (2 screens, 3 taps):**

1. "Learn French by reading it." → **Get started**.
2. "How comfortable are you reading French?" A2, B1 and B2 shown as plain descriptions ("I can follow everyday French", with "B1" secondary); **More levels** reveals A1, C1 and C2. Choosing a level enables **Start first reading**, which opens the reading the journey picks for that level: a short starter lesson of 1–3 min for A1–B2, shown in parts.

**Removed from first run:** topics (learned from reading), the daily goal (moved to after the first reading), the tour (replay-only), and Premium and accounts (never shown at first run).

**Progressive help:**
- **First reading:** the one-time "Tap any word…" coach mark. Reading options no longer open by themselves.
- **First save:** "Added to Review. We'll bring this word back later."
- **First completion:** "Review N saved words" when words were saved, and one skippable "Want a small daily target? 5 min / 10 min / Not now".

**Existing users:** the tour shows only after "Replay the tutorial" (`walkthroughReplay`). Learners who completed onboarding before, including those who never finished the old tour, go straight to Lessons, and the bottom nav shows as soon as a level is chosen. Guest/account partitions and adoption are untouched.

## Screen by screen

| Screen | Main problem | Change | Preserved | Visible complexity |
|---|---|---|---|---|
| Onboarding | Configuration and a tour before any French | 2 screens, one decision, straight into a reading | Every level; the tour as a replay | 3 screens / 4+ taps → 2 / 3 |
| Lessons | Premium card and about 15 header elements before the action | Greeting, then one hero (resume or next lesson: title, level, about N min, Start/Continue), then "B1 path · N of 10 · Change level" | Journey engine, maps, stage lists, level browsing (in a sheet), Premium (in You) | About 15 → 8 above the route |
| Journey | Equal-weight exception actions; duplicate Start | Stage card keeps its list; Start lives in the hero; Jump ahead under More options; goal line only once a goal is set | Skip, Jump ahead, capstone, pager | — |
| Reader | First open auto-expanded options and pushed the French down | Options closed by default; toolbar already Listen · English help · Reading options | All options, coach marks, meanings-first sheet | French in the upper half on a phone |
| Completion | About 9 stacked cards before the actions | Title, one line (+XP · words saved · streak), stage moment, the next lesson, "Review N saved words"; everything else under Session details | Diagnostics, stats, streak week, mini review, Sorlio Level, practice, rating | About 9 cards → 3 lines + actions |
| Review | "Practice hub", chips, "cards" | "N words ready · About N min · X new · Y due" and one Start review; "need care" in Stats; calm empty and caught-up states | Direction, phrases, session length, stats | 9 → 6 elements |
| News | About 13 elements per card, coloured chips, a star label | "B1 · 4 min · Good fit", title, one preview, source and date, Save, ••• | Topic, unfamiliar estimate, why, coverage, attribution, original link, More/Less, Prefer/Hide with Undo | About 13 → 6 |
| You | A 25-block settings page as the fourth tab | Your week (streak, readings, words reviewed, streak save), Library, Learn, Account; a gear for Settings | All destinations | About 25 → 10 |
| Settings | Mixed with the hub | /settings/preferences: level, theme, text size, English help, display and audio, support, account and sync, tour replay, privacy and legal, Advanced | Every existing control, unchanged | — |

## Tests

`scripts/test-first-run.mjs`, 41 checks:
- New user: proposition, descriptions, More levels; no topics, goal, account or Premium; a short first reading at each level; a radio group for levels.
- First reading: coach mark and first-save message.
- Completion: summary line, Session details, primary action, Review link, goal offer.
- Returning user: no tour replay, nav shown, Replay still works.
- Lessons: no Premium card, hero first, level sheet, More options.
- You: the four sections, links and gear.
- Review: count, time, Start, options, empty states.
- News: fit line, no stars, ••• actions with Undo.
- Reader: Listen and English help.

Updated: onboarding-walkthrough, fullscreen-layout (nav and empty state), learner-trust (onboarding copy).

**Final gate on `a297814`:** 52 suites, 10,590 checks, 0 failed; `tsc` 0; `eslint src scripts` 0; `npm audit --omit=dev` 0; `next build` passes.

**Manual flows (production build, 375×812):**
- **A:** Get started → B1 → Start first reading → tap "habite" → Add (confirmation shown) → finish → completion with a goal offer and "Review 1 saved word" → Review shows "1 word ready · About 1 min".
- **B:** returning learner, hero first.
- **C:** Review.
- **D:** News cards.
- **E:** You → gear → Settings → Back to You.

## Deferred

- **V1 typography:** monospace uppercase labels remain on screens this pass didn't restructure (the reader header, Progress, Words). Reducing them is low risk but touches many files.
- **V2 colour:** coloured category chips were removed from cards; the journey's level band tones are left as they are.
- **Real-device check:** TWA safe-area and TalkBack on the new screens still need checking on a device (manual action A01).
