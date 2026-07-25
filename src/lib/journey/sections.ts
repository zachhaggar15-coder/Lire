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
    id: "a1-day",
    band: "A1",
    title: "My day",
    goal: "Talk about a daily routine: waking, working, eating, going to bed.",
    textIds: [
      "starter-a1-039", // Le réveil de Julien (introduces the routine verbs)
      "starter-a1-040", // Julien au bureau
      "starter-a1-041", // Le soir chez Julien
      "starter-a1-042", // Le samedi de Julien
      "starter-a1-043", // Un lundi difficile (hardest)
    ],
  },
  {
    id: "a1-table",
    band: "A1",
    title: "At the table",
    goal: "Describe meals, cooking and eating together.",
    textIds: [
      "starter-a1-044", // Le déjeuner du dimanche (introduces food words)
      "starter-a1-045", // Je prépare une soupe
      "starter-a1-046", // Le goûter à quatre heures
      "starter-a1-047", // Au restaurant pour un anniversaire
      "starter-a1-048", // Qu'est-ce qu'il y a dans le frigo ?
    ],
  },
  {
    id: "a1-town",
    band: "A1",
    title: "My town",
    goal: "Describe a neighbourhood, its shops, and how to give directions.",
    textIds: [
      "starter-a1-049", // Mon quartier (introduces place words)
      "starter-a1-050", // La boulangerie de ma rue
      "starter-a1-051", // Où est la pharmacie ? (directions)
      "starter-a1-052", // La bibliothèque de la ville
      "starter-a1-053", // Le marché du mercredi
    ],
  },
  {
    id: "a1-people",
    band: "A1",
    title: "Family and friends",
    goal: "Introduce people, describe them, and talk about relationships.",
    textIds: [
      "starter-a1-054", // Ma famille (introduces family words)
      "starter-a1-055", // Mon meilleur ami
      "starter-a1-056", // Le bébé de ma cousine
      "starter-a1-057", // Les cousins arrivent
      "starter-a1-058", // La photo de mariage
    ],
  },
  {
    id: "a1-freetime",
    band: "A1",
    title: "Free time",
    goal: "Say what you like doing: music, films, hobbies and games.",
    textIds: [
      "starter-a1-059", // J'écoute de la musique (introduces leisure verbs)
      "starter-a1-060", // Le cours de dessin
      "starter-a1-061", // Un film le samedi soir
      "starter-a1-062", // J'apprends la guitare
      "starter-a1-063", // La soirée jeux
    ],
  },
  {
    id: "a1-transport",
    band: "A1",
    title: "Getting around",
    goal: "Travel by bike, train, car and on foot; buy a ticket.",
    textIds: [
      "starter-a1-064", // Je vais au travail à vélo (introduces transport words)
      "starter-a1-065", // À la gare
      "starter-a1-066", // Le voyage en train
      "starter-a1-067", // La vieille voiture de mon père
      "starter-a1-068", // Marcher en ville
    ],
  },
  {
    id: "a1-home",
    band: "A1",
    title: "At home",
    goal: "Describe rooms, furniture, tidying and moving house.",
    textIds: [
      "starter-a1-069", // Ma chambre (introduces house words)
      "starter-a1-070", // Le grand ménage
      "starter-a1-071", // Une étagère à monter
      "starter-a1-072", // Les plantes de la maison
      "starter-a1-073", // Ma sœur déménage
    ],
  },
  {
    id: "a1-school",
    band: "A1",
    title: "At school",
    goal: "Talk about lessons, subjects, tests and school life.",
    textIds: [
      "starter-a1-074", // Le jour de la rentrée (introduces school words)
      "starter-a1-075", // Ma matière préférée
      "starter-a1-076", // Le contrôle de maths
      "starter-a1-077", // À la cantine
      "starter-a1-078", // Le voyage scolaire
    ],
  },
  {
    id: "a1-shopping",
    band: "A1",
    title: "Shopping",
    goal: "Make a list, compare prices, pay, and buy clothes and gifts.",
    textIds: [
      "starter-a1-079", // La liste de courses (introduces shopping words)
      "starter-a1-080", // Au supermarché
      "starter-a1-081", // Combien ça coûte ?
      "starter-a1-082", // J'achète un manteau
      "starter-a1-083", // Un cadeau pour maman
    ],
  },
  {
    id: "a1-weather",
    band: "A1",
    title: "The weather",
    goal: "Describe the weather and the seasons through the year.",
    textIds: [
      "starter-a1-084", // Quel temps fait-il ? (introduces weather words)
      "starter-a1-085", // Une journée de grand soleil
      "starter-a1-086", // Le vent d'automne
      "starter-a1-087", // Le premier jour de froid
      "starter-a1-088", // Le printemps arrive
    ],
  },
  {
    id: "a1-animals",
    band: "A1",
    title: "Animals",
    goal: "Talk about pets, farm animals and wildlife.",
    textIds: [
      "starter-a1-089", // Les oiseaux du balcon (introduces animal words)
      "starter-a1-090", // Une visite à la ferme
      "starter-a1-091", // Le poisson rouge
      "starter-a1-092", // Les animaux de la forêt
      "starter-a1-093", // Le refuge pour animaux
    ],
  },
  {
    id: "a1-french-life",
    band: "A1",
    title: "Life in France",
    goal: "Meet French customs and compare them with British habits.",
    textIds: [
      "starter-a1-094", // Bonjour et la bise (introduces custom words)
      "starter-a1-095", // Les repas en France
      "starter-a1-096", // Le dimanche, tout est fermé
      "starter-a1-097", // Les vacances scolaires
      "starter-a1-098", // Le café français et le thé anglais
    ],
  },
  {
    id: "a2-past",
    band: "A2",
    title: "Telling the past",
    goal: "Recount past events with the passé composé and imparfait.",
    textIds: [
      "starter-a2-038", // Hier, quelle journée ! (introduces past-tense narration)
      "starter-a2-039", // Le week-end dernier
      "starter-a2-040", // Mon premier jour dans cette ville
      "starter-a2-041", // Un souvenir d'enfance (imparfait for habits)
      "starter-a2-042", // Le jour où j'ai changé d'avis (hardest)
    ],
  },
  {
    id: "a2-food",
    band: "A2",
    title: "Cooking and eating out",
    goal: "Talk about recipes, restaurants and eating with other people.",
    textIds: [
      "starter-a2-043", // J'ai essayé une nouvelle recette (introduces cooking words)
      "starter-a2-044", // Le petit restaurant du coin
      "starter-a2-045", // Un dîner chez des amis
      "starter-a2-046", // Le poissonnier du marché
      "starter-a2-047", // J'ai raté mon gâteau
    ],
  },
  {
    id: "a2-errands",
    band: "A2",
    title: "Errands in town",
    goal: "Handle everyday admin: post office, bank, hairdresser, lost property.",
    textIds: [
      "starter-a2-048", // Une longue liste de choses à faire (introduces errand words)
      "starter-a2-049", // À la poste
      "starter-a2-050", // Chez le coiffeur
      "starter-a2-051", // Un problème à la banque
      "starter-a2-052", // Le bureau des objets trouvés
    ],
  },
  {
    id: "a2-firstjobs",
    band: "A2",
    title: "First jobs",
    goal: "Describe summer jobs, interviews, training and colleagues.",
    textIds: [
      "starter-a2-053", // Mon job d'été (introduces work words at A2)
      "starter-a2-054", // Un entretien pour un petit boulot
      "starter-a2-055", // Retourner à l'école à trente ans
      "starter-a2-056", // Mon stage en entreprise
      "starter-a2-057", // Le collègue qui m'a aidé
    ],
  },
  {
    id: "a2-money",
    band: "A2",
    title: "Money",
    goal: "Budget, compare prices, buy second-hand, and talk about lending.",
    textIds: [
      "starter-a2-058", // J'ai fait mon premier budget (introduces money words at A2)
      "starter-a2-059", // C'est la période des soldes
      "starter-a2-060", // J'achète beaucoup d'occasion
      "starter-a2-061", // Un achat que je regrette
      "starter-a2-062", // Prêter de l'argent à un ami
    ],
  },
  {
    id: "a2-trip",
    band: "A2",
    title: "A short trip",
    goal: "Book, arrive, explore and get home again — travel from start to finish.",
    textIds: [
      "starter-a2-063", // Nous avons réservé un week-end (introduces travel words)
      "starter-a2-064", // L'arrivée à l'hôtel
      "starter-a2-065", // Visiter une ville inconnue
      "starter-a2-066", // Notre train a été annulé
      "starter-a2-067", // Les photos du voyage
    ],
  },
  {
    id: "a2-friends",
    band: "A2",
    title: "Friends and feelings",
    goal: "Describe friendships, arguments, distance and how you feel.",
    textIds: [
      "starter-a2-068", // Comment j'ai rencontré mes amis (introduces relationship words)
      "starter-a2-069", // Nous nous sommes disputés
      "starter-a2-070", // Mon ami est parti à l'étranger
      "starter-a2-071", // Un ami qui traverse une période difficile
      "starter-a2-072", // Dire ce que l'on ressent (hardest)
    ],
  },
  {
    id: "a2-weather",
    band: "A2",
    title: "Weather and seasons",
    goal: "Describe extreme weather and notice how the seasons are shifting.",
    textIds: [
      "starter-a2-073", // L'été où il a fait très chaud (levels up A1 weather words)
      "starter-a2-074", // La tempête de novembre
      "starter-a2-075", // Un hiver sans neige
      "starter-a2-076", // Le printemps est arrivé trop tôt
      "starter-a2-077", // Le climat a changé ici (hardest)
    ],
  },
  {
    id: "a2-neighbours",
    band: "A2",
    title: "Home and neighbours",
    goal: "Live alongside other people: noise, shared decisions, small favours.",
    textIds: [
      "starter-a2-078", // J'ai emménagé dans un immeuble (levels up A1 At home)
      "starter-a2-079", // Le bruit du voisin du dessus
      "starter-a2-080", // La réunion des voisins
      "starter-a2-081", // J'ai gardé le chat de ma voisine
      "starter-a2-082", // Le jardin partagé de l'immeuble
    ],
  },
  {
    id: "a2-health",
    band: "A2",
    title: "Health",
    goal: "Describe illness, pain and treatment; talk to doctors and dentists.",
    textIds: [
      "starter-a2-083", // Je suis tombée malade (introduces health words at A2)
      "starter-a2-084", // Chez le dentiste
      "starter-a2-085", // Je me suis fait mal au dos
      "starter-a2-086", // Mon frère a arrêté de fumer
      "starter-a2-087", // La visite médicale au travail
    ],
  },
  {
    id: "a2-hobbies",
    band: "A2",
    title: "Sport and hobbies",
    goal: "Join a club, follow a sport, collect, read — talk about what you do for pleasure.",
    textIds: [
      "starter-a2-088", // Je me suis inscrite à un club (levels up A1 Free time)
      "starter-a2-089", // Le match de mon fils
      "starter-a2-090", // Ma collection de vieux disques
      "starter-a2-091", // J'ai recommencé à courir
      "starter-a2-092", // Le club de lecture
    ],
  },
  {
    id: "a2-technology",
    band: "A2",
    title: "Technology",
    goal: "Handle phones, the internet, notifications, scams and working from home.",
    textIds: [
      "starter-a2-093", // J'ai acheté un nouveau téléphone (introduces tech words)
      "starter-a2-094", // Ma mère apprend à utiliser internet
      "starter-a2-095", // Trop de messages
      "starter-a2-096", // Une arnaque par téléphone
      "starter-a2-097", // Le télétravail chez moi
    ],
  },
  {
    id: "a2-nature",
    band: "A2",
    title: "Nature and animals",
    goal: "Notice wildlife, gardens, forests and the sea — and how they are changing.",
    textIds: [
      "starter-a2-098", // Les hérissons du jardin (levels up A1 Animals)
      "starter-a2-099", // La forêt près de chez nous
      "starter-a2-100", // Mon balcon pour les abeilles
      "starter-a2-101", // Le chien que nous avons adopté
      "starter-a2-102", // Une sortie à la mer en hiver
    ],
  },
  {
    id: "a2-future",
    band: "A2",
    title: "Plans and the future",
    goal: "Talk about what you are going to do: projects, moving, retirement, ambitions.",
    textIds: [
      "starter-a2-103", // Mes projets pour l'année prochaine (introduces futur proche)
      "starter-a2-104", // Nous allons déménager
      "starter-a2-105", // Quand je serai à la retraite (futur simple)
      "starter-a2-106", // Ma fille veut devenir vétérinaire
      "starter-a2-107", // Si j'avais plus de temps (hardest)
    ],
  },
  {
    id: "a2-localnews",
    band: "A2",
    title: "Local news",
    goal: "Read short local reports: transport, schools, markets and public works.",
    textIds: [
      "starter-a2-108", // La nouvelle ligne de tram (introduces reporting style)
      "starter-a2-109", // L'école du village va fermer
      "starter-a2-110", // Un marché de producteurs le jeudi
      "starter-a2-111", // La bibliothèque prête aussi des outils
      "starter-a2-112", // Le pont sera fermé cet été
    ],
  },
  {
    id: "a2-france-britain",
    band: "A2",
    title: "France and Britain",
    goal: "Compare French and British habits: tu/vous, work, health, humour, queueing.",
    textIds: [
      "starter-a2-113", // Le tutoiement et le vouvoiement (levels up A1 Life in France)
      "starter-a2-114", // Le travail et les vacances
      "starter-a2-115", // Aller chez le médecin en France
      "starter-a2-116", // L'humour français et l'humour anglais
      "starter-a2-117", // Deux façons de faire la queue
    ],
  },
  {
    id: "b1-city",
    band: "B1",
    title: "City living",
    goal: "Weigh up urban life: cost, housing, green space, nights and leaving.",
    textIds: [
      "starter-b1-051", // Vivre dans une grande ville (introduces urban vocabulary)
      "starter-b1-052", // Le prix du logement
      "starter-b1-053", // Pourquoi les villes plantent des arbres
      "starter-b1-054", // La ville la nuit
      "starter-b1-055", // Faut-il quitter la ville ?
    ],
  },
  {
    id: "b1-travel",
    band: "B1",
    title: "Travel",
    goal: "Think about how we travel: slowly, by train, with a few words of the language.",
    textIds: [
      "starter-b1-056", // Voyager moins, mais mieux (levels up A2 A short trip)
      "starter-b1-057", // Quand le tourisme dérange les habitants
      "starter-b1-058", // Le retour du train de nuit
      "starter-b1-059", // Apprendre quelques mots avant de partir
      "starter-b1-060", // Ce qu'on rapporte d'un voyage
    ],
  },
  {
    id: "b1-money",
    band: "B1",
    title: "Money and choices",
    goal: "Understand why we spend, build a buffer, repair, and judge real value.",
    textIds: [
      "starter-b1-061", // Pourquoi nous dépensons sans le vouloir (levels up A2 Money)
      "starter-b1-062", // L'épargne de précaution
      "starter-b1-063", // Réparer plutôt que remplacer
      "starter-b1-064", // Les abonnements qu'on oublie
      "starter-b1-065", // Le prix des choses n'est pas leur valeur
    ],
  },
  {
    id: "b1-tech",
    band: "B1",
    title: "Technology in daily life",
    goal: "Attention, digital exclusion, children and phones, AI, and personal data.",
    textIds: [
      "starter-b1-066", // Nos téléphones captent notre attention (levels up A2 Technology)
      "starter-b1-067", // Qui n'a pas accès au numérique ?
      "starter-b1-068", // Faut-il donner un téléphone à un enfant ?
      "starter-b1-069", // L'intelligence artificielle au quotidien
      "starter-b1-070", // Ce que nos données racontent de nous
    ],
  },
  {
    id: "b1-food",
    band: "B1",
    title: "Food culture",
    goal: "Discuss meals, origins, waste, meat and cooking as a skill.",
    textIds: [
      "starter-b1-071", // Le repas français est-il en train de changer ? (levels up A2 Cooking)
      "starter-b1-072", // D'où vient ce que nous mangeons ?
      "starter-b1-073", // Le gaspillage alimentaire
      "starter-b1-074", // Manger moins de viande
      "starter-b1-075", // Cuisiner, une compétence qui se perd ?
    ],
  },
  {
    id: "b1-relationships",
    band: "B1",
    title: "Relationships",
    goal: "Friendship in adulthood, living alone, conflict, ageing parents, distance.",
    textIds: [
      "starter-b1-076", // Les amitiés à l'âge adulte (levels up A2 Friends and feelings)
      "starter-b1-077", // Vivre seul, est-ce un problème ?
      "starter-b1-078", // Les disputes utiles
      "starter-b1-079", // Quand les parents vieillissent
      "starter-b1-080", // Rester en contact quand on est loin
    ],
  },
  {
    id: "b1-environment",
    band: "B1",
    title: "The environment",
    goal: "Weigh which actions matter, insulation, water, cycling and climate anxiety.",
    textIds: [
      "starter-b1-081", // Les gestes qui comptent vraiment (levels up A2 Nature)
      "starter-b1-082", // Isoler les logements
      "starter-b1-083", // L'eau va-t-elle manquer ?
      "starter-b1-084", // Le retour du vélo en ville
      "starter-b1-085", // L'éco-anxiété
    ],
  },
  {
    id: "b1-learning",
    band: "B1",
    title: "Learning",
    goal: "How adults learn, why we forget, reading, training and the role of mistakes.",
    textIds: [
      "starter-b1-086", // Apprendre à tout âge (introduces learning vocabulary)
      "starter-b1-087", // Pourquoi nous oublions
      "starter-b1-088", // La lecture rend-elle plus intelligent ?
      "starter-b1-089", // Se former quand on travaille déjà
      "starter-b1-090", // L'erreur fait partie de l'apprentissage
    ],
  },
  {
    id: "b1-media",
    band: "B1",
    title: "Media and information",
    goal: "Understand how news is made, checked, funded and filtered.",
    textIds: [
      "starter-b1-091", // Comment se fabrique une information (levels up A2 Local news)
      "starter-b1-092", // Vérifier avant de partager
      "starter-b1-093", // Pourquoi les mauvaises nouvelles dominent
      "starter-b1-094", // Qui paie l'information ?
      "starter-b1-095", // Nous ne voyons pas tous la même chose
    ],
  },
  {
    id: "b1-body",
    band: "B1",
    title: "Sport and the body",
    goal: "Movement and health, women's sport, body image, injury and school PE.",
    textIds: [
      "starter-b1-096", // Bouger, même un peu (levels up A2 Sport and hobbies)
      "starter-b1-097", // Le sport féminin gagne du terrain
      "starter-b1-098", // Le corps et l'image de soi
      "starter-b1-099", // Les blessures des sportifs amateurs
      "starter-b1-100", // Le sport à l'école
    ],
  },
  {
    id: "b1-traditions",
    band: "B1",
    title: "French traditions",
    goal: "Holidays, markets, laïcité, regional languages and heritage.",
    textIds: [
      "starter-b1-101", // Pourquoi la France a tant de fêtes en mai (levels up A2 France and Britain)
      "starter-b1-102", // Le marché, une institution qui résiste
      "starter-b1-103", // La laïcité, souvent mal comprise
      "starter-b1-104", // Les langues régionales
      "starter-b1-105", // Le patrimoine, qui décide de ce qu'on garde ?
    ],
  },
  {
    id: "b1-wildlife",
    band: "B1",
    title: "Nature and wildlife",
    goal: "Insect decline, the wolf's return, urban nature, feeding birds and light pollution.",
    textIds: [
      "starter-b1-106", // La disparition silencieuse des insectes
      "starter-b1-107", // Le retour du loup
      "starter-b1-108", // Nos villes peuvent accueillir la nature
      "starter-b1-109", // Faut-il nourrir les oiseaux en hiver ?
      "starter-b1-110", // La nuit a besoin d'obscurité
    ],
  },
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
