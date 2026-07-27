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
    id: "b1-france-britain",
    band: "B1",
    title: "France and Britain",
    goal: "Compare schooling, protest, bureaucracy, holidays and mutual admiration.",
    textIds: [
      "starter-b1-111", // Deux façons de faire l'école (levels up A2 France and Britain)
      "starter-b1-112", // Manifester, une tradition française ?
      "starter-b1-113", // L'administration française vue de l'étranger
      "starter-b1-114", // Le rapport au temps libre
      "starter-b1-115", // Ce que chacun envie à l'autre
    ],
  },
  {
    id: "b1-work-meaning",
    band: "B1",
    title: "Work and meaning",
    goal: "Passion at work, meetings, invisible labour, disappearing jobs and retirement.",
    textIds: [
      "starter-b1-116", // Faut-il aimer son travail ? (levels up B1 Work & careers)
      "starter-b1-117", // Les réunions qui ne servent à rien
      "starter-b1-118", // Le travail invisible
      "starter-b1-119", // Quand le métier disparaît
      "starter-b1-120", // Prendre sa retraite, et après ?
    ],
  },
  {
    id: "b1-medicine",
    band: "B1",
    title: "Health and medicine",
    goal: "Antibiotics, the placebo effect, mental health at work, ageing well, self-diagnosis.",
    textIds: [
      "starter-b1-121", // Les antibiotiques ne soignent pas tout (levels up B1 Everyday health)
      "starter-b1-122", // L'effet placebo
      "starter-b1-123", // La santé mentale au travail
      "starter-b1-124", // Vieillir en bonne santé
      "starter-b1-125", // Chercher ses symptômes sur internet
    ],
  },
  {
    id: "b1-housing",
    band: "B1",
    title: "Housing",
    goal: "Rent or buy, intergenerational living, small flats, renovation, social housing.",
    textIds: [
      "starter-b1-126", // Louer ou acheter ? (levels up B1 City living)
      "starter-b1-127", // La colocation entre générations
      "starter-b1-128", // Vivre dans un petit logement
      "starter-b1-129", // Rénover une vieille maison
      "starter-b1-130", // À quoi sert le logement social ?
    ],
  },
  {
    id: "b1-education",
    band: "B1",
    title: "Education",
    goal: "What school is for, homework, apprenticeship, screens and the weight of the diploma.",
    textIds: [
      "starter-b1-131", // À quoi sert vraiment l'école ? (levels up A2 First jobs / At school)
      "starter-b1-132", // Les devoirs à la maison
      "starter-b1-133", // Apprendre un métier par l'apprentissage
      "starter-b1-134", // Les écrans à l'école
      "starter-b1-135", // Le poids du diplôme en France
    ],
  },
  {
    id: "b1-science",
    band: "B1",
    title: "Everyday science",
    goal: "The physics and biology behind ordinary things: sky, bread, hiccups, vaccines, floating.",
    textIds: [
      "starter-b1-136", // Pourquoi le ciel change de couleur (levels up A2 D'où vient la pluie)
      "starter-b1-137", // Pourquoi le pain lève
      "starter-b1-138", // Pourquoi nous avons le hoquet
      "starter-b1-139", // Comment fonctionne un vaccin
      "starter-b1-140", // Pourquoi les objets flottent
    ],
  },
  {
    id: "b1-history",
    band: "B1",
    title: "History and memory",
    goal: "Why history matters, memorials, how history is written, objects and family memory.",
    textIds: [
      "starter-b1-141", // Pourquoi étudier l'histoire
      "starter-b1-142", // Les monuments aux morts
      "starter-b1-143", // Comment on écrit l'histoire
      "starter-b1-144", // Les objets racontent le passé
      "starter-b1-145", // La mémoire des familles
    ],
  },
  {
    id: "b1-art",
    band: "B1",
    title: "Art and music",
    goal: "Why art moves us, music everywhere, learning an instrument, public art, museums.",
    textIds: [
      "starter-b1-146", // Pourquoi l'art nous touche
      "starter-b1-147", // La musique nous accompagne partout
      "starter-b1-148", // Faut-il apprendre à jouer d'un instrument ?
      "starter-b1-149", // L'art dans l'espace public
      "starter-b1-150", // Le musée est-il ennuyeux ?
    ],
  },
  {
    id: "b1-social",
    band: "B1",
    title: "Social life",
    goal: "Conversation, hosting, saying no, everyday courtesy and chosen solitude.",
    textIds: [
      "starter-b1-151", // L'art de la conversation (levels up B1 Relationships)
      "starter-b1-152", // Recevoir des invités
      "starter-b1-153", // Dire non sans se justifier
      "starter-b1-154", // Les petites politesses du quotidien
      "starter-b1-155", // La solitude choisie
    ],
  },
  {
    id: "b1-consumer",
    band: "B1",
    title: "Consumer choices",
    goal: "Fast fashion, online reviews, buying local, advertising and the true cost of cheap.",
    textIds: [
      "starter-b1-156", // La mode jetable (levels up B1 Money and choices)
      "starter-b1-157", // Les avis en ligne sont-ils fiables ?
      "starter-b1-158", // Acheter local, vraiment ?
      "starter-b1-159", // La publicité est partout
      "starter-b1-160", // Le vrai coût du pas cher
    ],
  },
  {
    id: "b1-transport",
    band: "B1",
    title: "Transport and cities",
    goal: "The 15-minute city, cars downtown, free transit, noise and life without a car.",
    textIds: [
      "starter-b1-161", // La ville des quinze minutes (levels up B1 City living)
      "starter-b1-162", // Faut-il des voitures en centre-ville ?
      "starter-b1-163", // Les transports en commun gratuits ?
      "starter-b1-164", // Le bruit, une pollution oubliée
      "starter-b1-165", // Quand la voiture devient inutile
    ],
  },
  {
    id: "b1-language",
    band: "B1",
    title: "Learning a language",
    goal: "Learning as an adult, regularity, understanding first, the pleasure, and false promises.",
    textIds: [
      "starter-b1-166", // Pourquoi apprendre une langue à l'âge adulte (levels up B1 Learning)
      "starter-b1-167", // La régularité bat l'intensité
      "starter-b1-168", // Comprendre avant de parler
      "starter-b1-169", // Le plaisir d'une langue étrangère
      "starter-b1-170", // Les fausses promesses des méthodes miracles
    ],
  },
  {
    id: "b1-generations",
    band: "B1",
    title: "Generations",
    goal: "Why each generation criticises the next, grandparents' childcare, the digital gap, mixed-age housing, passing on skills.",
    textIds: [
      "starter-b1-171", // Chaque génération critique la suivante
      "starter-b1-172", // Quand les grands-parents gardent les enfants
      "starter-b1-173", // Le fossé numérique entre les âges
      "starter-b1-174", // Habiter ensemble, jeunes et âgés
      "starter-b1-175", // Transmettre un savoir-faire
    ],
  },
  {
    id: "b1-volunteering",
    band: "B1",
    title: "Volunteering",
    goal: "Why people give their time, food banks, helping without crushing, the associative sector, starting small.",
    textIds: [
      "starter-b1-176", // Pourquoi les gens donnent de leur temps
      "starter-b1-177", // Les banques alimentaires
      "starter-b1-178", // Aider sans écraser
      "starter-b1-179", // Le monde associatif, un pilier discret
      "starter-b1-180", // Commencer petit
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
    id: "b2-work-identity",
    band: "B2",
    title: "Work and identity",
    goal: "Argue about work as identity, the search for meaning, work spilling into life, lost trades, and working less.",
    textIds: [
      "starter-b2-051", // Sommes-nous ce que nous faisons ? (introduces the core words)
      "starter-b2-052", // La quête de sens au travail
      "starter-b2-053", // Le travail qui déborde
      "starter-b2-054", // Quand le métier disparaît
      "starter-b2-055", // Travailler moins, vivre mieux ? (hardest)
    ],
  },
  {
    id: "b2-attention",
    band: "B2",
    title: "Attention and media",
    goal: "The attention economy, lost concentration, the news flood, the price of 'free', and reclaiming your focus.",
    textIds: [
      "starter-b2-056", // L'économie de l'attention (introduces the core words)
      "starter-b2-057", // Pourquoi nous n'arrivons plus à nous concentrer
      "starter-b2-058", // L'information en continu nous informe-t-elle ?
      "starter-b2-059", // Le prix de la gratuité
      "starter-b2-060", // Reprendre le contrôle de son attention (hardest)
    ],
  },
  {
    id: "b2-belonging",
    band: "B2",
    title: "Cities and belonging",
    goal: "Whether the city is ours, gentrification, anonymity, the surveilled 'smart city', and reclaiming silence.",
    textIds: [
      "starter-b2-061", // La ville nous appartient-elle ? (introduces the core words)
      "starter-b2-062", // Quand un quartier change de visage
      "starter-b2-063", // L'anonymat des grandes villes
      "starter-b2-064", // À qui profite la ville intelligente ?
      "starter-b2-065", // Refaire une place au silence (hardest)
    ],
  },
  {
    id: "b2-food-ethics",
    band: "B2",
    title: "Food, culture and ethics",
    goal: "Eating made complicated, less meat, food waste, cuisine as living heritage, the shared meal.",
    textIds: [
      "starter-b2-066", // Manger est devenu compliqué (introduces the core words)
      "starter-b2-067", // Faut-il manger moins de viande ?
      "starter-b2-068", // Le gaspillage alimentaire
      "starter-b2-069", // La cuisine, un patrimoine vivant
      "starter-b2-070", // Le repas, dernier rituel commun (hardest)
    ],
  },
  {
    id: "b2-relationships",
    band: "B2",
    title: "Love and relationships",
    goal: "Loving amid infinite choice, adult friendship, living alone, screens and conversation, the reinvented family.",
    textIds: [
      "starter-b2-071", // Aimer à l'ère du choix illimité (introduces the core words)
      "starter-b2-072", // L'amitié à l'âge adulte
      "starter-b2-073", // Vivre seul, une histoire nouvelle
      "starter-b2-074", // Ce que les écrans font à nos conversations
      "starter-b2-075", // La famille, un lien qui se réinvente (hardest)
    ],
  },
  {
    id: "b2-technology",
    band: "B2",
    title: "Technology and society",
    goal: "Is technology neutral, AI and jobs, filter bubbles, the right to disconnect, who decides what we see.",
    textIds: [
      "starter-b2-076", // La technologie est-elle neutre ? (introduces the core words)
      "starter-b2-077", // L'intelligence artificielle et nos métiers
      "starter-b2-078", // Les bulles où nous nous enfermons
      "starter-b2-079", // Le droit de se déconnecter
      "starter-b2-080", // Qui décide de ce que nous voyons ? (hardest)
    ],
  },
  {
    id: "b2-climate",
    band: "B2",
    title: "Climate and responsibility",
    goal: "The weight of small gestures, long-term thinking, ecology and justice, reasonable hope, consuming less.",
    textIds: [
      "starter-b2-081", // Le poids de nos petits gestes (introduces the core words)
      "starter-b2-082", // Penser à long terme
      "starter-b2-083", // L'écologie est-elle un luxe ?
      "starter-b2-084", // L'espoir est-il raisonnable ?
      "starter-b2-085", // Consommer moins, un appauvrissement ? (hardest)
    ],
  },
  {
    id: "b2-mind",
    band: "B2",
    title: "Learning and the mind",
    goal: "What school really leaves behind, error as ally, memory in the age of search, understanding vs retaining, lifelong learning.",
    textIds: [
      "starter-b2-086", // Apprend-on vraiment à l'école ? (introduces the core words)
      "starter-b2-087", // L'erreur, ennemie ou alliée ?
      "starter-b2-088", // La mémoire à l'ère de l'information disponible
      "starter-b2-089", // Comprendre ou retenir ?
      "starter-b2-090", // Apprendre toute la vie (hardest)
    ],
  },
  {
    id: "b2-health-self",
    band: "B2",
    title: "Health and the self",
    goal: "Health beyond illness, the displayed body, neglected sleep, mental health without shame, prevention.",
    textIds: [
      "starter-b2-091", // La santé n'est pas que l'absence de maladie (introduces the core words)
      "starter-b2-092", // Le corps que l'on donne à voir
      "starter-b2-093", // Le sommeil, ce grand négligé
      "starter-b2-094", // Guérir la tête comme le corps
      "starter-b2-095", // Prévenir plutôt que guérir (hardest)
    ],
  },
  {
    id: "b2-value",
    band: "B2",
    title: "Money and value",
    goal: "Does money buy happiness, what spending reveals, the true cost of things, debt, and the idea of 'enough'.",
    textIds: [
      "starter-b2-096", // L'argent fait-il le bonheur ? (introduces the core words)
      "starter-b2-097", // Ce que révèle la façon dont on dépense
      "starter-b2-098", // Le vrai prix des choses
      "starter-b2-099", // L'endettement, servitude moderne ?
      "starter-b2-100", // Assez, cela existe-t-il ? (hardest)
    ],
  },
  {
    id: "b2-travel",
    band: "B2",
    title: "Travel and the tourist gaze",
    goal: "Whether we still truly travel, overtourism, photography vs seeing, the foreign as mirror, the guilt of flying.",
    textIds: [
      "starter-b2-101", // Voyage-t-on encore vraiment ? (introduces the core words)
      "starter-b2-102", // Quand le tourisme étouffe les villes
      "starter-b2-103", // La photographie remplace-t-elle le regard ?
      "starter-b2-104", // L'étranger, miroir de soi
      "starter-b2-105", // Faut-il culpabiliser de prendre l'avion ? (hardest)
    ],
  },
  {
    id: "b2-art",
    band: "B2",
    title: "Art and meaning",
    goal: "What art is for, understanding vs feeling, whether taste can be discussed, culture as commodity, why works last.",
    textIds: [
      "starter-b2-106", // À quoi sert l'art ? (introduces the core words)
      "starter-b2-107", // Faut-il tout comprendre pour apprécier ?
      "starter-b2-108", // Le goût se discute-t-il ?
      "starter-b2-109", // La culture, un bien comme un autre ?
      "starter-b2-110", // Pourquoi certaines œuvres traversent le temps (hardest)
    ],
  },
  {
    id: "b2-history",
    band: "B2",
    title: "History and memory",
    goal: "What knowing the past is for, collective memory, judging the past, national narratives, remembering to prevent.",
    textIds: [
      "starter-b2-111", // À quoi sert de connaître le passé ? (introduces the core words)
      "starter-b2-112", // La mémoire des peuples
      "starter-b2-113", // Juger le passé avec les yeux d'aujourd'hui ?
      "starter-b2-114", // Les récits qui font les nations
      "starter-b2-115", // Se souvenir pour ne pas recommencer (hardest)
    ],
  },
  {
    id: "b2-science-doubt",
    band: "B2",
    title: "Science and doubt",
    goal: "What science can and cannot do, doubt as its engine, trusting experts, simple explanations, understanding chance.",
    textIds: [
      "starter-b2-116", // Ce que la science peut et ne peut pas (introduces the core words)
      "starter-b2-117", // Le doute, moteur de la science
      "starter-b2-118", // Quand faut-il croire un expert ?
      "starter-b2-119", // La tentation des explications simples
      "starter-b2-120", // Comprendre le hasard (hardest)
    ],
  },
  {
    id: "b2-language",
    band: "B2",
    title: "Language and thought",
    goal: "Whether words shape thought, dying languages, who owns a language, eloquence vs thinking, the meaning of silence.",
    textIds: [
      "starter-b2-121", // Les mots façonnent-ils la pensée ? (introduces the core words)
      "starter-b2-122", // Faut-il défendre les langues qui meurent ?
      "starter-b2-123", // La langue appartient-elle à ceux qui la parlent ?
      "starter-b2-124", // Bien parler, est-ce bien penser ?
      "starter-b2-125", // Le silence a-t-il un sens ? (hardest)
    ],
  },
  {
    id: "b2-justice",
    band: "B2",
    title: "Justice and fairness",
    goal: "What a just society is, equality of opportunity, the purposes of punishment, limits of liberty, unjust laws.",
    textIds: [
      "starter-b2-126", // Qu'est-ce qu'une société juste ? (introduces the core words)
      "starter-b2-127", // L'égalité des chances suffit-elle ?
      "starter-b2-128", // Punir, pour quoi faire ?
      "starter-b2-129", // La liberté des uns et celle des autres
      "starter-b2-130", // Faut-il obéir à des lois injustes ? (hardest)
    ],
  },
  {
    id: "b2-nature-wild",
    band: "B2",
    title: "Nature and the wild",
    goal: "Whether we are separate from nature, rights of nature, the need for nature, wilderness, loving animals.",
    textIds: [
      "starter-b2-131", // Sommes-nous séparés de la nature ? (introduces the core words)
      "starter-b2-132", // La nature a-t-elle des droits ?
      "starter-b2-133", // Le besoin de nature
      "starter-b2-134", // Faut-il laisser une place au sauvage ?
      "starter-b2-135", // Aimer les animaux, jusqu'où ? (hardest)
    ],
  },
  {
    id: "b2-france-britain",
    band: "B2",
    title: "France and Britain",
    goal: "Cultural contrast: two neighbours, state vs initiative, British humour, rules and authority, life between cultures (Tom).",
    textIds: [
      "starter-b2-136", // Deux voisins que tout rapproche et sépare (introduces the theme)
      "starter-b2-137", // L'État providence et l'esprit d'initiative
      "starter-b2-138", // L'humour, une affaire sérieuse
      "starter-b2-139", // Le rapport aux règles
      "starter-b2-140", // Ce que Tom a appris en France (hardest)
    ],
  },
  {
    id: "b2-automation",
    band: "B2",
    title: "Work and automation",
    goal: "Whether machines free us, basic income, work only humans can do, being replaced, who decides what machines do.",
    textIds: [
      "starter-b2-141", // Les machines vont-elles nous libérer ? (introduces the core words)
      "starter-b2-142", // Un revenu pour tous ?
      "starter-b2-143", // Le travail qui restera aux humains
      "starter-b2-144", // Être remplacé par une machine
      "starter-b2-145", // Qui décide de ce que font les machines ? (hardest)
    ],
  },
  {
    id: "b2-night",
    band: "B2",
    title: "The city at night",
    goal: "The hidden nocturnal city, night work, fear of the dark and of others, light pollution, the right to the night.",
    textIds: [
      "starter-b2-146", // La ville ne dort jamais (introduces the core words)
      "starter-b2-147", // Travailler pendant que les autres dorment
      "starter-b2-148", // La peur du noir, la peur des autres
      "starter-b2-149", // La pollution qui efface les étoiles
      "starter-b2-150", // Le droit à la nuit (hardest)
    ],
  },
  {
    id: "b2-privacy",
    band: "B2",
    title: "Privacy in a watched world",
    goal: "Living under the gaze, the 'nothing to hide' argument, data as gold, a memory that never forgets, whether hiding is still possible.",
    textIds: [
      "starter-b2-151", // Vivre sous le regard (introduces the core words)
      "starter-b2-152", // « Je n'ai rien à cacher »
      "starter-b2-153", // Nos données valent de l'or
      "starter-b2-154", // La mémoire qui n'oublie jamais
      "starter-b2-155", // Se cacher est-il encore possible ? (hardest)
    ],
  },
  {
    id: "b2-ageing",
    band: "B2",
    title: "Ageing and time",
    goal: "Why time speeds up, an ageing society, the place of the old, living ever longer, what time teaches.",
    textIds: [
      "starter-b2-156", // Le temps qui file (introduces the core words)
      "starter-b2-157", // Une société qui vieillit
      "starter-b2-158", // La place des vieux
      "starter-b2-159", // Faut-il vouloir vivre toujours plus longtemps ?
      "starter-b2-160", // Ce que le temps nous apprend (hardest)
    ],
  },
  {
    id: "b2-truth",
    band: "B2",
    title: "Truth in a noisy world",
    goal: "Truth amid information overload, why falsehood spreads, verifying, believing nothing, the courage to change your mind.",
    textIds: [
      "starter-b2-161", // La vérité à l'épreuve du bruit (introduces the core words)
      "starter-b2-162", // Pourquoi le faux se propage si vite
      "starter-b2-163", // Vérifier, un art qui s'apprend
      "starter-b2-164", // Quand plus personne ne croit rien
      "starter-b2-165", // Le courage de changer d'avis (hardest)
    ],
  },
  {
    id: "b2-belief",
    band: "B2",
    title: "Belief and persuasion",
    goal: "Believing vs knowing, the art of convincing, cognitive biases, arguing with those who differ, thinking for yourself.",
    textIds: [
      "starter-b2-166", // Croire et savoir (introduces the core words)
      "starter-b2-167", // L'art de convaincre
      "starter-b2-168", // Nos biais, ces angles morts
      "starter-b2-169", // Discuter avec ceux qui pensent autrement
      "starter-b2-170", // Penser par soi-même (hardest)
    ],
  },
  {
    id: "b2-community",
    band: "B2",
    title: "Community and solitude",
    goal: "Alone together, chosen solitude, what binds a community, giving and receiving help, bonds as strength.",
    textIds: [
      "starter-b2-171", // Seuls ensemble (introduces the core words)
      "starter-b2-172", // Éloge de la solitude choisie
      "starter-b2-173", // Ce qui nous relie
      "starter-b2-174", // Aider et être aidé
      "starter-b2-175", // Le lien fait la force (hardest)
    ],
  },
  {
    id: "b2-good-life",
    band: "B2",
    title: "What makes a good life",
    goal: "The capstone: what a successful life is, the paradox of seeking happiness, meaning, accepting what we cannot change, living toward death.",
    textIds: [
      "starter-b2-176", // Qu'est-ce qu'une vie réussie ? (introduces the core words)
      "starter-b2-177", // Le bonheur se cherche-t-il ?
      "starter-b2-178", // Donner un sens
      "starter-b2-179", // Accepter ce qu'on ne peut changer
      "starter-b2-180", // Vivre en sachant que l'on va mourir (hardest — closes B2)
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
  {
    id: "c1-public-debate",
    band: "C1",
    title: "Public debate",
    goal: "Essay register: debate as a fragile civilisation, indignation vs thought, the tyranny of transparency, permanent scandal, the courage of nuance.",
    textIds: [
      "starter-c1-001", // Le débat, une civilisation fragile (sets the register)
      "starter-c1-002", // L'indignation contre la pensée
      "starter-c1-003", // La tyrannie de la transparence
      "starter-c1-004", // Le scandale permanent
      "starter-c1-005", // Le courage de la nuance (hardest)
    ],
  },
  {
    id: "c1-philosophy",
    band: "C1",
    title: "Philosophy and society",
    goal: "What philosophy is for, the illusion of free will, what we owe others, the meaning of progress, thinking against oneself.",
    textIds: [
      "starter-c1-006", // À quoi bon la philosophie ?
      "starter-c1-007", // La liberté est-elle une illusion ?
      "starter-c1-008", // Ce que nous devons aux autres
      "starter-c1-009", // Le progrès a-t-il un sens ?
      "starter-c1-010", // Penser contre soi-même (hardest)
    ],
  },
  {
    id: "c1-work-identity",
    band: "C1",
    title: "Work and identity",
    goal: "Defining ourselves by work, the tyranny of the useful, recognition, the trouble with merit, whether we must love our jobs.",
    textIds: [
      "starter-c1-011", // Sommes-nous définis par notre travail ?
      "starter-c1-012", // L'utile et le gratuit
      "starter-c1-013", // La reconnaissance, ce besoin invisible
      "starter-c1-014", // Le mérite, une idée trouble
      "starter-c1-015", // Faut-il aimer son travail ? (hardest)
    ],
  },
  {
    id: "c1-memory-history",
    band: "C1",
    title: "Memory and history",
    goal: "History vs the past, political uses of the past, the duty of memory, judging monuments, the necessity of forgetting.",
    textIds: [
      "starter-c1-016", // L'histoire n'est pas le passé
      "starter-c1-017", // Les usages politiques du passé
      "starter-c1-018", // Le devoir de mémoire et ses limites
      "starter-c1-019", // Faut-il juger les statues ?
      "starter-c1-020", // L'oubli est-il nécessaire ? (hardest)
    ],
  },
  {
    id: "c1-language-power",
    band: "C1",
    title: "Language and power",
    goal: "Words are never neutral, wooden language, who may speak, limits of free expression, naming as bringing into being.",
    textIds: [
      "starter-c1-021", // Les mots ne sont jamais neutres
      "starter-c1-022", // La langue de bois
      "starter-c1-023", // Qui a le droit de parler ?
      "starter-c1-024", // Les limites de la liberté d'expression
      "starter-c1-025", // Nommer, c'est faire exister (hardest)
    ],
  },
  {
    id: "c1-science-uncertainty",
    band: "C1",
    title: "Science and uncertainty",
    goal: "Doubt is not ignorance, correlation vs causation, the precautionary principle, science and opinion, fact vs value.",
    textIds: [
      "starter-c1-026", // Le doute n'est pas l'ignorance
      "starter-c1-027", // Corrélation et causalité
      "starter-c1-028", // Le principe de précaution
      "starter-c1-029", // La science et l'opinion
      "starter-c1-030", // Ce que la science ne dira jamais (hardest)
    ],
  },
  {
    id: "c1-art-modern",
    band: "C1",
    title: "Art and the modern world",
    goal: "Must art be beautiful, original vs copy, mass culture, when machines create, kitsch and the sublime.",
    textIds: [
      "starter-c1-031", // L'art doit-il être beau ?
      "starter-c1-032", // L'original et la copie
      "starter-c1-033", // La culture de masse est-elle une culture ?
      "starter-c1-034", // Quand la machine crée
      "starter-c1-035", // Le kitsch et le sublime (hardest)
    ],
  },
  {
    id: "c1-tech-human",
    band: "C1",
    title: "Technology and the human",
    goal: "Tools that reshape us, the price of convenience, delegating judgement, the world through a screen, staying human among machines.",
    textIds: [
      "starter-c1-036", // L'outil qui nous transforme
      "starter-c1-037", // La commodité a-t-elle un prix ?
      "starter-c1-038", // Déléguer nos décisions
      "starter-c1-039", // Le monde à portée d'écran
      "starter-c1-040", // Rester humain parmi les machines (hardest)
    ],
  },
  {
    id: "c1-inequality",
    band: "C1",
    title: "Money, value and inequality",
    goal: "Whether inequality is unjust, the moral limits of markets, poverty as no fatality, inheritance vs merit, the self-made myth.",
    textIds: [
      "starter-c1-041", // L'inégalité est-elle injuste ?
      "starter-c1-042", // L'argent peut-il tout acheter ?
      "starter-c1-043", // La pauvreté est-elle une fatalité ?
      "starter-c1-044", // Hériter, est-ce mériter ?
      "starter-c1-045", // Le mythe du self-made-man (hardest)
    ],
  },
  {
    id: "c1-nature-civilisation",
    band: "C1",
    title: "Nature and civilisation",
    goal: "Nature as a construct, comfort vs the planet, duties to future generations, techno-optimism, learning to inhabit the Earth.",
    textIds: [
      "starter-c1-046", // La nature n'existe pas
      "starter-c1-047", // Le confort contre la planète ?
      "starter-c1-048", // Ce que nous devons aux générations futures
      "starter-c1-049", // La technique nous sauvera-t-elle ?
      "starter-c1-050", // Habiter la Terre (hardest)
    ],
  },
  {
    id: "c1-self",
    band: "C1",
    title: "The self and identity",
    goal: "Who am I, the gaze of others, being true to oneself, multiple identities, changing without betraying oneself.",
    textIds: [
      "starter-c1-051", // Qui suis-je ?
      "starter-c1-052", // Le regard des autres
      "starter-c1-053", // Être fidèle à soi-même
      "starter-c1-054", // Les identités multiples
      "starter-c1-055", // Changer sans se trahir (hardest)
    ],
  },
  {
    id: "c1-democracy",
    band: "C1",
    title: "Democracy and its discontents",
    goal: "Is democracy the best regime, tyranny of the majority, governing without lying, civic apathy, the common good.",
    textIds: [
      "starter-c1-056", // La démocratie est-elle le meilleur régime ?
      "starter-c1-057", // La tyrannie de la majorité
      "starter-c1-058", // Peut-on gouverner sans mentir ?
      "starter-c1-059", // L'apathie des citoyens
      "starter-c1-060", // Le bien commun existe-t-il ? (hardest)
    ],
  },
  {
    id: "c1-belief-secular",
    band: "C1",
    title: "Belief and the secular",
    goal: "Believing and unbelieving, the sacred without religion, misunderstood secularism, the need for transcendence, tolerating what one disapproves of.",
    textIds: [
      "starter-c1-061", // Croire et ne pas croire
      "starter-c1-062", // Le sacré sans la religion
      "starter-c1-063", // La laïcité, une idée mal comprise
      "starter-c1-064", // Le besoin de transcendance
      "starter-c1-065", // Tolérer ce que l'on désapprouve (hardest)
    ],
  },
  {
    id: "c1-france-britain",
    band: "C1",
    title: "France and Britain",
    goal: "C1 cultural contrast: two relationships to rules, the universal vs the particular, food and pleasure, island vs continent, what each learns from the other.",
    textIds: [
      "starter-c1-066", // Deux rapports à la règle
      "starter-c1-067", // L'universel et le particulier
      "starter-c1-068", // La cuisine et l'idée qu'on s'en fait
      "starter-c1-069", // L'insularité et le continent
      "starter-c1-070", // Ce que chaque peuple apprend de l'autre (hardest)
    ],
  },
  {
    id: "c1-education",
    band: "C1",
    title: "Education and knowledge",
    goal: "Instructing vs educating, whether knowledge frees, school and inequality, learning in the information age, curiosity as virtue or vice.",
    textIds: [
      "starter-c1-071", // Instruire ou éduquer ?
      "starter-c1-072", // Le savoir rend-il libre ?
      "starter-c1-073", // L'école reproduit-elle les inégalités ?
      "starter-c1-074", // Apprendre à l'ère de l'information
      "starter-c1-075", // La curiosité, vertu ou vice ? (hardest)
    ],
  },
  {
    id: "c1-good-life",
    band: "C1",
    title: "The good life and modernity",
    goal: "Capstone: living fast, abundance and emptiness, the pursuit of happiness, freedom and limits, giving shape to one's life.",
    textIds: [
      "starter-c1-076", // Vivre vite
      "starter-c1-077", // L'abondance et le vide
      "starter-c1-078", // La quête du bonheur nous rend-elle malheureux ?
      "starter-c1-079", // Être libre, est-ce n'avoir aucune limite ?
      "starter-c1-080", // Donner forme à sa vie (hardest — closes C1)
    ],
  },
  {
    id: "c2-language-thought",
    band: "C2",
    title: "Language and the limits of thought",
    goal: "Highest register: the limits of language, the untranslatable, the power of metaphor, the silence of the unnamed, the ethics of naming.",
    textIds: [
      "starter-c2-001", // Les frontières de ma langue
      "starter-c2-002", // L'intraduisible
      "starter-c2-003", // Le pouvoir des métaphores
      "starter-c2-004", // Le silence de ce qui n'a pas de nom
      "starter-c2-005", // Bien nommer les choses (hardest)
    ],
  },
  {
    id: "c2-time-self",
    band: "C2",
    title: "Time and the self",
    goal: "The unreality of the present, memory as reconstruction, forgetting as a grace, narrative identity, loving what passes.",
    textIds: [
      "starter-c2-006", // Le présent n'existe pas
      "starter-c2-007", // Ce que la mémoire invente
      "starter-c2-008", // L'oubli, condition de la vie
      "starter-c2-009", // Le fil d'une vie
      "starter-c2-010", // Retenir ce qui passe (hardest)
    ],
  },
  {
    id: "c2-tragic",
    band: "C2",
    title: "The tragic and the human condition",
    goal: "The tragic vs misfortune, the absurd and revolt, the sense of suffering, the greatness of the defeated, consenting to the human condition.",
    textIds: [
      "starter-c2-011", // Le tragique n'est pas le malheur
      "starter-c2-012", // L'absurde et la révolte
      "starter-c2-013", // La souffrance a-t-elle un sens ?
      "starter-c2-014", // La grandeur des vaincus
      "starter-c2-015", // Consentir à la condition humaine (hardest)
    ],
  },
  {
    id: "c2-power-myth",
    band: "C2",
    title: "Power, myth and society",
    goal: "Power needs narratives, voluntary servitude, ideology as the air we breathe, the crowd and the individual, what holds a society together.",
    textIds: [
      "starter-c2-016", // Le pouvoir a besoin de récits
      "starter-c2-017", // Servitude volontaire
      "starter-c2-018", // L'idéologie, cet air qu'on respire
      "starter-c2-019", // La foule et l'individu
      "starter-c2-020", // Ce qui tient une société (hardest)
    ],
  },
  {
    id: "c2-beauty",
    band: "C2",
    title: "Beauty and the sublime",
    goal: "Whether beauty saves the world, the sublime, whether art makes us better, genius and rule, why beauty moves us.",
    textIds: [
      "starter-c2-021", // La beauté sauvera-t-elle le monde ?
      "starter-c2-022", // Le sublime, ou le plaisir de ce qui nous dépasse
      "starter-c2-023", // L'art nous rend-il meilleurs ?
      "starter-c2-024", // Le génie et la règle
      "starter-c2-025", // Pourquoi la beauté nous émeut (hardest)
    ],
  },
  {
    id: "c2-science-unknowable",
    band: "C2",
    title: "Science and the unknowable",
    goal: "The limits of reason, what we can never know, wonder as the root of knowledge, whether truth should always be told, knowing that one does not know.",
    textIds: [
      "starter-c2-026", // Les limites de la raison
      "starter-c2-027", // Ce que nous ne saurons jamais
      "starter-c2-028", // L'émerveillement, commencement du savoir
      "starter-c2-029", // La vérité est-elle toujours bonne à dire ?
      "starter-c2-030", // Savoir qu'on ne sait pas (hardest)
    ],
  },
  {
    id: "c2-ethics",
    band: "C2",
    title: "Ethics beyond rules",
    goal: "Whether morality reduces to rules, ends and means, the possibility of forgiveness, conscience, being good with or without effort.",
    textIds: [
      "starter-c2-031", // La morale se réduit-elle à des règles ?
      "starter-c2-032", // La fin justifie-t-elle les moyens ?
      "starter-c2-033", // Le pardon est-il toujours possible ?
      "starter-c2-034", // La conscience morale
      "starter-c2-035", // Peut-on être bon sans effort ? (hardest)
    ],
  },
  {
    id: "c2-solitude-love",
    band: "C2",
    title: "Solitude, others and love",
    goal: "Essential solitude, knowing another, whether love sees or invents, desire and lack, two solitudes that greet each other.",
    textIds: [
      "starter-c2-036", // La solitude essentielle
      "starter-c2-037", // Connaître autrui
      "starter-c2-038", // Aimer, est-ce connaître ou méconnaître ?
      "starter-c2-039", // Le désir et le manque
      "starter-c2-040", // Deux solitudes qui se saluent (hardest)
    ],
  },
];

/** Every text id that belongs to an explicit themed section (so the difficulty-sorted grouping can skip them). */
export function sectionedTextIds(): Set<string> {
  return new Set(JOURNEY_SECTIONS.flatMap((section) => section.textIds));
}
