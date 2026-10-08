import type { Difficulty } from "@/types";

/**
 * Readings whose CEFR level was changed after review (October 2026), with the
 * level they were written or cut for and why they moved. CEFR is approximate:
 * these are clear outliers, judged on vocabulary, syntax, literary forms and
 * how much the passage depends on outside context, not an exact score.
 * Borderline cases were left alone and are listed for a teacher's review in
 * docs/review/content-human-review.md.
 *
 * Ids keep their original prefix (pd-b1-…) because progress, saved readings
 * and history are keyed by id. A classic extract keeps the length it was cut
 * to for `from`, which the provenance test allows for.
 */
export interface LevelRelabel {
  from: Difficulty;
  to: Difficulty;
  reason: string;
}

export const LEVEL_RELABELS: Record<string, LevelRelabel> = {
  // Original texts
  "marche-dimanche": { from: "A1", to: "A2", reason: "Relative clauses, subjunctive (avant qu'ils achètent), pronominal y (s'y retrouvent) and nine dense paragraphs." },
  "metro-gratuit": { from: "A2", to: "B1", reason: "Conditional throughout (pourrait, permettrait, étudieraient) and civic vocabulary (impôts locaux, compenser la perte de revenus)." },
  "victoire-finale": { from: "A2", to: "B1", reason: "Past conditional (aurait été), après avoir + participle, match-report vocabulary." },
  "starter-b1-230": { from: "B1", to: "B2", reason: "30–45-word sentences, abstract argument about structural and collective responsibility." },
  "starter-b2-210": { from: "B2", to: "C1", reason: "40–60-word sentences, formal register (s'y adonne, que ne le supposait), sustained abstraction." },

  // Classic extracts
  "pd-b1-221": { from: "B1", to: "B2", reason: "54-word average sentence, passé antérieur (eut disparu), plutôt qu'elle ne les descendit." },
  "pd-b1-228": { from: "B1", to: "B2", reason: "Pluperfect subjunctive (vous eût ouvert), ne … point three times, abstract narration." },
  "pd-b1-241": { from: "B1", to: "B2", reason: "Imperfect subjunctive (le pis qui pût arriver, fût emporté, risquât), long sentences." },
  "pd-b1-244": { from: "B1", to: "B2", reason: "ne … point three times, pluperfect subjunctive (que le convoi n'eût quitté)." },
  "pd-b1-247": { from: "B1", to: "B2", reason: "Pluperfect subjunctive as past conditional (eût éclaté, ne se fût pas tiré), dated vocabulary." },
  "pd-b1-256": { from: "B1", to: "B2", reason: "N'eût-on pas dit, si grand qu'il fût, le sans-façon: literary concessive and inversion." },
  "pd-b1-262": { from: "B1", to: "B2", reason: "Subjunctive after pour que and craindre que (tombât, ne fût jeté), dense ice and weather vocabulary." },
  "pd-b1-268": { from: "B1", to: "B2", reason: "Dialect speech in nonstandard spelling (Me v'là not' maître, Ousque t'es, j'suis)." },
  "pd-b1-269": { from: "B1", to: "B2", reason: "Technical nautical vocabulary (étrave, plat-bord, lardait de coups de harpon), ne l'eût enfin frappée." },
  "pd-b1-350": { from: "B1", to: "B2", reason: "Concessive imperfect subjunctive (tout bonhomme qu'il fût), à n'y pouvoir tenir, ne … point." },
  "pd-b2-374": { from: "B2", to: "C1", reason: "Ornate imagery, concessive si aride qu'il devienne, relies on Restoration politics (bonapartistes)." },
  "pd-c2-667": { from: "C2", to: "C1", reason: "Mostly short, plain adventure dialogue; nothing that needs C2." },
};
