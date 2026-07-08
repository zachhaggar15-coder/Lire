# Lire — French Reader (PWA)

A mobile-first Progressive Web App for reading short French texts — built to
feel like a language-learning Kindle. Open it on your phone, read a handful of
fresh articles pulled live from French news RSS feeds (or the hardcoded
fallback texts), and tap any word for an **instant, fully offline** dictionary
lookup — translation, part of speech, gender, CEFR level, an example — with no
network round-trip and no AI in the loop. AI is there for when you explicitly
want more (see "AI is optional" below), never automatically. Reading state
lives in **localStorage** — no account, no backend, works instantly.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS**
- **Local offline dictionary** (`src/lib/dictionary/`, `src/data/dictionaries/`)
  — the primary, instant word-lookup path; no network call, no API key needed
- An **AI provider layer** (`src/lib/ai/`) from an earlier iteration, kept in
  place but **dormant** — not called automatically anywhere; see "AI is
  optional" below
- Server-side **RSS fetching** (`/api/rss-texts`) — no external RSS/XML
  package, just a small dependency-free parser
- **localStorage** for saved words, known words, reading progress, and
  settings (Supabase planned for later)
- Deployable to **Vercel**

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

No API key or setup is required — word lookup is fully local. If you later
want to experiment with the dormant AI layer (see "AI is optional"), copy
`.env.local.example` to `.env.local` and add an `OPENAI_API_KEY`; nothing in
today's UI calls it yet.

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

1. **Read (home)** — `src/app/page.tsx`
   On load, fetches `GET /api/rss-texts` and shows up to 5 **live French news
   articles** pulled from RSS feeds, each with a title, difficulty (fixed at
   B1 for RSS texts), category, estimated reading time, a short preview,
   **source name + published date**, and a **reading-progress badge** (Unread
   / In progress / Completed). Shows a loading skeleton while fetching. If the
   fetch fails or returns nothing, it falls back to the 5 hardcoded texts in
   `src/data/texts.ts` with a small notice. See "RSS reading content" below.

2. **Reader** — `src/app/reader/[id]/page.tsx` + `src/components/Reader.tsx`
   Renders the chosen text with punctuation and paragraph spacing preserved,
   split into sentences and words.
   - **Tap a word** — an **instant, offline dictionary lookup** opens in a
     bottom sheet: translation(s), part of speech, gender, CEFR level, and an
     example sentence when the dictionary has one, or "No local dictionary
     entry yet" when it doesn't. Nothing is saved automatically — instead the
     sheet offers three explicit actions:
     - **I know this** — adds the word (and its lemma) to a known-words list.
       No flashcard is created.
     - **Unsure** — saves it as a flashcard with status `"unsure"`.
     - **Save** — saves it as a flashcard with status `"learning"`.
     A small **"Ask AI for nuance"** link is also there, but it only shows
     "AI explanations are not enabled yet." — see "AI is optional" below.
   - **Tap a sentence** — a lightweight sheet shows the sentence and an
     **"Ask AI to explain"** button. There's no automatic translation or
     explanation here either; the button shows the same "not enabled yet"
     message.
   - Word highlighting is deliberately subtle: **learning** words get an
     amber background, **unsure** words a soft blue one, a saved word with no
     dictionary data gets a dashed underline on top of its color, and
     **known** words fade to muted gray text — each togglable in Settings.
   - **"Translate article later"** — replaces full-article translation. It's
     a small button that, when tapped, explains that full translation is
     intentionally disabled for now, in favor of reading French with word and
     sentence support rather than defaulting to English.
   - Opening a text marks it **in progress**; a **Mark as completed** button at
     the end of the article marks it done.
   - For RSS-sourced texts only: a discreet **"Original source"** link to the
     real article. Hardcoded texts don't have a source URL, so it doesn't
     render for them.
   - Includes a **Back** button.

3. **Words** — `src/app/words/page.tsx`
   Filterable list — **Learning**, **Unsure**, **Known**, **Missing entries**
   (saved words the dictionary had nothing for) — each showing the word,
   lemma, translation(s), part of speech, gender, CEFR, context sentence,
   source text, saved date, and review count. Delete any word, or promote it
   straight to **known** from here.

4. **Review** — `src/app/review/page.tsx`
   Flashcards for words with status **learning** or **unsure** only — known
   words are never quizzed. The same four filters as before (All / Saved
   today / Least reviewed / Current text) apply within that reviewable set.
   Front: the French word (plus its lemma, if different). **Reveal meaning**
   shows the primary translation, other translations, part of speech, gender,
   the context sentence, and a dictionary example if there is one. Three
   buttons: **Knew it** / **Didn't know it** (record a review) and **Mark as
   known** (promotes the word to known and removes it from the queue on the
   spot, whether or not you've revealed it first).

5. **Settings** — `src/app/settings/page.tsx`
   - **Saved word highlights** on/off — the amber/blue coloring for
     learning/unsure words.
   - **Show known word styling** on/off — the muted gray for known words.
   - **Font size** — small / medium / large.
   - **Enable AI help** on/off (default off) — turns "Ask AI for nuance" and
     "Ask AI to explain" into real requests against the AI provider layer;
     see "AI is optional" below.
   - **English → French lookup** — a link to `/lookup` for the reverse
     lookup direction.
   - **Known words** — a count of everything you've marked known, with a
     **Clear** action to forget them all (they'll reappear for review).

### RSS reading content

The home page's articles come from **10 French RSS feeds**, fetched and parsed
server-side, converted into the app's normal `ReadingText` shape, and rendered
through the exact same Reader/ReadingCard components as the hardcoded texts —
nothing in the reading flow needed to know the difference.

**Pipeline** (`GET /api/rss-texts`, `src/app/api/rss-texts/route.ts`):

1. Fetch every `enabled` feed in `src/data/rssSources.ts`, concurrently, each
   with an 8s timeout.
2. Parse the XML with a small dependency-free regex parser
   (`src/lib/rss/parseRss.ts`) that reads `<item>`/`<entry>` blocks — titles,
   links, publish dates, descriptions, richer content
   (`content:encoded`/custom `<body>`/Atom `<content>`), and categories.
3. Clean each candidate item (`src/lib/rss/cleanContent.ts`): strip HTML tags,
   decode entities (named + numeric — covers accented French text reliably),
   collapse whitespace, and skip anything too short to be a real reading text.
   The **first item per feed** that passes becomes that source's text; if it
   doesn't, the next item in the feed is tried.
4. Build the response object (`src/lib/rss/rssToReadingText.ts`). No
   translation happens here at all — words are looked up locally in the
   reader, and full-article translation is intentionally disabled (see
   "Translate article later" and "AI is optional" below).
5. Cap the combined result at 5 texts and return them as JSON.

**Failure handling** — required and tested against real feeds:
- **One feed down:** wrapped in `Promise.allSettled` + a per-source try/catch,
  so a single failure (timeout, non-200, bad XML, bot-protection redirect
  loop — Sud Ouest's Incapsula protection reliably triggers this) never stops
  the others. Verified live: 9/10 feeds succeeded, Sud Ouest failed, the route
  still returned 5 good texts.
- **All feeds down:** the route returns `{ texts: [] }`; the home page detects
  the empty result (or a fetch/network error) and falls back to the 5
  hardcoded texts with a small "Couldn't load today's articles" notice.
  Verified by disabling every source and confirming the fallback renders.

**Where to add/remove feeds** — edit `src/data/rssSources.ts`. Each entry is
`{ id, name, category, feedUrl, language, enabled }`; set `enabled: false` to
turn a feed off without deleting it, or add a new entry with a fresh `id`.
`category` reuses the app's fixed `Category` union (not a bare string) so
every RSS card stays compatible with `ReadingCard`'s styling — pick whichever
of `news-style` / `sport` / `culture` / `science` / `everyday life` fits best
as that source's default (the actual per-article category can still be
refined from the feed's own `<category>` tags, see `mapToKnownCategory` in
`rssToReadingText.ts`).

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
  hand-curated, 438 entries covering every function word, all vocabulary in
  `src/data/texts.ts`'s five hardcoded articles, numbers, calendar, family,
  colors, ~60 conjugated verbs, and common everyday nouns/adjectives.
- `src/data/dictionaries/en-fr.ts` — a modest English→French starter set,
  used by the reverse lookup at `/lookup` via `lookupEnglishWord`.
- `src/lib/dictionary/lookup.ts` — `lookupWord(word)`, the only function the
  reading flow calls (plus `lookupEnglishWord(word)` for the reverse
  direction). It builds `Map`s once at module load (lemma → entry, and every
  inflected/elided form → entry) and never touches the network.
- `src/lib/dictionary/lemmatize.ts` — `guessLemmas(word)`, a rule-based
  suffix→replacement table (e.g. strip `-aient`/`-ions`/`-ez` and try `-er`/
  `-re` endings) used as a fallback when a word isn't an exact lemma or a
  listed form. Candidates are only ever used if they match a real dictionary
  lemma, so a wrong guess is harmless.

**Lookup order**: clean the word, check it as an exact lemma, then check it
against every entry's `forms` (conjugations, plurals, elided articles like
`l'idée`/`jusqu'au`), then try each of `guessLemmas`'s candidate lemmas, and
if nothing matches, return `{ source: "missing", translations: [], ... }` —
**never** falling back to AI automatically.

**Adding dictionary entries** — edit `src/data/dictionaries/fr-en.ts` and add
an object matching `DictionaryEntry`. Only `lemma` and `translations` are
required; everything else (`forms`, `gender`, `cefr`, `examples`, `notes`) is
optional and improves what the word sheet shows. No other file needs to
change — `lookup.ts` re-indexes whatever is in the array.

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

### AI is optional (off by default)

The reading flow **never** calls AI automatically — only when a reader
explicitly taps a button *and* has turned on **"Enable AI help"** in
Settings (off by default). With the toggle off, both the word sheet's **"Ask
AI for nuance"** and the sentence sheet's **"Ask AI to explain"** button show
"AI explanations are not enabled yet." with zero network calls, exactly as
before. With the toggle on, tapping either button calls
`src/lib/ai/client/wordAnalysis.ts` / `sentenceExplanation.ts` →
`/api/ai/word` / `/api/ai/sentence` and renders a loading state, then the
result (or an error message on failure).

The underlying provider layer is unchanged from the earlier iteration:
`src/lib/ai/types.ts` (provider interfaces), `src/lib/ai/providers/openai.ts`
(an OpenAI implementation via plain `fetch`, no SDK), `src/lib/ai/cache.ts`
(a localStorage `CacheStore`), and three route handlers under
`src/app/api/ai/`. Requires `OPENAI_API_KEY` in `.env.local` — without it,
enabling the toggle just means the request fails and the sheet shows an
error state instead of the "not enabled yet" placeholder.

**Why AI is optional at all**: the goal here is a fast, uninterrupted reading
flow — instant local lookup for the common case, with deeper (slower,
costlier, network-dependent) AI help available only when a reader explicitly
asks for it. Calling AI on every tap, as a previous iteration did, works
against that: it adds latency to the most frequent interaction in the app and
turns a lightweight reading habit into something that depends on an API key
and an internet connection.

### Saved word format

Saved words are stored as objects under the localStorage key
`lire.savedWords.v1`:

```ts
type WordStatus = "learning" | "unsure" | "known";

interface SavedWord {
  word: string;                 // clean lowercase key (unique)
  lemma: string | null;         // dictionary/citation form, if resolved
  translations: string[];       // every translation the dictionary had
  primaryTranslation: string;   // translations[0], or "No local dictionary entry yet"
  partOfSpeech: string | null;
  gender: string | null;
  cefr: string | null;
  frequencyRank: number | null;
  contextSentence: string;      // full sentence the word was tapped in
  sourceTextTitle: string;      // title of the source text
  savedAt: string;              // ISO timestamp
  reviewCount: number;
  lastReviewedAt: string | null;
  status: WordStatus;
}
```

`src/lib/storage.ts` transparently **migrates** older data on read — plain
strings, the AI-era shape (a single `translation` string, no `status`), and
the current shape are all normalised to the structure above and written
back. Migrated words default to `status: "learning"`.

### Reading progress & settings storage

- `src/lib/progress.ts` — per-text status (`unread` / `in-progress` /
  `completed`) under `lire.progress.v1`, plus the id of the most recently
  opened text (`lire.progress.lastOpened`) used by the Review "Current text"
  filter.
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
| `src/lib/dictionary/constants.ts` | `NO_DICTIONARY_ENTRY` — shown when the dictionary has nothing for a word |
| `src/data/dictionaries/fr-en.ts` | The active French→English dictionary (438 entries) — add entries here |
| `src/data/dictionaries/en-fr.ts` | The English→French dictionary backing `/lookup` |
| `src/lib/knownWords.ts` | Known-words list: `getKnownWords`, `markKnown`, `isKnown`, `removeKnown`, `clearKnownWords` |
| `src/lib/storage.ts` | Saved words: `getSavedWords`, `saveWord`, `markWordAsKnown`, `recordReview`, `deleteWord`, `clearWords`, migration |
| `src/lib/progress.ts` | Reading progress: `getProgress`, `markOpened`, `markCompleted`, `getCurrentTextTitle` |
| `src/lib/settings.ts` | App settings: `getSettings`, `saveSettings`, `DEFAULT_SETTINGS` |
| `src/lib/format.ts` | Shared `formatDate` helper used by ReadingCard and the Words page |
| `src/lib/ai/*`, `src/app/api/ai/*` | The dormant AI provider layer (types, OpenAI provider, cache, client services, three routes) — see "AI is optional" |
| `src/data/rssSources.ts` | The 10 configured RSS feeds — add/remove/disable feeds here |
| `src/lib/rss/parseRss.ts` | Dependency-free RSS/Atom XML parsing (`parseRssFeed`) |
| `src/lib/rss/cleanContent.ts` | HTML stripping, entity decoding, whitespace, length/reading-time checks |
| `src/lib/rss/rssToReadingText.ts` | Converts one RSS item into the API's `RssReadingText` shape (server-only) |
| `src/lib/rss/adaptReadingText.ts` | Maps `RssReadingText` → the app's `ReadingText` (client-safe) |
| `src/lib/rss/rssTextCache.ts` | `sessionStorage` cache so the reader can look up RSS texts by id |
| `src/lib/rss/rssTextStore.ts` | Optional Upstash Redis persistence so RSS texts survive a new tab/restart |
| `src/app/api/rss-texts/route.ts` | `GET /api/rss-texts` — fetches all enabled feeds, returns up to 5 texts |
| `src/app/api/rss-texts/[id]/route.ts` | `GET /api/rss-texts/[id]` — fallback lookup for one persisted RSS text |
| `src/types.ts` | Shared types: `ReadingText`, `SavedWord`, `WordStatus`, `TextProgress`, `AppSettings`, `ReviewFilter` |
| `src/components/*` | `BottomNav`, `ReadingCard`, `Reader`, `WordSheet`, `SentenceSheet`, `Toast`, `ServiceWorker` |

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

- **Supabase** for auth + syncing saved/known words, progress, and settings
  across devices.
- **Spaced repetition** in Review — use `reviewCount` / `lastReviewedAt` to
  schedule cards instead of a single linear pass per filter.
- **A real morphological analyzer** to replace the rule-based lemmatiser for
  irregular stem changes it can't guess (e.g. `acheter` → `achète`,
  `vendre` → future-tense stem changes).
- **A bigger/downloadable dictionary** beyond the current 438 hand-curated
  entries — the architecture still supports swapping `fr-en.ts` for a much
  larger generated or user-imported wordlist without touching lookup logic.
- Audio / text-to-speech for pronunciation.
