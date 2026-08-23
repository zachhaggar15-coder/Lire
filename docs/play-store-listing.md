# Play Store listing — Sorlio

Draft copy and an asset inventory for the first release. The descriptions
below describe only features that exist in the code today. Play rejects
listings that promise more than the app does, so if a feature is cut before
release, cut the sentence with it.

## Store assets

### Present in the repo

| Asset | File | Size | Play use |
| --- | --- | --- | --- |
| App icon | `android/store_icon.png` | 512×512 PNG | Store listing icon |
| Launcher icon | `android/app/src/main/res/mipmap-*/ic_launcher.png` | 48–192 px | On-device launcher |
| Adaptive/maskable | `android/app/src/main/res/mipmap-*/ic_maskable.png` | 48–192 px | Adaptive icon |
| Splash | `android/app/src/main/res/drawable-*/splash.png` | up to xxxhdpi | TWA splash |
| PWA icons | `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png` | 192/512 | Web install |
| Vector source | `public/icon.svg`, `public/icon-maskable-source.svg`, `public/icon-monochrome.svg` | scalable | Regeneration |

The icon artwork is an open book with a sun mark. It carries no letterform and
no wordmark, so the rename to Sorlio required no redraw and the existing icons
are correct as they stand.

### Still needed — you must create these

| Asset | Requirement | Notes |
| --- | --- | --- |
| Feature graphic | 1024×500 PNG or JPEG, no alpha | Required. Shown at the top of the listing. Do not put small text in it; it gets cropped on some surfaces. |
| Phone screenshots | At least 2, up to 8 | Required. Take from a real device or emulator running the release build. |
| Tablet screenshots | Optional | Only if you declare tablet support. |
| Short description | 80 characters max | Draft below. |
| Full description | 4000 characters max | Draft below. |

> **VERIFY CURRENT GOOGLE PLAY REQUIREMENT** for exact screenshot dimensions,
> aspect-ratio limits, and minimum counts — these change, and Play Console
> shows the current rules inline while you upload.

Screenshots worth taking, because they show what the app actually is:
the reading view with a word tapped and its contextual meaning open; the
lesson-complete screen; the saved-words review; the journey map; the Premium
page.

## Listing text

### App name (30 characters max)

```
Sorlio
```

Alternative if you want the category legible in the name itself, at 22
characters:

```
Sorlio — French Reader
```

### Short description (80 characters max)

Primary, 71 characters:

```
Read real French. Tap any word for the meaning it has in that sentence.
```

Alternatives:

```
Learn French by reading. Tap a word, get the meaning that fits the line.
```

```
French reading practice with instant, context-aware word meanings.
```

### Full description (4000 characters max)

```
Sorlio teaches French by having you read it.

Pick a text at your level, read it, and tap any word you don't know. Sorlio
tells you what that word means in that sentence — not a list of six
dictionary senses for you to guess between. "Compte" in one line and
"compte" in another get different answers, because they mean different
things.

When Sorlio isn't confident about a meaning, it says so rather than
inventing one. Being told "this word is ambiguous here" is more useful than
being told something wrong with confidence.

WHAT'S INSIDE

• Over a thousand French texts, from first-week A1 up to C2, on news,
  culture, science, sport and everyday life
• Tap-to-understand: contextual meanings for single words and for whole
  expressions, so "se rendre compte" is explained as a phrase rather than
  three unrelated words
• Saved words with spaced repetition, so what you look up comes back for
  review at the right time
• Practice built from the text you just read: sentence reconstruction,
  gap-fill, and guess-from-context questions
• Listening practice with adjustable speed
• Grammar notes drawn from the sentences you actually met
• Import your own French text and read it with the same tools
• A reading journey that tracks what you have completed
• Works offline once loaded, and keeps working with no account

NO ACCOUNT NEEDED

Sorlio works as a guest. Your saved words and progress live on your device.
Sign in with Google only if you want them synced across devices — there is
no password to create and none is ever stored.

FREE AND PREMIUM

Without an account: one article and three word lookups a day.
Free account: three articles and ten word lookups a day.
Premium: unlimited reading and lookups, plus the advanced study features.

Premium is a monthly subscription billed through Google Play. It renews
until you cancel, and you can cancel any time in Play's subscription
settings.

PRIVACY

Your reading data stays on your device unless you sign in. Analytics are
optional and off until you say yes. You can delete your account and its
synced data from inside the app, or on the web without installing anything.

Sorlio is built and run by one independent developer.
```

Word count is well inside the 4000-character limit, which leaves room to add a
line about anything you change before launch.

## Content rating and category

- **Category:** Education.
- **Content rating:** complete Play's questionnaire honestly. The app shows
  news-derived and public-domain literary text, so questions about mature
  themes are worth reading carefully rather than answering reflexively — the
  dictionary contains vulgar senses for some French words, even though the
  learner-facing gloss filters them out of exercises.
- **Ads:** none. Declare no ads.
- **Target audience:** adults and older teenagers learning French.
  **VERIFY CURRENT GOOGLE PLAY REQUIREMENT** — if you declare an audience that
  includes children, Play applies the Families policy, which brings extra
  requirements this app has not been designed against.

## Required listing URLs

| Field | Value |
| --- | --- |
| Privacy policy | `https://<your production domain>/privacy` |
| Account deletion | `https://<your production domain>/account/delete` |
| Support email | `Sorlio@proton.me` |

Both pages are already live in the app and both are reachable without
installing it, which is what Play's data-deletion policy asks for.
