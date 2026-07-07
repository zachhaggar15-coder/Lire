import type { ReadingText } from "@/types";

/**
 * Hardcoded sample French reading texts for version 1.
 * Paragraphs within `body` are separated by a blank line.
 */
export const texts: ReadingText[] = [
  {
    id: "metro-gratuit",
    title: "Le métro bientôt gratuit ?",
    category: "news-style",
    difficulty: "A2",
    minutes: 2,
    preview:
      "Une grande ville française étudie la possibilité de rendre les transports gratuits pour tous les habitants.",
    body: `Une grande ville française étudie la possibilité de rendre les transports gratuits. Le maire pense que cette mesure peut réduire la pollution et aider les familles.

Les habitants sont partagés. Certains trouvent l'idée excellente. D'autres se demandent qui va payer.

Une décision sera prise l'année prochaine, après une longue période de discussion.`,
  },
  {
    id: "victoire-finale",
    title: "Une victoire au dernier moment",
    category: "sport",
    difficulty: "A2",
    minutes: 2,
    preview:
      "L'équipe locale gagne le match dans les dernières secondes et le public explose de joie.",
    body: `Hier soir, l'équipe locale a gagné le match dans les dernières secondes. Le stade était plein et l'ambiance était électrique.

Le jeune attaquant a marqué un but magnifique. Les supporters ont crié de joie pendant plusieurs minutes.

L'entraîneur a dit que ses joueurs n'ont jamais abandonné. La prochaine rencontre aura lieu dimanche.`,
  },
  {
    id: "musee-nuit",
    title: "La nuit des musées",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview:
      "Chaque printemps, les musées ouvrent leurs portes gratuitement pendant toute une nuit spéciale.",
    body: `Chaque printemps, de nombreux musées ouvrent leurs portes gratuitement pendant une nuit entière. Les visiteurs peuvent découvrir des œuvres d'art jusqu'au petit matin.

Des artistes proposent aussi des spectacles, de la musique et des ateliers pour les enfants. L'atmosphère est chaleureuse et curieuse.

Cet événement rencontre chaque année un grand succès. Il permet à un public varié de s'intéresser à la culture autrement.`,
  },
  {
    id: "sommeil-cerveau",
    title: "Pourquoi dormir est essentiel",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview:
      "Des chercheurs expliquent comment le sommeil aide le cerveau à mémoriser et à se réparer.",
    body: `Le sommeil n'est pas une simple pause. Pendant la nuit, le cerveau trie les informations de la journée et renforce la mémoire.

Des chercheurs ont montré que le manque de sommeil réduit la concentration et l'humeur. Le corps a aussi besoin de repos pour se réparer.

Les scientifiques conseillent de dormir entre sept et neuf heures par nuit. Un sommeil régulier reste la meilleure solution.`,
  },
  {
    id: "marche-dimanche",
    title: "Un dimanche au marché",
    category: "everyday life",
    difficulty: "A1",
    minutes: 1,
    preview:
      "Le dimanche matin, beaucoup de gens font leurs courses au marché de leur quartier.",
    body: `Le dimanche matin, beaucoup de gens vont au marché. On y trouve des fruits, des légumes, du pain et du fromage.

Les vendeurs saluent les clients avec le sourire. Les prix sont souvent affichés sur de petites pancartes.

Après les courses, certains prennent un café en terrasse. C'est un moment simple et agréable.`,
  },
];

export function getTextById(id: string): ReadingText | undefined {
  return texts.find((t) => t.id === id);
}
