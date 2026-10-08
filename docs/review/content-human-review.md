# Content: human review package

> **MODEL REVIEW ONLY — NO HUMAN SIGN-OFF YET.** Every judgement below was made by the
> remediation pass (October 2026), not by a native speaker or a teacher. Nothing here may be
> described as linguistically verified until a reviewer has filled in the Decision column.

This is the short list of items where a person's judgement is still needed. It is not the
whole corpus: the core library and learning loop were judged broadly sound, and only the
genuinely uncertain items are here.

**Who should review.** For the CEFR rows, someone with experience teaching or assessing French
learners is more useful than native fluency alone. For French naturalness and literary
translation, a native or near-native reader of French.

Reviewer name: ______________________ Background: ______________________ Date: __________

## A. CEFR: changes made (please confirm or reverse)

These were relabelled because the evidence looked strong. Ids keep their old prefix because
progress and history are keyed by id. The full reasons are in `src/data/levelRelabels.ts`.

| ID | Title | Was → now | Main evidence | Decision required |
|---|---|---|---|---|
| marche-dimanche | Un dimanche au marché | A1 → A2 | Relative clauses, subjunctive (avant qu'ils achètent), nine dense paragraphs | Confirm A2 |
| metro-gratuit | Le métro bientôt gratuit ? | A2 → B1 | Conditional throughout, civic vocabulary (impôts locaux) | Confirm B1 |
| victoire-finale | Une victoire au dernier moment | A2 → B1 | aurait été, après avoir concédé, match-report vocabulary | Confirm B1 |
| starter-b1-230 | Les petits gestes suffisent-ils vraiment ? | B1 → B2 | 30–45-word sentences, abstract argument | Confirm B2 (it now reads on the B2 route, not the B1 eco-habits section) |
| starter-b2-210 | La lecture peut-elle encore nous transformer ? | B2 → C1 | 40–60-word sentences, s'y adonne, que ne le supposait | Confirm C1 (now on the C1 route) |
| pd-b1-221 | Le Comte de Monte-Cristo (221) | B1 → B2 | 54-word average sentence, eut disparu | Confirm B2 |
| pd-b1-228 | Le Comte de Monte-Cristo (228) | B1 → B2 | vous eût ouvert, ne … point ×3 | Confirm B2 |
| pd-b1-241 | Le Pays des fourrures (241) | B1 → B2 | pût, fût, risquât; long sentences | Confirm B2 |
| pd-b1-244 | Le Pays des fourrures (244) | B1 → B2 | ne … point ×3, que le convoi n'eût quitté | Confirm B2 |
| pd-b1-247 | Le Tour du monde (247) | B1 → B2 | eût éclaté, ne se fût pas tiré | Confirm B2 |
| pd-b1-256 | Vingt mille lieues (256) | B1 → B2 | N'eût-on pas dit, si grand qu'il fût | Confirm B2 |
| pd-b1-262 | Le Pays des fourrures (262) | B1 → B2 | pour que la neige tombât, ne fût jeté à bas | Confirm B2 |
| pd-b1-268 | Maupassant (268) | B1 → B2 | Dialect in nonstandard spelling (Me v'là not' maître, Ousque t'es) | Confirm B2 — see also suitability, section E |
| pd-b1-269 | Vingt mille lieues (269) | B1 → B2 | étrave, plat-bord, ne l'eût enfin frappée | Confirm B2 |
| pd-b1-350 | Madame Bovary (350) | B1 → B2 | tout bonhomme qu'il fût, à n'y pouvoir tenir | Confirm B2 |
| pd-b2-374 | Le Comte de Monte-Cristo (374) | B2 → C1 | si aride qu'il devienne, ornate imagery, Restoration politics | Confirm C1 |
| pd-c2-667 | Face au drapeau (667) | C2 → C1 | Mostly short, plain adventure dialogue | Confirm C1 |

## B. CEFR: left unchanged, still uncertain

| ID | Title | Level | Passage / concern | Model recommendation | Decision required |
|---|---|---|---|---|---|
| starter-a2-167 | Les dangers des achats impulsifs en ligne | A2 (section capstone) | Short concrete sentences, but j'avais dépensé bien plus que je ne le pensais (pluperfect + expletive ne) and Ils veulent que tu achètes (subjunctive) | Keep A2 as the section's stretch text | Keep A2, or move to B1? |
| pd-b1-277 | Maupassant (277) | B1 | Dense passé simple narrative; je ne sais pourquoi, vous dis-je, s'était laissée mourir | Keep B1, borderline | Keep B1, or B2? |
| pd-b1-292 | Contes de la Bécasse (292) | B1 | Passé simple and conditional, short sentences; also see section E | Keep B1, borderline | Keep B1, or B2? |
| pd-b1-235 | Contes du jour et de la nuit (235) | B1 | Ends in abstract meditation (le néant de tout, morne, étreint), 22-word sentences | Lean B2, not changed | Keep B1, or B2? |
| pd-b1-238 | Le Tour du monde (238) | B1 | Rare concrete vocabulary (cacolets, cornac, lataniers, se jucha) | Keep B1, borderline | Keep B1, or B2? |
| All B1 classics | — | B1 | The audit judged all 12 sampled B1 classics at least slightly hard. A screen of all 127 shipped B1 classics found 10 clear outliers (relabelled, section A), 24 borderline (appendix) and 93 with no strong signal. Passé simple runs through all of them, and B1 and B2 classics scored almost the same on literary signals; they differ mainly in length. | Treat B1 classics as B1+ "stretch" reading; do not move them wholesale | Policy: keep as B1, label as stretch, or move the borderline 24 to B2? |
| C1/C2 boundary | — | C1/C2 | C1 and C2 overlap substantially. Only pd-c2-667 was moved. | Leave the rest | Any other C2 text that is clearly C1? |

## C. French: still needs a native judgement

| ID | Title | Level | Passage | Concern | Model recommendation | Decision required |
|---|---|---|---|---|---|---|
| starter-a1-108 | Grand-mère et ses remèdes | A1 | « C'est mauvais pour l'odeur, dit-elle, mais bon pour le rhume ! » | Understandable but slightly odd; the natural phrase (mauvais pour l'haleine) is above A1 | Keep (classed acceptable) | Keep, or reword? |

The fixes below were made by the model. Please confirm each one reads naturally.

| ID | Before | After | Reason | Decision required |
|---|---|---|---|---|
| starter-a1-035 | Elles sont rouges, oranges, jaunes, marron. | Elles sont rouges, orange, jaunes et marron. | orange is invariable as a colour adjective | Confirm |
| starter-a2-153 | Une fois sec, la couleur était… | Une fois le mur sec, la couleur était… | sec had no referent (the subject is la couleur) | Confirm |
| starter-a1-018 | La route dure une heure. | Le trajet dure une heure. | une route ne dure pas; le trajet dure | Confirm |
| starter-a2-029 | j'ai fait des choses oubliées. | j'ai fait des choses que je ne faisais plus. | "forgotten things" did not say what was meant | Confirm |
| starter-a2-132 | à un prix bien plus bas que dans un magasin neuf. | bien moins chère qu'une veste neuve en magasin. | un magasin neuf is a new shop, not a shop selling new clothes | Confirm |
| starter-a2-070 | Le dimanche matin, à dix heures pour moi et quatre heures pour lui | Le dimanche, à seize heures pour moi et dix heures du matin pour lui | The call was at 4 a.m. in Canada | Confirm |
| starter-a1-074 | Hier soir, je prépare mon sac. | Mon sac est prêt depuis hier soir. | Present tense with hier soir in an A1 text set "today" | Confirm |

## D. Literary translations (English help)

| ID | French | Before | After | Decision required |
|---|---|---|---|---|
| pd-c2-694 | avait eu des bonnes fortunes à la cour | had had good fortunes at court | had had his romantic conquests at court | Confirm |
| pd-c2-720 | Léon rentra à son étude. | Léon returned to his study. | Léon went back to the lawyer's office where he worked. | Confirm |
| pd-c1-558 | la peur … lui collait les lèvres | stuck to his lips | kept his lips sealed | Confirm |
| pd-c1-558 | trop d'esprit pour la culture, métier maudit du ciel | too much spirit for farming, a cursed profession | too clever for farming, a trade cursed by heaven | Confirm |
| pd-b2-480 | ces types qui sont sortis de l'imagination d'un dieu | these types | these letters | Confirm (types = written characters, here runes) |
| starter-b2-210 | aurait progressivement affaibli | has gradually weakened | may have gradually weakened | Confirm the hedge is kept |
| pd-c1-590 | Tout ému, il se demanda … se dévouer pour lui | All moved, … devote himself to him | Deeply moved, … could ever show his devotion to him | Confirm |
| starter-c1-001 | Cette vulnérabilité consentie | This consented vulnerability | This willingly accepted vulnerability | Confirm |

## E. Suitability for ages 13+

| ID | Title | Concern | Model recommendation | Decision required |
|---|---|---|---|---|
| pd-b1-268 | Maupassant (268) | An elderly master demands his servant come down because he "doesn't like sleeping alone"; mild profanity (foutre le camp, nom de D…) | Human decision | OK / Remove |
| pd-b1-292 | Contes de la Bécasse (292) | The narrator seizes a young woman "la dévorant de caresses"; she slips away | Human decision | OK / Remove |

To remove an extract, add it to `CONTENT_EXCLUSIONS` in `scripts/repair-public-domain-contiguity.mjs` (as was done for pd-b1-240 and pd-b1-250, which were English editorial notes, not French).

## F. Grammar notes: deliberately broad wording

The notes now abstain or use broad wording when the construction is uncertain. Please confirm
the broad wording is acceptable.

| Construction | Example | What Sorlio now says | Decision required |
|---|---|---|---|
| Plural pronominal with no "each other" marker | Ils se regardent sans rien dire. | "Pronominal verb" (may be reflexive or reciprocal), not either one | Acceptable? |
| être + passé / mort | Il est passé. Il est mort. | Treated as passé composé (these verbs take être) | Acceptable, or abstain because a state reading is possible? |
| Grooming verbs with a plural subject | Ils se lavent. | "Reflexive verb" | Acceptable? |

## Appendix: borderline B1 classics (screen, not a verdict)

A transparent screen, not a CEFR classifier: it counts imperfect subjunctive, ne … point/guère,
nonstandard spelling and average sentence length. One signal = borderline.

| ID | Signal |
|---|---|
| pd-b1-223 | 22-word sentences |
| pd-b1-226 | imperfect subjunctive (fût) |
| pd-b1-229 | imperfect subjunctive (fût) |
| pd-b1-235 | 22-word sentences |
| pd-b1-236 | imperfect subjunctive (eût, eût) |
| pd-b1-238 | imperfect subjunctive (tirât) |
| pd-b1-248 | imperfect subjunctive (eût) |
| pd-b1-260 | imperfect subjunctive (fût) |
| pd-b1-266 | imperfect subjunctive (rapprochât) |
| pd-b1-278 | imperfect subjunctive (eussent) |
| pd-b1-298 | 22-word sentences |
| pd-b1-302 | imperfect subjunctive (croulât) |
| pd-b1-310 | imperfect subjunctive (eussent) |
| pd-b1-311 | imperfect subjunctive (eût, eût) |
| pd-b1-312 | ne … point/guère ×2 |
| pd-b1-316 | imperfect subjunctive (eût) |
| pd-b1-318 | imperfect subjunctive (eût) |
| pd-b1-320 | imperfect subjunctive (eût, inquiétât) |
| pd-b1-332 | imperfect subjunctive (essayât) |
| pd-b1-337 | imperfect subjunctive (regardât) |
| pd-b1-340 | imperfect subjunctive (eût) |
| pd-b1-343 | imperfect subjunctive (eût) |
| pd-b1-345 | imperfect subjunctive (jetât) |
| pd-b1-347 | imperfect subjunctive (eusse) |
