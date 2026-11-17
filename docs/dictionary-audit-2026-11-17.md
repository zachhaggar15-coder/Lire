# Article dictionary audit — 17 November 2026

The audit enumerates every word occurrence in all 1,358 bundled French articles, including their titles. For each occurrence, `scripts/audit-corpus-meanings.mjs` records the dictionary lemma, first and alternative glosses, the meaning the reader would display, its source and confidence, and the article's precomputed English phrase alignment when available. The full occurrence log and grouped review reports are generated in `.cache/dictionary-audit-2026-11-17/` (ignored by Git).

## How to reproduce

```sh
npm run audit:dictionary
node --import ./scripts/register-alias-loader.mjs scripts/audit-corpus-meanings.mjs
node scripts/suggest-corpus-senses.mjs
npm run audit:resolver
```

## Findings

The coverage audit inspected 427,165 word occurrences; 323,446 were classified as content-word occurrences. After correcting common forms and misleading first senses, 0.38% of content-word occurrences were missing a dictionary answer. The 1,044 distinct missing forms include names, numerals, foreign text and uncommon literary vocabulary. They remain in the review report rather than receiving guessed English glosses.

The final occurrence scan found 1,873 missing lookup occurrences (0.44% of all word occurrences) and 1,557 displayed meanings where the resolver abstained (0.36%). It recorded 414,032 occurrences covered by a precomputed English phrase alignment, but only 3,552 had a one-word alignment. The displayed meaning came from a curated dictionary in 176,598 cases, a context rule in 99,141, a phrase in 37,816, a natural alignment in 46,966 and the generated dictionary in 65,087. The scan flagged 14,992 same-spelling English glosses for review; many are legitimate cognates.

The English phrase alignments are useful independent clues, but cannot certify a word sense: natural translations can combine words, omit words and change word order. The generated dictionary also offers multiple senses without reliable frequency ordering. `sense-suggestions.json` contains 603 cases where a later sense agrees with an article alignment more often than the first sense; these include ordinary synonyms and are editorial candidates, not automatically confirmed errors.

This is a complete **occurrence inventory and automated check**, not a claim that a human has certified all 427,165 meanings. In particular, unresolved words and generated senses in the review queue still need editorial attention. The checked corrections in this release target frequent words where the article context and English meaning were clear. New regression checks pin those first glosses and preserve richer curated entries.
