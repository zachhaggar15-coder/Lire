# Lire — French Reader (PWA)

**Live demo:** [liree.vercel.app](https://liree.vercel.app) — the source is
public on GitHub at
[zachhaggar15-coder/Lire](https://github.com/zachhaggar15-coder/Lire).

A mobile-first Progressive Web App for reading short French texts — built to
feel like a language-learning Kindle. Open it on your phone, read up to 20
fresh articles pulled live from French news RSS feeds (or the hardcoded
fallback texts), and tap any word for an **instant, fully offline** dictionary
lookup — translation, part of speech, gender, CEFR level, a simple example —
with no network round-trip. AI is there for when you explicitly want more
(see "AI explanations" below), never automatically. Reading state lives in
**localStorage** — no account, no backend, works instantly.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS**
- **Local offline dictionary** (`src/lib/dictionary/`, `src/data/dictionaries/`)
  — the primary, instant word-lookup path; no network call, no API key needed.
  474 hand-curated entries plus a rule-based lemmatiser for unlisted
  inflections.
- **AI explanations** (`src/lib/ai/`) — on-demand only, via OpenAI. Never
  called automatically; see "AI explanations" below.
- Server-side **RSS fetching** (`/api/rss-texts`) — no external RSS/XML
  package, just a small dependency-free parser. Returns up to 20 texts.
- **localStorage** for saved words, known words, reading progress, and
  settings (Supabase planned for later)
- Deployable to **Vercel**

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

1. **Read (home)** — `src/app/page.tsx`
   On load, fetches `GET /api/rss-texts` and shows a **"Today's readings"**
   section with up to **20 live French news articles** pulled from RSS feeds
   (up to 2 per feed, across 10 feeds), each with a title, difficulty (fixed
   at B1 for RSS texts), category, estimated reading time, a short preview,
   **source name + published date**, and a **reading-progress badge** (Unread
   / In progress / Completed). Category and difficulty filter chips narrow
   the list. Shows a loading skeleton while fetching. If the fetch fails or
   returns nothing, it falls back to the 5 hardcoded texts in
   `src/data/texts.ts` with a small notice. See "RSS reading content" below.

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
   - Opening a text marks it **in progress**; a **Mark as completed** button at
     the end of the article marks it done.
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
   Flashcards for words with status **learning** or **unsure** only — known
   words are never quizzed. The same four filters as before (All / Saved
   today / Least reviewed / Current text) apply within that reviewable set.
   Front: the French word (plus its lemma, if different). **Reveal meaning**
   shows the primary translation, other translations, part of speech, gender,
   the **learner example sentence** first, then the **original article
   context** underneath in smaller text. Three buttons: **Knew it** /
   **Didn't know it** (record a review) and **Mark as known** (promotes the
   word to known and removes it from the queue on the spot, whether or not
   you've revealed it first).

5. **Settings** — `src/app/settings/page.tsx`
   - **Saved word highlights** on/off — the amber/blue coloring for
     learning/unsure words.
   - **Show known word styling** on/off — the muted gray for known words.
   - **Font size** — small / medium / large.
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
   The **first two items per feed** that pass become that source's texts; if
   an item fails, the next one in the feed is tried.
4. Build the response object (`src/lib/rss/rssToReadingText.ts`). No
   translation happens here at all — words are looked up locally in the
   reader, and full-article translation is intentionally disabled (see
   "Translate article later" and "AI explanations" below).
5. Cap the combined result at **20 texts** (up to 2 per feed × 10 feeds) and
   return them as JSON.

**Failure handling** — required and tested against real feeds:
- **One feed down:** wrapped in `Promise.allSettled` + a per-source try/catch,
  so a single failure (timeout, non-200, bad XML, bot-protection redirect
  loop — Sud Ouest's Incapsula protection reliably triggers this) never stops
  the others. Verified live: 9/10 feeds succeeded, Sud Ouest failed, the route
  still returned a full set of good texts from the rest.
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
  hand-curated, 474 entries covering every function word (articles, subject/
  object pronouns, prepositions, conjunctions/connectors), all vocabulary in
  `src/data/texts.ts`'s five hardcoded articles, numbers, calendar, family,
  colors, ~65 conjugated verbs (with fuller person/tense coverage for the
  most common ones — être, avoir, aller, faire, pouvoir, vouloir, devoir,
  prendre, dire, penser, trouver), common adjectives/adverbs, and everyday
  news vocabulary (gouvernement, président, économie, crise, société, etc.).
  Every entry added or edited in this pass carries a short, simple example
  sentence — see "Example sentences vs. article context" below.
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
optional and improves what the word sheet shows — but a short `examples`
entry is strongly encouraged (see below). No other file needs to change —
`lookup.ts` re-indexes whatever is in the array.

### Example sentences vs. article context

Every saved word now stores **two separate sentences**, so a flashcard's
"example" is always a clean, simple sentence rather than whatever dense news
prose the word happened to appear in:

- **`exampleSentenceFr` / `exampleSentenceEn`** — a short, natural,
  A1/B1-appropriate sentence, e.g. `"Je mange une pomme."` / `"I eat an
  apple."`. Sourced from the dictionary entry's first `examples[]` item; if
  the entry has none, a fixed fallback is used (`"Je vois ce mot dans un
  texte." / "I see this word in a text."`).
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
}
```

`src/lib/storage.ts` transparently **migrates** older data on read — plain
strings, the AI-era shape (a single `translation` string, no `status`), the
previous shape (`contextSentence`, no example-sentence split), and the
current shape are all normalised to the structure above and written back.
Migrated words default to `status: "learning"`, and get the fallback example
sentence if they predate that field.

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
| `src/lib/dictionary/constants.ts` | `NO_DICTIONARY_ENTRY` (live popup), `NOT_TRANSLATED_YET` (saved-word placeholder), fallback example sentence |
| `src/data/dictionaries/fr-en.ts` | The active French→English dictionary (474 entries) — add entries here |
| `src/data/dictionaries/en-fr.ts` | The English→French dictionary backing `/lookup` |
| `src/lib/knownWords.ts` | Known-words list: `getKnownWords`, `markKnown`, `isKnown`, `removeKnown`, `clearKnownWords` |
| `src/lib/storage.ts` | Saved words: `getSavedWords`, `saveWord`, `markWordAsKnown`, `recordReview`, `deleteWord`, `clearWords`, migration |
| `src/lib/progress.ts` | Reading progress: `getProgress`, `markOpened`, `markCompleted`, `getCurrentTextTitle` |
| `src/lib/settings.ts` | App settings: `getSettings`, `saveSettings`, `DEFAULT_SETTINGS` |
| `src/lib/format.ts` | Shared `formatDate` helper used by ReadingCard and the Words page |
| `src/lib/ai/openai.ts` | `explainWord`, `explainSentence` — OpenAI calls, on-demand only |
| `src/lib/ai/client.ts` | `getWordExplanation`, `getSentenceExplanation` — cache-first client wrappers |
| `src/lib/ai/cache.ts` | localStorage `CacheStore` + stable cache-key helpers |
| `src/app/api/ai/explain-word/route.ts`, `.../explain-sentence/route.ts` | The two AI-backed routes — see "AI explanations" |
| `src/data/rssSources.ts` | The 10 configured RSS feeds — add/remove/disable feeds here |
| `src/lib/rss/parseRss.ts` | Dependency-free RSS/Atom XML parsing (`parseRssFeed`) |
| `src/lib/rss/cleanContent.ts` | HTML stripping, entity decoding, whitespace, length/reading-time checks |
| `src/lib/rss/rssToReadingText.ts` | Converts one RSS item into the API's `RssReadingText` shape (server-only) |
| `src/lib/rss/adaptReadingText.ts` | Maps `RssReadingText` → the app's `ReadingText` (client-safe) |
| `src/lib/rss/rssTextCache.ts` | `sessionStorage` cache so the reader can look up RSS texts by id |
| `src/lib/rss/rssTextStore.ts` | Optional Upstash Redis persistence so RSS texts survive a new tab/restart |
| `src/app/api/rss-texts/route.ts` | `GET /api/rss-texts` — fetches all enabled feeds, up to 2 items each, returns up to 20 texts |
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

- **Supabase** for auth + syncing saved/known words, progress, and settings
  across devices.
- **Spaced repetition** in Review — use `reviewCount` / `lastReviewedAt` to
  schedule cards instead of a single linear pass per filter.
- **A real morphological analyzer** to replace the rule-based lemmatiser for
  irregular stem changes it can't guess (e.g. `acheter` → `achète`,
  `vendre` → future-tense stem changes).
- **A bigger/downloadable dictionary** beyond the current 474 hand-curated
  entries — the architecture still supports swapping `fr-en.ts` for a much
  larger generated or user-imported wordlist without touching lookup logic.
- **Let AI fill in missing dictionary entries** — when a saved word has
  `missingFromDictionary: true`, an "Ask AI" result could be offered to
  patch in a real `primaryTranslation` for future lookups, instead of only
  ever showing "Not translated yet."
- Audio / text-to-speech for pronunciation.
