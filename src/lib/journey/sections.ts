import type { Difficulty } from "@/types";

/**
 * Explicit, hand-authored themed sections for the journey ladder.
 *
 * The rest of a band is grouped into stages automatically, by intrinsic
 * difficulty (see ladder.ts). That's fine for a general pool, but it can't
 * build a *themed* progression where one article introduces a set of words and
 * the next few reuse them with rising complexity. These sections do exactly
 * that: each is a fixed, ordered set of texts on one topic, written so the
 * first text introduces the core vocabulary simply and the later texts recycle
 * it while the grammar and sentences get harder.
 *
 * A section becomes one stage, placed at the FRONT of its band (ahead of the
 * difficulty-sorted stages), in the order listed here — so a learner meets the
 * curated, vocabulary-building sections first. `textIds` order is authoritative
 * and is NOT re-sorted by difficulty; it is the intended reading order.
 */
export interface JourneySection {
  id: string;
  band: Difficulty;
  title: string;
  goal: string;
  textIds: string[];
}

export const JOURNEY_SECTIONS: JourneySection[] = [
  {
    id: "b1-work",
    band: "B1",
    title: "Work & careers",
    goal: "Talk about jobs, interviews and working life; build core work vocabulary.",
    textIds: [
      "starter-b1-041", // Mon premier emploi (introduces the core words)
      "starter-b1-042", // L'entretien d'embauche
      "starter-b1-043", // Une journée de télétravail
      "starter-b1-044", // Changer de métier
      "starter-b1-045", // Les petits boulots (hardest)
    ],
  },
  {
    id: "b1-health",
    band: "B1",
    title: "Everyday health",
    goal: "Read about sleep, food, exercise and the body; reuse health vocabulary.",
    textIds: [
      "starter-b1-046", // Bien dormir (introduces the core words)
      "starter-b1-047", // Manger sainement sans se compliquer
      "starter-b1-048", // Bouger un peu chaque jour
      "starter-b1-049", // Gérer le stress
      "starter-b1-050", // Chez le médecin (hardest)
    ],
  },
  {
    id: "b2-money",
    band: "B2",
    title: "Money & everyday life",
    goal: "Discuss budgeting, saving, credit and value with nuanced argument.",
    textIds: [
      "starter-b2-041", // Faire un budget (introduces the core words)
      "starter-b2-042", // Économiser sans se priver
      "starter-b2-043", // Le piège du crédit
      "starter-b2-044", // Faut-il parler d'argent ?
      "starter-b2-045", // L'argent et le temps (hardest)
    ],
  },
  {
    id: "b2-environment",
    band: "B2",
    title: "The environment & you",
    goal: "Explain climate, waste and energy; weigh individual vs collective action.",
    textIds: [
      "starter-b2-046", // Comprendre le réchauffement climatique (introduces the core words)
      "starter-b2-047", // La montagne de nos déchets
      "starter-b2-048", // D'où vient notre énergie ?
      "starter-b2-049", // Consommer autrement
      "starter-b2-050", // Un seul geste suffit-il ? (hardest)
    ],
  },
];

/** Every text id that belongs to an explicit themed section (so the difficulty-sorted grouping can skip them). */
export function sectionedTextIds(): Set<string> {
  return new Set(JOURNEY_SECTIONS.flatMap((section) => section.textIds));
}
