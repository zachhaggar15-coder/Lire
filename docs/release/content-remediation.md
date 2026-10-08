# Teaching-correctness remediation

8 October 2026. Branch `release/sorlio-production-hardening`.

An independent editorial, CEFR and pedagogy audit found that the library and learning loop
were broadly sound, but that some generated teaching was confidently wrong. The rule applied
here: **anything Sorlio teaches confidently must be dependable; when it can't be, it abstains.**
A missing optional exercise is acceptable. A wrong one is not.

## 1. News difficulty

**Where B1 was hard-coded.** `rssToReadingText.ts` gave every live article `difficulty: "B1"`.
`candidatePool.ts` (`bankTextToRssReadingText`) overwrote bundled fallback readings with "B1"
too, even though each has an editorial level.

**What the fake B1 reached.** Traced through every consumer:

| Consumer | Effect of the fake level |
|---|---|
| News card (and compact card) | Showed "B1 · 4 min · Good fit" |
| Card "fit" | Not a fit at all: an absolute label from the estimator ("Good level" for 97% of B1–C2 texts, whatever the reader's level) |
| Card reasons (•••) | "Close to your level" and "Best fit today" came from the same estimate |
| Reader header | "B1 - 4 min" |
| Reading options note | "For you, this one looks easy" (estimator label; said "easy" of C2 classics) |
| Completion screen | "Reading difficulty B1" |
| History (archive) | Stored the estimator's CEFR for every reading, curated or not |
| Completion records | "B1" for news, so it counted towards "Highest level article" |
| Diagnostics | Compared news with B1 readings (estimator level) |
| Article feedback, lookup stats | Recorded B1 |
| Level filter | Matched every article to B1 (the filter is only shown for bundled readings) |
| Recommendation | Level match used the estimator's CEFR for all texts, curated ones included |
| Practice AI prompt | "B1 French learner" |
| Lessons hero | A resumed news article showed "B1" |
| Cached shapes | Server pool (Redis), session and offline caches all carried the blanket B1 |

**Estimator benchmark** (`lib/difficulty.ts`, text only, no known words) against 1,355
readings with editorial levels:

| Set | Exact | Within one band | More than one band off | Mean bias |
|---|---|---|---|---|
| Authored (865) | 36% | 78% | 22% | −0.85 bands |
| Classics (490) | 2% | 29% | 71% | −2.15 bands |
| All | 24% | 60% | 40% | −1.3 bands |

It collapses almost everything into A2/B1 (99% of estimates are A1–B1). It never placed a C1
or C2 text above B1, and it is strongly biased against literary language. **Rejected** as a
learner-facing level.

**Decision (Option B/C).** One helper, `lib/readingLevel.ts`, is the only way to read a level:
- **Live news** has no level (`levelUnrated`). The card reads "News · 4 min", with no CEFR and no fit.
- **Levelled readings** (lessons, classics, imports, fallback readings) show their editorial level. Fit is a plain comparison with the reader's chosen level: Easier, Good fit, Challenging or Hard.
- **Ranking:** unrated articles get one neutral level-match value, so the other signals order them. Levelled readings match on their editorial level, not the estimate.
- **Filters:** a level filter never matches an unrated article.
- **Records:** history records "unrated". "Highest level article" ignores news and old records.
- **Fallback:** bundled fallback readings keep their own level.
- **Old caches:** caches from older builds are corrected on read (`settleFeedLevel`). History shows the editorial level looked up by id; stored records are untouched.

The "% of words may be new to you" estimate stays behind •••, worded as an estimate.

## 2. Generator behaviour

| Generator | Emits when | Abstains when | Fallback |
|---|---|---|---|
| Word examples | A curated dictionary example exists, or the word was saved from a sentence | Neither exists | None. The templates ("J'aime X.", "C'est très X.", "Je vois un X.", "On utilise « X »…") are gone: the dictionary has no transitivity, gradability or reliable gender for them, and a substring POS test put adverbs in the verb frame ("J'aime hier."). Template examples saved by older builds are dropped on read; the word and its Review history are kept. A reading sentence is paired with its own translation, never a one-word gloss. |
| Word classes | — | — | `hasWordClass` matches whole words, so "adverb" is not "verb". Applied in word families, inference distractors, word-sheet grammar and the "Common verbs" collection. |
| Gist | The text has a real English summary, and at least two unrelated texts have one too | Provenance-only blurbs ("An unabridged extract (162 words) from…", i.e. all 490 classics); fewer than two genuine distractors | No question. There are no invented backup options; same-story articles are excluded as wrong answers; the answer position is stable per text and not fixed. |
| Tone / stance / confidence | Never | Always: they were keyword counts that could not separate a character's or quoted speaker's feelings from the author's, missed negation, and were applied to classics filed as "news-style" | None. No curated tone questions existed. |
| Grammar notes | Only on positive evidence | être + participle of a verb that does not take être (passive or description); "s'il"; "ne … plus rien que"; "il va cher"; si not right after demander/savoir | Pronominal verbs get a broad, accurate note; "Reciprocal" only with mutuellement / l'un l'autre / entre eux; "Reflexive" only for grooming verbs. The word card no longer gives a past tense for "nous sommes portés" or "elle est belle". |
| Cloze | One content word with at least two options of the same class, same gender and number (nouns), same ending (verbs, adjectives) and same onset (elision), plus a dependable English clue | Proper nouns, numbers, elided forms, function or ambiguous words, too few fair options | No cloze for that sentence. The adjacent-two-word "phrase" cloze was removed. Options are in a stable order. |

## 3. Content changes

**French** (classified ERROR or materially AWKWARD; ACCEPTABLE items left alone):

| ID | Before | After | Why | Confidence |
|---|---|---|---|---|
| starter-a1-035 | rouges, oranges, jaunes, marron | rouges, orange, jaunes et marron | orange is invariable | High |
| starter-a2-153 | Une fois sec, la couleur… | Une fois le mur sec, la couleur… | Dangling modifier | High |
| starter-a1-018 | La route dure une heure. | Le trajet dure une heure. | Collocation | High |
| starter-a2-029 | des choses oubliées | des choses que je ne faisais plus | Meaning | Medium |
| starter-a2-132 | …que dans un magasin neuf | …qu'une veste neuve en magasin | "a new shop" | High |
| starter-a2-070 | 10 h pour moi, 4 h pour lui | 16 h pour moi, 10 h du matin pour lui | The call was at 4 a.m. | High |
| starter-a1-074 | Hier soir, je prépare mon sac. | Mon sac est prêt depuis hier soir. | Tense clash at A1 | High |
| starter-a1-108 | C'est mauvais pour l'odeur | unchanged | ACCEPTABLE (human review) | — |

**Translations:**

| ID | Before | After | Confidence |
|---|---|---|---|
| pd-c2-694 | good fortunes at court | his romantic conquests at court | High |
| pd-c2-720 | returned to his study | went back to the lawyer's office where he worked | High |
| pd-c1-558 | stuck to his lips | kept his lips sealed | High |
| pd-c1-558 | too much spirit for farming, a cursed profession | too clever for farming, a trade cursed by heaven | High |
| pd-b2-480 | these types | these letters | High |
| starter-b2-210 | has gradually weakened | may have gradually weakened | High |
| pd-c1-590 | All moved … devote himself to him | Deeply moved … show his devotion to him | Medium |
| starter-c1-001 | consented vulnerability | willingly accepted vulnerability | Medium |

**Translation binding.** Exactly 14 entries changed; every other entry is byte-identical. All 1,358 live texts carry the hash of their current body.

**Removed:** pd-b1-240 and pd-b1-250 were English editorial notes from a school edition, shipped as "French B1".

## 4. CEFR

CEFR is approximate. The test is whether a text is broadly suitable at its displayed level.
Relabels are listed in `src/data/levelRelabels.ts`. Ids are unchanged, so progress, saved
readings and history still resolve.

| Group | Result |
|---|---|
| Legacy | 3 relabelled: marche-dimanche A1→A2; metro-gratuit and victoire-finale A2→B1 |
| Authored outliers reviewed | 3. Relabelled 2: starter-b1-230 B1→B2, starter-b2-210 B2→C1. starter-a2-167 kept at A2 (borderline; human review). |
| B1 classics screened | All 127 shipped (129 less the 2 English extracts) |
| B1 classics relabelled | 10, all to B2: pd-b1-221, 228, 241, 244, 247, 256, 262, 268, 269, 350 |
| Left borderline | 24 (one strong signal each) plus 277/292/235/238 flagged for review; 93 showed no strong signal |
| C1/C2 | pd-b2-374 B2→C1; pd-c2-667 C2→C1 |
| Human-review deferrals | See `docs/review/content-human-review.md` |

**Journey.** Relabelled lessons leave their old section. Intrinsic difficulty is scored within the
band each text was written for, so A1, A2 and B1 routes are identical to before. Only the final
B2 practice stage and the C1 practice stage gain one text each.

## 5. First reading after the changes

| Level | First reading | Length | Result |
|---|---|---|---|
| A1 | Le réveil de Julien | 1 min, 135 words, 4.7 words/sentence | Pass |
| A2 | Hier, quelle journée ! | 2 min, 199 words | Pass (mild stretch: passé composé + imparfait) |
| B1 | Vivre dans une grande ville | 2 min, 270 words | Pass |
| B2 | Sommes-nous ce que nous faisons ? | 3 min, 344 words | Pass (high B2) |
| C1 | Le débat, une civilisation fragile | 5 min, 575 words | Pass: level-appropriate but dense; opens one paragraph at a time |
| C2 | Les frontières de ma langue | 6 min, 746 words | Pass: heavy as an introduction; opens one paragraph at a time |

No first-section C1/C2 text is shorter without breaking the authored order, so none was swapped.

## 6. Review and copy

- **Session size.** Review sessions default to 20 words; "All" is still one tap away, and a saved choice is respected. A capped session ends with "Session done · N more words are ready" and a "Keep going" button. Schedules are never changed.
- **Phrases.** Phrases have no schedule: "No saved phrases to practise", never "due".
- **Mastery wording.** "Mastered" → "Strong in Review"; "Vocabulary health" → "Your words in Review"; "Need care" → "To practise"; "Best isolated-review candidates" → "Words to practise"; "Forgotten" → "Recently missed" (with factual reasons).
- **Stale and overstated copy.**
  - "Unlimited learning" → "Unlimited saving".
  - The global error no longer promises data is unaffected.
  - "starter bank" → "level".
  - "Ligne B1 · Map" → "B1 path · Map".
  - "Written for beginners" (shown on C2 texts) → "Written for Sorlio".
  - "until this word resolves" → a plain explanation.

## 7. Generated-content caches

| Store | Old content | Mechanism |
|---|---|---|
| `lire.comprehensionQuestions.v1` | Provenance gists, tone questions | Cache version 2 → 3: older bundles fail validation and are rebuilt |
| `lire.savedWords.v1` | Template examples, sentence + one-word gloss | Cleaned on every read (`isRetiredTemplateExample`), including data synced from older devices; the word, translations and Review history are untouched |
| RSS session, offline and default-pool caches; server Redis pool | Blanket B1 | `settleFeedLevel` on every read and in the DTO adapter |
| `lire.archive.v1`, completion records | Estimator CEFR, news "B1" | Display uses the editorial level by id; "Highest level" ignores news; records are untouched |
| Grammar notes, cloze, practice plans | — | Never persisted; always regenerated |
| Dictionary translations | — | Keyed by a hash of the body, so edited texts miss the cache |

No saved words, Review history, completions, account data, imported texts or preferences are deleted.

## 8. Walkthrough findings (fixed)

The production-build walkthrough found three more defects of the same kind, all fixed:

1. **"être porté à".** With the false passé composé gone, the word card still said porter "means to carry" in "Nous sommes portés à…". The phrase bank now reads it as "to be inclined to".
2. **Cached abstentions.** The reader builds questions first from a small local pool, then from the whole library. A "no gist" from the small pool was cached and served for the larger one. Abstentions are no longer cached.
3. **Same-story distractor.** Another outlet's summary of the same story ("A city is testing free public transport…") appeared as a "wrong" gist option. Summaries sharing three or more content words now count as the same story.

## 9. Manual walkthrough (production build, 375×812)

| Flow | Result |
|---|---|
| 1. News | Live articles (fed as an old-build payload with "B1") show "News · 3 min" with no level or fit. Reader header "News - 3 min"; no "Reading difficulty" on completion; History shows no level. Save works; ••• hides More/Less/Prefer/Hide until opened. The fallback classics show their real levels ("B1 · 2 min · Easier" for a C2 reader). |
| 2. Dictionary | hier, vite, souvent, toujours, maison, rouge, prend, dort: no template example anywhere. Saved words store their own reading sentence, never "J'aime hier." |
| 3. Comprehension | Classic (pd-b1-221, now "B2 - 1 min"): no gist, no provenance, no tone. metro-gratuit: a gist with real summaries, answer not first, no same-story option (after fix 3). No tone questions anywhere. |
| 4. Grammar | "portés" card: no tense claim, "to be inclined to" (after fix 1). Practice notes for the C1 opener: only "Reciprocal verb" on "se dénient"; no passé composé note. |
| 5. Onboarding | Reset six times. Two screens, no Premium, account, topic or goal; A1–C2 each open a reading of that level (table in section 5); C1/C2 open one paragraph at a time; no tour. |
| 6. Review | One "Start review"; session length defaults to 20 (All still available); factual labels; viewing changes no schedule. |

## 10. Tests

Final gate on `a8408aa`:
- `node scripts/run-tests.mjs`: 53 suites, 53 passed, 10,684 checks, 0 failed.
- `tsc` 0; `eslint src scripts` 0; `npm audit --omit=dev` 0.
- `next build` passes.
- Translation binding: 1,358 of 1,358.

`scripts/test-content-remediation.mjs` (115 checks) covers items 1–45 of the brief. Updated suites:
- core-logic (gist/tone)
- practice-exercises
- practice-corpus-coverage (no phrase cloze)
- first-run (honest card line)
- public-domain-provenance (relabel length rule)

**Performance.** The cloze gates first made a practice plan about 0.5 s slower (corpus sweep 647 s). Memoised word profiles and a lazy clue check brought cloze down to 25–45 ms per plan (sweep 154 s). The remaining 200–650 ms per plan is the meaning-inference step, which this pass didn't change.

## 11. Commits

| SHA | Commit |
|---|---|
| `e6bc524` | fix: make teaching examples fail closed |
| `050852c` | fix: remove unreliable generated comprehension |
| `f0e438f` | fix: make contextual grammar notes conservative |
| `9861f45` | fix: improve generated practice safeguards |
| `6c423e5` | fix: correct targeted French and translations |
| `2907bea` | fix: calibrate clear reading-level outliers |
| `e52d61c` | fix: make news difficulty honest |
| `f566aab` | fix: clarify review and learning copy |
| `88e2328` | test: teaching correctness and honest levels |
| `3c7d7bd` | fix: read "être porté à" as "to be inclined to" (walkthrough) |
| `66cea72` | fix: don't cache a gist abstention from the reader's first, small pool (walkthrough) |
| `6505745` | fix: recognise the same story by its English summary too (walkthrough) |
| `a8408aa` | perf: memoise cloze word profiles and check the clue lazily |
