# Lire — French Reader (PWA)

**Live demo:** [liree.vercel.app](https://liree.vercel.app) — the source is
public on GitHub at
[zachhaggar15-coder/Lire](https://github.com/zachhaggar15-coder/Lire).

A mobile-first Progressive Web App for reading short French texts — built to
feel like a language-learning Kindle. The home page runs a **deterministic
recommendation engine** over a large pool of French-only, quality-filtered
RSS content (120+ feeds; see "RSS language and content-quality filtering"
below) and sections it into **Today's Recommendation, Good For You, Quick
Reads, Stretch Yourself, New Vocabulary, and Latest News** (see "Recommendation
engine" below) instead of a flat, random list. Tap unknown words for an
**instant, fully offline** dictionary lookup (474 curated + ~15,000 generated
entries), save the ones worth remembering, and come back later to **review
words that are actually due**, on a real spaced-repetition schedule. AI is
there for when you explicitly want more (see "AI explanations" below), never
automatically. Reading state lives in **localStorage** — no account, no
backend, works instantly.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS**
- **Local offline dictionary** (`src/lib/dictionary/`, `src/data/dictionaries/`)
  — the primary, instant word-lookup path; no network call, no API key
  needed. 474 hand-curated entries (examples, CEFR levels, conjugated
  forms) plus ~15,000 generated entries from WikDict/Wiktionary data for
  much broader coverage, plus a rule-based lemmatiser for unlisted
  inflections.
- **Spaced repetition** (`src/lib/spacedRepetition.ts`) — a simple due-date
  ladder (1/3/7/14/30 days) driving the Review page's queue.
- **Article difficulty estimation** (`src/lib/difficulty.ts`) — CEFR-ish
  scoring from word count, sentence length, and dictionary/known-word
  coverage, replacing a fixed "always B1" assumption for RSS texts.
- **AI explanations** (`src/lib/ai/`) — on-demand only, via OpenAI. Never
  called automatically; see "AI explanations" below.
- Server-side **RSS fetching** (`/api/rss-texts`) — no external RSS/XML
  package, just a small dependency-free parser. Builds a large candidate
  pool from 120+ feeds and deterministically returns 5 for the day.
- **localStorage** for saved words, known words, reading progress, daily
  activity/streak, completed-article history, and settings (Supabase
  planned for later)
- Deployable to **Vercel**

## Visual design system

A warm, paper-like palette replaces the earlier plain slate/blue theme —
same functionality everywhere, purely a visual pass. Defined as Tailwind
theme tokens in `tailwind.config.ts` so every component references a name,
not a raw hex:

| Token | Value | Used for |
| --- | --- | --- |
| `cream` | `#F4EEE0` | Page background |
| `cream-card` | `#FFFFFF` | Card surfaces |
| `cream-dark` | `#E8DFC9` | Neutral pills, dividers, skeleton loaders |
| `ink` | `#2B2A22` | Primary text |
| `ink-muted` | `#8C8570` | Secondary/tertiary text |
| `brand` / `brand-dark` / `brand-light` | `#2F5D46` / `#1F4534` / `#E3EEE7` | Primary actions, active states, the streak badge, "Continue reading" banner |
| `accent-pink` / `accent-pinktext` | `#F7DAD0` / `#B5563C` | The word-lookup sheet only, for visual distinction from the sentence sheet |

Cards are `rounded-3xl` with a soft shadow and no visible border (`shadow-sm`
does the separation, not a border line). Article cards
(`src/components/ReadingCard.tsx`) and saved-word cards
(`src/app/words/page.tsx`) each get a 4px colored left-border accent —
category-based for articles (rose/orange/violet/sky/emerald for news-style/
sport/culture/science/everyday life), cycled by row index for saved words,
matching the "colored shelf" look from the design reference. Pills (CEFR,
category, status, difficulty label) keep pastel Tailwind colors (`rose-100`,
`sky-100`, etc.) since they already read well against the cream background.

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

No API key or setup is required — word lookup is fully local. To enable
**"Ask AI for nuance" / "Ask AI to explain"**, copy `.env.local.example` to
`.env.local` and add an `OPENAI_API_KEY`. Without it, those buttons show
"AI is not configured. Add OPENAI_API_KEY to enable explanations." — the
rest of the app works exactly the same either way.

To test the phone experience, open your browser dev tools and toggle the device
toolbar (iPhone/Android), or visit the dev URL from your phone on the same
network (`http://<your-computer-ip>:3000`).

Production build:

```bash
npm run build
npm start
```

> The service worker (offline support / installability) only registers in a
> production build, so use `npm run build && npm start` to test **Add to Home
> Screen**.

## How the app works

Bottom navigation has four tabs: **Read**, **Words**, **Review**, **Settings**.
(**Reading history** is a fifth page, linked from the home page's Today card
rather than taking a nav slot — see "Daily habit loop" below.)

1. **Read (home)** — `src/app/page.tsx`
   Starts with a **Continue Reading banner** (if a text is mid-read),
   **Today card** (`src/components/TodayCard.tsx`, see "Daily habit loop"
   below), and **Goals card** (`src/components/ReadingGoalsCard.tsx`, see
   "Reading goals" below), then fetches a large candidate pool (`GET
   /api/rss-texts?limit=50`) and runs it through the **recommendation
   engine** (`src/lib/recommendation/`, see "Recommendation engine" below) to
   produce named sections: **Today's Recommendation**, **Good For You**,
   **Quick Reads**, **Stretch Yourself**, **New Vocabulary**, and **Latest
   News** — all reusing the same ranked pool, just filtered/re-sorted per
   section. Articles far above the reader's comfortable level are collapsed
   into a **Save for later** `<details>` instead of cluttering the main
   sections. Each card shows a title, an **estimated CEFR level and
   learner-facing difficulty label** (see "Article difficulty scoring"
   below), a **star rating** ("★★★★☆ Good challenge", see "Recommendation
   engine" below), category, estimated reading time, an unknown-word
   estimate, **source name + published date**, and a **reading-progress
   badge** (Unread / In progress / Completed). Shows a loading skeleton
   while fetching. If fewer than 5 RSS candidates come back, hardcoded texts
   from `src/data/texts.ts` top up the pool before scoring; if RSS fails
   entirely, the whole pool falls back to the hardcoded set, with a small
   notice either way — the reader is never shown fewer good articles than
   necessary, and never shown English or low-content articles just to fill
   a quota (those are rejected earlier, in the RSS pipeline itself).

2. **Reader** — `src/app/reader/[id]/page.tsx` + `src/components/Reader.tsx`
   Renders the chosen text with punctuation and paragraph spacing preserved,
   split into sentences and words.
   - **Tap a word** — an **instant, offline dictionary lookup** opens in a
     bottom sheet: translation(s), part of speech, gender, CEFR level, and a
     short **learner-friendly example sentence** (not the article's own
     wording — see "Example sentences vs. article context" below), or "Not in
     local dictionary yet" when the word (and the rule-based lemmatiser's
     guesses) match nothing. Nothing is saved automatically — instead the
     sheet offers three explicit actions:
     - **I know this** — adds the word (and its lemma) to a known-words list.
       No flashcard is created.
     - **Unsure** — saves it as a flashcard with status `"unsure"`.
     - **Save** — saves it as a flashcard with status `"learning"`. Works even
       when the dictionary had nothing — see "Missing dictionary entries"
       below.
     A **"Ask AI for nuance"** button calls OpenAI on request only — see "AI
     explanations" below.
   - **Tap a sentence** — a sheet shows the sentence and an **"Ask AI to
     explain"** button: a natural English translation, a simplified French
     rewording, grammar notes, useful vocabulary, and a short explanation.
     Nothing is fetched until the button is tapped.
   - Word highlighting is deliberately subtle: **learning** words get an
     amber background, **unsure** words a soft blue one, a saved word with no
     dictionary data gets a dashed underline on top of its color, and
     **known** words fade to muted gray text — each togglable in Settings.
   - **"Translate article later"** — replaces full-article translation. It's
     a small button that, when tapped, explains that full translation is
     intentionally disabled for now, in favor of reading French with word and
     sentence support rather than defaulting to English.
   - A small italic summary line under the title/meta row: *"This text looks
     like B1 (good level). Around 40% of words may be unfamiliar."* — the
     same estimator as the home page cards, computed once the text is on
     screen. See "Article difficulty scoring" below.
   - Opening a text marks it **in progress**; a **Mark as completed** button
     at the end of the article marks it done — which also records a snapshot
     into the reading-history archive (see "Daily habit loop") and counts
     toward today's activity/streak.
   - For RSS-sourced texts only: a discreet **"Original source"** link to the
     real article. Hardcoded texts don't have a source URL, so it doesn't
     render for them.
   - Includes a **Back** button.

3. **Words** — `src/app/words/page.tsx`
   Filterable list — **Learning**, **Unsure**, **Known**, **Missing entries**
   (saved words the dictionary had nothing for) — each showing the word,
   lemma, translation(s), part of speech, gender, CEFR, its **learner example
   sentence**, the **original article context** (labelled separately, in
   smaller text), source text, saved date, and review count. Delete any word,
   or promote it straight to **known** from here.

4. **Review** — `src/app/review/page.tsx`
   A real **spaced-repetition** queue (see "Spaced repetition" below), not a
   simple filterable list. A stats bar shows **Due today** / **New** / **Not
   due yet** / **Total** counts; the deck itself is every due-or-new
   learning/unsure word (known words are never quizzed), sorted by priority
   — overdue reviews before brand-new cards, most-overdue first, unsure
   before learning, least-reviewed, then most recently saved. Front: the
   French word (plus its lemma, if different). **Reveal meaning** shows the
   primary translation, other translations, part of speech, gender, the
   **learner example sentence** first, then the **original article context**
   underneath in smaller text. Three buttons: **Knew it** / **Didn't know
   it** (answers the card and reschedules it) and **Mark as known**
   (promotes the word to known and removes it from the queue on the spot,
   whether or not you've revealed it first).

5. **Settings** — `src/app/settings/page.tsx`
   - **Saved word highlights** on/off — the amber/blue coloring for
     learning/unsure words.
   - **Show known word styling** on/off — the muted gray for known words.
   - **Font size** — small / medium / large.
   - **English → French lookup** — a link to `/lookup` for the reverse
     lookup direction.
   - **Known words** — a count of everything you've marked known, with a
     **Clear** action to forget them all (they'll reappear for review).

### Spaced repetition

Review replaced a simple "cycle through every saved word" flow with a real
due-date schedule — `src/lib/spacedRepetition.ts`. Deliberately not full
SM-2 (no per-answer 0-5 quality rating): a fixed interval ladder driven by a
consecutive-correct streak, nudged by a light `ease` multiplier. Keep it
simple and robust was the goal, not academic completeness.

**Schedule** (days until next due, based on consecutive correct answers in a
row):

| Streak | Base interval |
| --- | --- |
| 1st correct | +1 day |
| 2nd correct | +3 days |
| 3rd correct | +7 days |
| 4th correct | +14 days |
| 5th+ correct | +30 days |

The actual interval is `round(base × ease)`. `ease` starts at 1, nudges
+0.15 per correct answer (capped at 2) and -0.2 per incorrect answer (floored
at 0.6) — so a word you consistently get right drifts to longer intervals
faster than the base ladder alone, and one you keep missing drifts shorter.
An incorrect answer also resets the correct-streak to 0 and makes the card
due again **immediately** (so it can resurface the same session).

**New fields on `SavedWord`** (all optional, with safe migration defaults —
see "Saved word format" below): `ease`, `nextReviewAt`, `correctCount`
(the consecutive-streak counter), `incorrectCount` (lifetime), and
`lastReviewResult`.

**Queue and stats** (`buildReviewQueue` / `getReviewStats`):
- A word is **due** if `nextReviewAt` is null (never scheduled) or in the
  past. Known words are never due.
- **New** = never reviewed (`reviewCount === 0`). **Due today** = reviewed
  before and currently due. **Not due yet** = reviewed before, scheduled for
  later. **Total** = every learning/unsure word, due or not.
- The queue is every due-or-new word, sorted: overdue reviews before
  brand-new cards (clear existing debt before adding more), most-overdue
  first, unsure before learning, least-reviewed first, most-recently-saved
  first. One sort pass, no per-card weighting beyond what the ladder and
  this ordering already capture.

### Article difficulty scoring

RSS texts used to be hardcoded at a flat "B1." `src/lib/difficulty.ts`
replaces that with a heuristic estimate — useful, not academically rigorous:

1. Tokenize the body (`src/lib/words.ts`) for word count and average
   sentence length.
2. Look up every **unique** word (`lookupWord` — the same offline dictionary
   the reader uses) and score it on a 1-6 CEFR-ish scale: the curated
   dictionary's real CEFR level when it has one, a fixed "solidly
   mid-frequency" estimate (3.5) for a generated-dictionary hit (which has
   no CEFR data), or a fixed "rare/advanced" estimate (5.5) for a word not
   in the dictionary at all.
3. Average that across all unique words, then nudge it for sentence length
   (longer average sentences push the score up, short ones pull it down
   slightly).
4. **Personalise once there's enough data**: with 5+ known words saved, the
   score is pulled down further for however much of the text's normally
   "tricky" vocabulary this specific reader already knows. Below that
   threshold, the estimate is purely dictionary/sentence-length based —
   this is the "graceful with zero known words" requirement: a brand-new
   reader gets a real, useful estimate on day one instead of a broken 100%
   "unfamiliar" reading.
5. Round to the nearest whole level (clamped A1-C1 — C2 isn't offered, since
   "this might be too advanced to bother estimating precisely" isn't a
   useful signal) and map the same underlying score to a learner-facing
   label: **Easy** / **Good level** / **Stretch** / **Hard**.

Common A1/A2 function words (articles, basic pronouns, etc.) never count
toward the "% of words may be unfamiliar" estimate, regardless of known-word
state — otherwise a brand-new reader would see a meaningless ~90-100% on
every single article.

**English-language sources are excluded.** Some of the 120+ RSS feeds are
English-language blogs about France (see "RSS reading content" below) —
running French-dictionary lookups against English text would score
literally every word "not found" and show a nonsensical "Hard, 95%
unfamiliar" on plain English prose. `ReadingCard` and `Reader` both check
`text.language !== "en"` before computing an estimate; English-sourced texts
just show the plain fallback (`text.difficulty`, unchanged) with no
CEFR/label chip or unfamiliar-word line.

### Recommendation engine

The home page used to show a flat, randomly-shuffled list of RSS articles.
`src/lib/recommendation/` replaces that with a deterministic, modular scoring
system — the goal is a home page that feels like a personalised Kindle "for
you" shelf, not a random RSS reader. Every function here is pure (same input,
same output, no side effects beyond the explicit interest-learning writes
described below), so the whole engine is easy to unit-test and re-tune without
touching any React component.

**Scoring** (`src/lib/recommendation/signals.ts` + `weights.ts` +
`score.ts`) — each article gets seven independent 0-1 signal scores, combined
into one weighted total (`SIGNAL_WEIGHTS` in `weights.ts`, easy to retune in
one place):
- **`freshnessScore`** — full marks under ~6h old, decaying to a floor by
  about 5 days; undated (hardcoded) texts score neutral.
- **`difficultyMatchScore`** — how close the article's CEFR level is to the
  reader's own inferred level (`inferUserLevelNumeric`, from known-word
  count).
- **`unknownWordTargetScore`** — how close the article's
  `DifficultyEstimate.unknownWordRatio` (`src/lib/difficulty.ts`) is to an
  "ideal challenge" band. **Important calibration note**: the recommendation
  spec's usual framing is "90-95% known / 5-10% unknown," which is a real
  reading-comprehension heuristic — but it assumes a *token-frequency
  weighted* coverage metric (common words like "le"/"de" counted every time
  they appear). This app's `unknownWordRatio` is deliberately simpler: the
  fraction of *unique* non-basic-CEFR words, which runs much higher for real
  news prose (lots of one-off proper nouns and specific vocabulary) —
  calibrated against real RSS content, typical French news articles land
  around 45-70% on this scale. `IDEAL_UNKNOWN_MIN`/`MAX` (currently 0.3/0.5)
  target that actual observed range, not the literal spec number, so the
  band still means something on this app's own difficulty scale.
- **`topicPreferenceScore`** — reuses the learned interest profile (see
  below).
- **`readingTimeScore`** — prefers a comfortable 1-4 minute read, tapering
  gently for longer ones rather than excluding them outright.
- **`contentQualityScore`** — directly reuses the RSS pipeline's own
  good/usable/poor verdict (see "RSS language and content-quality filtering"
  above) — poor-quality content should basically never be recommended, no
  matter how well it scores on other signals.
- **`varietyScore`** — a small penalty for topics read recently, so the
  ranked pool doesn't feel like a single-topic feed.

**Learning interests automatically, no onboarding** (`interests.ts`) —
`getInterestProfile()` / `recordArticleCompleted(category)` /
`recordArticleSkipped(category)` maintain a per-category score in
localStorage, nudged by implicit signals only: finishing an article boosts
its category, and `detectAndRecordSkippedArticles` (called once per home-page
load) penalises categories that were shown yesterday but never opened. No
explicit "pick your interests" step anywhere.

**Star rating** (`getStarRating`) — the same `unknownWordRatio` band, bucketed
into a learner-facing "★★★★★ Perfect for you" / "★★★★☆ Good challenge" /
"★★★☆☆ Challenging" / "★★☆☆☆ Too difficult" badge shown on every
`ReadingCard`. `SAVE_FOR_LATER_THRESHOLD` (0.7, matching `IDEAL_UNKNOWN_MAX`)
is the cutoff above which an article moves to the collapsed "Save for later"
section instead of a main one.

**Sections** (`sections.ts`) — `buildSections(ranked)` takes the one ranked
pool and derives every named section from it by filtering/re-sorting, never
re-scoring: **Today's Recommendation** (the single top-ranked "active"
article), **Good For You** (closest to the ideal difficulty band), **Quick
Reads** (≤3 minutes), **Stretch Yourself** (harder than the ideal band, but
still "active"), **New Vocabulary** (high unknown-word ratio *and* good
dictionary coverage, so the new words are genuinely look-up-able), **Latest
News** (freshest `news-style` articles), and **Save for later** (everything
above `SAVE_FOR_LATER_THRESHOLD`).

**Continue Reading banner** (`src/components/ContinueReadingBanner.tsx`) — a
prominent banner above the Today card if a text is currently `in-progress`
(via `getLastOpenedTextId`/`getProgress`), separate from (and more visible
than) the Today card's own single next-action slot.

**Where the logic lives**: `src/lib/recommendation/build.ts`
(`buildScorableArticles` — turns `ReadingText[]` + known words into
`ScorableArticle[]`), `context.ts` (`buildScoringContext` — gathers the
interest profile, recent categories, and inferred user level once per home
page load), `score.ts` (`scoreArticle`/`rankArticles`), and `types.ts` (every
shared shape). None of this logic lives in a React component — `page.tsx`
only calls `buildScorableArticles` → `buildScoringContext` → `rankArticles` →
`buildSections` and renders the result.

### Reading goals

`src/lib/goals.ts` + `src/components/ReadingGoalsCard.tsx` — optional,
self-set daily/weekly targets (minutes/day, articles/day, new words/week,
flashcard reviews/day), each individually on/off (`null` = off). Progress is
computed fresh from existing data (no new tracking store): minutes today from
archive entries' `estimateTimeSpentMinutes`, articles today from
`progress.ts`, new words this week from `storage.ts`, reviews today from
`spacedRepetition.ts`. Shown as progress bars on the home page, with a tap-to-
edit mode; if every goal is off, a single "Set a reading goal →" prompt shows
instead.

### Daily habit loop

A lightweight, localStorage-only (no Supabase yet) system to reinforce "read
something in French today":

- **`src/lib/habit.ts`** — a minimal daily activity log
  (`lire.activityDates.v1`): any of completing an article, saving a word, or
  answering a review call `recordActivityToday()`, which appends today's
  date if it isn't already recorded. `getCurrentStreak()` counts consecutive
  days backward from today (or from yesterday, if today has no activity
  *yet* — so the streak doesn't visually zero out the moment a new day
  starts before the reader has done anything).
- **`src/components/TodayCard.tsx`** — the home page's "Today" card: articles
  completed today, words saved today, reviews due right now, the current
  streak, and a single clear next action (`Continue reading` if a text is
  open but not finished, `Review due words` if anything's due, otherwise a
  quiet hint — nothing to click when there's nothing to do).
- **`src/lib/archive.ts`** + **`src/app/archive/page.tsx`** — a "Reading
  history" page (linked from the Today card and the home page) listing every
  completed article: title, source, CEFR at completion time, estimated
  **time spent** (`estimateTimeSpentMinutes` — the gap between `openedAt` and
  `completedAt`), completion status, and how many words were saved from it
  (joined against `SavedWord.sourceTextTitle` at display time). **Searchable**
  (by title or source) and **sortable** (date / time spent / words saved /
  difficulty) via a small client-side filter+sort, no new storage needed.
  Deliberately its own store (`lire.archive.v1`), separate from
  `src/lib/progress.ts`: RSS progress entries get pruned once an article
  rotates out of the daily selection (`pruneStaleRssProgress`), but the
  history should last, so completion is **snapshotted** (title, source,
  category, CEFR, minutes, openedAt) at the moment `markCompleted` fires
  rather than looked up later.

### RSS reading content: a big pool, a calm daily selection

The app pulls from **120+ RSS feeds** (`src/data/rssSources.ts`) — French
news outlets, English-language expat/travel/culture blogs about France, and
general publications' France-tagged sections — but a reader only ever sees
**5 articles a day**. The goal isn't to show more articles; it's a large,
resilient backend pool with a calm, predictable daily selection up front.

**Pipeline** (`GET /api/rss-texts`, `src/app/api/rss-texts/route.ts`):

1. **Build (or reuse) the candidate pool.** Fetch every `enabled` feed in
   `rssSources.ts` concurrently (each with an 8s timeout), parse the XML
   (`src/lib/rss/parseRss.ts` — handles RSS 2.0 `<item>` blocks and falls
   back to Atom `<entry>` blocks, which covers Blogger and most Feedburner
   feeds too), and pull up to **`maxItems` usable items per working feed**
   (per-source config, default 2 — see "Per-source config" below) into one
   big list. A feed that times out, 404s, or returns unparseable XML is
   simply skipped (`Promise.allSettled` + a per-source try/catch) — it
   never affects any other feed or breaks the route. If one item from a feed
   is rejected (see step 2), the pipeline just moves to the next item from
   that same feed rather than giving up on the source entirely.
2. **Clean, language-check, and quality-check each item**
   (`src/lib/rss/cleanContent.ts`, `src/lib/rss/language.ts`,
   `src/lib/rss/contentQuality.ts`) — see "RSS language and content-quality
   filtering" below for the full detail. In short: strip HTML/decode
   entities/remove boilerplate, reject anything that isn't recognisably
   French (title text can't rescue an English body), and reject anything
   too short, too truncated, or otherwise low-quality to be worth reading.
3. **Deduplicate** the pool by source URL and by title (case/whitespace
   -insensitive), so the same story picked up by two feeds only appears
   once.
4. **Cache the pool** in memory for 12 hours (`CANDIDATE_POOL_TTL_MS`) —
   the expensive part (120+ concurrent HTTP fetches) only happens once per
   TTL window, not once per page load.
5. **Deterministically select for today.** A seeded shuffle
   (`src/lib/rss/seededShuffle.ts`) keyed on today's date (`YYYY-MM-DD`,
   plus the active `language`/`category` filter, if any) reorders the
   candidate pool and the top `limit` are returned (the home page now
   requests a large pool — `limit=50` — for the recommendation engine to
   choose from, rather than a fixed 5; see "Recommendation engine" below).
   Critically, this **never uses `Math.random()`** — the same seed always
   produces the same order, so repeated requests on the same day return the
   exact same candidates; the date rolling over is what changes the
   selection, not a page refresh.

### RSS language and content-quality filtering

Two problems showed up in raw RSS content: some feeds are **English-language**
even though the app is for French reading, and many feeds — by design, to
protect their own pageviews — publish only a short teaser (sometimes just a
title-length snippet) in both `<description>` and `<content:encoded>`. Both
are filtered out before an item ever becomes a candidate.

- **`src/lib/rss/language.ts`** — `analyseLanguage(text)` scores French vs.
  English signal using French/English stopword frequency, French elisions/
  contractions (`l'`, `j'`, `qu'`, etc.), and accented characters — no ML
  model, no external API, fully offline and synchronous. `
  isAcceptableFrenchText(text)` rejects English-dominant text, text with a
  higher English than French score, and (for very short, ambiguous text)
  requires at least a minimum word count before giving the benefit of the
  doubt — deliberately **not** requiring accented characters, since plenty of
  genuine French sentences don't happen to use one. The RSS pipeline checks
  the cleaned body **and** the title+body combined, so an English body can't
  be rescued by a French-sounding title.
- **`src/lib/rss/contentQuality.ts`** — `analyseContentQuality(text,
  minWords)` rejects text that's too short (below a tunable, named
  `DEFAULT_MIN_WORDS` constant — currently 60, recalibrated down from an
  initial 120 after live-testing against real feeds like Numerama,
  Ouest-France, and DNA, whose `content:encoded` fields are genuinely only
  20-75-word teasers by design, not a bug), too few sentences, ending in a
  truncation marker (`…`, `[...]`, "read more", "lire la suite", "the post …
  appeared first on", etc.), or mostly boilerplate. `
  isAcceptableReadingContent(text, minWords)` is the pass/fail gate the
  pipeline calls.
- **`src/lib/rss/cleanContent.ts`** strips `<script>`/`<style>`/`<noscript>`/
  `<iframe>`/`<figcaption>`, decodes HTML entities, converts block-level tags
  to paragraph breaks (so `</div>`/`</p>` don't just vanish and glue two
  paragraphs together), and drops known boilerplate lines (cookie notices,
  "subscribe to our newsletter," share prompts) line-by-line rather than
  rejecting the whole item over one bad line.
- **`src/lib/rss/rssToReadingText.ts`** wires it together:
  `itemToRssReadingText` returns a discriminated union (`{ ok: true, text }`
  or `{ ok: false, rejection: { reason } }`) so a rejection is an explicit,
  typed outcome rather than a thrown exception or a silently-empty text. It
  picks whichever of `description`/`content:encoded` is longer as the
  candidate body, then runs quality-then-language checks against it (and
  language checks again against title+body combined).

**Per-source config** (`src/data/rssSources.ts`) — `RssSource` gained three
optional fields:
- `minWords?: number` — overrides `DEFAULT_MIN_WORDS` for one feed (e.g. a
  feed known to publish longer teasers than average can raise its bar).
- `maxItems?: number` — overrides the default 2-items-per-feed cap.
- `allowEnglishForTesting?: boolean` — the only way an `"en"`-language source
  is ever included; every English-language source in the default list is
  `enabled: false` unless this is explicitly set, since the app is for
  French reading.

**Dev-only rejection logging** — in development, every rejected item logs a
one-line reason (source name, title snippet, rejection reason) to the server
console, e.g. `[rss] rejected "Le Monde" — "Some Title...": content quality:
too short (42 words, need 60)`. Nothing is logged in production.

**Testing** — `scripts/test-rss-filters.mjs` is a small, dependency-free
Node script (run with `node scripts/test-rss-filters.mjs`) that imports
`language.ts` and `contentQuality.ts` directly (Node's built-in TypeScript
stripping — no test framework, no build step) and asserts against six
fixture texts: clean French, clean English, mixed-language, too-short,
truncated, and boilerplate-heavy. All assertions pass today.

**Query parameters** (structured for future UI controls; the home page uses
`?limit=50`, everything else defaults):
- `?limit=50` — how many texts to return (default 5, max 50).
- `?language=fr` — filter the candidate pool to one `RssSource.language`
  (`fr` / `en` / `mixed`) before selecting. Default: no filter.
- `?category=culture` — filter to one `Category` before selecting. Default:
  no filter.
- `?refresh=true` — bypass the in-memory pool cache and re-fetch every feed
  immediately. Since feeds are live, a forced refresh can change the
  candidate pool itself (new posts appear), so it isn't guaranteed to
  reproduce the exact same candidates as a non-refreshed request the same
  day — the "same pool all day" guarantee applies to normal (non-refresh)
  requests, which reuse the cached pool.

**Failure handling** — required and tested against real feeds:
- **Some feeds down:** never breaks the route. A real run against all 122
  sources typically sees 115+ succeed and a handful fail (dead domains,
  timeouts, feeds that redirect through bot protection) — the candidate
  pool is still substantial either way.
- **All feeds down:** the route returns `{ texts: [] }`; the home page
  detects the empty result (or a fetch/network error) and falls back to the
  fully hardcoded pool, with a small "Couldn't load today's articles" notice.
- **Below `MIN_POOL_SIZE` (5) valid RSS candidates:** the home page tops up
  the pool with hardcoded texts before scoring, with a small notice, rather
  than ever handing the recommendation engine too few real options — or
  showing English/low-quality articles just to hit a target count, which the
  RSS pipeline itself already rules out (see "RSS language and
  content-quality filtering" above).

**In development only**, the response includes a `debug` object (feeds
succeeded/failed, candidate pool size, when the pool was built, the
selection seed, and the selected ids) — the home page renders it in a
collapsed `<details>` panel, gated on `process.env.NODE_ENV`. It's absent
in production responses entirely, not just hidden in the UI.

**Where to add/remove feeds** — edit `src/data/rssSources.ts`. Each entry is
`{ id, name, category, feedUrl, language, enabled }`; set `enabled: false` to
turn a feed off without deleting it, or add a new entry with a fresh `id`.
`category` reuses the app's fixed `Category` union (not a bare string) so
every RSS card stays compatible with `ReadingCard`'s styling — pick whichever
of `news-style` / `sport` / `culture` / `science` / `everyday life` fits best
(the actual per-article category can still be refined from the feed's own
`<category>` tags, see `mapToKnownCategory` in `rssToReadingText.ts`).
`language` is `"fr"` (French-language), `"en"` (English-language, typically
about France), or `"mixed"` (uncertain/varies by post) — it's carried onto
every `RssReadingText`/`ReadingText` produced from that feed and is what
`?language=` filters on; nothing in the reading flow enforces it yet (the
reader doesn't check it), it's metadata for future filtering.

**Why full-article scraping is intentionally avoided** — the task is to
extract only what a feed publishes directly (title, link, date, summary,
and, when present, richer inline content like `content:encoded`). Scraping
the linked webpage would mean an extra network hop per article, fragile
per-site HTML parsing that breaks whenever a site redesigns, and a real risk
of violating each outlet's terms of use. RSS feeds are meant to be consumed
this way; the tradeoff is that texts are limited to whatever length the
publisher includes in the feed (usually a summary, occasionally more).

**Where RSS texts live client-side** — `src/lib/rss/rssTextCache.ts` caches
the mapped texts in `sessionStorage` right after a successful home-page fetch.
RSS ids aren't known at build time (unlike the hardcoded texts, which are
prerendered via `generateStaticParams`), so `/reader/[id]` looks the id up in
this session cache when it isn't one of the hardcoded ids. If you open an RSS
article's URL directly in a new tab (no session cache yet), the reader shows
a friendly "not available anymore" message instead of a crash — a known
limit of having no backend to persist arbitrary article ids.

### Local dictionary

Word lookup is **instant and offline** — the whole point of the "Kindle-like"
goal. There is no loading state for a word tap because there is no network
call: everything comes from a plain TS data file loaded into memory.

**Architecture**, deliberately generic so a bigger downloaded/imported
dictionary can slot in later without touching any calling code:
- `src/lib/dictionary/types.ts` — `DictionaryEntry` (`lemma`, `forms?`,
  `translations`, `partOfSpeech?`, `gender?`, `frequencyRank?`, `cefr?`,
  `examples?`, `notes?`) and `DictionaryLookupResult`, the fixed shape every
  lookup returns regardless of hit or miss.
- `src/data/dictionaries/fr-en.ts` — the active French→English dictionary:
  hand-curated, 474 entries covering every function word (articles, subject/
  object pronouns, prepositions, conjunctions/connectors), all vocabulary in
  `src/data/texts.ts`'s five hardcoded articles, numbers, calendar, family,
  colors, ~65 conjugated verbs (with fuller person/tense coverage for the
  most common ones — être, avoir, aller, faire, pouvoir, vouloir, devoir,
  prendre, dire, penser, trouver), common adjectives/adverbs, and everyday
  news vocabulary (gouvernement, président, économie, crise, société, etc.).
  Every entry added or edited in this pass carries a short, simple example
  sentence — see "Example sentences vs. article context" below.
- `src/data/dictionaries/generated/fr-en-generated.ts` (+`.json`) — ~15,000
  additional entries generated from real dictionary data (WikDict/
  Wiktionary), used only as a fallback for words the curated dictionary
  doesn't have. See "The generated dictionary" below for source, license,
  and how to regenerate it.
- `src/data/dictionaries/en-fr.ts` — a modest English→French starter set,
  used by the reverse lookup at `/lookup` via `lookupEnglishWord`.
- `src/lib/dictionary/lookup.ts` — `lookupWord(word)`, the only function the
  reading flow calls (plus `lookupEnglishWord(word)` for the reverse
  direction). It builds `Map`s once at module load (lemma → entry, and every
  inflected/elided form → entry, for *each* dictionary layer) and never
  touches the network.
- `src/lib/dictionary/lemmatize.ts` — `guessLemmas(word)`, a rule-based
  suffix→replacement table (e.g. strip `-aient`/`-ions`/`-ez` and try `-er`/
  `-re` endings) used as a fallback when a word isn't an exact lemma or a
  listed form. Candidates are only ever used if they match a real dictionary
  lemma, so a wrong guess is harmless.

**Lookup order**: clean the word, then check, in order — (1) curated exact
lemma, (2) curated inflected/elided forms (conjugations, plurals, elided
articles like `l'idée`/`jusqu'au`), (3) generated exact lemma, (4) generated
forms (rare — the generated dictionary mostly doesn't have these), (5) each
of `guessLemmas`'s candidate lemmas against *both* layers. If nothing
matches, return `{ source: "missing", translations: [], ... }` — **never**
falling back to AI automatically.

**Adding curated dictionary entries** — edit `src/data/dictionaries/fr-en.ts`
and add an object matching `DictionaryEntry`. Only `lemma` and `translations`
are required; everything else (`forms`, `gender`, `cefr`, `examples`,
`notes`) is optional and improves what the word sheet shows — but a short
`examples` entry is strongly encouraged (see below). No other file needs to
change — `lookup.ts` re-indexes whatever is in the array. The curated
dictionary always wins over the generated one for the same lemma, so there's
no need to remove anything from the generated set when you add a word here
by hand — the next `node scripts/build-dictionary.mjs` run will skip it
automatically.

### The generated dictionary

The hand-curated dictionary alone (474 entries) wasn't broad enough for real
RSS articles — the single biggest gap identified in this app. Rather than
call an API for lookup (which would break "instant, fully offline"), the fix
is a much bigger dictionary, generated once and committed as a static asset.

**Source & license** — full details in
`src/data/dictionaries/generated/NOTICE.md`, summarized here: data comes from
[WikDict](https://www.wikdict.com)'s French→English SQLite export (itself
built from [Wiktionary](https://www.wiktionary.org/) via
[DBnary](http://kaiko.getalp.org/about-dbnary/)), licensed **CC BY-SA 4.0**.
That license applies to the *data file* specifically, not to this
repository's application code — see NOTICE.md for exactly what that means
for attribution and redistribution.

**Pipeline** (`scripts/build-dictionary.mjs`):
1. Downloads `fr-en.sqlite3` (~22MB) into `.cache/` (gitignored) if it isn't
   there already — uses Node's built-in `node:sqlite` module, no extra
   dependency.
2. Filters out proper nouns/surnames/first names (not useful reading
   vocabulary), entries with leftover wiki-markup, and anything that isn't a
   clean word or short phrase.
3. Merges multiple senses of the same written form into one entry, capping
   translations at 6 to avoid noisy walls of text in the UI.
4. Skips any lemma already in the curated dictionary (that one always wins
   the lookup anyway — no point shipping it twice).
5. Ranks by WikDict's own per-entry "importance" score and keeps the top
   ~15,000, writing them to `fr-en-generated.json` (JSON, not a `.ts` array
   literal — keeps `tsc` fast and the diff reviewable at this size).

**Why not lazy-load it in chunks?** The task explicitly allows a "split by
first letter, lazy-load" compromise for a dictionary this size — but
`Reader.tsx` calls `lookupWord` synchronously on every rendered word (for
highlighting), not just on tap, so introducing async loading would ripple
through that render path. Trimming to the ~15,000 highest-value entries
(~330KB gzipped) keeps the whole thing eager and synchronous, matching the
existing architecture, while still being a large real improvement over 474
entries. Revisit chunked loading only if the dictionary grows much larger
than this.

**Regenerating**: `node scripts/build-dictionary.mjs` — safe to re-run any
time (e.g. after expanding the curated dictionary, so newly-curated lemmas
get excluded from the generated set too, or when WikDict publishes a fresher
build). Like `scripts/generate-icons.mjs`, this script is **not** part of
`npm run build` — its output is a committed, versioned asset, regenerated
manually.

### Example sentences vs. article context

Every saved word now stores **two separate sentences**, so a flashcard's
"example" is always a clean, simple sentence rather than whatever dense news
prose the word happened to appear in:

- **`exampleSentenceFr` / `exampleSentenceEn`** — a short, natural,
  A1/B1-appropriate sentence, e.g. `"Je mange une pomme."` / `"I eat an
  apple."`. Sourced from the dictionary entry's first `examples[]` item; if
  the entry has none (true for essentially all ~15,000 generated-dictionary
  entries, which carry no `examples[]`), `src/lib/dictionary/exampleGenerator.ts`
  builds a real, word-specific sentence by part of speech instead of a fixed
  generic placeholder: `J'aime {verb}.` for verbs, `Je vois un/une {noun}.`
  for nouns (guessing the article from real gender data when known, or a
  common-feminine-ending heuristic like `-tion`/`-té` when it isn't), `C'est
  très {adjective}.` for adjectives, and `On utilise « {word} » dans cette
  phrase.` for everything else (pronouns, prepositions, conjunctions, etc.,
  or a saved word with literally no dictionary data at all). The matching
  English sentence reuses the same template with the dictionary's first
  translation. Legacy saved words (from before this field existed, or from
  the earliest plain-string save format) get the same treatment on
  migration — `storage.ts` re-looks the word up in the dictionary so even a
  years-old saved word gets a real, word-specific example instead of the old
  one-size-fits-all fallback.
- **`articleContextSentence`** — the actual sentence from the article the
  word was tapped in, kept for reference but shown secondarily (smaller
  text, labelled "Original article context") on the Words and Review pages.

This split exists because a word's context sentence in a real news article
is often long and grammatically complex — not a great thing to see first on
a flashcard. The word sheet, Words page, and Review page all show the simple
example first and the article sentence underneath.

### Missing dictionary entries

Not every word a reader taps — especially proper nouns, rare vocabulary, or
inflections the lemmatiser can't guess — is in the local dictionary. The word
sheet still lets you act on it:

- Shows **"Not in local dictionary yet"** instead of a translation.
- **"Ask AI for nuance"** still works (AI doesn't need a local entry to
  explain a word — see "AI explanations" below).
- **Save** / **Unsure** still work. The resulting `SavedWord` gets
  `primaryTranslation: "Not translated yet"`, `missingFromDictionary: true`,
  and the fallback example sentence — so it shows up under the Words page's
  **"Missing entries"** filter, ready to be filled in by hand or explained
  by AI later.

### Known / unsure / learning word statuses

Tapping a word never auto-saves it anymore — the bottom sheet asks you to
choose, which is a much better learning signal than saving every tap:

| Action | Result |
| --- | --- |
| **I know this** | Added to the known-words list (`src/lib/knownWords.ts`). No flashcard is created. |
| **Unsure** | Saved as a flashcard with `status: "unsure"`. |
| **Save** | Saved as a flashcard with `status: "learning"`. |

`src/lib/knownWords.ts` is a small, separate localStorage list
(`getKnownWords`, `markKnown`, `isKnown`, `removeKnown`, `clearKnownWords`) —
deliberately not part of `SavedWord`, since "I know this" is meant to be
lighter-weight than saving a flashcard. A word's **lemma** is marked known
alongside the tapped form, so recognising one conjugated form as known also
covers its other forms the next time they're tapped.

A saved word can *also* become known later, via Review's **Mark as known**:
that flips the `SavedWord.status` to `"known"` (keeping it as a visible
record on the Words page) **and** adds it to the known-words list, so
reader highlighting and future lookups only need to check one source of
truth (`isKnown`).

### AI explanations (on demand only)

The reading flow **never** calls AI automatically — not on page load, not on
a word tap, not on a sentence tap. AI only ever runs when a reader explicitly
taps **"Ask AI for nuance"** (word sheet) or **"Ask AI to explain"** (sentence
sheet).

**Architecture**:
- `src/lib/ai/openai.ts` — `explainWord(req)` / `explainSentence(req)`, plain
  `fetch` calls to OpenAI's Chat Completions API in JSON mode (no SDK).
  Throws `AiNotConfiguredError` if `OPENAI_API_KEY` isn't set.
- `src/lib/ai/types.ts` — `WordExplanationRequest`/`WordExplanation` and
  `SentenceExplanationRequest`/`SentenceExplanation`, the fixed shapes for
  each direction.
- `src/app/api/ai/explain-word/route.ts` and
  `src/app/api/ai/explain-sentence/route.ts` — the only two AI-backed
  routes. Validate the request body, call the corresponding `openai.ts`
  function, and translate `AiNotConfiguredError` into a `503` with a
  friendly message rather than a raw error.
- `src/lib/ai/client.ts` — `getWordExplanation` / `getSentenceExplanation`,
  called from `WordSheet.tsx` / `SentenceSheet.tsx`. Cache-first: every
  successful response is cached in `localStorage` (`src/lib/ai/cache.ts`)
  under a stable key derived from the word + its article sentence (or just
  the sentence, for sentence explanations), so re-opening the same word in
  the same context never re-calls OpenAI.

**Word explanation** sends the word, its lemma (if the dictionary resolved
one), the article sentence, the dictionary's simple example sentence (if
any), the previous sentence, and a fixed learner level ("A2/B1 French
learner"). Returns translation, part of speech, a context-specific meaning,
a fresh simple example (French + English), a grammar/usage note, and an
optional common-mistake warning.

**Sentence explanation** sends the sentence, the article title, and the
previous/next sentence. Returns a natural English translation, a simplified
French rewording, 1–3 grammar notes, a short list of useful vocabulary
(word + meaning), and a 2–4 sentence explanation.

**Cost control**:
- AI is never triggered by rendering a page or opening a sheet — only by
  tapping the AI button itself.
- The button shows a loading state and is effectively single-shot per tap
  (no debounce needed — there's nothing to debounce since it only fires on
  click).
- Every successful result is cached in `localStorage`; a cache hit costs
  nothing and never re-calls the API.

**Failure handling**: if `OPENAI_API_KEY` is missing, the button shows *"AI
is not configured. Add OPENAI_API_KEY to enable explanations."* with a "Try
again" link (which will keep failing the same way until the key is set — no
crash either way). Any other failure (network error, malformed OpenAI
response, rate limit) shows a generic *"Couldn't get an AI answer"* message,
also with "Try again." Local dictionary lookup, saving, and reviewing all
keep working regardless of whether AI is configured or reachable.

**Why AI is on-demand only**: the goal here is a fast, uninterrupted reading
flow — instant local lookup for the common case, with deeper (slower,
costlier, network-dependent) AI help available only when a reader explicitly
asks for it. Calling AI on every tap would add latency to the most frequent
interaction in the app and turn a lightweight reading habit into something
that depends on an API key and an internet connection.

### Saved word format

Saved words are stored as objects under the localStorage key
`lire.savedWords.v1`:

```ts
type WordStatus = "learning" | "unsure" | "known";

interface SavedWord {
  word: string;                 // clean lowercase key (unique)
  lemma: string | null;         // dictionary/citation form, if resolved
  translations: string[];       // every translation the dictionary had
  primaryTranslation: string;   // translations[0], or "Not translated yet"
  partOfSpeech: string | null;
  gender: string | null;
  cefr: string | null;
  frequencyRank: number | null;
  articleContextSentence: string; // full sentence the word was tapped in
  exampleSentenceFr: string;      // simple learner example (dictionary or fallback)
  exampleSentenceEn: string;      // English translation of exampleSentenceFr
  sourceTextTitle: string;        // title of the source text
  savedAt: string;                // ISO timestamp
  reviewCount: number;
  lastReviewedAt: string | null;
  status: WordStatus;
  missingFromDictionary?: boolean; // true if saved with no dictionary entry
  // Spaced-repetition fields — see "Spaced repetition" above. Optional so
  // older saved words still type-check; storage.ts fills in defaults on read.
  ease?: number;                      // interval multiplier, 1 = neutral
  nextReviewAt?: string | null;       // ISO timestamp; null = due now
  correctCount?: number;              // consecutive-correct streak
  incorrectCount?: number;            // lifetime "Didn't know it" count
  lastReviewResult?: "correct" | "incorrect" | null;
}
```

`src/lib/storage.ts` transparently **migrates** older data on read — plain
strings, the AI-era shape (a single `translation` string, no `status`), the
pre-example-split shape (`contextSentence`, no example-sentence split), the
pre-spaced-repetition shape (missing the `ease`/`nextReviewAt`/etc. fields),
and the current shape are all normalised to the structure above and written
back. Migrated words default to `status: "learning"`, the fallback example
sentence if they predate that field, and neutral spaced-repetition defaults
(`ease: 1`, `nextReviewAt: null`, counts at 0) if they predate those —
which also means an old saved word is treated as **due right now** the
first time Review sees it post-migration, which is the correct behaviour
(it's never been scheduled).

### Reading progress, habit, and archive storage

- `src/lib/progress.ts` — per-text status (`unread` / `in-progress` /
  `completed`) under `lire.progress.v1`, plus the id of the most recently
  opened text (`lire.progress.lastOpened`) used by the Today card's
  "Continue reading" action.
- `src/lib/habit.ts` — the daily activity-date log under
  `lire.activityDates.v1`, the basis for the Today card's streak.
- `src/lib/archive.ts` — completed-article history (title/source/date
  snapshot) under `lire.archive.v1`, shown on `/archive`.
- `src/lib/settings.ts` — display preferences under `lire.settings.v1`
  (`showSavedHighlights`, `showKnownWordStyling`, `fontSize`).
- `src/lib/knownWords.ts` — the known-words list under `lire.knownWords.v1`.

### Key modules

| File | Responsibility |
| --- | --- |
| `src/data/texts.ts` | Hardcoded French texts + `getTextById` |
| `src/lib/words.ts` | `cleanWord`, `tokenize`, `tokenizeParagraphsToSentences`, `splitSentences` |
| `src/lib/hash.ts` | Shared FNV-1a `hashString` (RSS ids, dormant AI cache keys) |
| `src/lib/dictionary/types.ts` | `DictionaryEntry`, `DictionaryLookupResult` — the generic entry/result shapes |
| `src/lib/dictionary/lookup.ts` | `lookupWord` / `lookupEnglishWord` — the offline lookup functions the app calls |
| `src/lib/dictionary/lemmatize.ts` | `guessLemmas` — rule-based fallback lemmatiser for unlisted inflections |
| `src/lib/dictionary/constants.ts` | `NO_DICTIONARY_ENTRY` (live popup), `NOT_TRANSLATED_YET` (saved-word placeholder), last-resort fallback example sentence |
| `src/lib/dictionary/exampleGenerator.ts` | `generateFallbackExample` — part-of-speech template sentences used when a dictionary entry has no `examples[]` |
| `src/data/dictionaries/fr-en.ts` | The curated French→English dictionary (474 entries) — add entries here |
| `src/data/dictionaries/generated/fr-en-generated.ts` (+`.json`) | ~15,000 generated fallback entries — see NOTICE.md and `scripts/build-dictionary.mjs` |
| `src/data/dictionaries/en-fr.ts` | The English→French dictionary backing `/lookup` |
| `src/lib/knownWords.ts` | Known-words list: `getKnownWords`, `markKnown`, `isKnown`, `removeKnown`, `clearKnownWords` |
| `src/lib/storage.ts` | Saved words: `getSavedWords`, `saveWord`, `markWordAsKnown`, `recordReviewResult`, `deleteWord`, `clearWords`, migration |
| `src/lib/spacedRepetition.ts` | `computeNextSchedule`, `isDue`, `buildReviewQueue`, `getReviewStats` — the Review page's due-date system |
| `src/lib/difficulty.ts` | `estimateDifficulty` — CEFR/label estimate for a text, optionally personalised by known words |
| `src/lib/habit.ts` | `recordActivityToday`, `getCurrentStreak` — the daily activity log behind the Today card's streak |
| `src/lib/archive.ts` | `recordArchiveEntry`, `getArchive`, `estimateTimeSpentMinutes` — completed-article history for `/archive` |
| `src/lib/progress.ts` | Reading progress: `getProgress`, `markOpened`, `markCompleted`, `getLastOpenedTextId` |
| `src/lib/goals.ts` | Reading goals: `getGoals`, `saveGoals`, `getGoalsProgress`, `DEFAULT_GOALS` |
| `src/lib/rss/language.ts` | `analyseLanguage`, `isAcceptableFrenchText` — offline French/English language detection |
| `src/lib/rss/contentQuality.ts` | `analyseContentQuality`, `isAcceptableReadingContent`, `DEFAULT_MIN_WORDS` — content-quality gating |
| `src/lib/recommendation/signals.ts` | Individual 0-1 scoring signals (freshness, difficulty match, unknown-word target, topic preference, reading time, content quality, variety), `getStarRating` |
| `src/lib/recommendation/weights.ts` | `SIGNAL_WEIGHTS` — the one place to retune the scoring engine |
| `src/lib/recommendation/score.ts` | `scoreArticle`, `rankArticles` |
| `src/lib/recommendation/sections.ts` | `buildSections` — splits one ranked pool into the home page's named sections |
| `src/lib/recommendation/interests.ts` | `getInterestProfile`, `recordArticleCompleted`, `recordArticleSkipped`, `detectAndRecordSkippedArticles` — automatic interest learning |
| `src/lib/recommendation/build.ts`, `context.ts` | `buildScorableArticles`, `buildScoringContext` — glue between `ReadingText[]` and the scoring engine |
| `src/lib/settings.ts` | App settings: `getSettings`, `saveSettings`, `DEFAULT_SETTINGS` |
| `src/lib/format.ts` | Shared `formatDate` helper used by ReadingCard and the Words page |
| `src/lib/ai/openai.ts` | `explainWord`, `explainSentence` — OpenAI calls, on-demand only |
| `src/lib/ai/client.ts` | `getWordExplanation`, `getSentenceExplanation` — cache-first client wrappers |
| `src/lib/ai/cache.ts` | localStorage `CacheStore` + stable cache-key helpers |
| `src/app/api/ai/explain-word/route.ts`, `.../explain-sentence/route.ts` | The two AI-backed routes — see "AI explanations" |
| `src/data/rssSources.ts` | The 120+ configured RSS feeds — add/remove/disable feeds here |
| `src/lib/rss/parseRss.ts` | Dependency-free RSS/Atom XML parsing (`parseRssFeed`) |
| `src/lib/rss/cleanContent.ts` | HTML stripping, entity decoding, length/boilerplate/template-syntax checks |
| `src/lib/rss/seededShuffle.ts` | `seededShuffle`, `todayKey` — the deterministic date-seeded daily selection |
| `src/lib/rss/rssToReadingText.ts` | Converts one RSS item into the API's `RssReadingText` shape (server-only) |
| `src/lib/rss/adaptReadingText.ts` | Maps `RssReadingText` → the app's `ReadingText` (client-safe) |
| `src/lib/rss/rssTextCache.ts` | `sessionStorage` cache so the reader can look up RSS texts by id |
| `src/lib/rss/rssTextStore.ts` | Optional Upstash Redis persistence so RSS texts survive a new tab/restart |
| `src/app/api/rss-texts/route.ts` | `GET /api/rss-texts` — builds/caches the candidate pool, returns 5 deterministic daily texts by default |
| `src/app/api/rss-texts/[id]/route.ts` | `GET /api/rss-texts/[id]` — fallback lookup for one persisted RSS text |
| `src/types.ts` | Shared types: `ReadingText`, `SavedWord`, `WordStatus`, `TextProgress`, `AppSettings` |
| `src/components/*` | `BottomNav`, `ReadingCard`, `Reader`, `WordSheet`, `SentenceSheet`, `TodayCard`, `Toast`, `ServiceWorker` |

## PWA

- `public/manifest.json` — name, theme color, standalone display, and a full
  icon set: `icon.svg`, `icon-192.png`, `icon-512.png`, and a maskable
  `icon-maskable-512.png` (safe-zone padded per the maskable icon spec).
- `scripts/generate-icons.mjs` — regenerates the PNGs from
  `public/icon.svg` / `public/icon-maskable-source.svg` via `sharp`
  (`node scripts/generate-icons.mjs`).
- `public/sw.js` — minimal network-first service worker for offline/installability.
- Apple web-app meta tags + viewport are set in `src/app/layout.tsx` for a good
  Add-to-Home-Screen experience (`apple-touch-icon` uses `icon-192.png`,
  since iOS doesn't support SVG there).

## Deploying to Vercel

The project deploys as a normal Next.js app — connect the GitHub repo and
Vercel builds it automatically. Two gotchas hit during setup, worth knowing
if you ever re-import this repo as a fresh project:

- **Framework detection can silently fail.** If a Vercel project's
  "Framework Preset" setting is unset (`null`), Vercel has been observed
  falling back to a generic static-file build (`@vercel/static-build`)
  instead of the Next.js builder — the build "succeeds" but produces no
  serverless functions at all, so *every* route 404s in production. Fixed
  for good by declaring `"framework": "nextjs"` directly in `vercel.json`
  (see that file), so it no longer depends on a dashboard setting.
- **Vercel Authentication (SSO deployment protection)**, if enabled with
  `all_except_custom_domains`, gates the default `*.vercel.app` production
  alias too (it isn't treated as a "custom domain"). Disable it under
  Project Settings → Deployment Protection if you want the app publicly
  viewable without a Vercel login — `vercel project protection disable
  <project> --sso` does the same from the CLI.

If you fork/re-import this repo, run `vercel project ls` and `vercel project
protection <name>` to sanity-check both after the first deploy.

## A hydration gotcha worth knowing

`Reader`'s settings state must start as `DEFAULT_SETTINGS` (not
`getSettings()`) in `useState`. Reading localStorage directly in the
initializer makes the very first **client** render diverge from the
server-rendered HTML (which has no access to localStorage), triggering a React
hydration mismatch. Once that happens, React does not patch the mismatched
attribute on that node even after later state updates — the UI gets stuck
showing the server's default value. The fix is the standard SSR pattern: match
the server on first render, then swap in the real, localStorage-backed value
inside `useEffect` (a normal post-hydration update, which applies cleanly).

## What changed in this iteration

- **Fixed the generic fallback example sentence** — every dictionary entry
  without its own `examples[]` (nearly all ~15,000 generated entries) used to
  fall back to the same fixed, word-agnostic `"Je vois ce mot dans un texte."
  / "I see this word in a text."`, regardless of what word was actually
  tapped. `src/lib/dictionary/exampleGenerator.ts` replaces it with a
  part-of-speech template generator (verb/noun/adjective/other, with a
  gender-aware article for nouns) that always names the real word, wired
  into both the live save flow (`Reader.tsx`) and `storage.ts`'s migration
  path (including legacy plain-string saves, which get re-looked-up in the
  dictionary first). See "Example sentences vs. article context" above.
- **RSS language and content-quality filtering**: two new pure, offline
  modules — `src/lib/rss/language.ts` (French/English stopword-based
  detection) and `src/lib/rss/contentQuality.ts` (word/sentence-count and
  truncation/boilerplate detection) — reject English-language and
  too-short/low-quality RSS items before they ever become candidates. All
  ~80 English-language sources in `rssSources.ts` were disabled by default
  (opt back in per-source via `allowEnglishForTesting`); each source can also
  tune `minWords`/`maxItems`. `cleanContent.ts` gained boilerplate-line
  stripping and safer paragraph handling. `scripts/test-rss-filters.mjs`
  covers both modules with six fixture cases. See "RSS language and
  content-quality filtering" above.
- **A deterministic recommendation engine replaces random RSS ordering** —
  `src/lib/recommendation/` scores every candidate on seven independent
  signals (freshness, difficulty match, unknown-word target, learned topic
  preference, reading time, content quality, variety), combines them with
  tunable weights, and sections the ranked pool into **Today's
  Recommendation, Good For You, Quick Reads, Stretch Yourself, New
  Vocabulary, and Latest News** — all reused from one ranked pool, no
  duplicate scoring, no scoring logic in any React component. Topic
  interests are learned automatically from completion/skip behavior, with no
  onboarding step. See "Recommendation engine" above.
- **Reading goals** (`src/lib/goals.ts` + `ReadingGoalsCard.tsx`) — optional
  minutes/day, articles/day, new-words/week, and flashcards/day targets with
  home-page progress bars, computed from existing data.
- **Continue Reading banner** — a prominent home-page banner for a
  mid-progress article, replacing the old "Continue reading" action that
  lived inside the Today card.
- **Reading History page rebuilt** — `/archive` now shows time spent, CEFR,
  completion status, and word count per entry, with search and multi-key
  sort (date/time/words/difficulty), still backed by the same
  `lire.archive.v1` store (extended with `category`/`cefr`/`minutes`/
  `openedAt`, all optional for backward compatibility).
- **Dictionary coverage's biggest jump yet**: a new generated fallback
  dictionary (~15,000 entries from WikDict/Wiktionary data, CC BY-SA 4.0 —
  see `src/data/dictionaries/generated/NOTICE.md`) sits behind the curated
  474-entry dictionary in the lookup order. `scripts/build-dictionary.mjs`
  downloads, filters, merges, and ranks the source data; only the generated
  JSON output is committed (same pattern as `generate-icons.mjs`).
- **Real spaced repetition** (`src/lib/spacedRepetition.ts`): a fixed
  1/3/7/14/30-day interval ladder driven by a consecutive-correct streak,
  nudged by a light `ease` multiplier — not full SM-2. `SavedWord` gained
  `ease`, `nextReviewAt`, `correctCount`, `incorrectCount`,
  `lastReviewResult` (all optional, safely migrated). The Review page now
  shows real Due today/New/Not due yet/Total stats and a priority-sorted
  queue instead of the old ad-hoc All/Saved today/Least reviewed/Current
  text filters (which are gone — they don't make sense next to a due-date
  queue).
- **Article difficulty scoring** (`src/lib/difficulty.ts`) replaces RSS
  texts' fixed "B1": word count, sentence length, and per-word dictionary/
  known-word coverage produce an A1-C1 estimate plus a learner label (Easy/
  Good level/Stretch/Hard), shown on home page cards and in the reader.
  Degrades gracefully with zero known words saved, and is skipped entirely
  for English-language RSS sources (French lookup against English text
  would otherwise score everything "unfamiliar").
- **Daily habit loop**: a new Today card on the home page (articles read
  today, words saved today, due reviews, current streak, one clear next
  action) backed by a lightweight activity-date log
  (`src/lib/habit.ts`), plus a new `/archive` "Reading history" page
  (`src/lib/archive.ts`) listing every completed article with its
  completion date, source, and words saved — snapshotted at completion
  time so it survives RSS progress entries being pruned later.
- **RSS source pool grown from 10 feeds to 120+** (`src/data/rssSources.ts`)
  — French news outlets plus English-language expat/travel/culture blogs
  and general publications' France sections, each tagged with an inferred
  `name`, `category`, and `language` (`fr`/`en`/`mixed`).
- **The home page now shows exactly 5 articles a day, not up to 20.**
  `/api/rss-texts` fetches all enabled feeds, builds a deduplicated,
  quality-filtered candidate pool (up to 3 items per working feed — often
  300+ candidates), and deterministically selects 5 using a date-seeded
  shuffle (`src/lib/rss/seededShuffle.ts`, never `Math.random()`) — the same
  5 stay all day and only change the next day. See "RSS reading content:
  a big pool, a calm daily selection" below for the full pipeline.
- **New query params on `/api/rss-texts`**: `?limit=`, `?language=`,
  `?category=`, `?refresh=` — not wired into the UI yet, but the route
  fully supports them (each combination gets its own stable daily
  selection).
- **Server-side caching**: the candidate pool is cached in memory for 12
  hours; the plain daily-5 selection is cached until the calendar day
  changes. Both are process-lifetime caches — fine to reset on a
  serverless cold start, since the next request just rebuilds them once.
- **Better content-quality filtering**: rejects items that are mostly
  cookie/privacy/nav boilerplate or contain unresolved CMS template syntax
  (`$content.TitleNoTags`-style leaks seen on at least one real feed), on
  top of the existing too-short-to-be-a-real-text check. Also deduplicates
  by source URL and by title across the whole candidate pool.
- **Dev-only debug info**: non-production `/api/rss-texts` responses
  include a `debug` object (feeds succeeded/failed, pool size, when it was
  built, the selection seed, selected ids), rendered as a collapsed panel
  on the home page — absent entirely from production responses.
- **Dictionary coverage substantially widened again** (438 → 474 entries):
  full subject/object pronoun set (je/tu/elle/nous/vous/ils/elles/me/te/lui/
  leur), more common verbs (manger, passer) with fuller conjugations for the
  highest-frequency irregulars (être, avoir, aller, faire, pouvoir, vouloir,
  devoir, prendre, dire, penser, trouver), more connectors (donc, car, parce
  que, cependant, pourtant, puis, ensuite), and everyday news vocabulary
  (gouvernement, président, économie, crise, guerre, société, science,
  technologie, climat, environnement, etc.). Every new/edited entry carries
  a simple example sentence.
- **Missing dictionary entries are now first-class**: the word sheet shows
  "Not in local dictionary yet" (was "No local dictionary entry yet"), still
  offers Ask AI and Save/Unsure, and saves with `primaryTranslation: "Not
  translated yet"` and a new `missingFromDictionary: true` field (added to
  `SavedWord`) instead of relying on an empty `translations[]` as a proxy.
- **Saved words now separate the article's own sentence from a learner
  example**: `SavedWord.contextSentence` was split into
  `articleContextSentence` (unchanged, the real article sentence) and new
  `exampleSentenceFr`/`exampleSentenceEn` fields (a short A1/B1 sentence from
  the dictionary entry, or a fixed fallback). The Words and Review pages
  show the simple example first and the article sentence underneath in
  smaller text, labelled "Original article context."
- **RSS now returns up to 20 texts** (was 5) — up to 2 items per feed across
  all 10 feeds, instead of 1. The home page's "Today's readings" section
  shows all of them, with a live count and the existing category/difficulty
  filters.
- **AI explanations are real and no longer gated by a settings toggle** —
  "Ask AI for nuance" / "Ask AI to explain" call OpenAI directly on tap
  (previous iteration added an "Enable AI help" setting; removed since AI
  was already never automatic — the button itself is the opt-in). Rebuilt
  on two new routes, `/api/ai/explain-word` and `/api/ai/explain-sentence`
  (`src/lib/ai/openai.ts`, replacing the earlier multi-provider
  abstraction), with richer response shapes (meaning-in-context, a fresh
  example, a grammar/usage note, and a common-mistake warning for words;
  natural translation, simplified French, grammar notes, and useful
  vocabulary for sentences). Responses are cached in `localStorage`. Missing
  `OPENAI_API_KEY` shows a friendly "AI is not configured" message instead
  of failing silently. The dormant full-article-translation route/provider
  method (`/api/ai/article`, `translateArticle`) was removed — it was never
  called from any UI.
- **Fixed a Vercel deployment bug where every route 404'd in production** —
  the project's framework setting was `null`, so Vercel silently built it as
  a generic static site instead of a Next.js app. Now fixed for good via
  `"framework": "nextjs"` in `vercel.json`; see "Deploying to Vercel" below.
  The app is now live at [liree.vercel.app](https://liree.vercel.app).
- **"Ask AI" buttons are now real**, behind a new **"Enable AI help"** setting
  (off by default). When enabled, tapping "Ask AI for nuance" or "Ask AI to
  explain" calls the existing `src/lib/ai/client/*.ts` services and
  `/api/ai/*` routes and renders a loading/ready/error state; when disabled,
  the buttons still show the old "not enabled yet" placeholder with zero
  network calls. See `WordSheet.tsx` / `SentenceSheet.tsx`.
- **Dictionary expanded from ~150 to 438 entries** in
  `src/data/dictionaries/fr-en.ts` — numbers, calendar, family, colors,
  question words, ~60 regular and irregular verbs with multiple conjugated
  forms, more adjectives, and everyday nouns (home, body, food, travel,
  school).
- **Rule-based lemmatisation** (`src/lib/dictionary/lemmatize.ts`) as a
  fallback in `lookupWord`: when a word isn't an exact lemma or a listed
  form, a suffix→replacement rule table guesses candidate lemmas (e.g.
  `vendions` → `vendre`, `parlaient` → `parler`) and checks each against the
  real dictionary. Wrong guesses are harmless — they just fail to match
  anything.
- **Reverse English→French lookup** — a new `/lookup` page
  (`src/app/lookup/page.tsx`) and `lookupEnglishWord` (`src/lib/dictionary/lookup.ts`)
  reuse `src/data/dictionaries/en-fr.ts`, linked from Settings.
- **Stale RSS progress pruning** — `pruneStaleRssProgress` in
  `src/lib/progress.ts` removes `lire.progress.v1` entries for RSS ids that
  no longer appear in the current feed results and haven't been touched in 3
  days, so the store doesn't grow unbounded.
- **Background RSS refresh via Vercel Cron** (`vercel.json`) hits
  `/api/rss-texts` on a schedule so the route's cache stays warm instead of
  relying solely on on-demand revalidation.
- **RSS texts persist past the session** — an optional Upstash Redis-backed
  store (`src/lib/rss/rssTextStore.ts`) and `GET /api/rss-texts/[id]` let a
  direct link to an RSS article resolve in a fresh tab, falling back to the
  existing sessionStorage cache first. Entirely opt-in: with no Redis
  credentials configured, everything behaves exactly as before.
- **Category and difficulty filters** on the home page — filter chips for
  category (All/News/Sport/Culture/Science/Everyday life) and CEFR
  difficulty (All/A1/A2/B1/B2).
- **Real PNG app icons** — 192×192, 512×512, and a 512×512 maskable variant
  (`scripts/generate-icons.mjs`, via `sharp`), wired into
  `public/manifest.json` and `layout.tsx`'s Apple touch icon.
- **Offline-first local dictionary**, replacing AI as the default word-lookup
  path entirely: `src/lib/dictionary/` + `src/data/dictionaries/fr-en.ts`
  (~150 entries covering every hardcoded text) give instant, no-network
  translation, part of speech, gender, CEFR level, and examples.
- **Word tap no longer auto-saves.** The sheet now offers three explicit
  actions — **I know this** / **Unsure** / **Save** — a real learning signal
  instead of every tap becoming a flashcard.
- **Known words**, tracked separately from flashcards
  (`src/lib/knownWords.ts`): marking a word known from the reader never
  creates a `SavedWord`; a saved word can also be *promoted* to known later
  from Review, which updates its status and adds it to the known list.
- **`SavedWord` restructured** around dictionary data (`lemma`,
  `translations[]`, `primaryTranslation`, `partOfSpeech`, `gender`, `cefr`,
  `frequencyRank`) plus a `status: "learning" | "unsure" | "known"`. Old
  saved words (plain strings, or the previous AI-era shape) migrate in
  automatically as `status: "learning"`.
- **Reader highlighting** now distinguishes four subtle states — learning
  (amber), unsure (blue), a saved word missing dictionary data (dashed
  underline), and known (faded gray, togglable via a new "Show known word
  styling" setting) — without making the page visually noisy.
- **Words page** gained filters (Learning / Unsure / Known / Missing
  entries) and a "Mark known" action per word.
- **Review** now excludes known words entirely, reveals richer data
  (translations, part of speech, gender, a live dictionary example), and
  adds a **Mark as known** button that removes the card from the queue
  immediately.
- **AI demoted to an inert, explicit-only placeholder.** Both the word and
  sentence sheets have an "Ask AI for nuance" / "Ask AI to explain" button
  that only shows "AI explanations are not enabled yet." — no automatic
  calls, no loading states, no network dependency for the core reading
  flow. The AI provider layer from the previous iteration is kept in the
  codebase (not deleted) but is currently unreferenced by any UI — see "AI
  is optional".
- **"Show full translation" removed** in favor of **"Translate article
  later"**, which explains that full-article translation is intentionally
  disabled so reading stays in French by default.

## What to build next

- **Supabase** for auth + syncing saved/known words, progress, streak, and
  settings across devices — everything is localStorage-only today, so a
  new device or a cleared browser starts completely fresh.
- **A real morphological analyzer** to replace the rule-based lemmatiser for
  irregular stem changes it can't guess (e.g. `acheter` → `achète`,
  `vendre` → future-tense stem changes) — would also let the generated
  dictionary's ~15,000 lemma-only entries (no `forms[]`) match more of their
  own conjugated/plural forms.
- **Let AI fill in missing dictionary entries** — when a saved word has
  `missingFromDictionary: true`, an "Ask AI" result could be offered to
  patch in a real `primaryTranslation` for future lookups, instead of only
  ever showing "Not translated yet."
- **UI controls for the `/api/rss-texts` query params** — a language or
  category picker on the home page that reuses the already-supported
  `?language=`/`?category=` filters, and perhaps a manual "shuffle" action
  that calls `?refresh=true` for someone who wants a different pick before
  the day rolls over.
- **Verify the newly-added feeds over time** — 122 sources were added in
  one pass from a provided list and named/categorized/tagged by inference
  (see `src/data/rssSources.ts`); a few are inevitably dead, rate-limited,
  or mis-tagged (wrong language/category) and worth pruning or correcting
  as that becomes apparent from real usage/the dev debug panel.
- **CEFR metadata for generated dictionary entries** — WikDict doesn't carry
  CEFR levels, so `src/lib/difficulty.ts` treats every generated-dictionary
  hit as a flat "mid-frequency" estimate regardless of how common the word
  actually is; a real frequency list cross-referenced against the generated
  set would sharpen the difficulty estimate meaningfully.
- **Weekly/monthly stats on the archive page** — it's a flat chronological
  list today; simple aggregates (articles per week, current vs. longest
  streak) would fit naturally once there's more history to look back on.
- Audio / text-to-speech for pronunciation.
