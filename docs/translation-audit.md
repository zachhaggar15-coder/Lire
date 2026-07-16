# Translation Audit - 2026-07-16

## Scope

Audited the French translation path from article text through tokenization, local lookup, phrase detection, contextual word-sheet display, AI fallback, and local cache keys. The fix keeps tap-to-translate local-first: no automatic AI call is added, and the existing "Ask AI for nuance" action remains explicit.

## Issues Found And Fixed

- Word taps displayed the first base dictionary gloss as the main answer, even when the sentence made a phrase, idiom, pronoun, contraction, or grammatical form more important.
- Context was only used for a small adjacent phrase lookup. It did not surface selected text, full sentence, phrase expansion, lemma, part of speech, grammar, alternatives, source, or confidence in one structured result.
- The containing-phrase matcher accepted any multi-word window if lookup guessed a lemma, which could make a full clause like `a-t-il compris la question` look like a phrase. It now only accepts true phrase-like dictionary entries.
- `d'accord` resolved through the bare noun `accord`; it is now in the phrase bank and has contextual handling as `okay / agreed`.
- Contextual cache keys are now available for word-level contextual meanings and include selected text, normalized sentence, expanded phrase, and lemma so repeated words in different sentences do not collide.
- Second pass: phrase recognition now tolerates safe accentless imported text, elided auxiliaries like `j'ai`, and article/preposition contractions like `aux` hiding a phrase ending in `à`.
- Second pass: contextual sense selection now covers more common traps including `manquer`, `voler`, `louer`, `assister à`, `apprendre`, `défendre`, `prévenir`, `propre`, `ancien`, `plus`, `personne`, `encore`, `toujours`, `sensible`, `librairie`, `occasion`, `devoir`, and `réaliser`.
- Third pass: the nearby-context window now counts actual words instead of raw tokens, so spaces and punctuation no longer shrink the useful context around a selected word.
- Third pass: containing-phrase lookup no longer accepts a bare one-word conjunction as proof that a larger selected window is a valid phrase, preventing false matches in text such as `les soldes d'été`.
- Third pass: contextual sense selection now has a declarative rule layer for broader false-friend and polysemy coverage without burying every new case in bespoke control flow.

## New Behavior

- `Reader` builds a `ContextualTranslationResult` on every word tap using the selected token, sentence, neighbor sentences, local lookup, phrase bank, and grammar heuristics.
- `WordSheet` now prioritizes a "Meaning here" card above "Base dictionary". It shows confidence/source, expanded phrase, grammar chips, standalone dictionary meaning, alternatives, and a short explanation.
- Phrase-aware behavior is shared with word taps, so tapping inside expressions such as `se rend compte`, `mettre fin à`, or `en avoir marre` shows the expression meaning first.
- Local rules handle apostrophes, contractions, hyphenated inversion, imperative pronoun attachment, compound tenses, imperfect/future/conditional/subjunctive/imperative forms, adjective agreement, pronouns, false friends, polysemy, negation, proper nouns, headlines, and malformed residual HTML.
- The phrase bank now auto-generates safe apostrophe/accent/hyphen variants for phrase forms, and phrase lookup tries limited normalized candidates while still requiring phrase-like dictionary metadata before accepting a match.
- Phrase coverage is substantially broader across connectors, chronology, legal/news wording, support-verb constructions, reflexive verbs, quantity phrases, question markers, and common prepositional expressions.
- Context rules now rescue frequent forms that the base dictionary may classify as nouns before verb context is considered, such as `porte`, `pose`, `compte`, and `relève`.

## Validation Coverage

Added `scripts/test-contextual-translation.mjs` and wired it into `npm test`. The suite covers:

- Apostrophes and contractions: `j'ai`, `c'est` with curly apostrophe, `qu'il`, `l'homme`, `d'accord`, `au`, `du`.
- Hyphenated forms: `a-t-il`, `parlez-en`.
- Reflexive and fixed expressions: `se rend compte`, `mettre fin à`, `en avoir marre`.
- Verb grammar: compound tense, imperfect, future, conditional, subjunctive, imperative.
- Agreement: `ouvertes` as feminine plural.
- Pronouns: `y`, `en`, `le`, `lui`, `leur`.
- Polysemy and false friends: `actuel`, `recette`, `parti`, `cours`, `tour`, `entendre`, `servir`, `attendre`.
- Negation, proper nouns, headline fragments, missing fallback, residual HTML, and context-sensitive cache keys.
- Second-pass phrase coverage: `avoir envie de`, `avoir besoin de` after `j'ai`, `mettre l'accent sur`, `rendre hommage à`, `garde à vue`, and single-token `c'est-à-dire`.
- Second-pass contextual coverage: missing accents in imported text, `aux`/`du` contractions inside phrase matching, and the added false-friend/polysemy rules listed above.
- Third-pass phrase coverage includes examples such as `entrer en vigueur`, `mettre en évidence`, `il s'agit de`, `porter atteinte à`, `prendre des mesures`, `être au courant de`, `est-ce que`, `qu'est-ce que`, `compte tenu de`, and `à l'égard de`.
- Third-pass contextual coverage includes `actuellement`, `éventuel`, `déception`, `location`, `préservatif`, `stage`, `car`, `demande`, `avis`, `chance`, `temps`, `milieu`, `moyen`, `droit`, `porter`, `poser`, `conduire`, `arriver`, `tomber`, `compter`, `gagner`, `relever`, `rapport`, `pièce`, `bureau`, `poste`, `essence`, `solde`, `formation`, `manifestation`, `frais`, `exercice`, `critique`, and `données sensibles`.

## Manual Validation Notes

The local pipeline was manually exercised with representative sentences before committing the regression script. Examples checked:

- `J'ai attendu le bus.` -> `I have`.
- `A-t-il compris la question ?` -> inversion/question grammar.
- `Parlez-en demain.` -> imperative with attached `en`.
- `Elle se rend compte du probleme.` -> `to realize`.
- `Il a pris le train.` -> `took / has taken`, passe compose.
- `Le parti annonce son programme.` vs `Il est parti hier.` -> separate contextual meanings and separate cache keys.

## Verification Run

- `npm test`
- `npm run lint`
- `npm run build`
