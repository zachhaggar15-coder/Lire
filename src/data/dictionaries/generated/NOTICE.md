# `fr-en-generated.json` — source, license, and regeneration

## Source

[WikDict](https://www.wikdict.com) French → English dictionary, downloaded
from `https://download.wikdict.com/dictionaries/sqlite/2/fr-en.sqlite3`.
WikDict builds its dictionaries from [Wiktionary](https://www.wiktionary.org/)
via [DBnary](http://kaiko.getalp.org/about-dbnary/), a project that extracts
structured translation data from Wiktionary's raw wikitext.

## License

**CC BY-SA 4.0** (Creative Commons Attribution-ShareAlike 4.0), inherited
from Wiktionary's own license. This applies to the *data* in
`fr-en-generated.json` specifically — not to the application's source code,
which remains under whatever license the rest of this repository uses.

- **Attribution**: this file. If you extract or redistribute
  `fr-en-generated.json` on its own, credit "Wiktionary contributors, via
  WikDict/DBnary" and link to https://www.wikdict.com and
  https://www.wiktionary.org/.
- **ShareAlike**: any redistributed copy or derivative of this specific
  data file must remain under CC BY-SA 4.0 (or a later compatible version).
  This does not extend to unrelated code in the repository — copyleft
  "share-alike" obligations under CC BY-SA apply to the licensed work
  (this dictionary data) and derivatives of it, not to every file that
  happens to sit in the same Git repository.
- Redistributing this generated file as part of this open-source app is
  intended and compliant, provided this NOTICE stays alongside it.

## Why this dataset

WikDict's SQLite export ships a `simple_translation`/`translation` table
built from real Wiktionary entries with a computed "importance" score per
sense — a good, ready-made proxy for word commonality without needing a
separate frequency corpus. It's actively maintained (dated builds published
regularly) and the whole fr-en pair is a manageable ~22MB SQLite file rather
than a multi-GB full-Wiktionary dump.

## What's actually shipped

Not the raw WikDict data — a filtered, trimmed, deduplicated subset:

- Proper nouns, surnames, and first names are excluded (`nompr`,
  `nom_de_famille`, `patronyme`, `prenom` in WikDict's part-of-speech
  tagging) — not useful general reading vocabulary.
- Entries containing Wiktionary wiki-markup leftovers or non-word characters
  are excluded.
- Multiple senses of the same written form are merged into one entry with
  a deduplicated, capped (max 6) translation list.
- Only the **~15,000 highest-"importance"** entries are kept, and only for
  words *not already in* the hand-curated `src/data/dictionaries/fr-en.ts`
  (that dictionary always wins the lookup anyway — see `lookup.ts` — so
  duplicating it here would just bloat the file for no benefit).
- Fields WikDict doesn't provide — CEFR level, gender, example sentences —
  are simply omitted (`undefined`), same as any other optional
  `DictionaryEntry` field. `frequencyRank` is set to `1000 + <rank index>`
  so generated entries always sort as "less common" than the curated
  dictionary's hand-assigned ranks (which are in the 1-60 range).

## How to regenerate

```bash
node scripts/build-dictionary.mjs
```

This downloads `fr-en.sqlite3` into `.cache/` (gitignored — re-downloaded
automatically if missing) the first time, then re-runs the whole filter/
merge/rank pipeline and overwrites `fr-en-generated.json`. Safe to re-run
any time — e.g. after expanding the curated dictionary (so newly-curated
words get excluded from the generated set too), or when WikDict publishes a
fresher build (edit `SOURCE_URL` in the script if the dated path changes).

This script is **not** part of `npm run build` — like
`scripts/generate-icons.mjs`, its output is a committed, versioned asset,
regenerated manually by a maintainer, not on every install/build.
