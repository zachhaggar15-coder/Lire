# Google Play listing — Sorlio 1.1.0 (final copy, for approval)

Replaces docs/play-store-listing.md (written for the closed test, before the
Free/Premium model). Every claim below is checked against the build; keep it
that way when editing. **Not submitted.** Screenshots are a storyboard only:
capture them from the final signed build after UI sign-off, with synthetic
data (no real accounts or imported texts).

## App name (30)
Sorlio: Read French

## Short description (80)
Learn French by reading what you actually want to read. Tap any word.

## Full description (≤ 4000)

Learn French by reading what you actually want to read.

Sorlio gives you French to read at your level — short stories written for
learners, extracts from French classics, and French news from official public
sources — or your own texts, pasted in. Tap any word to see what it means in
that sentence. Save the words you want to keep and review them later.

FREE
• Read every Sorlio text: graded stories and classic literature (B1–C2)
• French news from French and EU public sources
• Import your own French text — kept on your device
• Listen to any text read aloud (your device's French voice)
• Tap any word for its meaning, with the built-in dictionary — works offline
• Save 5 new words a day, and review all your saved words without limit
• Grammar lessons and practice exercises
• Track your progress and reading streak
• No account needed. No ads. No tracking.

PREMIUM — £3.99 a month
• Save as many words as you like
• AI explanations of words and sentences in their context
• Natural AI translations of news and your imported texts
• AI-generated practice
Premium is a monthly subscription through Google Play that renews automatically
until you cancel. Cancel any time in Google Play; you keep Premium until the
end of the month you paid for. There is no free trial. A free Sorlio account
(Google sign-in) is needed for Premium so it works on all your devices.

PRIVATE BY DESIGN
Sorlio has no ads, no analytics and no tracking. Without an account,
everything stays on your device. With one, Sorlio keeps only your email and
your learning data so it syncs — not your name or photo. AI features send only
the text you ask about. Delete your account at any time from Settings.

For learners aged 13 and over. Sorlio's French content is reviewed by machine
checks.

## Claims checklist (must all hold on the submitted build)

- [ ] 5 new saves/day without Premium; unlimited review of saved words
- [ ] Every AI feature requires Premium (server-enforced)
- [ ] Literature levels shown are B1–C2 only (no A1/A2 literary extracts)
- [ ] News sources are the four listed official feeds (src/data/rssSources.ts)
- [ ] Listening uses the device's text-to-speech
- [ ] Offline: reading downloaded texts, dictionary lookups and review work offline
- [ ] Price, renewal and cancellation text matches the Play product (no trial)
- [ ] "No ads, no analytics, no tracking" matches docs/play-data-safety.md
- [ ] No "linguistically verified" / "teacher-approved" claim until signed off

## Screenshot storyboard (phone, portrait, 6 images)

1. **Reader** — a B1 story with one word tapped; meaning sheet open. Caption: "Tap any word. See what it means here."
2. **Choose what to read** — library with levels and News. Caption: "Stories, classics and news at your level."
3. **Import** — the import screen with a pasted paragraph. Caption: "Read your own French texts."
4. **Review** — a review card mid-session. Caption: "Review the words you saved."
5. **Grammar** — a lesson example and a practice question. Caption: "Grammar, explained with real sentences."
6. **Premium** — Free vs Premium comparison with price. Caption: "Free to read. Premium adds AI help." (Shows the real Play price.)

Feature graphic: wordmark + "Learn French by reading what you want to read." No
device frames with fake notifications; no "#1"/"best" superlatives.
