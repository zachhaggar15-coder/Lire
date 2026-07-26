import type { ReadingText } from "@/types";

/**
 * Original A1–B2 French texts written for learners.
 *
 * The public-domain bank (publicDomainTexts.ts) is Gutenberg literature —
 * Dumas, Flaubert, Maupassant. Even its "A1" excerpts are 19th-century
 * literary French: archaic negation ("point à vous" for "pas à vous"),
 * pejorative slang ("morveux"), "parbleu", heavy ellipsis. Someone who has
 * just learned "bonjour" cannot read it, and no amount of interface work
 * changes that. Project Gutenberg has no genuinely beginner French, and the
 * graded-reader sites that do (RFI's Journal en français facile, lingua.com,
 * Le Petit Quotidien) are all copyrighted, so their text can't ship here.
 *
 * These are written to the CEFR descriptors instead:
 *
 *   A1 — present tense, "il y a" / "c'est", very high-frequency vocabulary,
 *        sentences of roughly 5-12 words, one concrete everyday situation per
 *        text, structures repeated on purpose so the pattern sticks.
 *   A2 — adds passé composé, futur proche and light imparfait, plus the
 *        connectors that carry real prose (parce que, mais, quand, alors,
 *        donc), sentences of roughly 10-18 words, still concrete.
 *
 * Every text has a hand-written `blurbEn`. That isn't decoration: the reader's
 * comprehension question only appears when a text has a real English summary
 * to build honest options from (see canBuildGistQuestion), so these are the
 * first bank texts where that exercise works at all.
 */
export const starterTexts: ReadingText[] = [
  {
    id: "starter-a1-001",
    title: "Le petit déjeuner de Léa",
    category: "everyday life",
    difficulty: "A1",
    minutes: 1,
    preview: "Léa se lève à sept heures. Elle ouvre la fenêtre.",
    blurbEn:
      "Léa gets up, makes coffee and eats toast with jam. Her brother Tom never eats in the morning and is always in a hurry.",
    body: `Léa se lève à sept heures. Elle ouvre la fenêtre. Il fait beau ce matin.

Dans la cuisine, elle prépare un café. Elle aime le café très chaud. Elle mange aussi deux tartines avec du beurre et de la confiture.

Son frère Tom arrive. Il ne mange pas le matin. Il boit seulement un jus d'orange.

« Tu es toujours pressé », dit Léa.

« Oui, je commence à huit heures », répond Tom.

À sept heures et demie, ils partent ensemble. Léa prend son sac et Tom prend son vélo.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-002",
    title: "Mon appartement",
    category: "everyday life",
    difficulty: "A1",
    minutes: 1,
    preview: "J'habite dans un petit appartement, au troisième étage.",
    blurbEn:
      "A short description of a small third-floor flat: two rooms, a green kitchen, a balcony with tomatoes, and noisy neighbours.",
    body: `J'habite dans un petit appartement, au troisième étage. Il n'y a pas d'ascenseur.

L'appartement a deux pièces. La chambre est petite mais la fenêtre est grande. Le salon est clair.

Ma cuisine est verte. C'est ma couleur préférée. Sur la table, il y a toujours des fruits.

J'ai aussi un balcon. Je cultive des tomates et du basilic. En été, je mange dehors.

Mes voisins sont gentils, mais leur chien fait beaucoup de bruit.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-003",
    title: "Au marché le samedi",
    category: "everyday life",
    difficulty: "A1",
    minutes: 1,
    preview: "Le samedi matin, je vais au marché avec ma mère.",
    blurbEn:
      "A Saturday trip to the market, buying vegetables, cheese and bread, and stopping for hot chocolate on the way home.",
    body: `Le samedi matin, je vais au marché avec ma mère. Le marché est sur la grande place.

Il y a beaucoup de monde. Les gens parlent fort. Ça sent bon.

Nous achetons des carottes, des pommes et une salade. Ma mère prend aussi du fromage.

« Un kilo, s'il vous plaît », dit-elle.

Le vendeur sourit. Il donne toujours une pomme aux enfants.

Après, nous achetons du pain chaud. Sur le chemin du retour, nous buvons un chocolat.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-004",
    title: "Le chat de la voisine",
    category: "everyday life",
    difficulty: "A1",
    minutes: 1,
    preview: "La voisine a un chat noir et blanc. Il s'appelle Moustache.",
    blurbEn:
      "The neighbour's cat visits every afternoon, sleeps on the narrator's chair, and always leaves before dinner.",
    body: `La voisine a un chat noir et blanc. Il s'appelle Moustache.

Tous les après-midi, il entre par la fenêtre. Il ne demande pas la permission.

Moustache aime ma chaise. Il dort là pendant deux heures. Il ronronne très fort.

Je travaille et il dort. Nous sommes contents.

À six heures, il part. C'est l'heure de son dîner. Il rentre chez la voisine.

Le soir, ma chaise est chaude et pleine de poils.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-005",
    title: "Une journée de pluie",
    category: "everyday life",
    difficulty: "A1",
    minutes: 1,
    preview: "Aujourd'hui, il pleut. Le ciel est gris depuis ce matin.",
    blurbEn:
      "A rainy day at home: tea, a book, soup and a film, ending with a short walk once the rain stops.",
    body: `Aujourd'hui, il pleut. Le ciel est gris depuis ce matin.

Je reste à la maison. Je n'ai pas de parapluie.

Je fais du thé. Je prends un livre et une couverture. C'est agréable.

À midi, je prépare une soupe. Il y a des pommes de terre et des poireaux.

L'après-midi, je regarde un vieux film. Le chat dort sur mes pieds.

Le soir, la pluie s'arrête enfin. Je sors dix minutes. L'air est frais et propre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-006",
    title: "Le match du dimanche",
    category: "sport",
    difficulty: "A1",
    minutes: 1,
    preview: "Le dimanche, mon père et moi allons au stade.",
    blurbEn:
      "A father and child go to a small local football match. The home team loses, but everyone stays cheerful.",
    body: `Le dimanche, mon père et moi allons au stade. Ce n'est pas un grand stade. C'est le club de notre ville.

Nous arrivons à deux heures. Nous achetons deux billets.

Les joueurs entrent sur le terrain. Ils portent un maillot bleu.

Le match commence. Mon père crie beaucoup. Moi, je mange des frites.

À la fin, notre équipe perd deux à un. Mon père n'est pas content.

Mais dans la voiture, il dit : « La semaine prochaine, on gagne. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-007",
    title: "Je fais du vélo",
    category: "sport",
    difficulty: "A1",
    minutes: 1,
    preview: "J'ai un vélo rouge. Il est vieux mais il marche bien.",
    blurbEn:
      "The narrator cycles along the river three times a week, describing the route, the ducks and the bakery at the end.",
    body: `J'ai un vélo rouge. Il est vieux mais il marche bien.

Trois fois par semaine, je fais du vélo le long de la rivière. Le chemin est plat. C'est facile.

Le matin, il n'y a personne. J'entends seulement les oiseaux.

Sur l'eau, il y a des canards. Ils ne bougent pas quand je passe.

Je roule pendant quarante minutes. Après, je m'arrête à la boulangerie.

Un croissant après le sport, c'est ma petite règle.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-008",
    title: "Le musée est gratuit",
    category: "culture",
    difficulty: "A1",
    minutes: 1,
    preview: "Le premier dimanche du mois, le musée est gratuit.",
    blurbEn:
      "On the first Sunday of the month the museum is free. The narrator always visits one favourite painting of a blue window.",
    body: `Le premier dimanche du mois, le musée est gratuit. Alors j'y vais souvent.

Le musée n'est pas très grand. Il y a quatre salles.

Dans la première salle, il y a des tableaux anciens. Dans la deuxième, il y a des photos.

J'ai un tableau préféré. C'est une fenêtre bleue avec la mer derrière. Je reste devant cinq minutes.

Il y a beaucoup d'enfants le dimanche. Ils courent et ils parlent fort.

Le gardien sourit. Il est habitué.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-009",
    title: "La fête de la musique",
    category: "culture",
    difficulty: "A1",
    minutes: 1,
    preview: "Le 21 juin, c'est la fête de la musique.",
    blurbEn:
      "On 21 June, musicians play in the streets all evening. The narrator walks through the town listening to different groups.",
    body: `Le 21 juin, c'est la fête de la musique. Partout en France, les gens jouent dans la rue.

Ce soir, je marche dans le centre. Il fait encore chaud.

Devant la mairie, quatre garçons jouent de la guitare. Ils chantent en anglais.

Un peu plus loin, une vieille dame joue du piano. Son piano est dans la rue ! Les gens s'arrêtent et écoutent.

Près du pont, il y a des tambours. C'est très fort.

Je rentre à minuit. J'ai mal aux oreilles, mais je suis content.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-010",
    title: "Les abeilles du jardin",
    category: "science",
    difficulty: "A1",
    minutes: 1,
    preview: "Dans le jardin, il y a beaucoup d'abeilles.",
    blurbEn:
      "A simple explanation of what bees do in the garden, why they matter for fruit, and why they are not dangerous.",
    body: `Dans le jardin, il y a beaucoup d'abeilles. Elles arrivent au printemps.

Les abeilles aiment les fleurs jaunes et violettes. Elles vont d'une fleur à l'autre.

Elles cherchent quelque chose de sucré. C'est leur nourriture.

Mais elles font aussi un travail important. Elles transportent le pollen. Grâce à elles, nous avons des pommes, des cerises et des tomates.

Beaucoup de gens ont peur des abeilles. Ce n'est pas nécessaire. Une abeille ne pique pas sans raison.

Sans les abeilles, notre assiette est presque vide.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-011",
    title: "La lune ce soir",
    category: "science",
    difficulty: "A1",
    minutes: 1,
    preview: "Ce soir, la lune est très grande et très claire.",
    blurbEn:
      "A short, simple introduction to the moon: why it changes shape, why it has no light of its own, and how far away it is.",
    body: `Ce soir, la lune est très grande et très claire. On voit des taches grises dessus.

La lune tourne autour de la Terre. Elle met environ un mois.

Chaque nuit, sa forme change un peu. Parfois elle est ronde. Parfois c'est un petit trait blanc.

En réalité, la lune ne change pas. C'est le soleil qui l'éclaire d'un côté ou de l'autre.

La lune n'a pas de lumière. Elle reçoit la lumière du soleil.

Elle est loin : environ trois cent mille kilomètres.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-012",
    title: "Un nouveau parc en ville",
    category: "news-style",
    difficulty: "A1",
    minutes: 1,
    preview: "La ville ouvre un nouveau parc près de la gare.",
    blurbEn:
      "The town opens a new park near the station, built on an old car park, with trees, a playground and a small garden.",
    body: `La ville ouvre un nouveau parc près de la gare. Il est ouvert depuis samedi.

Avant, il y avait un parking ici. Maintenant, il y a de l'herbe et des arbres.

Le parc n'est pas très grand, mais il est agréable. Il y a trente arbres et beaucoup de bancs.

Pour les enfants, il y a un toboggan et deux balançoires.

Il y a aussi un petit jardin. Les habitants du quartier cultivent des légumes.

Le parc est ouvert tous les jours, de huit heures à vingt heures.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-013",
    title: "Le train a du retard",
    category: "news-style",
    difficulty: "A1",
    minutes: 1,
    preview: "Ce matin, le train de sept heures a trente minutes de retard.",
    blurbEn:
      "The seven o'clock train is delayed. Passengers wait on the platform and the station announces the reason and the next departure.",
    body: `Ce matin, le train de sept heures a trente minutes de retard.

Sur le quai, il y a beaucoup de voyageurs. Ils regardent leur téléphone. Certains sont fatigués.

Une voix parle dans le haut-parleur : « Le train pour Lyon arrive à sept heures trente. Nous sommes désolés. »

Un homme demande pourquoi. Une employée explique : il y a un problème technique sur la ligne.

Une femme téléphone à son bureau. Elle dit qu'elle arrive plus tard.

Le train arrive enfin. Tout le monde monte vite.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-014",
    title: "Au café du coin",
    category: "everyday life",
    difficulty: "A1",
    minutes: 1,
    preview: "Il y a un petit café au coin de ma rue.",
    blurbEn:
      "A regular describes the café on the corner, the owner who remembers every order, and the quiet hour before noon.",
    body: `Il y a un petit café au coin de ma rue. Je vais là presque tous les jours.

Le patron s'appelle Marc. Il connaît tous les clients.

Quand j'entre, il dit : « Un café et un verre d'eau ? » Il ne demande plus. Il sait.

Le matin, le café est plein. Les gens parlent, lisent le journal, regardent la rue.

Vers onze heures, c'est calme. C'est mon moment préféré.

Je choisis une table près de la fenêtre. Je regarde les gens qui passent. Je ne fais rien. C'est parfait.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-015",
    title: "Les vacances à la mer",
    category: "everyday life",
    difficulty: "A1",
    minutes: 1,
    preview: "Chaque été, ma famille va à la mer pendant deux semaines.",
    blurbEn:
      "A family's two-week seaside summer: a small house, cold morning swims, cards when it rains, and fish for dinner.",
    body: `Chaque été, ma famille va à la mer pendant deux semaines.

Nous louons une petite maison blanche. Elle n'est pas belle, mais elle est près de la plage.

Le matin, je nage. L'eau est froide à neuf heures, mais après c'est agréable.

Mon père pêche. Il ne prend jamais de poisson. Nous achetons le poisson au port.

Quand il pleut, nous jouons aux cartes. Ma sœur gagne toujours.

Le soir, nous mangeons dehors. On entend la mer.

Deux semaines, c'est court. Mais c'est bien.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-001",
    title: "Le déménagement de Paul",
    category: "everyday life",
    difficulty: "A2",
    minutes: 1,
    preview: "Samedi dernier, Paul a déménagé dans un autre quartier.",
    blurbEn:
      "Paul moves to a new neighbourhood with help from friends. The flat is smaller but brighter, and he slowly settles in.",
    body: `Samedi dernier, Paul a déménagé dans un autre quartier. Il habitait dans le centre depuis cinq ans, mais son appartement était trop cher.

Trois amis sont venus l'aider. Ils ont commencé à huit heures du matin parce qu'il faisait moins chaud.

Le plus difficile, c'était le canapé. L'escalier était étroit et il n'y avait pas d'ascenseur. Ils ont mis presque une heure.

Le nouvel appartement est plus petit, mais il y a de la lumière toute la journée. Paul aime beaucoup ça.

Le soir, les amis ont commandé des pizzas. Ils ont mangé par terre, entre les cartons.

Paul ne connaît encore personne dans le quartier. Mais la boulangère lui a déjà dit bonjour.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-002",
    title: "Apprendre à cuisiner",
    category: "everyday life",
    difficulty: "A2",
    minutes: 1,
    preview: "Quand j'étais étudiant, je ne savais pas cuisiner du tout.",
    blurbEn:
      "The narrator learned to cook after university, starting with three simple dishes and gradually gaining confidence.",
    body: `Quand j'étais étudiant, je ne savais pas cuisiner du tout. Je mangeais des pâtes presque tous les soirs.

Un jour, ma grand-mère m'a donné un vieux carnet. Dedans, il y avait dix recettes très simples, écrites à la main.

J'ai commencé par la soupe de légumes, parce que c'était la plus facile. Il faut couper, mettre de l'eau et attendre. C'est difficile de rater ça.

Après quelques semaines, j'ai essayé une tarte. La première n'était pas bonne : j'avais oublié le sucre.

Maintenant, je cuisine trois ou quatre fois par semaine. Je ne suis pas un grand chef, mais mes amis reviennent dîner.

Le carnet est toujours dans ma cuisine. Il est sale, et c'est normal.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-003",
    title: "Le marathon de la ville",
    category: "sport",
    difficulty: "A2",
    minutes: 1,
    preview: "Dimanche matin, dix mille personnes ont couru dans les rues du centre.",
    blurbEn:
      "Ten thousand runners take part in the city marathon. The report follows the winner, the crowds and a first-time runner.",
    body: `Dimanche matin, dix mille personnes ont couru dans les rues du centre. C'était le marathon de la ville.

Le départ a été donné à neuf heures, devant l'hôtel de ville. Il faisait frais, environ douze degrés. Pour les coureurs, c'était parfait.

Un jeune homme de vingt-six ans a gagné en deux heures et dix-neuf minutes. Après la course, il a dit qu'il n'y croyait pas encore.

Sur le parcours, beaucoup d'habitants sont sortis pour encourager les coureurs. Certains ont donné de l'eau, d'autres ont joué de la musique.

Nadia, quarante ans, courait son premier marathon. Elle a fini en quatre heures et demie. « J'ai eu mal partout après trente kilomètres, mais je n'ai pas voulu m'arrêter », a-t-elle expliqué.

L'année prochaine, la ville veut ouvrir la course à douze mille personnes.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-004",
    title: "Nager le matin",
    category: "sport",
    difficulty: "A2",
    minutes: 1,
    preview: "Depuis un an, je vais à la piscine trois matins par semaine.",
    blurbEn:
      "Swimming early three mornings a week has become a habit. The narrator explains why the first ten minutes are always the hardest.",
    body: `Depuis un an, je vais à la piscine trois matins par semaine. J'arrive vers sept heures, avant le travail.

Au début, c'était très dur. Il faisait nuit dehors et l'eau me semblait froide. Plusieurs fois, j'ai pensé arrêter.

Maintenant, je connais le rythme. Les dix premières minutes sont toujours désagréables, mais après, le corps s'habitue et tout devient plus facile.

Je nage pendant quarante minutes. Je ne compte plus les longueurs, parce que ça me fatigue la tête.

À la piscine, je vois souvent les mêmes personnes. Nous ne parlons pas beaucoup, mais nous nous disons bonjour.

Quand je sors, il fait jour. J'ai l'impression d'avoir déjà gagné quelque chose.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-005",
    title: "Le cinéma du quartier",
    category: "culture",
    difficulty: "A2",
    minutes: 1,
    preview: "Le petit cinéma de mon quartier a failli fermer l'année dernière.",
    blurbEn:
      "A small local cinema nearly closed, but neighbours raised money to save it. It now shows older films on Thursday evenings.",
    body: `Le petit cinéma de mon quartier a failli fermer l'année dernière. Il n'y avait plus assez de spectateurs.

Quand les habitants ont appris la nouvelle, ils ont réagi vite. Ils ont organisé une collecte et ils ont récolté presque quarante mille euros.

Le cinéma a pu rester ouvert. Il a même changé un peu : les fauteuils sont neufs et le son est meilleur.

Le jeudi soir, il passe maintenant de vieux films. C'est devenu très populaire. La salle est souvent pleine.

Anne, qui travaille ici depuis vingt ans, était très émue. « Je pensais vraiment que c'était fini », dit-elle.

Le billet coûte six euros. Ce n'est pas cher, et on peut venir à pied.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-006",
    title: "Un livre qui reste",
    category: "culture",
    difficulty: "A2",
    minutes: 1,
    preview: "Il y a un livre que je relis presque chaque hiver.",
    blurbEn:
      "The narrator rereads the same novel every winter and notices something different each time, depending on their own life.",
    body: `Il y a un livre que je relis presque chaque hiver. Je l'ai acheté d'occasion quand j'avais dix-neuf ans.

L'histoire n'est pas compliquée : un homme rentre dans son village après une longue absence et rien n'est comme avant.

La première fois, j'ai surtout retenu le voyage. À vingt ans, on aime les départs.

Plus tard, j'ai remarqué autre chose. Le livre parle beaucoup du silence entre les gens, et de ce qu'on ne dit pas.

C'est étrange : le texte ne change pas, mais je ne lis jamais le même livre.

Mon exemplaire est en mauvais état. La couverture est cassée et il y a des notes partout. Je ne veux pas en acheter un autre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-007",
    title: "Pourquoi le ciel est bleu",
    category: "science",
    difficulty: "A2",
    minutes: 1,
    preview: "Beaucoup d'enfants posent cette question, et elle est très bonne.",
    blurbEn:
      "A simple explanation of why the sky is blue and why sunsets are red, using the way light travels through the air.",
    body: `Beaucoup d'enfants posent cette question, et elle est très bonne. La réponse est plus intéressante qu'on ne pense.

La lumière du soleil semble blanche, mais elle contient en réalité toutes les couleurs. On peut le voir avec un arc-en-ciel.

Quand cette lumière entre dans l'air, elle rencontre des millions de très petites particules. Les couleurs ne réagissent pas de la même façon.

Le bleu est dévié beaucoup plus que le rouge. Il part alors dans toutes les directions et remplit le ciel. C'est pour ça que nous le voyons partout au-dessus de nous.

Le soir, c'est différent. La lumière traverse une plus grande épaisseur d'air, et le bleu se perd en chemin. Il reste surtout le rouge et l'orange.

Le ciel ne change donc pas de couleur. C'est le chemin de la lumière qui change.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-008",
    title: "Les pandas du zoo",
    category: "science",
    difficulty: "A2",
    minutes: 1,
    preview: "Deux pandas vivent au zoo depuis dix ans.",
    blurbEn:
      "Two pandas at the zoo eat bamboo for most of the day. The article explains their diet, their sleep and why they are hard to breed.",
    body: `Deux pandas vivent au zoo depuis dix ans. Ils sont arrivés de Chine et ils restent très populaires.

Un panda passe une grande partie de la journée à manger. Il consomme entre dix et vingt kilos de bambou par jour.

Pourquoi autant ? Parce que le bambou n'est pas très nourrissant. Le panda doit donc manger beaucoup et se reposer souvent.

Le reste du temps, il dort. Les visiteurs sont parfois déçus, mais c'est normal : c'est un animal calme.

Faire naître des pandas est difficile. La femelle ne peut avoir un petit que quelques jours par an.

Le zoo travaille avec des scientifiques chinois. Les jeunes pandas nés ici repartent en Chine vers quatre ans.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-009",
    title: "Trier ses déchets",
    category: "science",
    difficulty: "A2",
    minutes: 1,
    preview: "Dans ma ville, chaque immeuble a trois poubelles de couleurs différentes.",
    blurbEn:
      "How household recycling works in one town: three coloured bins, common mistakes, and why a dirty item can spoil a whole batch.",
    body: `Dans ma ville, chaque immeuble a trois poubelles de couleurs différentes. Au début, je me trompais souvent.

La poubelle jaune est pour le papier, le carton et les emballages en plastique. La verte est pour le verre. La grise est pour le reste.

L'erreur la plus fréquente, c'est de mettre un objet sale dans la poubelle jaune. Un pot plein de sauce, par exemple, peut abîmer tout un lot.

Il n'est pas nécessaire de laver longtemps. Il suffit de vider et de gratter un peu.

Une autre erreur est de mettre les sacs en plastique dans le verre. Le verre doit être seul, sans bouchon et sans couvercle.

La ville a expliqué qu'environ un quart des déchets triés sont mal triés. C'est beaucoup, mais ça peut changer facilement.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-010",
    title: "La bibliothèque ouvre le dimanche",
    category: "news-style",
    difficulty: "A2",
    minutes: 1,
    preview: "À partir du mois prochain, la bibliothèque municipale ouvrira aussi le dimanche.",
    blurbEn:
      "The town library will open on Sundays from next month, mainly for students, after a survey showed strong demand.",
    body: `À partir du mois prochain, la bibliothèque municipale ouvrira aussi le dimanche, de dix heures à dix-huit heures.

La décision a été prise après une enquête. Plus de deux mille habitants ont répondu, et une grande majorité s'est déclarée favorable.

Ce sont surtout les étudiants qui ont demandé ce changement. Beaucoup n'ont pas de place calme pour travailler chez eux.

La ville va recruter quatre personnes pour ce nouveau jour d'ouverture. Le budget augmentera d'environ soixante mille euros par an.

Certains ont critiqué cette dépense. Le maire a répondu que la bibliothèque était « le seul endroit chauffé et gratuit où l'on peut rester toute la journée ».

Les autres services, comme l'espace enfants, seront également ouverts.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-011",
    title: "Des vélos en libre-service",
    category: "news-style",
    difficulty: "A2",
    minutes: 1,
    preview: "La ville a installé trois cents vélos en libre-service au printemps.",
    blurbEn:
      "Six months after the city launched a bike-sharing scheme, usage is higher than expected, though broken bikes remain a problem.",
    body: `La ville a installé trois cents vélos en libre-service au printemps. Six mois plus tard, elle a publié les premiers résultats.

Les vélos ont été utilisés beaucoup plus que prévu : environ mille trajets par jour, surtout entre huit heures et neuf heures du matin.

La plupart des trajets sont courts, moins de trois kilomètres. Les gens s'en servent souvent pour aller à la gare.

Tout n'est pas parfait. En moyenne, un vélo sur dix ne fonctionne pas. Certains ont été abîmés, d'autres attendent une réparation.

« Nous avons sous-estimé le travail d'entretien », a reconnu une responsable du projet.

La ville va donc engager deux mécaniciens supplémentaires et ajouter cent vélos avant l'été prochain.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-012",
    title: "Une école plante un jardin",
    category: "news-style",
    difficulty: "A2",
    minutes: 1,
    preview: "Les élèves d'une école primaire ont créé un jardin dans la cour.",
    blurbEn:
      "Primary school pupils turned part of their playground into a vegetable garden, and now grow food used in the canteen.",
    body: `Les élèves d'une école primaire ont créé un jardin dans la cour. Le projet a commencé il y a un an.

Avant, cette partie de la cour était couverte de béton. Les enfants ont enlevé les pierres et apporté de la terre.

Aujourd'hui, on y trouve des tomates, des courgettes, des fraises et beaucoup d'herbes.

Chaque classe s'occupe du jardin pendant une semaine. Les élèves arrosent, enlèvent les mauvaises herbes et notent ce qu'ils observent.

Une partie des légumes est utilisée à la cantine. Le reste part à la maison, avec les enfants.

L'institutrice a remarqué un changement : « Ils goûtent des légumes qu'ils refusaient avant. Quand on a planté quelque chose, on a envie de l'essayer. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-013",
    title: "Le premier jour de travail",
    category: "everyday life",
    difficulty: "A2",
    minutes: 1,
    preview: "Mon premier jour de travail s'est mal passé, et pourtant tout va bien maintenant.",
    blurbEn:
      "A first day at work goes badly — arriving too early, forgetting names — but a colleague's kindness changes everything.",
    body: `Mon premier jour de travail s'est mal passé, et pourtant tout va bien maintenant.

Je suis arrivé quarante minutes en avance, parce que j'avais peur d'être en retard. Le bureau était fermé. J'ai attendu dehors sous la pluie.

Ensuite, on m'a présenté à quinze personnes en dix minutes. J'ai oublié tous les prénoms immédiatement.

À midi, je ne savais pas où manger. Je suis resté à mon bureau avec un sandwich, et je me suis senti un peu bête.

L'après-midi, une collègue est venue me voir. Elle m'a dit : « Le premier jour, personne ne comprend rien. Moi, j'ai pleuré dans les toilettes. »

Ça m'a fait beaucoup de bien. Aujourd'hui, c'est elle qui s'assied à côté de moi à la cantine.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-014",
    title: "De la musique dans le métro",
    category: "culture",
    difficulty: "A2",
    minutes: 1,
    preview: "Dans le métro parisien, les musiciens doivent passer un examen.",
    blurbEn:
      "Musicians who play in the Paris metro must pass an audition. Only a few hundred are selected each year from many applicants.",
    body: `Dans le métro parisien, les musiciens ne jouent pas où ils veulent. Ils doivent d'abord passer un examen.

Chaque année, plus de mille personnes se présentent. Elles jouent quelques minutes devant un jury.

Environ trois cents musiciens sont choisis. Ils reçoivent une autorisation valable six mois et peuvent jouer dans les couloirs, à des endroits précis.

Les styles sont très différents : accordéon, violon classique, chansons africaines, jazz. Le jury cherche surtout des artistes qui jouent bien et qui respectent les voyageurs.

Pour certains, c'est un vrai métier. Un violoniste explique qu'il gagne parfois mieux ici que dans une petite salle de concert.

« Les gens sont pressés », dit-il, « mais quand quelqu'un s'arrête pour écouter, c'est un beau moment. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-015",
    title: "Un voyage en train de nuit",
    category: "everyday life",
    difficulty: "A2",
    minutes: 1,
    preview: "L'été dernier, j'ai pris un train de nuit pour la première fois.",
    blurbEn:
      "A first night-train journey: a shared compartment, poor sleep, and the surprise of waking up beside the mountains.",
    body: `L'été dernier, j'ai pris un train de nuit pour la première fois. Le voyage durait onze heures.

Je partageais un compartiment avec cinq personnes que je ne connaissais pas. Au début, c'était un peu gênant. Personne ne parlait.

Puis une femme a sorti un gâteau et l'a partagé. Après ça, tout le monde a commencé à discuter.

Je n'ai pas très bien dormi. Le lit était étroit et le train s'arrêtait souvent. Vers trois heures du matin, j'ai renoncé et j'ai regardé par la fenêtre.

Au petit matin, j'ai ouvert le rideau. Il y avait des montagnes partout, encore un peu roses.

J'étais fatigué, mais je n'oublierai pas ce moment. En avion, on n'a jamais ça.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-001",
    title: "Vivre sans voiture en ville",
    category: "everyday life",
    difficulty: "B1",
    minutes: 2,
    preview: "Il y a trois ans, j'ai vendu ma voiture. Au début, j'avais peur de le regretter.",
    blurbEn:
      "A city dweller explains why they gave up their car — cost, stress and parking — and what they gained in exchange.",
    body: `Il y a trois ans, j'ai vendu ma voiture. Au début, j'avais peur de le regretter. Aujourd'hui, je pense que c'était une bonne décision.

En ville, la voiture coûte cher. Il faut payer l'essence, l'assurance et surtout le stationnement. Chaque matin, je perdais dix minutes à chercher une place.

Maintenant, je prends le bus ou mon vélo. Quand il pleut, je marche sous un parapluie. Ce n'est pas toujours agréable, mais je suis plus détendu.

Bien sûr, sans voiture, certaines choses sont plus difficiles. Faire de grandes courses, par exemple, demande un peu d'organisation. Et pour partir le week-end, je loue une voiture ou je prends le train.

Je ne dis pas que tout le monde doit faire comme moi. À la campagne, la voiture reste souvent nécessaire. Mais en ville, on peut très bien vivre autrement.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-002",
    title: "Le télétravail, deux ans après",
    category: "everyday life",
    difficulty: "B1",
    minutes: 2,
    preview: "Depuis deux ans, je travaille trois jours par semaine à la maison.",
    blurbEn:
      "After two years working partly from home, the writer weighs the freedom it brings against the loss of everyday contact with colleagues.",
    body: `Depuis deux ans, je travaille trois jours par semaine à la maison. Beaucoup de mes collègues font pareil. C'est une grande différence avec la vie d'avant.

Le télétravail a des avantages évidents. Je ne perds plus une heure dans les transports. Le matin, je commence plus tôt et je suis plus concentré. Je peux aussi déjeuner tranquillement chez moi.

Mais il y a un autre côté. À la maison, on est parfois seul toute la journée. On ne parle à personne, sauf par écran. Les petites discussions au bureau, autour d'un café, me manquent.

Je pense que le bon équilibre se trouve au milieu. Deux ou trois jours à la maison, deux ou trois jours au bureau : pour moi, c'est le mieux.

Mon entreprise a compris cela. Elle laisse chacun choisir, et je trouve que c'est une bonne idée.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-003",
    title: "Pourquoi les Français font la bise",
    category: "culture",
    difficulty: "B1",
    minutes: 2,
    preview: "Quand on arrive en France, une habitude surprend souvent : la bise.",
    blurbEn:
      "A light look at the French cheek-kiss: when to do it, how many, and why the custom confuses visitors — and some French people too.",
    body: `Quand on arrive en France, une habitude surprend souvent : la bise. Pour dire bonjour, les gens se font un ou plusieurs bisous sur la joue.

Mais attention, ce n'est pas toujours simple. Le nombre de bises change selon les régions. À Paris, on en fait souvent deux. Dans le sud, parfois trois. Dans certaines villes, une seule suffit.

En général, on fait la bise à la famille et aux amis. Entre collègues, cela dépend. Au travail, beaucoup de gens préfèrent se serrer la main.

Les étrangers ne sont pas les seuls à hésiter. Les Français aussi se trompent parfois. Faut-il commencer par la joue droite ou la joue gauche ? Personne n'est vraiment sûr.

Depuis quelques années, la bise est moins automatique. Certaines personnes préfèrent un simple bonjour, et c'est très bien aussi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-004",
    title: "Les marchés du dimanche",
    category: "culture",
    difficulty: "B1",
    minutes: 2,
    preview: "Le dimanche matin, dans beaucoup de villes françaises, il y a un marché.",
    blurbEn:
      "Why the Sunday market still matters in many French towns — not just for shopping, but as a place to meet neighbours and take your time.",
    body: `Le dimanche matin, dans beaucoup de villes françaises, il y a un marché. Les gens y vont pour acheter des fruits, des légumes, du fromage et du pain.

Mais le marché n'est pas seulement un endroit pour faire les courses. C'est aussi un lieu de rencontre. On y croise ses voisins, on discute, on prend son temps.

Les produits sont souvent plus frais qu'au supermarché. Beaucoup viennent de fermes proches de la ville. Les vendeurs connaissent leurs produits et donnent volontiers des conseils.

« Goûtez cette tomate », dit un vendeur. « Elle vient de mon jardin. »

Bien sûr, le marché coûte parfois un peu plus cher. Mais pour beaucoup de gens, l'ambiance vaut ce petit prix.

Après le marché, certains vont boire un café en terrasse. C'est une façon agréable de commencer le week-end.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-005",
    title: "Le cinéma en plein air",
    category: "culture",
    difficulty: "B1",
    minutes: 2,
    preview: "En été, quand il fait chaud, certaines villes organisent des séances de cinéma en plein air.",
    blurbEn:
      "Summer open-air cinema: watching a film under the stars, with all the small pleasures and problems that a screen indoors never has.",
    body: `En été, quand il fait chaud, certaines villes organisent des séances de cinéma en plein air. On installe un grand écran dans un parc, et les gens viennent le soir avec une couverture.

J'y suis allé pour la première fois l'année dernière. L'ambiance était très différente de celle d'une salle normale. Les enfants couraient, les gens mangeaient, on entendait les oiseaux.

Le film a commencé quand la nuit est tombée, vers dix heures. Regarder un film sous les étoiles, c'est une expérience particulière.

Il y a quand même quelques problèmes. S'il y a du vent, on entend mal. Et si un moustique décide de vous embêter, c'est fini pour la tranquillité.

Malgré tout, j'ai adoré. Cette année, je compte y retourner, mais cette fois avec un pull et un bon répulsif.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-006",
    title: "Pourquoi le ciel est bleu",
    category: "science",
    difficulty: "B1",
    minutes: 2,
    preview: "Pourquoi le ciel est-il bleu ? C'est une question que posent souvent les enfants.",
    blurbEn:
      "A simple explanation of why the daytime sky looks blue and why sunsets turn red — all down to how light travels through the air.",
    body: `Pourquoi le ciel est-il bleu ? C'est une question que posent souvent les enfants, et la réponse est plus intéressante qu'on ne le pense.

La lumière du soleil semble blanche, mais elle contient en réalité toutes les couleurs. Quand cette lumière traverse l'air, elle rencontre des millions de petites particules.

Ces particules changent la direction de la lumière. La couleur bleue est plus dispersée que les autres. C'est pour cette raison que, quand on regarde le ciel, on voit surtout du bleu.

Le soir, la lumière traverse une plus grande quantité d'air. Le bleu se perd en chemin, et ce sont le rouge et l'orange qui restent. Voilà pourquoi les couchers de soleil sont souvent rouges.

La prochaine fois que vous regarderez le ciel, vous saurez que sa couleur raconte le voyage de la lumière.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-007",
    title: "Le sommeil et la mémoire",
    category: "science",
    difficulty: "B1",
    minutes: 2,
    preview: "Beaucoup d'étudiants pensent qu'il faut travailler tard le soir pour réussir.",
    blurbEn:
      "Why a good night's sleep helps you remember what you learned — and why staying up late to study often does more harm than good.",
    body: `Beaucoup d'étudiants pensent qu'il faut travailler tard le soir pour réussir. Pourtant, les scientifiques disent souvent le contraire.

Pendant la nuit, le cerveau ne se repose pas complètement. Il continue à travailler. Il range les informations de la journée et garde les plus importantes. C'est pendant le sommeil qu'on mémorise vraiment ce qu'on a appris.

Une personne qui ne dort pas assez oublie plus vite. Elle a aussi plus de mal à se concentrer le lendemain. Étudier toute la nuit avant un examen n'est donc pas une bonne idée.

Les chercheurs conseillent de dormir entre sept et neuf heures. Ils recommandent aussi de réviser un peu chaque jour, plutôt que tout d'un coup.

Alors, avant un examen important, le meilleur conseil est peut-être simple : fermez vos livres et allez dormir.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-008",
    title: "Les abeilles et les villes",
    category: "science",
    difficulty: "B1",
    minutes: 2,
    preview: "Quand on pense aux abeilles, on imagine la campagne.",
    blurbEn:
      "Bees are moving into cities, where rooftops and parks can suit them better than the countryside. A look at why, and why it matters.",
    body: `Quand on pense aux abeilles, on imagine la campagne. Pourtant, depuis quelques années, on installe de plus en plus de ruches en ville, sur les toits des immeubles.

Cela peut sembler étrange, mais les abeilles vivent parfois mieux en ville qu'à la campagne. Dans les champs, on utilise beaucoup de produits chimiques qui les rendent malades. En ville, ces produits sont moins présents.

De plus, les parcs et les jardins offrent des fleurs différentes pendant une grande partie de l'année. Les abeilles trouvent donc de la nourriture plus facilement.

Les abeilles sont très importantes pour la nature. Sans elles, beaucoup de plantes ne pourraient pas se reproduire. Une grande partie de ce que nous mangeons dépend de leur travail.

Protéger les abeilles, même en ville, c'est donc protéger notre alimentation.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-009",
    title: "Courir un premier marathon",
    category: "sport",
    difficulty: "B1",
    minutes: 2,
    preview: "L'année dernière, j'ai décidé de courir mon premier marathon.",
    blurbEn:
      "Preparing for a first marathon: the months of training, the doubts, and what really carries you through the last, hardest kilometres.",
    body: `L'année dernière, j'ai décidé de courir mon premier marathon. Quarante-deux kilomètres : au début, ce chiffre me faisait peur.

Je me suis entraîné pendant quatre mois. Je courais trois fois par semaine, un peu plus longtemps à chaque fois. Certains jours, j'étais fatigué et je n'avais pas envie de sortir. Mais je pensais au jour de la course, et cela me donnait de l'énergie.

Le jour du marathon, il faisait frais. Les premiers kilomètres sont passés vite. Après trente kilomètres, mes jambes sont devenues très lourdes.

Ce qui m'a aidé, ce sont les gens dans la rue. Ils criaient, ils applaudissaient. Grâce à eux, j'ai continué.

Quand j'ai franchi la ligne d'arrivée, j'étais épuisé mais très fier. Je comprends maintenant pourquoi tant de gens aiment ce sport.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-010",
    title: "La natation, un sport pour tous",
    category: "sport",
    difficulty: "B1",
    minutes: 2,
    preview: "La natation est l'un des sports les plus complets.",
    blurbEn:
      "Why swimming suits almost everyone — gentle on the body, good for the mind, and possible at any age.",
    body: `La natation est l'un des sports les plus complets. Elle fait travailler presque tous les muscles du corps, mais sans les abîmer.

Contrairement à la course, la natation est douce pour les articulations. Dans l'eau, le corps est plus léger. C'est pour cette raison que ce sport convient à presque tout le monde : aux enfants, aux personnes âgées, et à ceux qui ont mal au dos.

Nager est aussi bon pour la tête. Beaucoup de gens disent qu'après quelques longueurs, ils se sentent plus calmes. Le bruit de l'eau, le rythme régulier des mouvements : tout cela aide à oublier les soucis de la journée.

On peut commencer à tout âge. Il n'est jamais trop tard pour apprendre à nager.

Le seul vrai conseil, c'est la régularité. Nager une fois par mois ne sert à rien ; deux fois par semaine change tout.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-011",
    title: "L'escalade, un sport qui monte",
    category: "sport",
    difficulty: "B1",
    minutes: 2,
    preview: "Il y a quelques années, l'escalade était un sport rare, réservé à la montagne.",
    blurbEn:
      "Climbing has moved from cliffs to indoor gyms in the city, winning new fans — a sport that's as much about thinking as strength.",
    body: `Il y a quelques années, l'escalade était un sport rare, réservé à la montagne. Aujourd'hui, on trouve des salles d'escalade dans presque toutes les grandes villes.

Dans ces salles, on grimpe sur des murs artificiels, avec des prises de toutes les couleurs. Chaque couleur indique un chemin, plus ou moins difficile. On peut donc commencer doucement et progresser à son rythme.

Beaucoup de gens pensent que l'escalade demande surtout de la force. En réalité, c'est aussi un sport de réflexion. Avant de monter, il faut observer le mur et choisir où mettre les mains et les pieds.

L'escalade se pratique souvent à deux. Une personne grimpe, l'autre tient la corde et assure sa sécurité. Il faut donc avoir confiance en son partenaire.

C'est peut-être pour cela que ce sport plaît autant : on progresse ensemble, sans vraiment être en compétition.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-012",
    title: "Apprendre à cuisiner seul",
    category: "everyday life",
    difficulty: "B1",
    minutes: 2,
    preview: "Quand j'ai quitté la maison de mes parents, je ne savais pas cuisiner.",
    blurbEn:
      "Leaving home means learning to cook. The writer recalls early disasters and how a few simple recipes turned cooking into a pleasure.",
    body: `Quand j'ai quitté la maison de mes parents, je ne savais pas cuisiner. Les premières semaines, je mangeais surtout des pâtes et des pizzas surgelées.

Très vite, j'en ai eu assez. Manger la même chose tous les jours devient vite ennuyeux, et ce n'était pas très bon pour ma santé.

J'ai donc commencé à apprendre, petit à petit. Ma grand-mère m'a donné quelques recettes simples. Au début, j'ai fait beaucoup d'erreurs. Une fois, j'ai complètement brûlé un gâteau et la cuisine a senti le brûlé pendant deux jours.

Mais peu à peu, j'ai progressé. J'ai compris qu'il ne faut pas beaucoup de choses pour bien manger : des légumes frais, un peu de patience et quelques idées.

Aujourd'hui, cuisiner n'est plus une corvée. C'est devenu un vrai plaisir, surtout quand je reçois des amis.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-013",
    title: "La musique dans le métro",
    category: "culture",
    difficulty: "B1",
    minutes: 2,
    preview: "Dans le métro de Paris, on croise souvent des musiciens.",
    blurbEn:
      "The musicians who play in the Paris metro pass a real audition to be there. A look at the small daily concerts most passengers barely notice.",
    body: `Dans le métro de Paris, on croise souvent des musiciens. Un guitariste, une chanteuse, parfois un petit groupe : ils jouent sur les quais ou dans les couloirs.

Ce que beaucoup de gens ignorent, c'est que ces musiciens ne sont pas là par hasard. Pour jouer dans le métro, il faut passer une sorte d'examen. Chaque année, des centaines de personnes se présentent, et seules certaines sont choisies.

La plupart des voyageurs passent sans s'arrêter. Ils sont pressés, ils pensent à leur travail. Pourtant, de temps en temps, quelqu'un ralentit, écoute un moment et sourit.

Pour les musiciens, le métro est un endroit difficile. Il y a du bruit, du passage, et il faut jouer pendant des heures. Mais c'est aussi une façon de se faire connaître.

Certains artistes célèbres ont commencé ainsi, en bas des escaliers, guitare à la main.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-014",
    title: "Réduire ses déchets",
    category: "science",
    difficulty: "B1",
    minutes: 2,
    preview: "Chaque année, une personne produit des centaines de kilos de déchets.",
    blurbEn:
      "Small changes that cut how much rubbish a household throws away — and why the writer found it easier, and cheaper, than expected.",
    body: `Chaque année, une personne produit des centaines de kilos de déchets. En y réfléchissant, j'ai eu envie de réduire les miens.

J'ai commencé par des gestes simples. Au lieu d'acheter de l'eau en bouteille, je bois l'eau du robinet. Je fais mes courses avec un sac en tissu, et j'achète certains produits sans emballage.

J'ai aussi appris à mieux garder les aliments. Avant, je jetais souvent des fruits ou des légumes oubliés au fond du frigo. Maintenant, je fais plus attention, et je cuisine ce qui reste.

Au début, je pensais que ce serait compliqué. En réalité, ces habitudes sont vite devenues naturelles. Et j'ai remarqué une chose intéressante : je dépense moins d'argent qu'avant.

Je ne suis pas parfait, loin de là. Mais je crois que si chacun fait un petit effort, cela finit par compter.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-015",
    title: "Le yoga au bureau",
    category: "sport",
    difficulty: "B1",
    minutes: 2,
    preview: "Dans certaines entreprises, on propose maintenant des séances de yoga pendant la journée de travail.",
    blurbEn:
      "Some companies now offer yoga sessions at work. A sceptic tries a class and is surprised by how much difference a short break makes.",
    body: `Dans certaines entreprises, on propose maintenant des séances de yoga pendant la journée de travail. Au début, je trouvais cette idée un peu étrange.

Je passe des heures assis devant un ordinateur. Le soir, j'ai souvent mal au dos et au cou. Un collègue m'a conseillé d'essayer le cours de yoga proposé le midi. J'ai accepté, sans grand enthousiasme.

La séance durait trente minutes. Nous avons fait des mouvements lents et des exercices de respiration. Je pensais m'ennuyer, mais le temps est passé vite.

En retournant à mon bureau, je me suis senti différent. J'étais plus calme et plus concentré. L'après-midi, j'ai mieux travaillé que d'habitude.

Depuis, j'y vais chaque semaine. Je ne suis pas devenu un expert, et je reste assez raide. Mais ces trente minutes sont devenues un moment important de ma semaine.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-001",
    title: "Faut-il traduire les titres de films ?",
    category: "culture",
    difficulty: "B2",
    minutes: 2,
    preview: "En France, les titres de films étrangers posent une question curieuse.",
    blurbEn:
      "Why some foreign film titles get translated into French and others don't — and what these choices reveal about language and marketing.",
    body: `En France, les titres de films étrangers posent une question curieuse. Certains sont traduits, d'autres sont gardés en anglais, et parfois on remplace un titre anglais par… un autre titre anglais, plus simple.

Ce choix n'a rien d'automatique. Il dépend souvent du marketing. Les distributeurs pensent qu'un titre court et facile à prononcer attirera plus de spectateurs. Peu importe, alors, que le public comprenne ou non le sens exact.

Certains regrettent cette habitude. Selon eux, garder les titres en anglais montre que la langue française perd du terrain. D'autres, au contraire, trouvent cela normal dans un monde où l'anglais est partout.

Il est difficile de donner raison à un seul camp. Une belle traduction peut enrichir un titre ; une mauvaise peut le rendre ridicule.

Ce petit détail en dit long sur notre rapport aux langues : nous voulons rester ouverts au monde sans pour autant oublier qui nous sommes.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-002",
    title: "La disparition des petits commerces",
    category: "culture",
    difficulty: "B2",
    minutes: 2,
    preview: "Dans de nombreux villages français, les petits commerces ferment les uns après les autres.",
    blurbEn:
      "As big stores and online shopping spread, small neighbourhood shops are closing. What does a town lose when its last baker shuts?",
    body: `Dans de nombreux villages français, les petits commerces ferment les uns après les autres. La boulangerie, l'épicerie, le café : autrefois au cœur de la vie locale, ils disparaissent peu à peu.

Les raisons sont connues. Les grandes surfaces, souvent situées à l'extérieur des villes, proposent des prix plus bas. À cela s'ajoutent les achats sur Internet, qui permettent de tout commander sans sortir de chez soi.

On pourrait croire qu'il s'agit d'un simple problème économique. Pourtant, l'enjeu est plus profond. Quand la dernière boulangerie ferme, ce n'est pas seulement un magasin qui disparaît. C'est un lieu où les habitants se retrouvaient, se parlaient, se connaissaient.

Certaines communes réagissent. Elles aident les commerçants à s'installer, ou ouvrent des magasins gérés par le village lui-même.

Rien ne garantit que ces efforts suffisent. Mais ils montrent au moins que beaucoup refusent de voir mourir leur centre-ville sans réagir.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-003",
    title: "L'intelligence artificielle et le travail",
    category: "science",
    difficulty: "B2",
    minutes: 2,
    preview: "Depuis quelques années, l'intelligence artificielle occupe une grande place dans les discussions sur l'avenir du travail.",
    blurbEn:
      "Will AI take our jobs or change them? A measured look beyond the headlines at which tasks machines do well and which still need people.",
    body: `Depuis quelques années, l'intelligence artificielle occupe une grande place dans les discussions sur l'avenir du travail. Certains annoncent la disparition de millions d'emplois ; d'autres promettent une nouvelle révolution positive.

La vérité se trouve sans doute entre les deux. Les machines sont désormais capables d'accomplir des tâches que l'on croyait réservées aux humains : rédiger des textes, analyser des images, répondre à des questions.

Cependant, il serait exagéré de penser qu'elles remplaceront tout. L'intelligence artificielle réussit là où il faut traiter beaucoup d'informations rapidement. Elle échoue encore lorsqu'il s'agit de comprendre une situation humaine, de faire preuve de créativité ou de prendre une décision difficile.

Le plus probable, c'est que de nombreux métiers changent plutôt qu'ils ne disparaissent. Il faudra apprendre à travailler avec ces outils, comme on a appris autrefois à utiliser l'ordinateur.

La vraie question n'est peut-être pas de savoir si la machine nous remplacera, mais ce que nous choisirons de lui confier.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-004",
    title: "Le climat et nos habitudes alimentaires",
    category: "science",
    difficulty: "B2",
    minutes: 2,
    preview: "On parle beaucoup des transports lorsqu'on évoque le climat, mais on oublie souvent notre assiette.",
    blurbEn:
      "Food choices have a real effect on the climate. The piece explains why, without lecturing, and argues that small shifts beat impossible rules.",
    body: `On parle beaucoup des transports lorsqu'on évoque le climat, mais on oublie souvent notre assiette. Or, la façon dont nous nous nourrissons a un effet important sur l'environnement.

Produire de la viande, en particulier, demande énormément d'eau, de terres et d'énergie. Cela ne signifie pas qu'il faille arrêter complètement d'en manger. Mais réduire un peu sa consommation change déjà les choses.

Manger des produits de saison et cultivés près de chez soi aide également. Une tomate qui pousse dans la région en été a bien moins d'impact qu'une tomate cultivée sous serre en hiver.

Il ne s'agit pas de culpabiliser chacun pour le moindre repas. Personne ne peut être parfait, et une règle trop stricte décourage vite.

L'important, c'est peut-être de comprendre que nos choix quotidiens, additionnés à ceux de millions de personnes, finissent par peser lourd — dans un sens comme dans l'autre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-005",
    title: "Le droit à la déconnexion",
    category: "everyday life",
    difficulty: "B2",
    minutes: 2,
    preview: "Avec les téléphones et les ordinateurs portables, la frontière entre le travail et la vie privée est devenue floue.",
    blurbEn:
      "Should your boss email you at 10pm? France gave workers a 'right to disconnect' — but can a law really change habits?",
    body: `Avec les téléphones et les ordinateurs portables, la frontière entre le travail et la vie privée est devenue floue. On peut désormais recevoir un message professionnel à n'importe quelle heure, même le soir ou le week-end.

Pour répondre à ce problème, la France a introduit ce qu'on appelle le « droit à la déconnexion ». L'idée est simple : un salarié n'est pas obligé de répondre aux messages en dehors de ses heures de travail.

Sur le papier, cette mesure semble excellente. Dans la réalité, les choses sont plus compliquées. Beaucoup de gens continuent de consulter leurs courriels le soir, par habitude ou par peur de prendre du retard.

Une loi peut poser un principe, mais elle ne change pas facilement les comportements. Il faudrait aussi que les entreprises encouragent réellement leurs employés à se déconnecter.

Tant que répondre vite sera vu comme une preuve de sérieux, ce droit restera, pour beaucoup, une belle idée difficile à appliquer.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-006",
    title: "Vivre en ville ou à la campagne",
    category: "everyday life",
    difficulty: "B2",
    minutes: 2,
    preview: "Faut-il vivre en ville ou à la campagne ? Cette question, ancienne, revient régulièrement.",
    blurbEn:
      "The old debate between city and countryside, seen fresh after many people rethought where they wanted to live. Neither side wins easily.",
    body: `Faut-il vivre en ville ou à la campagne ? Cette question, ancienne, revient régulièrement, surtout depuis que beaucoup de gens ont repensé leur mode de vie.

La ville offre des avantages évidents : le travail, les transports, la culture, les rencontres. Tout est proche, tout va vite. Mais cette énergie a un prix. Les logements sont chers et souvent petits, l'air est moins pur, et le bruit ne s'arrête jamais vraiment.

La campagne, elle, promet le calme, l'espace et un contact plus direct avec la nature. Pourtant, elle a aussi ses difficultés. Sans voiture, on se déplace mal, et certains services sont loin.

Il n'existe pas de réponse universelle. Ce qui convient à une personne peut ne pas convenir à une autre.

Peut-être que l'essentiel n'est pas le lieu lui-même, mais l'accord entre cet endroit et la vie que l'on souhaite vraiment mener.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-007",
    title: "Pourquoi lit-on encore des romans ?",
    category: "culture",
    difficulty: "B2",
    minutes: 3,
    preview: "À une époque où tout va vite, on pourrait croire que le roman est condamné.",
    blurbEn:
      "In a world of screens and short videos, why do people still spend hours with a novel? A reflection on what fiction gives that nothing else does.",
    body: `À une époque où tout va vite, où les écrans proposent des vidéos de quelques secondes, on pourrait croire que le roman est condamné. Pourquoi passer des heures sur un livre alors que tant de distractions plus rapides existent ?

Et pourtant, les gens continuent de lire. Chaque année, des millions de romans se vendent dans le monde. Ce succès mérite qu'on s'y intéresse.

Le roman offre quelque chose de rare : le temps. Il nous oblige à ralentir, à suivre une histoire, à entrer dans la tête d'un personnage. Contrairement à une image, il ne montre pas tout ; il laisse le lecteur imaginer.

Lire un roman, c'est aussi vivre, l'espace de quelques pages, une vie qui n'est pas la nôtre. On comprend mieux les autres lorsqu'on a partagé, même par la fiction, leurs doutes et leurs joies.

Il se peut que la forme du livre change avec le temps. Mais le besoin de récits, lui, ne disparaîtra sans doute jamais.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-008",
    title: "Les réseaux sociaux et l'attention",
    category: "science",
    difficulty: "B2",
    minutes: 3,
    preview: "Les réseaux sociaux sont devenus une partie de notre quotidien.",
    blurbEn:
      "Why apps are designed to keep you scrolling, what that does to concentration, and small ways to take back control of your own attention.",
    body: `Les réseaux sociaux sont devenus une partie de notre quotidien. Nous les consultons dans le bus, au réveil, parfois même au milieu d'une conversation. Ce comportement n'a rien de surprenant : ces applications sont conçues pour capter notre attention.

Chaque notification, chaque nouvelle image nous pousse à rester un peu plus longtemps. Les entreprises qui créent ces outils étudient précisément ce qui nous retient. Plus nous passons de temps sur l'écran, plus elles gagnent d'argent.

Le problème, c'est que notre capacité de concentration en souffre. Après avoir sauté d'une vidéo à l'autre pendant une heure, il devient difficile de lire un texte long ou de réfléchir calmement.

Il ne s'agit pas de tout rejeter. Ces outils ont aussi des avantages réels. Mais il serait sage de reprendre un peu de contrôle : couper les notifications, poser son téléphone pendant les repas, choisir quand le regarder plutôt que de le subir.

Notre attention est précieuse. Il vaut la peine de décider nous-mêmes à quoi nous la donnons.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-009",
    title: "Le sport de haut niveau et l'argent",
    category: "sport",
    difficulty: "B2",
    minutes: 2,
    preview: "Le sport professionnel n'a jamais brassé autant d'argent qu'aujourd'hui.",
    blurbEn:
      "Huge salaries and sponsorships have transformed elite sport. What is gained and lost when a game becomes a global business?",
    body: `Le sport professionnel n'a jamais brassé autant d'argent qu'aujourd'hui. Les meilleurs joueurs gagnent des sommes énormes, et les grands clubs ressemblent de plus en plus à de véritables entreprises.

Cette évolution a des côtés positifs. Grâce à cet argent, les compétitions sont mieux organisées, les stades plus modernes, et le spectacle plus impressionnant. De nombreux jeunes rêvent de devenir sportifs, et certains y parviennent.

Cependant, tout n'est pas si simple. Lorsque l'argent domine, la passion passe parfois au second plan. On voit des clubs acheter des joueurs à des prix impossibles, pendant que de petites équipes peinent à survivre.

Il est légitime de se demander jusqu'où cela peut aller. Le risque, c'est que le sport devienne un simple produit, où seul compte le résultat financier.

Le défi des années à venir sera sans doute de garder l'équilibre : profiter de cet argent sans oublier ce qui, au départ, rend le sport si beau.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-010",
    title: "La cuisine française à l'étranger",
    category: "culture",
    difficulty: "B2",
    minutes: 2,
    preview: "À l'étranger, on trouve des restaurants français dans presque toutes les grandes villes.",
    blurbEn:
      "French dishes served abroad are often not quite what a French person would recognise. A betrayal, or simply how food travels and lives?",
    body: `À l'étranger, on trouve des restaurants français dans presque toutes les grandes villes. Pourtant, ce qu'on y sert ne ressemble pas toujours à ce qu'un Français mangerait chez lui.

Les plats sont souvent adaptés au goût local. Une recette peut devenir plus sucrée, plus épicée ou plus copieuse, selon le pays. Certains puristes s'en indignent : pour eux, il s'agit presque d'une trahison.

On peut pourtant voir les choses autrement. Une cuisine qui voyage est une cuisine vivante. En passant d'un pays à l'autre, un plat se transforme, se mélange à d'autres traditions et donne parfois naissance à quelque chose de nouveau.

Après tout, la cuisine française elle-même s'est construite au fil des siècles, en empruntant des produits et des idées venus d'ailleurs.

Il n'est donc pas nécessaire qu'un plat reste identique pour qu'il ait de la valeur. Ce qui compte, c'est peut-être moins la fidélité à une recette que le plaisir qu'on éprouve à la table.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-011",
    title: "Faut-il avoir peur des microbes ?",
    category: "science",
    difficulty: "B2",
    minutes: 2,
    preview: "Lorsqu'on entend le mot « microbe », on pense aussitôt à la maladie.",
    blurbEn:
      "Not all bacteria are enemies. How the microbes living in and on us keep us healthy — and why too much cleanliness can backfire.",
    body: `Lorsqu'on entend le mot « microbe », on pense aussitôt à la maladie. Pourtant, la grande majorité des micro-organismes qui nous entourent ne sont pas dangereux, et beaucoup nous sont même indispensables.

Notre corps abrite des milliards de bactéries, en particulier dans l'intestin. Loin de nous nuire, elles nous aident à digérer, à nous défendre contre certaines maladies et à rester en bonne santé.

Depuis quelques années, les scientifiques s'y intéressent de près. Ils ont découvert que l'équilibre de ces bactéries jouait un rôle bien plus grand qu'on ne le croyait.

Ce savoir change notre regard sur la propreté. Se laver reste évidemment important. Mais vouloir tout désinfecter en permanence peut se retourner contre nous, car cela détruit aussi de bonnes bactéries.

Il ne faut donc pas avoir peur des microbes en général. Le véritable enjeu n'est pas de tous les éliminer, mais d'apprendre à vivre avec eux dans un juste équilibre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-012",
    title: "Le minimalisme, mode ou choix ?",
    category: "everyday life",
    difficulty: "B2",
    minutes: 2,
    preview: "Depuis quelques années, le minimalisme est à la mode.",
    blurbEn:
      "Owning less has become fashionable. The writer, once sceptical, asks whether minimalism is a real philosophy or just another thing to buy into.",
    body: `Depuis quelques années, le minimalisme est à la mode. Des livres, des vidéos et des articles nous invitent à posséder moins d'objets pour vivre mieux. J'ai longtemps regardé cette tendance avec méfiance.

Au début, elle me semblait un peu artificielle. Comment un magazine pouvait-il, à la fois, me vendre des produits et me conseiller d'en acheter moins ? Il y avait là une contradiction évidente.

Puis j'ai fait un simple test : j'ai trié mes affaires et donné ce que je n'utilisais plus. À ma grande surprise, je me suis senti plus léger. Un logement moins encombré est aussi, d'une certaine façon, un esprit plus tranquille.

Je ne crois pas pour autant qu'il faille tomber dans l'excès. Vivre presque sans rien n'a rien d'un idéal en soi.

Le minimalisme n'est peut-être ni une mode ni une philosophie, mais une question toute simple : de quoi ai-je vraiment besoin pour être bien ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-013",
    title: "Les langues régionales de France",
    category: "culture",
    difficulty: "B2",
    minutes: 2,
    preview: "On pense souvent que l'on parle une seule langue en France : le français.",
    blurbEn:
      "Breton, Occitan, Alsatian and more: France has many regional languages, long discouraged and now fragile. Can they still be saved?",
    body: `On pense souvent que l'on parle une seule langue en France : le français. En réalité, le pays compte de nombreuses langues régionales, comme le breton, l'occitan, le corse ou l'alsacien.

Pendant longtemps, ces langues ont été découragées, surtout à l'école. On demandait aux enfants de parler uniquement le français, et beaucoup de familles ont cessé de transmettre la langue de leurs grands-parents.

Résultat : aujourd'hui, la plupart de ces langues sont fragiles. Certaines ne sont plus parlées que par des personnes âgées, et risquent de disparaître dans les décennies à venir.

Pourtant, un mouvement inverse existe. Des écoles proposent un enseignement dans ces langues, et de jeunes parents choisissent d'y inscrire leurs enfants. Des chanteurs, des écrivains les font vivre autrement.

Sauver une langue n'est jamais facile, car il ne suffit pas de l'étudier : il faut qu'elle soit parlée au quotidien. Mais tant que des gens y tiennent, rien n'est vraiment perdu.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-014",
    title: "L'eau, une ressource fragile",
    category: "science",
    difficulty: "B2",
    minutes: 3,
    preview: "Quand on ouvre le robinet, l'eau coule sans effort, et l'on oublie facilement qu'il s'agit d'une ressource limitée.",
    blurbEn:
      "Fresh water can feel unlimited from a tap, but it isn't. Why shortages are spreading and why the way we use water must change.",
    body: `Quand on ouvre le robinet, l'eau coule sans effort, et l'on oublie facilement qu'il s'agit d'une ressource limitée. Sur l'ensemble de la planète, l'eau douce, celle que nous pouvons boire, représente une très petite partie de toute l'eau existante.

Pendant longtemps, dans les pays riches, on a considéré cette ressource comme presque infinie. Mais les choses changent. Les périodes de sécheresse deviennent plus fréquentes, et certaines régions manquent d'eau à certains moments de l'année.

L'agriculture, l'industrie et les villes en consomment d'énormes quantités. Il ne serait pas raisonnable de continuer comme si de rien n'était.

Réduire le gaspillage est possible à tous les niveaux : réparer les fuites, arroser moins, choisir des cultures adaptées au climat.

Il est encore temps d'agir, mais à condition de prendre le problème au sérieux dès maintenant. L'eau paraît ordinaire justement parce qu'elle est essentielle ; c'est peut-être pour cela qu'on la protège trop peu.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-015",
    title: "Marcher, le sport le plus simple",
    category: "sport",
    difficulty: "B2",
    minutes: 2,
    preview: "Parmi tous les sports, il en existe un que l'on néglige souvent, parce qu'il paraît trop simple : la marche.",
    blurbEn:
      "No gym, no gear, no cost: walking may be the most underrated exercise there is. The case for putting one foot in front of the other.",
    body: `Parmi tous les sports, il en existe un que l'on néglige souvent, parce qu'il paraît trop simple : la marche. Pas besoin de matériel, d'abonnement ni de talent particulier. Il suffit de mettre un pied devant l'autre.

Pourtant, ses bienfaits sont réels. Marcher régulièrement est bon pour le cœur, aide à garder la forme et réduit le stress. Contrairement à des sports plus intenses, la marche ne présente presque aucun risque, et convient à tous les âges.

Elle a aussi un avantage que d'autres activités n'ont pas : on peut l'intégrer facilement à sa journée. Descendre un arrêt plus tôt, prendre l'escalier, faire une petite promenade après le déjeuner — ces gestes finissent par compter.

Marcher offre enfin un temps rare : celui où l'on ne fait rien d'autre que réfléchir, ou simplement observer ce qui nous entoure.

Il n'est donc pas nécessaire de courir un marathon pour prendre soin de soi. Parfois, il suffit de marcher.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-016",
    title: "Le bus numéro 12",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Camille prend le bus numéro 12 tous les matins.",
    blurbEn:
      "Camille rides the number 12 bus every morning and knows all its regulars. One day the bus breaks down, and the walk to school with a classmate turns a bad morning into a good one.",
    body: `Camille prend le bus numéro 12 tous les matins. Le bus arrive à huit heures, devant la boulangerie. Camille attend toujours au même endroit, avec son sac bleu sur le dos.

Elle connaît bien les passagers du matin. Il y a une dame avec un petit chien blanc. Il y a un monsieur qui lit le journal. Il y a aussi deux étudiants qui dorment presque debout. Le chauffeur s'appelle Bruno. Il dit bonjour à tout le monde.

Camille aime s'asseoir près de la fenêtre. Elle regarde la ville : les magasins ouvrent, les gens marchent vite, un vélo passe entre les voitures. Le trajet dure vingt minutes. Parfois, elle écoute de la musique. Parfois, elle regarde simplement dehors.

Mais ce matin, il y a un problème. Le bus s'arrête au milieu de la rue. Bruno se retourne et dit : « Le bus est en panne. Je suis désolé. Il faut descendre. »

Tout le monde descend. La dame au petit chien n'est pas contente. Camille regarde sa montre : l'école commence dans trente minutes.

Alors, elle marche. Après deux minutes, elle entend une voix : « Camille ! Attends-moi ! » C'est Hugo, un garçon de sa classe. Il était aussi dans le bus.

Ils marchent ensemble. Ils parlent de l'école, du week-end, d'un film drôle. Le chemin passe très vite.

Ils arrivent à l'école juste à l'heure. Camille sourit. Finalement, une panne de bus, ce n'est pas toujours une mauvaise nouvelle.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-017",
    title: "Ma sœur et moi",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "J'ai une grande sœur. Elle s'appelle Julie.",
    blurbEn:
      "A boy describes life with his big sister Julie: the shared room, the small fights, the Saturday drawing sessions, and why she is still his best friend.",
    body: `J'ai une grande sœur. Elle s'appelle Julie et elle a seize ans. Moi, j'ai onze ans. Julie est grande et elle a les cheveux bruns. Moi, je suis petit et j'ai les cheveux blonds. Les gens disent : « Vous n'êtes pas frère et sœur ! » Mais si.

Nous partageons une petite chambre. Il y a deux lits, un bureau et une grande armoire. Sur le mur de Julie, il y a des dessins. Sur mon mur, il y a des posters de football.

Julie adore dessiner. Elle dessine tous les jours : des visages, des animaux, des maisons. Moi, j'aime les jeux vidéo et le sport. Nous sommes très différents.

Parfois, nous ne sommes pas d'accord. Julie veut du silence pour dessiner. Moi, je veux jouer avec mes amis en ligne. Elle dit : « Tu fais trop de bruit ! » Je réponds : « C'est ma chambre aussi ! » Maman arrive et dit : « Du calme, les enfants. »

Mais le samedi matin, c'est notre moment. Julie me montre ses nouveaux dessins. Ensuite, elle dessine pour moi. La semaine dernière, elle a dessiné mon joueur de football préféré. Le dessin est maintenant sur mon mur, entre deux posters.

Le soir, avant de dormir, nous parlons dans le noir. Julie raconte sa journée au lycée. Moi, je raconte mon école. Souvent, nous rions doucement, parce que les parents dorment.

Julie est ma sœur, mais c'est aussi ma meilleure amie. Je ne le dis pas souvent. Elle le sait, je pense.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-018",
    title: "Le dimanche chez mes grands-parents",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le dimanche, nous allons chez mes grands-parents.",
    blurbEn:
      "A full Sunday at the grandparents' house in the country: grandpa's roast chicken, grandma's stories from her childhood, a walk to see the neighbour's horses, and cake before the drive home.",
    body: `Le dimanche, nous allons chez mes grands-parents. Ils habitent à la campagne, dans une maison blanche avec un grand jardin. La route dure une heure. Dans la voiture, je regarde les champs et les vaches.

Quand nous arrivons, mon grand-père est déjà dans la cuisine. Il prépare le déjeuner : un poulet avec des pommes de terre et des légumes du jardin. Ça sent très bon dans toute la maison. « À table ! » dit-il à midi. C'est sa phrase préférée.

Pendant le repas, ma grand-mère raconte des histoires. Elle parle de son enfance, il y a longtemps. À cette époque, il n'y avait pas de télévision dans le village. Les enfants jouaient dehors toute la journée. J'aime beaucoup l'écouter. Mon père dit : « Maman, tu racontes toujours la même histoire ! » Mais il sourit.

Après le déjeuner, il y a toujours un gâteau. Aujourd'hui, c'est un gâteau au chocolat, mon préféré. Ma grand-mère me donne une deuxième part. « Ne dis rien à ta mère », dit-elle.

L'après-midi, nous marchons jusqu'à la ferme du voisin. Il a trois chevaux. Je donne une pomme au cheval brun. Sa bouche est douce et chaude. Mon grand-père me montre les oiseaux et me dit leurs noms.

Le soir, il faut partir. Ma grand-mère nous donne des légumes du jardin et un pot de confiture. « À dimanche prochain ! » dit-elle depuis la porte.

Dans la voiture, je dors un peu. Le dimanche chez mes grands-parents, c'est mon jour préféré de la semaine.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-019",
    title: "J'aime le thé",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "J'aime beaucoup le thé. J'en bois tous les jours.",
    blurbEn:
      "A small love letter to tea: black in the morning, green in the afternoon, a visit to a tea shop full of coloured boxes, and the grandmother who started it all.",
    body: `J'aime beaucoup le thé. J'en bois tous les jours, du matin au soir. Le café ? Non merci. Le thé, c'est ma boisson.

Le matin, je prends un thé noir. Il est fort et il me réveille. Je le bois dans ma grande tasse rouge, à la fenêtre de la cuisine. Dehors, la rue est encore calme.

L'après-midi, je préfère un thé vert. Il est plus léger. Je le bois au bureau, vers quatre heures. C'est ma petite pause. Mes collègues prennent un café. Moi, je sors mon thé, et ils sourient.

Je bois mon thé chaud, avec un peu de miel. Je ne mets jamais de sucre. Et jamais de lait ! Chacun ses goûts.

Samedi dernier, j'ai trouvé un magasin de thé dans le centre-ville. Quel endroit ! Sur les murs, il y a des centaines de boîtes de toutes les couleurs. Un thé à la menthe, un thé aux fruits rouges, un thé au jasmin. La vendeuse me fait sentir les feuilles. Chaque boîte est un petit voyage. J'achète trois thés différents. C'est un peu cher, mais je suis content.

Pourquoi j'aime le thé ? C'est une histoire de famille. Ma grand-mère buvait du thé tous les jours, à cinq heures. Petite, je buvais une tasse avec elle, avec beaucoup de miel. Nous parlions de tout. Le thé a le goût de ces moments.

Ce soir, il pleut. Je prends une tasse de thé à la menthe, un livre, une couverture. Le bonheur, parfois, c'est simple comme une tasse chaude.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-020",
    title: "Les courses du vendredi",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le vendredi, je fais les courses. D'abord, j'écris une liste.",
    blurbEn:
      "The Friday shopping routine: a careful list, the market with its friendly cheese seller, the supermarket, a chat with a neighbour — and the bread forgotten yet again.",
    body: `Le vendredi, je fais les courses pour toute la semaine. C'est mon organisation, et j'aime ça.

D'abord, j'écris une liste. Je regarde dans le frigo et dans les placards. Il n'y a plus de lait. Il n'y a plus d'œufs. Il reste un peu de fromage, mais pas beaucoup. J'écris tout sur un petit papier : lait, œufs, fromage, tomates, pommes, pain.

Ensuite, je vais au marché, sur la place. Le vendredi matin, il y a beaucoup de monde. J'achète les fruits et les légumes ici, parce qu'ils sont frais et pas trop chers. Les tomates sont belles cette semaine. Le vendeur de fromage me connaît bien. « Bonjour ! Comme d'habitude ? » demande-t-il. « Oui, comme d'habitude », je réponds. Il me donne un morceau à goûter. C'est notre petit rituel.

Après le marché, je vais au supermarché pour le reste : le lait, les œufs, le riz, le savon. Je pousse mon chariot dans les rayons. À la caisse, je rencontre ma voisine, madame Dubois. Nous parlons cinq minutes du temps et du quartier.

Je rentre à la maison avec mes sacs. Ils sont lourds ! Je range tout dans le frigo et dans les placards. Je regarde ma liste une dernière fois et là… oh non. Le pain. J'ai encore oublié le pain !

Je remets mes chaussures et je retourne à la boulangerie du coin. La boulangère rit : « Vous avez oublié le pain, comme vendredi dernier ? » Oui. Comme vendredi dernier. Une baguette, s'il vous plaît.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-021",
    title: "Mon petit balcon",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Je n'ai pas de jardin, mais j'ai un balcon.",
    blurbEn:
      "City life with no garden but one small balcony: morning coffee outside, flowers in summer, a tomato experiment, and a little bird that comes to visit.",
    body: `J'habite en ville, au quatrième étage d'un vieil immeuble. Mon appartement est petit. Je n'ai pas de jardin, mais j'ai un balcon. Il est petit aussi : deux mètres, pas plus. Pour moi, c'est un trésor.

Sur mon balcon, il y a trois plantes vertes, des fleurs, une petite table et une chaise. C'est tout, et c'est assez.

Le matin, je bois mon café ici, même quand il fait un peu froid. J'écoute les oiseaux. Je regarde la rue en bas : les gens vont au travail, la ville se réveille doucement. Ce moment calme est mon moment préféré de la journée.

En été, mon balcon devient magnifique. Mes fleurs sont rouges et jaunes. Je les arrose chaque soir, après le travail. C'est ma petite méditation.

Cette année, je fais une expérience : des tomates en pot ! Ma mère dit : « Des tomates sur un balcon ? Impossible ! » Mais mes plantes poussent bien. Il y a déjà cinq petites tomates vertes. J'attends. Bientôt, elles seront rouges.

Depuis quelques semaines, j'ai un visiteur. Un petit oiseau gris vient sur mon balcon, presque tous les matins. Je mets quelques graines sur la table. Il mange, il me regarde, il part. Je l'appelle Gaston. Gaston n'a pas peur de moi, mais il reste prudent.

Le soir, en été, je dîne dehors. Une salade de tomates, bientôt avec mes tomates à moi. Le ciel devient rose, puis bleu foncé, et les lumières de la ville s'allument une à une.

Mon balcon est petit, oui. Mais le bonheur n'a pas besoin de beaucoup de place.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-022",
    title: "La galette des rois",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "En janvier, en France, on mange la galette des rois.",
    blurbEn:
      "The January tradition of the galette des rois explained through one family afternoon: the hidden charm, the youngest child under the table, and a very proud little king.",
    body: `En janvier, en France, on mange la galette des rois. C'est une tradition très ancienne et très populaire. La galette est un gâteau rond et doré. Dedans, il y a une crème aux amandes. C'est délicieux.

Mais la galette a un secret. Dans le gâteau, il y a une fève : une toute petite figure en porcelaine. La personne qui trouve la fève devient le roi ou la reine du jour. Elle met une couronne en papier dorée.

Dimanche, toute la famille est chez nous pour la galette. Il y a mes parents, mes grands-parents, mon oncle, ma tante et mes deux cousins. Maman apporte la galette sur la table. Elle est encore chaude.

Il y a une règle amusante. Le plus jeune enfant va sous la table. Il ne voit pas le gâteau. Maman coupe une part et demande : « Pour qui ? » Et l'enfant sous la table donne un nom. Comme ça, personne ne triche ! Cette année, c'est mon petit frère Léo qui va sous la table. Il crie les noms très fort et tout le monde rit.

Chacun mange sa part lentement. Attention aux dents : la fève est dure ! Mon oncle fait une blague : « J'ai la fève ! » Mais non, ce n'est pas vrai.

Et soudain, Léo crie : « J'ai quelque chose ! » Il ouvre la bouche. C'est la fève ! Une petite étoile bleue. Léo est le roi. Il met la couronne. Elle est trop grande pour sa tête, mais il est très fier.

Le roi choisit sa reine : il montre Mamie. Toute la famille applaudit. Vive le roi Léo, et vive la galette !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-023",
    title: "Le marché de Noël",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "En décembre, il y a un marché de Noël dans ma ville.",
    blurbEn:
      "A December evening at the Christmas market: wooden stalls and lights, the smell of grilled chestnuts, a hot chocolate, and the hunt for a present for grandma.",
    body: `En décembre, il y a un marché de Noël dans ma ville. Il est sur la grande place, devant l'église. J'y vais samedi soir avec ma famille.

Il fait froid ce soir. Je porte mon gros manteau, un bonnet rouge et des gants. Mais le froid n'est pas un problème : le marché est magnifique. Il y a des lumières partout, dans les arbres et au-dessus des rues. Un grand sapin brille au milieu de la place.

Sur le marché, il y a de petites maisons en bois. Chaque maison vend quelque chose : des jouets, des bonbons, des décorations pour le sapin, des bougies, des écharpes. Ça sent bon partout. Une odeur douce arrive de la maison des marrons chauds.

Maman cherche un cadeau pour Mamie. Elle regarde les écharpes. « La bleue ou la rouge ? » demande-t-elle. Papa dit la bleue. Moi, je dis la rouge. Maman achète la rouge. J'ai gagné !

Ensuite, c'est le moment que je préfère : le chocolat chaud. La dame me donne une grande tasse, avec de la crème dessus. Je bois lentement. C'est chaud, c'est sucré, c'est parfait. Maman prend un thé et papa un vin chaud, une boisson pour les adultes.

Devant l'église, des enfants chantent des chansons de Noël. Nous écoutons un moment. Une petite fille chante très fort et pas très bien, mais tout le monde sourit.

Nous rentrons à la maison à pied. J'ai les mains pleines de petits paquets, et dans ma tête, les chansons de Noël continuent.

Vivement décembre prochain !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-024",
    title: "Une chanson à la radio",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Nous sommes dans la voiture. La radio joue de la musique.",
    blurbEn:
      "On the long drive to the sea, a song the whole family knows comes on the radio. Everyone sings — even Dad, who sings terribly — and a boring trip becomes a memory.",
    body: `Ce matin, nous partons à la mer. Deux heures de voiture ! Papa conduit, maman est à côté de lui. Ma sœur et moi, nous sommes derrière.

Au début du voyage, tout le monde est un peu fatigué. Il est huit heures. Ma sœur regarde par la fenêtre. Moi, je compte les voitures rouges. Douze… treize… C'est long.

La radio joue doucement. Des chansons passent, puis les informations, puis encore des chansons.

Et soudain, les premières notes d'une chanson arrivent. Je connais cette chanson ! Ma sœur lève la tête. Maman monte le volume. « Oh ! Notre chanson ! » dit-elle.

C'est une vieille chanson française. Mes parents la connaissent depuis toujours, et nous, nous la connaissons grâce à eux. Nous l'écoutons chaque été.

Maman commence à chanter. Ma sœur chante avec elle. Moi aussi ! Et puis papa chante. Il faut le dire : papa chante très mal. Il chante trop fort et il oublie les mots. Mais il chante avec tout son cœur.

« Papa, tu chantes faux ! » dit ma sœur. « Merci beaucoup ! » répond papa, et il chante encore plus fort. Nous rions tous. Même maman a des larmes de rire dans les yeux.

La chanson finit. Trois minutes de bonheur. Nous attendons la prochaine chanson, mais c'est de la publicité. Tant pis.

Ma sœur me regarde et sourit. Le voyage n'est plus ennuyeux du tout. Dans deux heures, nous serons à la mer. Et dans la voiture, il reste un peu de musique dans l'air.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-025",
    title: "Le tennis au parc",
    category: "sport",
    difficulty: "A1",
    minutes: 2,
    preview: "Le samedi matin, je joue au tennis avec mon ami Thomas.",
    blurbEn:
      "Two friends and their Saturday tennis ritual on the free park court: lost balls, an old man's good advice, small progress, and rain that ends the game but not the fun.",
    body: `Le samedi matin, je joue au tennis avec mon ami Thomas. C'est notre rituel. Nous allons au parc, près de chez moi. Là-bas, il y a un court de tennis gratuit. Il faut arriver tôt, parce que beaucoup de gens le veulent.

À neuf heures, nous sommes sur le court. Thomas apporte les balles, moi, j'apporte une bouteille d'eau et des barres de céréales. Nous prenons nos vieilles raquettes et le match commence.

Il faut être honnête : nous ne sommes pas très bons. Ma balle part souvent trop loin, dans les arbres. La balle de Thomas touche souvent le filet. Nous cherchons les balles dans les fleurs, derrière le court. Le jardinier du parc nous regarde et rit.

Un vieux monsieur s'arrête souvent près du court. Il s'appelle Robert et il jouait très bien, avant. Il nous donne des conseils : « Regarde la balle ! Plie les jambes ! Doucement, pas trop fort ! » Grâce à Robert, nous progressons un peu. Samedi dernier, j'ai gagné six points de suite. Un record !

Aujourd'hui, le match est serré. Thomas gagne, puis moi, puis Thomas. Nous courons partout. Après une heure, nous sommes fatigués et tout rouges.

Et puis, les premières gouttes tombent. La pluie ! En cinq minutes, le court est mouillé. Fin du match. Nous courons sous un arbre avec nos sacs.

« Match nul ? » demande Thomas. « Match nul », je réponds. Nous buvons notre eau sous la pluie et nous rions.

À samedi prochain, sur le court. La revanche nous attend.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-026",
    title: "Je cours le matin",
    category: "sport",
    difficulty: "A1",
    minutes: 2,
    preview: "Je cours trois fois par semaine, tôt le matin.",
    blurbEn:
      "The story of becoming a morning runner: the hard first week, the quiet streets at six o'clock, the other runners who wave hello, and the energy that lasts all day.",
    body: `Je cours trois fois par semaine : le lundi, le mercredi et le vendredi. Je cours tôt le matin, à six heures. Mes amis me disent : « Six heures ? Tu es fou ! » Peut-être. Mais j'adore ça.

Ce n'était pas facile au début. La première semaine, tout était difficile. Le réveil sonnait et je voulais rester au lit. Dehors, il faisait froid et noir. Après dix minutes de course, j'étais fatigué et j'avais mal aux jambes. Je marchais, je courais un peu, je marchais encore.

Mais j'ai continué. Semaine après semaine, mon corps a changé. Maintenant, je cours trente minutes sans arrêt. Je ne suis pas rapide, mais je cours.

Le matin, la ville est pour moi. Les rues sont calmes. Il y a peu de voitures. L'air est frais et propre. Je cours dans le parc, près de chez moi. Je passe devant le lac, puis sous les grands arbres. Les canards dorment encore.

Je ne suis pas complètement seul. Il y a les autres coureurs du matin. Nous ne connaissons pas nos noms, mais nous nous connaissons. La dame au t-shirt jaune. Le monsieur avec son chien. Le jeune homme très rapide. On se fait un petit signe de la main. Bonjour, bonne course.

Après la course, je rentre à la maison. Je prends une douche chaude et un bon petit-déjeuner. Il est sept heures et demie, et j'ai déjà fait quelque chose de bien pour moi.

Au travail, mes collègues arrivent fatigués. Moi, je suis en forme. Le sport du matin, c'est mon secret.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-027",
    title: "La randonnée en montagne",
    category: "sport",
    difficulty: "A1",
    minutes: 2,
    preview: "Cet été, ma famille fait une randonnée en montagne.",
    blurbEn:
      "A first family mountain hike: heavy backpacks, a steep path, a marmot sighting, a picnic with a view, and the proud, tired feeling at the top.",
    body: `Cet été, nous passons une semaine dans les Alpes. Aujourd'hui, ma famille fait une grande randonnée en montagne. C'est ma première fois. Je suis un peu inquiet : la montagne est haute !

Nous partons tôt, à huit heures. Dans mon sac, il y a de l'eau, un sandwich, une pomme et un pull. Papa porte le grand sac avec le pique-nique. Maman a la carte. Ma petite sœur porte juste son doudou. Elle a de la chance.

Le début est facile. Le chemin passe dans la forêt. Il fait frais sous les arbres. Nous marchons d'un bon pas.

Mais après, le chemin monte. Il monte beaucoup ! Je marche lentement. J'ai chaud. Ma sœur demande : « C'est encore loin ? » toutes les cinq minutes. Papa répond toujours : « Presque ! » Ce n'est pas vrai.

Soudain, maman s'arrête. « Regardez ! Là ! » Sur un rocher, il y a un animal brun. C'est une marmotte ! Elle nous regarde, puis elle siffle et disparaît. Ma sœur est très contente. Moi aussi.

À midi, nous faisons le pique-nique sur l'herbe, avec une vue magnifique. Mon sandwich est simple, mais ici, il a un goût extraordinaire. C'est ça, la magie de la montagne.

Encore une heure de marche, et nous arrivons en haut. La vue est incroyable. On voit toute la vallée, les villages, un lac bleu. Les montagnes continuent jusqu'au ciel. Nous prenons une photo de famille.

Le soir, à l'hôtel, j'ai mal aux jambes et je suis très fatigué. Mais dans ma tête, je vois encore la vue du sommet. La montagne, c'est difficile et c'est magnifique. Je veux recommencer demain.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-028",
    title: "Les fourmis",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Aujourd'hui, je regarde les fourmis dans le jardin.",
    blurbEn:
      "An afternoon watching ants in the garden: their perfect line to a piece of biscuit, a tiny worker carrying a huge load, and the underground city we never see.",
    body: `Cet après-midi, je suis dans le jardin avec mon livre. Mais je ne lis pas. Je regarde les fourmis. Elles sont fascinantes.

Tout commence avec mon biscuit. Un petit morceau tombe sur le sol. Cinq minutes après, une fourmi arrive. Elle tourne autour du morceau. Elle le touche. Puis elle part très vite. Où va-t-elle ?

Dix minutes après, elles sont vingt. Puis cinquante ! Les fourmis marchent en ligne parfaite, entre le biscuit et leur maison. Une ligne va vers le biscuit, une ligne revient. C'est une autoroute de fourmis. Comment font-elles ? La première fourmi laisse une odeur sur le sol, et les autres suivent cette odeur. C'est leur langage secret.

Je regarde une petite fourmi. Elle porte un morceau de biscuit énorme, deux fois plus grand qu'elle. C'est comme un homme avec une voiture sur le dos ! Elle avance lentement, mais elle avance. Elle ne s'arrête jamais. Quelle force !

Ma mère m'appelle pour le goûter. Je réponds : « Cinq minutes ! » Je veux voir la maison des fourmis. Elle est sous la terre, près du vieux mur. Je vois juste un petit trou avec du sable autour. Mais sous mes pieds, il y a une vraie ville : des chemins, des salles, des centaines de fourmis. Et quelque part, la reine, la mère de toutes les fourmis.

Le soir, le morceau de biscuit n'est plus là. Tout est dans la maison des fourmis.

Les fourmis sont toutes petites. Mais elles travaillent ensemble, et ensemble, elles sont très fortes. Il y a une leçon là-dedans, je pense.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-029",
    title: "Il neige aujourd'hui",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Ce matin, je regarde par la fenêtre : il neige !",
    blurbEn:
      "The first snow of the year: a white and silent city, school closed, a snowman with a carrot nose, a snowball fight, and hot chocolate by the window.",
    body: `Ce matin, quelque chose est différent. La lumière dans ma chambre est étrange, très blanche. Je vais à la fenêtre et je regarde dehors. Il neige !

Tout est blanc. Le jardin est blanc. Les arbres sont blancs. Les voitures dorment sous une couverture blanche. Et la neige tombe encore, doucement, en gros flocons. C'est la première neige de l'année.

Il y a autre chose de spécial : le silence. La ville est toute calme. La neige mange les bruits. Pas de voitures, pas de musique. Juste le silence blanc.

À la radio, une bonne nouvelle : l'école est fermée aujourd'hui ! Trop de neige sur les routes. Ma sœur et moi, nous crions de joie. Maman sourit : « D'accord, d'accord. Mais d'abord, le petit-déjeuner. »

Après, nous mettons nos manteaux, nos bonnets, nos gants et nos bottes. Ça prend dix minutes ! Puis nous sortons dans le jardin. La neige fait « crounch, crounch » sous nos pieds. J'adore ce bruit.

Nous faisons un bonhomme de neige. Une grosse boule pour le corps, une petite pour la tête. Deux cailloux pour les yeux. Une carotte pour le nez. L'écharpe verte de papa pour finir. Il est magnifique. Nous l'appelons Monsieur Blanc.

Ensuite, bataille de boules de neige ! Ma sœur est rapide, mais moi, je vise bien. Une boule arrive dans mon cou. C'est froid ! Nous rions et nous crions.

À midi, nous rentrons, mouillés et heureux. Maman prépare un chocolat chaud. Je le bois près de la fenêtre, et je regarde Monsieur Blanc dans le jardin.

La neige, c'est le plus beau cadeau de l'hiver.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-030",
    title: "Le petit potager",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Cette année, je fais un petit potager derrière la maison.",
    blurbEn:
      "A first vegetable garden from seed to plate: preparing the soil, the fight against snails, the long wait, and the pride of the first home-grown salad.",
    body: `Cette année, j'ai un projet : un petit potager derrière la maison. Je veux manger mes propres légumes. Ma voisine, madame Petit, a un beau potager depuis trente ans. Elle me dit : « C'est facile ! Il faut trois choses : du soleil, de l'eau et de la patience. »

En avril, je commence. Je prépare la terre avec une pelle. C'est du sport ! Après une heure, j'ai mal au dos. Puis je plante : des tomates, de la salade, des carottes et des herbes, du basilic et de la menthe. Je mets une petite étiquette devant chaque ligne.

Chaque jour, j'arrose mon potager, le matin ou le soir. J'attends. Une semaine. Rien. Deux semaines. Et un matin : des petites feuilles vertes ! Ça pousse ! Je suis fier comme un papa.

Mais le potager a des ennemis. Les escargots adorent ma salade. Chaque matin, je trouve des trous dans les feuilles. Madame Petit me donne un conseil : « Mets du sable autour de la salade. Les escargots n'aiment pas ça. » Ça marche ! Merci, madame Petit.

En juin, les tomates sont vertes. En juillet, elles deviennent jaunes, puis orange, puis rouges. La première tomate rouge, je la mange directement dans le jardin, encore chaude de soleil. Elle est sucrée, parfumée. Les tomates du magasin n'ont pas ce goût.

Ce soir, je prépare une grande salade : mes tomates, ma salade verte, mon basilic. Toute ma famille mange mon travail de trois mois. « C'est délicieux ! » dit ma femme.

Oui, madame Petit a raison. Du soleil, de l'eau, de la patience. Et un peu d'amour, aussi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-031",
    title: "Le facteur",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Chaque matin, le facteur passe dans ma rue.",
    blurbEn:
      "Marc the postman knows the whole street: the mail, the names, the news. Among the usual adverts and bills, today he brings a real handwritten letter.",
    body: `Chaque matin, vers dix heures, le facteur passe dans ma rue. Il s'appelle Marc. Il a un vélo jaune et un grand sac plein de lettres. Il travaille ici depuis quinze ans.

Marc connaît tout le monde. Il connaît les noms, les maisons, les chiens. Il sait que madame Rossi attend une lettre de sa fille en Italie. Il sait que le monsieur du numéro 12 collectionne les cartes postales. Il dit bonjour à tout le monde, avec un grand sourire, même quand il pleut.

« Le facteur, c'est le journal du quartier », dit ma grand-mère. C'est vrai. Marc sait tout : le bébé du numéro 8, les nouveaux voisins du numéro 15, le chat perdu et retrouvé.

Moi, je reçois surtout des publicités. Des pizzas, des supermarchés, encore des pizzas. Parfois, une facture. Ce n'est pas très intéressant. Je jette presque tout.

Mais ce matin, c'est différent. Marc s'arrête devant ma porte et sonne. « Une lettre pour vous ! Une vraie ! » dit-il, content. Une vraie lettre, avec un timbre, avec mon adresse écrite à la main. Je reconnais l'écriture : c'est ma cousine Emma, qui habite au Canada.

J'ouvre la lettre dans la cuisine, avec un café. Trois pages ! Emma raconte sa nouvelle vie, son travail, la neige, son français qui devient drôle. À la fin, elle écrit : « Réponds-moi avec une vraie lettre. C'est mieux qu'un message, non ? »

Elle a raison. Cet après-midi, j'achète du beau papier et un timbre. Marc va bientôt porter ma réponse.

Une vraie lettre, ça fait du bien. Merci, Emma. Et merci, Marc.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-032",
    title: "Mon chien Max",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "J'ai un chien. Il s'appelle Max.",
    blurbEn:
      "A portrait of Max the dog: the morning wait by the door, the mad joy at the park, his talent for finding lost balls, and his place at the foot of the bed.",
    body: `J'ai un chien. Il s'appelle Max. Il est brun, avec de grandes oreilles douces et des yeux marron. Il a trois ans. Nous l'avons trouvé au refuge, il y a deux ans. Le meilleur jour de ma vie.

Le matin, Max attend près de la porte. Il entend mon réveil avant moi ! Quand je descends, sa queue bouge très vite. Il veut dire : « Enfin ! On va au parc ? » Oui, Max. On va au parc. Tous les matins, c'est notre promenade.

Au parc, Max est fou de joie. Il court partout. Il dit bonjour aux autres chiens : le grand chien noir, le petit chien blanc qui aboie beaucoup. Il connaît tout le monde.

Son jeu préféré ? La balle, bien sûr. Je lance la balle, Max court comme un champion et rapporte la balle. Encore. Encore. Encore ! Il ne s'arrête jamais. Moi, j'ai mal au bras avant lui.

Max a un talent spécial : il trouve les balles perdues. Dans le parc, sous les feuilles, dans l'herbe, il y a beaucoup de vieilles balles. Max les trouve avec son nez. À la maison, nous avons un panier plein de balles trouvées. Douze balles !

Max n'est pas parfait. Il mange parfois mes chaussettes. Il a peur de l'aspirateur. Et quand il pleut, il ne veut pas sortir. Monsieur préfère le canapé.

Le soir, Max dort dans son panier, à côté de mon lit. Parfois, il rêve : ses pattes bougent, il court dans son rêve. Il court après une balle, je pense.

Max ne parle pas. Mais quand il pose sa tête sur mes genoux, je comprends tout. Max est mon meilleur ami.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-033",
    title: "Le restaurant italien",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Ce soir, nous allons au restaurant italien.",
    blurbEn:
      "A birthday dinner at the neighbourhood Italian restaurant: a warm welcome from Giovanni, pizzas fresh from the wood oven, and a surprise tiramisu with a candle.",
    body: `Ce soir, c'est une soirée spéciale : c'est l'anniversaire de maman. Elle a choisi le restaurant. Pas de surprise : « Chez Giovanni », le restaurant italien de notre quartier. C'est son préféré, et le nôtre aussi.

Le restaurant est petit et chaleureux. Il y a des photos de l'Italie sur les murs et des bougies sur les tables. Giovanni, le patron, nous accueille comme des amis : « Buonasera la famille ! La table près de la fenêtre est pour vous ! »

Le serveur apporte les menus, mais nous connaissons déjà la carte par cœur. Maman prend des pâtes aux champignons. Papa choisit une pizza aux quatre fromages. Ma sœur veut des lasagnes. Et moi ? Une pizza margherita, comme toujours. Simple et parfaite.

Au fond du restaurant, il y a un four à bois. On voit le cuisinier travailler. Il lance la pâte en l'air, il la tourne, elle vole ! C'est un spectacle. La pizza entre dans le four, et deux minutes après, elle sort, chaude et dorée.

Les plats arrivent. Ma pizza sent merveilleusement bon. La tomate, le fromage qui fait des fils, le basilic frais. Je mange tout, jusqu'au bord. Papa goûte les pâtes de maman. « Hé ! » dit maman. Mais elle rit.

À la fin, Giovanni arrive avec un tiramisu et une petite bougie. Tout le restaurant chante « Joyeux anniversaire » ! Maman est un peu rouge, mais très heureuse. Le tiramisu est doux comme un nuage.

Nous rentrons à pied dans la nuit. « Bonne soirée ? » demande papa. Maman sourit : « La meilleure. »

Grazie, Giovanni. À bientôt !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-034",
    title: "Une lettre à mon ami",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Cher Antoine, comment vas-tu ? Moi, je vais bien.",
    blurbEn:
      "Louis writes to his best friend Antoine, who moved away: news of the beach, the new neighbour, school, a bit of missing him — and the big announcement of an August visit.",
    body: `Cher Antoine,

Comment vas-tu ? Moi, je vais bien. Mais la ville n'est pas pareille sans toi. Trois mois déjà depuis ton déménagement ! C'est long.

Ici, c'est l'été. Il fait très beau et très chaud. Je vais souvent à la plage avec ma famille, le week-end. L'eau est parfaite. Dimanche dernier, j'ai nagé jusqu'à la bouée jaune, tu sais, la bouée loin. Tout seul ! Papa était fier. Toi et moi, on n'arrivait jamais jusqu'à la bouée. Maintenant, il faut une revanche.

Des nouvelles du quartier : il y a une nouvelle famille dans ta vieille maison. Ils ont un garçon de notre âge, Samir. Il est sympa et il joue bien au foot. Mais je te rassure : ta place de meilleur ami n'est pas prise. Personne ne fait des blagues comme toi.

À l'école, tout va bien. Madame Girard est toujours gentille et monsieur Blanc donne toujours trop de devoirs. Certaines choses ne changent pas !

Et toi ? Comment est ta nouvelle ville ? Ta nouvelle école ? Tes nouveaux amis ? Raconte-moi tout. Ta mer est plus belle que la nôtre ? Impossible.

Et maintenant, la grande nouvelle. Tu es assis ? Maman est d'accord : je viens chez toi en août ! Une semaine entière ! Nous allons nager, jouer, parler toute la nuit. Je compte les jours. Trente-deux !

Écris-moi vite. Une vraie lettre, c'est mieux qu'un message. On garde les lettres.

Ton meilleur ami pour toujours,

Louis

P.S. : J'envoie une photo de la plage. Regarde bien la bouée jaune !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-035",
    title: "Les couleurs de l'automne",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "En automne, les arbres changent de couleur.",
    blurbEn:
      "An autumn walk in the park: red and gold trees, children jumping in leaf piles, chestnuts in coat pockets, and a simple answer to why the leaves change colour.",
    body: `C'est l'automne, ma saison préférée. En automne, les arbres font un spectacle magnifique : ils changent de couleur.

Cet après-midi, je marche dans le grand parc. Les feuilles ne sont plus vertes. Elles sont rouges, oranges, jaunes, marron. Chaque arbre a sa couleur. Le grand arbre près du lac est complètement doré. Avec le soleil, il brille comme un trésor.

Pourquoi les feuilles changent-elles de couleur ? Ma fille me pose la question. Je lui explique simplement : en été, les feuilles sont vertes et elles travaillent pour l'arbre. En automne, les jours deviennent courts et froids. L'arbre se prépare pour l'hiver. Il dit au revoir à ses feuilles. Avant de tomber, elles montrent leurs autres couleurs. C'est leur fête d'adieu.

Les feuilles tombent doucement. Une feuille rouge danse dans l'air et se pose sur mon épaule. Le sol est un tapis de couleurs. Sous nos pieds, ça fait un bruit agréable : cras, cras, cras.

Plus loin, des enfants jouent dans les feuilles. Le gardien du parc fait de grands tas, et les enfants sautent dedans en criant. Le gardien n'est pas content, mais il sourit quand même.

Ma fille remplit ses poches de trésors : des marrons bruns et brillants, une feuille dorée, une plume grise. À la maison, nous mettons les feuilles dans un grand livre. Souvenir de l'automne.

L'air est frais. Je porte mon premier pull de l'année. Bientôt, les arbres seront nus, et l'hiver arrivera.

Mais aujourd'hui, le parc est en fête. L'automne est un artiste, et son tableau est magnifique.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-016",
    title: "Le jour où j'ai raté le train",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Ce matin-là, j'étais en retard. Mon réveil n'a pas sonné.",
    blurbEn:
      "A silent alarm, a mad dash across town, and a train pulling away without its passenger. The story of a ruined morning saved by a stranger's coffee and a good conversation.",
    body: `Ce matin-là, tout a mal commencé. Mon réveil n'a pas sonné. Quand j'ai ouvert les yeux, il était déjà sept heures et demie. Mon train partait à huit heures, et j'avais un rendez-vous de travail important à Lyon, à dix heures.

Je me suis levé d'un bond. Pas de douche, pas de petit-déjeuner. Je me suis habillé en trois minutes et j'ai attrapé mon sac. Dans la rue, j'ai couru comme un sportif olympique. Les gens me regardaient, étonnés.

Je suis arrivé à la gare à huit heures et une minute. Une minute ! Sur le quai, j'ai vu mon train qui partait doucement. J'ai crié, j'ai agité les bras. Le train est parti quand même. Évidemment : un train n'attend personne.

Je me suis assis sur un banc, furieux contre mon réveil, contre le train, contre moi-même. Le prochain train partait dans une heure. J'ai téléphoné à mon client pour décaler le rendez-vous. Heureusement, il a été très compréhensif.

À côté de moi, une vieille dame attendait aussi. Elle a vu ma tête et elle a souri. « Vous avez raté votre train ? Moi aussi. Venez, je vous offre un café. » Nous sommes allés au petit café de la gare.

Cette dame s'appelait Jeanne. Elle allait voir sa petite-fille à Lyon. Nous avons parlé de tout : des voyages, de la ville, de sa jeunesse. Elle racontait des histoires drôles, et l'heure est passée très vite.

Dans le train, nous avons voyagé ensemble. Mon rendez-vous s'est très bien passé, finalement.

Depuis ce jour, je prépare mes affaires la veille et je mets deux réveils. Mais je pense parfois à Jeanne, et je me dis qu'un train raté, ce n'est pas toujours une catastrophe. Parfois, c'est une rencontre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-017",
    title: "J'ai adopté un chat",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Le mois dernier, j'ai adopté un chat au refuge.",
    blurbEn:
      "From a cage at the shelter to the best spot on the sofa: adopting Gribouille the shy grey cat, the difficult first week under the bed, and the slow victory of patience.",
    body: `Le mois dernier, j'ai pris une grande décision : j'ai adopté un chat. J'y pensais depuis longtemps. Mon appartement était trop calme, trop vide. Un samedi matin, je suis enfin allé au refuge des animaux.

Là-bas, il y avait beaucoup de chats : des jeunes, des vieux, des joueurs, des timides. Une bénévole m'a guidé entre les cages. Et puis je l'ai vu. Un petit chat gris, assis au fond de sa cage. Il ne miaulait pas, il ne bougeait pas. Il me regardait seulement, avec de grands yeux verts. La bénévole m'a expliqué son histoire : il avait été trouvé dans la rue, il avait peur des gens. « Il lui faut quelqu'un de patient », a-t-elle dit.

Je l'ai choisi. Ou peut-être qu'il m'a choisi, je ne sais pas.

À la maison, je l'ai appelé Gribouille. La première semaine a été difficile. Gribouille se cachait sous le lit toute la journée. Il ne mangeait presque rien. La nuit, j'entendais ses petits pas dans le salon, mais le matin, il était de nouveau sous le lit.

J'ai suivi les conseils de la bénévole. Je ne l'ai jamais forcé. Je lui parlais doucement, je laissais sa nourriture près du lit, et j'attendais.

Le huitième jour, une surprise : Gribouille est monté sur le canapé, à côté de moi. J'ai continué à lire, sans bouger. Après dix minutes, il a fermé les yeux et il a ronronné. Une petite victoire qui m'a rendu tellement heureux.

Aujourd'hui, un mois plus tard, Gribouille est un autre chat. Il dort sur mon lit, il joue avec ses jouets, il m'attend derrière la porte le soir. Quand je rentre du travail, il court vers moi en miaulant.

Mon appartement n'est plus calme et vide. Il est vivant. Merci, Gribouille.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-018",
    title: "La panne de courant",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Hier soir, il y a eu une panne de courant.",
    blurbEn:
      "When the lights went out across the whole neighbourhood, one family rediscovered candles, board games and conversation — and was almost disappointed when the power came back.",
    body: `Hier soir, vers huit heures, tout s'est éteint d'un coup. La télévision, les lampes, le frigo : plus rien. Une panne de courant ! J'ai regardé par la fenêtre : tout le quartier était dans le noir. Ce n'était pas seulement chez nous.

Au début, c'était la panique. Ma fille a crié : « Mon film ! » Mon fils a crié : « Le wifi ! » Ma femme a cherché son téléphone pour faire de la lumière, et moi, je me suis cogné le pied contre la table du salon. Aïe.

Puis nous nous sommes organisés. J'ai trouvé les bougies dans le placard de la cuisine, celles qu'on garde « au cas où » depuis des années. Nous en avons allumé six et nous les avons posées sur la table. Petit à petit, le salon est devenu joli, avec cette lumière douce et dansante.

« On fait quoi maintenant ? » a demandé mon fils. Sans télévision, sans internet, sans musique, la question était sérieuse. Ma femme a eu l'idée : « Un jeu de société ! »

Nous avons sorti un vieux jeu de cartes. Au début, les enfants n'étaient pas motivés. Mais après trois tours, tout le monde criait, riait et trichait un peu. Ma fille a gagné deux fois. Elle était très fière.

Ensuite, nous avons parlé. De l'école, du travail, des vacances d'été. Mon fils a raconté des histoires drôles de sa classe. À la lumière des bougies, même les histoires ordinaires devenaient spéciales.

Vers dix heures, la lumière est revenue d'un coup. Le frigo a redémarré, la télévision s'est rallumée. Et vous savez quoi ? Nous avons été presque déçus. Ma fille a éteint la télévision et nous avons fini notre partie de cartes.

Depuis hier, nous avons décidé une chose : une soirée sans écrans par semaine. Une panne de courant volontaire. C'est peut-être la meilleure panne de notre vie.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-019",
    title: "La fête des voisins",
    category: "culture",
    difficulty: "A2",
    minutes: 2,
    preview: "Chaque année, en juin, il y a la fête des voisins.",
    blurbEn:
      "One evening a year, a whole apartment building meets in the courtyard with home-made food. This year the writer brought an apple tart — and finally learned the neighbours' names.",
    body: `Dans mon immeuble, nous sommes une trentaine d'habitants. Pendant des années, je ne connaissais personne. On se croisait dans l'escalier, on se disait bonjour, et c'était tout. Je ne connaissais même pas le nom de ma voisine de palier.

Mais chaque année, au mois de juin, il y a la fête des voisins. C'est une tradition dans toute la France : un soir, les voisins se retrouvent pour manger ensemble. Cette année, j'ai enfin décidé de participer.

Chacun devait apporter quelque chose. Moi, j'ai fait une tarte aux pommes, avec la recette de ma mère. J'étais un peu nerveux : et si ma tarte n'était pas bonne ? Et si je ne savais pas quoi dire ?

À sept heures, je suis descendu dans la cour avec ma tarte. Il y avait déjà des tables, des chaises et des guirlandes de lumières. Une dame m'a accueilli avec un grand sourire : « Ah, vous êtes le monsieur du troisième ! Moi, c'est Yvonne, du premier. » Yvonne habite dans l'immeuble depuis trente ans. Elle connaît toutes les histoires du quartier.

La table était pleine de bonnes choses : une salade de riz, un couscous, des quiches, des gâteaux. Le jeune couple du cinquième a apporté des plats de leur pays, épicés et délicieux. Un étudiant a joué de la guitare.

Et ma tarte ? Un succès total ! « C'est la meilleure tarte de la soirée », a dit Yvonne. Trois personnes m'ont demandé la recette.

Nous avons mangé, parlé et ri jusqu'à minuit. J'ai appris que mon voisin de palier s'appelle Karim et qu'il adore le football, comme moi. Nous allons regarder le prochain match ensemble.

Avant, je disais juste bonjour à mes voisins. Maintenant, je connais leurs prénoms, leurs histoires et leurs recettes. Il a suffi d'une soirée, d'une table dans la cour et d'une tarte aux pommes.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-020",
    title: "Le vide-grenier",
    category: "culture",
    difficulty: "A2",
    minutes: 2,
    preview: "Dimanche dernier, je suis allé à un vide-grenier.",
    blurbEn:
      "Treasure hunting at the Sunday flea market: haggling lessons, an old radio that still works, a childhood book found again, and a three-euro lamp with a story.",
    body: `Dimanche dernier, il y avait un vide-grenier dans mon quartier. Toute la grande rue était fermée aux voitures. Les habitants vendaient leurs vieux objets devant chez eux, sur des tables ou sur des couvertures. J'adore les vide-greniers : on ne sait jamais ce qu'on va trouver.

Je suis arrivé tôt, vers neuf heures. Les vrais chercheurs de trésors arrivent toujours tôt ! Il y avait déjà beaucoup de monde. On trouvait de tout : des vêtements, des livres, des jouets, de la vaisselle, des vélos, des disques.

D'abord, j'ai regardé les livres. Un monsieur vendait toute sa bibliothèque. Et là, surprise : j'ai trouvé un livre de mon enfance ! Le même livre d'aventures que je lisais quand j'avais dix ans. Je l'ai acheté pour un euro, avec un grand sourire.

Plus loin, une dame vendait une vieille radio des années soixante. « Elle marche encore ? » j'ai demandé. La dame l'a branchée chez elle, et la radio s'est allumée avec un joli son ancien. J'ai hésité, mais elle était un peu chère pour moi.

Au vide-grenier, il faut négocier. C'est le jeu ! Un vendeur demandait dix euros pour une lampe ancienne. « Cinq euros ? » j'ai proposé. « Huit », a-t-il répondu. « Six ? » « D'accord, sept, et je vous raconte son histoire. » Vendu ! La lampe venait du café de son grand-père. Elle a éclairé des parties de cartes pendant quarante ans.

À midi, je suis rentré avec mes trésors : le livre de mon enfance, la lampe du café, et un pull presque neuf pour deux euros.

Ce soir, la lampe est sur mon bureau. Sa lumière est chaude et douce. Un objet neuf n'a pas d'histoire. Un objet ancien en a mille. C'est pour ça que j'aime les vide-greniers.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-021",
    title: "Un concert en plein air",
    category: "culture",
    difficulty: "A2",
    minutes: 2,
    preview: "L'été dernier, je suis allé à un concert en plein air.",
    blurbEn:
      "A free concert in the park on a warm summer night: a blanket on the grass, dancing strangers, a magical hour of music under the stars, and the walk home with a song in your head.",
    body: `L'été dernier, mes amis m'ont proposé une sortie : un concert gratuit en plein air, dans le grand parc de la ville. Un groupe de musique du monde jouait à neuf heures du soir. Je n'étais jamais allé à un concert en plein air. J'ai dit oui tout de suite.

Nous sommes arrivés vers sept heures pour trouver une bonne place. Le parc était déjà plein de monde : des familles avec des enfants, des groupes de jeunes, des couples âgés. Nous avons posé notre couverture sur l'herbe, ni trop près de la scène, ni trop loin.

En attendant, nous avons pique-niqué. Chacun avait apporté quelque chose : du pain, du fromage, des fruits, un gâteau au citron. Autour de nous, l'ambiance était joyeuse et détendue. Des enfants couraient partout, un vieux monsieur dansait déjà, tout seul, avant même la musique.

Le soleil est descendu lentement derrière les arbres. Le ciel est devenu orange, puis rose, puis violet. Et quand la nuit est tombée, les musiciens sont montés sur scène.

Dès la première chanson, j'ai compris pourquoi les gens aiment tant les concerts en plein air. La musique montait dans le ciel avec les lumières. Les gens chantaient, dansaient sur l'herbe, tapaient dans les mains. Ma meilleure amie, qui ne danse jamais, a dansé toute la soirée !

Pendant une chanson douce, je me suis allongé sur la couverture. Au-dessus de moi, il y avait les étoiles. Autour de moi, la musique et les voix. J'ai pensé : c'est ça, le bonheur d'été.

Le concert a fini vers onze heures. Nous avons plié la couverture et nous sommes rentrés à pied dans la ville chaude, la tête pleine de musique.

Cet été, le groupe revient. Cette fois, c'est moi qui apporte le gâteau au citron.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-022",
    title: "Pourquoi les feuilles tombent en automne",
    category: "science",
    difficulty: "A2",
    minutes: 2,
    preview: "En automne, les feuilles tombent. Mais savez-vous pourquoi ?",
    blurbEn:
      "A grandfather explains to his granddaughter why leaves change colour and fall: the tree's summer factories, the autumn signal, and the promise hidden in every bare branch.",
    body: `Dimanche, au parc, ma petite-fille Chloé m'a posé une question : « Papi, pourquoi les feuilles tombent ? » Bonne question ! Beaucoup d'adultes ne connaissent pas la réponse. Alors, nous nous sommes assis sur un banc, sous un grand arbre doré, et je lui ai expliqué.

En été, les feuilles sont vertes et elles travaillent beaucoup. Chaque feuille est comme une petite usine. Avec la lumière du soleil, l'eau et l'air, elle fabrique de la nourriture pour l'arbre. C'est pour cela que les arbres ont besoin de soleil.

« Et en automne ? » a demandé Chloé.

En automne, les jours deviennent plus courts. Il y a moins de lumière et il fait plus froid. Les petites usines vertes ne peuvent plus bien travailler. Alors l'arbre prend une décision : il ferme ses usines pour l'hiver.

L'arbre arrête de nourrir ses feuilles. La couleur verte disparaît doucement, et d'autres couleurs apparaissent : le jaune, l'orange, le rouge. Ces couleurs étaient déjà dans la feuille, mais le vert les cachait. « Comme un secret ? » a dit Chloé. Exactement, comme un secret.

Ensuite, les feuilles tombent. L'arbre reste nu tout l'hiver. Il ne travaille plus, il se repose. Il dort, comme certains animaux.

« Mais Papi, l'arbre est mort ? » Chloé était inquiète. Non, ma chérie ! L'arbre est bien vivant. Regarde les branches : il y a déjà de tout petits bourgeons. Dans ces bourgeons, les feuilles du printemps attendent. Tout est déjà prêt pour l'année prochaine.

Chloé a ramassé une feuille rouge et une feuille jaune pour sa collection. « Alors l'automne, ce n'est pas triste, a-t-elle dit. C'est l'arbre qui va dormir. »

C'est exactement ça. Et au printemps, le réveil sera magnifique.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-023",
    title: "D'où vient la pluie ?",
    category: "science",
    difficulty: "A2",
    minutes: 2,
    preview: "La pluie tombe souvent, mais d'où vient-elle vraiment ?",
    blurbEn:
      "A rainy afternoon, a curious son, and the great journey of water: from the sea to the clouds to the puddles in the street — and round again, for millions of years.",
    body: `Mercredi après-midi, il pleuvait fort. Mon fils Léo regardait la pluie par la fenêtre, un peu déçu : pas de football aujourd'hui. Soudain, il m'a demandé : « Papa, d'où vient toute cette eau ? » Je lui ai proposé un marché : je t'explique, et après, on fait des crêpes. Marché conclu.

L'histoire de la pluie est un grand voyage, j'ai commencé. Elle commence loin d'ici, à la mer.

Le soleil chauffe l'eau de la mer, des lacs et des rivières. Quand l'eau devient chaude, une partie monte dans l'air. On ne la voit pas : elle est invisible, comme un souffle. Cette eau invisible s'appelle la vapeur. « Comme au-dessus de la casserole ? » a demandé Léo. Exactement ! Quand maman fait des pâtes, tu vois la vapeur monter. C'est pareil, mais en très grand.

La vapeur monte haut dans le ciel. Et là-haut, il fait froid. Alors la vapeur se transforme en gouttes minuscules. Des millions de gouttes se rassemblent et forment… « Un nuage ! » a crié Léo. Bravo ! Un nuage, c'est de l'eau qui flotte dans le ciel.

Le vent pousse les nuages au-dessus des villes et des montagnes. Les gouttes grossissent, le nuage devient gris et lourd. Et quand il est trop lourd, les gouttes tombent. C'est la pluie.

Ensuite, l'eau de pluie entre dans la terre, retrouve les rivières, et les rivières retournent à la mer. Et tout recommence ! Ce voyage s'appelle le cycle de l'eau. Il tourne depuis des millions d'années. La goutte sur la fenêtre est peut-être déjà passée par l'océan, par un nuage du bout du monde, ou par le verre d'un pharaon !

Léo a regardé la pluie avec d'autres yeux. « Alors la pluie, c'est de la mer qui voyage. »

Et maintenant, les crêpes. Promis, c'est promis.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-024",
    title: "Les oiseaux qui partent en hiver",
    category: "science",
    difficulty: "A2",
    minutes: 2,
    preview: "Chaque automne, certains oiseaux partent vers le sud.",
    blurbEn:
      "In October the swallows gather on the wires, and then one morning they're gone. The amazing story of bird migration: why they leave, how far they fly, and how they find their way back.",
    body: `En octobre, devant chez moi, les hirondelles se rassemblent sur les fils électriques. Elles sont des dizaines, puis des centaines, alignées comme des notes de musique. Et puis, un matin, elles ne sont plus là. Parties. Toutes en même temps.

Où vont-elles ? Très loin : en Afrique, de l'autre côté de la mer. Chaque automne, des millions d'oiseaux quittent l'Europe et volent vers le sud. Ce grand voyage s'appelle la migration.

Pourquoi partent-ils ? À cause de la nourriture. Les hirondelles mangent des insectes. En hiver, chez nous, il fait froid et les insectes disparaissent. Pas d'insectes, pas de repas. Alors les oiseaux vont là où il fait chaud et où la nourriture les attend.

Le voyage est incroyable et dangereux. Certains oiseaux volent des milliers de kilomètres. Ils traversent la mer, les montagnes, parfois le désert. Ils volent le jour et souvent la nuit. Beaucoup voyagent en groupe : c'est plus sûr, et les jeunes apprennent la route avec les adultes. Les oies volent en forme de V, pour économiser leurs forces. L'oiseau devant fatigue plus, alors elles changent de place, chacune son tour. Belle organisation, non ?

Mais le plus étonnant, c'est le retour. Au printemps, les hirondelles reviennent. Et souvent, elles retrouvent exactement le même toit, le même nid que l'année d'avant ! Sans carte, sans téléphone. Comment font-elles ? Les scientifiques pensent qu'elles utilisent le soleil, les étoiles et même le champ magnétique de la Terre, comme une boussole invisible. Mais tout le mystère n'est pas encore expliqué.

Alors au printemps, quand les premières hirondelles arrivent dans votre ciel, pensez à leur voyage. Ces petits oiseaux de vingt grammes reviennent d'Afrique.

Et ils sont peut-être nés sous votre toit.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-025",
    title: "J'ai appris à faire du skate",
    category: "sport",
    difficulty: "A2",
    minutes: 2,
    preview: "Cette année, j'ai décidé d'apprendre à faire du skate.",
    blurbEn:
      "At thirty-four, the writer buys a skateboard: the falls, the doubts, a ten-year-old coach called Théo, and the glorious afternoon of the first real ride across the park.",
    body: `Pour mes trente-quatre ans, je me suis offert un cadeau surprenant : un skateboard. Mes amis ont ri. « Un skate ? À ton âge ? » Oui, à mon âge. Quand j'étais ado, je rêvais d'en faire, mais je n'ai jamais osé. Cette année, j'ai décidé : c'est maintenant ou jamais.

Le premier jour, au parc, j'étais très nerveux. J'ai posé un pied sur la planche. Elle a bougé. J'ai posé le deuxième pied. Je suis tombé. Directement, comme un sac de pommes de terre. Une dame m'a demandé si j'allais bien. Mon honneur était plus blessé que mon dos.

Pendant deux semaines, ça a été difficile. Je tombais tous les jours. J'avais des bleus sur les genoux et sur les mains. Le soir, j'avais mal partout. Plusieurs fois, j'ai pensé arrêter. Le skate restait dans l'entrée, et il me regardait avec reproche.

Et puis j'ai rencontré Théo. Théo a dix ans. Il fait du skate comme un champion, avec une facilité incroyable. Un jour, il m'a observé, puis il s'est approché : « Monsieur, vous regardez vos pieds. Il faut regarder loin devant. Et pliez les genoux, sinon vous tombez. »

Les conseils de Théo ont tout changé. Regarder devant. Plier les genoux. Ne pas avoir peur de la vitesse. Chaque samedi, mon petit professeur me donnait une nouvelle leçon. En échange, je lui achetais un jus d'orange. C'était notre contrat.

Le mois dernier, le grand moment est arrivé : j'ai traversé tout le parc sur ma planche, sans tomber, avec le vent sur le visage. À l'arrivée, Théo a applaudi. J'étais fier comme un enfant.

Je ne serai jamais un champion. Je tombe encore, et mes virages sont lents. Mais chaque samedi, je progresse un peu.

Il n'y a pas d'âge pour apprendre. Il y a juste des genoux à plier et un peu de courage à trouver.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-026",
    title: "Mon cours de danse",
    category: "sport",
    difficulty: "A2",
    minutes: 2,
    preview: "Depuis septembre, je vais à un cours de danse le mardi soir.",
    blurbEn:
      "Dragged to a dance class by a friend, the writer starts out with two left feet and a red face — and ends up finding the best evening of the week, and a bit of confidence too.",
    body: `Tout est arrivé à cause de ma collègue Nadia. En septembre, elle m'a dit : « Je commence un cours de danse le mardi soir. Viens avec moi ! » J'ai répondu non. Elle a insisté. J'ai encore dit non. Elle a promis de m'offrir un restaurant. J'ai dit oui. Voilà comment, à quarante ans, je me suis retrouvé dans une salle de danse.

Le premier cours a été une catastrophe. Nous étions quinze débutants, et j'étais le pire. La professeure, madame Elena, montrait les pas : un, deux, trois. Facile ? Pas pour moi. Mes pieds ne m'écoutaient pas. Je tournais à gauche quand tout le monde tournait à droite. J'ai marché sur les pieds de Nadia deux fois. J'étais rouge de honte.

« Ce n'est pas grave ! disait madame Elena avec son accent chantant. Tout le monde débute. Le corps apprend lentement, mais il apprend. »

Elle avait raison. Semaine après semaine, quelque chose a changé. En octobre, je connaissais les pas de base. En novembre, je ne regardais plus mes pieds tout le temps. En décembre, pendant une danse rapide, c'est arrivé : mon corps a bougé tout seul, avec la musique, sans réfléchir. Trois minutes de magie. Nadia m'a regardé, étonnée : « Mais tu danses ! »

Maintenant, le mardi soir est mon moment préféré de la semaine. Au bureau, je regarde ma montre à partir de cinq heures. Dans la salle de danse, j'oublie tout : le travail, les factures, les soucis. Il y a juste la musique, les pas et les rires du groupe.

La danse m'a aussi changé ailleurs. Je me tiens plus droit. J'ose un peu plus. Au mariage de mon cousin, le mois dernier, j'ai dansé toute la soirée. Avant, je restais assis près du buffet.

Merci, Nadia. Au fait, je te dois toujours un restaurant. C'est moi qui invite.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-027",
    title: "Une sortie à vélo en famille",
    category: "sport",
    difficulty: "A2",
    minutes: 2,
    preview: "Dimanche dernier, nous avons fait une sortie à vélo.",
    blurbEn:
      "A family bike ride along the river: proud kids in front, ducks and herons, a flat tyre at the worst moment, and the picnic that turned a breakdown into the best part of the day.",
    body: `Dimanche matin, le soleil brillait et le ciel était tout bleu. Mon mari a proposé : « Et si on sortait les vélos ? » Une heure après, toute la famille roulait sur la piste cyclable, le long de la rivière.

Nous étions quatre : mon mari devant, les enfants au milieu, et moi derrière. Lucas, notre fils de neuf ans, venait de recevoir un nouveau vélo rouge. Il roulait fièrement, le dos bien droit, comme un coureur du Tour de France. Sa petite sœur Emma pédalait fort pour le suivre.

La piste au bord de la rivière est magnifique. Nous sommes passés sous les grands arbres, devant les pêcheurs et les péniches. Emma s'arrêtait tout le temps : pour les canards, pour un héron gris, pour des fleurs jaunes. « Maman, regarde ! » Nous avancions lentement, mais c'était le but : prendre le temps.

Après une heure, le drame. Mon vélo est devenu difficile, puis impossible. Un pneu à plat ! Nous nous sommes arrêtés au bord du chemin. Lucas était déçu : « Alors, la balade est finie ? »

« Pas du tout », a dit mon mari. Il avait tout prévu : les outils et une chambre à air dans son sac. Il a retourné le vélo et il a commencé la réparation, avec Lucas comme assistant. « Passe-moi le démonte-pneu ! » Lucas était ravi d'avoir un rôle important.

Pendant ce temps, Emma et moi, nous avons ouvert le sac du pique-nique, un peu en avance. Des sandwichs, des tomates cerises, un gâteau au yaourt. Nous nous sommes installés dans l'herbe, face à la rivière. Les garçons nous ont rejointes, les mains noires et le sourire fier.

Ce pneu à plat nous a offert la plus belle pause de la journée : une heure au bord de l'eau, sans horaire et sans écran.

Sur le chemin du retour, Lucas a déclaré : « La prochaine fois, on va jusqu'au pont ! » D'accord, champion. Dimanche prochain, le pont.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-028",
    title: "Mon nouveau colocataire",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Il y a six mois, j'ai trouvé un nouveau colocataire.",
    blurbEn:
      "Living with a stranger: the early-riser versus the night owl, the kitchen wars, one honest conversation with written rules — and the surprising friendship that followed.",
    body: `Il y a six mois, mon loyer est devenu trop cher pour moi tout seul. La solution : trouver un colocataire. J'ai mis une annonce, et après quelques rencontres, j'ai choisi Marc, un infirmier de trente ans, calme et souriant. Nous ne nous connaissions pas du tout. J'étais un peu inquiet : vivre avec un inconnu, ce n'est pas rien.

Les premières semaines ont été compliquées. Marc travaille tôt à l'hôpital : il se lève à cinq heures et demie. Moi, je travaille tard : je me couche à une heure du matin. Résultat : il faisait du bruit le matin quand je dormais, et je faisais du bruit le soir quand il dormait. Dans la cuisine, c'était pareil. Il aime tout ranger tout de suite ; moi, je laissais ma vaisselle « pour plus tard ». Sa patience diminuait, je le voyais bien.

Un soir, Marc m'a proposé : « On boit un café et on parle ? » Nous avons discuté honnêtement, sans dispute. Chacun a dit ce qui le dérangeait. Puis nous avons écrit quelques règles simples sur une feuille, collée sur le frigo : silence après vingt-deux heures et avant sept heures, vaisselle faite le jour même, ménage le samedi, chacun son étage dans le frigo.

Une feuille de papier a tout changé. Fini les petites tensions. Et petit à petit, autre chose est arrivé : nous sommes devenus amis. Le dimanche, nous cuisinons ensemble. Marc m'a appris sa recette de lasagnes ; je lui ai montré mon poulet au citron. Nous regardons les matchs de foot ensemble, et il m'a même accompagné chez le médecin quand j'étais malade.

Le mois dernier, ma mère est venue dîner. Elle a observé notre appartement, nos habitudes, nos blagues. En partant, elle m'a dit : « Tu as trouvé un bon colocataire. » Non, maman. J'ai trouvé mieux : un ami, avec un contrat de location.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-029",
    title: "Une journée sans téléphone",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Le week-end dernier, j'ai passé une journée sans téléphone.",
    blurbEn:
      "A self-imposed challenge: one full Saturday without a phone. The phantom reaches for a missing pocket, the surprisingly long hours, a real phone call to grandma — and what came after.",
    body: `Samedi dernier, j'ai fait une expérience : une journée entière sans téléphone. Pas de messages, pas de photos, pas de vidéos. Rien. L'idée est venue d'un chiffre : mon téléphone m'a montré mon temps d'écran de la semaine. Quatre heures par jour. Quatre heures ! J'ai eu un choc.

Vendredi soir, j'ai éteint le téléphone et je l'ai mis dans un tiroir. Bonne nuit, petit écran. À demain. Non : à après-demain.

Le samedi matin a été étrange. Au petit-déjeuner, ma main cherchait le téléphone à côté du bol. Une habitude automatique. Dans le bus, tout le monde regardait son écran ; moi, je regardais la ville. J'ai vu des choses nouvelles dans ma propre rue : une jolie porte bleue, un vieux monsieur qui nourrissait les moineaux, une plaque avec un nom d'histoire.

Le plus difficile ? Les petits moments vides. La file d'attente à la boulangerie. Les cinq minutes avant le rendez-vous avec mon ami. D'habitude, je remplis ces moments avec l'écran. Samedi, je les ai juste… vécus. Au début, c'était inconfortable. Ensuite, c'est devenu reposant.

L'après-midi, j'ai fait des choses oubliées. J'ai lu quarante pages d'un roman, d'un coup. J'ai appelé ma grand-mère depuis le vieux téléphone fixe ; nous avons parlé une heure, et elle était si contente. J'ai cuisiné lentement, sans recette sur écran, avec le vieux livre de cuisine de maman.

Le soir, j'ai remarqué une chose bizarre : la journée m'a semblé longue. Longue et pleine. D'habitude, mes samedis passent à toute vitesse.

Dimanche matin, j'ai rallumé le téléphone. Verdict : vingt-trois messages, et aucun n'était urgent ni important.

Depuis, j'ai gardé une règle : le samedi matin, le téléphone reste dans le tiroir jusqu'à midi. Quatre heures de vraie vie. C'est un bon début.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-030",
    title: "Le pique-nique au parc",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Samedi, il faisait beau. Nous avons fait un pique-nique.",
    blurbEn:
      "A spontaneous Saturday picnic that grew from three friends to eight: everyone brings a dish, nobody brings a corkscrew, a dog steals the show, and the afternoon melts into evening.",
    body: `Samedi matin, Sophie a envoyé un message au groupe : « Il fait super beau. Pique-nique au parc à midi ? » En dix minutes, tout était organisé. C'est ça, la magie des beaux jours : les plans se font tout seuls.

Chacun devait apporter quelque chose. Sophie a préparé sa fameuse salade de pâtes. Marc a pris du pain, trois fromages et du saucisson. Léa a fait un cake aux olives. Moi, j'ai apporté les fruits : des fraises, des cerises et un melon. Karim est arrivé avec une bouteille de jus et une bouteille de vin.

Nous avons trouvé le coin parfait : un grand arbre, de l'ombre, une vue sur le lac. Nous avons étalé deux couvertures et sorti les trésors de nos sacs. La table était magnifique. Un détail manquait : le tire-bouchon. Personne n'y avait pensé ! Karim a essayé d'ouvrir la bouteille avec sa chaussure — une technique vue sur internet. Échec total et fou rire général. Tant pis, jus de fruits pour tout le monde.

Pendant le repas, d'autres amis nous ont rejoints. De trois, nous sommes passés à huit. Un pique-nique, c'est élastique : il y a toujours de la place pour une personne de plus.

Après le repas, chacun a trouvé son bonheur. Marc et Karim ont joué aux cartes. Léa a dormi au soleil, un livre ouvert sur le ventre. Sophie et moi, nous avons parlé de tout et de rien, les pieds dans l'herbe. Un chien est venu nous voir ; il a reçu du saucisson et beaucoup de caresses, puis il est reparti, très content de sa journée.

L'après-midi a glissé doucement vers le soir. Vers sept heures, l'air est devenu frais. Nous avons rangé les affaires, secoué les couvertures, dit au revoir au lac.

Coût de cette journée parfaite : quelques euros chacun. Le bonheur n'est vraiment pas une question d'argent. C'est une question de couverture, d'amis et de soleil.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-031",
    title: "Visiter un château",
    category: "culture",
    difficulty: "A2",
    minutes: 2,
    preview: "Pendant les vacances, nous avons visité un vieux château.",
    blurbEn:
      "A family visit to a Loire château: five hundred years of history, a guide with great stories, a spiral staircase race, royal gardens — and a girl who hated history changing her mind.",
    body: `Pendant les vacances de printemps, mes parents ont annoncé le programme du jour : la visite d'un château au bord de la Loire. Ma sœur Inès a soupiré très fort. « Un château ? Encore de l'histoire ? » Inès déteste l'histoire à l'école. Papa a souri : « Attends de voir. »

Le château est apparu au bout d'une allée d'arbres. Même Inès a dit « waouh ». Des tours rondes, des toits pointus, des murs blancs qui se reflétaient dans la rivière. Une carte postale, mais en vrai.

Notre guide s'appelait monsieur Perrin. Un petit homme passionné, avec une moustache et mille histoires. Grâce à lui, les pierres se sont mises à parler. Dans la grande salle, il nous a montré la cheminée immense : « Ici, on faisait rôtir un bœuf entier pour les fêtes du roi. » Dans la chambre royale, il a raconté les visites secrètes, les trahisons, les lettres cachées. Inès écoutait, les yeux grands ouverts. Elle a même posé trois questions. Trois !

Le moment préféré de tout le monde : l'escalier en colimaçon de la grande tour. Cent trente-sept marches ! Nous les avons comptées en montant. En haut, la vue était incroyable : la Loire, les vignes, les petits villages. On se sentait comme le roi, il y a cinq cents ans.

Après le château, nous avons visité les jardins. Des fleurs partout, dessinées comme un tapis. Des allées parfaites. Maman a pris cent photos. Papa a fait la sieste sur un banc, « pour admirer le ciel du château ».

À la boutique, Inès a acheté un livre. Un livre sur les châteaux de la Loire ! Notre Inès, qui déteste l'histoire. Dans la voiture, elle a lu tout le trajet.

Ce soir-là, papa m'a fait un clin d'œil. L'histoire n'est pas ennuyeuse. Elle est mal racontée, parfois. Merci, monsieur Perrin.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-032",
    title: "Le compost à la maison",
    category: "science",
    difficulty: "A2",
    minutes: 2,
    preview: "L'année dernière, j'ai commencé à faire du compost.",
    blurbEn:
      "From sceptic to convert: a year of home composting, the fear of bad smells, the worms doing invisible work, a lighter bin — and the black gold that made the tomatoes happy.",
    body: `Tout a commencé par une remarque de ma fille Camille, huit ans, en pleine leçon d'écologie à l'école : « Papa, pourquoi on jette les épluchures à la poubelle ? La maîtresse dit qu'on peut faire du compost. » Bonne question. Je n'avais pas de bonne réponse.

Alors, l'année dernière, nous avons commencé. J'ai installé un bac à compost au fond du jardin. Honnêtement, j'avais des doutes. J'imaginais des odeurs terribles et des nuages de mouches. Mes voisins allaient adorer…

La règle est simple, et Camille la connaît par cœur. Dans le compost, on met : les épluchures de fruits et de légumes, le marc de café, les coquilles d'œufs, les feuilles mortes. On ne met pas : la viande, le poisson, le fromage. Camille est la chef du compost. Chaque soir, elle vide le petit seau de la cuisine dans le grand bac, très sérieusement.

Et les mauvaises odeurs ? Surprise : il n'y en a pas. Un compost bien fait sent la forêt, pas la poubelle. Le secret, c'est le mélange : un peu de déchets de cuisine, un peu de feuilles sèches, et on remue de temps en temps.

Dans le bac, une armée invisible travaille pour nous : des vers de terre, des insectes minuscules, des champignons microscopiques. Ils mangent nos déchets et les transforment lentement. Camille les appelle « nos petits ouvriers ». Quand on ouvre le bac, elle les salue.

Après plusieurs mois, la magie était là : au fond du bac, une belle terre noire, douce et riche. Les jardiniers l'appellent « l'or noir ». Au printemps, nous l'avons donnée à nos tomates et à nos fleurs. Résultat : un jardin en pleine forme et des tomates délicieuses.

Autre victoire : notre poubelle a maigri. Presque un tiers de déchets en moins !

Nos épluchures nourrissent le jardin, et le jardin nous nourrit. La boucle est bouclée, comme dit la maîtresse de Camille.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-033",
    title: "J'ai perdu mes clés",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Hier, en rentrant, j'ai cherché mes clés. Elles n'étaient pas là.",
    blurbEn:
      "The evening the keys vanished: an emptied bag on the doorstep, a mental replay of the whole day, phone calls around town, one kind waiter — and a lesson learned about hooks by the door.",
    body: `Hier soir, dix-neuf heures. Je rentre du travail, fatigué, avec une seule envie : mon canapé. Devant ma porte, je mets la main dans ma poche droite. Pas de clés. Poche gauche. Rien. Les poches du manteau. Vides.

Le petit moment de panique commence. Je pose mon sac par terre et je le vide complètement sur le palier : portefeuille, chargeur, un livre, trois stylos, un vieux ticket de cinéma, des miettes mystérieuses. Mais pas de clés. Ma voisine passe et me regarde, assise au milieu de mes affaires. « Tout va bien ? » Très bien, madame Morel, très bien.

Réfléchissons. La technique du détective : refaire la journée à l'envers. Ce matin, j'ai fermé la porte à clé, donc j'avais mes clés. Ensuite : le bus, le bureau, la boulangerie à midi, le café avec Julien à seize heures, le bus du retour. Les clés sont quelque part sur ce chemin.

Premier appel : le bureau. Mon collègue Samir fait le tour de mon poste. Rien sur la table, rien sous les papiers. Deuxième appel : la boulangerie. « Des clés ? Non, désolée, rien aujourd'hui. » Mon espoir diminue. Troisième appel : le café.

« Le Petit Zinc, bonsoir ! » Je décris mes clés : un porte-clés rouge, en forme de poisson. Le serveur rit : « Le poisson rouge ! Oui, il est là ! Vous les avez laissées sur la table, près de la fenêtre. » Je crois que j'ai crié de joie dans le téléphone.

Vingt minutes plus tard, le serveur me donne mes clés avec un grand sourire. « Ça arrive tous les jours, vous savez. Les téléphones, les parapluies, les clés… La table près de la fenêtre est une spécialiste. » Je lui laisse un bon pourboire. Il l'a mérité.

Aujourd'hui, j'ai installé un crochet près de ma porte. Un beau crochet rouge. Maintenant, les clés ont une maison.

Le poisson rouge ne voyagera plus.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-034",
    title: "Apprendre une nouvelle langue",
    category: "culture",
    difficulty: "A2",
    minutes: 2,
    preview: "Il y a un an, j'ai décidé d'apprendre une nouvelle langue.",
    blurbEn:
      "One year of learning Spanish: the humbling start, the ten-minute daily rule, songs and cartoons as teachers, the magic café moment in Seville — and why mistakes are part of the deal.",
    body: `Il y a un an, jour pour jour, j'ai téléchargé une application et j'ai écrit dans mon carnet : « Objectif : parler espagnol. » Pourquoi l'espagnol ? Un rêve de voyage en Andalousie, et une collègue madrilène, Carmen, avec qui je voulais parler autrement qu'en anglais.

Le début a été une leçon de modestie. Les premières semaines, je confondais tout. Je disais « je suis fatigué » à la place de « je suis content ». Carmen riait gentiment. Les verbes espagnols ont des formes partout, comme en français, et ma mémoire refusait de coopérer. Un soir de novembre, découragé, j'ai failli tout arrêter.

C'est Carmen qui m'a sauvé, avec un conseil simple : « Arrête les grandes sessions du dimanche. Fais dix minutes par jour. Tous les jours. » Elle avait raison. Dix minutes le matin avec le café, c'est facile à tenir. Un an plus tard, je n'ai presque jamais raté un jour.

J'ai aussi trouvé mes propres méthodes, les plus agréables. J'écoute des chansons espagnoles et je cherche les paroles. Je regarde des dessins animés — oui, des dessins animés : ils parlent lentement et simplement, c'est parfait. Et le vendredi, à la pause déjeuner, Carmen et moi parlons uniquement en espagnol. Nos collègues nous appellent « la petite Espagne ».

Et puis, en mai, le voyage. Séville, enfin. Dans un café, j'ai commandé en espagnol, discuté avec le serveur du temps et du football, compris ses blagues. En sortant, j'avais un sourire immense. Un an de petits efforts pour ce moment précis. Ça valait tout.

Je fais encore beaucoup d'erreurs. La semaine dernière, j'ai dit à Carmen que j'avais « mangé une porte » au lieu d'une soupe. Elle en rit encore. Mais j'ai compris une chose : les erreurs ne sont pas l'ennemi. Le silence, oui.

Année deux : objectif Andalousie, version longue. Et peut-être, après, l'italien ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-035",
    title: "Le match de basket",
    category: "sport",
    difficulty: "A2",
    minutes: 2,
    preview: "Le jeudi soir, je joue au basket avec des amis.",
    blurbEn:
      "Thursday-night basketball with colleagues in an old gym: an unlikely team, a legendary comeback attempt, two baskets scored, one defeat — and the real victory at the café afterwards.",
    body: `Le jeudi soir, à dix-neuf heures, une chose sacrée m'attend : le basket. Nous jouons dans un vieux gymnase, derrière la mairie. Le sol grince, un panneau est un peu tordu, et le chauffage fonctionne un jour sur deux. Nous adorons cet endroit.

L'équipe, c'est un mélange improbable. Il y a Paul, deux mètres de haut, qui n'a jamais fait de sport avant ses quarante ans. Il y a Sonia, petite et rapide comme l'éclair, la meilleure d'entre nous. Il y a Ahmed, qui commente le match comme à la télévision pendant qu'il joue. Et il y a moi, ni grand ni rapide, mais motivé.

Hier soir, match important : les « Renards » contre les « Aigles ». Enfin, important… Nous avons inventé les noms des équipes et il n'y a pas de trophée. Mais sur le terrain, tout le monde joue comme en finale.

La première mi-temps a été difficile pour mes Renards. Les Aigles menaient de dix points. Sonia nous a rassemblés : « On défend mieux, on passe plus vite, et on y croit ! » Une vraie capitaine.

La deuxième mi-temps a été folle. Paul a bloqué trois tirs avec ses grands bras. Sonia volait des ballons partout. Ahmed criait : « Incroyable retournement de situation, mesdames et messieurs ! » Et moi, j'ai marqué deux paniers. Deux ! Mon record de la saison.

Nous avons perdu de trois points. Au dernier moment, mon tir de la victoire a tourné sur le cercle… et il est sorti. Les Aigles ont crié de joie. J'ai regardé le plafond du vieux gymnase avec désespoir. Ahmed a commenté : « Quelle tragédie sportive ! »

Et puis, comme tous les jeudis, vainqueurs et vaincus sont allés au café d'en face. Une heure de rires, de mauvaise foi et de « la semaine prochaine, on vous détruit ».

Nous jouons au basket, officiellement. En vérité, nous entretenons une amitié. Le score final ne compte pas beaucoup. Le jeudi soir, si.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-016",
    title: "Habiter en colocation à trente ans",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "On imagine que la colocation est réservée aux étudiants.",
    blurbEn:
      "Flat-sharing at thirty isn't a failure — it might be a smart choice. Rents, loneliness, compromises and unexpected friendships: an honest look at adult shared living.",
    body: `Quand j'ai annoncé à ma mère que je repartais en colocation à trente-deux ans, elle a eu un silence inquiet au téléphone. « Mais enfin… tu avais ton appartement ! » Pour sa génération, vivre à plusieurs après ses études ressemble à un retour en arrière, presque à un échec. Pourtant, de plus en plus d'adultes font ce choix, et souvent sans regret.

La première raison est évidemment économique. Dans les grandes villes, les loyers sont devenus fous. Mon studio de vingt-cinq mètres carrés me coûtait presque la moitié de mon salaire. Aujourd'hui, je paie un tiers de moins pour une chambre dans un grand appartement lumineux, avec un salon où l'on peut vraiment inviter des amis, une vraie cuisine, et même un balcon. À budget égal, la colocation offre une qualité de vie qu'un studio ne pourra jamais donner.

Mais réduire la colocation à une question d'argent serait une erreur. Ce qui m'avait le plus surpris, dans mon ancien studio, c'était le silence du soir. On ne le dit pas assez : vivre seul peut être pesant. Rentrer chez soi et raconter sa journée à quelqu'un, partager un repas improvisé, regarder un film à trois un mardi soir — ces petites choses changent la couleur d'une semaine.

Évidemment, tout n'est pas idyllique. Il faut composer avec les habitudes des autres : la vaisselle qui traîne, la musique trop forte, les invités surprise. Nous avons appris à en parler avant que les tensions montent, et nous avons établi quelques règles simples. La colocation est une école de compromis, et à trente ans, on la vit d'ailleurs mieux qu'à vingt : on connaît ses limites, on ose les dire, et on respecte plus facilement celles des autres.

Il y a enfin les bonnes surprises. Léa, ma colocataire, est devenue une amie proche. Simon m'a fait découvrir l'escalade. Nos dîners du dimanche soir sont devenus une institution que personne ne veut manquer.

Ma mère a fini par venir déjeuner chez nous. En partant, elle m'a glissé : « C'est vrai qu'il est bien, cet appartement. Et ils sont gentils, tes colocataires. » Venant d'elle, c'est une victoire totale.

La colocation à trente ans n'est pas une régression. C'est parfois, tout simplement, une manière plus intelligente — et plus chaleureuse — d'habiter la ville.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-017",
    title: "Le succès des podcasts",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Depuis quelques années, les podcasts connaissent un grand succès.",
    blurbEn:
      "Radio was supposed to be dying; instead it reinvented itself in our headphones. Why podcasts fit modern life so well, what makes a voice so intimate, and how to start listening.",
    body: `Il y a dix ans, beaucoup annonçaient la mort de la radio. Les jeunes ne l'écoutaient plus, la télévision et internet avaient gagné. Et pourtant, la radio ne s'est pas éteinte : elle s'est réinventée sous une autre forme. Aujourd'hui, des millions de personnes écoutent chaque jour des podcasts, ces émissions audio que l'on télécharge et que l'on écoute quand on veut.

Le premier atout du podcast, c'est sa liberté. Contrairement à la radio traditionnelle, il n'y a plus d'horaire. L'émission vous attend, pas l'inverse. On peut mettre en pause, revenir en arrière, accélérer. Cette souplesse correspond parfaitement à nos vies morcelées, où le temps libre arrive par petits bouts.

Le deuxième atout, c'est qu'il libère les yeux et les mains. On écoute un podcast en cuisinant, en repassant, en conduisant, en courant. Des moments autrefois vides ou ennuyeux deviennent des moments d'apprentissage ou d'évasion. Mon trajet quotidien en tramway, par exemple, est devenu mon rendez-vous avec une émission d'histoire. Vingt minutes d'attente transformées en vingt minutes de plaisir.

Il faut aussi parler de la variété. Il existe des podcasts sur absolument tout : la philosophie, le crime, la parentalité, le jardinage, l'économie, les histoires d'amour des auditeurs. Des émissions professionnelles côtoient des créations amateurs enregistrées dans une chambre. Cette diversité serait impossible à la radio classique, limitée par ses grilles de programmes.

Mais le vrai secret du podcast est peut-être ailleurs : dans l'intimité de la voix. Écouter quelqu'un au casque, c'est l'avoir tout près de soi. Pas d'image, pas de décor, juste une voix qui vous parle, à vous. Beaucoup d'auditeurs développent un lien étrange avec leurs animateurs préférés : on a l'impression de connaître ces gens, de retrouver des amis chaque semaine.

Certains s'inquiètent : à force d'avoir les oreilles occupées, ne perdons-nous pas le silence, la rêverie, l'ennui fertile ? La question mérite d'être posée. Comme toujours, tout est affaire de dosage.

Si vous n'avez jamais essayé, le mode d'emploi est simple : choisissez un sujet qui vous passionne, cherchez, écoutez. Le premier épisode est rarement le bon ; le troisième, souvent, vous accroche.

La radio n'est pas morte. Elle s'est glissée dans nos poches, et elle ne s'est jamais aussi bien portée.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-018",
    title: "Pourquoi on aime autant les séries",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Aujourd'hui, on peut regarder plusieurs épisodes à la suite.",
    blurbEn:
      "'Just one more episode' — the phrase of a generation. What series give us that films can't, the clever mechanics that keep us hooked, and where the pleasure tips into a problem.",
    body: `« Allez, un dernier épisode et je vais me coucher. » Qui n'a jamais prononcé cette phrase, avant de la trahir aussitôt ? Il est une heure du matin, l'écran demande « Regarder l'épisode suivant ? », et notre doigt clique presque tout seul. Les séries sont devenues le loisir principal de millions de personnes. Ce succès mérite qu'on s'y arrête.

D'abord, la série offre ce que le cinéma ne peut pas offrir : le temps. Un film doit tout raconter en deux heures. Une série, elle, dispose de dix, vingt, parfois cent heures. Les personnages peuvent évoluer lentement, changer, nous surprendre. On les voit vieillir, aimer, échouer, recommencer. Au bout de quelques saisons, ce ne sont plus des personnages : ce sont des connaissances. Certains spectateurs pleurent à la fin d'une série comme on pleure un départ. Ce n'est pas ridicule ; c'est le signe qu'une histoire longue crée des liens profonds.

Ensuite, il faut reconnaître l'habileté des créateurs. La fin de chaque épisode est construite pour nous laisser en suspens : une révélation, un danger, une porte qui s'ouvre. Ce vieux truc de feuilleton existait déjà dans les romans du dix-neuvième siècle, publiés chapitre par chapitre dans les journaux. La différence, c'est qu'autrefois, il fallait attendre une semaine. Aujourd'hui, la suite est à trois secondes. Notre patience n'a plus aucune chance.

Les séries sont aussi devenues un langage commun. Au bureau, à un dîner, elles remplacent la météo dans les conversations. En parler, c'est appartenir à une communauté ; comparer ses théories sur la suite est devenu un jeu collectif.

Faut-il s'inquiéter de tout cela ? Un peu, peut-être. Les soirées entières avalées par un écran, le sommeil raccourci, les livres qui restent fermés : la série est un plaisir qui prend facilement toute la place. J'ai moi-même englouti une saison complète en un week-end pluvieux, et je me souviens du sentiment étrange du dimanche soir — ce mélange de satisfaction et de temps perdu.

La solution n'est certainement pas d'arrêter les séries, qui comptent parmi les grandes créations de notre époque. Elle est plus modeste : décider avant de commencer combien d'épisodes on regardera. Et parfois, avoir le courage héroïque d'éteindre au milieu du suspense.

Le personnage principal survivra jusqu'à demain. Nous aussi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-019",
    title: "Le café est-il bon pour la santé ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "On entend tout et son contraire au sujet du café.",
    blurbEn:
      "Poison one decade, superfood the next: coffee's reputation keeps flipping. What large studies actually show, what caffeine really does, and how to know your own limit.",
    body: `Le café a une histoire médicale mouvementée. Dans les années quatre-vingt, on l'accusait de tous les maux : mauvais pour le cœur, mauvais pour l'estomac, mauvais pour les nerfs. Puis le vent a tourné, et des articles ont commencé à vanter ses bienfaits presque miraculeux. Alors, poison ou remède ? Comme souvent en matière de santé, la vérité est moins spectaculaire et plus intéressante.

Que dit la science aujourd'hui ? Les grandes études menées sur des centaines de milliers de personnes sont plutôt rassurantes. Une consommation modérée — deux à quatre tasses par jour — n'augmente pas les risques pour le cœur chez la plupart des gens. Certaines recherches suggèrent même des effets protecteurs contre plusieurs maladies. Prudence toutefois : ces études montrent des liens statistiques, pas des preuves absolues. Les buveurs de café ont peut-être d'autres habitudes qui expliquent une partie des résultats.

Ce que l'on comprend bien, en revanche, c'est le mécanisme de la caféine. Dans notre cerveau, une substance appelée adénosine s'accumule au fil de la journée et nous donne progressivement envie de dormir. La caféine ressemble à cette molécule et prend sa place, comme quelqu'un qui s'assoit sur votre chaise. Résultat : le signal de la fatigue ne passe plus. Nous ne sommes pas moins fatigués — nous ne le sentons simplement plus. La nuance a son importance.

C'est aussi pour cela que le café du soir est une mauvaise idée pour beaucoup de gens. La caféine reste longtemps dans le corps : la moitié est encore là cinq ou six heures après la tasse. Un expresso à dix-sept heures travaille encore contre votre sommeil à vingt-deux heures. Or un mauvais sommeil fatigue, et la fatigue pousse à boire plus de café le lendemain. Le cercle vicieux classique.

Il faut enfin rappeler que nous sommes très inégaux devant la caféine. Certains la dégradent vite et dorment très bien après un café tardif ; d'autres sentent encore l'effet d'une tasse bue à midi. Cette différence est largement génétique. Le seul vrai expert de votre café, c'est donc votre propre corps.

En résumé : si vous aimez le café, buvez-le sans culpabilité, de préférence avant le milieu de l'après-midi, et sans dépasser ce qui vous convient. Méfiez-vous des gros titres, dans un sens comme dans l'autre.

Et rappelez-vous que le meilleur café reste celui qu'on prend le temps de savourer — idéalement avec quelqu'un.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-020",
    title: "Faut-il vraiment boire deux litres d'eau ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "« Il faut boire deux litres d'eau par jour. » Est-ce exact ?",
    blurbEn:
      "The two-litre rule is repeated everywhere, tracked by apps and printed on bottles. Where the number comes from, what it forgets, and why thirst is smarter than we think.",
    body: `C'est une des règles de santé les plus célèbres du monde : il faudrait boire deux litres d'eau par jour, soit environ huit verres. Des applications comptent nos verres, des bouteilles graduées nous encouragent heure par heure, et beaucoup de gens culpabilisent de ne pas y arriver. Mais d'où vient ce chiffre, au juste ?

Son origine est plus floue qu'on ne le croit. On cite souvent une recommandation américaine des années quarante, qui évoquait effectivement environ deux litres et demi d'eau par jour. Mais la même phrase précisait qu'une grande partie de cette eau vient déjà de nos aliments. Cette seconde moitié de la phrase a été oubliée en route, et seul le chiffre rond a survécu. C'est le destin de beaucoup de conseils de santé : la nuance disparaît, le slogan reste.

Car c'est un fait : nous mangeons de l'eau autant que nous la buvons. Un concombre ou une tomate en contiennent plus de quatre-vingt-dix pour cent. Une soupe, un yaourt, une orange, et même le pain apportent leur part. Le thé et le café comptent aussi, contrairement à une idée reçue tenace : leur effet sur les urines est bien trop faible pour annuler l'eau qu'ils contiennent.

Nos besoins réels, ensuite, varient énormément. Une personne de grande taille qui court sous le soleil d'été n'a pas les besoins d'une personne menue assise dans un bureau climatisé. Le climat, l'activité physique, l'alimentation, l'âge : tout entre en jeu. Donner un chiffre unique pour tout le monde n'a pas beaucoup de sens.

La bonne nouvelle, c'est que nous possédons un instrument de mesure remarquable : la soif. Ce mécanisme, affiné par des millions d'années d'évolution, se déclenche dès que le corps commence à manquer d'eau. Pour la grande majorité des gens en bonne santé, boire quand on a soif suffit amplement. Un indice complémentaire, peu poétique mais fiable : la couleur des urines. Claires, tout va bien ; foncées, buvez davantage.

Il existe bien sûr des exceptions. Les personnes âgées sentent moins la soif et doivent penser à boire, surtout en cas de canicule. Les sportifs et certains malades ont des besoins particuliers.

Mais pour les autres, inutile de transporter partout une bouteille géante ni de compter ses verres avec angoisse. Buvez quand vous avez soif, mangez des fruits et des légumes, et faites confiance à votre corps.

Il fait ce métier depuis très longtemps.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-021",
    title: "Marcher en forêt fait du bien",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Rien ne me détend plus qu'une promenade en forêt.",
    blurbEn:
      "Blood pressure drops, stress hormones fall, attention recovers: science is confirming what walkers always knew. Why the forest calms us, and how to take a proper 'forest bath'.",
    body: `Chaque dimanche matin, je pars marcher une heure dans la forêt qui borde ma ville. Ce n'est ni du sport ni de la randonnée sérieuse : je marche lentement, sans objectif, sans montre. Et chaque dimanche, le même petit miracle se produit : j'entre dans les bois avec les épaules tendues et la tête pleine, j'en ressors léger. Longtemps, j'ai cru que c'était une impression personnelle. La science dit que non.

Depuis les années quatre-vingt, des chercheurs, d'abord au Japon, étudient sérieusement les effets de la forêt sur notre santé. Les résultats sont remarquables. Après une marche en forêt, la tension artérielle baisse, le rythme cardiaque ralentit, et le taux de cortisol — la principale hormone du stress — diminue nettement. La comparaison est parlante : une marche de même durée en ville ne produit pas les mêmes effets. Ce n'est donc pas seulement la marche qui fait du bien ; c'est la forêt elle-même.

Comment l'expliquer ? Plusieurs pistes se complètent. Il y a d'abord ce que la forêt nous enlève : le bruit du trafic, les écrans publicitaires, les sollicitations permanentes. Notre attention, épuisée par la ville, peut enfin se reposer. Les scientifiques parlent d'« attention douce » : regarder la lumière entre les feuilles ou écouter un oiseau ne demande aucun effort, contrairement à la vigilance constante que réclame la vie urbaine.

Il y a aussi ce que la forêt nous donne. Les arbres libèrent dans l'air des composés naturels, et certaines études suggèrent que les respirer stimulerait nos défenses immunitaires. Ces recherches demandent encore confirmation, mais elles sont fascinantes : la forêt serait, littéralement, un air qui soigne.

Les Japonais ont donné un joli nom à cette pratique : shinrin-yoku, le « bain de forêt ». L'idée n'est pas de faire des kilomètres, mais de s'immerger. Marcher lentement. S'arrêter souvent. Toucher une écorce, écouter le vent, respirer profondément. Laisser le téléphone au fond du sac — ou mieux, à la maison.

On objectera que tout le monde n'a pas une forêt à sa porte. C'est vrai, mais l'effet existe aussi, en plus modeste, dans un grand parc, le long d'une rivière, sous les arbres d'une avenue. Le principe reste le même : offrir régulièrement à son cerveau un environnement pour lequel il a été conçu.

Nous avons passé l'essentiel de notre histoire au milieu des arbres. Y retourner une heure par semaine, ce n'est pas fuir le monde moderne.

C'est simplement rentrer un moment à la maison.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-022",
    title: "Se remettre au sport après trente ans",
    category: "sport",
    difficulty: "B1",
    minutes: 3,
    preview: "Pendant des années, je n'ai fait aucun sport.",
    blurbEn:
      "Ten years without sport, one humiliating first session, and the slow method that finally worked. A realistic guide to getting moving again — mistakes included.",
    body: `Entre vingt-cinq et trente-cinq ans, mon activité physique s'est résumée à courir après le bus. Le travail, la fatigue, les séries du soir : j'avais toujours une excellente excuse. Je me disais « je m'y remets le mois prochain » — et les mois prochains se sont accumulés pendant dix ans.

Le déclic est venu d'une scène banale. En montant quatre étages avec mes courses, le jour où l'ascenseur était en panne, je suis arrivé essoufflé comme après un marathon. Trente-cinq ans, et quatre étages me mettaient à genoux. Ce soir-là, j'ai décidé de m'y remettre. Pour de vrai.

Ma première tentative a été un désastre instructif. Plein d'enthousiasme, j'ai enfilé mes vieilles baskets et je suis parti courir « comme avant ». J'ai tenu douze minutes. Les trois jours suivants, j'ai découvert des muscles dont j'ignorais l'existence, uniquement parce qu'ils me faisaient mal. Ma motivation est morte avec mes courbatures, et les baskets sont retournées au placard pour deux mois.

C'est un ami médecin qui m'a expliqué mon erreur : « Tu veux rattraper dix ans en une semaine. Ton cœur est prêt à progresser vite, mais tes tendons et tes articulations ont besoin de mois. Commence ridiculement petit. » Ridiculement petit. Ces mots ont tout changé.

Deuxième tentative, nouvelle méthode : vingt minutes de marche rapide, deux fois par semaine. C'était presque trop facile — et c'était exactement le but. Impossible de trouver une excuse contre vingt minutes. Au bout d'un mois, je suis passé à trois séances en alternant marche et course lente. Puis la course a peu à peu remplacé la marche.

Un an plus tard, le bilan dépasse tout ce que j'espérais. Je cours quarante-cinq minutes sans souffrir, trois fois par semaine. Je dors profondément, moi qui me réveillais toutes les nuits. Mon dos, qui me tourmentait depuis des années de bureau, s'est calmé. Et les quatre étages ? Je les monte en parlant au téléphone.

Si vous êtes dans la situation qui était la mienne, voici ce que j'aurais aimé entendre plus tôt. Commencez plus petit que votre fierté ne le voudrait. Visez la régularité, pas la performance : deux séances tenues valent mieux que cinq séances rêvées. Attendez-vous à un creux de motivation vers la troisième semaine — il passe. Et trouvez un plaisir dans l'activité elle-même, sinon vous ne durerez pas.

Le corps pardonne étonnamment bien les années d'abandon. Il demande seulement qu'on revienne vers lui avec patience.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-023",
    title: "Le plaisir de courir seul",
    category: "sport",
    difficulty: "B1",
    minutes: 3,
    preview: "Quand je cours, je préfère être seul.",
    blurbEn:
      "Group runs, clubs, apps that share every kilometre: running has never been more social. A defence of the opposite — the quiet, unmeasured, gloriously solitary run.",
    body: `Le sport moderne est devenu bavard. Les applications publient nos parcours, les clubs organisent des sorties collectives, les réseaux affichent les performances de chacun. Courir est devenu une activité sociale, mesurée, comparée, commentée. C'est très bien ainsi — pour ceux que cela motive. Mais je voudrais défendre ici l'autre voie, la mienne : celle du coureur solitaire.

Quand je dis à des amis coureurs que je cours toujours seul, je lis souvent une pointe de pitié dans leur regard. Le pauvre, il n'a trouvé personne. C'est mal comprendre : la solitude n'est pas ce que je subis, c'est ce que je cherche.

Courir seul, c'est d'abord une liberté totale. Je pars quand je veux, où je veux. Si je me sens bien, j'allonge le parcours sans demander l'avis de personne ; si mes jambes sont lourdes, je ralentis sans m'excuser. Il n'y a ni rythme à suivre, ni conversation à entretenir, ni niveau à prouver. Le groupe impose toujours une négociation ; la solitude n'impose rien.

C'est ensuite un rare moment de silence mental. Ma vie, comme celle de tout le monde, est saturée de sollicitations : messages, réunions, notifications, décisions. Pendant une heure de course, tout cela s'arrête. Les premières minutes, les pensées de la journée tournent encore. Puis, kilomètre après kilomètre, elles se déposent comme la poussière après le passage d'une voiture. Restent la respiration, le rythme des pas, le paysage qui défile. Certains appellent cela de la méditation. Je n'aime pas les grands mots : je dirais simplement que je m'entends à nouveau penser.

C'est d'ailleurs en courant que me viennent mes meilleures idées. Les problèmes qui me bloquaient depuis des jours se dénouent parfois tout seuls au détour d'un chemin. Ce n'est pas magique : l'esprit, enfin libéré des urgences, fait tranquillement son travail de fond.

J'ajouterai un aveu : courir seul m'a réconcilié avec la lenteur. Sans témoin, plus besoin de paraître. Certains jours, je trottine à peine plus vite qu'un marcheur pressé, et c'est parfait ainsi. Ma montre connaît mes temps ; elle a la délicatesse de les garder pour elle.

Je ne dis pas que le groupe n'a pas ses joies — l'émulation, les encouragements, la troisième mi-temps au café. Il m'arrive d'y goûter avec plaisir.

Mais si vous n'avez jamais couru seul, sans musique, sans compagnon et sans objectif, essayez une fois. Vous découvrirez peut-être, comme moi, que ce rendez-vous avec soi-même est le plus fidèle de tous.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-024",
    title: "La mode de la seconde main",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Acheter des vêtements d'occasion est devenu presque à la mode.",
    blurbEn:
      "From slightly shameful to genuinely cool: how second-hand clothes conquered wardrobes. The price argument, the ecological one, the thrill of the hunt — and the paradox hiding inside the trend.",
    body: `Il n'y a pas si longtemps, avouer qu'on s'habillait en friperie provoquait un petit silence gêné. Les vêtements d'occasion, c'était pour ceux qui ne pouvaient pas faire autrement, et on n'en parlait pas trop. Vingt ans plus tard, le renversement est complet : la seconde main est devenue fière, visible, presque chic. Les applications de revente comptent des millions d'utilisateurs, les friperies ouvrent dans les beaux quartiers, et les adolescents comparent leurs trouvailles comme des trophées.

Comment expliquer un tel retournement ? La première raison tient dans le portefeuille. Les vêtements d'occasion coûtent souvent trois à cinq fois moins cher que le neuf. Pour les familles, pour les étudiants, pour à peu près tout le monde en réalité, l'argument est imparable : pourquoi payer soixante euros ce qui en coûte quinze, à peine porté ?

La deuxième raison est écologique, et elle pèse de plus en plus lourd. L'industrie du vêtement est l'une des plus polluantes du monde. Fabriquer un simple jean exige des milliers de litres d'eau, des produits chimiques, du transport à travers plusieurs continents. Or une grande partie de ces vêtements ne sont presque pas portés avant d'être jetés. Acheter d'occasion, c'est prolonger la vie de ce qui existe déjà — le geste écologique le plus simple qui soit : ne rien produire de nouveau.

Mais il serait faux de réduire la seconde main à un calcul raisonnable. Il y a aussi, et peut-être surtout, le plaisir. Le plaisir de la chasse : fouiller, chercher, tomber sur la perle. Contrairement au magasin classique, où le même pull existe en dix tailles et trois couleurs, la friperie n'offre chaque pièce qu'en un seul exemplaire. Trouver la veste parfaite à sa taille relève du petit miracle, et les petits miracles rendent heureux. On rentre chez soi avec une pièce unique et une histoire à raconter.

Il faut pourtant signaler un paradoxe. La facilité de la revente en ligne pousse certains à acheter davantage de neuf, en se disant qu'ils revendront plus tard. La seconde main devient alors le complice d'une consommation accélérée, exactement l'inverse de sa promesse. Acheter dix vêtements d'occasion dont huit dormiront dans l'armoire n'a rien d'écologique non plus.

La vraie question reste donc la même qu'avant : ai-je besoin de ce vêtement, et vais-je vraiment le porter ?

Si la réponse est oui, alors la seconde main est une double bonne affaire : pour le budget, et pour la planète. Et si l'on y prend du plaisir en plus, où est le problème ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-025",
    title: "Manger local, est-ce vraiment mieux ?",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "On nous conseille de « manger local ». Mais est-ce toujours mieux ?",
    blurbEn:
      "Local food sounds obviously greener — but a heated greenhouse can beat a cargo ship at polluting. Untangling transport, seasons and common sense in what we eat.",
    body: `« Mangez local ! » Le conseil est partout : sur les marchés, dans les magazines, dans la bouche des politiques. L'idée semble frappée au coin du bon sens : un aliment qui voyage moins pollue moins. Acheter les tomates du producteur voisin plutôt que celles qui traversent l'Europe en camion paraît évidemment plus écologique. Et pourtant, la réalité est plus subtile — et plus intéressante.

Commençons par ce qui est vrai. Le circuit court a des avantages incontestables. Il fait vivre les agriculteurs de la région, qui touchent une part plus juste du prix. Il garantit des produits plus frais, cueillis plus mûrs, souvent meilleurs. Il maintient des campagnes vivantes et des savoir-faire locaux. Ces raisons suffisent largement à défendre le marché du samedi.

Mais sur le strict plan du climat, l'affaire se complique. Car le transport, contrairement à ce qu'on croit, ne représente qu'une petite partie de l'empreinte carbone de notre alimentation — souvent moins de dix pour cent. L'essentiel se joue ailleurs : dans la manière de produire.

Un exemple parlant : la tomate. Une tomate cultivée à côté de chez vous, mais en plein hiver dans une serre chauffée au gaz, peut émettre plusieurs fois plus de carbone qu'une tomate d'Espagne poussée sous le simple soleil et transportée en camion. Le trajet de mille kilomètres pèse moins que le chauffage de la serre. « Local » ne veut donc pas automatiquement dire « propre » : tout dépend de la saison et de la méthode.

De même, un agneau élevé en plein air à l'autre bout du monde et arrivé par bateau — le mode de transport le plus économe — peut rivaliser, en bilan carbone, avec une viande produite intensivement tout près. Le bateau transporte des tonnes de marchandises pour très peu d'émissions par kilo. C'est l'avion, lui, qui est catastrophique : méfiance donc envers les produits fragiles et exotiques qui voyagent par les airs.

Que retenir de tout cela, concrètement ? D'abord, que la saison compte plus que la distance. Le raisonnement le plus juste tient en une formule : local ET de saison. La fraise de juin de votre région, oui ; la fraise de janvier, non — qu'elle vienne de loin ou d'une serre voisine.

Ensuite, que le contenu de l'assiette pèse plus que son origine. Réduire un peu la viande a plus d'effet sur le climat que n'importe quelle chasse aux kilomètres.

Manger local reste une belle idée — pour le goût, pour les producteurs, pour le plaisir du marché. Il faut juste lui ajouter un calendrier.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-026",
    title: "Voyager seul pour la première fois",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "La première fois que j'ai voyagé seul, j'avais un peu peur.",
    blurbEn:
      "Ten days alone in Portugal: the awkward first dinner, the freedom of answering to no one, unexpected encounters, and coming home a slightly different person.",
    body: `L'année dernière, mes amis ont annulé nos vacances communes au dernier moment. J'avais déjà posé mes congés, réservé mes billets pour le Portugal. Deux solutions : rester chez moi en boudant, ou partir quand même. Seul. À trente et un ans, je n'avais jamais voyagé seul de ma vie. J'ai pris l'avion avec une boule au ventre.

Autant l'avouer tout de suite : les premières quarante-huit heures ont été difficiles. Le premier soir, à Lisbonne, je suis entré dans un restaurant et j'ai prononcé la phrase qui me faisait le plus peur : « Une table pour une personne, s'il vous plaît. » J'étais persuadé que tout le monde me regardait avec pitié. J'ai mangé vite, les yeux sur mon téléphone, et je suis rentré tôt.

Mais dès le deuxième jour, quelque chose a commencé à changer. Je me suis levé quand je voulais. J'ai passé deux heures entières dans un musée d'azulejos qui aurait ennuyé tous mes amis. J'ai changé mes plans trois fois dans la même journée, sur un simple coup de tête, sans négocier avec personne. Cette liberté totale, je ne l'avais jamais connue. En groupe, chaque décision est un compromis ; seul, chaque envie est un programme.

Et puis il y a eu les rencontres. C'est le grand paradoxe du voyage en solitaire : on n'est presque jamais seul. Quand on voyage en groupe, on reste dans sa bulle. Seul, on devient abordable — et on ose aborder. Une vieille dame m'a raconté l'histoire de son quartier sur un banc de Porto. Des randonneurs allemands m'ont adopté pour une journée de marche. Un soir, dans une auberge, nous nous sommes retrouvés à six, de cinq nationalités différentes, à cuisiner ensemble.

J'ai aussi appris des choses sur moi. Sans personne pour décider à ma place, j'ai découvert ce que j'aimais vraiment — pas ce que le groupe aimait. Le soir, j'écrivais quelques lignes dans un carnet. Relire ces pages aujourd'hui me fait sourire : on y voit, jour après jour, la peur se transformer en confiance.

Le dernier soir, dans le même type de restaurant qu'au premier jour, j'ai demandé ma table pour une personne avec un grand sourire. J'ai mangé lentement, sans téléphone, en regardant la rue.

Voyager seul ne m'a pas seulement fait visiter le Portugal. Cela m'a présenté quelqu'un que je connaissais mal : moi-même. Je suis rentré différent — un peu plus libre, un peu plus ouvert.

Mes amis me demandent déjà où nous partons l'année prochaine. Je ne leur ai pas encore dit que j'hésite à repartir seul.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-027",
    title: "Nos animaux nous comprennent-ils ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Nos animaux nous comprennent-ils vraiment ?",
    blurbEn:
      "Your dog reads your face, your cat knows its name and ignores it anyway. What research reveals about how much our pets really understand us — words, emotions and all.",
    body: `Hier soir, en rentrant du travail après une journée difficile, je me suis assis sur le canapé en soupirant. Mon chien, qui jouait dans le jardin, est venu immédiatement poser sa tête sur mes genoux. Coïncidence ? Habitude ? Ou m'avait-il vraiment « compris » ? Cette question, tous les propriétaires d'animaux se la posent. Et depuis une vingtaine d'années, la science s'y intéresse sérieusement.

Commençons par le chien, l'animal le plus étudié. Les résultats sont impressionnants. Un chien moyen peut apprendre à reconnaître plusieurs dizaines de mots ; certains chiens exceptionnels, entraînés par des chercheurs, en distinguent plusieurs centaines. Mais le vocabulaire n'est que la partie visible. Le vrai talent du chien est ailleurs : il lit nos émotions. Des expériences ont montré que les chiens distinguent un visage humain joyeux d'un visage en colère, même sur de simples photos. Ils sont également sensibles au ton de la voix : les mêmes mots, prononcés gaiement ou sèchement, ne produisent pas du tout la même réaction.

Ce talent n'a rien d'un hasard. Le chien vit avec nous depuis des dizaines de milliers d'années. Pendant tout ce temps, les chiens qui comprenaient le mieux les humains étaient les mieux nourris et les mieux protégés. Génération après génération, l'évolution a fabriqué un spécialiste de l'espèce humaine.

Et le chat ? Son cas est plus amusant. Longtemps, on a cru qu'il ne comprenait rien — ou ne voulait rien comprendre. Les études récentes racontent une autre histoire. Le chat reconnaît parfaitement son nom : des chercheurs japonais l'ont démontré en observant les oreilles et la tête des chats à l'écoute de différents mots. Le chat distingue aussi la voix de son maître de celle d'un inconnu. Simplement, il ne juge pas toujours utile de répondre. Comprendre et obéir sont deux choses différentes — et le chat a choisi son camp.

Il faut cependant rester honnête sur les limites. Nos animaux ne comprennent pas nos phrases comme nous les comprenons. Quand je dis à mon chien « on va au parc après le déjeuner », il attrape « parc » au vol, et le reste se perd. La grammaire, les idées abstraites, le passé et le futur restent hors de leur portée, pour autant qu'on sache.

Mais est-ce si important ? Mon chien ne comprend pas mes phrases ; il comprend mes soupirs, mes silences, ma joie et ma fatigue. La communication ne passe pas toujours par les mots.

Hier soir, sur le canapé, la question ne se posait même pas. Il avait très bien compris.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-028",
    title: "Le plaisir de ne rien faire",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Ne rien faire est souvent vu comme une perte de temps.",
    blurbEn:
      "We fill every empty minute with a screen, and boredom has quietly disappeared from our lives. A defence of idleness — and what we lose when we're never, ever bored.",
    body: `Faites le test : la prochaine fois que vous attendez le bus, regardez autour de vous. Combien de personnes regardent simplement la rue ? Aucune, ou presque. Tous les regards sont baissés vers un écran. La moindre minute vide est aussitôt remplie. Sans nous en rendre compte, nous avons fait disparaître quelque chose de notre vie : l'ennui.

Bon débarras, direz-vous. L'ennui n'a jamais eu bonne réputation. Ne rien faire, dans notre culture, c'est perdre son temps. Il faut être productif, actif, efficace — et quand on ne travaille pas, il faut au moins « profiter », ce qui est encore une forme d'activité. Celui qui regarde le plafond passe pour un paresseux.

Et pourtant. Les chercheurs qui étudient le cerveau ont fait une découverte intéressante : quand nous ne faisons « rien », notre cerveau, lui, ne s'arrête pas du tout. Il passe dans un mode particulier, que les scientifiques appellent le « réseau par défaut ». C'est précisément dans ce mode qu'il trie les souvenirs, fait des liens entre les idées, imagine l'avenir. Autrement dit : c'est quand nous ne faisons rien que se fabriquent nos idées.

L'expérience le confirme d'ailleurs sans laboratoire. Où vous viennent vos meilleures idées ? Rarement devant l'ordinateur, en pleine concentration. Presque toujours sous la douche, en marchant, en regardant par la fenêtre d'un train. Ces moments ont un point commun : l'esprit y est libre, sans tâche à accomplir. Archimède, dit-on, a eu son idée dans son bain — pas à son bureau.

Les enfants nous donnent aussi une leçon. Laissez un enfant s'ennuyer, résistez à l'envie de lui proposer une activité, et observez. Après une phase de plaintes — « je m'ennuiiiie » —, il finit toujours par inventer quelque chose : un jeu, une histoire, une cabane. L'ennui est le point de départ de l'imagination. En remplissant chaque minute de nos enfants, et de nous-mêmes, nous supprimons ce point de départ.

Alors, que faire — ou plutôt, que ne pas faire ? J'ai commencé un petit exercice, presque ridicule de simplicité : chaque jour, dix minutes assis, sans téléphone, sans livre, sans musique. Juste regarder par la fenêtre. Les premiers jours, c'était étonnamment inconfortable ; ma main cherchait le téléphone toute seule. Puis le calme est venu, et avec lui, des pensées que je n'avais jamais le temps d'avoir.

Je ne dis pas qu'il faut s'ennuyer toute la journée. Je dis qu'un peu de vide, dans une vie trop pleine, n'est pas du temps perdu.

C'est peut-être le temps le mieux employé de la journée.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-029",
    title: "Apprendre à dire non",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Pendant longtemps, je disais oui à tout.",
    blurbEn:
      "Saying yes to everyone left the writer exhausted and secretly resentful. How one burnt-out weekend led to a small revolution: polite, honest refusal — and better friendships.",
    body: `Pendant des années, j'ai été la personne qui dit toujours oui. Un collègue avait besoin d'aide pour finir un dossier ? Oui. Un ami déménageait samedi ? Oui. Une réunion de plus, un service de plus, une soirée de plus alors que je rêvais de mon canapé ? Oui, oui, oui. J'étais fier de cette réputation : on pouvait compter sur moi. Toujours.

Le problème, c'est que cette médaille avait un revers que je refusais de voir. J'étais épuisé. Mes week-ends appartenaient aux autres. Mes propres projets — le sport, la lecture, ce cours de photo dont je parlais depuis trois ans — étaient toujours reportés, faute de temps. Et surtout, un sentiment désagréable grandissait en moi : une sorte de colère discrète contre ceux à qui je rendais service. Ils ne m'avaient pourtant rien fait ; ils demandaient, je disais oui. La colère aurait dû viser le seul vrai responsable : moi.

Le déclic est arrivé un dimanche soir. J'avais passé tout le week-end à aider trois personnes différentes, et je réalisais que je n'avais pas eu une heure pour moi. Pas une. Assis dans ma cuisine, j'ai compris une phrase toute simple, qui a tout changé : chaque oui dit aux autres est un non dit à soi-même. Mon agenda était plein de oui ; ma vie était pleine de non.

Apprendre à refuser a été plus difficile que prévu. Le premier non m'a coûté une nuit de réflexion — pour une simple soirée que je ne voulais pas passer. J'avais peur de décevoir, de passer pour un égoïste, de perdre des amis. J'ai découvert trois choses qui m'ont beaucoup aidé.

D'abord, on peut dire non sans se justifier pendant dix minutes. « Merci d'avoir pensé à moi, mais je ne pourrai pas » est une phrase complète. Plus on explique, plus on s'excuse, plus on donne l'impression qu'on cherche une permission.

Ensuite, on peut proposer autre chose quand on le souhaite vraiment : « Je ne peux pas t'aider samedi, mais je suis libre mercredi soir. » Le non devient un choix, pas un rejet.

Enfin — et ce fut la vraie surprise — les gens l'acceptent très bien. Personne ne s'est fâché. Personne n'a cessé de m'appeler. Mes amitiés ont même gagné en qualité : quand je dis oui, maintenant, c'est un vrai oui, joyeux, entier, sans colère cachée.

Je dis encore oui souvent. Aider les autres reste un plaisir. Mais c'est devenu une décision, plus un réflexe.

Et mes samedis, parfois, sont enfin à moi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-030",
    title: "Pourquoi bâillons-nous ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Nous bâillons tous, mais savons-nous pourquoi ?",
    blurbEn:
      "We yawn before birth, we yawn when others yawn, and even dogs catch our yawns. Yet science still can't fully explain this strange, ancient, contagious reflex.",
    body: `C'est un geste que nous faisons cinq à dix fois par jour, que nous faisions déjà dans le ventre de notre mère, et que nous partageons avec les chats, les poissons et les crocodiles. Un geste si banal que personne n'y pense — jusqu'au moment où quelqu'un pose la question : au fait, pourquoi bâillons-nous ? Et là, surprise : la science elle-même n'a pas de réponse définitive.

L'explication la plus connue est aussi la plus fausse. On l'apprend encore parfois à l'école : nous bâillerions pour faire entrer plus d'oxygène dans notre corps. L'idée semble logique — cette grande inspiration, cette bouche ouverte... Malheureusement pour elle, elle a été testée, et elle ne tient pas. Des chercheurs ont fait respirer à des volontaires de l'air plus ou moins riche en oxygène : le nombre de bâillements n'a pas bougé. L'hypothèse de l'oxygène est morte, même si elle continue de circuler dans les conversations.

Alors, quelles sont les pistes sérieuses ? La plus solide aujourd'hui est thermique : le bâillement servirait à refroidir le cerveau. Comme un ordinateur, notre cerveau chauffe quand il travaille, et il fonctionne mieux à la bonne température. Le grand mouvement de mâchoire et l'air inspiré rafraîchiraient le sang qui monte vers la tête. Plusieurs observations vont dans ce sens : on bâille davantage quand la température autour de nous augmente, et poser une poche froide sur son front réduit l'envie de bâiller. Voilà pourquoi, aussi, nous bâillons aux moments de transition — réveil, endormissement, ennui : autant de moments où le cerveau change de régime.

Mais le plus fascinant reste la contagion. Vous le savez déjà : voir quelqu'un bâiller donne envie de bâiller. Entendre un bâillement suffit. Lire un texte sur le bâillement suffit — et j'imagine que vous avez déjà bâillé depuis le début de cet article. Cette contagion n'a rien d'anodin : elle est liée à l'empathie. Les études montrent que nous « attrapons » plus facilement les bâillements de nos proches que ceux des inconnus. Les jeunes enfants, dont l'empathie est encore en construction, n'y sont pas sensibles. Et votre chien, après des milliers d'années de vie commune avec nous, peut attraper vos bâillements — seul animal connu à traverser ainsi la frontière des espèces.

Un geste vieux de millions d'années, présent avant la naissance, contagieux par simple lecture, et toujours mystérieux : le bâillement est une belle leçon de modestie pour la science.

Alors, combien de fois avez-vous bâillé en lisant ceci ? Ne vous excusez pas. C'est la preuve que vous êtes humain — et probablement quelqu'un d'empathique.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-031",
    title: "Vivre avec un petit budget",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Étudiant, j'ai dû apprendre à vivre avec un petit budget.",
    blurbEn:
      "Student years on a tiny budget taught the writer lessons no salary ever erased: cooking, tracking the invisible small expenses, free pleasures — and the difference between want and need.",
    body: `Quand je suis parti étudier à Lyon, mes parents ne pouvaient pas m'aider beaucoup. Entre ma petite bourse et quelques heures de travail le samedi, je disposais, une fois le loyer payé, d'environ deux cents euros par mois pour tout le reste : manger, me déplacer, vivre. Deux cents euros. J'ai le sourire en y repensant, mais sur le moment, il a fallu apprendre. Vite.

La première leçon a été la cuisine. Un étudiant qui mange dehors, même des sandwichs, brûle son budget en dix jours — je l'ai vérifié dès le premier mois, avec la panique de fin de mois qui va avec. Alors j'ai appris à cuisiner, armé d'un livre d'occasion et des conseils de ma grand-mère au téléphone. J'ai découvert un monde : les légumes de saison qui coûtent trois fois moins cher, les légumes secs — lentilles, pois chiches, haricots — nourrissants et presque gratuits, la grande casserole du dimanche qui donne quatre repas pour la semaine. Mon plat star, le curry de lentilles, revenait à moins d'un euro la portion. Dix ans plus tard, je le cuisine encore.

La deuxième leçon a été plus subtile : les petites dépenses invisibles. J'ai noté, pendant un mois, absolument tout ce que je dépensais. Le résultat m'a stupéfié. Le café en machine, le grignotage, les petits achats « de rien du tout » : mis bout à bout, ils dépassaient mon budget alimentaire ! Ce n'étaient pas les grosses dépenses qui me ruinaient, c'étaient les minuscules. Depuis cette découverte, je note mes dépenses une semaine par trimestre, juste pour vérifier où file l'argent. Il file toujours par les petits trous.

La troisième leçon est la plus précieuse : le gratuit. Privé de cinéma, de concerts et de restaurants, j'ai exploré ce qui ne coûte rien — et la liste est longue. Les musées le premier dimanche du mois. La bibliothèque, ce palais gratuit. Les pique-niques au parc plutôt que les terrasses. Les soirées jeux chez les uns et les autres, chacun apportant quelque chose. Ces années serrées m'ont laissé un paradoxe : je n'ai jamais eu aussi peu d'argent, et rarement une vie sociale aussi riche.

Aujourd'hui, ma situation est confortable, et je ne romantise pas la pauvreté : les fins de mois angoissées, les soins dentaires repoussés, je m'en souviens aussi. Mais ces années m'ont appris à séparer deux questions que la publicité s'efforce de mélanger : en ai-je envie, ou en ai-je besoin ?

L'envie passe. Le besoin, lui, est étonnamment petit.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-032",
    title: "Le retour des jeux de société",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Loin de disparaître, les jeux de société reviennent en force.",
    blurbEn:
      "They were supposed to die with the video game — instead, board games are living a golden age. Cafés, festivals, a creative boom, and the simple pleasure screens can't replace.",
    body: `Dans les années deux mille, le pronostic semblait évident : entre les consoles, les ordinateurs et bientôt les téléphones, les jeux de société allaient rejoindre les cassettes vidéo au musée des loisirs disparus. Vingt ans plus tard, le verdict est tombé — et c'est l'inverse qui s'est produit. Les jeux de société vivent un âge d'or. Les ventes battent des records année après année, des cafés-jeux ouvrent dans toutes les grandes villes, et le festival de Cannes... des jeux de société attire des dizaines de milliers de visiteurs.

Que s'est-il passé ? D'abord, le jeu de société lui-même a changé. Oubliez les souvenirs de parties interminables et de règles poussiéreuses. Une nouvelle génération de créateurs — car il y a de véritables auteurs de jeux, dont les noms figurent sur les boîtes — a inventé des jeux plus courts, plus malins, plus beaux. Des jeux coopératifs, où tous les joueurs gagnent ou perdent ensemble, parfaits pour les familles fatiguées des disputes. Des jeux d'ambiance qui font hurler de rire en cinq minutes. Des jeux d'enquête qu'on ne joue qu'une fois, comme on regarde un film. Il existe aujourd'hui un jeu pour chaque personne, chaque durée, chaque humeur.

Mais la qualité des jeux n'explique pas tout. Si nous revenons autour des tables, c'est aussi, précisément, à cause des écrans. Après des journées entières passées derrière un ordinateur, puis des soirées chacun sur son téléphone, beaucoup ressentent le même manque : être vraiment ensemble. Le jeu de société offre exactement cela. Pendant une partie, on se regarde dans les yeux, on bluffe, on négocie, on rit, on se moque gentiment. Essayez de tricher aux cartes par visioconférence : ce n'est pas pareil.

J'ai un exemple à la maison. L'an dernier, nous avons instauré le « vendredi jeux » : téléphones dans un panier à l'entrée, pizza, et deux ou trois parties. Au début, nos amis venaient par curiosité. Maintenant, ils réservent leur vendredi des semaines à l'avance, et malheur à nous si nous annulons. Le moment le plus demandé de la semaine est celui où il n'y a rien à regarder.

Il serait faux d'opposer brutalement écrans et plateaux : beaucoup de joueurs aiment les deux, et d'excellents jeux vidéo se jouent aussi ensemble. Mais le succès des jeux de société envoie un signal clair sur notre époque.

La technologie nous a tout donné, sauf une chose : une bonne raison de nous asseoir autour d'une table, face à face, pendant une heure. Il a suffi d'une boîte en carton.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-033",
    title: "La marche nordique",
    category: "sport",
    difficulty: "B1",
    minutes: 3,
    preview: "Ces personnes qui marchent avec deux bâtons font de la marche nordique.",
    blurbEn:
      "Those walkers with ski poles and no snow aren't lost: Nordic walking works nearly the whole body while sparing the joints. One sceptic tries a session and eats his words.",
    body: `La première fois que j'ai croisé un groupe de marche nordique dans mon parc, je l'avoue, j'ai souri. Une dizaine de personnes marchaient d'un pas énergique avec des bâtons de ski — en plein mois de juin, sans un flocon de neige à l'horizon. Cela ressemblait à une blague, ou à une mode bizarre venue d'ailleurs. J'ai eu tort de sourire, et cet article est ma façon de le reconnaître.

D'où vient cette pratique ? De Finlande, comme son nom l'indique. Dans les années trente, les skieurs de fond finlandais cherchaient un moyen de s'entraîner l'été, sans neige. Ils ont gardé les bâtons et laissé les skis. La méthode s'est perfectionnée, des bâtons spécifiques ont été créés, et la marche nordique est devenue un sport à part entière, aujourd'hui pratiqué par des millions de personnes en Europe.

Mais pourquoi diable marcher avec des bâtons ? C'est toute la différence avec la marche ordinaire. Quand nous marchons normalement, nos bras se balancent pour rien : tout le travail vient des jambes. Avec les bâtons, chaque pas s'accompagne d'une poussée des bras. Résultat : les épaules, les bras, la poitrine et le dos entrent dans la danse. Les spécialistes estiment que la marche nordique mobilise environ quatre-vingts pour cent des muscles du corps, contre à peine la moitié pour la marche classique. On brûle nettement plus d'énergie — sans s'en rendre compte, car l'effort est réparti sur tout le corps.

L'autre grand avantage, c'est la douceur. Contrairement à la course, il n'y a pas de choc à chaque pas : les articulations — genoux, hanches, chevilles — sont épargnées, et les bâtons soulagent même une partie du poids du corps. C'est pourquoi ce sport convient à presque tout le monde : sportifs en récupération, personnes âgées, débutants complets, personnes en surpoids. Chacun avance à son rythme, et le groupe s'adapte.

Le mois dernier, poussé par ma voisine — soixante-dix ans et un mollet d'acier —, j'ai enfin essayé. Leçon d'humilité immédiate : la technique ne s'invente pas. Pendant vingt minutes, mes bras et mes jambes ont refusé de se coordonner, sous l'œil amusé du groupe. Puis le mouvement est venu, naturel, ample, presque hypnotique. Une heure plus tard, j'avais chaud partout, les idées claires, et une inscription pour le samedi suivant.

Moralité : méfiez-vous des sports qui font sourire. Ce sont souvent ceux qui durent. Et si vous croisez un groupe de marcheurs à bâtons dans votre parc, ne souriez pas trop vite.

Dans un mois, ce sera peut-être vous.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-034",
    title: "L'importance du petit-déjeuner",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Le petit-déjeuner est-il vraiment le repas le plus important ?",
    blurbEn:
      "'The most important meal of the day' — says who, exactly? What the slogan owes to cereal marketing, what science actually finds, and why sugar at 7 a.m. betrays you at 10.",
    body: `« Le petit-déjeuner est le repas le plus important de la journée. » Vous connaissez la phrase ; vos parents la connaissaient déjà. Elle a la solidité d'un proverbe et l'autorité d'une loi. Petite question gênante : d'où vient-elle ? En partie... des publicités des fabricants de céréales, au début du vingtième siècle. Les slogans les plus efficaces finissent par ressembler à de la science. Cela ne veut pas dire que la phrase est fausse — mais cela invite à la regarder de plus près.

Que dit la recherche, justement ? Des choses plus nuancées que le proverbe. Oui, un bon petit-déjeuner présente des avantages réels, surtout pour certaines personnes. Après une nuit de jeûne, le corps et le cerveau apprécient un apport d'énergie. Chez les enfants et les adolescents, les études sont assez claires : ceux qui déjeunent le matin se concentrent mieux en classe pendant la matinée. Pour un écolier, sauter le petit-déjeuner est rarement une bonne affaire.

Mais chez les adultes, l'obligation ne tient pas. Contrairement à une croyance répandue, sauter le petit-déjeuner ne fait pas grossir et ne « bloque » pas le métabolisme : les études sérieuses n'ont trouvé aucun effet catastrophique. Des millions de gens n'ont simplement pas faim le matin, et les forcer à manger n'a aucun sens. Le corps sait généralement ce qu'il fait. La vraie règle est décevante de simplicité : si vous avez faim le matin, mangez ; sinon, non.

La question la plus intéressante n'est d'ailleurs pas « faut-il déjeuner ? » mais « que mettre dans son assiette ? ». Car tous les petits-déjeuners ne se valent pas, et le plus répandu est probablement le pire : céréales sucrées, jus de fruits, pain blanc et confiture. Un repas presque entièrement composé de sucre. Il provoque une montée d'énergie rapide... suivie d'une chute tout aussi rapide. C'est le fameux « coup de barre » de dix heures et demie, avec fringale et concentration en berne. Votre petit-déjeuner sucré vous a trahi.

La parade est connue : des protéines et des fibres. Un œuf, un yaourt nature, du fromage, du pain complet, une poignée de noix, un fruit entier plutôt qu'un jus. Ce type de repas libère son énergie lentement et tient au corps jusqu'au déjeuner, sans montagnes russes.

Alors, repas le plus important de la journée ? Disons plutôt : un repas comme les autres — ni sacré, ni obligatoire, mais qui mérite mieux que du sucre en boîte colorée.

Le plus important, au fond, c'est peut-être simplement de commencer la journée sans se mentir sur ce qu'il y a dans le bol.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-035",
    title: "Tenir un journal",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Depuis un an, j'écris quelques lignes chaque soir.",
    blurbEn:
      "A notebook, five minutes, no talent required: one year of keeping a daily journal, what it does to a cluttered mind, and the strange pleasure of rereading an ordinary Tuesday.",
    body: `Il y a un an, dans une petite librairie, j'ai acheté un carnet noir sur un coup de tête. Le soir même, j'ai écrit quelques lignes sur ma journée. Je ne savais pas encore que je venais de commencer l'habitude la plus tenace de ma vie d'adulte. Trois cent soixante-cinq soirs plus tard, le carnet noir est plein, son successeur est bien entamé, et je voudrais expliquer pourquoi je continue.

D'abord, balayons les malentendus. Tenir un journal, ce n'est pas écrire ses mémoires, ni faire de la littérature, ni raconter des secrets brûlants. Mon journal est d'une banalité totale : ce que j'ai fait, qui j'ai vu, ce qui m'a agacé ou réjoui. Cinq minutes, dix les grands soirs. Personne ne le lira, et c'est exactement ce qui le rend possible : sans lecteur, pas de style à soigner, pas d'image à défendre. On écrit comme on pense.

Le premier effet m'a surpris par sa rapidité : écrire calme. Les soirs de contrariété, poser les choses sur le papier les fait rétrécir. Une dispute, une inquiétude, une vexation de bureau : tant qu'elles tournent dans la tête, elles grossissent ; une fois écrites, elles prennent leur taille réelle, souvent modeste. Les psychologues ont étudié le phénomène — mettre des mots sur les émotions aide le cerveau à les traiter —, mais nul besoin d'étude pour le sentir. C'est physique. On ferme le carnet plus léger qu'on ne l'a ouvert.

Le deuxième effet est plus lent, plus profond : le journal apprend à regarder. Quand on sait qu'on écrira ce soir, on traverse sa journée autrement. On remarque le détail amusant, la phrase entendue dans le bus, la lumière inhabituelle sur l'immeuble d'en face — parce qu'il faudra bien avoir quelque chose à noter. L'écriture ne se contente pas d'enregistrer la vie : elle rend plus attentif à la vie. Mes journées n'ont pas changé ; mon regard, si.

Et puis il y a la relecture. C'est le cadeau différé du journal. Relire un mardi ordinaire d'il y a un an est une expérience étrange et émouvante : ce jour, je l'avais complètement oublié, et le voilà rendu, avec sa pluie, son fou rire et son petit souci désormais réglé. Sans le carnet, ce mardi n'existerait plus nulle part. Nous oublions l'essentiel de notre propre vie ; quelques lignes suffisent à en sauver des morceaux.

Si l'envie vous prend, le mode d'emploi tient en trois règles. Un carnet qui vous plaît. Un moment fixe — le soir, au lit, fonctionne bien. Et aucune exigence : deux lignes suffisent, les jours vides ont droit à « rien à signaler ».

C'est tout. Le reste — le calme, l'attention, la mémoire — vient tout seul, page après page.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-016",
    title: "Faut-il encore apprendre par cœur ?",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "À quoi bon mémoriser, alors que tout se trouve en ligne ?",
    blurbEn:
      "In an age when every fact is a tap away, memorising seems pointless. Yet a mind without stored knowledge may be a mind that cannot truly think. A nuanced defence of learning by heart.",
    body: `« Pourquoi apprendre les dates, les poèmes, les tables de multiplication, puisque tout cela se trouve en trois secondes dans notre poche ? » L'argument, on l'entend partout, et il n'a rien de sot. Il traduit même une intuition juste de notre époque : à l'heure où une bibliothèque infinie tient dans un téléphone, la mémoire humaine semble avoir perdu son emploi. Pourtant, à y regarder de plus près, cette conclusion rapide me paraît reposer sur une erreur profonde sur ce qu'est penser.

Reconnaissons d'abord ce que l'argument a de vrai. Il serait absurde de faire mémoriser à un élève l'annuaire ou une liste que la machine restitue instantanément. L'école a longtemps confondu instruction et récitation, et elle a eu raison, en partie, de s'en éloigner pour développer l'analyse, l'esprit critique, la capacité à chercher et à trier l'information. Un cerveau transformé en simple disque dur est un gâchis ; sur ce point, les adversaires de « l'apprentissage par cœur » ont marqué un point.

Mais ils commettent une confusion décisive : ils croient qu'on peut réfléchir sans rien savoir, penser dans le vide, raisonner sur un contenu qu'on irait chercher à mesure. Or c'est faux, et les sciences cognitives le confirment nettement. Pour comprendre une information nouvelle, il faut l'accrocher à des connaissances déjà présentes dans l'esprit. Lisez un article sur un sujet que vous ignorez totalement : les mots défilent, mais rien ne se fixe, faute de crochets où suspendre le sens. À l'inverse, l'expert lit le même texte et en saisit chaque nuance, parce que son savoir intérieur lui fournit le contexte. La connaissance stockée n'est pas l'ennemie de la réflexion : elle en est la condition. On ne pense pas malgré ce qu'on sait, on pense avec.

Il y a plus. Consulter sans cesse un écran a un coût caché. Chaque interruption pour vérifier une donnée rompt le fil du raisonnement ; l'esprit qui doit tout chercher n'a jamais assez de matériaux disponibles pour établir des liens rapides, ces rapprochements soudains d'où naissent les idées. Le savant qui a « en tête » mille faits de son domaine voit des connexions invisibles à celui qui devrait les chercher un par un. La créativité se nourrit de ce qui est immédiatement là, dans l'esprit, prêt à se combiner.

Reste enfin ce que l'argument utilitaire oublie tout à fait : certains savoirs ne servent à rien, et c'est précisément leur valeur. Un poème appris à l'enfance nous accompagne toute la vie, revient un soir de tristesse ou de bonheur, nous relie à ceux qui l'ont su avant nous. Le savoir n'est pas qu'un outil ; il est aussi une compagnie, une culture partagée, une part de nous-mêmes qu'aucun écran ne remplacera.

La bonne question n'est donc pas « mémoire ou réflexion ? » — fausse opposition —, mais « que vaut-il la peine de savoir par cœur ? ». À cette question, chaque époque doit répondre à nouveau. La nôtre aurait tort de répondre « rien ».`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-017",
    title: "Le mystère du sommeil",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Nous passons un tiers de notre vie à dormir. Pourquoi ?",
    blurbEn:
      "Sleep is evolution's strangest bet: hours of helplessness every night. Modern science reveals a brain feverishly at work — cleaning, sorting, repairing — while we lie unconscious.",
    body: `Arrêtons-nous un instant sur l'étrangeté de ce que nous faisons chaque nuit. Pendant environ un tiers de notre existence, nous cessons de manger, de nous reproduire, de nous défendre. Nous perdons conscience, immobiles et sans protection, à la merci du premier danger. Du point de vue de la survie, le sommeil est une folie. Si l'évolution, qui élimine sans pitié tout ce qui est inutile ou coûteux, a conservé ce comportement chez tous les animaux, du ver au dauphin, c'est qu'il doit remplir des fonctions absolument vitales. Lesquelles ? La science n'a levé le voile que récemment, et le tableau qu'elle dessine est stupéfiant.

Longtemps, on a cru le sommeil passif : le corps « débranché » se reposerait, un point c'est tout. Cette image est aujourd'hui balayée. La nuit, le cerveau ne s'éteint pas ; il travaille avec une intensité parfois supérieure à celle de la veille, mais à d'autres tâches. La plus fascinante concerne la mémoire. Pendant le sommeil, le cerveau rejoue les expériences de la journée, trie l'essentiel du négligeable, et transfère les souvenirs importants vers un stockage durable. C'est la nuit, littéralement, que nous apprenons ce que nous avons vécu le jour. Des expériences le montrent sans ambiguïté : à effort égal, ceux qui dorment après avoir appris retiennent nettement mieux que ceux qui restent éveillés. L'étudiant qui sacrifie sa nuit avant l'examen se prive de l'outil même qui grave ses révisions.

Plus spectaculaire encore : la découverte, dans les années deux mille dix, d'un véritable système de nettoyage du cerveau. Pendant le sommeil profond, l'espace entre les cellules nerveuses s'élargit, et un liquide vient évacuer les déchets accumulés durant la journée — dont certaines protéines associées aux maladies neurodégénératives. En dormant, le cerveau fait, en somme, son ménage. Un ménage impossible à faire pendant qu'il tourne à plein régime, comme on ne lave pas une rue en pleine circulation.

Ces découvertes éclairent les dégâts du manque de sommeil, longtemps sous-estimés. Une privation prolongée n'affecte pas seulement l'humeur et la concentration ; elle nuit à la mémoire, à l'immunité, à la régulation des émotions, et augmente les risques de nombreuses maladies. Une société qui traite le sommeil comme du temps perdu, qu'on rogne pour être « productif », se trompe donc gravement de calcul.

Et pourtant — et c'est là que l'humilité s'impose —, l'essentiel nous échappe encore. Nul ne sait vraiment pourquoi nous rêvons, ni à quoi servent ces récits absurdes que notre esprit fabrique chaque nuit. Les hypothèses abondent, aucune ne fait l'unanimité. Au cœur de l'expérience la plus universelle qui soit, un mystère demeure intact.

Ce que la science établit clairement, en revanche, c'est ceci : dormir n'est pas s'absenter du monde. C'est accomplir, dans l'ombre, un travail sans lequel la veille elle-même deviendrait impossible.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-018",
    title: "La politesse a-t-elle vraiment disparu ?",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "« Les jeunes ne sont plus polis. » Faut-il le croire ?",
    blurbEn:
      "Every generation mourns the death of good manners — and every generation is wrong. Politeness doesn't vanish; it migrates. A look at the shifting, unkillable rules of respect.",
    body: `« De mon temps, on se levait quand un adulte entrait ; on disait bonjour, madame ; on ne coupait pas la parole. » Combien de fois avez-vous entendu ce refrain ? Il traverse les siècles, remarquablement stable. Socrate, déjà, se serait plaint de la jeunesse insolente de son époque. Chaque génération, arrivée à un certain âge, contemple la suivante et diagnostique la même maladie mortelle : la fin de la politesse. Que cette plainte se répète identique depuis deux mille cinq cents ans devrait pourtant nous mettre la puce à l'oreille. Si la politesse disparaissait vraiment à chaque génération, il y a longtemps qu'il n'en resterait rien. Or elle est toujours là. C'est donc qu'elle ne meurt pas : elle se déplace.

Car il faut distinguer deux choses que la nostalgie confond : les formes de la politesse et son principe. Les formes, oui, changent, et parfois vite. Se découvrir devant une dame, baiser la main, employer des formules cérémonieuses : ces gestes, autrefois obligatoires, ont largement disparu, et celui qui les pratiquerait aujourd'hui paraîtrait affecté plutôt que courtois. De même, le tutoiement a gagné du terrain, les codes vestimentaires se sont relâchés, la déférence envers l'âge et le rang s'est atténuée. Vu à travers ces formes anciennes, oui, le monde semble impoli.

Mais regardons ce qui les a remplacées, car la place n'est jamais restée vide. Notre époque a inventé ses propres exigences, souvent plus subtiles et parfois plus lourdes que les anciennes. On fait aujourd'hui bien plus attention qu'autrefois à ne blesser personne par ses paroles ; des mots hier banals sont devenus inacceptables, parce qu'on tient compte de gens que l'ancienne politesse ignorait superbement. On s'excuse de déranger, on remercie par écrit, on demande la permission de photographier quelqu'un. La politesse envers les femmes a changé de nature : moins de mains baisées, davantage de respect réel. Ce que nous avons perdu en cérémonie, nous l'avons peut-être regagné en considération.

Il ne s'agit pas de nier tout problème. La circulation, l'anonymat des villes, la brutalité de certains échanges en ligne créent des formes d'impolitesse bien réelles, et l'écran, qui met un visage à distance, désinhibe des grossièretés qu'on n'oserait pas en face. Chaque époque a ses zones de rudesse. Mais l'idée d'un effondrement général ne résiste pas à l'examen : elle relève de cette illusion tenace qui embellit le passé et noircit le présent.

Reste, sous les formes changeantes, le principe : ce mouvement par lequel je reconnais l'autre, je tiens compte de son existence, je lui témoigne qu'il compte. Ce principe, lui, ne date d'aucune époque et n'appartient à aucune. Il est le ciment discret de toute vie commune.

Nos petits-enfants, un jour, jugeront nos manières dépassées et pleureront la politesse de « leur temps » — c'est-à-dire le nôtre. Ils auront tort, comme nous. Et la politesse, elle, continuera son chemin.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-019",
    title: "Peut-on faire confiance à sa mémoire ?",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Nous croyons que notre mémoire fonctionne comme une caméra.",
    blurbEn:
      "We treat memory as a faithful recording of the past. In reality it rebuilds, invents and quietly rewrites — a discovery with unsettling consequences, from courtrooms to family arguments.",
    body: `Fermez les yeux et rappelez-vous un moment marquant de votre enfance. L'image vous revient, précise, colorée, avec ses sons et ses émotions. Vous avez le sentiment de rejouer une scène enregistrée, fidèle à la réalité. Ce sentiment est l'une des grandes illusions de l'esprit humain. Car la mémoire ne fonctionne pas du tout comme une caméra qui archiverait le passé pour le restituer intact. Elle fonctionne comme un conteur : à chaque évocation, elle reconstruit l'histoire — et, ce faisant, la modifie.

Les travaux des psychologues, depuis plusieurs décennies, ne laissent guère de doute. Le souvenir n'est pas un objet rangé dans un tiroir, qu'on ressortirait tel quel. C'est une reconstruction, opérée sur le moment, à partir de fragments. Le cerveau garde quelques éléments centraux et comble les vides — avec de la logique, des attentes, des informations acquises depuis. Le plus troublant, c'est que ce travail de reconstruction est invisible pour nous : nous ne sentons pas la couture entre le vécu et l'inventé. Le souvenir reconstruit se présente avec la même évidence, la même certitude, que le souvenir exact.

Une chercheuse a démontré cette fragilité par des expériences devenues célèbres. En suggérant habilement à des adultes des détails faux, elle est parvenue à leur faire « se souvenir » d'événements qui n'avaient jamais eu lieu : s'être perdu enfant dans un centre commercial, avoir renversé un bol lors d'un mariage. Non seulement les sujets adoptaient ces faux souvenirs, mais ils les enrichissaient de détails spontanés, les défendaient avec émotion, et refusaient souvent de croire, à la révélation, qu'on les avait trompés. Nous ne sommes pas les gardiens fiables de notre propre histoire.

Les conséquences dépassent de loin la curiosité de laboratoire. La justice, longtemps, a fait du témoignage oculaire une preuve reine : « je l'ai vu de mes yeux ». On sait aujourd'hui qu'un témoin sincère, absolument certain, peut se tromper lourdement — et des innocents ont été condamnés sur de tels souvenirs, avant d'être disculpés bien plus tard. Dans un registre plus quotidien, ces mécanismes expliquent ces disputes familiales insolubles où chacun jure de sa version : deux personnes se rappellent la même scène de façon incompatible, et toutes deux sont de bonne foi. Aucune ne ment. Leurs mémoires ont simplement bâti deux récits différents.

Faut-il alors désespérer de notre mémoire, la tenir pour un tissu d'inventions ? Ce serait exagérer dans l'autre sens. Pour l'essentiel, elle nous sert fidèlement : elle retient le sens, les grandes lignes, ce qui compte pour agir. Elle sacrifie l'exactitude des détails, mais cette « infidélité » a peut-être un rôle utile — une mémoire souple, qui réorganise sans cesse, s'adapte mieux qu'un enregistrement figé.

La leçon n'est donc pas la méfiance, mais la modestie. La prochaine fois que vous serez absolument certain d'un souvenir, rappelez-vous que cette certitude même ne prouve rien. Votre mémoire est une conteuse de talent. Elle ne cherche pas à vous tromper ; elle fait seulement son métier, qui n'a jamais été de dire toute la vérité.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-020",
    title: "L'art de la lenteur",
    category: "everyday life",
    difficulty: "B2",
    minutes: 4,
    preview: "Face au culte de la vitesse, un mouvement défend la lenteur.",
    blurbEn:
      "We've made speed a virtue and slowness a fault — but haste devours the very experiences it promises to deliver. Not laziness, but the deliberate art of choosing what deserves our time.",
    body: `Notre époque a fait de la vitesse une vertu cardinale. Tout doit aller plus vite : les repas, les transports, les échanges, les carrières. Un message appelle une réponse immédiate ; une file d'attente devient une petite souffrance ; une page qui met deux secondes à s'afficher nous exaspère. Nous mesurons la valeur des choses à leur rapidité, et la lenteur est devenue, au mieux, une faiblesse, au pire, une faute. C'est contre cette évidence rarement questionnée qu'un mouvement discret s'est levé, né en Italie à la fin des années quatre-vingt, autour d'une idée simple : et si nous allions trop vite ?

On aurait tort d'y voir un simple caprice de privilégiés nostalgiques. Certes, ralentir suppose souvent un certain confort, et il serait indécent de prêcher la lenteur à qui cumule les emplois pour survivre. Mais l'idée centrale du mouvement touche quelque chose d'universel, qui dépasse la question des moyens. Cette idée, la voici : la vitesse détruit ce qu'elle prétend nous faire gagner.

Prenons un repas. Avalé debout en cinq minutes, il remplit l'estomac mais ne nourrit rien d'autre ; on ne se souvient ni de son goût ni de ce moment. Pris lentement, partagé, savouré, le même repas devient une expérience, un plaisir, parfois un souvenir durable. La vitesse a bien économisé du temps — mais elle a supprimé l'essentiel, qui était précisément dans le temps passé. Ce qui vaut pour le repas vaut pour presque tout : une conversation expédiée, un paysage traversé sans le voir, un livre parcouru en diagonale. En allant plus vite, nous faisons plus de choses, et nous en vivons moins.

Il y a là un paradoxe que la lenteur éclaire. Nous courons pour gagner du temps, mais ce temps gagné, nous le remplissons aussitôt d'autres courses. La vitesse n'est jamais rassasiée ; plus on va vite, plus il faudrait aller vite encore. On économise dix minutes pour les engloutir dans dix nouvelles tâches, et la sensation de manquer de temps, loin de diminuer, s'aggrave. Celui qui a toujours couru n'arrive jamais.

Se tromperait-il pourtant, celui qui conclurait qu'il faut tout faire lentement ? Assurément. Vivre au ralenti serait aussi absurde que vivre à toute allure, et souvent impossible dans le monde tel qu'il est. La lenteur bien comprise n'est pas une règle uniforme, c'est un art du discernement. Il s'agit non de ralentir tout, mais de choisir : identifier les moments qui méritent qu'on leur donne du temps — un repas en famille, une promenade, une conversation importante — et les protéger de la précipitation ambiante. Pour le reste, la vitesse garde ses droits ; personne ne réclame de rêvasser en payant ses factures.

Au fond, la vraie richesse n'est peut-être pas de faire beaucoup, mais de vivre pleinement le peu qui compte. Ralentir, ce n'est pas perdre son temps.

C'est refuser de laisser sa vie filer sans l'avoir habitée.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-021",
    title: "Le tourisme de masse",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "Certaines villes croulent sous le nombre de visiteurs.",
    blurbEn:
      "The dream of seeing the world, multiplied by millions, is crushing the very places we love. Venice as a symbol, the paradox of the traveller, and what it might mean to visit well.",
    body: `Il y a une ironie cruelle au cœur du tourisme moderne. Ce qui pousse des millions de personnes à voyager — le désir de découvrir des lieux uniques, préservés, chargés de beauté et d'histoire — est précisément ce qui, à force de se multiplier, détruit ces lieux. Nous aimons Venise, alors nous y allons ; et parce que nous sommes vingt millions à l'aimer chaque année, nous étouffons peu à peu la ville que nous étions venus admirer. Le tourisme de masse est cette contradiction devenue paysage.

Que le voyage soit une belle chose, personne de sensé ne le contestera. Se déplacer, rencontrer d'autres manières de vivre, sortir de l'étroitesse de son propre monde : rien n'a plus fait pour l'ouverture des esprits. Le problème n'est donc pas de voyager. Il tient à un phénomène purement quantitatif, dont les effets changent de nature à grande échelle. Un visiteur enrichit un lieu ; un million de visiteurs, concentrés sur les mêmes ruelles aux mêmes saisons, l'écrasent. Ce n'est pas une question de morale individuelle — chacun de ces voyageurs est parfaitement légitime — mais d'accumulation.

Les conséquences, dans les villes les plus touchées, sont désormais visibles de tous. Les habitants sont chassés par la hausse des loyers, à mesure que les logements se transforment en locations de courte durée. Les commerces du quotidien — le boulanger, le cordonnier, l'épicier — cèdent la place à des boutiques de souvenirs identiques d'une ville à l'autre. La cité vidée de ses habitants devient un décor, une carte postale géante que l'on traverse sans plus jamais y vivre. Le lieu survit ; son âme s'en va.

Face à cela, des réponses s'esquissent, encore hésitantes. Certaines villes limitent le nombre de visiteurs, instaurent des réservations, taxent les entrées ou interdisent les plus grands navires. Ces mesures, souvent critiquées, ont au moins le mérite de reconnaître le problème et de refuser la fatalité. Elles se heurtent toutefois à une difficulté redoutable : le tourisme fait vivre des régions entières, et l'on ne peut fermer les vannes sans priver de revenus ceux-là mêmes qu'on prétend protéger. L'équilibre est étroit.

Mais l'action des villes ne dispense pas d'une réflexion plus personnelle. Chacun de nous, en tant que voyageur, dispose d'une marge. Faut-il vraiment se rendre au même endroit que tout le monde, au même moment ? Faut-il réduire une région à ses trois sites les plus photographiés, qu'on « fait » en une journée avant de repartir ? Voyager hors saison, s'écarter des foules, rester plus longtemps au même endroit, s'intéresser aux lieux moins célèbres qui n'attendent que d'être aimés : autant de façons de continuer à découvrir le monde sans participer à sa dégradation.

Le tourisme de masse nous place devant une question inconfortable mais salutaire. Aimer un lieu, est-ce s'y précipiter avec la foule ? Ou est-ce, parfois, savoir le visiter autrement — voire renoncer, pour qu'il demeure ce que nous étions venus chercher ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-022",
    title: "Le silence, un luxe moderne",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Dans une grande ville, il n'y a presque jamais de silence.",
    blurbEn:
      "Constant noise has become the invisible pollution of modern life, quietly harming health and thought. Why silence has turned into a luxury — and why it's more than the mere absence of sound.",
    body: `Tendez l'oreille, là, maintenant. Même dans ce que vous croyez être le calme, un fond sonore vous entoure : le ronronnement d'un appareil, la rumeur lointaine de la circulation, un moteur, une voix. Dans une grande ville, le silence complet n'existe pour ainsi dire jamais. Nous baignons dans le bruit du matin au soir, et souvent la nuit, à tel point que nous ne l'entendons plus. Cette surdité au bruit est peut-être le problème : à force de nous y habituer, nous avons cessé de mesurer ce qu'il nous coûte.

Or ce coût est réel, et documenté. Le bruit n'est pas qu'une gêne passagère ; c'est une atteinte à la santé, que les autorités sanitaires classent aujourd'hui parmi les pollutions majeures des villes. L'exposition prolongée au bruit élève la tension artérielle, perturbe le sommeil même quand on croit s'y être fait, et maintient le corps dans un état de tension permanente. Le mécanisme est ancien : notre organisme, hérité de temps où un bruit soudain signalait un danger, réagit au son par une alerte discrète mais constante. Nous ne sursautons plus consciemment, mais notre corps, lui, reste sur le qui-vive. Le bruit fatigue à notre insu.

L'effet sur l'esprit est tout aussi profond. La concentration exige de filtrer, en permanence, une masse de sons parasites, et ce filtrage épuise. Des études montrent que la lecture, la mémorisation, le raisonnement se dégradent dans un environnement bruyant — c'est particulièrement net chez les enfants scolarisés près d'axes passants. Penser demande une certaine paix ; le bruit grignote nos ressources mentales avant même que nous commencions.

Voilà pourquoi le silence, jadis banal, est devenu un luxe — au sens presque économique du terme. Il faut désormais payer, ou s'éloigner, pour l'obtenir : chambres d'hôtel « au calme » vendues plus cher, retraites dans des lieux reculés, casques antibruit onéreux. Le silence a rejoint l'air pur et la nuit noire dans la catégorie des biens autrefois gratuits et désormais rares. Cette raréfaction en dit long sur ce que notre développement a, sans le vouloir, détruit.

Mais il faut se garder d'un malentendu. Le silence dont il est ici question n'est pas l'absence totale de son, qui serait sinistre. Une forêt « silencieuse » bruisse de mille sons — le vent, un oiseau, l'eau. Ces sons-là ne fatiguent pas ; ils apaisent. Ce qui nous épuise, c'est le bruit humain, mécanique, incessant et sans signification. Et le vrai silence recherché n'est pas seulement acoustique : c'est un espace intérieur, une pause dans le flot des sollicitations, où l'esprit peut enfin se reposer et se retrouver.

Nous ne renoncerons pas aux villes, ni au commerce joyeux des voix, des rires et de la musique, qui font aussi le prix de la vie. Mais reconnaître la valeur du silence, lui ménager une place — quelques minutes, un lieu, un moment —, ce n'est pas fuir le monde.

C'est simplement cesser de laisser le bruit décider à notre place de l'état de notre corps et de notre esprit.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-023",
    title: "Pourquoi rit-on ?",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "Tous les peuples rient. Pourtant, c'est un comportement étrange.",
    blurbEn:
      "Laughter is universal, involuntary and mostly social — a strange sound the body makes on its own. Far from being mainly about jokes, it may be one of our oldest ways of saying: we're together.",
    body: `Il y a, dans le rire, quelque chose qui devrait nous étonner davantage. Voilà un comportement que partagent tous les peuples de la Terre, sans exception, quelles que soient la langue et la culture. Un comportement présent chez le nourrisson bien avant la parole, et dont on trouve des formes chez nos cousins les grands singes. Un comportement, surtout, que nous ne décidons pas : on ne rit pas sur commande, et l'on peine à s'empêcher de rire quand le fou rire nous saisit. Le rire jaillit de nous, presque malgré nous. Qu'est-ce donc que cette chose si humaine et si peu maîtrisée ?

La première surprise, quand on l'étudie, c'est que le rire a fort peu à voir avec l'humour. On l'imagine déclenché par les blagues ; l'observation dit tout autre chose. En écoutant des conversations ordinaires, les chercheurs ont constaté que la grande majorité des rires ne suivent aucune plaisanterie. Ils ponctuent des phrases banales, accompagnent des retrouvailles, soulignent un accord, comblent un silence. On rit bien davantage de « te voilà enfin ! » que du meilleur mot d'esprit. Le rire n'est pas d'abord une réaction au comique ; c'est un signal social.

C'est là sa clé la plus profonde : le rire est fait pour les autres. Une donnée le prouve mieux que tout : nous rions bien plus en compagnie que seuls. Devant le même film, seul, on sourit ; entouré d'amis, on éclate. Le rire est jusqu'à trente fois plus fréquent en groupe. Il n'est pas un jugement porté sur une situation drôle, mais un lien tissé entre des personnes. Rire ensemble, c'est se dire, sans un mot : nous partageons le même regard, nous sommes du même côté, tu es des nôtres. Bien avant le langage, nos ancêtres disposaient sans doute déjà de ce moyen de sceller l'appartenance au groupe.

Cette fonction sociale explique aussi les rires plus troubles, que la vision idéalisée oublie volontiers. On rit pour inclure, mais aussi, parfois, pour exclure : le rire de moquerie désigne celui qui est hors du cercle. On rit de gêne, de nervosité, dans des moments qui n'ont rien de gai. Le rire n'est pas toujours innocent ; c'est un outil relationnel puissant, capable du meilleur comme du plus cruel.

Sur le corps, ses effets sont réels, quoique parfois exagérés par la mode du « rire qui guérit ». Rire détend les muscles, libère la tension, procure un bien-être passager. Y voir un remède miracle serait naïf ; le tenir pour négligeable serait sot. Disons qu'il fait du bien, sans prétendre qu'il soigne.

Beaucoup de questions demeurent ouvertes, et le rire garde une part de mystère que la science n'a pas dissipée. Mais peut-être n'est-il pas nécessaire de tout expliquer. Savoir que ce son étrange qui nous échappe est, au fond, l'un de nos plus vieux moyens de dire « nous sommes ensemble » suffit à le regarder autrement.

La prochaine fois que vous rirez avec quelqu'un, songez-y un instant : vous ne réagissez pas seulement à quelque chose de drôle. Vous accomplissez, sans le savoir, un geste de lien vieux comme l'humanité.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-024",
    title: "Le travail a-t-il pris trop de place dans nos vies ?",
    category: "everyday life",
    difficulty: "B2",
    minutes: 4,
    preview: "« Que faites-vous dans la vie ? » On répond par son métier.",
    blurbEn:
      "We answer 'what do you do?' with a job title, as if work were the whole self. A reflection on how labour came to define our identity — and what it costs to let it.",
    body: `Observez la scène, si banale qu'elle passe inaperçue : deux inconnus se rencontrent, et après le prénom vient presque toujours la même question — « et qu'est-ce que vous faites dans la vie ? ». Nous répondons par notre métier, comme s'il allait de soi que l'emploi résume l'être. « Je suis médecin », « je suis professeur », « je suis au chômage » : la formule est révélatrice. On ne dit pas « je travaille comme », on dit « je suis ». Le métier n'est pas présenté comme une activité, mais comme une identité. Cette habitude de langage en dit long sur la place que le travail a conquise dans nos existences.

Que cette place soit grande n'a rien d'absurde en soi. Le travail occupe la plus grande part de nos journées d'adulte ; il structure le temps, procure des revenus, met en relation. Un travail qui a du sens, où l'on se sent utile et compétent, est l'une des sources les plus solides de satisfaction. Nul ne rêve sérieusement d'une vie d'oisiveté totale : l'ennui prolongé est un supplice, et beaucoup de retraités le découvrent avec surprise. Vouloir bannir le travail de nos vies serait aussi vain que naïf.

Le problème n'est donc pas le travail lui-même, mais son emprise devenue démesurée sur l'idée que nous nous faisons de nous-mêmes. Réduire une personne à son emploi, c'est amputer tout le reste. Nous sommes aussi des parents, des amis, des voisins, des amateurs de musique ou de montagne, des curieux, des citoyens, des rêveurs. Rien de tout cela n'apparaît dans un intitulé de poste. Un être humain déborde infiniment sa fonction, et l'oublier appauvrit d'abord celui qui l'oublie sur lui-même.

Cette confusion a un coût, que révèlent cruellement certains moments de bascule. Que ressent celui qui perd son emploi, si son emploi était son identité ? Il ne perd pas seulement un revenu, mais le sol sous ses pieds, le sentiment même d'exister. Et que découvrent tant de gens à l'heure de la retraite, après une vie entièrement donnée au travail ? Qu'ils ont négligé les amitiés, les passions, la vie familiale — tout ce qui devait « attendre », et qui n'attendait pas. Ils se retrouvent riches de temps et pauvres de tout le reste. Le culte du travail présente parfois sa facture très tard, et elle est lourde.

Il ne s'agit pas de prêcher le désengagement ni de mépriser l'ambition, qui a sa noblesse. Il s'agit de ne pas confondre une partie avec le tout. Le travail est une part de la vie ; il ne devrait pas en dévorer les autres, ni s'arroger le monopole du sens et de la dignité.

Peut-être faudrait-il, pour commencer, changer nos questions. Demander à un inconnu, non plus « que faites-vous ? », mais « qu'est-ce qui vous passionne ? », « comment allez-vous ? ». On découvrirait des personnes, là où l'on ne recueillait que des fonctions.

Et l'on se rappellerait, au passage, que nous ne sommes pas ce que nous faisons pour gagner notre vie. Nous sommes ce que nous faisons de notre vie.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-025",
    title: "Les promesses de la voiture électrique",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "La voiture électrique est-elle la solution miracle ?",
    blurbEn:
      "Sold as the clean saviour of the planet, the electric car is neither miracle nor fraud, but a real yet partial progress. Untangling the batteries, the electricity and the deeper question it dodges.",
    body: `Peu de sujets suscitent des débats aussi tranchés que la voiture électrique. Pour les uns, elle est le sauveur de la planète, la fin de la pollution, l'avenir enfin propre. Pour les autres, elle est une vaste illusion, un mensonge écologique déguisé en progrès. Comme souvent lorsque les positions se durcissent, la vérité se tient dans un entre-deux moins confortable mais plus juste : la voiture électrique est un progrès réel, mais partiel — ni miracle, ni imposture.

Commençons par ses avantages, qui sont incontestables. Une voiture électrique n'émet aucun gaz d'échappement là où elle roule. Dans les villes, où la pollution de l'air provoque des maladies respiratoires et des décès prématurés, ce point n'a rien d'anecdotique : remplacer les moteurs à essence par des moteurs électriques améliorerait sensiblement la santé de millions de citadins. Elle est de surcroît silencieuse, ce qui allège une autre pollution urbaine trop négligée, le bruit. Sur ces deux plans, le gain est net et immédiat.

Mais le tableau se nuance dès qu'on élargit le regard au-delà du pot d'échappement. Une voiture n'est pas seulement ce qu'elle rejette en roulant ; c'est aussi ce qu'il a fallu pour la fabriquer. Or la production d'une voiture électrique, et singulièrement de sa batterie, est très gourmande en énergie et en métaux rares, dont l'extraction pose de sérieux problèmes environnementaux et humains. À sa sortie d'usine, une voiture électrique a déjà, sur son « compteur carbone », une dette plus lourde qu'une thermique. Elle ne commence à être gagnante qu'après des dizaines de milliers de kilomètres, une fois cette dette remboursée par l'absence d'émissions à l'usage.

Second bémol, décisif : une voiture électrique ne vaut que par l'électricité qui l'alimente. Rechargée grâce à une énergie propre, elle tient sa promesse. Rechargée grâce à des centrales à charbon, elle ne fait guère que déplacer la pollution, de la rue vers la cheminée. Son bilan dépend donc entièrement de la façon dont chaque pays produit son électricité — d'où des verdicts très différents d'une région du monde à l'autre.

La voiture électrique est ainsi un progrès conditionnel : elle sera réellement bénéfique si l'électricité se décarbone et si les batteries deviennent moins coûteuses à produire et plus faciles à recycler. Ces conditions sont en partie en train d'être réunies, ce qui invite à un optimisme mesuré plutôt qu'à l'enthousiasme béat ou au rejet définitif.

Reste une question plus dérangeante, que l'engouement pour la voiture électrique permet commodément d'éviter. Et si le vrai problème n'était pas le type de moteur, mais le nombre de voitures ? Remplacer une à une des centaines de millions de voitures thermiques par des électriques, c'est perpétuer un modèle fondé sur l'automobile individuelle, avec ses embouteillages, son espace confisqué, ses ressources englouties. Développer les transports en commun, le vélo, les villes où l'on peut vivre sans voiture : voilà des réponses souvent plus efficaces, mais moins séduisantes, car elles ne se vendent pas en concession.

La voiture électrique mérite donc sa place — à condition de ne pas la prendre pour ce qu'elle n'est pas : la fin du problème. Elle en est, au mieux, une partie de la solution.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-026",
    title: "La nostalgie, un piège ou un plaisir ?",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "« C'était mieux avant. » Faut-il le croire ?",
    blurbEn:
      "Memory quietly polishes the past until it outshines the present. A look at why 'it was better before' is almost always an illusion — and how nostalgia can be a comfort or a trap.",
    body: `« C'était mieux avant. » La formule est si répandue qu'elle en paraît évidente. Avant, les gens étaient plus polis, la nourriture avait plus de goût, les étés étaient plus beaux, la vie plus simple. Chacun de nous, à un moment, l'a pensé ou dit. Ce sentiment, la nostalgie, est universel et souvent doux. Il mérite pourtant qu'on l'examine, car il repose en grande partie sur une illusion — une illusion produite par le fonctionnement même de notre mémoire.

Notre mémoire, en effet, n'est pas un historien impartial : c'est un peintre qui embellit. Elle retient de préférence les moments heureux et laisse s'effacer les difficultés, les ennuis, les petites misères du quotidien d'autrefois. Quand nous évoquons notre enfance, nous convoquons les étés au soleil, les rires, les vacances — non les heures d'ennui, les disputes, les angoisses oubliées. Le passé nous apparaît meilleur non parce qu'il l'était, mais parce que nous n'en gardons que le meilleur. Le « bon vieux temps » est une œuvre d'art, composée par l'oubli.

À cette illusion s'ajoute un biais de comparaison. Nous confrontons un passé nettoyé de ses désagréments à un présent que nous vivons, lui, dans toute son épaisseur — avec ses soucis concrets, ses irritations immédiates, son incertitude. La partie n'est pas égale. Le présent a toujours le désavantage d'être réel, tandis que le passé a le charme de ce qui est achevé et rangé. Nul étonnement, dès lors, qu'il l'emporte.

Faut-il pour autant condamner la nostalgie comme une simple erreur ? Ce serait aller trop loin. Les psychologues qui l'étudient lui reconnaissent des vertus. Se souvenir avec tendresse des êtres aimés, des lieux de son enfance, des musiques d'une époque, réchauffe le cœur et donne le sentiment d'une continuité de soi à travers le temps. La nostalgie relie : elle nous rattache à ceux qui ne sont plus, à ce que nous avons été. Bien vécue, elle est une forme de gratitude envers sa propre histoire.

Le piège n'est donc pas de ressentir de la nostalgie, mais de s'y laisser enfermer. Car il existe une nostalgie stérile, voire dangereuse. À l'échelle d'une vie, elle conduit à vivre tourné vers l'arrière, à trouver toujours le présent médiocre et l'avenir menaçant, à passer à côté de ce que l'instant offre de bon. À l'échelle d'une société, l'illusion d'un âge d'or perdu nourrit les discours qui promettent de « revenir » à un passé idéalisé qui n'a jamais existé. La nostalgie collective, quand elle devient politique, se paie parfois très cher.

La sagesse consiste, ici comme souvent, dans la mesure et le discernement. Savourer les souvenirs heureux sans oublier qu'ils sont embellis. Puiser dans le passé de la douceur et de la force, non un jugement contre le présent. Se souvenir que nos propres « bons vieux temps » furent, sur le moment, un présent inquiet et imparfait — exactement comme aujourd'hui.

Et se rappeler enfin ceci : dans quelques années, ce présent que nous jugeons si terne deviendra peut-être, à son tour, le « bon vieux temps » que nous regretterons. Autant, tant qu'il est là, essayer de l'habiter.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-027",
    title: "Faut-il se méfier des écrans pour les enfants ?",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Peu de sujets inquiètent autant les parents que les écrans.",
    blurbEn:
      "Between panic and indifference, parents struggle to know how much screen time is too much. What research supports, what it doesn't, and why 'how much' matters less than 'what' and 'with whom'.",
    body: `Peu de questions provoquent chez les parents autant d'inquiétude et de culpabilité que celle des écrans. Faut-il les interdire ? Les rationner ? À partir de quel âge, et combien de temps ? Entre les articles alarmistes qui décrivent une génération en péril et ceux qui haussent les épaules en rappelant que « chaque génération diabolise sa nouveauté », les parents peinent à s'y retrouver. Essayons d'y voir clair, en séparant ce que la recherche établit de ce qu'elle ne dit pas.

Sur un point, les données sont solides : chez les très jeunes enfants, avant deux ou trois ans, l'excès d'écrans est nuisible. À cet âge, le cerveau se construit par l'interaction avec le monde réel et avec les personnes : manipuler des objets, entendre parler, échanger des regards et des sourires. Un temps passé devant un écran est un temps soustrait à ces expériences irremplaçables, et plusieurs études associent une forte exposition précoce à des retards de langage et de concentration. Pour les tout-petits, la prudence des recommandations — le moins possible — repose sur des bases sérieuses.

Mais dès qu'on quitte la petite enfance, la question se brouille, et c'est ici que le débat public se trompe souvent. Car « les écrans » n'existent pas : il n'y a que des usages, radicalement différents. Mettre dans le même sac un enfant qui regarde passivement des vidéos sans fin, un autre qui appelle ses grands-parents, un troisième qui apprend à coder ou dessine sur une tablette, un quatrième qui joue en ligne avec ses amis, n'a aucun sens. Le compteur du « temps d'écran », si commode, est une mesure grossière qui additionne des choses incomparables. La vraie question n'est pas seulement combien de temps, mais quoi, à quel âge, et avec qui.

Ce dernier point — avec qui — est décisif et trop peu souligné. Un même programme regardé seul, en silence, ou regardé avec un adulte qui commente, explique, prolonge par une conversation, n'a pas du tout le même effet. Dans le second cas, l'écran devient un support d'échange plutôt qu'un substitut de relation. Ce n'est pas l'objet qui compte le plus, c'est ce qui se passe autour de lui.

Il faut aussi replacer l'écran dans l'ensemble d'une vie d'enfant. Le problème n'est pas tant ce que l'écran apporte que ce qu'il remplace, quand il prend trop de place : le sommeil raccourci, le jeu libre, l'ennui fertile, l'activité physique, les amitiés en chair et en os. Un enfant qui lit, court, joue, dort bien et voit ses amis peut regarder un écran sans dommage ; le danger surgit quand l'écran chasse tout le reste.

Enfin, l'exemple pèse plus que les règles. Difficile de convaincre un adolescent de lever les yeux de son téléphone quand ses parents ont le nez sur le leur à table. Les enfants imitent ce que nous faisons, non ce que nous disons.

La réponse raisonnable n'est donc ni la panique ni l'indifférence, mais l'attention. Non pas « combien d'heures ? » comme seule boussole, mais « quel contenu, à quel âge, en remplacement de quoi, et sous quel regard ? ». C'est plus exigeant qu'une règle simple. C'est aussi beaucoup plus juste.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-028",
    title: "L'argent fait-il le bonheur ?",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "« L'argent ne fait pas le bonheur. » Qu'en est-il vraiment ?",
    blurbEn:
      "The oldest proverb about money is half right. Research shows wealth buys real happiness — until it doesn't, and for reasons that reveal something surprising about human desire.",
    body: `« L'argent ne fait pas le bonheur », affirme la sagesse populaire — avant d'ajouter, avec un sourire, « mais il y contribue ». Ce proverbe assorti de sa réserve résume assez bien notre rapport ambigu à l'argent : nous le déclarons secondaire tout en organisant nos vies autour de lui. Alors, qu'en est-il réellement ? La question a quitté le terrain des moralistes pour celui des chercheurs, qui l'étudient depuis des décennies. Leurs réponses, nuancées, sont plus intéressantes que le proverbe.

Le premier constat est sans appel : le manque d'argent, lui, fait le malheur. La pauvreté n'a rien de romantique. Elle apporte un stress constant, ferme des portes, prive de soins, de sécurité, de choix. Aux niveaux de revenus les plus bas, chaque amélioration matérielle se traduit par un gain de bien-être considérable. Sortir de la précarité, pouvoir payer ses factures sans angoisse, offrir l'essentiel à ses enfants : là, l'argent achète très concrètement du bonheur, ou du moins l'absence d'un malheur pesant. Prétendre le contraire est un luxe de gens qui n'ont jamais manqué.

Le deuxième constat, en revanche, est plus surprenant. Une fois les besoins essentiels couverts et un confort raisonnable atteint, la courbe s'aplatit. Gagner toujours plus continue d'apporter quelque chose, mais de moins en moins. Passer d'un revenu modeste à un revenu confortable change la vie ; passer d'un revenu confortable à un revenu très élevé la change étonnamment peu. Les personnes très riches ne sont, en moyenne, guère plus heureuses que les personnes simplement à l'aise. L'argent obéit à une loi de rendement décroissant : les premiers euros valent de l'or, les derniers, presque rien.

Pourquoi cet essoufflement ? Deux mécanismes bien humains l'expliquent. Le premier est l'accoutumance : nous nous habituons avec une rapidité déconcertante à ce que nous possédons. La voiture rêvée, la belle maison, l'objet longtemps convoité procurent une joie vive — qui s'émousse en quelques mois, jusqu'à devenir le décor normal, à peine remarqué, de notre vie. Le second est la comparaison : notre satisfaction dépend moins de ce que nous avons que de ce que nous avons par rapport aux autres. Or il se trouve toujours quelqu'un de plus riche, si bien que la course n'a pas de ligne d'arrivée. On rattrape son voisin pour découvrir un nouveau voisin devant.

Que reste-t-il, alors, une fois l'aisance atteinte ? Les recherches convergent vers des réponses étrangement anciennes : la qualité des relations humaines, la santé, le sentiment d'être utile, le temps dont on dispose pour ce qu'on aime. Fait révélateur, l'argent lui-même rend plus heureux quand on l'emploie à ces fins-là — acheter du temps plutôt que des objets, offrir plutôt que thésauriser, vivre des expériences plutôt qu'accumuler des choses. Ce n'est pas la somme qui compte, mais l'usage.

La formule populaire méritait donc mieux qu'un oui ou un non. L'argent ne fait pas le bonheur, mais son absence fait le malheur ; il est un formidable moyen, et un piètre but. Le confondre avec la fin plutôt qu'avec l'outil, c'est courir toute sa vie après un horizon qui recule à mesure qu'on avance. Le bonheur, décidément, campe ailleurs — non pas plus loin sur la même route, mais sur un tout autre chemin.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-029",
    title: "La biodiversité près de chez nous",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "La vie sauvage existe aussi tout près de nous.",
    blurbEn:
      "We imagine nature as a distant rainforest, ignoring the teeming life in our own gardens and streets. Why local biodiversity is collapsing quietly — and why saving it starts at the doorstep.",
    body: `Quand on prononce le mot « nature », l'imagination s'envole aussitôt très loin : forêts tropicales, savanes africaines, grands fauves, oiseaux aux couleurs improbables. Cette nature-là, spectaculaire et lointaine, mobilise notre attention et nos inquiétudes. Ce faisant, nous oublions une autre nature, infiniment plus proche et tout aussi menacée : celle qui grouille dans nos jardins, nos parcs, nos rues, au ras de nos pieds. La biodiversité n'est pas seulement un enjeu des tropiques ; elle se joue aussi devant notre porte, et là, nous avons prise.

Car un simple jardin, un talus, un vieux mur abritent un monde d'une richesse insoupçonnée. Des dizaines d'espèces d'insectes, des oiseaux, des hérissons, des chauves-souris, des grenouilles, sans compter les innombrables plantes et les micro-organismes du sol : c'est tout un tissu vivant, dont chaque fil dépend des autres. Les abeilles et les papillons pollinisent les fleurs, dont dépendent nos fruits ; les oiseaux et les chauves-souris régulent les insectes ; les vers et les champignons fabriquent la terre elle-même. Cette biodiversité ordinaire, invisible à force d'être familière, rend des services dont nous ne mesurons l'importance que lorsqu'ils viennent à manquer.

Or ils commencent à manquer. Le déclin est spectaculaire, y compris — et c'est le plus alarmant — dans nos régions tempérées et jusque dans les villes. Les études sur les insectes donnent le vertige : dans certaines zones d'Europe, leur masse a chuté de plus de trois quarts en quelques décennies. Beaucoup se souviennent des pare-brise couverts de moustiques après un trajet d'été ; les jeunes générations ne connaissent plus ce phénomène, non par chance, mais parce que les insectes ont disparu. Les causes se cumulent : produits chimiques, disparition des haies et des prairies, artificialisation des sols, éclairage nocturne qui désoriente et épuise les espèces de la nuit.

Ce constat pourrait accabler. Il a pourtant une contrepartie encourageante, propre à cette biodiversité de proximité : chacun peut y agir, concrètement, à son échelle. Contrairement à la forêt amazonienne, sur laquelle un particulier ne peut presque rien, le jardin, le balcon, la cour offrent un terrain d'action immédiat. Laisser un coin d'herbe pousser librement plutôt que le tondre à ras. Renoncer aux pesticides. Planter des espèces locales et des fleurs mellifères. Installer un point d'eau, un tas de bois, un abri. Éteindre les lumières inutiles la nuit. Ces gestes minuscules, multipliés par des millions de jardins, dessinent un réseau de refuges qui peut faire une différence réelle.

Il serait naïf de croire que ces initiatives individuelles suffiront seules, sans politiques ambitieuses ni changements agricoles profonds ; il serait tout aussi faux de les juger dérisoires. Elles ont une double vertu : un effet concret sur le vivant local, et un effet sur nous-mêmes. Car en accueillant la vie sauvage chez soi, on réapprend à la regarder, à s'y attacher, à s'en sentir responsable. On cesse de considérer la nature comme un décor lointain à préserver « là-bas » pour la retrouver comme une présence quotidienne, à nos côtés.

Protéger la biodiversité n'est donc pas seulement l'affaire de grands espaces protégés et de sommets internationaux. C'est aussi, et peut-être d'abord, une affaire de tous les jours, qui commence dans un carré de pelouse laissé en paix.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-030",
    title: "Bien vieillir, un art à apprendre",
    category: "everyday life",
    difficulty: "B2",
    minutes: 4,
    preview: "Bien vieillir est possible, et cela s'apprend peut-être.",
    blurbEn:
      "In a culture obsessed with youth, ageing feels like pure loss. Yet studies of the happiest older people reveal that growing old well is less about the body than about ties, curiosity and meaning.",
    body: `Nous vivons dans une civilisation qui adore la jeunesse et redoute la vieillesse. La publicité vend le rajeunissement comme un idéal, les rides s'effacent sur les images, et l'on parle des « seniors » avec un mélange de respect gêné et de pitié discrète. Dans ce contexte, vieillir apparaît comme une pure perte : perte de forces, de beauté, d'utilité, d'avenir. Pourtant, cette vision, si répandue qu'elle semble aller de soi, est largement fausse — ou du moins incomplète. Car si le vieillissement du corps est inévitable, la manière de vieillir, elle, ne l'est pas. Bien vieillir est possible, et cela ressemble moins à une chance qu'à un art, qui s'apprend et se cultive tout au long de la vie.

Commençons par ce qui est vrai dans la crainte. Oui, le corps change et décline ; c'est un fait qu'aucune poudre miracle n'abolira. Mais ce déclin peut être considérablement ralenti, et surtout, il ne détermine pas à lui seul le bien-être. On peut prendre soin de son corps vieillissant — bouger régulièrement, bien manger, entretenir sa force et son équilibre —, et ces efforts repoussent l'échéance de la dépendance bien plus efficacement qu'on ne le croit. La vieillesse en bonne santé n'est pas qu'une question de chance génétique ; elle se prépare, dès la maturité, par des habitudes.

Mais le plus frappant, dans les recherches sur le vieillissement, est ailleurs. Quand on étudie les personnes âgées les plus épanouies, on découvre que ce ne sont pas nécessairement les plus vigoureuses ni les mieux portantes. Le corps n'est pas le facteur décisif du bonheur au grand âge. Ce qui distingue ceux qui vieillissent heureux, ce sont des éléments d'un autre ordre : la richesse de leurs liens sociaux, le maintien d'une curiosité et de projets, le sentiment d'être encore utile, la capacité à trouver du sens à cette étape de la vie plutôt qu'à la subir comme une longue attente.

À l'inverse, le grand ennemi de la vieillesse porte un nom, et ce n'est pas la maladie : c'est la solitude. L'isolement social nuit à la santé autant que bien des affections physiques ; il accélère le déclin, physique et mental. Les sociétés et les familles qui maintiennent leurs aînés dans le tissu des relations, qui les sollicitent, les écoutent, les intègrent, leur offrent le meilleur des remèdes — et souvent le plus négligé.

Vieillir, c'est donc un art fait d'attention à deux choses : entretenir son corps sans en faire une obsession, et surtout cultiver ce qui, en nous, ne vieillit pas — la curiosité, les affections, le désir d'apprendre et de transmettre, la capacité d'émerveillement. Ceux qui continuent d'apprendre, de rencontrer, de s'intéresser, de créer, traversent la vieillesse en gardant vivant l'essentiel.

Une dernière vérité s'impose, un peu vertigineuse : la façon dont nous vieillirons ne se décide pas à soixante-dix ans, mais tout au long de l'existence. Les amitiés qu'on entretient, les passions qu'on nourrit, le rapport qu'on établit avec le temps qui passe — tout cela prépare, lentement, la personne âgée que nous deviendrons. Bien vieillir ne commence pas dans la vieillesse.

Cela commence maintenant.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-031",
    title: "Pourquoi voyageons-nous ?",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "Pourquoi quitter une maison confortable pour dormir ailleurs ?",
    blurbEn:
      "We spend our savings to leave comfort behind, sleep in strange beds and lose our bearings. Beyond escaping routine, travel may be a way of meeting a stranger: ourselves.",
    body: `Il y a, dans le fait de voyager, quelque chose d'irrationnel que l'habitude nous empêche de voir. Nous travaillons dur, nous économisons, puis nous employons cet argent à quitter une maison confortable pour aller dormir ailleurs, souvent dans des conditions moins bonnes, au prix de la fatigue, des files d'attente et de l'inconfort. Nous payons pour perdre nos repères. Vu de loin, le comportement est étrange. Il doit donc répondre à un besoin profond. Lequel ?

La réponse la plus immédiate est la fuite. Fuir la routine, d'abord — cette usure sourde du quotidien, où les jours se ressemblent au point de se confondre. Le voyage rompt la répétition ; il réintroduit de l'imprévu, de la nouveauté, de la surprise, ces sensations que la vie ordinaire, à force de régularité, finit par étouffer. Ce n'est pas rien : beaucoup de gens vivent une année entière pour deux semaines qui, elles, resteront gravées, précisément parce qu'elles échappent au moule. Le voyage est un condensé de vie, là où le quotidien est parfois une vie diluée.

Mais s'en tenir à la fuite serait manquer l'essentiel, car le voyage n'est pas qu'une soustraction — il est aussi une addition. En découvrant d'autres pays, nous découvrons surtout d'autres façons d'être humain : d'autres manières de manger, de saluer, de travailler, de concevoir le temps, la famille, le bonheur. Cette rencontre a un effet précieux et discret : elle relativise nos propres habitudes. Ce que nous prenions pour l'ordre naturel des choses — nos horaires, nos codes, nos évidences — se révèle n'être qu'une possibilité parmi d'autres. Le voyage est peut-être le meilleur remède contre l'étroitesse d'esprit : difficile de croire que sa façon de vivre est la seule bonne quand on a vu, de ses yeux, mille façons différentes de bien vivre.

Il y a enfin une dimension plus intime, que l'on avoue moins volontiers. Le voyage ne nous fait pas seulement rencontrer les autres ; il nous fait nous rencontrer nous-mêmes. Arraché à ses repères, privé du regard familier qui nous fige dans un rôle, on se surprend à agir autrement. Le timide ose parler à des inconnus ; le pressé prend le temps ; on se découvre plus courageux, plus curieux, ou plus fragile qu'on ne le croyait. Loin de chez soi, sans public habituel, on est un peu plus soi — ou l'on entrevoit un autre soi possible. C'est pourquoi tant de gens reviennent d'un voyage avec le sentiment, difficile à expliquer, d'avoir changé.

Reste alors une question dérangeante. Si le voyage vaut d'abord par le déplacement intérieur qu'il produit, faut-il vraiment aller au bout du monde pour l'obtenir ? Certains l'ont noté avec malice : on peut parcourir des continents sans rien voir, enfermé dans ses habitudes et son téléphone, et l'on peut au contraire redécouvrir sa propre ville avec un regard neuf. Le vrai voyage n'est peut-être pas affaire de kilomètres, mais de disponibilité — cette capacité à s'ouvrir, à s'étonner, à se laisser déplacer.

« On voyage pour voir le monde », dit-on. C'est vrai, mais incomplet. On voyage aussi, et surtout, pour se voir soi-même sous un autre éclairage, et pour rentrer — car il faut rentrer — un peu différent de celui qui était parti.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-032",
    title: "La musique et le cerveau",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Pourquoi la musique a-t-elle un tel pouvoir sur nous ?",
    blurbEn:
      "No known culture lives without music, and none needs it to survive — a puzzle for science. What brain research reveals about why mere patterns of sound can move us to tears or to dance.",
    body: `Il existe un fait que l'on cite souvent sans en mesurer l'étrangeté : aucune culture humaine connue, à aucune époque, n'a vécu sans musique. Toutes les sociétés chantent, rythment, fabriquent des instruments, dansent. Or la musique, contrairement au langage ou à la fabrication d'outils, ne procure aucun avantage évident pour la survie : on ne se nourrit pas d'une mélodie, on ne se défend pas avec un rythme. Pourquoi, alors, cette activité apparemment inutile est-elle si universelle, et pourquoi exerce-t-elle sur nous un pouvoir qu'aucune autre forme d'art n'égale ? La question intrigue les scientifiques, et les réponses qu'ils commencent à esquisser sont fascinantes.

L'imagerie cérébrale a d'abord révélé une chose remarquable : il n'existe pas de « centre de la musique » dans le cerveau. Écouter un morceau active, au contraire, un réseau immense et distribué — les zones du son, bien sûr, mais aussi celles de la mémoire, du mouvement, et surtout des émotions et de la récompense. Cela explique des phénomènes que chacun connaît d'expérience. Pourquoi une chanson nous donne-t-elle irrésistiblement envie de bouger ? Parce que la musique active les circuits moteurs, comme si le corps se préparait à danser avant même que nous en décidions. Pourquoi une mélodie fait-elle resurgir, intact, un souvenir vieux de vingt ans ? Parce qu'elle est profondément liée à la mémoire — au point qu'elle atteint des malades qui ont presque tout oublié, chez qui une chanson de jeunesse ranime soudain le regard et les mots.

Le plus mystérieux reste le lien avec l'émotion. Comment de simples vibrations de l'air, organisées selon certaines règles, peuvent-elles nous émouvoir jusqu'aux larmes ? Une piste tient à la notion d'attente. Notre cerveau, sans que nous le sachions, anticipe en permanence la suite d'une musique ; et le plaisir naît du jeu subtil entre ce qu'il prévoit et ce qui advient — une résolution attendue qui apaise, une surprise qui saisit. Le compositeur habile joue de nos anticipations comme d'un instrument. La musique nous émeut parce qu'elle dialogue en secret avec les prédictions incessantes de notre esprit.

Ces découvertes ont des prolongements concrets, au-delà de la curiosité. On utilise aujourd'hui la musique en médecine — pour apaiser la douleur, accompagner la rééducation après un accident cérébral, atteindre des patients que les mots n'atteignent plus. Par ailleurs, apprendre à jouer d'un instrument dans l'enfance semble laisser des traces durables : les études suggèrent des bénéfices pour la concentration, la mémoire et même certaines capacités de langage. La musique n'est pas qu'un plaisir ; elle façonne le cerveau qui la pratique.

Faut-il, pour autant, tout expliquer ? Bien des mystères résistent encore, et il n'est pas certain que la science élucide un jour entièrement pourquoi une suite de sons peut nous bouleverser. Mais il y a là une belle leçon : comprendre les mécanismes n'abolit pas l'émotion. Savoir comment fonctionne l'arc-en-ciel n'en diminue pas la beauté ; connaître les circuits de la musique n'ôte rien au frisson qu'elle procure.

Nous n'avons pas besoin de comprendre la musique pour qu'elle nous touche. Mais découvrir à quel point elle est inscrite au plus profond de notre cerveau ajoute, à ce vieux compagnon de l'humanité, une raison de plus de s'émerveiller.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-033",
    title: "Faut-il tout partager en ligne ?",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "Partager sa vie en ligne est devenu presque naturel.",
    blurbEn:
      "Posting our lives has become second nature, each photo a tiny decision about privacy we rarely pause to make. On the permanence of the digital, the consent of others, and the value of the unshared.",
    body: `En l'espace d'une quinzaine d'années, un comportement inédit dans l'histoire humaine est devenu si banal que nous ne le remarquons plus : partager publiquement les moments de sa vie. Un repas, un voyage, un enfant qui grandit, une pensée du matin — tout se photographie, se commente, se diffuse à des dizaines, des centaines, parfois des milliers de personnes. Ce geste, que nos grands-parents auraient jugé incompréhensible, nous paraît aujourd'hui aller de soi. Chaque publication est pourtant une petite décision sur notre vie privée, une décision que nous prenons désormais des dizaines de fois par semaine, presque sans y penser. Il vaut la peine d'y réfléchir.

Reconnaissons d'emblée ce que ce partage a de précieux, car le condamner en bloc serait injuste et faux. Il permet de maintenir vivants des liens que la distance aurait autrefois distendus : suivre la vie d'un ami parti à l'étranger, voir grandir les enfants d'un cousin lointain, se sentir proche malgré les kilomètres. Il offre aussi la joie simple de partager ce qu'on aime, de célébrer un bonheur, de trouver une communauté autour d'une passion. Beaucoup y puisent du soutien dans les épreuves. Ce n'est pas rien.

Mais il vaudrait la peine de marquer un temps d'arrêt avant de publier, ne serait-ce que pour prendre conscience de deux réalités que l'habitude nous masque. La première est la permanence. Ce que nous mettons en ligne nous échappe aussitôt et pour toujours. Une image peut être copiée, sauvegardée, ressortie des années plus tard, dans un contexte que nous n'avions pas prévu — par un employeur, par un inconnu, par un enfant devenu grand. L'insouciance d'un instant peut se figer en trace durable. Nous publions dans le présent ; internet, lui, conserve pour un avenir dont nous ignorons tout.

La seconde réalité, plus délicate encore, concerne les autres. Partager une scène, c'est souvent partager des personnes qui n'ont rien demandé : des amis sur une photo de groupe, et surtout des enfants. Un enfant ne peut pas consentir à ce que son visage, ses moments, ses maladresses soient exposés à des milliers de regards et archivés pour toujours. Décider à sa place, c'est disposer d'une vie privée qui n'est pas la nôtre. Cette question, longtemps ignorée, commence à peine à être posée sérieusement, et il n'est pas certain que la génération ainsi exposée nous en sache gré.

Faut-il en conclure qu'il faudrait tout cacher, se retrancher dans le secret, bannir toute image ? Certainement pas — ce serait tomber d'un excès dans l'autre. L'enjeu n'est pas de choisir entre tout montrer et tout dissimuler, mais de retrouver un peu de discernement là où règne l'automatisme. Se demander, avant de publier : est-ce que cela regarde vraiment tout le monde ? Est-ce que d'autres sont concernés sans l'avoir voulu ? Ai-je envie que cela existe encore dans dix ans ?

Il y a d'ailleurs, dans le fait de garder pour soi certains moments, non pas un manque de sincérité, mais peut-être le contraire. Ne pas tout exposer, c'est reconnaître qu'un instant vécu pleinement se suffit à lui-même, qu'il n'a pas besoin d'un public pour être réel. Les moments les plus précieux sont parfois ceux que nous ne partageons pas — ceux que nous nous contentons de vivre.

Dans un monde qui nous pousse à tout montrer, décider de garder une part de sa vie pour soi et pour ses proches n'est pas se cacher. C'est protéger ce qui a le plus de valeur.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-034",
    title: "Le retour à la terre",
    category: "everyday life",
    difficulty: "B2",
    minutes: 4,
    preview: "De plus en plus de personnes quittent la ville pour la campagne.",
    blurbEn:
      "City-dwellers dreaming of vegetable gardens and quiet mornings are moving to the countryside in growing numbers. A clear-eyed look at the dream, its harsh realities, and the real need it reveals.",
    body: `On les rencontre de plus en plus souvent, ou l'on entend parler d'eux : ces citadins qui, un jour, plaquent tout pour s'installer à la campagne. Un couple qui reprend une petite ferme, une famille qui échange l'appartement contre une maison avec jardin, un cadre qui quitte son bureau pour élever des chèvres. Ce mouvement, longtemps marginal, s'est amplifié, nourri par le désir d'une autre vie. Il mérite qu'on le regarde sans les deux excès habituels : ni l'idéalisation béate, ni le ricanement de ceux qui prédisent l'échec.

Le désir qui pousse ces personnes est parfaitement compréhensible, et même sain. La vie urbaine moderne, avec son rythme haletant, son bruit permanent, son entassement, son air pollué, sa nature réduite à quelques arbres alignés, produit une fatigue diffuse dont beaucoup souffrent sans la nommer. Face à cela, la campagne fait miroiter tout ce qui manque : l'espace, le silence, le calme, le contact direct avec le vivant, un rapport plus concret et plus lent au temps et aux saisons. Rêver de cultiver son jardin, de voir le ciel en grand, d'entendre autre chose que des moteurs, n'a rien d'une lubie ; c'est répondre à un besoin réel que la ville, souvent, ne satisfait plus.

Il serait toutefois naïf, et parfois cruel, de peindre ce retour à la terre comme un long rêve tranquille. La réalité est âpre. Cultiver, élever, produire, demande un travail considérable, physique, sans horaires ni vacances, soumis au climat, aux maladies, aux marchés — toutes choses qui ne se commandent pas et qui rappellent vite au néo-campagnard combien la nature, si belle de loin, est exigeante de près. À la dureté du travail s'ajoutent l'isolement, l'éloignement des services, la difficulté de se faire accepter d'un tissu local qui n'attendait pas forcément ces nouveaux venus. Beaucoup, après quelques années, renoncent et repartent, épuisés et désillusionnés. D'autres, il faut le dire aussi, trouvent enfin la vie qui leur convient, et pour rien au monde ne reviendraient en arrière. Le retour à la terre n'est ni un conte de fées ni une erreur : c'est un pari difficile, qui réussit à certains et brise d'autres.

Mais au-delà des trajectoires individuelles, ce mouvement dit quelque chose de plus large sur notre époque, et c'est peut-être là son intérêt principal. Dans un monde de plus en plus rapide, virtuel, dématérialisé — où tant de métiers consistent à déplacer des symboles sur un écran, où les nourritures et les objets arrivent sans qu'on sache d'où —, monte une soif de concret, de réel, de tangible. Faire pousser ce qu'on mange, travailler de ses mains, voir le résultat immédiat de son effort : ce désir répond à un manque que la modernité a créé. Que l'on parte ou non à la campagne, ce besoin nous concerne tous.

Il n'est d'ailleurs pas nécessaire de tout quitter pour l'écouter. Un balcon planté, un jardin partagé, quelques heures de travail manuel, un peu de temps rendu aux choses lentes et concrètes : chacun peut, à sa mesure, répondre à cette soif sans bouleverser sa vie.

Le retour à la terre, pris au sérieux, n'est pas seulement le choix de quelques-uns. C'est un signal que nous adresse notre époque, et qui mérite qu'on l'écoute : celui d'un besoin de réel que le progrès, à force d'abstraction, a laissé sans réponse.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-035",
    title: "L'espace vaut-il tant d'efforts ?",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Faut-il dépenser tant d'argent pour explorer l'espace ?",
    blurbEn:
      "With so many problems unsolved on Earth, spending fortunes on rockets can seem obscene. Yet the case for space is stronger and stranger than it looks — practical, planetary, and deeply human.",
    body: `L'objection revient à chaque lancement spectaculaire, à chaque annonce d'une mission vers Mars, et elle a la force de l'évidence : comment justifier que l'on engloutisse des fortunes dans l'exploration spatiale, alors que tant de problèmes restent sans solution sur Terre ? La faim, la pauvreté, la maladie, le climat : la liste des urgences terrestres est longue, et dépenser des milliards pour envoyer des robots contempler des cailloux lointains peut sembler, au mieux, un caprice, au pire, une indécence. L'argument mérite d'être pris au sérieux — et c'est en le prenant au sérieux qu'on découvre qu'il est plus faible qu'il n'y paraît.

Première réponse, la plus terre à terre : l'exploration spatiale n'est pas de l'argent jeté dans le vide. Une part considérable des technologies qui équipent notre quotidien est née, directement ou indirectement, de la recherche spatiale. Les prévisions météorologiques qui sauvent des vies, les systèmes de localisation qui guident nos déplacements, une foule d'avancées en médecine, en matériaux, en électronique miniaturisée : autant d'applications issues des efforts déployés pour aller dans l'espace. L'histoire des techniques enseigne une leçon constante : la recherche fondamentale, apparemment inutile, débouche presque toujours sur des applications imprévues et précieuses. Renoncer à explorer au nom de l'utilité immédiate, c'est se priver des utilités futures qu'on ne peut prévoir.

Deuxième réponse, moins attendue : l'espace nous apprend à connaître la Terre. C'est depuis l'espace que nous surveillons le climat, l'état des forêts, la fonte des glaces, la santé des océans ; sans satellites, notre compréhension du changement climatique — cette urgence même qu'on oppose à l'espace — serait infiniment plus pauvre. C'est aussi depuis l'espace que l'humanité a vu, pour la première fois, sa planète entière : une petite bille bleue et fragile, suspendue dans le noir, sans frontières visibles. Cette image, rapportée par les premières missions, a durablement changé notre regard sur nous-mêmes et nourri la conscience écologique naissante. Paradoxalement, s'éloigner de la Terre nous a appris à l'aimer et à la protéger.

Reste une troisième dimension, plus difficile à chiffrer, et pourtant peut-être la plus importante. Chercher à savoir d'où nous venons, s'il existe une vie ailleurs, ce qu'est cet univers dont nous sommes issus : ce désir de comprendre n'est pas un luxe superflu, c'est l'un des traits les plus profonds de notre humanité. C'est lui qui a poussé nos ancêtres à traverser les océans, à cartographier les continents, à percer les secrets de l'atome et du vivant. Une humanité qui renoncerait à explorer, qui se replierait entièrement sur la gestion de ses problèmes immédiats, perdrait quelque chose d'essentiel — cette part de rêve et de curiosité sans laquelle aucun des grands progrès n'aurait eu lieu.

Faut-il pour autant tout accepter au nom de l'espace ? Non, et l'objection garde sa part de vérité comme garde-fou. Les milliardaires qui s'offrent des promenades orbitales, la militarisation de l'espace, la course aux drapeaux plantés pour la seule gloire : tout cela est légitimement critiquable. La question n'est pas « l'espace, oui ou non ? », mais « quel espace, pour quoi, et à quel prix ? ». Une exploration au service de la connaissance et du bien commun n'a rien à voir avec le tourisme spatial des très riches.

L'espace ne résoudra pas la faim ni la pauvreté, et ceux qui l'opposent aux urgences terrestres ont raison de refuser qu'il serve d'échappatoire. Mais bien conçu, il n'est pas l'ennemi de ces causes : il en est parfois l'allié inattendu. Continuer à lever les yeux vers le ciel, à condition de ne jamais oublier la Terre sous nos pieds, n'est pas une fuite. C'est fidèle à ce que nous sommes depuis toujours : une espèce qui, pour avancer, a toujours eu besoin d'un horizon.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-036",
    title: "La rue est fermée samedi",
    category: "news-style",
    difficulty: "A1",
    minutes: 1,
    preview: "Samedi, la rue Victor-Hugo est fermée aux voitures.",
    blurbEn:
      "A town closes one street to cars on Saturday so people can walk, listen to music, and visit local shops.",
    body: `Samedi, la rue Victor-Hugo est fermée aux voitures. La rue est dans le centre-ville.

La mairie organise une petite fête. Il y a de la musique devant la boulangerie. Il y a aussi des tables près du café.

Les magasins restent ouverts. Les habitants peuvent marcher dans la rue sans voiture. Les enfants peuvent jouer.

Le bus ne passe pas par la rue samedi. Il s'arrête devant la gare.

La rue ouvre encore aux voitures dimanche matin.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-037",
    title: "Une collecte de vêtements",
    category: "news-style",
    difficulty: "A1",
    minutes: 1,
    preview: "Une association collecte des manteaux et des pulls.",
    blurbEn:
      "A local association collects coats, jumpers, and shoes at the town hall for families who need warm clothes.",
    body: `Une association collecte des vêtements cette semaine. Elle cherche des manteaux, des pulls et des chaussures.

La collecte est à la mairie. Elle est ouverte de neuf heures à dix-huit heures.

Les vêtements doivent être propres. Les habitants peuvent donner un vêtement ou plusieurs vêtements.

Mardi matin, beaucoup de personnes arrivent avec des sacs. Une femme donne deux manteaux pour enfants.

L'association donne ensuite les vêtements aux familles du quartier. "Merci pour votre aide", dit le responsable.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-038",
    title: "Le bus change d'arrêt",
    category: "news-style",
    difficulty: "A1",
    minutes: 1,
    preview: "Le bus numéro 4 change d'arrêt pendant trois jours.",
    blurbEn:
      "Bus number 4 uses a different stop for three days because workers are repairing the road near the school.",
    body: `Le bus numéro 4 change d'arrêt pendant trois jours. Il ne s'arrête pas devant l'école.

Des ouvriers réparent la route. Il y a des machines et des barrières.

Le nouvel arrêt est devant la pharmacie. Il est à cinq minutes à pied de l'école.

Le matin, un agent aide les élèves. Il montre le chemin aux parents.

Vendredi soir, les travaux sont finis. Lundi, le bus revient devant l'école.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-036",
    title: "Un nouveau médecin arrive",
    category: "news-style",
    difficulty: "A2",
    minutes: 2,
    preview: "Un nouveau médecin va ouvrir un cabinet près de la place.",
    blurbEn:
      "A new doctor is opening a practice near the main square, which should make appointments easier for families in the town.",
    body: `Un nouveau médecin va ouvrir un cabinet près de la place. Le cabinet sera au premier étage d'un ancien bureau.

Depuis plusieurs mois, beaucoup d'habitants cherchent un rendez-vous. Ils doivent parfois aller dans une autre ville. Pour les familles sans voiture, ce n'est pas facile.

La mairie a aidé le médecin à trouver un local. Des travaux ont commencé lundi. Il y aura deux salles de consultation et une petite salle d'attente.

Le médecin recevra les premiers patients au début du mois prochain. Les rendez-vous pourront se prendre par téléphone ou sur internet.

Pour les habitants, c'est une bonne nouvelle. "On attendait cela depuis longtemps", dit une mère devant l'école.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-037",
    title: "La cantine jette moins de nourriture",
    category: "news-style",
    difficulty: "A2",
    minutes: 2,
    preview: "La cantine du collège a changé son organisation.",
    blurbEn:
      "A school canteen reduces food waste by serving smaller first portions and letting students ask for more if they are still hungry.",
    body: `La cantine du collège a changé son organisation. Depuis deux semaines, les élèves reçoivent une portion plus petite au début du repas.

S'ils ont encore faim, ils peuvent demander une deuxième portion. Avant, beaucoup d'assiettes revenaient presque pleines. Maintenant, les élèves choisissent mieux.

Chaque vendredi, une classe pèse la nourriture jetée. Les chiffres sont écrits sur une affiche près de l'entrée.

La première semaine, la cantine a jeté trente kilos de moins. Le chef est content, mais il veut continuer les efforts.

Les élèves proposent aussi des idées. Certains demandent plus de fruits coupés, d'autres veulent choisir entre deux légumes.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-036",
    title: "Une résidence pour étudiants ouvre",
    category: "news-style",
    difficulty: "B1",
    minutes: 2,
    preview: "Une nouvelle résidence étudiante ouvre près de la gare.",
    blurbEn:
      "A new student residence opens near the station, offering smaller but cheaper rooms in a city where rent has become difficult.",
    body: `Une nouvelle résidence étudiante ouvre cette semaine près de la gare. Elle propose quatre-vingts chambres, une cuisine partagée à chaque étage et une grande salle de travail au rez-de-chaussée.

Dans la ville, trouver un logement est devenu difficile pour les jeunes. Les loyers ont augmenté, et beaucoup d'étudiants vivent loin de l'université. Certains passent plus d'une heure dans les transports chaque matin.

La nouvelle résidence n'est pas luxueuse. Les chambres sont petites, mais le loyer reste inférieur au prix moyen du quartier. La mairie a aussi demandé que dix chambres soient réservées aux étudiants qui reçoivent une bourse.

Pour les associations étudiantes, l'ouverture va dans le bon sens, mais elle ne suffira pas. Elles rappellent que des centaines de jeunes cherchent encore une solution avant la rentrée.

La ville promet déjà un deuxième projet dans deux ans. En attendant, les premiers habitants arrivent avec leurs cartons et beaucoup d'espoir.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-037",
    title: "Des rues plus fraîches en été",
    category: "news-style",
    difficulty: "B1",
    minutes: 2,
    preview: "La ville teste de nouveaux aménagements contre la chaleur.",
    blurbEn:
      "The city tests shade, trees, and lighter pavement to reduce summer heat in streets where older residents struggle.",
    body: `La ville teste cet été plusieurs aménagements pour rendre les rues plus fraîches. Dans trois quartiers, des arbres ont été plantés, des bancs ont été installés à l'ombre et une partie du sol a été peinte en couleur claire.

Pendant les fortes chaleurs, certaines rues deviennent presque impossibles à traverser en milieu de journée. Les personnes âgées et les parents avec de jeunes enfants sont les premiers concernés.

Le but n'est pas seulement de rendre la ville plus agréable. Il s'agit aussi de protéger la santé des habitants. Selon la mairie, quelques degrés de moins peuvent changer beaucoup de choses dans une rue sans arbre.

Les commerçants observent déjà une différence. Quand il y a de l'ombre, les passants s'arrêtent davantage devant les vitrines. Certains demandent donc que le test devienne permanent.

Un bilan sera publié à la fin du mois de septembre. Si les résultats sont bons, d'autres rues seront transformées l'année prochaine.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-038",
    title: "Les habitants parlent du bruit",
    category: "news-style",
    difficulty: "B1",
    minutes: 2,
    preview: "Une réunion publique a réuni des habitants du centre-ville.",
    blurbEn:
      "Residents meet to discuss noise in the town centre, balancing evening life with sleep, work, and shared rules.",
    body: `Une réunion publique a réuni mardi soir des habitants du centre-ville, des élus et plusieurs responsables de bars. Le sujet était simple, mais sensible : le bruit le soir.

Depuis le printemps, des habitants se plaignent de ne plus dormir correctement. Les terrasses restent pleines plus tard, et certains clients parlent fort dans la rue après la fermeture. Pour les riverains, la situation devient fatigante.

Les propriétaires des bars répondent qu'ils font déjà attention. Ils rappellent aussi que les terrasses donnent de la vie au quartier et créent des emplois. Selon eux, fermer plus tôt punirait tout le monde pour le comportement de quelques personnes.

La mairie cherche donc un compromis. Elle propose plus de contrôles après minuit, mais aussi une campagne d'information pour les clients. Des affiches demanderont de respecter le voisinage en quittant les bars.

Une nouvelle réunion aura lieu dans deux mois. Les habitants espèrent des changements rapides, sans faire disparaître l'ambiance du centre-ville.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-039",
    title: "Le cinéma change ses horaires",
    category: "news-style",
    difficulty: "B1",
    minutes: 2,
    preview: "Le cinéma municipal essaie une séance plus tôt.",
    blurbEn:
      "The municipal cinema tests earlier evening screenings to attract families, older viewers, and people who rely on public transport.",
    body: `Le cinéma municipal change ses horaires pendant trois mois. Chaque jeudi, une séance commencera à dix-huit heures trente au lieu de vingt heures trente.

Cette décision vient d'une enquête auprès des spectateurs. Beaucoup de familles trouvent les séances trop tardives en semaine. Des personnes âgées disent aussi qu'elles préfèrent rentrer avant la nuit, surtout en hiver.

Le cinéma espère attirer un public plus large sans supprimer les séances du soir. Le directeur explique que les habitudes ont changé depuis quelques années. Les gens sortent moins tard et choisissent plus souvent de regarder des films chez eux.

La première séance avancée proposera un film français récent, suivi d'une courte discussion. Si la salle est assez remplie, le cinéma gardera ce nouvel horaire.

Pour la mairie, l'enjeu est important. Le cinéma n'est pas seulement un commerce : c'est aussi un lieu de rencontre au centre de la ville.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-040",
    title: "Une association accueille les nouveaux habitants",
    category: "news-style",
    difficulty: "B1",
    minutes: 2,
    preview: "Une association aide les personnes qui viennent d'arriver.",
    blurbEn:
      "A local association helps newcomers discover services, meet neighbours, and feel less isolated after moving to town.",
    body: `Une association locale lance un accueil mensuel pour les nouveaux habitants. La première rencontre aura lieu samedi matin dans la salle des fêtes.

Quand on arrive dans une ville, il faut trouver beaucoup d'informations à la fois : les transports, les médecins, les activités pour les enfants, les démarches administratives. Même quand tout existe, il n'est pas toujours facile de savoir où chercher.

L'association propose donc une matinée simple. Des bénévoles présenteront les principaux services, puis les participants pourront poser leurs questions autour d'un café. Des habitants installés depuis longtemps seront aussi présents pour parler de leur quartier.

Le projet répond à un problème discret : l'isolement. Certaines personnes déménagent pour un travail ou des études et ne connaissent personne. Quelques échanges peuvent déjà changer leur première impression.

Si la rencontre fonctionne, elle sera organisée le premier samedi de chaque mois.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-036",
    title: "La région veut réduire les déchets",
    category: "news-style",
    difficulty: "B2",
    minutes: 3,
    preview: "La région présente un plan pour réduire les déchets ménagers.",
    blurbEn:
      "A regional waste plan combines composting, repair workshops, and incentives, but raises questions about cost and unequal access.",
    body: `La région a présenté lundi un plan destiné à réduire les déchets ménagers de 15 % en cinq ans. Le programme repose sur trois axes : développer le compostage, encourager la réparation des objets et aider les communes à mieux informer les habitants.

Sur le papier, le plan paraît consensuel. Personne ne défend sérieusement l'idée de produire toujours plus de déchets. Pourtant, sa mise en œuvre risque d'être moins simple qu'une affiche de sensibilisation. Installer des composteurs collectifs demande de l'espace, de l'entretien et des habitants prêts à changer leurs habitudes. Les ateliers de réparation, eux, supposent des locaux, des bénévoles formés et une vraie visibilité.

Les associations écologistes saluent donc l'orientation générale, tout en demandant des moyens plus clairs. Elles craignent que les communes les plus riches avancent vite, tandis que les autres restent avec de bonnes intentions. Plusieurs maires ruraux posent aussi la question du transport : dans un village, se rendre à un atelier de réparation peut nécessiter une voiture.

La région promet un premier bilan dans un an. Ce sera le moment de voir si le plan modifie réellement les pratiques ou s'il reste une ambition correcte, mais trop générale.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-037",
    title: "Le débat sur les loyers continue",
    category: "news-style",
    difficulty: "B2",
    minutes: 3,
    preview: "La hausse des loyers divise élus, propriétaires et locataires.",
    blurbEn:
      "Rising rents divide tenants, owners, and local officials, who must choose between regulation, building, and protecting mixed neighbourhoods.",
    body: `La hausse des loyers continue d'alimenter le débat municipal. Dans plusieurs quartiers, des habitants expliquent qu'ils ne peuvent plus se loger près de leur travail, tandis que des propriétaires affirment que leurs charges augmentent elles aussi.

La ville envisage d'encadrer davantage les loyers dans les zones les plus tendues. Pour les associations de locataires, cette mesure est indispensable : sans règle, disent-elles, le marché pousse peu à peu les familles modestes hors du centre. Les conséquences ne sont pas seulement individuelles. Quand seuls les ménages aisés peuvent rester, les écoles, les commerces et la vie de quartier changent profondément.

Les représentants des propriétaires répondent que l'encadrement risque de décourager la location. Certains préféreront vendre ou laisser leur logement vide plutôt que de louer à un prix jugé trop bas. Selon eux, le vrai problème est le manque de logements disponibles.

Entre ces deux positions, la mairie cherche une solution mixte : construire davantage, limiter les abus les plus visibles et réserver une partie des nouveaux programmes à des loyers accessibles. Reste à savoir si ces outils agiront assez vite pour les habitants déjà menacés de départ.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-038",
    title: "Un lycée change le rythme de la semaine",
    category: "news-style",
    difficulty: "B2",
    minutes: 3,
    preview: "Un lycée expérimente un nouvel emploi du temps.",
    blurbEn:
      "A high school tests a different weekly rhythm with longer project periods, raising hopes for focus and concerns about fatigue.",
    body: `Un lycée de la région expérimente depuis la rentrée un nouvel emploi du temps. Deux après-midi par semaine sont désormais réservés à des projets longs : laboratoire, théâtre, journal scolaire, soutien en petits groupes. Les cours classiques sont regroupés sur les autres demi-journées.

L'objectif affiché est de rompre avec une succession de cours trop courts, où les élèves changent de matière sans avoir le temps d'approfondir. Les enseignants favorables au projet estiment qu'on apprend aussi en enquêtant, en fabriquant, en préparant une présentation ou en corrigeant un texte à plusieurs.

Les premières réactions sont contrastées. Certains élèves apprécient de travailler autrement et disent mieux comprendre l'utilité de ce qu'ils apprennent. D'autres trouvent les matinées plus lourdes, car plusieurs matières exigeantes s'enchaînent. Des parents s'inquiètent également pour les élèves qui ont déjà des difficultés d'organisation.

Le proviseur insiste sur le caractère expérimental du dispositif. Rien ne sera généralisé avant un bilan complet, avec les résultats scolaires, l'absentéisme et le ressenti des élèves. Cette prudence est nécessaire : changer le rythme scolaire touche à la fois au savoir, à la fatigue et à l'égalité entre élèves.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-039",
    title: "Une consultation sur les arbres en ville",
    category: "news-style",
    difficulty: "B2",
    minutes: 3,
    preview: "Les habitants peuvent choisir des rues à végétaliser.",
    blurbEn:
      "Residents are asked where the city should plant trees, but the debate shows how climate adaptation competes with parking and street use.",
    body: `La mairie lance une consultation pour choisir les prochaines rues à végétaliser. Les habitants peuvent signaler les endroits où planter des arbres, créer des bandes de terre ou installer des bacs plus grands.

L'initiative répond à une urgence bien identifiée : lors des épisodes de chaleur, les rues minérales deviennent étouffantes. Les arbres apportent de l'ombre, retiennent une partie de l'eau de pluie et rendent l'espace public plus agréable. Mais planter en ville n'est jamais un geste purement décoratif. Il faut déplacer des réseaux, supprimer parfois des places de stationnement et accepter que la rue change d'usage.

C'est là que le débat commence. Des habitants demandent plus d'arbres devant les écoles et les arrêts de bus. D'autres craignent de perdre des places pour leur voiture ou de voir les trottoirs encombrés. Les commerçants, eux, veulent être associés au choix des rues, car les travaux peuvent gêner leur activité.

La consultation ne réglera pas toutes les tensions, mais elle peut rendre les arbitrages plus visibles. Adapter la ville au climat suppose des choix concrets, parfois modestes, rarement neutres. Un arbre planté est aussi une décision sur la façon de partager la rue.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-040",
    title: "Les commerces cherchent un nouvel équilibre",
    category: "news-style",
    difficulty: "B2",
    minutes: 3,
    preview: "Les petits commerces du centre-ville s'adaptent aux nouveaux usages.",
    blurbEn:
      "Small town-centre shops adapt to online shopping and changed routines by combining service, events, and local identity.",
    body: `Les petits commerces du centre-ville cherchent un nouvel équilibre. Depuis plusieurs années, ils subissent la concurrence des achats en ligne, la hausse des loyers commerciaux et des habitudes qui ont changé. Beaucoup d'habitants passent encore devant les vitrines, mais achètent moins souvent sur place.

Face à cette situation, certains commerçants misent sur ce qu'internet offre mal : le conseil, la réparation, la relation personnelle. Une librairie organise des rencontres avec des auteurs. Un magasin de vêtements propose des retouches rapides. Un caviste prépare des soirées de découverte pour attirer des clients qui ne seraient pas venus seulement acheter une bouteille.

La mairie tente aussi d'agir. Elle finance des animations le samedi et aide les boutiques à améliorer leur présence en ligne. Mais les commerçants rappellent que les événements ponctuels ne suffisent pas si le stationnement, les transports et les loyers rendent le centre moins accessible.

Le débat dépasse donc la nostalgie des rues commerçantes d'autrefois. Il pose une question très actuelle : que veut-on trouver au centre d'une ville ? Si la réponse est seulement "des achats", les plateformes seront souvent plus efficaces. Si la réponse inclut le conseil, la rencontre et une certaine idée de la vie locale, alors les commerces ont encore un rôle à jouer.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-041",
    title: "Mon premier emploi",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "À dix-neuf ans, j'ai trouvé mon premier emploi.",
    blurbEn:
      "Nervous on the first day of her first real job, Salma learns her tasks, meets her colleagues, and discovers that a kind boss makes all the difference. (Section: Work & careers, 1/5.)",
    body: `À dix-neuf ans, j'ai trouvé mon premier emploi : vendeuse dans une petite librairie. Le premier jour, j'étais très nerveuse. Je ne connaissais personne et je ne savais pas exactement quelles étaient mes tâches.

Ma patronne, madame Leroy, m'a accueillie avec un grand sourire. « Ne t'inquiète pas, m'a-t-elle dit. Tout le monde débute un jour. » Elle m'a présenté mes deux collègues, Karim et Julie, qui travaillaient dans la librairie depuis plusieurs années.

Au début, mes tâches étaient simples : ranger les livres, aider les clients, tenir la caisse. Karim m'a tout expliqué patiemment. Quand je faisais une erreur, il ne se moquait pas ; il me montrait comment faire mieux.

Le travail n'était pas toujours facile. Certains jours, il y avait beaucoup de clients et je rentrais chez moi fatiguée. Mais j'apprenais quelque chose de nouveau chaque semaine, et petit à petit, j'ai gagné en confiance.

À la fin du mois, j'ai reçu mon premier salaire. Ce n'était pas beaucoup, mais j'étais fière : c'était mon argent, gagné par mon travail. J'ai invité mes collègues à boire un café pour les remercier.

Aujourd'hui, je ne travaille plus dans cette librairie. Mais je n'oublierai jamais ce premier emploi. J'y ai appris une chose importante : un bon patron et des collègues gentils changent tout.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-042",
    title: "L'entretien d'embauche",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Avant d'obtenir un emploi, il faut souvent passer un entretien.",
    blurbEn:
      "Before you get the job comes the interview. A first-timer's account of preparing, staying calm, and what a recruiter is really looking for. (Section: Work & careers, 2/5.)",
    body: `Avant d'obtenir un emploi, il faut souvent passer une étape stressante : l'entretien d'embauche. J'ai passé mon premier entretien il y a deux ans, et je me souviens encore de mes mains qui tremblaient.

Pour postuler, j'avais envoyé mon CV et une lettre. Quelques jours plus tard, l'entreprise m'a appelée pour me proposer un rendez-vous. J'étais contente, mais aussi très inquiète. Comment se présenter ? Que dire ? Que faut-il porter ?

Un ami qui avait déjà embauché des gens m'a donné des conseils. « Le patron ne cherche pas quelqu'un de parfait, m'a-t-il expliqué. Il veut savoir si tu es motivée, honnête, et si tu vas bien travailler avec tes futurs collègues. »

Le jour de l'entretien, je suis arrivée en avance. La recruteuse m'a posé beaucoup de questions : sur mes études, sur mes compétences, sur mes qualités et mes défauts. La plus difficile a été : « Pourquoi voulez-vous ce poste ? » J'ai répondu honnêtement, avec mes propres mots.

À la fin, elle m'a demandé si j'avais des questions. J'en avais préparé deux ; cela montre qu'on s'intéresse vraiment à l'emploi.

Une semaine plus tard, bonne nouvelle : j'étais embauchée ! Depuis, j'ai passé d'autres entretiens, et je suis toujours un peu nerveuse. Mais j'ai compris que ce n'est pas un examen : c'est simplement une conversation entre deux personnes qui cherchent à se connaître.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-043",
    title: "Une journée de télétravail",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Deux jours par semaine, je reste chez moi pour travailler.",
    blurbEn:
      "Working from home sounds like a dream — no commute, coffee in hand — but a day of remote work has its own quiet challenges. (Section: Work & careers, 3/5.)",
    body: `Depuis la pandémie, beaucoup de gens font du télétravail, c'est-à-dire qu'ils travaillent à la maison au lieu d'aller au bureau. Deux jours par semaine, moi aussi, je reste chez moi pour travailler.

Le matin du télétravail est agréable. Pas de transport, pas de métro bondé. Je prends mon café tranquillement et j'allume mon ordinateur. Mais attention : travailler à la maison demande de la discipline.

Le plus difficile, c'est de se concentrer. À la maison, il y a mille distractions : la télévision, le frigo, le linge à laver. Il faut vraiment s'organiser. Moi, je m'installe toujours à la même table, comme si c'était mon bureau, et je fais une liste de mes tâches pour la journée.

Bien sûr, je ne suis pas seule. Grâce à l'écran, je reste en contact avec mes collègues. Nous avons souvent des réunions en visioconférence. Ce n'est pas comme au bureau : parfois la connexion est mauvaise, et tout le monde parle en même temps ! Mais on s'habitue.

Le vrai danger du télétravail, c'est l'équilibre. Quand le travail est à la maison, on ne s'arrête jamais vraiment. Le soir, je suis parfois tentée de répondre à un dernier message. Alors j'ai pris une décision : à dix-huit heures, je ferme mon ordinateur et je ne le rouvre pas.

Le télétravail a des avantages et des inconvénients. J'aime la liberté qu'il me donne, mais j'ai aussi besoin de voir mes collègues en vrai. C'est pour ça que l'équilibre entre les deux me convient parfaitement.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-044",
    title: "Changer de métier",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Après dix ans dans le même métier, Thomas s'ennuyait.",
    blurbEn:
      "After ten years in the same job, Thomas felt stuck. Retraining as a carpenter meant risk and a pay cut — but also a reason to get up in the morning. (Section: Work & careers, 4/5.)",
    body: `Pendant dix ans, Thomas a fait le même métier : comptable dans une grande entreprise. Le salaire était bon, l'emploi était stable, mais il s'ennuyait. Chaque jour, les mêmes tâches, la même routine. Un matin, il a compris qu'il n'avait plus envie de se lever pour aller travailler.

Changer de métier après trente-cinq ans, ce n'est pas facile. C'est même un vrai risque. Thomas gagnait bien sa vie ; en changeant, il allait peut-être gagner moins, au moins au début. « Tu es fou », lui disaient certains collègues. Mais d'autres l'encourageaient : « Au moins, tu essaies. »

Thomas rêvait depuis longtemps de travailler le bois. Il a donc décidé de se reconvertir et de devenir menuisier. Pour cela, il a suivi une formation pendant un an. Retourner à l'école à son âge, avec des étudiants plus jeunes, demandait du courage. Mais il a osé.

Aujourd'hui, Thomas gagne un peu moins d'argent qu'avant, et ses journées sont plus fatigantes physiquement. Pourtant, il n'a jamais été aussi heureux. Le soir, il regarde les meubles qu'il a fabriqués de ses mains, et il ressent une vraie fierté.

Bien sûr, se reconvertir n'est pas possible pour tout le monde, et ce n'est pas toujours une réussite. Mais l'histoire de Thomas pose une bonne question : vaut-il mieux un emploi confortable qui nous ennuie, ou un métier plus difficile qui a du sens pour nous ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-045",
    title: "Les petits boulots",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "De plus en plus d'adultes vivent de petits emplois.",
    blurbEn:
      "Delivering food, walking dogs, driving strangers: the 'gig economy' offers freedom and flexible hours — but at the cost of security. (Section: Work & careers, 5/5.)",
    body: `Autrefois, un petit boulot était souvent un job d'été pour un étudiant. Aujourd'hui, de plus en plus d'adultes vivent uniquement de ces petits emplois. On appelle cela « l'économie des petits boulots ».

De quoi s'agit-il ? Livrer des repas à vélo, promener des chiens, conduire des passagers, faire du ménage chez des particuliers : ce sont des tâches simples, que l'on trouve souvent grâce à une application sur son téléphone. Pas besoin de passer un long entretien ni d'envoyer un CV : on s'inscrit, et on commence à travailler.

Le grand avantage, c'est la liberté. On n'a pas de patron qui surveille chaque minute. On choisit ses horaires : on peut travailler le matin, le soir, ou seulement le week-end. Pour un parent ou un étudiant, cette flexibilité est précieuse. On est, en quelque sorte, son propre patron.

Mais il y a un prix à payer. Ces emplois sont souvent précaires : le salaire n'est pas garanti, et il change d'une semaine à l'autre. Il n'y a pas de contrat stable, pas de sécurité en cas de maladie. Quand on est indépendant, personne ne s'occupe de nous.

L'économie des petits boulots pose donc une question difficile pour l'avenir du travail. Faut-il préférer la liberté et la flexibilité, ou la sécurité d'un emploi classique ? La réponse n'est pas simple. Ce qui est sûr, c'est que le monde du travail change vite, et que ces petits boulots ne sont plus si petits.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-046",
    title: "Bien dormir",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Beaucoup de gens dorment mal et se réveillent fatigués.",
    blurbEn:
      "We spend a third of our lives asleep, yet many of us sleep badly. Simple, practical habits for better nights — and better days. (Section: Everyday health, 1/5.)",
    body: `Nous passons environ un tiers de notre vie à dormir. Pourtant, beaucoup de gens dorment mal et se réveillent fatigués. Le sommeil est important : c'est pendant la nuit que le corps se repose et retrouve son énergie.

Quand on ne dort pas assez, tout devient plus difficile. On a du mal à se concentrer, on est de mauvaise humeur, et la moindre tâche demande un gros effort. La fatigue s'accumule jour après jour.

Alors, comment mieux dormir ? Il existe quelques habitudes simples. D'abord, il vaut mieux se coucher et se réveiller à la même heure, même le week-end. Le corps aime la régularité.

Ensuite, il faut préparer la nuit. Le soir, on évite le café et les écrans, car la lumière du téléphone empêche le cerveau de se préparer au sommeil. Une chambre calme, un peu fraîche et dans le noir aide beaucoup.

Enfin, il ne faut pas rester au lit quand on ne dort pas. Si le sommeil ne vient pas après vingt minutes, il vaut mieux se lever, lire quelques pages, puis retourner se coucher.

Bien dormir n'est pas un luxe : c'est un besoin. Une bonne nuit donne de l'énergie pour toute la journée. Prendre soin de son sommeil, c'est prendre soin de tout le reste.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-047",
    title: "Manger sainement sans se compliquer",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Bien manger repose sur quelques habitudes simples.",
    blurbEn:
      "Eating well doesn't mean diets or expensive food. A few simple habits — more vegetables, less sugar, home cooking — go a long way. (Section: Everyday health, 2/5.)",
    body: `« Manger sainement, c'est compliqué et cher. » Cette idée est très répandue, mais elle est fausse. En réalité, bien manger repose sur quelques habitudes simples, et cela donne au corps l'énergie dont il a besoin.

La première règle est facile : manger plus de légumes et de fruits. Ils sont pleins de vitamines, ils ne coûtent pas cher, surtout de saison, et ils rassasient sans fatiguer le corps. Dans chaque repas, la moitié de l'assiette devrait être des légumes.

La deuxième règle concerne le sucre. Nous mangeons aujourd'hui beaucoup trop de sucre, souvent sans le savoir : dans les sodas, les gâteaux, mais aussi dans des produits qui n'ont pas un goût sucré. Le sucre donne une énergie rapide, puis une grosse fatigue une heure plus tard. Mieux vaut l'éviter et boire de l'eau.

La troisième règle est peut-être la plus importante : cuisiner soi-même. Quand on prépare son repas, on sait ce qu'on mange. Pas besoin d'être un grand chef : une soupe, une salade, un plat de pâtes avec des légumes, c'est simple et équilibré.

Manger sainement ne veut pas dire se priver de tout. On peut se faire plaisir de temps en temps. L'important, c'est l'habitude de tous les jours. Le corps, comme une voiture, fonctionne mieux avec un bon carburant.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-048",
    title: "Bouger un peu chaque jour",
    category: "sport",
    difficulty: "B1",
    minutes: 3,
    preview: "Bouger un peu chaque jour fait déjà beaucoup de bien.",
    blurbEn:
      "You don't need a gym or a marathon. Twenty minutes of walking a day is enough to keep the body — and the mood — in good shape. (Section: Everyday health, 3/5.)",
    body: `Pour rester en bonne santé, il faut bouger. Mais attention : cela ne veut pas dire courir un marathon ni passer des heures dans une salle de sport. Bouger un peu chaque jour suffit déjà à faire beaucoup de bien au corps.

Le problème de la vie moderne, c'est qu'on reste assis toute la journée : assis au travail, assis dans la voiture, assis devant la télévision. Or le corps humain n'est pas fait pour l'immobilité. Sans exercice, les muscles s'affaiblissent et l'énergie diminue.

La bonne nouvelle, c'est qu'un petit effort régulier vaut mieux qu'un gros effort de temps en temps. Marcher vingt minutes par jour, prendre les escaliers au lieu de l'ascenseur, descendre du bus un arrêt plus tôt : ces petites habitudes font une vraie différence. Le cœur travaille, les muscles se réveillent, et on se sent plus en forme.

Bouger n'est pas seulement bon pour le corps ; c'est aussi bon pour le moral. Après une marche, même courte, on se sent souvent plus calme et de meilleure humeur. La fatigue mentale de la journée diminue.

Le secret, c'est de choisir une activité qu'on aime : marcher, danser, faire du vélo, jardiner. Quand une activité est un plaisir, on la répète sans effort. Et c'est la régularité, plus que l'intensité, qui garde le corps en bonne santé toute la vie.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-049",
    title: "Gérer le stress",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Trop de stress, trop longtemps, fatigue le corps et l'esprit.",
    blurbEn:
      "Stress is part of modern life, but too much of it wears the body down. Simple ways to let off pressure — breathe, pause, and protect your sleep. (Section: Everyday health, 4/5.)",
    body: `Le stress fait partie de la vie moderne. Le travail, l'argent, la famille, les nouvelles du monde : les raisons de se sentir sous pression ne manquent pas. Un peu de stress est normal, et même utile. Mais trop de stress, pendant trop longtemps, fatigue le corps et l'esprit.

Quand on est stressé, le corps réagit : le cœur bat plus vite, les muscles se tendent, on dort mal. On devient irritable et on a moins d'énergie. Si cet état dure, il peut nuire à la santé. Il est donc important d'apprendre à gérer le stress.

La première chose à faire est simple : respirer. Quand on se sent submergé, quelques respirations lentes et profondes calment déjà le corps. Fermer les yeux, inspirer doucement, souffler lentement : cela ne coûte rien et cela aide vraiment.

Il faut aussi savoir faire des pauses. On croit souvent qu'il faut travailler sans s'arrêter pour être efficace. C'est faux. Une courte pause pour marcher, boire un thé ou regarder par la fenêtre permet à l'esprit de souffler et de se détendre.

Enfin, le stress et le sommeil sont liés. Une personne fatiguée supporte moins bien la pression. Protéger ses nuits, c'est donc aussi protéger son calme.

On ne peut pas supprimer tout le stress de sa vie. Mais on peut apprendre à mieux vivre avec, en écoutant son corps et en s'accordant, chaque jour, quelques vrais moments de calme.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-050",
    title: "Chez le médecin",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Consulter à temps fait partie du soin qu'on doit à son corps.",
    blurbEn:
      "Nobody enjoys the waiting room, but seeing a doctor early is part of taking care of yourself. What to expect, and why prevention beats cure. (Section: Everyday health, 5/5.)",
    body: `Personne n'aime aller chez le médecin. La salle d'attente, les questions, parfois la peur d'une mauvaise nouvelle : on préfère souvent attendre et espérer que ça passe tout seul. Pourtant, consulter à temps fait partie du soin qu'on doit à son corps.

En général, on prend rendez-vous quand quelque chose ne va pas : une douleur qui dure, une grande fatigue, des symptômes qu'on ne comprend pas. Le médecin pose des questions, examine le corps, et cherche à comprendre la cause du problème. Il faut être honnête et tout expliquer, même les détails qui semblent gênants.

Après l'examen, le médecin explique ce qu'on a et propose un traitement. Souvent, il donne une ordonnance : une liste de médicaments à acheter à la pharmacie. Il est important de bien suivre ses conseils et de prendre le traitement jusqu'au bout, même quand on se sent mieux, pour vraiment guérir.

Mais le rôle du médecin n'est pas seulement de soigner les malades. Il est aussi de les aider à rester en bonne santé. C'est ce qu'on appelle la prévention. Une visite régulière permet de repérer un problème avant qu'il devienne grave. « Mieux vaut prévenir que guérir », dit le proverbe, et c'est particulièrement vrai pour la santé.

Prendre soin de son corps, c'est donc aussi accepter de consulter, sans attendre le dernier moment. Le médecin n'est pas un ennemi : c'est un allié pour une vie plus longue et en meilleure santé.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-041",
    title: "Faire un budget",
    category: "everyday life",
    difficulty: "B2",
    minutes: 3,
    preview: "Faire un budget n'est pas une punition.",
    blurbEn:
      "A budget sounds joyless, but knowing where your money actually goes is the first step to being free of money worries. (Section: Money & everyday life, 1/5.)",
    body: `Le mot « budget » n'inspire pas l'enthousiasme. Il évoque des tableaux ennuyeux, des calculs et l'idée de se priver. Pourtant, faire un budget n'est pas une punition : c'est l'un des meilleurs moyens de vivre plus sereinement avec son argent.

Le principe est simple. Un budget, c'est une comparaison entre ce qui entre et ce qui sort : d'un côté les revenus, c'est-à-dire l'argent qu'on gagne ; de l'autre les dépenses, c'est-à-dire l'argent qu'on utilise. Tant qu'on ne fait pas ce calcul, on avance un peu à l'aveugle.

La première étape consiste à noter, pendant un mois, absolument toutes ses dépenses. L'exercice est souvent une surprise. On découvre que les grosses dépenses — le loyer, les factures — ne sont pas les seules à peser. Ce sont surtout les petites dépenses quotidiennes, additionnées, qui font disparaître l'argent : un café par-ci, un achat par-là, un abonnement oublié.

Une fois ces chiffres sous les yeux, on peut agir. Il ne s'agit pas de tout supprimer, mais de choisir. Sur quoi ai-je vraiment envie de dépenser ? Qu'est-ce qui ne m'apporte, au fond, aucun plaisir ? Gérer son argent, c'est décider soi-même plutôt que de subir la fin du mois.

Un bon budget prévoit aussi une part pour économiser, même petite. Mettre de côté un peu chaque mois, avant même de dépenser, change tout. Cette réserve permet de faire face à un imprévu — une machine qui casse, une facture surprise — sans paniquer ni s'endetter.

Il serait naïf de croire qu'un budget résout tous les problèmes : quand les revenus sont trop faibles, aucun tableau ne suffit. Mais pour la plupart des gens, le vrai problème n'est pas de gagner plus ; c'est de savoir où va l'argent. Et cette clarté, curieusement, ne rend pas la vie plus triste. Elle apporte quelque chose de précieux : la tranquillité d'esprit.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-042",
    title: "Économiser sans se priver",
    category: "everyday life",
    difficulty: "B2",
    minutes: 4,
    preview: "Les gens qui épargnent le mieux distinguent une envie d'un besoin.",
    blurbEn:
      "Saving money is usually pitched as sacrifice. But the biggest savings come from spotting the difference between a want and a need. (Section: Money & everyday life, 2/5.)",
    body: `On imagine souvent qu'économiser signifie se priver : renoncer aux plaisirs, compter chaque centime, mener une vie triste. C'est une erreur. Les personnes qui épargnent le plus efficacement ne sont pas forcément les plus radines ; ce sont celles qui savent distinguer une envie d'un besoin.

La différence paraît évidente, mais elle ne l'est pas dans la vie réelle. Un besoin, c'est ce qui est nécessaire : se loger, se nourrir, se déplacer. Une envie, c'est ce qui ferait plaisir sur le moment : le dernier téléphone, un vêtement de plus, un objet vu dans une publicité. Le problème, c'est que le marketing moderne travaille sans cesse à transformer nos envies en besoins. Il nous persuade que nous ne pouvons pas vivre sans ce que, hier encore, nous ignorions.

Résister à ce piège ne demande pas une volonté de fer, mais quelques habitudes simples. La plus efficace consiste à attendre. Devant une envie d'achat, on se donne quelques jours avant de décider. Bien souvent, l'envie disparaît d'elle-même : on avait confondu un désir passager avec un vrai besoin. L'argent économisé de cette façon ne représente aucun sacrifice, puisqu'on ne regrette pas ce qu'on n'a pas acheté.

Une autre clé est de se poser la bonne question. Non pas « est-ce que je peux me le permettre ? », mais « quelle valeur cet achat va-t-il vraiment m'apporter ? ». Certaines dépenses, même importantes, enrichissent la vie : un voyage, un livre, un repas partagé. D'autres, une fois l'excitation retombée, ne laissent qu'un objet de plus dans un placard.

Économiser intelligemment, ce n'est donc pas dire non à tout. C'est dire oui à ce qui compte, et non à ce qui ne compte pas. Vu ainsi, l'épargne cesse d'être une privation pour devenir une forme de liberté : celle de ne plus dépenser par réflexe, et de garder son argent pour ce qui a, pour nous, une vraie valeur.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-043",
    title: "Le piège du crédit",
    category: "everyday life",
    difficulty: "B2",
    minutes: 4,
    preview: "« Achetez maintenant, payez plus tard. »",
    blurbEn:
      "'Buy now, pay later' makes everything feel affordable — until the monthly payments pile up. Why easy credit so often costs more than it seems. (Section: Money & everyday life, 3/5.)",
    body: `« Achetez maintenant, payez plus tard. » Cette promesse est partout : dans les magasins, sur internet, à la fin de nos achats en ligne. Le crédit à la consommation a rendu presque tout accessible immédiatement, sans attendre d'avoir économisé. C'est pratique, parfois utile, mais c'est aussi un piège dans lequel beaucoup de gens tombent.

Le principe du crédit est simple : une banque ou un magasin vous prête de l'argent pour un achat, et vous le remboursez petit à petit, chaque mois. Le problème, c'est que cet argent n'est pas gratuit. En échange du prêt, il faut payer des intérêts. Autrement dit, l'objet acheté à crédit finit par coûter plus cher — parfois beaucoup plus cher — que son prix affiché.

Le danger vient de la facilité. Comme on ne paie pas tout de suite, on a l'impression que la dépense est petite : « seulement trente euros par mois ». Mais ces petites mensualités s'accumulent. On prend un crédit pour un canapé, un autre pour un téléphone, un autre pour des vacances, et bientôt une grande partie du salaire part chaque mois en remboursements. C'est ainsi que l'on s'endette sans même s'en rendre compte.

Le crédit n'est pas mauvais en soi. Emprunter peut avoir du sens pour un projet important et durable, comme un logement, ou en cas de nécessité réelle. Mais il faut toujours se poser la même question avant de signer : est-ce que j'emprunte pour un vrai besoin, ou simplement parce que je n'ai pas la patience d'économiser ?

La règle la plus sage tient en une phrase : ne jamais s'endetter pour un plaisir passager. Le canapé sera vieux bien avant que la dette soit remboursée, et l'on continuera de payer un objet dont on ne profite même plus. Face à la publicité qui pousse à consommer tout de suite, la vieille habitude d'attendre et d'économiser reste, souvent, la plus rentable — et la plus tranquille.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-044",
    title: "Faut-il parler d'argent ?",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "L'argent est le dernier grand tabou.",
    blurbEn:
      "In many cultures money is the last taboo — we'll discuss anything but our salary. Yet the silence around money may do more harm than talking would. (Section: Money & everyday life, 4/5.)",
    body: `Il existe un sujet dont on parle moins volontiers que de politique, de religion ou même de sa vie intime : l'argent. Demander à quelqu'un combien il gagne passe, dans beaucoup de cultures, pour une grossièreté. L'argent est le dernier grand tabou. Mais ce silence est-il vraiment une bonne chose ?

Les raisons de cette gêne sont anciennes et profondes. Parler de son salaire, c'est risquer d'être jugé : trop riche, on paraît prétentieux ; trop pauvre, on a honte. C'est aussi s'exposer à la comparaison, ce poison discret qui transforme le voisin en rival. Alors, par prudence, on préfère se taire, et cette discrétion se transmet de génération en génération comme une règle de bonne éducation.

Pourtant, ce tabou a un coût, et il ne profite pas toujours à ceux qui se taisent. Dans le monde du travail, par exemple, le silence sur les salaires arrange surtout les employeurs : quand personne ne sait ce que gagnent les autres, il est plus difficile de remarquer une injustice ou de négocier. La transparence, à l'inverse, permet de comparer et, parfois, de corriger des différences qui n'ont aucune raison d'exister.

Le silence pèse aussi dans la vie privée. Combien de couples évitent le sujet jusqu'au jour où une dette cachée ou des dépenses secrètes provoquent une vraie crise ? Combien de familles se déchirent, à la mort d'un proche, faute d'avoir jamais abordé calmement ces questions ? Ne pas parler d'argent ne fait pas disparaître les problèmes d'argent ; cela les laisse simplement grandir dans l'ombre.

Il ne s'agit pas, bien sûr, d'afficher son compte en banque à la première rencontre. Mais il serait sain de pouvoir parler d'argent plus librement avec ceux qui comptent : sa famille, son partenaire, ses collègues proches. Aborder le sujet avec honnêteté demande un peu de courage et beaucoup de confiance. En retour, cela évite bien des malentendus, et souvent bien des injustices. Le vrai tabou, au fond, n'est peut-être pas l'argent lui-même, mais la peur de ce qu'il révèle de nous.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-045",
    title: "L'argent et le temps",
    category: "culture",
    difficulty: "B2",
    minutes: 4,
    preview: "L'argent, bien utilisé, permet de racheter du temps.",
    blurbEn:
      "We spend our lives trading time for money — but the wisest spending often does the reverse, buying time back. A reflection on the truest cost of everything. (Section: Money & everyday life, 5/5.)",
    body: `Nous passons une grande partie de notre vie à échanger du temps contre de l'argent : c'est, au fond, la définition même du travail. Nous vendons nos heures, nos journées, nos années, en échange d'un salaire. Mais nous oublions souvent que cet échange peut aussi fonctionner dans l'autre sens : l'argent, bien utilisé, permet de racheter du temps. Et c'est peut-être là son plus grand pouvoir.

Réfléchissons à ce que nous achetons réellement quand nous dépensons. Un objet, souvent ; mais parfois autre chose de bien plus précieux. Payer quelqu'un pour faire le ménage, prendre un train plus cher mais plus rapide, acheter un plat déjà préparé un soir de fatigue : dans tous ces cas, on ne paie pas vraiment pour une chose, on paie pour du temps et de l'énergie rendus. Les recherches sur le bonheur le confirment : dépenser son argent pour gagner du temps rend, en moyenne, plus heureux que dépenser la même somme en objets.

Pourtant, nous faisons rarement ce calcul. Nous acceptons de longs trajets pour économiser quelques euros, nous passons des heures à réparer nous-mêmes ce qu'un professionnel ferait en un instant, par principe ou par habitude. Nous traitons notre argent avec attention et notre temps avec négligence — alors que le temps, lui, ne se rembourse jamais. On peut toujours regagner de l'argent perdu ; une journée perdue est perdue pour toujours.

Cela ne signifie pas qu'il faille tout payer pour ne rien faire, ni que le temps libre soit toujours mieux employé que le travail. Réparer soi-même un objet peut être un plaisir ; la lenteur choisie a sa valeur. La vraie question n'est pas « quel est le prix ? », mais « qu'est-ce que cet argent m'achète en temps et en tranquillité, et ce temps, qu'en ferai-je ? ».

Apprendre à voir l'argent comme un moyen d'acheter du temps, et non seulement des choses, change la façon de le dépenser. On cesse de courir après le dernier objet à la mode pour se demander, plus simplement : de quoi ai-je besoin pour vivre les journées que je veux vivre ? À cette question, l'argent n'est plus un but, mais un outil — et le temps qu'il libère devient la vraie richesse.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-046",
    title: "Comprendre le réchauffement climatique",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Le mécanisme de base du climat est étonnamment simple.",
    blurbEn:
      "Behind the headlines and the arguments, the basic science of climate change is surprisingly simple. A calm, jargon-free explanation. (Section: The environment & you, 1/5.)",
    body: `Le réchauffement climatique est partout dans l'actualité, souvent au milieu de débats passionnés et de chiffres compliqués. Pourtant, le mécanisme de base est étonnamment simple, et le comprendre aide à dépasser les slogans. Essayons de l'expliquer calmement, sans jargon.

Tout part d'un phénomène naturel et, en réalité, indispensable : l'effet de serre. Autour de la Terre, l'atmosphère contient certains gaz qui retiennent une partie de la chaleur du soleil, comme une couverture. Sans eux, la planète serait glacée et la vie impossible. Le problème n'est donc pas l'effet de serre lui-même, mais son intensité.

Or, depuis deux siècles, l'activité humaine ajoute d'énormes quantités de ces gaz dans l'atmosphère. En brûlant du charbon, du pétrole et du gaz pour produire de l'énergie, nous rejetons des émissions de dioxyde de carbone. La couverture s'épaissit, retient davantage de chaleur, et la température moyenne de la planète augmente. C'est ce qu'on appelle le réchauffement climatique.

Une hausse de un ou deux degrés peut sembler minuscule ; après tout, la température change bien plus que cela entre le matin et l'après-midi. Mais il s'agit ici d'une moyenne mondiale, et à cette échelle, quelques degrés suffisent à tout déséquilibrer : fonte des glaces, montée du niveau des mers, sécheresses, tempêtes plus violentes. Le climat ne devient pas seulement « plus chaud » ; il devient plus instable.

Sur les causes, la communauté scientifique est aujourd'hui quasi unanime : ce réchauffement rapide est bien d'origine humaine. Le débat sérieux ne porte plus sur le « si », mais sur le « combien » et sur ce que nous décidons de faire.

Comprendre cela ne règle rien à soi seul, et peut même donner le vertige devant l'ampleur du problème. Mais c'est un point de départ nécessaire. On ne peut pas agir intelligemment face à une menace qu'on ne comprend pas. Et la bonne nouvelle, c'est que les mêmes activités qui ont causé le problème peuvent, transformées, faire partie de la solution.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-047",
    title: "La montagne de nos déchets",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Chaque habitant jette près d'une demi-tonne de déchets par an.",
    blurbEn:
      "Every European throws away nearly half a tonne of rubbish a year. Why recycling isn't enough, and why the best waste is the waste we never create. (Section: The environment & you, 2/5.)",
    body: `Chaque habitant d'un pays riche jette, en moyenne, près d'une demi-tonne de déchets par an. Mis bout à bout, ces déchets forment une montagne invisible que nous préférons ne pas regarder : une fois la poubelle sortie, le problème semble disparaître. Mais il ne disparaît pas ; il se déplace.

Où vont nos déchets ? Une partie est brûlée, ce qui produit à son tour des émissions. Une autre finit dans d'immenses décharges, où certains matériaux, comme le plastique, mettront des siècles à se décomposer. Une partie, enfin, est recyclée — mais beaucoup moins qu'on ne le croit. Trier ses déchets est un geste utile, et il faut continuer à le faire ; mais le recyclage a ses limites. Il coûte de l'énergie, et de nombreux objets ne peuvent tout simplement pas être recyclés.

C'est pourquoi les spécialistes rappellent une vérité inconfortable : le meilleur déchet est celui qu'on ne produit pas. Avant de recycler, il faudrait surtout réduire. Or notre mode de vie va dans le sens inverse. Nous consommons de plus en plus d'objets, souvent emballés plusieurs fois, souvent conçus pour être jetés rapidement. Le gaspillage n'est pas un accident du système ; il en fait partie.

Que peut-on faire, concrètement ? À l'échelle individuelle, quelques habitudes réduisent nettement nos déchets : refuser les emballages inutiles, acheter en vrac, réparer au lieu de remplacer, éviter les objets à usage unique. Ces gestes, seuls, ne sauveront pas la planète — il ne faut pas se raconter d'histoires. Mais ils changent notre regard, et ils envoient un signal.

Car le vrai levier est plus large. Ce sont les entreprises qui décident des emballages, et les gouvernements qui fixent les règles. Un citoyen qui réduit ses déchets est aussi un consommateur et un électeur qui pousse, à sa mesure, dans la bonne direction. La montagne de nos déchets n'est pas une fatalité : elle est le résultat de milliards de petites décisions, et ces décisions peuvent changer.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-048",
    title: "D'où vient notre énergie ?",
    category: "science",
    difficulty: "B2",
    minutes: 4,
    preview: "Toutes les sources d'énergie ne se valent pas.",
    blurbEn:
      "Flip a switch and light appears — but the electricity behind it may come from coal or from the sun, and the difference matters enormously. (Section: The environment & you, 3/5.)",
    body: `Nous utilisons de l'énergie à chaque instant, presque sans y penser : pour nous éclairer, nous chauffer, nous déplacer, faire fonctionner nos appareils. Il suffit d'appuyer sur un bouton. Mais derrière ce geste banal se cache une question essentielle, et rarement posée : d'où vient réellement cette énergie ? Car toutes les sources ne se valent pas, loin de là.

Depuis deux siècles, l'essentiel de notre énergie provient des énergies fossiles : le charbon, le pétrole et le gaz. Elles ont un immense avantage — elles sont puissantes et faciles à utiliser — mais un défaut majeur : en les brûlant, on rejette d'énormes émissions de gaz, principales responsables du réchauffement climatique. De plus, ces ressources ne sont pas infinies ; un jour, elles s'épuiseront.

Face à ce double problème, les énergies renouvelables se développent. Comme leur nom l'indique, elles ne s'épuisent pas : le solaire capte la lumière du soleil, l'éolien utilise le vent, d'autres exploitent l'eau des rivières. Leur grand mérite est de produire de l'énergie sans presque polluer. Leurs limites sont réelles aussi : le soleil ne brille pas la nuit, le vent ne souffle pas toujours, et il faut donc apprendre à stocker cette énergie et à équilibrer le réseau.

La transition d'un modèle à l'autre est l'un des plus grands défis de notre époque. Elle est compliquée, coûteuse, et personne ne prétend qu'elle sera simple. Changer la façon dont un pays entier produit son énergie ne se fait pas en quelques années.

Cette question dépasse largement nos gestes individuels : éteindre une lumière est une bonne habitude, mais l'essentiel se joue à l'échelle des pays et des entreprises, dans les choix qu'ils font aujourd'hui. Pourtant, comprendre d'où vient notre énergie n'est pas inutile. Un citoyen informé fait de meilleurs choix, soutient de meilleures décisions, et cesse de croire que l'électricité vient, comme par magie, de la prise au mur. Derrière chaque interrupteur, il y a un choix de société.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-049",
    title: "Consommer autrement",
    category: "everyday life",
    difficulty: "B2",
    minutes: 4,
    preview: "Le meilleur produit est souvent celui qu'on possède déjà.",
    blurbEn:
      "The greenest product is often the one you already own. Beyond recycling lies a bigger shift: buying less and choosing better. (Section: The environment & you, 4/5.)",
    body: `Quand on pense à protéger l'environnement, on imagine souvent le tri des déchets ou les énergies renouvelables. On oublie une cause plus discrète, mais essentielle : la façon dont nous consommons. Car chaque objet que nous achetons a demandé, pour être fabriqué, de l'énergie, de l'eau et des matières premières, bien avant d'arriver entre nos mains. Réduire notre consommation est donc l'un des gestes les plus efficaces — et l'un des plus difficiles.

Le problème porte un nom : la surconsommation. Nous achetons plus que jamais, et souvent des objets conçus pour ne pas durer. Un vêtement porté trois fois puis oublié, un appareil qui tombe en panne juste après la garantie et qu'on ne peut pas réparer, un téléphone remplacé alors que l'ancien fonctionnait encore : ce modèle du « jetable » est devenu normal. Il enrichit l'industrie, mais il épuise la planète et remplit nos décharges.

Consommer autrement ne veut pas dire ne plus rien acheter, ce qui serait irréaliste. Cela veut dire acheter mieux, et moins. Quelques principes simples suffisent à changer les choses. D'abord, se demander si l'on a vraiment besoin de l'objet avant de l'acheter. Ensuite, privilégier la qualité : un objet solide et réparable coûte plus cher au départ, mais dure des années, et revient donc moins cher — pour nous comme pour l'environnement. Enfin, redécouvrir la seconde main : acheter d'occasion, c'est offrir une deuxième vie à un objet qui existe déjà, sans en fabriquer un nouveau.

Ce changement se heurte pourtant à une force puissante : le marketing, qui travaille sans relâche à nous faire désirer du neuf. La mode elle-même repose sur cette logique : ce qui était parfait l'an dernier devient soudain « dépassé ». Résister à cette pression demande une certaine liberté d'esprit — celle de ne pas laisser la publicité décider de nos besoins.

Consommer de façon plus responsable n'est pas un sacrifice, et ce n'est pas non plus la solution unique au problème écologique. Mais c'est un choix qui a du sens, et qui a un avantage inattendu : il allège aussi nos vies. Moins d'objets, c'est moins de désordre, moins de dépenses, moins de choses à ranger et à entretenir. En prenant soin de la planète, on finit souvent par prendre soin de soi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b2-050",
    title: "Un seul geste suffit-il ?",
    category: "everyday life",
    difficulty: "B2",
    minutes: 4,
    preview: "Nos efforts individuels sont-ils dérisoires ?",
    blurbEn:
      "Do our small green gestures matter, or are they a comforting distraction from the real, collective decisions? A hard, honest question. (Section: The environment & you, 5/5.)",
    body: `Trier ses déchets, éteindre la lumière en quittant une pièce, prendre le vélo plutôt que la voiture : on nous répète que chaque petit geste compte pour la planète. Mais est-ce vraiment vrai ? Face à un problème aussi immense que le changement climatique, nos efforts individuels ne sont-ils pas dérisoires ? La question est inconfortable, et elle mérite mieux qu'une réponse simple.

Commençons par l'objection, car elle est sérieuse. Si l'on additionne toutes les émissions du monde, la part que chaque individu peut réduire par ses gestes quotidiens est minuscule. Pendant qu'une personne économise soigneusement l'eau, une seule usine, un seul vol en avion, une seule décision politique peuvent annuler en un instant les efforts de millions de gens. Pire : à force de se concentrer sur les petits gestes, on risque d'oublier l'essentiel. Certaines grandes entreprises encouragent d'ailleurs volontiers cette idée, car elle déplace la responsabilité vers le consommateur et les laisse tranquilles.

Faut-il en conclure que nos gestes ne servent à rien ? Ce serait aller trop vite, et ce serait dangereux. D'abord, parce que ces gestes ont une valeur qui n'est pas seulement mathématique. Celui qui change ses habitudes change aussi son regard : il devient plus attentif, plus cohérent, plus difficile à convaincre que « rien ne peut être fait ». Ensuite, parce que les comportements se transmettent. Une habitude, quand elle se répand, finit par changer les normes de toute une société, puis les décisions de ceux qui nous gouvernent.

Le vrai piège serait de choisir entre les deux. Opposer l'action individuelle et l'action collective est une fausse alternative, et une alternative qui paralyse : ceux qui attendent tout des gouvernements ne font rien eux-mêmes, et ceux qui misent tout sur les petits gestes se découragent en découvrant leurs limites. Or les deux se nourrissent l'un l'autre. Un citoyen qui agit dans sa vie est aussi celui qui vote, qui parle autour de lui, qui pousse les entreprises et les États à bouger.

Alors, un seul geste suffit-il ? Non, évidemment. Mais poser la question ainsi, c'est déjà se tromper. Le geste individuel n'a jamais eu vocation à suffire ; il est un point de départ, pas une fin. Il compte non pas parce qu'il sauve la planète à lui seul, mais parce qu'il nous garde en mouvement, et parce que rien de grand, à l'échelle collective, n'a jamais commencé sans que des individus, un jour, décident d'agir.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-039",
    title: "Le réveil de Julien",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le réveil sonne à six heures et demie. Julien ouvre les yeux.",
    blurbEn:
      "Julien's morning, minute by minute: the alarm, the shower, coffee, and the race to catch the 7:40 bus. (Section: My day, 1/5.)",
    body: `Le réveil sonne à six heures et demie. Julien ouvre les yeux. Il est fatigué. « Encore cinq minutes », pense-t-il.

À six heures trente-cinq, il se lève enfin. Il va dans la salle de bains. Il se lave et il se brosse les dents. L'eau est chaude. C'est agréable.

Ensuite, il s'habille. Aujourd'hui, il porte un pantalon noir et une chemise bleue. Il travaille dans un bureau, alors il ne met pas de jean.

À sept heures, Julien prend son petit déjeuner. Il boit un café et il mange deux tartines. Il écoute la radio. Le journaliste parle du temps : il va pleuvoir cet après-midi.

À sept heures et quart, Julien prépare son sac. Son ordinateur, ses clés, son téléphone. Il prend aussi un parapluie.

À sept heures et demie, il regarde l'heure. « Oh non, je suis en retard ! » Il met son manteau très vite.

Julien sort de l'appartement à sept heures trente-cinq. Il court dans la rue. Le bus part à sept heures quarante.

Il arrive à l'arrêt. Le bus est là ! Julien monte dans le bus. Il est content.

Sa journée commence.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-040",
    title: "Julien au bureau",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Julien arrive au bureau à huit heures.",
    blurbEn:
      "The middle of Julien's day: emails, a colleague's questions, lunch in the park and a coffee that keeps him going. (Section: My day, 2/5.)",
    body: `Julien arrive au bureau à huit heures. Il dit bonjour à ses collègues. « Bonjour Julien ! » répond Sophie.

Il allume son ordinateur et il commence à travailler. Le matin, il lit ses messages. Il y a vingt-trois messages ! C'est beaucoup.

À dix heures, Julien fait une pause. Il boit un café avec Sophie. Ils parlent du week-end. Sophie va à la mer avec sa famille.

Ensuite, Julien travaille encore. Il téléphone à un client. Il écrit un document. Le temps passe vite.

À midi et demi, c'est l'heure du déjeuner. Aujourd'hui, il ne mange pas au restaurant. Il apporte un sandwich et une pomme.

Il fait beau, alors Julien mange dans le petit parc à côté du bureau. Il regarde les gens qui passent. Il y a des enfants qui jouent. C'est calme.

À une heure et demie, il retourne au bureau. L'après-midi est plus difficile. Julien est un peu fatigué. Il boit un autre café.

À cinq heures et demie, il éteint son ordinateur. « Bonne soirée ! » dit Sophie.

« Bonne soirée ! » répond Julien.

Il prend le bus et il rentre à la maison.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-041",
    title: "Le soir chez Julien",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Julien rentre à la maison à six heures et quart.",
    blurbEn:
      "Evening at home: cooking pasta, a phone call from his mother, a film, and a book that puts him to sleep. (Section: My day, 3/5.)",
    body: `Julien rentre à la maison à six heures et quart. Il enlève son manteau et ses chaussures. Enfin !

D'abord, il prend une douche. L'eau chaude est très agréable après la journée de travail. Après, il met un jean et un pull confortable.

À sept heures, Julien prépare le dîner. Ce soir, il fait des pâtes avec des tomates. Ce n'est pas compliqué, mais c'est bon. Il écoute de la musique dans la cuisine.

Il mange à sept heures et demie. Il mange seul, mais ce n'est pas triste. Il aime ce moment calme.

Après le dîner, il fait la vaisselle. Puis son téléphone sonne : c'est sa mère.

« Ça va, mon chéri ? Tu manges bien ? »

« Oui maman, ça va très bien. »

Ils parlent pendant vingt minutes.

À neuf heures, Julien regarde un film à la télévision. C'est un film policier. Mais il est fatigué et il ne comprend pas la fin.

À dix heures et demie, il va dans sa chambre. Il lit trois pages de son livre. Ses yeux se ferment.

À onze heures, Julien dort. Demain, le réveil sonne encore à six heures et demie.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-042",
    title: "Le samedi de Julien",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le samedi, Julien ne met pas de réveil.",
    blurbEn:
      "Saturday is the opposite of a weekday: no alarm, a slow breakfast, the market, football, and friends in the evening. (Section: My day, 4/5.)",
    body: `Le samedi, Julien ne met pas de réveil. Il ouvre les yeux à neuf heures. Personne ne l'attend. Quel bonheur !

Il reste au lit dix minutes. Il regarde son téléphone. Puis il se lève doucement.

Le samedi, le petit déjeuner est différent. Julien ne mange pas seulement deux tartines. Il prépare des œufs et il boit un grand café. Il ne regarde pas l'heure.

Vers onze heures, il va au marché. Il achète des légumes, du fromage et du pain. Le marché est plein de monde. Julien parle avec le vendeur de fruits. C'est un moment agréable.

L'après-midi, Julien joue au football avec ses amis dans le parc. Il court beaucoup. Son équipe perd trois à deux, mais ce n'est pas grave.

Après le match, il rentre à la maison. Il prend une douche et il se repose sur le canapé.

Le soir, ses amis viennent chez lui. Ils mangent une pizza et ils regardent un film. Ils rient beaucoup.

À minuit, ses amis partent. Julien est fatigué, mais content.

Demain, c'est dimanche. Il ne travaille pas non plus.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-043",
    title: "Un lundi difficile",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Ce matin, Julien n'entend pas son réveil.",
    blurbEn:
      "Everything goes wrong on Monday: a silent alarm, no hot water, a missed bus — and one small kindness that saves the day. (Section: My day, 5/5.)",
    body: `Ce matin, il y a un problème. Julien n'entend pas son réveil. Il ouvre les yeux et il regarde l'heure : sept heures vingt !

Il se lève très vite. Pas de douche aujourd'hui, il n'a pas le temps. Il ouvre l'eau : elle est froide ! L'eau chaude ne marche pas.

Julien s'habille en deux minutes. Il ne prend pas de petit déjeuner. Il n'a pas le temps pour un café.

Il cherche ses clés. Où sont-elles ? Pas sur la table, pas dans le sac. Enfin, il les trouve : elles sont dans son manteau.

Julien sort de l'appartement. Il court dans la rue. Mais quand il arrive à l'arrêt, le bus part. « Non ! » crie Julien.

Il attend le bus suivant pendant quinze minutes. Il pleut un peu. Et bien sûr, aujourd'hui, il n'a pas son parapluie.

Julien arrive au bureau à neuf heures moins le quart. Il est en retard.

Mais Sophie sourit et lui donne un café chaud. « Tu as l'air fatigué », dit-elle.

Julien boit son café. Il est encore mouillé, mais il se sent mieux.

Ce soir, il va acheter un nouveau réveil.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-044",
    title: "Le déjeuner du dimanche",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le dimanche, toute la famille mange ensemble.",
    blurbEn:
      "The big Sunday family lunch: chicken, potatoes, cheese and cake — and a table that stays busy for hours. (Section: At the table, 1/5.)",
    body: `Le dimanche, toute la famille mange ensemble. C'est une tradition. Nous sommes huit personnes à table.

Ma mère prépare le déjeuner. Aujourd'hui, elle fait un poulet avec des pommes de terre. Ça sent très bon dans la maison. J'ai faim !

À une heure, nous nous asseyons à table. Mon père ouvre une bouteille d'eau et une bouteille de vin. « Bon appétit ! » dit-il.

D'abord, nous mangeons une salade de tomates. Ensuite, il y a le poulet. C'est délicieux. Ma grand-mère mange lentement. Mon petit frère mange très vite.

« Encore un peu de poulet ? » demande ma mère.

« Oui, s'il te plaît », je réponds. « C'est très bon. »

Après le plat, il y a du fromage. En France, le fromage arrive avant le dessert. Mon père adore le camembert.

Enfin, il y a le dessert : un gâteau au chocolat. Tout le monde est content.

Nous parlons beaucoup à table. Nous parlons de la semaine, du travail, de l'école.

À quatre heures, nous sommes encore là. Le repas est fini, mais nous restons ensemble.

C'est ça, le dimanche.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-045",
    title: "Je prépare une soupe",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Ce soir, il fait froid. Je prépare une soupe.",
    blurbEn:
      "A simple soup, step by step: carrots, potatoes, an onion, water and patience — plus bread and cheese. (Section: At the table, 2/5.)",
    body: `Ce soir, il fait froid et il pleut. J'ai envie d'une chose chaude. Je prépare une soupe de légumes.

C'est très facile. Je prends trois carottes, deux pommes de terre et un oignon. J'ai aussi du sel, du poivre et un peu de beurre.

D'abord, je lave les légumes. Ensuite, je coupe les carottes et les pommes de terre en petits morceaux. Attention au couteau ! Il est très coupant.

Je coupe aussi l'oignon. Mes yeux pleurent un peu. C'est normal, l'oignon fait toujours ça.

Je mets le beurre dans une grande casserole. Puis j'ajoute l'oignon. Ça fait un bruit agréable.

Après deux minutes, j'ajoute les carottes et les pommes de terre. Je mets de l'eau, du sel et du poivre.

Maintenant, il faut attendre. La soupe cuit pendant trente minutes. Pendant ce temps, je lis un livre dans le salon.

À sept heures et demie, la soupe est prête. La cuisine sent très bon.

Je mange ma soupe avec du pain et du fromage. C'est simple, mais c'est parfait pour un soir de pluie.

Demain, il reste de la soupe pour le déjeuner.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-046",
    title: "Le goûter à quatre heures",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "En France, les enfants mangent à quatre heures.",
    blurbEn:
      "In France children eat at four o'clock — the 'goûter'. Bread and chocolate, and a small daily ritual after school. (Section: At the table, 3/5.)",
    body: `En France, il y a un repas spécial pour les enfants : le goûter. C'est à quatre heures de l'après-midi, après l'école.

Le déjeuner est à midi et le dîner est à huit heures. C'est long ! Alors, à quatre heures, les enfants ont faim.

Ma fille Camille rentre de l'école à quatre heures et quart. Elle pose son sac et elle dit toujours la même phrase : « Maman, j'ai faim ! »

Le goûter n'est pas un grand repas. C'est quelque chose de simple. Aujourd'hui, Camille mange du pain avec du chocolat. C'est son goûter préféré.

Elle boit aussi un verre de lait. Parfois, elle prend un yaourt ou un fruit.

Pendant le goûter, Camille me raconte sa journée. Elle parle de son maître, de ses amis, du sport. Ce moment est important pour nous deux.

Après le goûter, elle fait ses devoirs. Elle a plus d'énergie pour travailler.

Le goûter, ce n'est pas seulement de la nourriture. C'est un moment ensemble, chaque jour, à la même heure.

Et le soir, Camille a encore faim pour le dîner !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-047",
    title: "Au restaurant pour un anniversaire",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "C'est l'anniversaire de ma sœur. Nous allons au restaurant.",
    blurbEn:
      "A birthday dinner out: reading the menu, ordering, and a dessert with a candle that surprises the birthday girl. (Section: At the table, 4/5.)",
    body: `Aujourd'hui, c'est l'anniversaire de ma sœur Alice. Elle a trente ans. Pour la fête, nous allons au restaurant.

Le restaurant s'appelle « Le Petit Jardin ». Nous sommes six : Alice, ses parents, son mari, son amie Léa et moi.

Le serveur nous donne le menu. Je lis le menu attentivement. Il y a beaucoup de choix ! Poisson, viande, légumes...

« Vous avez choisi ? » demande le serveur.

Alice prend un poisson avec du riz. Son mari prend une viande. Moi, je prends des pâtes aux champignons.

Nous attendons vingt minutes. Nous parlons et nous rions.

Les plats arrivent. Mes pâtes sont chaudes et délicieuses. Alice goûte mon plat. « C'est très bon ! » dit-elle.

Après le plat, le serveur arrive avec un dessert. Il y a une bougie dessus ! Alice ne comprend pas.

Tout le restaurant chante « Joyeux anniversaire ». Alice est rouge, mais elle sourit beaucoup.

Elle souffle la bougie et elle ferme les yeux. Elle fait un vœu.

« Qu'est-ce que tu demandes ? » je demande.

« Je ne peux pas le dire ! » répond Alice.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-048",
    title: "Qu'est-ce qu'il y a dans le frigo ?",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Il est sept heures. J'ouvre le frigo. Il est presque vide.",
    blurbEn:
      "Seven o'clock, an almost-empty fridge, and no wish to go out: how three sad ingredients become a good omelette. (Section: At the table, 5/5.)",
    body: `Il est sept heures du soir. J'ai faim. J'ouvre le frigo et je regarde.

Le frigo est presque vide. Ce n'est pas bon.

Qu'est-ce qu'il y a ? Il y a trois œufs. Il y a un morceau de fromage. Il y a aussi une tomate, mais elle n'est pas très belle.

Dans le placard, il y a du pain d'hier. Il est un peu dur.

Je n'ai pas envie de sortir. Il fait froid et il est tard. Le supermarché ferme à huit heures.

Alors, je réfléchis. Trois œufs, du fromage, une tomate... Je peux faire une omelette !

Je casse les œufs dans un bol. J'ajoute du sel et du poivre. Je coupe le fromage en petits morceaux. Je coupe aussi la tomate.

Je mets un peu de beurre dans la poêle. Puis j'ajoute les œufs. Ça cuit vite, en trois minutes.

Le fromage fond. Ça sent très bon !

Je mets mon omelette dans une assiette. Je mange avec le pain dur.

C'est simple, mais c'est vraiment bon. Et je n'ai rien jeté.

Demain, je vais au supermarché. Promis !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-049",
    title: "Mon quartier",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "J'habite dans un petit quartier, près du centre.",
    blurbEn:
      "A tour of the narrator's neighbourhood: the square, the bakery, the pharmacy, the school and the park at the end of the street. (Section: My town, 1/5.)",
    body: `J'habite dans un petit quartier, près du centre-ville. J'aime beaucoup mon quartier.

Ma rue s'appelle la rue des Fleurs. Elle n'est pas très grande. Il y a des arbres et des voitures garées.

Au bout de ma rue, il y a une place. Sur la place, il y a une fontaine et quelques bancs. Le mercredi, il y a un marché.

À côté de la place, il y a une boulangerie. Le pain est excellent. En face de la boulangerie, il y a une pharmacie verte.

Il y a aussi un petit café. Les gens boivent un café le matin et lisent le journal.

L'école est à deux minutes de chez moi. À huit heures et demie, il y a beaucoup d'enfants dans la rue. C'est bruyant, mais c'est joyeux.

Derrière l'école, il y a un parc. Le parc n'est pas grand, mais il est joli. Il y a de l'herbe, des arbres et un endroit pour les enfants.

Le dimanche matin, je marche dans le parc. Je rencontre souvent mes voisins.

Mon quartier n'est pas célèbre. Mais ici, tout le monde se dit bonjour.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-050",
    title: "La boulangerie de ma rue",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Chaque matin, je vais à la boulangerie.",
    blurbEn:
      "Every morning at the bakery: warm bread, croissants on Sunday, and a baker who knows exactly what you want. (Section: My town, 2/5.)",
    body: `Chaque matin, je vais à la boulangerie de ma rue. Elle ouvre à sept heures.

Quand j'ouvre la porte, ça sent très bon. C'est l'odeur du pain chaud. J'adore cette odeur.

Derrière le comptoir, il y a madame Bernard. Elle travaille ici depuis vingt ans. Elle connaît tous les clients.

« Bonjour ! Comme d'habitude ? » demande-t-elle.

« Oui, une baguette s'il vous plaît. »

Elle prend une baguette. Le pain est encore chaud. Ça coûte un euro dix.

Dans la boulangerie, il y a beaucoup de choses. Il y a des baguettes, du pain complet, et aussi des gâteaux. Les tartes aux fruits sont très jolies.

Le dimanche, c'est différent. J'achète des croissants pour toute la famille. Il y a souvent une queue : cinq ou six personnes attendent.

Les gens parlent dans la queue. Ils parlent du temps, du quartier, des enfants.

Sur le chemin de la maison, je mange toujours un petit morceau de ma baguette. Le bout du pain, c'est le meilleur.

Ma mère dit : « Encore ! Tu manges toujours le pain avant la maison ! »

C'est vrai. Mais c'est trop bon.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-051",
    title: "Où est la pharmacie ?",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Une dame me demande son chemin dans la rue.",
    blurbEn:
      "A stranger asks for directions to the pharmacy — left, right, straight on — and the narrator discovers she's a new neighbour. (Section: My town, 3/5.)",
    body: `Je marche dans la rue. Une dame arrive vers moi. Elle a l'air perdue.

« Excusez-moi, monsieur. Où est la pharmacie, s'il vous plaît ? »

« La pharmacie ? Ce n'est pas loin. »

Je réfléchis un moment. Comment expliquer ?

« Vous continuez tout droit dans cette rue. Vous passez devant la boulangerie. »

« D'accord », dit la dame.

« Ensuite, vous tournez à gauche. C'est la rue Victor Hugo. »

« À gauche à la boulangerie », répète la dame.

« Non, après la boulangerie. Vous marchez encore cinquante mètres, puis vous tournez à gauche. »

« Ah, d'accord ! »

« La pharmacie est à droite, en face de la banque. Il y a une grande croix verte. Vous ne pouvez pas la manquer. »

« Merci beaucoup, monsieur ! C'est loin ? »

« Non, cinq minutes à pied. »

La dame sourit. « Merci ! J'habite ici depuis une semaine seulement. Je ne connais pas encore le quartier. »

« Bienvenue dans le quartier ! » je réponds.

Elle part vers la boulangerie. Puis elle se retourne.

« À gauche après la boulangerie, c'est ça ? »

« C'est ça ! » je crie.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-052",
    title: "La bibliothèque de la ville",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "La bibliothèque est un endroit calme et gratuit.",
    blurbEn:
      "The town library: free books, a warm reading room, story hour for children, and a card that costs nothing. (Section: My town, 4/5.)",
    body: `Dans ma ville, il y a une bibliothèque. Elle est près de la mairie, dans un grand bâtiment ancien.

J'aime beaucoup cet endroit. C'est calme et c'est gratuit.

À l'intérieur, il y a des milliers de livres. Il y a des romans, des livres d'histoire, des livres pour les enfants. Il y a aussi des journaux et des magazines.

Pour emprunter un livre, il faut une carte. Ma carte est gratuite parce que j'habite dans la ville. Je peux prendre cinq livres pendant trois semaines.

La bibliothécaire s'appelle madame Rossi. Elle est très gentille. Quand je ne sais pas quoi lire, elle me donne des idées.

« Vous aimez les romans policiers ? » demande-t-elle. « Alors, essayez celui-ci. »

Elle a toujours raison.

Il y a aussi une grande salle de lecture. Il y a des tables et des chaises confortables. Des étudiants travaillent. Des personnes âgées lisent le journal. Tout le monde parle doucement.

Le mercredi après-midi, la bibliothèque est différente. Il y a l'heure du conte pour les enfants. Ils écoutent des histoires, assis par terre.

En hiver, la bibliothèque est pleine. Il fait chaud ici, et les livres ne coûtent rien.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-053",
    title: "Le marché du mercredi",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Le mercredi matin, la place devient un marché.",
    blurbEn:
      "Wednesday morning transforms the square into a market: vegetables, cheese, a chicken seller who shouts, and neighbours who stop to talk. (Section: My town, 5/5.)",
    body: `Le mercredi matin, la place de mon quartier change complètement. Il n'y a plus de voitures. À la place, il y a le marché.

Les vendeurs arrivent très tôt, à six heures. Ils installent leurs tables sous de grands parasols blancs.

À neuf heures, il y a beaucoup de monde. Les gens marchent lentement entre les tables. Ils regardent, ils touchent, ils demandent les prix.

Il y a de tout. Des légumes, des fruits, du fromage, du poisson, des fleurs. Les couleurs sont magnifiques : les tomates rouges, les carottes oranges, les salades vertes.

Un vendeur crie très fort : « Trois euros les poulets ! Regardez mes beaux poulets ! » Tout le monde l'entend.

Ma voisine, madame Lopez, achète toujours ses légumes chez le même vendeur. « Bonjour Antoine ! Ça va ? » « Ça va, madame Lopez ! Comme d'habitude ? »

Le marché n'est pas seulement pour acheter. C'est aussi pour parler. Je rencontre souvent des gens que je connais. Nous parlons cinq ou dix minutes.

À une heure, c'est fini. Les vendeurs partent avec leurs tables.

À deux heures, la place est normale. Les voitures reviennent.

Et il faut attendre mercredi prochain.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-054",
    title: "Ma famille",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Nous sommes cinq dans ma famille.",
    blurbEn:
      "Meet the family: a father who talks a lot, a calm mother, a big sister, a little brother — and a grandmother next door. (Section: Family and friends, 1/5.)",
    body: `Nous sommes cinq dans ma famille : mon père, ma mère, ma sœur, mon frère et moi.

Mon père s'appelle Marc. Il a quarante-huit ans. Il est professeur de mathématiques. Il est grand et il porte des lunettes. Il parle beaucoup et il rit fort.

Ma mère s'appelle Nadia. Elle a quarante-cinq ans. Elle travaille dans un hôpital. Elle est plus calme que mon père. Quand il y a un problème, elle trouve toujours une solution.

Ma sœur Inès a dix-neuf ans. Elle est étudiante à Lyon. Elle n'habite plus à la maison, mais elle revient le week-end. Elle me manque un peu.

Mon frère Théo a huit ans. Il est petit et il a beaucoup d'énergie. Il pose mille questions par jour : « Pourquoi ? Comment ? Et après ? » Parfois, c'est fatigant.

Et moi ? J'ai quinze ans. Je suis au lycée.

Nous avons aussi un chat, Moustache. Il dort toute la journée.

Ma grand-mère habite dans la même rue, à deux minutes. Elle vient dîner le mardi et le vendredi.

Nous ne sommes pas une famille parfaite. Nous ne sommes pas toujours d'accord. Mais nous sommes ensemble.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-055",
    title: "Mon meilleur ami",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Mon meilleur ami s'appelle Yanis.",
    blurbEn:
      "Yanis and the narrator met at six and have been opposites ever since — which is exactly why the friendship works. (Section: Family and friends, 2/5.)",
    body: `Mon meilleur ami s'appelle Yanis. Nous nous connaissons depuis l'âge de six ans.

Nous sommes dans la même classe à l'école primaire. Le premier jour, il est assis à côté de moi. Il me donne un crayon rouge. Et voilà : nous sommes amis.

Yanis est très différent de moi. Il est grand, je suis petit. Il parle beaucoup, je suis timide. Il adore le football, je préfère les jeux vidéo.

Mais nous rions des mêmes choses. C'est peut-être ça, l'amitié.

Après l'école, nous allons souvent chez lui. Sa mère prépare toujours quelque chose à manger. Elle dit : « Tu es trop maigre ! Mange ! »

Le week-end, nous sortons ensemble. Nous marchons dans la ville, nous regardons les magasins, nous parlons de tout.

Yanis n'habite plus dans mon quartier. Sa famille déménage l'année dernière, à vingt minutes en bus. Au début, c'est difficile.

Mais nous nous téléphonons souvent. Et le samedi, il vient toujours.

Il y a des choses que je ne dis à personne. Sauf à Yanis.

C'est ça, un meilleur ami : quelqu'un qui connaît tout de toi, et qui reste.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-056",
    title: "Le bébé de ma cousine",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Ma cousine Sarah a un bébé depuis trois mois.",
    blurbEn:
      "Meeting baby Léo for the first time: tiny hands, no sleep for his parents, and a first smile that makes everyone go quiet. (Section: Family and friends, 3/5.)",
    body: `Ma cousine Sarah a un bébé. Il s'appelle Léo et il a trois mois.

Aujourd'hui, je vais chez elle pour le voir. C'est la première fois.

Sarah ouvre la porte. Elle a l'air très fatiguée. « Entre ! Il dort, mais il va se réveiller bientôt. »

Dans le salon, il y a des choses partout : des vêtements de bébé, des jouets, des couvertures. La maison n'est plus très rangée. Sarah rit : « Avec un bébé, c'est normal ! »

Léo se réveille. Sarah le prend dans ses bras.

Il est tout petit. Ses mains sont minuscules. Ses cheveux sont noirs et fins.

« Tu veux le porter ? » demande Sarah.

J'ai un peu peur. « Il est si petit... »

« Ne t'inquiète pas. Mets ta main ici, sous sa tête. »

Je porte Léo. Il est chaud et léger. Il me regarde avec de grands yeux.

Et soudain, il sourit.

« Il sourit ! » je crie.

« Oui », dit Sarah, très fière. « Depuis quelques jours seulement. »

Nous sommes tous silencieux pendant un moment.

Sarah dort trois heures par nuit. Elle est épuisée.

Mais quand elle regarde Léo, elle sourit aussi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-057",
    title: "Les cousins arrivent",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Aujourd'hui, mes cousins arrivent pour le week-end.",
    blurbEn:
      "The cousins arrive for the weekend: a loud house, a football match in the garden, and everyone too tired at bedtime. (Section: Family and friends, 4/5.)",
    body: `Aujourd'hui, mes cousins arrivent pour le week-end. Ils habitent à Marseille, à quatre heures de chez nous.

Ils sont trois : Lucas, quatorze ans, Emma, onze ans, et le petit Noah, six ans.

À onze heures, j'entends une voiture. Je cours à la porte. Les voilà !

Noah sort le premier. Il court vers moi et il saute dans mes bras. « Salut ! »

Ma mère embrasse tout le monde. « Vous avez fait bon voyage ? »

« Long, mais ça va », répond ma tante.

La maison change tout de suite. Avant, c'est calme. Maintenant, il y a du bruit partout ! Des voix, des rires, des pas dans l'escalier.

Nous déjeunons tous ensemble. Nous sommes neuf à table. Il n'y a pas assez de chaises, alors Noah s'assoit sur un tabouret.

L'après-midi, nous jouons au football dans le jardin. Les grands contre les petits. Noah marque un but et il crie très fort.

Le soir, nous mangeons une grande pizza devant un film.

À dix heures, Noah dort déjà sur le canapé. Emma bâille. Même Lucas est fatigué.

Demain, ils repartent. La maison sera trop calme.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-058",
    title: "La photo de mariage",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Dans le salon de ma grand-mère, il y a une vieille photo.",
    blurbEn:
      "An old black-and-white wedding photo on grandma's wall opens a window on 1961 — and on a grandfather the narrator never met. (Section: Family and friends, 5/5.)",
    body: `Dans le salon de ma grand-mère, il y a une vieille photo sur le mur. C'est une photo en noir et blanc.

Sur la photo, il y a un homme et une femme. Ils sont jeunes. La femme porte une robe blanche et des fleurs dans les mains. L'homme porte un costume noir.

« C'est toi ? » je demande.

« Oui », dit ma grand-mère. « C'est le jour de mon mariage. En 1961. »

Je regarde la photo. Ma grand-mère a quatre-vingt-trois ans aujourd'hui. Sur la photo, elle a vingt-deux ans. Elle est très belle.

« Et lui, c'est grand-père ? »

« Oui. Tu ne l'as pas connu. Il est mort avant ta naissance. »

Elle prend la photo dans ses mains. Elle la regarde longtemps.

« Il était drôle », dit-elle doucement. « Il chantait tout le temps. Mal, mais tout le temps. »

Je souris. Mon père chante mal aussi.

« Et le mariage, c'était comment ? »

« Il pleuvait ! Toute la journée ! Mais nous étions heureux. Nous avons dansé jusqu'à trois heures du matin. »

Ma grand-mère remet la photo sur le mur.

« Regarde bien, » dit-elle. « Tu as ses yeux. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-059",
    title: "J'écoute de la musique",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "J'écoute de la musique tous les jours.",
    blurbEn:
      "Music for every moment of the day — calm in the morning, loud for cleaning, and one song that always brings back a memory. (Section: Free time, 1/5.)",
    body: `J'écoute de la musique tous les jours. Le matin, dans le bus, le soir à la maison. La musique m'accompagne partout.

J'aime beaucoup de styles différents. J'aime le rock, le rap et aussi la musique classique. Ça dépend du moment.

Le matin, j'écoute de la musique calme. Je ne suis pas encore bien réveillé. Une musique douce, c'est parfait.

Quand je fais le ménage, c'est le contraire ! Je mets la musique très fort et je chante. Mes voisins ne sont pas contents.

J'ai une chanson préférée. C'est une vieille chanson française. Mon père l'écoutait quand j'étais petit.

Quand j'entends cette chanson, je pense tout de suite aux vacances, à la voiture, à la mer. C'est étrange : une chanson peut ouvrir une porte dans la tête.

Le samedi, je vais parfois à un concert. J'aime être là, avec beaucoup de gens, dans le bruit et la lumière. Tout le monde chante ensemble.

Je ne joue pas très bien d'un instrument. Je ne sais pas lire les notes.

Mais pour écouter, pas besoin de savoir. Il faut seulement des oreilles et un peu de temps.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-060",
    title: "Le cours de dessin",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Le jeudi soir, je vais à un cours de dessin.",
    blurbEn:
      "A Thursday-night drawing class for people who 'can't draw': a patient teacher, a bowl of fruit, and slow progress. (Section: Free time, 2/5.)",
    body: `Le jeudi soir, je vais à un cours de dessin. C'est dans une petite salle, près de la mairie.

Nous sommes dix personnes. Il y a des jeunes et des personnes âgées. La plus âgée a soixante-dix-huit ans.

Le professeur s'appelle Vincent. Il est artiste. Il est très patient.

« Tout le monde peut dessiner », dit-il souvent. « Il faut seulement regarder. »

Au début, je ne suis pas d'accord. Mes dessins sont horribles ! Mes maisons ne sont pas droites. Mes personnes ont des bras trop longs.

Aujourd'hui, nous dessinons des fruits. Sur la table, il y a une pomme, une banane et un verre.

« Regardez la lumière », dit Vincent. « Où est l'ombre ? »

Je regarde longtemps. C'est étrange : quand on regarde vraiment, on voit des choses différentes.

Je dessine pendant une heure. Je ne parle pas. Je ne pense à rien d'autre. Le temps passe très vite.

À la fin, je regarde mon dessin. Ce n'est pas parfait. La banane est bizarre.

Mais la pomme ? La pomme est bonne !

Vincent regarde et sourit. « Vous voyez ? Vous progressez. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-061",
    title: "Un film le samedi soir",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Le samedi soir, c'est la soirée film à la maison.",
    blurbEn:
      "Saturday film night at home: choosing takes longer than watching, and the popcorn is the best part. (Section: Free time, 3/5.)",
    body: `Le samedi soir, c'est la soirée film à la maison. C'est une tradition dans ma famille.

Vers huit heures, nous nous installons dans le salon. Il y a mon père, ma mère, ma sœur et moi.

D'abord, il faut choisir le film. Et là, c'est compliqué !

Ma sœur veut un film d'amour. Mon père préfère les films d'action. Ma mère aime les comédies. Moi, je veux un film de science-fiction.

« On regarde un film d'amour ! » dit ma sœur.

« Ah non, pas encore ! » répond mon père.

Nous discutons pendant vingt minutes. Parfois trente.

Finalement, nous choisissons une comédie. C'est souvent la solution : tout le monde aime rire.

Ma mère prépare du popcorn dans la cuisine. Ça sent très bon. Pour moi, le popcorn est le meilleur moment de la soirée.

Le film commence. Nous éteignons la lumière.

Le film est drôle. Nous rions beaucoup. Mon père rit le plus fort.

Vers dix heures et demie, je regarde ma mère. Elle dort ! Elle dort toujours pendant les films.

À la fin, elle ouvre les yeux : « Il était très bien, ce film. »

Nous rions encore.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-062",
    title: "J'apprends la guitare",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Depuis six mois, j'apprends la guitare.",
    blurbEn:
      "Six months of learning guitar: sore fingers, three chords, a patient neighbour — and the first song played all the way through. (Section: Free time, 4/5.)",
    body: `Depuis six mois, j'apprends la guitare. C'est un vieux rêve.

Ma guitare n'est pas neuve. Je l'achète d'occasion pour quarante euros. Elle est un peu abîmée, mais elle sonne bien.

Au début, c'est très difficile. Mes doigts font mal. Après dix minutes, je dois m'arrêter. La peau de mes doigts est rouge.

« C'est normal », dit mon voisin Paul. Il joue depuis trente ans. « Dans un mois, tu n'auras plus mal. »

Il a raison.

J'apprends d'abord trois accords. Seulement trois ! Mais avec ces trois accords, on peut jouer beaucoup de chansons.

Je joue vingt minutes chaque soir, après le dîner. Ce n'est pas long, mais c'est tous les jours.

Au début, ma musique est horrible. Je m'arrête tout le temps. Je change d'accord trop lentement.

Puis, un jour, quelque chose change. Mes mains bougent toutes seules. Je ne réfléchis plus.

Hier soir, je joue une chanson complète, du début à la fin, sans erreur.

Paul frappe à ma porte. J'ai peur : le bruit ?

Mais non. Il sourit.

« C'était bien ! » dit-il. « Continue. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-063",
    title: "La soirée jeux",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Une fois par mois, mes amis viennent jouer chez moi.",
    blurbEn:
      "Once a month friends come round for board games: phones in a bowl, a lot of shouting, and one very competitive grandmother. (Section: Free time, 5/5.)",
    body: `Une fois par mois, mes amis viennent chez moi. C'est la soirée jeux.

Ils arrivent vers sept heures. Chacun apporte quelque chose : du pain, du fromage, des gâteaux, des boissons.

Il y a une règle importante : pas de téléphone. À l'entrée, il y a un grand bol. Tout le monde met son téléphone dedans.

Au début, c'est difficile pour certains ! Mais après dix minutes, personne ne pense plus au téléphone.

Nous jouons à des jeux de société. Nous avons beaucoup de jeux : des jeux de cartes, des jeux de questions, des jeux avec un plateau.

Ce soir, nous jouons à un jeu de questions. Nous sommes six, en deux équipes.

Il y a beaucoup de bruit ! Tout le monde crie les réponses. Marc n'est pas d'accord avec les règles. Léa rit trop et elle ne peut plus parler.

Ma grand-mère joue avec nous. Elle a soixante-dix-neuf ans et elle adore gagner. Ce soir, son équipe gagne encore.

« Encore une partie ! » dit-elle à minuit.

Nous jouons jusqu'à une heure du matin.

Quand mes amis partent, ils reprennent leur téléphone.

« Bizarre », dit Marc. « Je n'ai pas regardé l'heure une seule fois. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-064",
    title: "Je vais au travail à vélo",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Chaque matin, je vais au travail à vélo.",
    blurbEn:
      "Twenty-five minutes by bike beats the metro: fresh air, no traffic jams, a route along the river — and rain gear for bad days. (Section: Getting around, 1/5.)",
    body: `Chaque matin, je vais au travail à vélo. Mon bureau est à cinq kilomètres de chez moi. Le trajet dure vingt-cinq minutes.

Avant, je prends le métro. Mais le métro est plein le matin. Il y a trop de monde. Je n'aime pas ça.

Un jour, j'achète un vélo. Et maintenant, je ne veux plus changer.

Le matin, je pars à huit heures. L'air est frais. La ville se réveille doucement.

Il y a une piste cyclable le long de la rivière. C'est très joli. Je vois l'eau, les arbres, parfois des canards.

Il y a beaucoup de cyclistes. Nous ne nous parlons pas, mais nous nous voyons chaque jour.

Le vélo a des avantages. C'est gratuit. C'est rapide : parfois plus rapide que la voiture, parce qu'il n'y a pas d'embouteillages. Et c'est du sport !

Bien sûr, il y a un problème : la pluie. Quand il pleut, je porte une veste spéciale et un pantalon de pluie. J'arrive au bureau un peu mouillé.

Mes collègues rient : « Encore le vélo ? Par ce temps ? »

Oui. Encore le vélo.

Le soir, je rentre à vélo aussi. Après une journée devant l'ordinateur, ça fait du bien.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-065",
    title: "À la gare",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "La gare est un endroit plein de monde et de bruit.",
    blurbEn:
      "Buying a ticket, finding the platform, and watching people say goodbye: a small portrait of a busy station. (Section: Getting around, 2/5.)",
    body: `Aujourd'hui, je vais à Bordeaux pour le week-end. J'arrive à la gare à deux heures.

La gare est grande et pleine de monde. Il y a du bruit partout : des voix, des valises, des annonces.

D'abord, j'achète mon billet. Il y a une queue devant les machines. J'attends cinq minutes.

Sur la machine, je choisis ma destination : Bordeaux. Je choisis l'heure : quatorze heures quarante. Le billet coûte trente-deux euros.

Ensuite, je regarde le grand panneau. Il y a beaucoup de trains et beaucoup de villes : Paris, Lyon, Toulouse, Nantes...

Je cherche mon train. Bordeaux, quatorze heures quarante... voie 7.

Je marche vers la voie 7. Mon sac est lourd.

Sur le quai, j'attends. Je regarde les gens.

Une mère dit au revoir à son fils. Elle l'embrasse trois fois. Elle pleure un peu.

Deux amis se retrouvent. Ils crient et ils rient très fort.

Un homme court : son train part dans une minute !

Une gare, c'est un endroit d'arrivées et de départs. Il y a de la joie et de la tristesse en même temps.

Mon train arrive. Je monte. Bon voyage à moi !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-066",
    title: "Le voyage en train",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le train part à quatorze heures quarante.",
    blurbEn:
      "Three hours through changing countryside, a shared sandwich with the woman opposite, and the sea appearing at the window. (Section: Getting around, 3/5.)",
    body: `Le train part à quatorze heures quarante, exactement à l'heure.

Je trouve ma place : voiture 12, place 45, à côté de la fenêtre. J'aime beaucoup les places à la fenêtre.

En face de moi, il y a une dame âgée. Elle lit un livre. Elle me dit bonjour avec un sourire.

Le train sort de la ville. D'abord, je vois des immeubles et des routes. Puis, après vingt minutes, tout change.

Maintenant, il y a des champs. Il y a des vaches, des petits villages, des arbres. La campagne est verte et calme.

Je regarde par la fenêtre pendant longtemps. Je ne fais rien d'autre. C'est reposant.

À quatre heures, j'ai faim. Je sors mon sandwich et une pomme.

La dame sort aussi son repas. Elle a beaucoup de choses : du pain, du fromage, des tomates.

« Vous voulez un peu de fromage ? » demande-t-elle.

« Merci beaucoup ! »

Nous parlons pendant une heure. Elle va voir sa fille et ses petits-enfants.

À dix-sept heures trente, le train arrive à Bordeaux.

« Bon week-end ! » dit la dame.

« Merci ! À vous aussi ! »

Je ne connais pas son nom. Mais ce voyage était très agréable.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-067",
    title: "La vieille voiture de mon père",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Mon père a une voiture très vieille. Il l'adore.",
    blurbEn:
      "Dad's twenty-two-year-old car makes strange noises and has no screen — but he refuses to sell it, and everyone secretly understands why. (Section: Getting around, 4/5.)",
    body: `Mon père a une voiture très vieille. Elle est bleue et elle a vingt-deux ans.

La voiture n'est pas belle. Il y a des marques sur les portes. Le siège du conducteur est abîmé.

Elle fait aussi des bruits bizarres. Quand mon père tourne, elle fait « criii ». Quand il freine, elle fait « chhh ».

Il n'y a pas d'écran, pas de GPS. Pour trouver le chemin, mon père utilise une carte en papier !

Ma mère dit souvent : « Marc, il faut acheter une nouvelle voiture. »

Mon père répond toujours la même chose : « Elle marche très bien ! »

C'est vrai : elle marche. Elle ne tombe jamais en panne. Le garagiste dit que le moteur est excellent.

Avec cette voiture, nous allons partout. Nous allons à la mer chaque été. Nous allons chez ma grand-mère. Nous transportons des meubles, des vélos, un arbre de Noël.

Dans la voiture, il y a beaucoup de souvenirs. Il y a une petite tache sur le siège arrière : c'est moi, à six ans, avec un chocolat.

L'année dernière, un homme propose de l'acheter.

« Non merci », dit mon père.

Il ne vend pas sa voiture. Je crois qu'il ne la vendra jamais.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-068",
    title: "Marcher en ville",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le samedi, je ne prends pas le bus. Je marche.",
    blurbEn:
      "Walking instead of taking the bus turns a journey into a discovery: hidden streets, an old door, and a bookshop that was always there. (Section: Getting around, 5/5.)",
    body: `Le samedi, je ne prends pas le bus, je ne prends pas le métro. Je marche.

Pendant la semaine, je suis toujours pressé. Métro, bus, vite, vite. Je ne regarde rien.

Mais le samedi, j'ai le temps. Alors je marche dans la ville.

Quand on marche, on voit des choses. Beaucoup de choses.

Aujourd'hui, je découvre une petite rue. Je passe ici depuis dix ans, mais en bus. Je ne connais pas cette rue !

Elle est très étroite. Il y a des maisons anciennes et des fleurs aux fenêtres.

Au bout de la rue, il y a une porte magnifique. Elle est en bois, très vieille, avec des dessins. Je m'arrête et je la regarde.

Un peu plus loin, il y a une petite librairie. Elle est ouverte. J'entre.

À l'intérieur, il y a des livres partout, du sol au plafond. Ça sent le papier.

J'achète un livre d'occasion pour trois euros.

Je continue à marcher. Je regarde les gens, les magasins, les arbres.

Je rentre à la maison une heure plus tard que d'habitude.

Mais je connais mieux ma ville qu'hier.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-069",
    title: "Ma chambre",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Ma chambre est petite, mais c'est mon endroit préféré.",
    blurbEn:
      "A small bedroom described piece by piece: the bed, the desk, the window, the posters — and why it's the narrator's favourite place. (Section: At home, 1/5.)",
    body: `Ma chambre est petite, mais c'est mon endroit préféré dans la maison.

Elle fait environ douze mètres carrés. Ce n'est pas grand, mais c'est assez pour moi.

Quand j'entre, il y a mon lit à droite. Il est simple, avec une couverture bleue. Au-dessus du lit, il y a une étagère avec mes livres.

À gauche, il y a mon bureau. Sur le bureau, il y a mon ordinateur, une lampe, des stylos et beaucoup de papiers. Ma mère dit que c'est en désordre. Elle a raison.

En face de la porte, il y a la fenêtre. C'est le meilleur endroit de la chambre. Je vois le jardin du voisin et un grand arbre.

Le matin, le soleil entre par la fenêtre. La chambre devient toute jaune. J'adore ce moment.

Sur les murs, il y a des posters : un groupe de musique, une carte du monde, et une photo de mes amis.

Il y a aussi une petite plante verte sur la fenêtre. Elle s'appelle Georges. Oui, j'ai donné un nom à ma plante.

Le soir, je ferme la porte, j'allume ma lampe et je lis.

Ici, je suis tranquille. C'est mon petit monde.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-070",
    title: "Le grand ménage",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Samedi matin, c'est le grand ménage à la maison.",
    blurbEn:
      "Saturday cleaning with the whole family: everyone has a job, music helps, and strange things turn up under the sofa. (Section: At home, 2/5.)",
    body: `Samedi matin, neuf heures. Ma mère ouvre la porte de ma chambre.

« Debout ! Aujourd'hui, c'est le grand ménage ! »

Toute la famille travaille. Chacun a une tâche.

Mon père passe l'aspirateur dans le salon. Ma mère nettoie la cuisine. Ma sœur fait les fenêtres. Et moi ? Je range ma chambre et je nettoie la salle de bains.

Ma mère met de la musique très fort. C'est mieux avec de la musique.

Je commence par ma chambre. Je mets les vêtements dans l'armoire. Je range mes livres. Je jette de vieux papiers.

Sous mon lit, je trouve des choses incroyables : une chaussette, un stylo, un vieux gâteau (beurk !) et un livre de la bibliothèque. Je le cherche depuis deux mois !

Dans le salon, mon père crie : « Regardez ce que je trouve sous le canapé ! »

C'est la télécommande de la télévision. Nous la cherchons depuis trois semaines.

À midi, la maison est propre. Tout brille. Ça sent le savon.

Nous nous asseyons dans le salon, fatigués.

« C'est agréable, une maison propre », dit ma mère.

C'est vrai. Mais dans une semaine, tout sera en désordre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-071",
    title: "Une étagère à monter",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "J'achète une étagère. Il faut la monter moi-même.",
    blurbEn:
      "Flat-pack furniture, forty-two screws, instructions with no words, and one piece that ends up upside down. (Section: At home, 3/5.)",
    body: `Aujourd'hui, j'achète une étagère pour ma chambre. Elle coûte trente-cinq euros.

Mais il y a un problème : dans le magasin, l'étagère est dans une boîte plate. Il faut la monter à la maison.

« Ce n'est pas difficile », dit le vendeur. « Trente minutes. »

Trente minutes ? Nous allons voir.

À la maison, j'ouvre la boîte. À l'intérieur, il y a beaucoup de morceaux de bois. Il y a aussi un petit sac avec quarante-deux vis.

Il y a un papier avec des dessins. Il n'y a pas de mots, seulement des images. Un petit personnage sourit et monte l'étagère facilement.

Je commence. Étape un : je mets deux morceaux ensemble. Ça marche !

Étape deux : je mets une vis. Ça marche aussi. Je suis content.

Étape trois... Attention. Il y a un problème. Le morceau C ne va pas avec le morceau D.

Je regarde le dessin. Je tourne le papier. Je regarde encore.

Ah ! Le morceau C est à l'envers.

Je recommence. Je perds une vis sous le lit. Je la cherche pendant dix minutes.

Deux heures plus tard, l'étagère est finie.

Elle est droite. Elle est solide. Elle est parfaite.

Et je suis très fier.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-072",
    title: "Les plantes de la maison",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Dans mon appartement, il y a onze plantes vertes.",
    blurbEn:
      "Eleven house plants, each with a name and a personality — and the hard lesson that too much water kills faster than too little. (Section: At home, 4/5.)",
    body: `Dans mon appartement, il y a onze plantes vertes. Oui, onze ! Je les compte hier.

Il y a des grandes et des petites. Il y en a dans le salon, dans la cuisine, dans la chambre, et même dans la salle de bains.

Ma plante préférée est près de la fenêtre du salon. Elle est très grande maintenant : un mètre cinquante ! Quand je l'achète, il y a trois ans, elle est toute petite.

Les plantes ont besoin de trois choses : de l'eau, de la lumière et un peu d'attention.

Au début, je fais une erreur. Je donne trop d'eau. Beaucoup trop ! Les feuilles deviennent jaunes et la plante meurt.

Ma voisine m'explique : « Trop d'eau, c'est pire que pas assez. Touche la terre avec ton doigt. Si elle est sèche, tu arroses. Si elle est humide, tu attends. »

Maintenant, j'arrose une fois par semaine, le dimanche matin. C'est devenu un petit rituel.

Les plantes changent une maison. L'air est meilleur. La pièce est plus jolie, plus vivante.

Et il y a autre chose. Quand je rentre le soir, je regarde mes plantes. Une nouvelle feuille ? Une fleur ?

Quelque chose grandit ici, doucement, pendant que je travaille.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-073",
    title: "Ma sœur déménage",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Aujourd'hui, ma sœur quitte la maison.",
    blurbEn:
      "Boxes, a rented van, four flights of stairs and a first night in an empty flat — the day a sister moves out. (Section: At home, 5/5.)",
    body: `Aujourd'hui, ma sœur Inès quitte la maison. Elle va habiter dans son propre appartement, à Lyon.

Elle a dix-neuf ans. C'est la première fois.

Depuis une semaine, il y a des cartons partout dans sa chambre. Des cartons de vêtements, de livres, de vaisselle.

Ce matin, mon père loue une camionnette. Nous chargeons tout : les cartons, une table, une chaise, un petit lit.

C'est lourd ! Nous travaillons pendant deux heures.

Puis nous partons pour Lyon. Le voyage dure une heure.

Le nouvel appartement est petit. Il y a une pièce, une petite cuisine et une salle de bains. C'est au quatrième étage, et il n'y a pas d'ascenseur.

Quatre étages avec des cartons ! Mon père ne dit rien, mais il est rouge.

L'appartement est vide et un peu triste. Il n'y a pas de rideaux. Le sol est froid.

Mais Inès sourit. « C'est chez moi », dit-elle.

Nous montons les meubles. Ma mère nettoie la cuisine.

Le soir, nous partons. Ma mère pleure un peu dans la voiture.

À la maison, la chambre d'Inès est vide.

Elle m'envoie un message : « Ma première nuit ! J'ai un peu peur. Mais ça va. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-074",
    title: "Le jour de la rentrée",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "C'est le premier jour d'école après les vacances.",
    blurbEn:
      "The first day back after the summer: new shoes, a new classroom, nervous stomachs, and finding out who's in your class. (Section: At school, 1/5.)",
    body: `C'est le jour de la rentrée. Après deux mois de vacances, l'école recommence.

Hier soir, je prépare mon sac. Des cahiers neufs, des stylos, une trousse. Tout est propre et neuf. Ça sent le papier.

Ce matin, je me réveille tôt. Je ne dors pas très bien. J'ai un peu mal au ventre.

Ma mère prépare le petit déjeuner. « Tu es nerveux ? » demande-t-elle.

« Non », je réponds. Mais ce n'est pas vrai.

Je mets mes nouvelles chaussures. Elles font un peu mal.

À huit heures, j'arrive à l'école. Il y a beaucoup d'élèves dans la cour. Tout le monde parle très fort.

Je cherche mes amis. Où sont-ils ?

Enfin, je vois Yanis ! Il est plus grand qu'avant. Il a grandi pendant l'été.

« Salut ! Tu es dans quelle classe ? » je demande.

Nous regardons les listes sur le mur. Il y a beaucoup de noms.

Je cherche mon nom... Classe de 3e B.

Et Yanis ? Il regarde. Il sourit.

« 3e B ! Nous sommes ensemble ! »

La cloche sonne. Nous entrons dans la classe.

Une nouvelle année commence.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-075",
    title: "Ma matière préférée",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "À l'école, ma matière préférée est l'histoire.",
    blurbEn:
      "Why history beats maths: a teacher who tells stories instead of listing dates, and the day the past suddenly felt real. (Section: At school, 2/5.)",
    body: `À l'école, j'étudie beaucoup de matières : les mathématiques, le français, l'anglais, les sciences, le sport, l'histoire.

Ma matière préférée est l'histoire.

Avant, je n'aime pas l'histoire. C'est ennuyeux : des dates, des noms, des rois. Il faut tout apprendre par cœur. Je ne comprends pas pourquoi.

Mais cette année, nous avons un nouveau professeur. Il s'appelle monsieur Faure.

Monsieur Faure ne donne pas de listes de dates. Il raconte des histoires.

Il raconte la vie des gens ordinaires. Comment ils mangent, comment ils travaillent, comment ils s'amusent. Qui a peur, qui est courageux.

Quand il parle, la classe est silencieuse. Même les élèves qui parlent toujours écoutent.

La semaine dernière, il apporte un objet : une vieille lettre. C'est la lettre d'un soldat à sa mère, il y a cent ans.

Il la lit à voix haute. Le soldat parle de la pluie, du froid, et de sa mère.

Personne ne parle dans la classe.

Soudain, l'histoire n'est plus dans les livres. Elle est vraie. Ces gens existent vraiment.

Maintenant, je lis des livres d'histoire à la maison. Pour le plaisir.

Un bon professeur change tout.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-076",
    title: "Le contrôle de maths",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Ce matin, il y a un contrôle de mathématiques.",
    blurbEn:
      "Maths test day: revising the night before, a silent classroom, one impossible question — and a result that surprises everyone. (Section: At school, 3/5.)",
    body: `Ce matin, il y a un contrôle de mathématiques. Je n'aime pas les contrôles.

Hier soir, je travaille pendant deux heures. Je relis mes cahiers. Je fais des exercices. Ma mère m'aide un peu.

« Tu es prêt ? » demande-t-elle à dix heures.

« Je crois... »

À huit heures, nous entrons dans la classe. Tout le monde est nerveux. Personne ne parle beaucoup.

Madame Girard donne les feuilles. « Vous avez une heure. Bon courage ! »

Je regarde les questions. Il y en a huit.

Question 1 : facile ! Je connais.
Question 2 : facile aussi.
Question 3 : d'accord, ça va.
Question 4... Ah. Je ne comprends pas.

Je lis la question trois fois. Je réfléchis. Je regarde le plafond.

Je décide de continuer et de revenir après.

Les questions 5, 6 et 7 sont normales. La question 8 est difficile, mais j'essaie.

Je reviens à la question 4. Et soudain, je comprends ! C'est comme l'exercice d'hier soir.

« C'est fini ! » dit madame Girard.

Dans le couloir, tout le monde parle : « Tu as trouvé quoi pour la 4 ? »

Une semaine plus tard, madame Girard rend les copies.

J'ai quinze sur vingt. Mon meilleur résultat de l'année !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-077",
    title: "À la cantine",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "À midi, nous mangeons à la cantine de l'école.",
    blurbEn:
      "Lunch at the school canteen: a starter, a main course, cheese and dessert — and the noisiest room in the building. (Section: At school, 4/5.)",
    body: `À midi, nous mangeons à la cantine de l'école. Nous avons une heure et demie pour déjeuner.

En France, le repas de la cantine est un vrai repas. Il y a quatre parties : une entrée, un plat, du fromage ou un yaourt, et un dessert.

Aujourd'hui, l'entrée est une salade de carottes. Le plat est du poisson avec du riz. Après, il y a du fromage. Et pour le dessert, une pomme.

Nous prenons un plateau et nous avançons dans la queue. Les dames de la cantine servent les plats.

« Tu veux du poisson ? » demande une dame.

« Oui, merci. »

« Et des légumes ? »

« Un peu, s'il vous plaît. »

Ensuite, nous cherchons une table. La cantine est grande, avec beaucoup de tables.

Il y a du bruit ! Beaucoup de bruit ! Deux cents élèves parlent en même temps. Les couverts font du bruit sur les assiettes.

Je mange avec Yanis et deux autres amis. Nous parlons du contrôle de maths, du sport, du week-end.

Le poisson n'est pas très bon aujourd'hui. Mais le dessert est correct.

Après le repas, nous allons dans la cour. Nous avons encore quarante minutes.

Nous jouons au football jusqu'à la cloche.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-078",
    title: "Le voyage scolaire",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Cette année, notre classe part trois jours à Paris.",
    blurbEn:
      "Three days in Paris with the class: an early bus, a museum, the Eiffel Tower, and very little sleep in the hostel. (Section: At school, 5/5.)",
    body: `Cette année, notre classe part en voyage scolaire. Nous allons à Paris pendant trois jours !

Nous partons lundi matin, très tôt. Le bus part à six heures. Tout le monde est fatigué, mais content.

Dans le bus, il y a beaucoup de bruit. Les professeurs demandent le silence. Personne n'écoute.

Nous arrivons à Paris à onze heures.

Le premier jour, nous visitons un grand musée. Il y a des tableaux magnifiques. Notre professeur explique les peintures. Certains élèves écoutent, d'autres regardent leur téléphone.

Moi, j'aime beaucoup un tableau : une femme avec un chapeau bleu. Je reste devant pendant cinq minutes.

Le soir, nous dormons dans une auberge de jeunesse. Nous sommes six garçons dans une chambre.

Nous ne dormons pas beaucoup. Nous parlons jusqu'à deux heures du matin ! À sept heures, le professeur frappe à la porte. Nous sommes très fatigués.

Le deuxième jour, nous montons à la tour Eiffel. De là-haut, on voit toute la ville. C'est immense !

Le troisième jour, nous marchons le long de la Seine.

Dans le bus du retour, tout le monde dort. Même les professeurs.

C'était un très bon voyage.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-079",
    title: "La liste de courses",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Avant d'aller au supermarché, je fais une liste.",
    blurbEn:
      "Making a shopping list by checking every cupboard — and the golden rule: never shop when you're hungry. (Section: Shopping, 1/5.)",
    body: `Avant d'aller au supermarché, je fais toujours une liste. C'est important.

Sans liste, j'oublie des choses. Et j'achète des choses inutiles.

Je prends un papier et un stylo. Puis je regarde dans la cuisine.

D'abord, le frigo. Il n'y a plus de lait. J'écris : lait. Il n'y a plus d'œufs. J'écris : œufs. Il reste un peu de fromage, mais pas beaucoup. J'écris : fromage.

Ensuite, les placards. Il n'y a plus de riz ni de pâtes. J'écris les deux.

Dans la salle de bains, il n'y a presque plus de savon. J'écris : savon.

Ma liste :
- lait
- œufs
- fromage
- riz
- pâtes
- savon
- fruits
- légumes
- pain

Neuf choses. C'est bien.

Il y a une règle très importante : ne jamais faire les courses quand on a faim !

Quand j'ai faim, j'achète tout. Des gâteaux, du chocolat, des chips. Après, à la maison, je regarde mes sacs et je me demande : pourquoi ?

Alors, avant de partir, je mange une pomme.

Maintenant, je suis prêt. J'ai ma liste, mon sac et je n'ai pas faim.

Allons au supermarché !`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-080",
    title: "Au supermarché",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le supermarché est grand. Il y a beaucoup de rayons.",
    blurbEn:
      "A walk through the aisles with a list and a trolley — and the two extra things that end up in the basket anyway. (Section: Shopping, 2/5.)",
    body: `J'arrive au supermarché à dix heures. Il n'y a pas trop de monde le matin.

Je prends un chariot. Une roue fait un bruit bizarre, mais ça va.

Le supermarché est grand. Il y a beaucoup de rayons.

Je commence par les fruits et les légumes. J'achète des pommes, des bananes, des tomates et une salade. Je choisis les fruits attentivement.

Ensuite, je vais au rayon des produits frais. Je prends le lait, les œufs et le fromage. Je regarde toujours la date sur les produits.

Après, le rayon des pâtes et du riz. C'est facile : je prends les mêmes marques que d'habitude.

Il y a beaucoup de choix ! Pour les pâtes, il y a vingt sortes différentes. C'est trop.

Je passe devant le rayon des gâteaux. Je ne regarde pas. Non, non, non.

Bon, d'accord. Je prends un paquet de biscuits au chocolat.

Je regarde ma liste : le savon ! J'oublie le savon. Je retourne dans l'autre rayon.

À la caisse, il y a une queue de quatre personnes. J'attends cinq minutes.

« Bonjour ! Vous avez la carte du magasin ? » demande la caissière.

« Oui, la voilà. »

Ça fait quarante-trois euros. Un peu plus que prévu.

C'est la faute des biscuits.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-081",
    title: "Combien ça coûte ?",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Au marché, il faut regarder les prix.",
    blurbEn:
      "Comparing prices at the market: the same tomatoes cost very different amounts, and the cheapest stall isn't always the best. (Section: Shopping, 3/5.)",
    body: `Au marché, il y a beaucoup de vendeurs. Ils vendent souvent les mêmes choses. Mais les prix ne sont pas les mêmes !

Aujourd'hui, je cherche des tomates.

Le premier vendeur a de belles tomates. Je regarde le prix : quatre euros le kilo. C'est cher.

« Bonjour ! Combien coûtent les tomates ? » je demande.

« Quatre euros le kilo. Elles sont excellentes ! »

Je continue. Le deuxième vendeur a des tomates à deux euros cinquante le kilo. C'est beaucoup moins cher !

Mais je regarde bien : ces tomates sont plus petites et moins jolies.

Le troisième vendeur a des tomates à trois euros. Elles sont belles et le prix est correct.

Je prends un kilo chez lui. Ça fait trois euros.

« Et avec ça ? » demande le vendeur.

« Une salade, s'il vous plaît. Combien ? »

« Un euro vingt. »

Je paie quatre euros vingt en tout. Je donne cinq euros. Le vendeur me rend quatre-vingts centimes.

Le moins cher n'est pas toujours le meilleur. Le plus cher non plus.

Il faut regarder, comparer et choisir.

Mes tomates sont excellentes. Ce soir, je fais une salade.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-082",
    title: "J'achète un manteau",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Mon vieux manteau est trop petit. J'en cherche un nouveau.",
    blurbEn:
      "Buying a winter coat: too big, too small, too expensive — then the right one, in a colour that wasn't the plan. (Section: Shopping, 4/5.)",
    body: `L'hiver arrive et mon vieux manteau est trop petit. Je dois en acheter un nouveau.

Je vais dans un magasin de vêtements du centre-ville.

Il y a beaucoup de manteaux : des noirs, des bleus, des gris, des verts. Il y a des manteaux longs et des manteaux courts.

Une vendeuse arrive. « Bonjour ! Je peux vous aider ? »

« Oui, je cherche un manteau chaud pour l'hiver. »

« Quelle taille faites-vous ? »

« Du 40, je crois. »

Elle me montre trois manteaux. J'essaie le premier : il est noir et il est trop grand. Les manches sont trop longues.

J'essaie le deuxième : il est bleu. La taille est bonne ! Mais je regarde le prix : cent quatre-vingt-dix euros. C'est beaucoup trop cher pour moi.

J'essaie le troisième : il est vert foncé. Je me regarde dans le miroir.

Hmm. Je ne voulais pas un manteau vert. Je voulais un manteau noir.

Mais il est très confortable. Et il est chaud.

Le prix ? Soixante-quinze euros. C'est correct.

« Il vous va très bien », dit la vendeuse.

Je réfléchis deux minutes. Puis je décide : je le prends.

Finalement, j'aime beaucoup le vert.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-083",
    title: "Un cadeau pour maman",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "C'est bientôt l'anniversaire de ma mère.",
    blurbEn:
      "Hunting for the right birthday present with a small budget, and discovering that the best gift isn't the most expensive one. (Section: Shopping, 5/5.)",
    body: `C'est bientôt l'anniversaire de ma mère. Je veux lui acheter un cadeau.

Mais quoi ? C'est difficile !

J'ai trente euros. Ce n'est pas beaucoup, mais c'est mon argent.

Je vais en ville avec ma sœur. Nous cherchons ensemble.

D'abord, nous entrons dans une parfumerie. Il y a des parfums magnifiques. Mais ils coûtent soixante ou quatre-vingts euros. C'est trop cher.

Ensuite, nous regardons des vêtements. Ma sœur trouve une écharpe rouge très jolie. Vingt-cinq euros. C'est possible !

Mais je réfléchis. Maman a déjà beaucoup d'écharpes. Cinq ou six.

Nous continuons. Nous passons devant une librairie.

Et là, j'ai une idée. Ma mère adore le jardinage. Elle parle toujours de ses plantes.

Nous entrons. Je trouve un beau livre sur les jardins, avec des photos magnifiques. Il coûte dix-huit euros.

Avec l'argent qui reste, j'achète une petite plante verte pour son bureau. Six euros.

Total : vingt-quatre euros.

Le jour de l'anniversaire, ma mère ouvre le paquet.

Elle regarde le livre longtemps. Puis elle me regarde.

« Comment tu sais ? » demande-t-elle.

« Tu parles toujours de tes plantes, maman. »

Elle me serre très fort.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-084",
    title: "Quel temps fait-il ?",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "En France, on parle beaucoup du temps.",
    blurbEn:
      "Weather is the great French conversation-starter: sunny, rainy, cold, windy — and what people say about each. (Section: The weather, 1/5.)",
    body: `En France, on parle beaucoup du temps. C'est un sujet facile. On peut parler du temps avec tout le monde : le voisin, le boulanger, une personne dans le bus.

« Quel beau temps aujourd'hui ! »
« Ah oui, ça fait du bien ! »

Quand il fait beau, le soleil brille. Le ciel est bleu. Les gens sont contents. Ils sortent, ils marchent, ils s'assoient aux terrasses des cafés.

Quand il pleut, c'est différent. Il faut un parapluie et un manteau. Les rues sont mouillées. Les gens marchent vite, la tête baissée.

« Quel temps horrible ! »
« Oui, et ça continue demain ! »

Quand il fait froid, on met un bonnet, une écharpe et des gants. On voit son souffle dans l'air. Les mains font mal.

Quand il fait chaud, c'est le contraire. On ouvre les fenêtres. On boit beaucoup d'eau. On cherche l'ombre des arbres.

Il y a aussi le vent. Le vent est fatigant : il pousse, il fait du bruit, il décoiffe.

Chaque matin, je regarde par la fenêtre avant de m'habiller.

Aujourd'hui ? Le ciel est gris, mais il ne pleut pas.

Je prends quand même mon parapluie. On ne sait jamais.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-085",
    title: "Une journée de grand soleil",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Aujourd'hui, il fait très chaud. Trente-quatre degrés !",
    blurbEn:
      "A day of thirty-four degrees: closed shutters, cold water, an empty street at noon, and the whole town outside after eight. (Section: The weather, 2/5.)",
    body: `Aujourd'hui, il fait très chaud. Trente-quatre degrés ! C'est beaucoup pour ma région.

Le matin, à sept heures, il fait déjà chaud. Je ferme les volets tout de suite. C'est un vieux truc : les volets fermés gardent la maison fraîche.

À midi, la rue est vide. Personne ne marche dehors. C'est trop chaud. Même les chats dorment à l'ombre.

Dans la maison, je bois beaucoup d'eau. Un verre, deux verres, trois verres. Mon corps a soif tout le temps.

Je ne cuisine pas : la cuisinière fait trop de chaleur. Je mange une salade froide et du melon.

L'après-midi, je vais à la piscine avec mes enfants. Il y a beaucoup de monde ! Tout le monde a la même idée.

L'eau est froide. C'est délicieux. Mes enfants jouent pendant deux heures.

À sept heures du soir, il fait encore chaud, mais c'est mieux.

Vers huit heures, la ville se réveille. Les gens sortent. La place est pleine. Les enfants courent. Les terrasses des cafés sont pleines.

Nous mangeons dehors, dans le jardin, à neuf heures.

La nuit est douce. Il y a des étoiles.

Ces soirées d'été sont mes moments préférés de l'année.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-086",
    title: "Le vent d'automne",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Cette nuit, le vent est très fort.",
    blurbEn:
      "A windy autumn night keeps the narrator awake, and the morning after reveals branches, leaves and one lost bin lid. (Section: The weather, 3/5.)",
    body: `Cette nuit, le vent est très fort. Je ne dors pas bien.

J'entends le vent contre les fenêtres. Il fait « ouuuuh ». C'est un bruit étrange, un peu inquiétant.

Dehors, les arbres bougent beaucoup. Leurs branches touchent le mur de la maison.

À trois heures du matin, j'entends un grand bruit dans le jardin. Bang !

Je me lève et je regarde par la fenêtre. Je ne vois rien dans le noir.

Le matin, je sors dans le jardin. Le vent est plus calme maintenant.

Je vois le problème : la poubelle est tombée. Il y a des papiers partout. Le couvercle n'est pas là.

Je cherche le couvercle. Il est dans le jardin du voisin, à dix mètres !

Dans la rue, il y a beaucoup de feuilles et de petites branches. Une chaise de jardin est renversée.

Mon voisin sort aussi. Il regarde son jardin.

« Quelle nuit ! » dit-il. « Vous avez dormi ? »

« Pas beaucoup ! »

Nous ramassons les feuilles ensemble.

L'automne est comme ça. Un jour, il fait beau et calme. Le lendemain, tout vole.

Ce soir, je ferme bien les volets.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-087",
    title: "Le premier jour de froid",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Ce matin, il fait vraiment froid pour la première fois.",
    blurbEn:
      "The first properly cold morning of the year: frost on the car, breath in the air, and the coats coming out of the cupboard. (Section: The weather, 4/5.)",
    body: `Ce matin, il fait vraiment froid pour la première fois cette année.

Quand j'ouvre les yeux, la chambre est froide. Je ne veux pas sortir du lit ! Ma couverture est chaude et confortable.

Enfin, je me lève. Le sol est glacé sous mes pieds. Où sont mes chaussettes ?

Je regarde par la fenêtre. Surprise : les voitures sont blanches ! Il y a du givre partout.

Je descends et j'allume le chauffage. C'est la première fois depuis le printemps.

Pour le petit déjeuner, je ne veux pas de jus d'orange froid. Je prends un thé chaud. Je tiens la tasse dans mes deux mains.

Ensuite, je cherche mes vêtements d'hiver. Ils sont dans le placard depuis six mois. Je sors mon manteau, mon écharpe et mes gants.

Dehors, l'air est glacé. Il entre dans mon nez et ça fait un peu mal.

Je vois mon souffle : de la petite fumée blanche devant ma bouche. Quand j'étais enfant, j'adorais ça.

Dans la rue, tout le monde marche vite. Les gens ont les mains dans les poches.

À l'arrêt de bus, une dame dit : « Ça y est, c'est l'hiver ! »

Oui. C'est l'hiver.

Ce soir, je fais une soupe.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-088",
    title: "Le printemps arrive",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Il y a quelque chose de différent aujourd'hui.",
    blurbEn:
      "The first real day of spring: longer light, birds at five in the morning, blossom on the trees, and everyone smiling in the street. (Section: The weather, 5/5.)",
    body: `Il y a quelque chose de différent aujourd'hui. Je le sens tout de suite.

Ce matin, à sept heures, il fait déjà jour. Pendant l'hiver, à sept heures, il fait encore noir.

J'ouvre la fenêtre. L'air n'est pas chaud, mais il n'est plus glacé.

Et j'entends les oiseaux ! Ils chantent beaucoup. Depuis quelques jours, ils commencent à cinq heures du matin. C'est un peu tôt, mais c'est joli.

Dans le jardin, la terre est encore humide. Mais il y a des petites choses vertes qui sortent. Ce sont mes fleurs. Elles reviennent chaque année.

L'arbre devant la maison a des fleurs blanches. Il est magnifique. Il ressemble à un nuage.

Dans la rue, les gens sont différents aussi. Ils marchent plus lentement. Ils ne portent plus de bonnet.

Une dame me dit bonjour avec un grand sourire. En janvier, personne ne sourit dans la rue !

À midi, je mange dehors, sur mon balcon. C'est le premier repas dehors depuis octobre. J'ai encore besoin d'un pull, mais ça va.

Le soir, à sept heures, il fait toujours jour.

Je peux marcher dans le parc après le travail.

L'hiver était long. Le printemps est là.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-089",
    title: "Les oiseaux du balcon",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Chaque matin, des oiseaux viennent sur mon balcon.",
    blurbEn:
      "Winter birds on a city balcony: seeds on the table, a bold sparrow, a shy robin, and a blackbird that bullies everyone. (Section: Animals, 1/5.)",
    body: `Chaque matin d'hiver, des oiseaux viennent sur mon balcon.

Tout commence en décembre. Il fait très froid et il n'y a plus beaucoup de nourriture pour eux. Alors je mets des graines sur la petite table.

Le premier jour, personne ne vient. J'attends.

Le deuxième jour, un petit oiseau arrive. Il regarde partout. Il a peur. Puis il mange vite et il part.

Le troisième jour, ils sont trois.

Maintenant, ils sont dix ou douze chaque matin !

Je les connais bien. Il y a un moineau très courageux : il arrive toujours le premier. Il n'a pas peur de moi.

Il y a un petit oiseau avec le ventre rouge. C'est un rouge-gorge. Il est timide et il attend son tour.

Et il y a un merle noir, plus grand que les autres. Il n'est pas gentil : il pousse les petits oiseaux !

Je les regarde avec mon café, derrière la fenêtre. Je ne bouge pas trop.

Ma fille aime beaucoup ça aussi. Elle compte les oiseaux : « Un, deux, trois, quatre... »

Au printemps, ils viennent moins. Ils trouvent de la nourriture ailleurs.

Mais en décembre, je remets des graines.

Et ils reviennent.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-090",
    title: "Une visite à la ferme",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Aujourd'hui, nous visitons une ferme avec les enfants.",
    blurbEn:
      "A farm visit with the children: cows, chickens, a very loud pig, and milk that comes from somewhere other than a supermarket. (Section: Animals, 2/5.)",
    body: `Aujourd'hui, nous visitons une ferme avec les enfants. La ferme est à trente minutes de la ville.

Le fermier s'appelle monsieur Duval. Il travaille ici depuis quarante ans.

D'abord, nous voyons les vaches. Elles sont grandes ! Elles sont blanches et marron. Elles mangent de l'herbe tranquillement.

« Combien de vaches avez-vous ? » demande ma fille.

« Quarante-deux », répond le fermier.

Ma fille touche une vache. Sa peau est chaude et un peu dure. La vache ne bouge pas.

Ensuite, nous allons voir les poules. Il y en a beaucoup ! Elles courent partout et elles font du bruit.

Le fermier montre une petite maison en bois. À l'intérieur, il y a des œufs. Ils sont encore chauds !

Mon fils est très surpris. « Les œufs viennent des poules ? » demande-t-il.

Le fermier rit. « Oui ! Ils ne viennent pas du supermarché ! »

Après, nous voyons un cochon. Il est énorme et très rose. Quand il nous voit, il fait un bruit terrible : « GROIIINK ! »

Les enfants ont un peu peur, puis ils rient beaucoup.

À la fin, nous achetons du fromage et des œufs.

Dans la voiture, mon fils dit : « Je veux habiter dans une ferme. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-091",
    title: "Le poisson rouge",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Pour ses sept ans, mon fils demande un animal.",
    blurbEn:
      "A seven-year-old wants a dog, gets a goldfish called Bubulle — and learns that even a small animal is a responsibility. (Section: Animals, 3/5.)",
    body: `Pour ses sept ans, mon fils demande un animal.

« Je veux un chien ! » dit-il.

Un chien, c'est beaucoup de travail. Il faut sortir trois fois par jour. Notre appartement est petit et nous travaillons toute la journée.

« Un chat, alors ? »

Ma femme est allergique aux chats.

Nous réfléchissons. Puis nous trouvons une solution : un poisson.

« Un poisson ? » dit mon fils. Il n'est pas très content. « Un poisson ne joue pas. »

« C'est vrai. Mais c'est un début. »

Nous allons dans un magasin. Nous achetons un aquarium, des petites pierres, une plante et un poisson rouge.

Mon fils choisit lui-même le poisson. Il le regarde longtemps.

Il l'appelle Bubulle.

À la maison, nous installons l'aquarium dans le salon. Bubulle nage doucement. Il explore sa nouvelle maison.

Mon fils le regarde pendant une heure entière !

Maintenant, c'est lui qui s'occupe de Bubulle. Chaque matin, il lui donne à manger. Un peu seulement : trop de nourriture, c'est mauvais.

Une fois par semaine, nous nettoyons l'aquarium ensemble.

Bubulle ne joue pas. C'est vrai.

Mais mon fils lui parle tous les jours.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-092",
    title: "Les animaux de la forêt",
    category: "science",
    difficulty: "A1",
    minutes: 2,
    preview: "Dans la forêt, il y a beaucoup d'animaux. Mais on ne les voit pas.",
    blurbEn:
      "The forest is full of animals you never see — unless you walk slowly, stay quiet, and go early. (Section: Animals, 4/5.)",
    body: `Dans la forêt près de chez moi, il y a beaucoup d'animaux. Mais normalement, on ne les voit pas.

Pourquoi ? Parce que les animaux nous entendent avant. Nous marchons vite, nous parlons, nous faisons du bruit. Alors ils partent.

Un ami me donne un conseil : « Va tôt le matin. Marche lentement. Ne parle pas. Et attends. »

Alors, dimanche, je pars à six heures et demie.

La forêt est différente le matin. Il y a de la brume entre les arbres. Il fait frais. Tout est très calme.

Je marche doucement pendant vingt minutes. Puis je m'assois sur un vieil arbre tombé.

J'attends. Cinq minutes. Dix minutes. Je ne bouge pas.

Et puis, quelque chose bouge à ma droite.

C'est un écureuil ! Il monte sur un arbre très vite. Il tient quelque chose dans sa bouche.

Un peu plus tard, j'entends un bruit. Je tourne la tête lentement.

Un chevreuil ! Il est à quinze mètres. Il mange de l'herbe. Il est brun, avec de grands yeux noirs.

Il lève la tête. Il me regarde.

Nous nous regardons pendant cinq secondes.

Puis il part en courant, sans bruit.

Cinq secondes seulement. Mais je m'en souviendrai longtemps.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-093",
    title: "Le refuge pour animaux",
    category: "everyday life",
    difficulty: "A1",
    minutes: 2,
    preview: "Le samedi, je travaille au refuge pour animaux.",
    blurbEn:
      "Volunteering at an animal shelter: walking dogs nobody wants, cleaning cages, and the joy when one of them finds a family. (Section: Animals, 5/5.)",
    body: `Le samedi matin, je vais au refuge pour animaux. Je suis bénévole : je ne gagne pas d'argent, je viens aider.

Le refuge est à l'extérieur de la ville. Il y a environ quarante chiens et trente chats.

Ces animaux n'ont pas de maison. Certains sont perdus. D'autres sont abandonnés par leur famille. C'est triste.

J'arrive à neuf heures. Le bruit est incroyable : tous les chiens aboient !

Mon travail est simple. D'abord, je nettoie les cages. Ce n'est pas agréable, mais c'est nécessaire.

Ensuite, je donne à manger et à boire.

Et après, le meilleur moment : je promène les chiens.

Chaque chien sort trente minutes. Ils sont tellement contents ! Ils courent, ils sentent tout, ils sont heureux.

Il y a un vieux chien noir. Il s'appelle Rex. Il est ici depuis deux ans. Personne ne le veut, parce qu'il est vieux.

Rex est mon préféré. Il est calme et très gentil.

Le mois dernier, une famille vient au refuge. Ils cherchent un chien calme, pas un jeune chien.

Ils choisissent Rex.

Le jour de son départ, je suis triste et content en même temps.

Rex a une maison maintenant.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-094",
    title: "Bonjour et la bise",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "En France, on dit bonjour à tout le monde.",
    blurbEn:
      "Saying hello in France: 'bonjour' to everyone, and the famous cheek-kiss that confuses British visitors. (Section: Life in France, 1/5.)",
    body: `En France, il y a une règle très importante : on dit toujours bonjour.

Quand on entre dans un magasin, on dit « Bonjour ». Quand on monte dans un bus, on dit bonjour au chauffeur. Chez le médecin, dans l'ascenseur avec un voisin : bonjour.

Si on ne dit pas bonjour, les gens pensent qu'on est impoli.

Mon ami anglais, Tom, ne comprend pas au début. En Angleterre, on n'entre pas dans un magasin pour dire bonjour au vendeur. On regarde, c'est tout.

La première fois, Tom entre dans une boulangerie et il demande directement : « Une baguette, s'il vous plaît. »

La boulangère le regarde. Elle attend.

« Bonjour ! » dit-elle, un peu froidement.

« Ah ! Bonjour ! » répond Tom, très surpris.

Il y a aussi la bise. Entre amis et en famille, on ne serre pas la main : on fait la bise. On touche la joue de l'autre personne, à droite et à gauche.

Mais attention : le nombre change ! À Paris, c'est deux bises. Dans le sud, souvent trois. Dans certaines régions, quatre !

Tom trouve ça très compliqué. « Deux ou trois ? Je ne sais jamais ! »

Une fois, il tourne la tête au mauvais moment.

Maintenant, il attend toujours une seconde.

C'est plus sûr.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-095",
    title: "Les repas en France",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "En France, on mange à des heures fixes.",
    blurbEn:
      "French meal times are fixed and long: no dinner at six, cheese before dessert, and lunch that can last two hours. (Section: Life in France, 2/5.)",
    body: `En France, les repas sont importants. Et les heures sont assez fixes.

Le petit déjeuner est simple : un café, du pain, parfois un croissant le week-end. Ce n'est pas un grand repas.

Le déjeuner est à midi ou à midi et demi. Beaucoup de gens s'arrêtent vraiment de travailler pour manger.

Le dîner est tard : à huit heures, parfois plus tard.

Mon ami Tom vient d'Angleterre. Chez lui, on dîne à six heures, ou même à cinq heures et demie.

La première semaine en France, il a très faim à six heures ! Il attend deux heures. C'est long.

Maintenant, il comprend le goûter : à quatre heures, on mange un petit quelque chose. Comme ça, on peut attendre huit heures.

Il y a aussi l'ordre des plats. En France, on mange souvent une entrée, puis un plat, puis du fromage, puis un dessert.

Le fromage arrive avant le dessert. Toujours.

« Pourquoi ? » demande Tom.

Bonne question. C'est la tradition, voilà tout.

Et le repas est long. Un déjeuner du dimanche peut durer deux heures ou trois heures.

On mange, mais surtout, on parle.

« En Angleterre, dit Tom, on mange en trente minutes. »

« Alors reste ici », je réponds. « C'est plus agréable. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-096",
    title: "Le dimanche, tout est fermé",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "Le dimanche en France, beaucoup de magasins sont fermés.",
    blurbEn:
      "Sunday in France: closed shops, open bakeries, empty streets in the morning — and why the day feels different from a British Sunday. (Section: Life in France, 3/5.)",
    body: `Le dimanche en France, beaucoup de magasins sont fermés.

Les grands supermarchés ferment souvent à midi, ou ils n'ouvrent pas du tout. Les magasins de vêtements sont fermés. Les banques aussi, bien sûr.

Mon ami Tom trouve ça difficile au début.

Un dimanche, il veut acheter une lampe pour son appartement. Il va en ville. Tout est fermé ! Il rentre à la maison sans lampe.

« En Angleterre, dit-il, les magasins sont ouverts le dimanche. Pas toute la journée, mais ils sont ouverts. »

Mais il y a des exceptions en France. La boulangerie est ouverte le dimanche matin. C'est très important : il faut du pain frais pour le déjeuner !

Le marché est ouvert aussi, souvent le dimanche matin. Il y a beaucoup de monde.

Et les cafés et les restaurants sont ouverts.

Le dimanche matin, la ville est calme. Il n'y a pas beaucoup de voitures. Les gens dorment plus longtemps.

Vers onze heures, les rues se remplissent. Les gens sortent de la boulangerie avec du pain et des gâteaux.

L'après-midi, les familles se promènent dans le parc.

Tom achète sa lampe le lundi.

Et maintenant, il aime bien les dimanches français. « On ne fait rien, dit-il. C'est reposant. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-097",
    title: "Les vacances scolaires",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "En France, les élèves ont beaucoup de vacances.",
    blurbEn:
      "French school holidays: two weeks every six weeks, two months in summer — and the great August exodus when cities empty out. (Section: Life in France, 4/5.)",
    body: `En France, les élèves ont beaucoup de vacances.

Il y a des vacances toutes les six ou sept semaines. Elles durent deux semaines.

Il y a les vacances de la Toussaint en octobre, les vacances de Noël en décembre, les vacances d'hiver en février et les vacances de printemps en avril.

Et puis, il y a les grandes vacances : deux mois complets, en juillet et en août !

Mon ami Tom est surpris. « Deux mois ? En Angleterre, c'est six semaines. »

Les grandes vacances changent tout le pays.

En juillet et en août, beaucoup de familles partent. Elles vont à la mer, à la montagne, ou chez les grands-parents.

Au mois d'août, les grandes villes sont différentes. Beaucoup de gens partent en vacances. Certains magasins ferment pendant trois semaines. Sur la porte, il y a un petit papier : « Fermé pour congés. »

Paris est presque vide au mois d'août. C'est étrange et agréable : il n'y a pas d'embouteillages.

Sur les routes, c'est le contraire. Le premier week-end d'août, il y a des kilomètres de voitures.

À la rentrée, en septembre, tout le monde revient. Les enfants racontent leurs vacances.

Et huit semaines plus tard, ce sont déjà les vacances de la Toussaint.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a1-098",
    title: "Le café français et le thé anglais",
    category: "culture",
    difficulty: "A1",
    minutes: 2,
    preview: "En France, on boit du café. En Angleterre, on boit du thé.",
    blurbEn:
      "Coffee in France, tea in England: two small cultures of drinking, two different ways of taking a break. (Section: Life in France, 5/5.)",
    body: `En France, on boit beaucoup de café. En Angleterre, on boit beaucoup de thé. C'est une petite différence, mais elle raconte beaucoup de choses.

Le café français est petit et fort. On l'appelle un « expresso ». On le boit vite, debout, au comptoir du café. Ça prend deux minutes.

Le matin, dans un café français, il y a des gens debout. Ils boivent leur café, ils disent un mot au serveur, et ils partent travailler.

Le café coûte moins cher au comptoir qu'à une table. C'est vrai partout en France !

Mon ami Tom trouve le café français très fort. « C'est tout petit ! » dit-il la première fois. « Où est le reste ? »

En Angleterre, le thé est différent. On le boit lentement, dans une grande tasse, souvent avec du lait.

Le thé anglais est un moment. On s'assoit. On parle. Ça prend vingt minutes.

Quand je vais chez Tom, sa mère demande toujours : « Un thé ? » C'est la première question, avant tout.

En France, quand quelqu'un arrive à la maison, on demande : « Un café ? »

Alors, le café ou le thé ?

Chez moi, maintenant, il y a les deux.

Et quand Tom vient, je fais du thé. Avec du lait.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-038",
    title: "Hier, quelle journée !",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Hier, j'ai eu une journée très longue.",
    blurbEn:
      "Camille recounts a very long day in the past tense: an early meeting, a lost document, and a small victory at six o'clock. (Section: Telling the past, 1/5.)",
    body: `Hier, j'ai eu une journée très longue. Je m'en souviendrai longtemps !

Tout a commencé à cinq heures et demie du matin. J'avais une réunion importante à huit heures, alors je me suis levée très tôt. Dehors, il faisait encore nuit.

J'ai pris un café rapidement, puis je suis partie. Pendant le trajet, j'ai relu mes documents dans le train.

Quand je suis arrivée au bureau, il y avait déjà du monde. Mon collègue Samir m'a dit : « Tu es prête ? »

« Je crois », j'ai répondu.

La réunion a bien commencé. J'ai présenté mon projet et les clients ont posé beaucoup de questions. Mais soudain, j'ai cherché un document important... et il n'était pas là ! Je l'avais oublié chez moi.

J'ai eu très chaud. Alors j'ai expliqué le problème avec des mots simples, sans le papier. Et finalement, ça a marché.

À midi, j'étais épuisée. J'ai mangé un sandwich devant mon ordinateur parce que j'avais encore beaucoup de travail.

L'après-midi est passé très vite. J'ai répondu à quarante messages et j'ai téléphoné à six personnes.

À six heures, mon patron est venu me voir. Il a souri.

« Les clients ont accepté ton projet. Bravo. »

Je suis rentrée chez moi à sept heures et demie. J'étais fatiguée, mais très contente.

Ce soir-là, je me suis couchée à neuf heures.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-039",
    title: "Le week-end dernier",
    category: "everyday life",
    difficulty: "A2",
    minutes: 2,
    preview: "Le week-end dernier, je n'ai rien fait d'extraordinaire.",
    blurbEn:
      "An ordinary weekend told simply: a long lie-in, a walk by the river, a film, and Sunday lunch with friends. (Section: Telling the past, 2/5.)",
    body: `Le week-end dernier, je n'ai rien fait d'extraordinaire. Et c'était parfait.

Samedi matin, je me suis réveillée tard, vers dix heures. Je n'avais pas mis de réveil parce que je voulais dormir. Quand j'ai ouvert les rideaux, il faisait beau.

J'ai pris un petit déjeuner tranquille : du pain, de la confiture et un grand café. J'ai lu pendant une heure, encore en pyjama.

L'après-midi, je suis sortie marcher au bord de la rivière. Il y avait beaucoup de gens : des familles, des cyclistes, un homme qui jouait de la guitare. Je me suis assise sur un banc et je suis restée là vingt minutes, sans rien faire.

Le soir, j'ai regardé un film chez moi. Je voulais aller au cinéma, mais finalement j'étais trop bien sur mon canapé.

Dimanche, mes amis Léa et Karim sont venus déjeuner. J'ai préparé des pâtes et une salade, et Léa a apporté une tarte aux pommes.

Nous avons mangé pendant deux heures, puis nous avons parlé jusqu'à cinq heures. Nous avons beaucoup ri.

Quand ils sont partis, j'ai fait la vaisselle et j'ai rangé un peu.

Dimanche soir, j'ai préparé mes affaires pour lundi. J'étais un peu triste : le week-end était fini.

Mais j'étais reposée. Et ça, c'est le plus important.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-040",
    title: "Mon premier jour dans cette ville",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Je suis arrivée dans cette ville il y a cinq ans.",
    blurbEn:
      "Arriving alone in a new city five years ago: an empty flat, a wrong bus, and a neighbour who knocked on the door. (Section: Telling the past, 3/5.)",
    body: `Je suis arrivée dans cette ville il y a cinq ans, au mois de septembre. Je me souviens très bien de ce jour.

J'avais vingt-quatre ans et je ne connaissais personne ici. J'avais trouvé un travail, alors j'ai déménagé seule, avec deux valises et quelques cartons.

Quand je suis entrée dans mon nouvel appartement, il était complètement vide. Il n'y avait pas de rideaux, pas de meubles, rien. Le sol était froid et l'appartement sentait la peinture.

Je me suis assise par terre au milieu de la pièce et j'ai pensé : « Qu'est-ce que je fais ici ? »

L'après-midi, je suis sortie acheter des choses pour manger. Mais je ne connaissais pas le quartier et je me suis perdue. J'ai pris le bus dans le mauvais sens ! Je suis arrivée à l'autre bout de la ville.

Quand je suis rentrée, il était huit heures du soir. J'avais faim et j'étais fatiguée.

Puis quelqu'un a frappé à la porte. C'était ma voisine, une dame de soixante ans.

« Bonsoir ! J'ai vu que vous étiez nouvelle. Vous avez mangé ? »

J'ai dit non. Alors elle m'a invitée à dîner chez elle.

Nous avons mangé une soupe et nous avons parlé pendant deux heures.

Cinq ans plus tard, cette dame est toujours ma voisine. Et nous dînons encore ensemble, une fois par mois.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-041",
    title: "Un souvenir d'enfance",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Quand j'étais petite, je passais tous les étés chez ma grand-mère.",
    blurbEn:
      "Childhood summers at grandma's house in the country: the imperfect tense for how things always were, and one afternoon in particular. (Section: Telling the past, 4/5.)",
    body: `Quand j'étais petite, je passais tous les étés chez ma grand-mère, à la campagne.

Sa maison était vieille et un peu sombre. Il y avait un grand jardin derrière, avec des arbres et un vieux mur en pierre.

Chaque matin, je me réveillais avec le bruit des oiseaux. Ma grand-mère était déjà dans la cuisine. Elle préparait toujours du chocolat chaud, même en été.

Après le petit déjeuner, je sortais dans le jardin et je jouais pendant des heures. Je n'avais pas de jouets, mais ça ne me manquait pas. Je construisais des maisons avec des pierres et des feuilles.

L'après-midi, quand il faisait trop chaud, nous restions à l'intérieur. Ma grand-mère cousait et moi, je dessinais à côté d'elle. Nous ne parlions pas beaucoup. C'était très calme.

Mais je me souviens surtout d'un après-midi. J'avais peut-être sept ans. Il y avait un grand orage : le ciel est devenu noir et la pluie est tombée très fort.

J'avais peur, alors ma grand-mère m'a prise sur ses genoux. Nous avons regardé la pluie par la fenêtre et elle m'a raconté une histoire de son enfance.

L'orage a duré une heure. Après, le jardin sentait la terre mouillée.

Ma grand-mère est morte il y a dix ans. Mais quand il pleut très fort, je pense toujours à cet après-midi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-042",
    title: "Le jour où j'ai changé d'avis",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Il y a deux ans, j'ai failli quitter mon travail.",
    blurbEn:
      "Two years ago the narrator had written a resignation letter — then a single conversation changed the decision entirely. (Section: Telling the past, 5/5.)",
    body: `Il y a deux ans, j'ai failli quitter mon travail. Aujourd'hui, je suis contente d'être restée.

À cette époque, j'étais malheureuse. Je travaillais beaucoup, mais je ne voyais pas le résultat. Mon équipe était petite et nous avions trop de projets. Chaque soir, je rentrais épuisée.

Un lundi matin, j'ai pris ma décision. J'ai écrit une lettre de démission sur mon ordinateur et je l'ai imprimée. Je voulais la donner à ma patronne l'après-midi.

Mais pendant le déjeuner, j'ai parlé avec une collègue, Aïcha. Elle travaillait dans l'entreprise depuis douze ans.

Je lui ai tout expliqué. Elle a écouté sans m'interrompre.

Puis elle m'a dit : « Je comprends. Mais avant de partir, est-ce que tu as parlé à ta patronne du problème ? »

J'ai réfléchi. Non. Je n'avais jamais rien dit. Je pensais que c'était inutile.

Alors, cet après-midi, je suis allée voir ma patronne. Mais je n'ai pas donné ma lettre. À la place, j'ai expliqué la situation honnêtement.

Elle a été surprise. « Pourquoi tu ne m'as pas parlé plus tôt ? »

Nous avons discuté pendant une heure. Deux semaines plus tard, elle a embauché une personne de plus dans mon équipe.

Aujourd'hui, mon travail me plaît de nouveau.

J'ai gardé la lettre dans un tiroir. Elle me rappelle une leçon : il faut parler avant de partir.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-043",
    title: "J'ai essayé une nouvelle recette",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Samedi, j'ai décidé d'essayer une recette marocaine.",
    blurbEn:
      "A first attempt at a Moroccan tagine: unfamiliar spices, a long slow cook, and a dish that turned out better than expected. (Section: Cooking and eating out, 1/5.)",
    body: `Samedi dernier, j'ai décidé d'essayer une nouvelle recette. Je cuisine souvent les mêmes plats, alors je voulais changer un peu.

Ma collègue Aïcha m'avait donné la recette d'un tajine, un plat marocain. Elle m'avait dit : « C'est facile, mais il faut du temps. »

D'abord, je suis allée faire les courses. Il me fallait du poulet, des oignons, des citrons, des olives et beaucoup d'épices. Je ne connaissais pas certaines épices, alors j'ai demandé au vendeur. Il m'a bien expliqué.

À la maison, j'ai commencé à quatre heures. J'ai coupé les oignons et j'ai pleuré, comme toujours ! Puis j'ai mis le poulet dans une grande casserole avec un peu d'huile.

Ensuite, j'ai ajouté les épices. La cuisine sentait merveilleusement bon. C'était une odeur complètement nouvelle pour moi.

J'ai ajouté les citrons, les olives et un peu d'eau. Puis j'ai baissé le feu et j'ai attendu.

Le plat a cuit pendant une heure et demie. Pendant ce temps, j'ai rangé la cuisine et j'ai mis la table.

Quand mon frère est arrivé à sept heures, il a dit : « Waouh ! Qu'est-ce que ça sent bon ! »

Nous avons mangé le tajine avec du pain. C'était délicieux, vraiment.

J'ai envoyé un message à Aïcha : « Merci ! Je vais le refaire. »

Elle a répondu : « La prochaine fois, viens le manger chez moi. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-044",
    title: "Le petit restaurant du coin",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Il y a un petit restaurant en bas de ma rue.",
    blurbEn:
      "The lunchtime 'formule' at a tiny neighbourhood restaurant: no printed menu, a blackboard, and whatever the owner cooked that morning. (Section: Cooking and eating out, 2/5.)",
    body: `Il y a un petit restaurant en bas de ma rue. Il n'est pas beau et il n'est pas célèbre. Mais j'y vais souvent, et je vais vous expliquer pourquoi.

Le restaurant a seulement huit tables. Le patron s'appelle Bruno et il cuisine lui-même. Sa femme sert les clients.

Il n'y a pas de carte imprimée. Sur le mur, il y a un tableau noir et Bruno écrit le menu du jour à la craie, chaque matin. Il y a deux entrées, deux plats et deux desserts. C'est tout.

Pourquoi si peu de choix ? Parce que Bruno achète les produits au marché le matin. Il cuisine ce qu'il a trouvé de bon et de frais.

À midi, il propose une « formule » : une entrée et un plat pour quinze euros. Beaucoup de gens qui travaillent dans le quartier viennent manger ici.

La première fois, j'y suis allée seule. J'étais un peu gênée, mais la femme de Bruno m'a mise à l'aise tout de suite.

« Vous êtes nouvelle dans le quartier ? »

Nous avons parlé cinq minutes, et depuis, elle se souvient toujours de moi.

Ce midi, j'ai mangé une soupe de légumes et un poisson avec du riz. C'était simple et vraiment bon.

Quand je suis partie, Bruno est sorti de la cuisine pour dire au revoir.

Dans un grand restaurant, ça n'arrive jamais.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-045",
    title: "Un dîner chez des amis",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Samedi soir, nous étions invités chez Léa et Karim.",
    blurbEn:
      "Dinner at friends' place: arriving a little late on purpose, bringing something, and a table that nobody leaves before midnight. (Section: Cooking and eating out, 3/5.)",
    body: `Samedi soir, nous étions invités chez nos amis Léa et Karim. Ils nous avaient invités pour huit heures.

En France, il y a une petite règle amusante : il ne faut pas arriver exactement à l'heure. Si on arrive à huit heures pile, les hôtes ne sont peut-être pas prêts. Alors nous sommes arrivés à huit heures et quart.

Nous n'arrivons jamais les mains vides. J'avais apporté une bouteille de vin et mon mari avait acheté des fleurs.

Léa nous a accueillis avec un grand sourire. Karim était encore dans la cuisine.

D'abord, nous avons pris l'apéritif dans le salon. Il y avait des olives, des petits gâteaux salés et des tomates cerises. Nous avons parlé du travail, des vacances, des enfants.

L'apéritif a duré presque une heure. C'est normal : c'est un moment important du repas.

Puis nous sommes passés à table. Karim avait préparé un poulet avec des légumes du marché. Il était un peu inquiet : « C'est la première fois que je fais ce plat. » Mais c'était excellent.

Après le plat, il y avait du fromage, puis une tarte au citron.

Nous avons parlé pendant des heures. Personne ne regardait sa montre.

Quand nous sommes partis, il était minuit et demi.

Dans la voiture, mon mari a dit : « Nous devons les inviter chez nous maintenant. »

Il avait raison. C'est notre tour.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-046",
    title: "Le poissonnier du marché",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Je ne savais pas cuisiner le poisson. Alors j'ai demandé.",
    blurbEn:
      "Learning to cook fish by asking the man who sells it — and discovering that a good stallholder will teach you for free. (Section: Cooking and eating out, 4/5.)",
    body: `Pendant longtemps, je n'ai jamais cuisiné de poisson. J'avais peur : je ne savais pas comment le choisir ni comment le préparer. Alors j'achetais toujours de la viande.

Un samedi, au marché, je me suis arrêtée devant le poissonnier. Il y avait beaucoup de poissons sur la glace. Je les regardais sans comprendre.

Le poissonnier m'a vue. « Je peux vous aider ? »

J'ai été honnête : « Je voudrais essayer, mais je ne connais rien au poisson. »

Il a souri. « Alors je vais vous expliquer. »

Il m'a montré comment choisir un poisson frais. « Regardez les yeux : ils doivent être clairs, pas gris. Et sentez : un poisson frais ne sent presque rien. »

Ensuite, il m'a conseillé un poisson simple pour débuter. « Prenez celui-ci. Vous le mettez au four vingt minutes avec du citron, de l'huile et un peu de sel. C'est tout. Ne faites rien de compliqué. »

Il l'a préparé pour moi et il l'a emballé.

Le soir, j'ai suivi ses conseils exactement. J'ai mis le poisson au four à deux cents degrés pendant vingt minutes.

C'était parfait. Vraiment parfait.

Maintenant, j'y retourne chaque semaine. Le poissonnier me reconnaît et il me donne toujours une idée nouvelle.

La semaine dernière, il m'a dit : « Vous voyez ? Ce n'était pas difficile. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-047",
    title: "J'ai raté mon gâteau",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Pour l'anniversaire de ma nièce, j'ai voulu faire un gâteau.",
    blurbEn:
      "A birthday cake goes badly wrong — flat, burnt at the edges — and a seven-year-old saves the day with a bag of sweets. (Section: Cooking and eating out, 5/5.)",
    body: `Pour l'anniversaire de ma nièce Chloé, j'ai voulu faire un gâteau au chocolat moi-même. C'était une mauvaise idée.

J'avais trouvé une recette sur internet. Sur la photo, le gâteau était magnifique : haut, brillant, parfait.

J'ai commencé à deux heures. J'ai cassé les œufs, j'ai fait fondre le chocolat, j'ai ajouté la farine et le sucre. Tout allait bien.

Mais je n'avais pas de balance. Alors j'ai deviné les quantités. « Deux cents grammes de farine ? Ça doit être à peu près comme ça. »

Première erreur.

J'ai mis le gâteau au four. La recette disait trente minutes à cent quatre-vingts degrés. Mais mon four est vieux et il chauffe trop.

Deuxième erreur : je ne l'ai pas surveillé. Pendant ce temps, je répondais à des messages.

Après vingt-cinq minutes, j'ai senti quelque chose. J'ai ouvert le four : le gâteau était noir sur les bords et complètement plat au milieu.

Il ne ressemblait pas du tout à la photo.

J'ai eu envie de pleurer. Puis j'ai eu envie de rire.

Alors j'ai coupé les bords noirs et j'ai mis du sucre dessus pour cacher le reste.

Quand Chloé est arrivée, elle a regardé le gâteau. Elle a sept ans, alors elle est honnête.

« Il est bizarre, ton gâteau. »

« Je sais. »

Puis elle a sorti des bonbons de sa poche et elle les a posés dessus.

« Voilà ! Maintenant il est beau. »

Nous l'avons mangé. Et il était bon.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-048",
    title: "Une longue liste de choses à faire",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Samedi matin, j'avais six choses à faire en ville.",
    blurbEn:
      "Six errands in one Saturday morning, planned in the right order to avoid walking twice — and one shop that was closed anyway. (Section: Errands in town, 1/5.)",
    body: `Samedi matin, j'avais une longue liste de choses à faire en ville. Six choses exactement.

J'avais tout écrit sur un papier :
- aller à la poste
- passer à la banque
- acheter du pain
- récupérer mes chaussures chez le cordonnier
- prendre un médicament à la pharmacie
- acheter un cadeau pour Chloé

Avant de partir, j'ai réfléchi à l'ordre. C'est important : sinon, on marche deux fois dans la même rue. La poste et la banque sont sur la même place, alors j'ai commencé par là.

Je suis partie à neuf heures. Il faisait frais, mais le soleil brillait.

D'abord, la poste. Il y avait une queue de sept personnes ! J'ai attendu vingt minutes. Ensuite, la banque, juste en face : c'était plus rapide.

Après, je suis allée chez le cordonnier. Mes chaussures étaient prêtes et il ne m'a pris que douze euros. J'étais contente.

Puis la pharmacie, où la pharmacienne m'a bien expliqué le médicament.

Ensuite, le magasin de jouets pour le cadeau de ma nièce. J'ai hésité longtemps, puis j'ai choisi un jeu de construction.

Enfin, la boulangerie. Mais quand je suis arrivée, il y avait un papier sur la porte : « Fermé le samedi après-midi. »

Il était une heure et quart. Trop tard !

Cinq choses sur six. Pour le pain, ce sera demain.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-049",
    title: "À la poste",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Je devais envoyer un colis à ma sœur au Canada.",
    blurbEn:
      "Sending a parcel abroad: forms, weight, two prices, and a decision between fast and expensive or slow and cheap. (Section: Errands in town, 2/5.)",
    body: `Je devais envoyer un colis à ma sœur, qui habite au Canada. C'était son anniversaire dans deux semaines.

J'avais mis dans une boîte un livre, une écharpe et des biscuits français, parce qu'elle adore ça.

À la poste, j'ai pris un ticket : numéro 34. Sur l'écran, il y avait le numéro 27. J'ai attendu.

Pendant ce temps, j'ai regardé autour de moi. Une dame envoyait des lettres. Un homme retirait de l'argent. Un jeune homme achetait des timbres.

Quand mon tour est arrivé, l'employée m'a demandé : « Bonjour, c'est pour quoi ? »

« Je voudrais envoyer ce colis au Canada, s'il vous plaît. »

Elle a mis la boîte sur une balance. « Un kilo trois cents. Il y a des objets fragiles ? »

« Non, mais il y a des biscuits. »

Elle m'a donné un formulaire à remplir. Il fallait écrire l'adresse, mais aussi ce qu'il y avait dans le colis et la valeur.

Puis elle m'a proposé deux options : « En express, il arrive dans cinq jours : quarante-deux euros. En normal, entre deux et trois semaines : dix-neuf euros. »

J'ai réfléchi. Deux ou trois semaines, c'était trop long pour l'anniversaire. Mais quarante-deux euros, c'était plus cher que le cadeau !

Finalement, j'ai choisi l'express.

Ma sœur a reçu le colis quatre jours plus tard. Elle m'a envoyé une photo : elle mangeait déjà les biscuits.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-050",
    title: "Chez le coiffeur",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Je n'étais pas allée chez le coiffeur depuis huit mois.",
    blurbEn:
      "Eight months without a haircut, a vague instruction, and the moment in front of the mirror when it's much shorter than planned. (Section: Errands in town, 3/5.)",
    body: `Je n'étais pas allée chez le coiffeur depuis huit mois. Mes cheveux étaient beaucoup trop longs.

J'ai téléphoné jeudi pour prendre rendez-vous. « Samedi à onze heures, ça vous va ? » m'a-t-on demandé. J'ai dit oui.

Samedi, je suis arrivée un peu en avance. Le salon était plein et il y avait de la musique. Ça sentait le shampooing.

Une jeune femme m'a installée devant un miroir. « Alors, qu'est-ce qu'on fait aujourd'hui ? »

Et là, j'ai fait une erreur. Je ne savais pas exactement ce que je voulais, alors j'ai répondu : « Juste un peu plus court, s'il vous plaît. »

« Un peu plus court », c'est très vague. Cinq centimètres ? Quinze ?

Elle a d'abord lavé mes cheveux. C'était très agréable : l'eau chaude, le massage. J'ai presque dormi.

Ensuite, elle a commencé à couper. Je regardais les cheveux tomber par terre. Beaucoup de cheveux.

Quand elle a fini, elle a tourné le miroir. « Voilà ! Ça vous plaît ? »

J'ai regardé. C'était court. Vraiment court. Bien plus court que dans ma tête.

J'ai dit : « C'est... très bien, merci. »

Dans la rue, j'étais un peu triste. Mais le soir, mon mari a dit : « Tu as l'air plus jeune ! »

Et le lundi, deux collègues m'ont fait des compliments.

Finalement, j'aime beaucoup. Mais la prochaine fois, j'apporterai une photo.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-051",
    title: "Un problème à la banque",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Mardi, ma carte bancaire n'a pas marché au supermarché.",
    blurbEn:
      "A bank card that stops working in a supermarket queue, a phone call that goes nowhere, and a real person who solves it in ten minutes. (Section: Errands in town, 4/5.)",
    body: `Mardi, au supermarché, ma carte bancaire n'a pas marché.

J'avais un chariot plein et il y avait quatre personnes derrière moi. La caissière a essayé deux fois. « Carte refusée », disait la machine.

J'étais très gênée. Heureusement, j'avais un peu d'argent liquide dans mon sac, alors j'ai pu payer.

Mais je ne comprenais pas pourquoi. J'étais sûre d'avoir de l'argent sur mon compte.

Le soir, j'ai regardé sur internet. Mon compte allait bien. Alors quel était le problème ?

J'ai téléphoné à ma banque. J'ai attendu quinze minutes avec une musique horrible. Puis une voix a dit : « Toutes nos lignes sont occupées. Rappelez plus tard. » Et ça a coupé !

J'étais énervée.

Le lendemain matin, je suis allée directement à l'agence. J'ai attendu dix minutes, puis un conseiller m'a reçue.

Je lui ai expliqué le problème. Il a regardé son ordinateur pendant une minute.

« Ah, je vois. Votre carte a expiré à la fin du mois dernier. Nous vous avons envoyé une nouvelle carte il y a trois semaines. »

Une nouvelle carte ? Je n'avais rien reçu.

Puis j'ai réfléchi... et j'ai compris. Il y avait une enveloppe de la banque sur mon bureau, à la maison. Je ne l'avais jamais ouverte.

Le conseiller a souri. « Ça arrive souvent, vous savez. »

Le soir, j'ai ouvert l'enveloppe. Ma nouvelle carte était dedans.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-052",
    title: "Le bureau des objets trouvés",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "J'ai oublié mon parapluie dans le tram. Je suis allé le chercher.",
    blurbEn:
      "A lost umbrella leads to the lost-property office, a room full of forgotten things, and a surprising conversation about what people leave behind. (Section: Errands in town, 5/5.)",
    body: `La semaine dernière, j'ai oublié mon parapluie dans le tram. Ce n'était pas un parapluie ordinaire : c'était un cadeau de mon grand-père.

Le soir, j'ai cherché sur internet et j'ai trouvé l'adresse du bureau des objets trouvés. Il était ouvert du lundi au vendredi, de neuf heures à midi.

Jeudi matin, j'y suis allé. Le bureau était petit et il n'y avait personne, sauf un employé derrière un comptoir.

« Bonjour, j'ai perdu un parapluie dans le tram lundi soir. »

« Quelle ligne ? »

« La ligne B. »

Il a écrit quelque chose, puis il a disparu dans une pièce derrière lui.

Pendant qu'il cherchait, j'ai regardé par la porte ouverte. Cette pièce était incroyable ! Il y avait des étagères du sol au plafond, remplies d'objets : des sacs, des manteaux, des livres, des lunettes, des jouets. Il y avait même une guitare et un vélo d'enfant.

L'employé est revenu avec trois parapluies. « C'est l'un de ceux-là ? »

Le deuxième était le mien ! Noir, avec une poignée en bois.

Il m'a demandé une pièce d'identité et j'ai signé un papier.

« Vous avez de la chance », m'a-t-il dit. « Les gens ne viennent presque jamais chercher leurs affaires. Nous gardons tout pendant un an, puis nous donnons les objets. »

En partant, j'ai regardé encore les étagères.

Toutes ces choses attendent quelqu'un.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-053",
    title: "Mon job d'été",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "L'été de mes dix-huit ans, j'ai travaillé dans un camping.",
    blurbEn:
      "A first summer job at a campsite: cleaning, tired feet, difficult customers — and a first pay slip that felt enormous. (Section: First jobs, 1/5.)",
    body: `L'été de mes dix-huit ans, j'ai travaillé dans un camping au bord de la mer. C'était mon premier vrai travail.

J'avais envoyé mon CV à dix endroits différents. Un seul m'a répondu : le camping « Les Pins ». Le patron m'a téléphoné et il m'a embauché pour deux mois, en juillet et en août.

Mon travail n'était pas très intéressant. Le matin, je nettoyais les sanitaires. L'après-midi, je ramassais les poubelles et je balayais les allées. Le soir, j'aidais à l'accueil.

Je commençais à sept heures et je finissais à seize heures, six jours par semaine.

C'était fatigant. À la fin de la journée, j'avais mal aux jambes et au dos. Je n'avais jamais imaginé qu'un travail physique était si dur.

Certains clients étaient très gentils. D'autres étaient difficiles : ils se plaignaient de tout, et parfois ils me parlaient mal. Au début, ça me blessait beaucoup.

Un collègue plus âgé m'a donné un conseil : « Ne le prends pas personnellement. Ils sont en vacances et ils sont stressés. Ce n'est pas contre toi. »

Il avait raison, et ça m'a beaucoup aidé.

À la fin du mois de juillet, j'ai reçu mon premier salaire : mille deux cents euros. J'ai regardé le papier pendant cinq minutes. C'était mon argent, gagné par mon travail.

Ce job n'était pas mon rêve. Mais il m'a appris deux choses : la valeur de l'argent, et le respect pour les gens qui font ces métiers toute leur vie.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-054",
    title: "Un entretien pour un petit boulot",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "J'avais rendez-vous à quatorze heures pour un poste de serveur.",
    blurbEn:
      "A short interview for a waiter's job: nerves, honest answers about no experience, and one question that got the job. (Section: First jobs, 2/5.)",
    body: `Le mois dernier, j'ai passé un entretien pour un petit boulot de serveur dans un café. J'avais rendez-vous à quatorze heures.

J'étais nerveux. C'était mon premier entretien et je n'avais aucune expérience dans un restaurant.

Avant de partir, ma sœur m'a aidé. « Habille-toi correctement, arrive en avance, et regarde la personne dans les yeux. »

Je suis arrivé à deux heures moins dix. La patronne du café s'appelait madame Fournier. Elle m'a fait asseoir à une table, dans le café vide.

Elle a regardé mon CV pendant quelques secondes. Il était très court.

« Vous n'avez jamais travaillé dans la restauration ? »

« Non », j'ai répondu. J'avais envie de mentir un peu, mais je ne l'ai pas fait. « Mais j'apprends vite et je suis sérieux. »

Elle a posé d'autres questions. Est-ce que je pouvais travailler le week-end ? Est-ce que j'étais disponible le soir ? Comment est-ce que je réagissais quand un client n'était pas content ?

Cette dernière question était difficile. J'ai réfléchi, puis j'ai répondu : « J'écouterais d'abord, et j'irais chercher quelqu'un si je ne savais pas quoi faire. »

Elle a fait un petit signe de la tête.

À la fin, elle m'a demandé si j'avais des questions. J'en avais préparé une : « Comment se passe une journée typique ici ? »

Elle a parlé pendant cinq minutes, avec plaisir.

Deux jours après, elle m'a appelé. Je commençais le samedi suivant.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-055",
    title: "Retourner à l'école à trente ans",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "À trente-deux ans, je suis retournée sur les bancs de l'école.",
    blurbEn:
      "Going back to study at thirty-two: younger classmates, forgotten habits, and the strange pride of being the oldest in the room. (Section: First jobs, 3/5.)",
    body: `À trente-deux ans, je suis retournée à l'école. Enfin, pas exactement à l'école : j'ai commencé une formation d'infirmière.

Avant, je travaillais dans un magasin. Le travail était correct, mais je m'ennuyais. Je voulais faire quelque chose d'utile.

La décision a été difficile. J'avais un salaire, un appartement, une vie tranquille. Pendant la formation, j'allais gagner beaucoup moins d'argent. Mes parents étaient inquiets : « Tu es sûre ? À ton âge ? »

Le premier jour, j'étais très nerveuse. Dans la salle, il y avait vingt-cinq étudiants. La plupart avaient vingt ou vingt-deux ans. J'étais la plus âgée.

Au début, je me sentais bizarre. Les autres parlaient de choses que je ne connaissais pas. Ils sortaient le soir, moi j'étais fatiguée à neuf heures.

Et j'avais oublié comment étudier ! Pendant dix ans, je n'avais pas ouvert un cahier. Les premiers examens ont été durs.

Mais peu à peu, j'ai trouvé ma place. J'avais aussi des avantages : j'étais organisée, j'avais l'habitude de travailler avec le public, et je savais pourquoi j'étais là.

Deux jeunes étudiantes ont commencé à travailler avec moi. Elles m'appelaient « la sage ». Ça me faisait rire.

Maintenant, je suis en deuxième année. Je travaille beaucoup et j'ai moins d'argent qu'avant.

Mais le matin, je me lève sans effort.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-056",
    title: "Mon stage en entreprise",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Pendant mes études, j'ai fait un stage de trois mois.",
    blurbEn:
      "Three months as an intern: making coffee at first, then a small real task — and the moment of being taken seriously. (Section: First jobs, 4/5.)",
    body: `Pendant mes études, j'ai fait un stage de trois mois dans une entreprise. Je devais le faire pour valider mon diplôme.

Le premier jour, je ne savais pas où me mettre. On m'a donné un bureau dans un coin et un ordinateur très lent.

La première semaine a été ennuyeuse. Je n'avais presque rien à faire. Je classais des papiers, je photocopiais des documents, et une fois, on m'a demandé d'aller chercher des cafés.

Le soir, je rentrais un peu déçue. Ce n'était pas ce que j'avais imaginé.

Mais je ne voulais pas rester assise à ne rien faire. Alors j'ai commencé à poser des questions. Je demandais aux gens ce qu'ils faisaient et comment ça marchait. Certains n'avaient pas le temps, mais d'autres m'expliquaient volontiers.

Après deux semaines, une collègue, Nathalie, m'a proposé quelque chose. « Tu veux m'aider à préparer un document pour un client ? »

J'ai dit oui immédiatement.

J'ai travaillé sur ce document pendant trois jours. J'ai fait des recherches, j'ai écrit un résumé, j'ai vérifié les chiffres deux fois.

Quand Nathalie l'a lu, elle a dit : « C'est très bien. Je vais l'envoyer comme ça. »

Après ce jour, tout a changé. On m'a confié d'autres tâches, plus intéressantes.

À la fin du stage, Nathalie m'a dit : « Envoie-moi ton CV quand tu auras fini tes études. »

Deux ans plus tard, je l'ai fait.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-057",
    title: "Le collègue qui m'a aidé",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Quand j'ai commencé ce travail, je ne comprenais rien.",
    blurbEn:
      "A patient older colleague makes the difference in a difficult first month — and years later, the favour gets passed on. (Section: First jobs, 5/5.)",
    body: `Quand j'ai commencé mon travail actuel, il y a six ans, je ne comprenais presque rien.

L'entreprise utilisait des logiciels que je ne connaissais pas. Il y avait des règles, des habitudes, des mots que tout le monde comprenait sauf moi.

Pendant les réunions, je notais tout, mais je ne posais pas de questions. J'avais peur de paraître bête.

Le soir, je rentrais chez moi épuisée et inquiète. Je pensais : « Ils ont fait une erreur en m'embauchant. »

Après deux semaines, un collègue est venu me parler. Il s'appelait Bernard et il travaillait là depuis vingt-deux ans. Il avait presque soixante ans.

« Ça va ? » m'a-t-il demandé. « Tu as l'air perdue. »

J'ai hésité, puis j'ai dit la vérité : « Je ne comprends pas la moitié de ce qu'on me dit. »

Il a ri gentiment. « Bien sûr ! Personne ne comprend au début. Moi non plus, en 2002. »

À partir de ce jour, Bernard a pris quinze minutes chaque matin pour m'expliquer les choses. Il ne se moquait jamais de mes questions.

Il m'a dit une phrase que je n'ai pas oubliée : « La question bête, c'est celle qu'on ne pose pas. »

Bernard est parti à la retraite l'année dernière.

Le mois dernier, une jeune femme a rejoint mon équipe. Elle avait l'air perdue en réunion.

Alors je suis allée la voir. « Ça va ? Tu veux qu'on prenne quinze minutes demain matin ? »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-058",
    title: "J'ai fait mon premier budget",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Le mois dernier, j'ai noté toutes mes dépenses.",
    blurbEn:
      "Writing down every expense for a month reveals where the money really goes — and it isn't the rent. (Section: Money, 1/5.)",
    body: `Le mois dernier, j'ai fait quelque chose que je n'avais jamais fait : j'ai noté toutes mes dépenses pendant trente jours.

Avant, je ne comprenais pas. Je gagnais un salaire correct, mais à la fin du mois, il ne restait presque rien. Où allait l'argent ?

Alors j'ai pris un cahier. Chaque soir, j'écrivais ce que j'avais dépensé : le loyer, les courses, un café, un ticket de bus, tout.

Au début, c'était pénible. Puis c'est devenu une habitude, comme se brosser les dents.

À la fin du mois, j'ai additionné. Les résultats m'ont surprise.

Le loyer et les factures, je les connaissais : c'était la moitié de mon salaire, mais je ne pouvais rien changer. Les courses, c'était normal aussi.

Mais il y avait une troisième catégorie : les petites dépenses. Un café par-ci, un sandwich par-là, des achats sur internet. Ensemble, cela faisait deux cent quarante euros !

Deux cent quarante euros. Je n'avais rien remarqué, parce que chaque dépense était petite.

Ce mois-ci, j'ai décidé de changer deux choses seulement. J'apporte mon déjeuner trois fois par semaine, et je prends un café au bureau au lieu de l'acheter dehors.

Je n'ai rien supprimé d'autre. Je sors toujours avec mes amis.

Hier, j'ai regardé mon compte : j'ai économisé cent trente euros ce mois-ci.

Un cahier à deux euros m'a fait gagner cent trente euros.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-059",
    title: "C'est la période des soldes",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "En France, les soldes ont lieu deux fois par an.",
    blurbEn:
      "France's twice-yearly sales are fixed by law. Crowds, real bargains, and the shirt bought only because it was cheap. (Section: Money, 2/5.)",
    body: `En France, les soldes ont lieu deux fois par an : en janvier et en juin. Les dates sont fixées par la loi, et elles sont les mêmes pour tous les magasins.

Le premier jour des soldes, il y a beaucoup de monde en ville. Certaines personnes attendent devant les magasins avant l'ouverture.

Samedi dernier, j'y suis allée avec mon amie Léa. Nous avions besoin de manteaux d'hiver.

Dans le premier magasin, c'était impossible : il y avait trop de gens. Les vêtements étaient partout, même par terre. Les cabines d'essayage avaient une queue de vingt minutes.

Léa a trouvé un manteau à moins cinquante pour cent. Il était bleu, chaud, et il lui allait très bien. Prix d'origine : cent quarante euros. Prix soldé : soixante-dix euros. Une vraie bonne affaire !

Moi, je n'ai rien trouvé dans ma taille. Les tailles moyennes partent toujours en premier.

Alors j'ai fait une bêtise. J'ai acheté une chemise que je n'aimais pas beaucoup, simplement parce qu'elle coûtait douze euros au lieu de quarante.

Dans le bus, Léa m'a demandé : « Tu vas la porter ? »

J'ai réfléchi. « Peut-être pas. »

« Alors ce n'est pas une économie. C'est une dépense. »

Elle avait raison. Une chose pas chère qu'on ne porte pas coûte cher.

La chemise est encore dans mon armoire, avec l'étiquette.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-060",
    title: "J'achète beaucoup d'occasion",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Depuis deux ans, j'achète presque tout d'occasion.",
    blurbEn:
      "Buying second-hand for two years: cheaper, greener, and the small thrill of finding something nobody else has. (Section: Money, 3/5.)",
    body: `Depuis deux ans, j'achète presque tout d'occasion : mes vêtements, mes meubles, mes livres. Au début, c'était pour économiser. Maintenant, c'est devenu un plaisir.

Tout a commencé quand j'ai déménagé. Mon appartement était vide et je n'avais que quatre cents euros pour le meubler. Impossible d'acheter du neuf.

Alors j'ai cherché sur les sites d'occasion et dans les brocantes. J'ai trouvé une table pour trente euros, quatre chaises pour quarante, et un canapé pour quatre-vingts euros. Le canapé était un peu vieux, mais très confortable.

Avec du neuf, tout cela m'aurait coûté plus de mille euros.

J'ai découvert deux autres avantages.

D'abord, c'est meilleur pour l'environnement. Quand j'achète un objet qui existe déjà, on ne fabrique rien de nouveau. On ne jette rien non plus.

Ensuite — et c'est ce que je préfère — chaque objet a une histoire. Ma table vient d'une vieille dame qui déménageait à la campagne. Elle m'a raconté que sa famille avait mangé autour de cette table pendant trente ans.

Bien sûr, il faut être patient. On ne trouve pas tout de suite exactement ce qu'on veut. Il faut chercher, attendre, revenir.

Mais quand on trouve la bonne chose, c'est une vraie victoire.

Le mois dernier, j'ai acheté un vélo pour soixante euros. Il roule parfaitement.

Mes amis me demandent souvent : « Où as-tu trouvé ça ? »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-061",
    title: "Un achat que je regrette",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Il y a un an, j'ai acheté une machine à café très chère.",
    blurbEn:
      "An expensive coffee machine bought on a whim now sits unused in a cupboard — and taught a useful rule about waiting. (Section: Money, 4/5.)",
    body: `Il y a un an, j'ai acheté une machine à café très chère : deux cent quatre-vingts euros. Aujourd'hui, elle est dans un placard.

Je vais vous expliquer comment c'est arrivé.

Un samedi, je suis entré dans un magasin d'électroménager pour acheter une bouilloire. Une bouilloire coûte vingt euros.

Mais près de l'entrée, il y avait une démonstration. Un vendeur préparait des cafés avec une machine magnifique. Les cafés sentaient délicieusement bon.

Il m'a proposé de goûter. C'était le meilleur café de ma vie.

Puis il m'a expliqué tout ce que la machine pouvait faire : des expressos, des cappuccinos, du lait chaud. Il y avait dix boutons.

« Vous économiserez de l'argent », m'a-t-il dit. « Un café dehors coûte deux euros cinquante. »

Le calcul semblait logique. J'ai payé avec ma carte, sans réfléchir.

Les deux premières semaines, j'étais ravi. Je faisais des cappuccinos tous les matins.

Puis les problèmes ont commencé. La machine était compliquée à nettoyer : il fallait vingt minutes chaque semaine. Il fallait aussi acheter des capsules spéciales, assez chères.

Et le matin, je n'avais pas le temps. Je voulais juste un café rapide.

Après trois mois, j'ai recommencé à acheter mon café dehors.

Maintenant, j'ai une règle : pour tout achat de plus de cent euros, j'attends une semaine.

Souvent, l'envie disparaît.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-062",
    title: "Prêter de l'argent à un ami",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Mon ami m'a demandé de lui prêter trois cents euros.",
    blurbEn:
      "Lending money to a friend is never only about money. How one loan was handled well — and why the conversation mattered more than the sum. (Section: Money, 5/5.)",
    body: `L'année dernière, mon ami Karim m'a demandé de lui prêter trois cents euros. Sa voiture était en panne et il avait besoin d'une réparation urgente pour aller travailler.

J'ai hésité. Pas parce que je ne lui faisais pas confiance, mais parce que j'avais entendu beaucoup d'histoires : des amis qui se disputent à cause de l'argent, des familles qui ne se parlent plus.

Prêter de l'argent, ce n'est jamais seulement une question d'argent. C'est aussi une question de relation.

Finalement, j'ai dit oui. Mais nous avons fait quelque chose d'important : nous avons parlé clairement, avant.

Nous avons décidé ensemble : trois cents euros, remboursés en trois fois, cent euros par mois. Karim l'a même écrit dans un message, pour que nous ayons tous les deux la même information.

Certains trouvent ça froid entre amis. Moi, je pense le contraire. Le malaise vient toujours du flou : quand personne ne sait quand ni comment l'argent sera rendu.

Karim m'a remboursé les deux premiers mois sans problème. Le troisième mois, il m'a envoyé un message : « Je peux te rendre les cent euros dans deux semaines ? J'ai eu une facture. »

Il avait prévenu, alors ce n'était pas un problème.

Il m'a tout remboursé en quatre mois au lieu de trois.

Aujourd'hui, nous sommes toujours amis. Et je crois que nous le sommes restés justement parce que nous avons osé parler d'argent au début.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-063",
    title: "Nous avons réservé un week-end",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Il y a un mois, nous avons décidé de partir un week-end.",
    blurbEn:
      "Planning a weekend away: comparing prices, choosing a town nobody knew, and the pleasure of having something booked. (Section: A short trip, 1/5.)",
    body: `Il y a un mois, nous avons décidé de partir un week-end, mon mari et moi. Nous n'avions pas voyagé depuis presque deux ans.

Un soir, après le dîner, nous avons ouvert l'ordinateur.

« Où est-ce qu'on va ? » a demandé mon mari.

Nous avions trois conditions : pas trop loin, pas trop cher, et une ville que nous ne connaissions pas.

Nous avons regardé plusieurs possibilités et nous avons comparé les prix des trains et des hôtels pendant une heure.

Finalement, nous avons choisi une petite ville à deux heures de chez nous. Personne ne nous en avait jamais parlé, mais les photos étaient jolies : une rivière, des maisons anciennes, un marché le samedi.

Nous avons réservé le train : quarante-huit euros aller-retour pour deux personnes. Ensuite l'hôtel : un petit hôtel dans le centre, quatre-vingt-quinze euros la nuit avec le petit déjeuner.

Nous avons tout payé le même soir. Total : environ deux cent quarante euros pour deux jours.

Puis nous avons fermé l'ordinateur, et j'ai remarqué quelque chose : nous étions déjà de bonne humeur. Le voyage était dans trois semaines, mais le plaisir avait déjà commencé.

Pendant les semaines suivantes, nous en avons parlé souvent. Mon mari a lu des choses sur la ville. Moi, j'ai fait une petite liste d'endroits à voir.

Attendre fait partie du voyage.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-064",
    title: "L'arrivée à l'hôtel",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Nous sommes arrivés à midi, mais la chambre n'était pas prête.",
    blurbEn:
      "Checking in early, leaving the bags, and a receptionist whose local advice turns out better than any guidebook. (Section: A short trip, 2/5.)",
    body: `Nous sommes arrivés dans la ville à midi. L'hôtel était à dix minutes à pied de la gare, alors nous avons marché.

L'hôtel était exactement comme sur les photos : un vieux bâtiment avec une porte bleue et des fleurs aux fenêtres.

À la réception, une jeune femme nous a accueillis.

« Bonjour ! Vous avez une réservation ? »

« Oui, au nom de Martin, pour deux nuits. »

Elle a vérifié sur son ordinateur. « C'est parfait. Mais je suis désolée : la chambre n'est pas encore prête. Le check-in est à quinze heures. »

Il était midi et quart. Nous devions attendre presque trois heures !

Mais elle a proposé une solution. « Vous pouvez laisser vos valises ici. Elles seront en sécurité. »

Nous avons accepté et nous avons laissé nos bagages derrière le comptoir.

Puis je lui ai demandé un conseil : « Où est-ce qu'on peut bien déjeuner, pas trop cher ? »

Elle a souri et elle a pris un plan de la ville. « Ne mangez pas sur la grande place, c'est pour les touristes et c'est cher. Allez plutôt ici », a-t-elle dit en montrant une petite rue. « C'est un restaurant familial. Le menu du midi coûte seize euros. »

Nous avons suivi son conseil. Le restaurant était petit, plein d'habitants du quartier, et le repas était excellent.

À quinze heures, notre chambre était prête. Elle donnait sur la rivière.

Le meilleur guide, c'est souvent quelqu'un qui habite là.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-065",
    title: "Visiter une ville inconnue",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Le samedi, nous avons marché toute la journée dans la ville.",
    blurbEn:
      "A whole day walking an unfamiliar town with no plan: a market, a church, a hill with a view, and tired feet. (Section: A short trip, 3/5.)",
    body: `Le samedi, nous avons visité la ville. Nous n'avions pas de programme précis, et c'était très agréable comme ça.

Nous avons commencé par le marché, sur la place principale. Il était énorme ! Il y avait des fruits, du fromage, du poisson, mais aussi des vêtements et des fleurs.

Nous avons acheté des fraises et nous les avons mangées en marchant. Elles étaient délicieuses.

Ensuite, nous sommes entrés dans une vieille église. À l'intérieur, il faisait frais et sombre. Il n'y avait presque personne. Nous sommes restés assis dix minutes, en silence.

Puis nous avons marché dans les petites rues autour du centre. C'est là que j'ai préféré la ville. Il y avait du linge aux fenêtres, des chats sur les murs, des enfants qui jouaient. Ce n'était pas un quartier touristique : c'était la vraie vie.

L'après-midi, nous sommes montés sur une colline, au-dessus de la ville. La montée a duré vingt-cinq minutes et il faisait chaud.

Mais en haut, la vue était magnifique. On voyait toute la ville, la rivière et les collines derrière. Nous sommes restés là longtemps, sans parler.

Le soir, nous avons dîné en terrasse. J'avais mal aux pieds : nous avions marché presque quinze kilomètres.

Avant de dormir, mon mari a dit : « Je ne connaissais même pas le nom de cette ville il y a un mois. »

Moi non plus. Et maintenant, je l'aime beaucoup.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-066",
    title: "Notre train a été annulé",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Dimanche soir, à la gare, notre train était annulé.",
    blurbEn:
      "The Sunday train home is cancelled. A queue, a long wait, and strangers who become temporary friends on a delayed platform. (Section: A short trip, 4/5.)",
    body: `Dimanche soir, nous sommes arrivés à la gare à dix-huit heures. Notre train partait à dix-huit heures trente.

Mais sur le grand panneau, à côté de notre train, il y avait un mot rouge : ANNULÉ.

« Ce n'est pas possible », a dit mon mari.

Nous sommes allés au guichet. Il y avait déjà une queue de trente personnes. Tout le monde parlait en même temps et certains étaient en colère.

Nous avons attendu quarante minutes. Devant nous, une dame âgée était très inquiète : sa fille l'attendait à la gare d'arrivée.

Quand notre tour est arrivé, l'employé nous a expliqué qu'il y avait un problème technique sur la ligne. Le train suivant partait à vingt et une heures quinze — presque trois heures plus tard.

Il nous a donné de nouveaux billets, sans supplément, et un papier pour demander un remboursement partiel.

Alors nous avons attendu. Nous avons mangé un sandwich dans un café de la gare. Nous avons lu. Nous avons regardé les gens.

Vers vingt heures, nous avons commencé à parler avec un jeune couple qui attendait le même train. Ils revenaient aussi d'un week-end. Nous avons discuté pendant une heure : de voyages, de travail, de nos villes.

Le train est finalement parti à vingt et une heures trente.

Nous sommes rentrés chez nous à minuit, épuisés.

Mais ce matin, je repense surtout à cette conversation dans la gare.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-067",
    title: "Les photos du voyage",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Après le voyage, j'ai regardé mes deux cent quarante photos.",
    blurbEn:
      "Two hundred and forty holiday photos, and the discovery that the best one wasn't of a monument at all. (Section: A short trip, 5/5.)",
    body: `Quand nous sommes rentrés de notre week-end, j'ai regardé mes photos sur mon téléphone. J'en avais pris deux cent quarante en deux jours !

Deux cent quarante photos pour deux jours. C'est énorme.

J'ai commencé à les regarder une par une, et j'ai vite compris quelque chose : la plupart n'étaient pas intéressantes.

Il y avait quinze photos de la même église, presque identiques. Il y avait des photos floues, prises en marchant. Il y avait aussi beaucoup de photos de bâtiments sans personne dessus.

Ces photos ne racontaient rien.

Alors j'ai fait le tri. J'en ai supprimé cent quatre-vingts. J'en ai gardé soixante.

Et parmi celles-là, il y en avait une que j'ai préférée tout de suite.

Ce n'était pas la vue depuis la colline. Ce n'était pas l'église.

C'était une photo de mon mari, assis à la terrasse du café, samedi soir. Il ne regardait pas l'appareil. Il tenait son verre et il riait de quelque chose que j'avais dit — je ne me souviens même plus de quoi.

Derrière lui, on voyait un peu la rue et la lumière du soir.

Cette photo n'est pas belle techniquement. Elle est un peu sombre.

Mais quand je la regarde, je me souviens exactement de ce moment : la température de l'air, le bruit de la place, notre fatigue heureuse.

Je l'ai imprimée. Elle est maintenant sur le frigo.

Les autres soixante photos, je ne les ai jamais rouvertes.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-068",
    title: "Comment j'ai rencontré mes amis",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Mes trois meilleurs amis, je les ai rencontrés par hasard.",
    blurbEn:
      "Three close friendships, all of them accidents: a queue, a broken-down car, and a wrong seat in a lecture hall. (Section: Friends and feelings, 1/5.)",
    body: `Mes trois meilleurs amis, je ne les ai pas choisis. Je les ai rencontrés par hasard.

Léa, je l'ai rencontrée dans une queue. C'était à la préfecture, il y a six ans. Nous attendions depuis deux heures pour un papier administratif. À un moment, elle s'est tournée vers moi et elle a dit : « Vous croyez qu'on va y arriver aujourd'hui ? »

Nous avons parlé pendant une heure et demie. À la fin, nous avons échangé nos numéros. Le lendemain, elle m'a envoyé un message.

Karim, je l'ai rencontré à cause d'une voiture. Un matin d'hiver, ma voiture ne démarrait pas. Il passait dans la rue et il s'est arrêté. Il a regardé le moteur, il a essayé quelque chose, et la voiture a démarré.

Je voulais lui donner de l'argent, mais il a refusé. Alors je lui ai offert un café. Nous sommes restés deux heures au café.

Nathalie, je l'ai rencontrée parce que je m'étais assise à la mauvaise place. C'était pendant une formation. Je me suis installée à côté d'elle, et à la pause, nous avons découvert que nous venions de la même petite ville.

Aucune de ces rencontres n'était prévue.

Parfois, je pense à ça : si j'étais arrivée cinq minutes plus tard à la préfecture, je n'aurais jamais connu Léa.

C'est un peu effrayant. Et c'est aussi très beau.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-069",
    title: "Nous nous sommes disputés",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Le mois dernier, je me suis disputée avec ma meilleure amie.",
    blurbEn:
      "An argument with a best friend over something small, three weeks of silence, and who finally sent the first message. (Section: Friends and feelings, 2/5.)",
    body: `Le mois dernier, je me suis disputée avec Léa, ma meilleure amie. C'était la première vraie dispute en six ans.

Tout a commencé pour une petite chose. Nous devions organiser un week-end ensemble. J'avais tout préparé : les dates, l'endroit, le logement. Puis, trois jours avant, Léa m'a annoncé qu'elle ne pouvait plus venir.

J'étais déçue, mais ce n'était pas grave. Ce qui m'a blessée, c'est la raison : elle avait accepté une invitation à une fête.

Je le lui ai dit au téléphone, et j'ai parlé trop fort. Elle a répondu que je n'écoutais jamais ses envies et que je décidais toujours de tout.

Nous avons raccroché toutes les deux en colère.

Ensuite, il y a eu trois semaines de silence. Trois semaines, c'est long. Chaque jour, je pensais lui écrire, puis je ne le faisais pas. J'attendais qu'elle commence.

Je crois qu'elle faisait exactement la même chose.

Finalement, un dimanche soir, je lui ai envoyé un message très simple : « Tu me manques. On peut se voir ? »

Elle a répondu en dix minutes : « Oui. Moi aussi je voulais t'écrire depuis deux semaines. »

Nous nous sommes vues le mardi. Nous avons parlé pendant trois heures.

Elle avait raison sur une chose : j'organise trop, sans demander. Et moi, j'avais raison aussi.

Nous avons appris quelque chose : il ne faut pas laisser passer trois semaines.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-070",
    title: "Mon ami est parti à l'étranger",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "L'été dernier, Karim est parti travailler au Canada.",
    blurbEn:
      "A close friend moves abroad. The goodbye, the time difference, and the effort it takes to keep a friendship alive at 6,000 km. (Section: Friends and feelings, 3/5.)",
    body: `L'été dernier, Karim est parti travailler au Canada. Il avait reçu une très bonne proposition et il a accepté.

J'étais content pour lui, bien sûr. Mais j'étais aussi triste, et je ne l'ai pas dit tout de suite.

Nous nous voyions deux ou trois fois par semaine. Nous jouions au foot le jeudi, nous prenions un café le week-end. Il habitait à dix minutes de chez moi.

Le jour de son départ, je l'ai accompagné à l'aéroport. Nous n'avons pas beaucoup parlé dans la voiture.

Devant la porte d'embarquement, il m'a dit : « On s'appelle. »

« Oui, bien sûr », j'ai répondu.

Mais je savais que ce n'était pas si simple. J'avais déjà vu des amitiés disparaître avec la distance.

Les premières semaines, nous nous sommes écrit tous les jours. Puis les messages sont devenus moins fréquents.

Le problème, c'est aussi le décalage horaire : il y a six heures de différence. Quand je finis ma journée, il est encore au travail. Quand il est libre, je dors.

Alors nous avons décidé quelque chose. Le dimanche matin, à dix heures pour moi et quatre heures pour lui — c'est tôt, mais il accepte —, nous nous appelons pendant une heure.

Nous le faisons depuis huit mois, presque chaque dimanche.

Ce n'est pas comme avant. Mais notre amitié n'a pas disparu.

Elle demande simplement plus d'efforts.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-071",
    title: "Un ami qui traverse une période difficile",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Mon collègue Bruno allait mal, et je ne savais pas quoi dire.",
    blurbEn:
      "When a friend is going through something hard, advice usually helps less than simply staying nearby. (Section: Friends and feelings, 4/5.)",
    body: `L'année dernière, mon ami Bruno a traversé une période très difficile. Il a perdu son travail, et deux mois plus tard, sa compagne l'a quitté.

Au début, je ne savais pas quoi faire. J'avais peur de dire quelque chose de bête.

Alors j'ai fait ce que beaucoup de gens font : j'ai donné des conseils. « Tu devrais chercher un travail dans une autre ville. » « Tu devrais sortir plus. » « Il faut positiver. »

Un soir, Bruno m'a interrompu. Il n'était pas en colère, mais il était fatigué.

« Je sais tout ça », m'a-t-il dit. « Je n'ai pas besoin de solutions. J'ai besoin que quelqu'un écoute. »

Ça m'a fait réfléchir pendant plusieurs jours.

Alors j'ai changé de méthode. J'ai arrêté de proposer des solutions. À la place, j'ai posé des questions simples : « Comment tu te sens aujourd'hui ? » Et surtout, je l'ai laissé parler sans l'interrompre.

J'ai aussi fait des choses concrètes, sans demander. Je passais chez lui avec un plat le mardi soir. Nous marchions le dimanche, parfois sans parler beaucoup.

Ces mois ont été longs. Il n'y a pas eu de moment magique.

Puis, doucement, il a trouvé un travail. Et il a recommencé à rire.

Un jour, il m'a dit : « Merci d'être resté. Beaucoup de gens ont disparu. »

Je n'avais rien résolu. J'étais simplement là.

C'était suffisant.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-072",
    title: "Dire ce que l'on ressent",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Dans ma famille, on ne parlait jamais de ses sentiments.",
    blurbEn:
      "Growing up in a family that never discussed feelings, and learning as an adult to say the simple, difficult sentences. (Section: Friends and feelings, 5/5.)",
    body: `Dans ma famille, on ne parlait jamais de ses sentiments. Ce n'était pas de la méchanceté : c'était simplement l'habitude.

Quand j'étais triste, mon père disait : « Ça va passer. » Quand quelqu'un était en colère, on attendait que ça se calme. On ne disait pas « je suis blessé » ou « j'ai besoin d'aide ».

J'ai grandi comme ça, et j'ai fait la même chose pendant longtemps.

Le problème, c'est que les sentiments ne disparaissent pas quand on ne les dit pas. Ils restent quelque part, et ils sortent plus tard, souvent au mauvais moment.

Il y a trois ans, j'ai commencé à changer. Ce n'était pas facile, et je ne suis pas devenue une autre personne. Mais j'ai appris quelques phrases simples.

« Ça m'a fait de la peine quand tu as dit ça. »
« Je suis fatiguée en ce moment, je ne suis pas contre toi. »
« J'ai besoin d'être un peu seule ce soir. »

Ces phrases paraissent faciles. Mais la première fois, ma voix tremblait.

Ce qui m'a surprise, c'est la réaction des autres. Personne ne s'est moqué de moi. Au contraire : mes amis ont commencé à parler plus honnêtement aussi.

L'année dernière, j'ai même eu une conversation avec mon père. Je lui ai dit que j'aurais aimé parler davantage quand j'étais petite.

Il est resté silencieux un moment. Puis il a répondu : « Personne ne m'a appris à faire ça. »

Nous n'avons pas tout réparé ce jour-là. Mais nous avons commencé.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-073",
    title: "L'été où il a fait très chaud",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "L'été dernier, il a fait quarante degrés pendant six jours.",
    blurbEn:
      "A six-day heatwave: closed shutters, sleepless nights, and a town that only comes alive after nine in the evening. (Section: Weather and seasons, 1/5.)",
    body: `L'été dernier, nous avons eu une canicule. Il a fait plus de quarante degrés pendant six jours.

Je n'avais jamais connu ça dans ma région. Normalement, en juillet, il fait vingt-huit ou trente degrés.

Les premiers jours, tout le monde en parlait avec le sourire : « Quelle chaleur ! » Mais après trois jours, plus personne ne souriait.

Le plus dur, c'était la nuit. La température ne descendait pas sous vingt-huit degrés. Je dormais très mal. J'ouvrais les fenêtres, mais l'air était chaud aussi.

La ville a changé complètement. Pendant la journée, les rues étaient vides. Les gens fermaient les volets dès neuf heures du matin pour garder un peu de fraîcheur.

Ma voisine, qui a quatre-vingt-deux ans, ne sortait plus du tout. Ma mère l'appelait deux fois par jour pour vérifier qu'elle buvait de l'eau. Les personnes âgées sont les plus en danger pendant une canicule.

La mairie a ouvert une salle climatisée près de la mairie. Beaucoup de gens y passaient l'après-midi.

À partir de neuf heures du soir, tout le monde sortait en même temps. Les rues se remplissaient. C'était étrange : la vie commençait la nuit.

Le septième jour, un orage est arrivé. La température est descendue de douze degrés en une heure.

Je me souviens que les gens sont sortis sous la pluie. Certains applaudissaient.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-074",
    title: "La tempête de novembre",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "En novembre, une grosse tempête est passée sur la région.",
    blurbEn:
      "A November storm brings down a tree, cuts the power for eighteen hours, and reveals how much a street can help itself. (Section: Weather and seasons, 2/5.)",
    body: `En novembre dernier, une grosse tempête est passée sur notre région. La météo avait prévenu deux jours avant : « Vents de cent trente kilomètres par heure. »

Nous avons préparé la maison. Nous avons rentré les chaises du jardin, fermé tous les volets et acheté des bougies et des piles.

La tempête est arrivée vers vingt-deux heures. Le bruit était impressionnant : le vent sifflait et faisait trembler les fenêtres.

Vers minuit, l'électricité a été coupée. Tout est devenu noir et silencieux — plus de frigo, plus de chauffage, rien.

Nous avons allumé les bougies et nous sommes restés dans le salon. Les enfants avaient un peu peur, alors nous avons raconté des histoires.

Vers deux heures du matin, nous avons entendu un craquement très fort, puis un choc.

Le matin, nous avons compris : un grand arbre était tombé dans la rue. Il avait cassé une clôture, mais heureusement, il n'avait touché aucune maison et personne n'était blessé.

Toute la rue est sortie. Un voisin avait une tronçonneuse, un autre avait une remorque. Nous avons travaillé ensemble pendant quatre heures pour dégager la route.

Je ne connaissais pas la moitié de ces gens.

L'électricité est revenue le soir, après dix-huit heures.

Depuis cette tempête, nous nous disons tous bonjour dans la rue.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-075",
    title: "Un hiver sans neige",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "Cet hiver, il n'a pas neigé une seule fois.",
    blurbEn:
      "A winter with no snow at all, and a grandmother's memories of skiing to school — a quiet way to notice the climate changing. (Section: Weather and seasons, 3/5.)",
    body: `Cet hiver, il n'a pas neigé une seule fois chez nous. Pas une seule.

En décembre, en janvier, en février : il a fait gris et humide, avec des températures de huit ou dix degrés. Il a beaucoup plu, mais l'eau est restée de l'eau.

Mes enfants étaient déçus. Ma fille m'a demandé : « On va faire un bonhomme de neige cette année ? » J'ai répondu : « On va voir. »

Nous n'en avons pas fait.

Ce n'est pas la première fois. L'hiver d'avant, il a neigé une journée seulement, et la neige a fondu avant le soir.

Un dimanche, nous avons déjeuné chez ma grand-mère. Ma fille lui a parlé de la neige.

Ma grand-mère a souri, puis elle a raconté son enfance dans ce même village, dans les années cinquante.

« Chaque hiver, il y avait de la neige pendant des semaines. Parfois quarante centimètres. Mon frère et moi, nous allions à l'école avec des skis, parce que la route était fermée. »

Ma fille l'a regardée avec de grands yeux. « Des skis ? Pour aller à l'école ? »

« Tous les hivers », a répondu ma grand-mère.

Puis elle a ajouté quelque chose de plus sérieux : « Ici, la neige, c'était normal. Maintenant, c'est un événement. »

Dans la voiture, ma fille était silencieuse.

Puis elle a demandé : « Est-ce qu'il neigera encore quand je serai grande ? »

Je n'ai pas su quoi répondre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-076",
    title: "Le printemps est arrivé trop tôt",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "Cette année, les arbres ont fleuri au mois de février.",
    blurbEn:
      "Blossom in February looks lovely — until the frost returns in April and the fruit harvest is lost. (Section: Weather and seasons, 4/5.)",
    body: `Cette année, le printemps est arrivé très tôt. Au mois de février, les arbres du jardin avaient déjà des fleurs.

Au début, c'était magnifique. Il faisait dix-huit degrés en plein février ! Nous avons déjeuné dehors le vingt-deux, en tee-shirt. Les gens souriaient dans la rue et les terrasses des cafés étaient pleines.

Mais mon voisin, qui a un verger, n'était pas content du tout.

« C'est beau, mais c'est mauvais », m'a-t-il dit. « Beaucoup trop tôt. »

Je n'ai pas compris tout de suite. Il m'a expliqué.

Quand les arbres fleurissent, ils deviennent fragiles. Si le froid revient après, les fleurs meurent — et sans fleurs, il n'y a pas de fruits.

« Et le froid revient presque toujours », a-t-il ajouté.

Il avait raison. Le sept avril, il y a eu une gelée pendant deux nuits : moins trois degrés.

Le matin, les fleurs de ses abricotiers étaient brunes. Elles étaient mortes.

Il a perdu presque toute sa récolte d'abricots. C'était la troisième fois en cinq ans.

Les agriculteurs essaient des solutions : des bougies entre les arbres, de grands ventilateurs, parfois de l'eau. Mais tout cela coûte cher et ne marche pas toujours.

Cet été, les abricots ont été rares et chers au marché.

Quand j'ai vu le prix, j'ai pensé à ces deux nuits d'avril.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-077",
    title: "Le climat a changé ici",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "Je vis dans le même village depuis quarante ans.",
    blurbEn:
      "Forty years in the same village, and a gardener's notebook that quietly records the seasons shifting. (Section: Weather and seasons, 5/5.)",
    body: `Je vis dans le même village depuis quarante ans, et j'ai un jardin depuis presque aussi longtemps.

Comme beaucoup de jardiniers, je note tout dans un cahier : les dates des semis, la première tomate, le premier gel, la dernière pluie de l'été.

Au début, je faisais ça pour mieux organiser mon jardin. Mais avec le temps, ce cahier est devenu autre chose : une petite histoire du climat de mon village.

Hier soir, j'ai comparé les années. Ce que j'ai vu est très clair.

Dans les années quatre-vingt, je plantais mes tomates vers le quinze mai. Aujourd'hui, je les plante fin avril, deux semaines plus tôt.

Le premier gel de l'automne arrivait autour du vingt octobre. Maintenant, il arrive souvent en novembre.

Les été sont plus secs. Avant, j'arrosais deux fois par semaine en juillet. Depuis cinq ans, j'arrose presque chaque jour, et parfois la mairie interdit l'arrosage.

Certaines plantes ne poussent plus bien ici : elles souffrent de la chaleur. D'autres, qui venaient du sud, poussent maintenant très bien dans mon jardin.

Je ne suis pas scientifique. Je ne parle pas de la planète entière : je parle seulement de mon jardin, dans mon village.

Mais je note ces dates depuis quarante ans, et les chiffres ne mentent pas.

Mon petit-fils m'a demandé pourquoi je gardais ce vieux cahier.

Je lui ai répondu : « Pour me souvenir de ce qui était normal avant. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-078",
    title: "J'ai emménagé dans un immeuble",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Après des années en maison, j'ai emménagé dans un immeuble.",
    blurbEn:
      "Moving from a house into a block of flats: thinner walls, shared stairs, and learning who everyone is. (Section: Home and neighbours, 1/5.)",
    body: `Après huit ans dans une petite maison, j'ai emménagé dans un immeuble, au troisième étage. C'était un grand changement.

L'appartement lui-même me plaisait tout de suite : il était lumineux, avec un balcon et une vue sur les toits.

Mais la vie en immeuble est différente. Dans une maison, on est seul. Dans un immeuble, on partage : l'entrée, l'escalier, l'ascenseur, les poubelles, parfois le jardin.

La première semaine, j'ai découvert les bruits. J'entendais l'eau dans les tuyaux, les pas au-dessus de moi, une porte qui claquait au rez-de-chaussée. Au début, cela me dérangeait beaucoup. Puis je m'y suis habituée.

J'ai aussi rencontré les voisins, petit à petit, dans l'escalier.

Au premier étage, il y a un couple âgé, très gentil. Ils m'ont apporté un gâteau le deuxième jour.

Au deuxième, il y a une jeune famille avec un bébé. Le bébé pleure parfois la nuit, mais les parents s'excusent toujours.

Au-dessus de moi, il y a un homme d'une trentaine d'années. Je l'ai croisé trois fois en deux mois et je ne connais pas encore son nom.

Il y a aussi madame Renard, qui habite ici depuis vingt-huit ans et qui sait absolument tout.

Ce qui m'a surprise, c'est que je me sens moins seule qu'avant.

Dans ma maison, je pouvais passer une semaine sans parler à personne.

Ici, c'est impossible.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-079",
    title: "Le bruit du voisin du dessus",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Pendant trois semaines, mon voisin a fait du bruit chaque soir.",
    blurbEn:
      "Three weeks of noise from upstairs, a difficult knock on the door, and a problem solved by talking instead of complaining. (Section: Home and neighbours, 2/5.)",
    body: `Pendant trois semaines, mon voisin du dessus a fait beaucoup de bruit. Chaque soir, entre vingt-deux heures et minuit, j'entendais de la musique et des pas lourds.

Je dormais mal. Le matin, j'étais fatiguée au travail.

Au début, je n'ai rien dit. J'espérais que ça s'arrêterait tout seul.

Puis j'ai commencé à être vraiment en colère. J'ai pensé écrire un mot anonyme, ou même appeler la police.

Ma collègue Aïcha m'a donné un conseil : « Va lui parler d'abord. La plupart des gens ne savent pas qu'ils dérangent. »

Elle avait probablement raison, mais j'avais peur. Et s'il devenait agressif ?

Un samedi matin, j'ai pris mon courage et je suis montée frapper à sa porte.

Il a ouvert. Il avait l'air surpris et un peu inquiet.

J'ai expliqué calmement : « Bonjour, j'habite juste en dessous. J'entends beaucoup de bruit le soir et je dors mal. »

Sa réaction m'a étonnée. Il est devenu tout rouge.

« Je suis vraiment désolé ! Je ne savais pas. Je viens d'emménager et je fais du sport le soir, après le travail. Je ne pensais pas qu'on entendait. »

Nous avons parlé dix minutes. Il a proposé d'acheter un tapis épais et de finir avant vingt-deux heures.

Depuis, presque plus de bruit.

Trois semaines de colère, et il a suffi d'une conversation de dix minutes.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-080",
    title: "La réunion des voisins",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Une fois par an, tous les propriétaires de l'immeuble se réunissent.",
    blurbEn:
      "The annual residents' meeting: a broken lift, a long argument about the entrance paint, and how decisions actually get made. (Section: Home and neighbours, 3/5.)",
    body: `Une fois par an, tous les propriétaires de l'immeuble se réunissent. On appelle cela l'assemblée générale. C'est là qu'on décide des travaux et du budget.

Ma première réunion a eu lieu en mars. Elle a duré deux heures et demie. Je ne savais pas du tout à quoi m'attendre.

Nous étions quinze personnes dans une petite salle. Le gestionnaire de l'immeuble dirigeait la réunion avec un ordre du jour.

Le premier sujet était sérieux : l'ascenseur. Il tombe en panne trois ou quatre fois par an et il a trente ans. Le réparer coûterait cher ; le remplacer coûterait beaucoup plus cher.

Nous avons discuté quarante minutes. Le couple du premier étage ne voulait pas payer : ils n'utilisent jamais l'ascenseur. Les habitants du quatrième et du cinquième insistaient, ce qui est compréhensible.

Finalement, nous avons voté pour un remplacement, payé sur trois ans.

Le deuxième sujet était la peinture de l'entrée. Et là, la discussion a duré cinquante minutes ! Cinquante minutes pour choisir entre le beige et le gris clair.

Madame Renard voulait absolument le beige. Un autre voisin trouvait le beige « triste ».

À la fin, nous avons choisi le gris clair, par huit voix contre sept.

En sortant, j'étais épuisée. Mais j'ai compris quelque chose : dans un immeuble, personne ne décide seul.

Même pour une couleur de mur.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-081",
    title: "J'ai gardé le chat de ma voisine",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Ma voisine m'a demandé de garder son chat pendant dix jours.",
    blurbEn:
      "Cat-sitting for ten days turns into a small favour that changes a neighbourly relationship for good. (Section: Home and neighbours, 4/5.)",
    body: `L'été dernier, ma voisine du premier étage, madame Lambert, m'a demandé un service. Elle partait dix jours chez sa fille et elle cherchait quelqu'un pour s'occuper de son chat.

« Je ne veux pas le mettre en pension », m'a-t-elle expliqué. « Il est vieux et il serait malheureux. »

J'ai accepté tout de suite. Ce n'était pas compliqué : il fallait monter deux fois par jour pour lui donner à manger, changer son eau et nettoyer sa litière.

Elle m'a donné ses clés et beaucoup d'instructions, écrites sur une feuille. Il y avait même l'heure exacte des repas.

Le chat s'appelait Gaston. Les deux premiers jours, il s'est caché sous le lit. Il ne mangeait presque rien et il ne voulait pas me voir.

J'étais un peu inquiète. J'ai envoyé un message à madame Lambert : « Il ne mange pas beaucoup. »

Elle a répondu : « C'est normal, il boude. Parlez-lui doucement, il aime ça. »

Alors, chaque soir, je restais dix minutes dans son appartement et je lui parlais.

Le quatrième jour, il est sorti de sous le lit. Le sixième jour, il est venu contre ma jambe. Le neuvième jour, il a dormi sur mes genoux pendant vingt minutes.

Quand madame Lambert est rentrée, elle m'a apporté un cadeau de la région où elle était partie.

Depuis, nous prenons un café ensemble presque chaque semaine.

Un chat a créé une amitié.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-082",
    title: "Le jardin partagé de l'immeuble",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Derrière l'immeuble, il y avait un terrain vide et inutile.",
    blurbEn:
      "An unused patch of ground behind a block of flats becomes a shared garden — and the neighbours change with it. (Section: Home and neighbours, 5/5.)",
    body: `Derrière notre immeuble, il y avait un terrain vide depuis des années. Personne ne s'en occupait. Il y avait de l'herbe haute, quelques papiers et une vieille chaise cassée.

Un jour, le jeune homme du quatrième étage a eu une idée. Pendant la réunion des voisins, il a proposé de transformer ce terrain en jardin partagé.

Au début, beaucoup de gens étaient contre. « Qui va s'en occuper ? » « Et si personne ne le fait ? » « Ça va coûter de l'argent. »

Mais il avait bien préparé son projet. Il a expliqué que la mairie donnait une aide pour ce type de jardin, et il a proposé de commencer petit : six carrés de légumes seulement.

Après une longue discussion, nous avons voté oui, de justesse.

Nous avons commencé en avril. Nous étions sept au début : le jeune homme, moi, le couple âgé du premier, la famille du deuxième et madame Renard, qui râlait mais qui est venue chaque samedi.

Nous avons nettoyé le terrain, apporté de la terre et construit les carrés en bois.

Chaque famille s'occupe d'un carré, mais nous arrosons tous ensemble : il y a un tableau dans l'entrée avec les semaines.

Cet été, nous avons récolté des tomates, des courgettes, des salades et beaucoup d'herbes.

Mais le plus intéressant n'est pas les légumes.

Avant, je connaissais trois voisins. Maintenant, j'en connais douze.

Et madame Renard ne râle presque plus.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-083",
    title: "Je suis tombée malade",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Mardi matin, je me suis réveillée avec de la fièvre.",
    blurbEn:
      "A bad flu: fever, three days in bed, a doctor's note, and the difficult decision to actually rest. (Section: Health, 1/5.)",
    body: `Mardi matin, je me suis réveillée et j'ai tout de suite compris que quelque chose n'allait pas. J'avais mal à la tête, mal à la gorge et j'avais froid.

J'ai pris ma température : trente-huit degrés huit. J'avais de la fièvre.

Ma première réaction a été de me préparer quand même pour aller travailler. J'avais une réunion importante, et je pensais : « Ça va passer dans la journée. »

Je me suis levée, puis j'ai dû m'asseoir. J'avais la tête qui tournait.

Alors j'ai fait quelque chose que je fais rarement : j'ai téléphoné au bureau et j'ai dit que je ne venais pas.

L'après-midi, j'ai appelé mon médecin. Il m'a reçue à dix-sept heures.

Il m'a examinée : la gorge, les oreilles, la respiration. Puis il a dit : « C'est une grippe. Il n'y a pas de traitement magique. Vous devez vous reposer, boire beaucoup et attendre. »

Il m'a donné un médicament pour la fièvre et un arrêt de travail de trois jours.

Ces trois jours ont été longs. J'ai dormi énormément — parfois douze heures par nuit et deux heures l'après-midi. Je n'avais pas faim. Je regardais des séries sans vraiment les suivre.

Le vendredi, je me sentais un peu mieux. Le lundi, j'ai pu retourner travailler.

Ma collègue m'a dit : « Tu as bien fait de rester chez toi. La dernière fois, tu es venue malade et la moitié du bureau a été malade aussi. »

Elle avait raison.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-084",
    title: "Chez le dentiste",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "J'avais mal à une dent depuis deux semaines.",
    blurbEn:
      "Two weeks of putting off the dentist makes a small problem bigger — and the appointment is far less frightening than the waiting. (Section: Health, 2/5.)",
    body: `J'avais mal à une dent depuis deux semaines. Au début, c'était une petite douleur, seulement quand je buvais quelque chose de froid.

Je savais qu'il fallait aller chez le dentiste. Mais je n'aime pas le dentiste. Personne n'aime le dentiste.

Alors j'ai attendu. J'ai pris des médicaments contre la douleur et j'ai évité les boissons froides.

Après dix jours, la douleur est devenue plus forte. Une nuit, je n'ai pas pu dormir du tout.

Le lendemain matin, j'ai téléphoné. La secrétaire m'a proposé un rendez-vous trois semaines plus tard.

« Trois semaines ? Mais j'ai très mal ! »

« Attendez... Il y a une annulation demain à huit heures. Ça vous convient ? »

J'ai dit oui immédiatement.

Dans la salle d'attente, j'étais nerveuse comme un enfant. J'entendais le bruit des instruments dans l'autre pièce.

Le dentiste a regardé ma dent pendant deux minutes, puis il a fait une radio.

« Vous avez une carie assez profonde. Si vous étiez venue il y a deux semaines, c'était simple. Maintenant, c'est un peu plus de travail, mais ça reste réparable. »

Il m'a fait une piqûre, puis il a travaillé pendant quarante minutes. Ce n'était pas agréable, mais je n'ai presque rien senti.

En partant, il m'a dit une phrase que je n'ai pas oubliée : « Une dent qui fait mal ne guérit jamais toute seule. »

Depuis, j'y vais deux fois par an.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-085",
    title: "Je me suis fait mal au dos",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "En portant un carton, j'ai senti une douleur dans le dos.",
    blurbEn:
      "One badly lifted box, a week of pain, and a physiotherapist who explains that sitting still all day was the real cause. (Section: Health, 3/5.)",
    body: `Il y a trois mois, je me suis fait mal au dos. C'est arrivé bêtement, en portant un carton de livres.

J'ai plié le dos au lieu de plier les jambes. J'ai senti une douleur soudaine, comme un choc électrique, et je n'ai plus pu bouger pendant quelques secondes.

Le lendemain, c'était pire. Je ne pouvais pas mettre mes chaussettes seule.

Mon médecin m'a examinée et m'a rassurée : ce n'était pas grave. « Vous avez un muscle bloqué. Ça va prendre une ou deux semaines. »

Il m'a donné des médicaments et un conseil surprenant : « Ne restez pas au lit. Bougez doucement. »

Je pensais qu'il fallait se reposer complètement. Il m'a expliqué que rester allongé trop longtemps rendait le problème plus long.

Il m'a aussi envoyée chez un kinésithérapeute. J'y suis allée six fois.

Le kiné m'a montré des exercices simples, à faire chaque matin pendant dix minutes.

Mais surtout, il m'a posé des questions sur ma vie quotidienne. Combien d'heures est-ce que je passais assise ? Environ neuf heures par jour.

« Voilà le vrai problème », a-t-il dit. « Le carton était seulement la goutte d'eau. Votre dos est fragile parce qu'il ne bouge jamais. »

Depuis, j'ai changé deux choses. Je me lève toutes les heures au bureau, et je marche vingt minutes chaque jour.

Je n'ai plus mal au dos.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-086",
    title: "Mon frère a arrêté de fumer",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Mon frère fumait depuis vingt ans. Cette année, il a arrêté.",
    blurbEn:
      "Twenty years of smoking, four failed attempts, and the fifth try that finally worked — with help this time. (Section: Health, 4/5.)",
    body: `Mon frère Thomas a fumé pendant vingt ans. Il a commencé à seize ans et il fumait environ un paquet par jour.

Il avait déjà essayé d'arrêter quatre fois. Chaque fois, il tenait deux ou trois semaines, puis il recommençait.

L'année dernière, quelque chose a changé. Notre père a eu un problème cardiaque. Il a passé une semaine à l'hôpital.

Thomas est resté longtemps silencieux après cette visite. Puis il m'a dit : « Cette fois, j'arrête pour de bon. »

Mais il a fait une chose différente : il a demandé de l'aide. Avant, il essayait toujours seul.

Il est allé voir son médecin, qui lui a proposé des patchs et un suivi. Il a aussi rejoint un petit groupe de personnes qui arrêtaient en même temps.

Les premières semaines ont été très dures. Il était nerveux, il dormait mal, il s'énervait pour rien. Il m'a téléphoné plusieurs fois le soir, simplement pour parler et ne pas fumer.

Il a aussi changé ses habitudes. Avant, il fumait toujours avec son café du matin. Alors il a arrêté de prendre son café à la même place.

Après un mois, c'était plus facile. Après trois mois, il a remarqué qu'il montait les escaliers sans être essoufflé.

Cela fait maintenant quatorze mois.

Il m'a dit récemment : « Les quatre premières fois, j'ai essayé tout seul. La cinquième fois, j'ai accepté d'être aidé. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-087",
    title: "La visite médicale au travail",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Tous les deux ans, nous avons une visite médicale au travail.",
    blurbEn:
      "A routine workplace check-up finds slightly high blood pressure — and a small warning turns into a useful change. (Section: Health, 5/5.)",
    body: `Dans mon entreprise, nous avons une visite médicale tous les deux ans. C'est obligatoire, et je la trouvais inutile.

En février, c'était mon tour. J'y suis allée sans y penser, entre deux réunions.

L'infirmière a d'abord fait les mesures habituelles : le poids, la taille, la vue, l'audition.

Puis elle a pris ma tension. Elle a noté le chiffre, puis elle a recommencé cinq minutes plus tard. Elle ne disait rien.

« Il y a un problème ? » j'ai demandé.

« Votre tension est un peu élevée. Ce n'est pas grave, mais ce n'est pas idéal. »

J'ai été surprise. J'ai quarante-deux ans, je ne suis pas en mauvaise santé, je ne fume pas.

Ensuite, le médecin du travail m'a posé beaucoup de questions. Est-ce que je dormais bien ? Combien de café est-ce que je buvais ? Est-ce que je me sentais stressée ?

Mes réponses ont été honnêtes : je dormais six heures par nuit, je buvais cinq ou six cafés par jour, et oui, j'étais stressée depuis six mois.

Il m'a dit : « Rien de tout cela n'est dramatique. Mais tout cela ensemble, sur des années, peut devenir un problème. »

Il ne m'a pas donné de médicament. Il m'a conseillé de voir mon médecin dans trois mois et de commencer par une chose : réduire le café.

Je suis passée de six cafés à deux.

Trois mois plus tard, ma tension était normale.

Maintenant, je ne trouve plus cette visite inutile.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-088",
    title: "Je me suis inscrite à un club",
    category: "sport",
    difficulty: "A2",
    minutes: 3,
    preview: "En septembre, je me suis inscrite à un club de volley.",
    blurbEn:
      "Joining a volleyball club as a complete beginner at thirty-five: the first terrible training session, and why she went back. (Section: Sport and hobbies, 1/5.)",
    body: `En septembre dernier, je me suis inscrite à un club de volley. Je n'avais pas joué depuis le lycée, il y a vingt ans.

Tout a commencé au forum des associations, en ville. C'est un événement organisé chaque année en septembre : tous les clubs de la ville installent un stand et présentent leurs activités.

Je suis passée devant le stand du volley presque par hasard. Une femme m'a souri et m'a demandé : « Vous jouez ? »

« J'ai joué, il y a très longtemps. »

« Nous avons un groupe loisir, le mardi soir. Aucun niveau demandé. Venez essayer, c'est gratuit la première fois. »

J'ai hésité toute la semaine. Puis je suis allée au premier entraînement.

Ce fut une catastrophe. Je ratais presque toutes les balles. Je ne me souvenais d'aucune règle. Après vingt minutes, j'étais essoufflée et j'avais mal partout.

Pendant la pause, j'ai pensé : « Je ne reviendrai pas. »

Mais une joueuse est venue me parler. Elle m'a dit qu'elle avait commencé deux ans plus tôt, dans le même état que moi.

« Le premier mois, on est nul. C'est normal. Après, ça vient. »

Je suis revenue la semaine suivante. Puis la suivante.

Aujourd'hui, huit mois plus tard, je joue toujours mal. Mais je rate moins de balles, et je connais les règles.

Et le mardi soir est devenu un rendez-vous que je ne manque jamais.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-089",
    title: "Le match de mon fils",
    category: "sport",
    difficulty: "A2",
    minutes: 3,
    preview: "Le samedi matin, je regarde mon fils jouer au football.",
    blurbEn:
      "Watching a nine-year-old's football match from the touchline — and the parents who shout too much. (Section: Sport and hobbies, 2/5.)",
    body: `Chaque samedi matin, je vais voir mon fils Léo jouer au football. Il a neuf ans et il joue dans le club de notre quartier.

Le match commence à dix heures. Il faut être là à neuf heures et quart pour l'échauffement, alors nous partons tôt.

Sur le bord du terrain, il y a une vingtaine de parents. Certains apportent un thermos de café. En hiver, il fait vraiment froid et nous restons debout pendant une heure et demie.

J'aime beaucoup ces matins. Les enfants jouent avec beaucoup d'énergie et parfois très peu d'organisation. Ils courent tous vers le ballon en même temps.

Mais il y a un problème sur le bord du terrain : certains parents crient trop.

Un père, en particulier, crie sans arrêt sur son fils : « Passe ! Cours ! Mais qu'est-ce que tu fais ? » Le garçon a huit ans et il baisse la tête à chaque fois.

Samedi dernier, l'entraîneur a arrêté le match pendant une minute. Il s'est tourné vers les parents et il a dit calmement :

« Ce sont des enfants. Ils jouent pour s'amuser. Laissez-les jouer, s'il vous plaît. »

Il y a eu un grand silence.

Après, le match a continué, et c'était beaucoup plus agréable.

Léo a marqué un but. Son équipe a perdu quatre à deux.

Dans la voiture, il m'a dit : « C'était bien aujourd'hui. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-090",
    title: "Ma collection de vieux disques",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "J'ai commencé à collectionner les disques vinyles il y a cinq ans.",
    blurbEn:
      "Collecting vinyl records: the hunt in flea markets, the ritual of listening, and why a slower format can be a pleasure. (Section: Sport and hobbies, 3/5.)",
    body: `J'ai commencé à collectionner les disques vinyles il y a cinq ans. Aujourd'hui, j'en ai environ deux cents.

Tout a commencé chez mes parents. En vidant le grenier, j'ai trouvé un carton avec les disques de mon père : du jazz et de la chanson française des années soixante-dix.

J'ai acheté un vieux tourne-disque d'occasion pour quarante euros, et j'ai écouté ces disques un dimanche après-midi.

Ça m'a surpris. Le son n'était pas parfait — il y avait des petits bruits — mais l'écoute était différente.

Avec un vinyle, on ne peut pas passer d'une chanson à l'autre en une seconde. Il faut se lever, retourner le disque, faire attention à l'aiguille. On écoute l'album entier, dans l'ordre, comme l'artiste l'avait prévu.

Depuis, je cherche des disques partout : dans les vide-greniers, les brocantes, les petits magasins d'occasion.

C'est un plaisir en deux parties. Il y a d'abord la recherche : on regarde des centaines de pochettes, souvent pour ne rien trouver. Puis, parfois, il y a la découverte.

Le mois dernier, dans une brocante, j'ai trouvé un album que je cherchais depuis deux ans. Il coûtait trois euros. J'étais si content que le vendeur a ri.

Mes amis me disent parfois : « Tu peux tout écouter gratuitement sur internet. »

C'est vrai. Mais ce n'est pas la même chose.

Le dimanche soir, je mets un disque, et je ne fais rien d'autre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-091",
    title: "J'ai recommencé à courir",
    category: "sport",
    difficulty: "A2",
    minutes: 3,
    preview: "Après deux ans sans sport, j'ai recommencé à courir doucement.",
    blurbEn:
      "Starting to run again after two years off: one minute running, two walking — and the slow method that finally stuck. (Section: Sport and hobbies, 4/5.)",
    body: `Après deux ans sans sport, j'ai recommencé à courir au mois de mars.

Ma première tentative, l'année dernière, avait été un échec. J'étais parti trop vite et trop longtemps. J'avais couru trente minutes le premier jour, et j'avais eu mal aux jambes pendant une semaine. Je n'avais jamais recommencé.

Cette fois, j'ai lu quelques conseils avant de commencer. Tous disaient la même chose : commencer beaucoup plus doucement qu'on ne le pense.

Alors j'ai suivi un programme très simple pour débutants.

La première semaine : une minute de course, puis deux minutes de marche, huit fois. Cela paraît ridicule. C'était même un peu gênant : je croisais des gens qui couraient vraiment.

Mais je n'avais pas mal, et je suis revenu trois jours plus tard.

La deuxième semaine : deux minutes de course, deux de marche.

Chaque semaine, j'augmentais un peu. Certaines semaines, je ne progressais pas du tout, et ce n'était pas grave.

Après huit semaines, j'ai couru vingt minutes sans m'arrêter. Après quatre mois, quarante minutes.

Aujourd'hui, je cours trois fois par semaine, le lundi, le mercredi et le samedi.

Je ne suis pas rapide. Je ne fais pas de compétition. Mais je dors mieux et je suis plus calme.

Ce qui a changé, ce n'est pas ma motivation : c'est ma patience.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-092",
    title: "Le club de lecture",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Une fois par mois, nous nous réunissons pour parler d'un livre.",
    blurbEn:
      "A monthly book club at the library: one book, eight readers, and eight completely different opinions. (Section: Sport and hobbies, 5/5.)",
    body: `Depuis deux ans, je fais partie d'un club de lecture. Nous nous réunissons une fois par mois, le premier jeudi, à la bibliothèque de la ville.

Nous sommes huit personnes. La plus jeune a vingt-trois ans, la plus âgée en a soixante-dix-huit. En dehors du club, nous n'avons presque rien en commun.

Le principe est simple : nous choisissons un livre ensemble, tout le monde le lit pendant le mois, et nous en parlons pendant une heure et demie.

Ce qui me plaît le plus, c'est de lire des livres que je n'aurais jamais choisis moi-même. Avant, je lisais toujours le même genre de romans. Depuis deux ans, j'ai lu de la science-fiction, de la poésie, une biographie et même un livre d'histoire.

Certains livres ne m'ont pas plu du tout. Mais même ceux-là étaient intéressants à discuter.

Le plus surprenant, c'est la différence entre nous. Nous lisons le même livre, et nous ne lisons pas le même livre.

Le mois dernier, par exemple, nous avons lu un roman sur une famille. Pour moi, le personnage principal était égoïste. Pour Sylvie, il était courageux. Nous avons discuté pendant quarante minutes.

Personne n'a changé d'avis, et ce n'était pas le but.

À la fin, la bibliothécaire nous dit toujours : « Il faut fermer ! »

Alors nous continuons dehors, sur le trottoir, encore dix minutes.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-093",
    title: "J'ai acheté un nouveau téléphone",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "Mon téléphone avait six ans. J'ai dû en acheter un autre.",
    blurbEn:
      "Replacing a six-year-old phone: the repair that cost almost as much as a new one, and a reluctant purchase. (Section: Technology, 1/5.)",
    body: `Mon téléphone avait six ans. Pour un téléphone, c'est très vieux.

Depuis quelques mois, il avait des problèmes : la batterie ne tenait plus que quatre heures, il devenait lent, et certaines applications ne fonctionnaient plus.

Je ne voulais pas en acheter un neuf. J'ai d'abord essayé de le faire réparer.

Je suis allé dans un magasin de réparation près de chez moi. Le technicien a regardé mon téléphone pendant dix minutes.

« La batterie, je peux la changer : soixante-dix euros. Mais le problème principal, c'est le système. Ce modèle ne reçoit plus les mises à jour depuis un an. »

Il m'a expliqué que sans mises à jour, le téléphone devient moins sûr, et certaines applications s'arrêtent de fonctionner.

« Vous pouvez le garder encore quelques mois, mais pas des années. »

J'ai trouvé cela absurde. L'appareil fonctionnait — pas parfaitement, mais il fonctionnait. Ce n'est pas la machine qui était morte : c'est le logiciel qui l'avait abandonnée.

J'ai finalement acheté un téléphone reconditionné, c'est-à-dire un téléphone d'occasion réparé et vérifié. Il m'a coûté deux cent trente euros au lieu de six cents pour un neuf.

Il a deux ans, mais il reçoit encore les mises à jour pendant trois ans.

Mon ancien téléphone, je l'ai déposé dans un bac de recyclage au magasin.

J'espère garder celui-ci six ans aussi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-094",
    title: "Ma mère apprend à utiliser internet",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "À soixante-douze ans, ma mère a acheté une tablette.",
    blurbEn:
      "Teaching a seventy-two-year-old to use a tablet: patience, repetition, and the fear of pressing the wrong button. (Section: Technology, 2/5.)",
    body: `À soixante-douze ans, ma mère a acheté une tablette. Elle voulait voir ses petits-enfants en vidéo, parce qu'ils habitent loin.

J'ai proposé de lui apprendre. Je pensais que ce serait rapide. Je me trompais complètement.

Le premier jour, nous avons passé deux heures sur des choses que je croyais évidentes. Comment allumer l'appareil. Comment toucher l'écran — ni trop fort, ni trop longtemps. Comment revenir en arrière.

J'ai compris que je n'expliquais pas bien. Je disais des mots comme « application », « icône », « menu » sans jamais les définir. Pour moi, c'était naturel ; pour elle, c'était une langue étrangère.

J'ai aussi remarqué autre chose : elle avait peur. Peur d'appuyer au mauvais endroit, de tout casser, de supprimer quelque chose d'important.

Alors je lui ai dit une phrase qui a beaucoup aidé : « Tu ne peux rien casser. Si tu te trompes, on répare en trente secondes. »

Après ça, elle a osé essayer toute seule.

Nous avons fait une chose utile : nous avons écrit un petit cahier. À chaque étape, elle notait les instructions avec ses propres mots. Ce cahier lui sert encore.

Il a fallu environ deux mois.

Aujourd'hui, elle appelle ses petits-enfants en vidéo toute seule, elle envoie des photos et elle lit le journal en ligne.

La semaine dernière, elle m'a appelée pour me montrer une chose que je ne savais pas faire.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-095",
    title: "Trop de messages",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "Je recevais deux cents notifications par jour.",
    blurbEn:
      "Two hundred notifications a day, constant interruptions — and what happened after turning almost all of them off. (Section: Technology, 3/5.)",
    body: `Il y a six mois, j'ai regardé les statistiques de mon téléphone. Le chiffre m'a choquée : je recevais en moyenne deux cents notifications par jour.

Deux cents ! Cela fait une interruption toutes les cinq minutes environ, pendant toute la journée.

Il y avait de tout : des messages, des e-mails, des applications de magasins, des jeux, des informations. Beaucoup d'entre elles ne servaient à rien.

Le problème n'était pas seulement le bruit. C'était l'attention. Chaque fois que mon téléphone vibrait, je perdais le fil de ce que je faisais. Et même quand je le remettais dans ma poche, je pensais encore au message.

Un soir, pendant le dîner, ma fille m'a dit : « Maman, tu regardes ton téléphone tout le temps. »

Elle avait raison, et cela m'a fait honte.

Alors j'ai fait quelque chose de simple. J'ai ouvert les paramètres et j'ai désactivé presque toutes les notifications.

J'ai gardé seulement les appels, les messages de ma famille et l'application de mon travail.

Les premiers jours ont été bizarres. Je regardais mon téléphone sans raison, comme par réflexe, pour vérifier que je n'avais rien manqué.

Puis, après une semaine, quelque chose a changé. J'étais plus calme. Je lisais des pages entières sans m'arrêter.

Je n'ai rien manqué d'important en six mois.

Les nouvelles arrivent quand même. Elles attendent simplement que je vienne les chercher.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-096",
    title: "Une arnaque par téléphone",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview: "Un homme a appelé mon père en disant qu'il était de la banque.",
    blurbEn:
      "A convincing phone scam nearly works on the narrator's father — and the simple rule that stopped it. (Section: Technology, 4/5.)",
    body: `Le mois dernier, mon père a failli perdre beaucoup d'argent à cause d'une arnaque par téléphone.

Un homme l'a appelé un mardi après-midi. Il a dit qu'il travaillait à la banque de mon père, au service de sécurité.

Il connaissait le nom de mon père, le nom de sa banque et même son adresse. Il parlait poliment et calmement.

Il a expliqué qu'une opération suspecte venait d'être détectée sur le compte : quelqu'un essayait de retirer mille huit cents euros. Pour bloquer l'opération, il fallait agir tout de suite.

Il a demandé à mon père de confirmer son numéro de carte et de donner le code reçu par SMS.

Mon père était inquiet. L'homme parlait vite et répétait que c'était urgent.

Mais juste avant de donner le code, mon père s'est souvenu d'une chose que je lui avais répétée plusieurs fois : une vraie banque ne demande jamais un code par téléphone.

Alors il a dit : « Je vais raccrocher et rappeler ma banque moi-même. »

L'homme a immédiatement changé de ton. Il est devenu agressif et il a dit que ce serait trop tard.

Mon père a raccroché.

Il a appelé sa banque avec le numéro écrit sur sa carte. Il n'y avait aucune opération suspecte, bien sûr.

L'urgence, c'est l'arme principale de ces escrocs. Ils ne veulent pas qu'on réfléchisse.

Depuis, mon père a une règle : il raccroche toujours, et il rappelle lui-même.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-097",
    title: "Le télétravail chez moi",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Depuis deux ans, je travaille chez moi trois jours par semaine.",
    blurbEn:
      "Two years of working from home: no commute and more focus, but a table that is also a desk and a day that never quite ends. (Section: Technology, 5/5.)",
    body: `Depuis deux ans, je travaille chez moi trois jours par semaine. Le mardi et le jeudi, je vais au bureau.

Au début, j'étais très content. Plus de transport : j'économisais une heure et demie par jour. Je pouvais dormir un peu plus longtemps et déjeuner tranquillement chez moi.

J'ai aussi remarqué que je travaillais mieux sur certaines tâches. Au bureau, les gens m'interrompaient sans arrêt. Chez moi, je pouvais me concentrer pendant deux heures sans être dérangé.

Mais après quelques mois, les problèmes sont apparus.

Le premier problème était l'espace. Mon appartement est petit. Je travaillais sur la table de la cuisine, la même table où je mangeais le soir. Le travail et la maison se mélangeaient.

Le deuxième problème était le temps. Sans trajet, il n'y avait plus de limite claire. Je commençais à huit heures et je regardais encore mes messages à vingt et une heures.

Le troisième problème était la solitude. Certains jours, je ne parlais à personne en face à face.

Alors j'ai changé plusieurs choses. J'ai acheté un petit bureau d'occasion pour séparer le travail du repas. Je fais maintenant une « fausse sortie » : je marche vingt minutes avant de commencer et vingt minutes à la fin.

Et je ferme complètement mon ordinateur à dix-huit heures.

Le télétravail n'est ni bon ni mauvais. Tout dépend des règles qu'on se donne.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-098",
    title: "Les hérissons du jardin",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "Un soir, j'ai découvert un hérisson sous la haie.",
    blurbEn:
      "Discovering hedgehogs in the garden, and the small changes that turned a tidy lawn into a place where wildlife can live. (Section: Nature and animals, 1/5.)",
    body: `Un soir de mai, vers vingt-deux heures, j'ai entendu un bruit dans le jardin. J'ai pris une lampe et je suis sorti.

Sous la haie, il y avait un hérisson. Il s'est immédiatement mis en boule et il n'a plus bougé.

Je suis rentré tout de suite pour ne pas le déranger, mais j'étais content. Je n'avais jamais vu de hérisson chez moi.

Le lendemain, j'ai cherché des informations. J'ai appris que les hérissons sont de plus en plus rares en France. Leur nombre a beaucoup baissé depuis trente ans.

Les raisons sont nombreuses : les routes, les produits chimiques dans les jardins, et surtout les jardins trop propres. Un hérisson a besoin de feuilles mortes, de bois, de coins sauvages pour dormir et manger.

Alors j'ai changé quelques habitudes.

D'abord, j'ai arrêté d'utiliser des produits contre les limaces. Ces produits tuent aussi les animaux qui les mangent. De toute façon, le hérisson mange les limaces : c'est un jardinier gratuit.

Ensuite, j'ai laissé un coin du jardin sans le toucher, avec un tas de feuilles et de branches.

Enfin, j'ai fait un petit trou en bas de ma clôture, de treize centimètres. Cela peut paraître étrange, mais les hérissons parcourent un ou deux kilomètres par nuit. Si tous les jardins sont fermés, ils ne peuvent plus circuler.

Cet été, j'ai vu le hérisson quatre fois.

Un soir, il y en avait deux.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-099",
    title: "La forêt près de chez nous",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "La forêt a changé depuis que j'étais enfant.",
    blurbEn:
      "Walking the same forest for thirty years and noticing what has changed: drier summers, sick trees, and new species arriving. (Section: Nature and animals, 2/5.)",
    body: `Je marche dans la même forêt depuis trente ans. Enfant, j'y allais avec mon père. Aujourd'hui, j'y vais avec mes enfants.

C'est une forêt ordinaire, à vingt minutes de la maison. Il y a des chênes, des hêtres, quelques pins, et un petit ruisseau.

Cette forêt a beaucoup changé, et il faut du temps pour le remarquer.

Le ruisseau, d'abord. Quand j'étais petit, il y avait de l'eau toute l'année. Nous jouions dedans en été. Depuis six ou sept ans, il est complètement sec de juillet à septembre.

Ensuite, les arbres. Beaucoup de hêtres sont malades. Leurs feuilles brunissent trop tôt, dès le mois d'août. Un garde forestier m'a expliqué que les hêtres n'aiment pas les étés secs et chauds : leurs racines ne descendent pas assez profond.

« Dans cinquante ans, m'a-t-il dit, il n'y aura probablement plus de hêtres ici. On plante déjà d'autres espèces, qui viennent du sud. »

Il y a aussi des choses nouvelles. Certains oiseaux et insectes qui vivaient plus au sud sont arrivés dans notre région.

Mes enfants, eux, ne voient rien de tout cela. Pour eux, cette forêt est simplement la forêt. Elle est normale.

C'est ce qui me trouble le plus.

Chaque génération pense que le monde qu'elle découvre est le monde normal.

Alors je leur raconte le ruisseau.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-100",
    title: "Mon balcon pour les abeilles",
    category: "science",
    difficulty: "A2",
    minutes: 3,
    preview: "J'ai transformé mon balcon pour aider les insectes.",
    blurbEn:
      "Turning a small city balcony into a place for bees and butterflies: the right flowers, no chemicals, and water. (Section: Nature and animals, 3/5.)",
    body: `J'habite en ville, au quatrième étage. Je n'ai pas de jardin, seulement un balcon de trois mètres carrés.

L'année dernière, j'ai décidé de le transformer pour aider les insectes.

L'idée est venue d'un article que j'avais lu : le nombre d'insectes a chuté de façon spectaculaire en Europe. Or, sans insectes, il n'y a pas de pollinisation, et sans pollinisation, il n'y a presque plus de fruits ni de légumes.

Je pensais qu'un balcon serait inutile. Une voisine, qui travaille dans une association de nature, m'a dit le contraire : en ville, chaque balcon fleuri est une petite étape pour les insectes qui traversent la ville.

J'ai commencé par changer mes plantes. Avant, j'achetais des fleurs jolies mais sans intérêt pour les abeilles. Certaines fleurs modernes ne produisent presque pas de nectar.

Ma voisine m'a conseillé des plantes simples : de la lavande, du thym, de la sauge, des soucis. Ce sont aussi des plantes faciles, qui demandent peu d'eau.

Ensuite, j'ai arrêté tout produit chimique.

Enfin, j'ai mis une petite coupelle d'eau avec des cailloux, pour que les insectes puissent boire sans se noyer.

Les résultats ont été rapides. Dès le mois de juin, il y avait des abeilles chaque jour sur la lavande. En juillet, j'ai vu trois papillons différents.

Ce n'est pas grand-chose. Mais le matin, avec mon café, je regarde mon balcon travailler.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-101",
    title: "Le chien que nous avons adopté",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Nous avons adopté un chien de sept ans, pas un chiot.",
    blurbEn:
      "Adopting an older dog nobody wanted: less work than a puppy, a difficult first month, and a companion who was already grateful. (Section: Nature and animals, 4/5.)",
    body: `Il y a deux ans, nous avons décidé d'adopter un chien. Mes enfants voulaient un chiot, bien sûr.

Mais au refuge, la bénévole nous a expliqué quelque chose d'important. Les chiots trouvent une famille en quelques jours. Les chiens âgés, eux, restent parfois des années.

« Les gens veulent tous des chiots », a-t-elle dit. « Pourtant, un chien de sept ans est souvent plus facile : il est calme, il est propre, et il connaît déjà les règles. »

Nous avons rencontré Oscar, un chien de sept ans, noir et blanc. Son maître était entré en maison de retraite et ne pouvait plus le garder.

Oscar était au refuge depuis onze mois.

Il ne courait pas vers nous comme les jeunes chiens. Il est resté assis et il nous a regardés calmement.

Nous l'avons choisi.

Le premier mois a été difficile. Il ne mangeait pas beaucoup et il dormait près de la porte, comme s'il attendait quelqu'un. Une nuit, il a hurlé pendant une heure.

Le vétérinaire nous a dit d'être patients : un chien âgé a une histoire, et il lui faut du temps.

Petit à petit, Oscar a changé de place. Il a quitté la porte pour le tapis du salon, puis pour le canapé.

Aujourd'hui, il a neuf ans. Il marche lentement et il dort beaucoup.

Mais chaque soir, il vient poser sa tête sur les genoux de ma fille.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-102",
    title: "Une sortie à la mer en hiver",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Nous sommes allés à la mer en janvier, sans personne.",
    blurbEn:
      "The seaside in January: empty beaches, closed shops, wind, and a quiet kind of beauty summer never shows. (Section: Nature and animals, 5/5.)",
    body: `En janvier, nous sommes allés passer une journée à la mer. Beaucoup de gens trouvent cette idée étrange : la mer, c'est pour l'été.

Nous sommes arrivés vers onze heures. Il faisait six degrés et il y avait beaucoup de vent.

La plage était complètement vide. En août, il y a des milliers de personnes ici, des parasols partout et il faut arriver à neuf heures pour trouver une place.

Ce jour-là, nous avons vu quatre personnes en trois heures : un couple âgé, un homme avec un chien, et un pêcheur.

La ville aussi était différente. La moitié des restaurants et des magasins étaient fermés jusqu'en avril. Sur les portes, il y avait des papiers : « Réouverture le 1er avril ».

Nous avons marché sur la plage pendant une heure. Le vent était fort et froid ; il fallait parler très fort pour s'entendre. Mes enfants ont ramassé des coquillages et ont couru devant les vagues.

La mer était grise et agitée. Les vagues étaient hautes et faisaient beaucoup de bruit.

Ce n'était pas la mer des cartes postales. C'était plus sauvage, et je l'ai trouvée plus belle.

À midi, nous avons trouvé le seul restaurant ouvert. Il n'y avait que des habitants de la ville à l'intérieur.

La patronne nous a dit : « Vous avez raison de venir maintenant. L'hiver, la mer est à nous. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-103",
    title: "Mes projets pour l'année prochaine",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "L'année prochaine, je vais changer plusieurs choses.",
    blurbEn:
      "Plans for next year, in the near future tense: a course, a trip, and a promise to stop putting off the dentist. (Section: Plans and the future, 1/5.)",
    body: `Nous sommes en décembre, et comme chaque année à cette période, je pense à l'année prochaine.

Cette fois, j'ai décidé de faire les choses différemment. D'habitude, je fais une longue liste de résolutions en janvier : faire du sport, manger mieux, lire plus, apprendre l'espagnol, ranger la maison, économiser.

Résultat : au mois de mars, je n'ai rien fait du tout. Trop de projets en même temps, c'est comme n'avoir aucun projet.

Alors cette année, j'ai choisi trois choses seulement.

D'abord, je vais m'inscrire à une formation de comptabilité. Mon travail va changer l'année prochaine et j'aurai besoin de ces connaissances. Les cours commencent en février, le mardi soir, pendant quatre mois.

Ensuite, je vais partir en voyage avec ma sœur. Nous en parlons depuis six ans et nous ne l'avons jamais fait. Cette fois, nous avons déjà choisi les dates : la première semaine de septembre. Nous allons réserver en janvier, pour que ce soit vraiment décidé.

Enfin — et c'est le plus petit projet — je vais aller chez le dentiste. Je repousse ce rendez-vous depuis deux ans.

Trois projets, c'est peu. Mais chacun a une date, et c'est nouveau pour moi.

Ma sœur m'a demandé pourquoi je ne mettais pas « faire du sport » sur la liste.

J'ai répondu : « Parce que je le mets tous les ans depuis dix ans. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-104",
    title: "Nous allons déménager",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Dans trois mois, nous allons quitter la ville.",
    blurbEn:
      "A family plans to leave the city for a small town: the reasons, the doubts, and the things they will miss. (Section: Plans and the future, 2/5.)",
    body: `Dans trois mois, nous allons quitter la ville. Nous allons nous installer dans une petite ville, à quarante minutes d'ici.

La décision n'a pas été facile. Nous en avons parlé pendant presque un an.

Il y a plusieurs raisons. La première est financière : ici, un appartement de trois pièces coûte très cher. Là-bas, pour le même prix, nous aurons une maison avec un jardin.

La deuxième raison, ce sont les enfants. Ils grandissent, et notre appartement devient trop petit. Ils partagent une chambre et ils se disputent tous les soirs.

Mais il y a aussi des inquiétudes.

Mon mari va garder son travail en ville. Il va donc prendre le train chaque matin : quarante minutes à l'aller, quarante minutes au retour. C'est presque une heure et demie par jour.

Moi, je vais devoir chercher un nouveau travail. Ce n'est pas simple, et j'ai un peu peur.

Les enfants vont changer d'école. Ma fille est triste : elle va quitter ses amies. Nous lui avons promis qu'elle pourrait les inviter souvent.

Et je vais quitter mon quartier, où j'habite depuis onze ans. Je connais le boulanger, la pharmacienne, mes voisins.

La semaine prochaine, nous allons commencer à trier nos affaires.

Nous sommes contents et inquiets en même temps. Je crois que c'est normal.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-105",
    title: "Quand je serai à la retraite",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Mon père prend sa retraite dans huit mois.",
    blurbEn:
      "A father counts down to retirement with excitement — and a quiet fear of empty days that nobody talks about. (Section: Plans and the future, 3/5.)",
    body: `Mon père prend sa retraite dans huit mois. Il a soixante-trois ans et il a travaillé quarante-deux ans dans la même entreprise.

Depuis un an, il en parle beaucoup. Il compte les mois, puis les semaines.

Il a plein de projets. Il va enfin refaire le jardin, qu'il a négligé pendant des années. Il va apprendre à faire du pain — il a déjà acheté deux livres. Il va aussi voyager avec ma mère : ils veulent visiter l'Italie au printemps.

Mais la semaine dernière, pendant un déjeuner, il m'a dit quelque chose de plus sérieux.

Nous étions seuls dans la cuisine. Il a posé sa tasse et il a dit : « Tu sais, j'ai un peu peur aussi. »

J'ai été surpris.

Il a expliqué : « Pendant quarante ans, je me suis levé à six heures avec une raison. Les gens me demandaient des choses. J'étais utile. Dans huit mois, plus rien. »

Il m'a raconté l'histoire d'un ancien collègue, parti à la retraite il y a trois ans. Les six premiers mois, cet homme était ravi. Puis il est devenu triste et il ne sortait presque plus.

« Je ne veux pas ça », m'a dit mon père.

Alors il a déjà pris une décision : il va faire du bénévolat deux matins par semaine, dans une association qui aide les enfants à faire leurs devoirs.

« Le jardin, c'est bien », m'a-t-il dit. « Mais il ne me dira jamais merci. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-106",
    title: "Ma fille veut devenir vétérinaire",
    category: "everyday life",
    difficulty: "A2",
    minutes: 3,
    preview: "Ma fille a quinze ans et elle sait déjà ce qu'elle veut faire.",
    blurbEn:
      "A fifteen-year-old is certain she will be a vet. Her parents research what that really takes — and decide how much to say. (Section: Plans and the future, 4/5.)",
    body: `Ma fille Inès a quinze ans et elle sait exactement ce qu'elle veut faire : elle veut devenir vétérinaire.

Ce n'est pas une idée nouvelle. Elle en parle depuis l'âge de neuf ans, et son idée n'a jamais changé.

Elle adore les animaux. Elle a lu des dizaines de livres sur le sujet. L'été dernier, elle a passé deux semaines chez un vétérinaire de campagne, comme observatrice.

Mais ce métier est très difficile à obtenir. Il faut d'excellentes notes, surtout en sciences, et les études durent six ans après le lycée. Il y a beaucoup plus de candidats que de places.

Mon mari et moi, nous avons hésité sur l'attitude à prendre.

Fallait-il l'avertir ? Lui dire que c'était très dur, que peu de gens réussissaient ?

Nous avons finalement choisi d'être honnêtes, mais sans casser son rêve.

Nous lui avons donné les vraies informations : les notes nécessaires, la durée des études, le nombre de places. Elle a tout écouté sérieusement.

Puis elle a dit : « Je sais. C'est pour ça que je travaille. »

Cette année, elle a dix-sept de moyenne en sciences.

Nous lui avons aussi dit une chose importante : si elle n'y arrive pas, ce ne sera pas un échec. Il existe d'autres métiers avec les animaux.

Elle a répondu : « D'accord. Mais d'abord, j'essaie. »

Je crois que c'est exactement la bonne réponse.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-107",
    title: "Si j'avais plus de temps",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "« Si j'avais le temps... » Je dis cette phrase trop souvent.",
    blurbEn:
      "'If I had time' is the most common excuse — until an honest look at one week shows where the hours actually go. (Section: Plans and the future, 5/5.)",
    body: `« Si j'avais le temps, j'apprendrais le piano. »
« Si j'avais le temps, je verrais mes amis plus souvent. »

Je dis ces phrases très souvent. Presque tout le monde les dit.

Mais le mois dernier, j'ai fait une expérience un peu désagréable. Pendant une semaine, j'ai noté comment je passais mes journées, heure par heure.

Les résultats étaient clairs.

Le travail et les transports : neuf heures par jour. Le sommeil : sept heures. Les repas, la douche, les courses, le ménage : environ deux heures et demie.

Il restait donc environ cinq heures par jour.

Cinq heures ! Je pensais n'avoir aucun temps libre, et j'avais cinq heures.

Alors où allaient-elles ?

D'après mon téléphone, j'utilisais les écrans presque trois heures par jour : les réseaux sociaux, les vidéos, les informations que je relisais dix fois.

Le reste partait dans des choses que je ne me rappelais même pas le soir.

Cette découverte m'a mise mal à l'aise. Je n'avais pas un problème de temps : j'avais un problème de choix.

Je n'ai pas tout changé, parce que se reposer est nécessaire aussi. On ne peut pas remplir chaque minute.

Mais j'ai pris une petite décision : deux soirs par semaine, je laisse mon téléphone dans une autre pièce après vingt heures.

En trois mois, j'ai lu quatre livres.

Je n'ai toujours pas commencé le piano. Mais maintenant, je sais que ce n'est pas le temps qui manque.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-108",
    title: "La nouvelle ligne de tram",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview: "La ville va construire une nouvelle ligne de tram.",
    blurbEn:
      "The city announces a new tram line: two years of roadworks, divided opinions, and a public meeting that fills the room. (Section: Local news, 1/5.)",
    body: `La mairie a annoncé la semaine dernière la construction d'une nouvelle ligne de tram. Elle traversera la ville de l'est à l'ouest et devrait ouvrir dans quatre ans.

Le projet coûtera environ trois cent millions d'euros. Il comprend quatorze stations et permettra de relier deux quartiers qui sont aujourd'hui mal desservis.

La nouvelle a divisé les habitants.

Beaucoup de gens sont contents. Dans le quartier est, il n'y a qu'une ligne de bus, souvent en retard. Une habitante interrogée par le journal local a expliqué qu'elle mettait cinquante minutes pour aller travailler, contre vingt minutes en voiture.

Mais d'autres sont inquiets, surtout les commerçants du centre.

Les travaux vont durer plus de deux ans. Pendant cette période, plusieurs rues seront fermées à la circulation, et les places de stationnement disparaîtront.

« Mes clients viennent en voiture », a déclaré un boulanger de la rue principale. « Deux ans sans stationnement, c'est très long pour un petit commerce. »

La mairie a organisé une réunion publique mardi soir. La salle était pleine : plus de deux cents personnes sont venues.

L'adjoint au maire a présenté le projet pendant quarante minutes, puis il a répondu aux questions pendant plus d'une heure.

Il a promis des aides financières pour les commerçants pendant les travaux.

Une deuxième réunion aura lieu en mars, quartier par quartier.

Les travaux devraient commencer en septembre prochain.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-109",
    title: "L'école du village va fermer",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview: "L'école du village n'aura plus assez d'élèves l'année prochaine.",
    blurbEn:
      "A village school with too few pupils is set to close, and the parents organise to stop it. (Section: Local news, 2/5.)",
    body: `L'école de Saint-Martin, un village de six cents habitants, pourrait fermer à la fin de l'année scolaire.

La raison est simple : le nombre d'élèves diminue. Il y a dix ans, l'école accueillait soixante-huit enfants. Aujourd'hui, ils ne sont plus que vingt-trois, répartis dans deux classes.

Selon les règles, il faut un minimum d'élèves pour maintenir une classe. Si la fermeture est confirmée, les enfants devront aller à l'école du bourg voisin, à onze kilomètres.

Pour les familles, cela signifie trente minutes de bus le matin et trente minutes le soir, pour des enfants de cinq à dix ans.

Les parents se sont organisés rapidement. Ils ont créé une association et ils ont récolté quatre cent cinquante signatures en deux semaines — presque tout le village.

Samedi dernier, ils ont organisé une manifestation devant la mairie. Environ cent personnes étaient présentes, dont des habitants sans enfants.

« Ce n'est pas seulement une école », a expliqué une mère de famille. « Quand l'école ferme, les jeunes familles ne viennent plus s'installer. Ensuite, c'est la boulangerie qui ferme. »

Le maire soutient les parents. Il a proposé une solution : accueillir les enfants d'un village voisin, qui n'a plus d'école depuis trois ans.

Cette proposition permettrait d'atteindre trente et un élèves.

La décision sera prise au mois de mai.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-110",
    title: "Un marché de producteurs le jeudi",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview: "Un nouveau marché de producteurs ouvre chaque jeudi soir.",
    blurbEn:
      "A new Thursday-evening farmers' market gives local producers a direct outlet — and gives shoppers a reason to linger. (Section: Local news, 3/5.)",
    body: `Depuis le mois d'avril, un nouveau marché a lieu chaque jeudi soir sur la place de la République, de dix-sept heures à vingt et une heures.

Ce marché est différent des marchés habituels : tous les vendeurs sont des producteurs de la région. Ils vendent uniquement ce qu'ils produisent eux-mêmes, dans un rayon de quarante kilomètres.

Il y a quatorze stands : des légumes, des fruits, du fromage, du miel, du pain, de la viande et même de la bière fabriquée dans un village voisin.

L'idée vient d'un groupe d'agriculteurs. Ils voulaient vendre directement aux habitants, sans intermédiaire.

« Quand je vends à un supermarché, je reçois environ trente pour cent du prix final », a expliqué un producteur de légumes. « Ici, je reçois tout, et je peux discuter avec les gens qui mangent mes produits. »

Le choix de l'horaire n'est pas un hasard. Le marché ouvre à dix-sept heures pour que les personnes qui travaillent puissent venir après le bureau.

Le succès a été rapide. Le premier jeudi, il y avait environ deux cents visiteurs. Au mois de juin, ils étaient plus de huit cents.

La mairie a installé quelques tables et un producteur vend des plats à emporter. Beaucoup de gens restent pour manger sur place.

« Ce n'est plus seulement un marché », dit une habitante. « C'est devenu la soirée du village. »

Le marché continuera tout l'hiver.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-111",
    title: "La bibliothèque prête aussi des outils",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview: "On peut maintenant emprunter une perceuse à la bibliothèque.",
    blurbEn:
      "The town library starts lending tools as well as books — a simple idea that saves money and cupboard space. (Section: Local news, 4/5.)",
    body: `Depuis le mois de janvier, la bibliothèque municipale prête des objets, en plus des livres. On peut y emprunter une perceuse, une machine à coudre, un appareil à raclette ou une tente.

Le service s'appelle la « bibliothèque d'objets ». Il compte aujourd'hui environ cent quatre-vingts articles.

L'idée est simple. Beaucoup d'objets sont utilisés très rarement. Une perceuse, par exemple, sert en moyenne quelques minutes par an dans une maison. Pourtant, presque chaque foyer en possède une.

« Nous achetons tous les mêmes objets, nous les utilisons deux fois, puis ils dorment dans un placard », explique la responsable du projet.

Le fonctionnement ressemble à celui des livres. Il faut être inscrit à la bibliothèque, ce qui est gratuit pour les habitants de la commune. On peut emprunter un objet pendant une semaine, et les outils les plus demandés pendant trois jours seulement.

Le prêt est gratuit, mais il faut laisser une caution pour certains appareils.

Les objets ont été donnés par des habitants ou achetés grâce à une subvention.

Après huit mois, le bilan est positif : plus de mille deux cents emprunts. Les outils de bricolage sont les plus demandés, suivis par les appareils de cuisine.

Un utilisateur raconte : « J'avais besoin d'une ponceuse pour un week-end. En acheter une coûtait quatre-vingts euros. »

Trois autres villes de la région étudient maintenant le même projet.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-112",
    title: "Le pont sera fermé cet été",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview: "Le vieux pont sera fermé pendant trois mois pour des travaux.",
    blurbEn:
      "The old bridge closes for three months of essential repairs, and the town works out how to cope. (Section: Local news, 5/5.)",
    body: `Le pont Saint-Jacques sera complètement fermé du 1er juillet au 30 septembre. La mairie a annoncé cette décision lundi.

Le pont, construit en 1911, a besoin de travaux importants. Lors d'une inspection en février, les ingénieurs ont constaté que la structure était fragilisée. Depuis mars, les camions de plus de trois tonnes y sont déjà interdits.

« Ces travaux ne peuvent pas attendre », a déclaré le maire. « Il s'agit de sécurité. »

La fermeture posera des difficultés, car le pont est très utilisé : environ douze mille véhicules par jour. C'est le seul passage direct entre le nord et le sud de la ville.

Pendant les travaux, les automobilistes devront faire un détour de six kilomètres par le pont de l'Europe.

Plusieurs mesures ont été prévues pour limiter les problèmes.

D'abord, la ligne de bus numéro 4 sera renforcée : un bus toutes les dix minutes au lieu de vingt.

Ensuite, une navette fluviale gratuite transportera les piétons et les cyclistes d'une rive à l'autre, de sept heures à vingt heures.

Enfin, la mairie a choisi la période des vacances scolaires, quand la circulation est plus faible.

Les commerçants des deux rives s'inquiètent malgré tout.

Le coût total des travaux est estimé à quatre millions d'euros.

Le pont rouvrira le 1er octobre, avec une piste cyclable en plus.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-113",
    title: "Le tutoiement et le vouvoiement",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "En français, il faut choisir entre « tu » et « vous ».",
    blurbEn:
      "French makes you choose between 'tu' and 'vous' — a decision English speakers never have to make, and often get wrong. (Section: France and Britain, 1/5.)",
    body: `En anglais, il n'y a qu'un seul mot : « you ». En français, il faut choisir entre « tu » et « vous ». Pour mon ami anglais Tom, c'est l'une des choses les plus difficiles.

La règle générale semble simple. On dit « tu » à la famille, aux amis, aux enfants et aux collègues proches. On dit « vous » aux inconnus, aux personnes plus âgées, aux clients et dans les situations officielles.

Mais dans la vraie vie, c'est beaucoup plus compliqué.

Tom m'a raconté plusieurs erreurs.

Un jour, il a tutoyé un homme de soixante ans dans un magasin. L'homme a paru surpris et un peu froid. En France, tutoyer un inconnu plus âgé peut sembler impoli.

Une autre fois, c'était l'inverse. Dans une soirée, il a vouvoyé un ami de son âge pendant deux heures. À la fin, l'autre lui a dit en riant : « On peut se tutoyer, tu sais ! »

Les règles changent aussi selon les milieux. Dans certaines entreprises, tout le monde se tutoie, même le directeur. Dans d'autres, on vouvoie son chef pendant vingt ans.

J'ai donné un conseil simple à Tom : quand tu ne sais pas, commence par « vous ». C'est la solution la plus sûre.

Et il existe une phrase magique pour changer : « On peut se tutoyer ? »

Le plus souvent, c'est la personne la plus âgée qui la propose.

Tom l'a apprise par cœur.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-114",
    title: "Le travail et les vacances",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "En France, on a cinq semaines de vacances par an.",
    blurbEn:
      "Five weeks of paid holiday, the 35-hour week and the 'right to disconnect': how French working life looks to a British friend. (Section: France and Britain, 2/5.)",
    body: `Quand Tom est arrivé en France pour travailler, plusieurs choses l'ont surpris.

La première, ce sont les vacances. En France, tous les salariés ont au minimum cinq semaines de congés payés par an. Beaucoup d'entreprises en donnent même un peu plus.

Au Royaume-Uni, le minimum légal est d'environ quatre semaines, jours fériés compris. La différence n'est pas énorme sur le papier, mais elle est réelle dans la pratique.

La deuxième surprise, c'est la durée légale du travail : trente-cinq heures par semaine. Cela ne veut pas dire que personne ne travaille plus — beaucoup de gens font plus. Mais au-delà, ce sont des heures supplémentaires, qui doivent être payées ou récupérées.

La troisième surprise concerne les e-mails du soir.

Dans son ancien travail à Londres, Tom recevait des messages à vingt-deux heures et il y répondait. C'était normal.

En France, il existe depuis 2017 un « droit à la déconnexion ». Les entreprises doivent respecter le temps de repos de leurs salariés en dehors des heures de travail.

La première fois que Tom a envoyé un message professionnel un dimanche, un collègue lui a répondu le lundi matin : « Le dimanche, je ne lis pas mes messages. »

Tom l'a mal pris au début. Puis il a compris que ce n'était pas une critique.

Aujourd'hui, il éteint son ordinateur à dix-huit heures.

« C'est la meilleure habitude que la France m'a donnée », dit-il.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-115",
    title: "Aller chez le médecin en France",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "En France, on paie le médecin, puis on est remboursé.",
    blurbEn:
      "You pay the doctor first and get refunded later — a system that puzzles British visitors used to the NHS. (Section: France and Britain, 3/5.)",
    body: `La première fois que Tom est allé chez le médecin en France, il n'a rien compris.

Au Royaume-Uni, avec le NHS, on ne paie pas la consultation. On prend rendez-vous, on voit le médecin, et on repart sans payer.

En France, le système est différent. À la fin de la consultation, le médecin demande le paiement : environ trente euros pour un généraliste.

Tom a été très surpris. Il pensait que la santé était gratuite en France aussi.

En réalité, elle n'est pas gratuite : elle est remboursée.

Après la consultation, la Sécurité sociale rembourse environ soixante-dix pour cent du prix. Ensuite, une assurance complémentaire — la « mutuelle » — rembourse souvent le reste.

Avec la carte Vitale, tout se fait automatiquement, en quelques jours.

Tom trouvait ce système compliqué. Mais il a remarqué un avantage.

En France, on peut prendre rendez-vous rapidement, souvent en deux ou trois jours. On peut aussi choisir librement son médecin, et même consulter directement certains spécialistes.

« Chez moi, dit-il, j'attendais parfois trois semaines pour un rendez-vous. »

Chaque système a ses qualités et ses défauts. Le système britannique est plus simple : rien à payer, rien à réclamer. Le système français est plus rapide, mais il demande de l'argent à l'avance.

Tom a maintenant une carte Vitale et une mutuelle.

« J'ai mis un an à comprendre », dit-il. « Maintenant, ça va. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-116",
    title: "L'humour français et l'humour anglais",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Tom trouve que les Français ne comprennent pas son humour.",
    blurbEn:
      "British irony delivered with a straight face confuses French listeners — and French wordplay confuses Tom. (Section: France and Britain, 4/5.)",
    body: `Tom dit souvent une chose amusante : « En Angleterre, j'étais quelqu'un de drôle. En France, je suis quelqu'un de bizarre. »

L'humour voyage mal. Ce n'est pas une question de langue seulement : c'est une question de style.

L'humour britannique utilise beaucoup l'ironie et l'auto-dérision. On dit le contraire de ce qu'on pense, avec un visage sérieux, et l'autre doit comprendre.

Par exemple, sous une pluie terrible, un Britannique dira : « Quel temps magnifique ! » En Angleterre, tout le monde sourit.

La première fois que Tom a fait cette blague en France, un collègue lui a répondu très sérieusement : « Non, il pleut beaucoup aujourd'hui. »

Tom ne savait pas quoi dire.

Le problème n'est pas que les Français n'aiment pas l'ironie. Ils l'utilisent aussi. Mais elle est souvent accompagnée d'un signe : un sourire, un ton particulier. Le visage complètement neutre des Britanniques peut être déroutant.

De son côté, Tom ne comprend pas toujours l'humour français. Il y a beaucoup de jeux de mots, et les jeux de mots sont presque impossibles à traduire.

« Quand tout le monde rit et que je dois demander l'explication, ce n'est plus drôle », dit-il.

Il progresse quand même. La semaine dernière, il a fait un jeu de mots en français.

Il était mauvais. Mais tout le monde a ri.

Et cette fois, c'était pour la bonne raison.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-a2-117",
    title: "Deux façons de faire la queue",
    category: "culture",
    difficulty: "A2",
    minutes: 3,
    preview: "Les Britanniques adorent les files d'attente. Les Français, moins.",
    blurbEn:
      "Queueing is almost sacred in Britain and rather more flexible in France — a small difference that reveals a lot. (Section: France and Britain, 5/5.)",
    body: `Il existe une différence culturelle dont Tom parle souvent : la façon de faire la queue.

Au Royaume-Uni, la file d'attente est presque sacrée. Les gens se placent naturellement les uns derrière les autres, en ligne droite, même à un arrêt de bus. Passer devant quelqu'un est considéré comme très grave.

En France, la queue existe aussi, bien sûr. Mais elle est souvent moins droite et moins stricte. À la boulangerie, par exemple, les gens forment plutôt un petit groupe.

La première fois, Tom a trouvé cela chaotique. Il pensait que personne ne savait qui était arrivé le premier.

Puis il a observé, et il a compris qu'il se trompait.

Les gens savent parfaitement à qui c'est le tour. Ils s'observent, et souvent quelqu'un dit : « C'est à vous, madame, je crois. »

Il y a une règle importante à connaître. Quand on entre dans une petite boutique, il faut demander : « C'est qui le dernier ? » ou « Vous êtes la dernière ? »

Cette question résout tout, sans ligne droite.

Tom a mis du temps à l'apprendre. Au début, il restait poliment près de la porte, et les gens entraient après lui et passaient devant. Il attendait quinze minutes sans être servi.

« Personne n'était malhonnête », dit-il maintenant. « Simplement, je n'avais pas dit que j'étais là. »

Deux cultures, deux méthodes.

Dans les deux cas, l'idée est la même : chacun son tour.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-051",
    title: "Vivre dans une grande ville",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "La ville promet tout, et elle épuise aussi.",
    blurbEn:
      "Cities offer everything — work, culture, anonymity — and exhaust you at the same time. An honest balance sheet of urban life. (Section: City living, 1/5.)",
    body: `J'habite dans une grande ville depuis douze ans. On me demande souvent si j'aime ça, et je n'arrive jamais à répondre simplement. La vérité, c'est que la ville donne beaucoup et prend beaucoup.

Commençons par ce qu'elle donne. Le choix, d'abord. Il y a du travail, et pas seulement quelques emplois : des milliers, dans des domaines très différents. Quand j'ai voulu changer de métier, je n'ai pas eu besoin de déménager. Dans le village de mes parents, c'était impossible.

Il y a aussi la culture. Un concert un mardi soir, une exposition un dimanche, un cinéma qui passe des films que personne ne connaît. Je n'en profite pas toutes les semaines, loin de là. Mais savoir que c'est possible change quelque chose.

Enfin, il y a l'anonymat. Dans un village, tout le monde sait ce que vous faites. En ville, personne ne vous regarde. Selon les personnes, c'est une liberté ou une solitude.

Maintenant, ce qu'elle prend.

Le bruit, d'abord, qui ne s'arrête jamais vraiment. Le prix, ensuite : je paie pour trente-huit mètres carrés ce que mon frère paie pour une maison avec jardin. Et la fatigue, surtout. Les transports pleins, les files d'attente, les gens pressés : tout demande un petit effort, et ces petits efforts s'additionnent.

Alors, faut-il rester ou partir ? Je crois que la question est mal posée. Ce qui compte, c'est de savoir ce qu'on est venu chercher.

Moi, je suis venu pour le travail et pour les possibilités. Tant que j'en profite, la ville a du sens.

Le jour où je paierai ce loyer sans plus rien en tirer, je saurai qu'il est temps de partir.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-052",
    title: "Le prix du logement",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Se loger est devenu le premier problème des habitants.",
    blurbEn:
      "Housing has become the biggest expense and the biggest worry in French cities. Why prices rose, and what is actually being tried. (Section: City living, 2/5.)",
    body: `Dans la plupart des grandes villes françaises, se loger est devenu le premier problème des habitants. Le logement représente aujourd'hui environ un tiers du budget d'un ménage, et souvent bien plus pour les jeunes et les personnes seules.

Comment en est-on arrivé là ? Plusieurs facteurs se sont additionnés.

D'abord, la population des villes a augmenté, alors que le nombre de logements n'a pas suivi au même rythme. Quand la demande dépasse l'offre, les prix montent : c'est mécanique.

Ensuite, la taille des ménages a changé. Il y a cinquante ans, un logement accueillait en moyenne trois personnes ; aujourd'hui, un peu plus de deux. Il faut donc davantage de logements pour la même population.

Enfin, dans les villes très touristiques, une partie du parc est passée à la location de courte durée, plus rentable pour les propriétaires. Des appartements qui abritaient des habitants accueillent désormais des voyageurs.

Les conséquences sont concrètes. Des personnes qui travaillent en ville n'y habitent plus : elles s'installent à trente ou quarante kilomètres et passent deux heures par jour dans les transports. Certains métiers essentiels — infirmiers, enseignants, employés municipaux — deviennent difficiles à pourvoir, faute de logement abordable.

Que faire ? Aucune solution unique ne suffit. Construire davantage est nécessaire, mais long et parfois impopulaire. Encadrer les loyers, comme le font plusieurs villes, protège les locataires mais ne crée pas de logements. Limiter les locations de courte durée aide dans les quartiers les plus touchés.

Ce qui est certain, c'est que le sujet ne concerne pas seulement les mal-logés.

Une ville où seuls les plus aisés peuvent habiter finit par perdre ce qui la faisait fonctionner.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-053",
    title: "Pourquoi les villes plantent des arbres",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Les arbres en ville ne sont pas seulement décoratifs.",
    blurbEn:
      "Urban trees are not decoration: they cool streets by several degrees, absorb water and calm the mind. Why cities are planting again. (Section: City living, 3/5.)",
    body: `Depuis quelques années, de nombreuses villes françaises plantent des arbres à un rythme qu'on n'avait pas vu depuis longtemps. Ce n'est pas seulement une question d'esthétique.

La première raison est la chaleur. Les villes sont nettement plus chaudes que les campagnes qui les entourent — parfois de cinq à dix degrés lors des nuits d'été. Le béton et le bitume absorbent la chaleur toute la journée et la restituent la nuit. On appelle ce phénomène « l'îlot de chaleur urbain ».

Les arbres agissent de deux façons. Ils font de l'ombre, ce qui est évident. Mais surtout, ils rafraîchissent l'air en évaporant de l'eau par leurs feuilles, un peu comme un brumisateur naturel. Une rue bien plantée peut être de trois à six degrés plus fraîche qu'une rue nue. Lors d'une canicule, cette différence n'est pas un confort : elle peut être vitale pour les personnes âgées.

La deuxième raison concerne l'eau. Quand il pleut fort sur une ville entièrement bétonnée, l'eau ne pénètre nulle part et les égouts débordent. Les sols plantés absorbent une partie de cette eau et réduisent les inondations.

Il existe enfin un effet moins mesurable, mais réel. Plusieurs études montrent que la présence d'arbres réduit le stress et améliore le bien-être des habitants. Les quartiers verts sont, en moyenne, des quartiers où les gens sortent davantage.

Tout cela suppose des choix. Un arbre en ville coûte cher à planter et à entretenir, et il faut parfois supprimer des places de stationnement pour lui faire de la place.

Ces débats sont souvent vifs en conseil municipal.

Mais un arbre planté aujourd'hui rendra service pendant soixante ans.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-054",
    title: "La ville la nuit",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "La nuit, la ville appartient à d'autres personnes.",
    blurbEn:
      "After midnight a different city appears: bakers, cleaners, nurses and drivers. A portrait of the people who keep it running while we sleep. (Section: City living, 4/5.)",
    body: `Il y a quelques mois, j'ai dû travailler de nuit pendant trois semaines. J'ai découvert une ville que je ne connaissais pas.

Entre minuit et cinq heures du matin, la ville ne dort pas : elle change d'habitants.

Vers une heure, ce sont encore les gens qui sortent. Les rues autour des bars sont animées, parfois bruyantes. Les taxis attendent. Puis, peu à peu, le calme s'installe.

À partir de trois heures, une autre population apparaît. Elle est invisible le jour, et pourtant elle fait fonctionner tout le reste.

Les boulangers, d'abord. Dans le fournil, la lumière est allumée depuis deux heures du matin. Le pain que nous achèterons à sept heures est déjà en train de cuire.

Les employés du nettoyage, ensuite. Ils entrent dans les bureaux et les gares quand tout le monde en est sorti. Le matin, nous trouvons des lieux propres sans jamais voir qui les a nettoyés.

Il y a aussi les soignants des hôpitaux, les conducteurs qui livrent les magasins, les agents qui réparent les rails du métro pendant les quelques heures où il ne circule pas.

Ce qui m'a le plus frappé, c'est le silence relatif. On entend des choses qu'on n'entend jamais : le bruit d'un volet, un oiseau à quatre heures et demie, ses propres pas.

Quand je suis revenu à un rythme normal, j'ai gardé une habitude.

Le matin, à la boulangerie, je regarde la personne derrière le comptoir et je me demande à quelle heure elle a commencé.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-055",
    title: "Faut-il quitter la ville ?",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Beaucoup en rêvent. Certains le font. Tous ne réussissent pas.",
    blurbEn:
      "Leaving the city for the countryside is a common dream. What the people who actually did it say about the reality. (Section: City living, 5/5.)",
    body: `« Un jour, je quitterai la ville. » Beaucoup de citadins le disent. Certains le font vraiment. Il est intéressant d'écouter ce qu'ils racontent ensuite.

Les raisons du départ se ressemblent souvent : le prix des logements, la fatigue, le bruit, l'envie d'un jardin, parfois la naissance d'un enfant. La possibilité du télétravail a rendu ce projet réaliste pour des gens qui, autrefois, n'auraient pas pu l'envisager.

Ceux qui réussissent leur installation citent presque toujours les mêmes éléments.

D'abord, ils ont choisi un endroit qu'ils connaissaient déjà, où ils avaient de la famille ou des amis. Arriver quelque part sans connaître personne est beaucoup plus difficile qu'on ne l'imagine.

Ensuite, ils ont vérifié les aspects pratiques avant de partir : la couverture internet, la distance de l'école, du médecin, du supermarché. Ces détails paraissent secondaires depuis un appartement en ville ; ils structurent la vie quotidienne à la campagne.

Enfin, ils se sont impliqués dans la vie locale — l'association sportive, le comité des fêtes, l'école. Ceux qui restent entre eux, sans jamais participer, se sentent souvent isolés au bout d'un an.

Ceux qui reviennent en ville, eux, évoquent trois choses : l'isolement, la dépendance à la voiture pour le moindre déplacement, et l'ennui de leurs adolescents.

Il n'y a donc pas de bonne réponse générale.

La vraie question n'est pas « ville ou campagne ? », mais « qu'est-ce que je fuis, et qu'est-ce que je cherche ? ».

Ceux qui partent seulement pour fuir sont rarement satisfaits.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-056",
    title: "Voyager moins, mais mieux",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Faut-il visiter cinq villes en une semaine ?",
    blurbEn:
      "Five cities in seven days leaves you with photographs and exhaustion. The case for staying longer in fewer places. (Section: Travel, 1/5.)",
    body: `Il y a quelques années, je voyageais d'une certaine façon : le plus de choses possible en le moins de temps possible. Cinq villes en sept jours, trois musées par jour, une liste à cocher.

Je rentrais épuisé, avec sept cents photos et des souvenirs étrangement flous. Je confondais les églises. Je ne me rappelais pas dans quelle ville j'avais mangé tel plat.

Depuis trois ans, je fais l'inverse : une seule ville, ou même un seul quartier, pendant toute la durée du séjour.

Le changement a été plus profond que prévu.

Quand on reste plusieurs jours au même endroit, on cesse d'être un visiteur pressé. On prend le même café le matin, et le troisième jour, la serveuse vous reconnaît. On comprend le rythme du lieu : à quelle heure les rues se remplissent, quel jour est celui du marché, où les habitants vont réellement manger.

On a aussi le temps d'avoir des journées ratées, ce qui est précieux. Il pleut ? Ce n'est pas grave, il reste quatre jours. Dans un programme serré, une journée de pluie détruit tout.

Cette manière de voyager a un autre avantage, moins personnel. Rester plus longtemps au même endroit réduit les trajets, donc les émissions liées au voyage, et l'argent dépensé profite davantage à l'économie locale qu'aux compagnies de transport.

Je ne prétends pas que ce soit la seule bonne méthode. Un premier voyage dans un pays justifie parfois de bouger beaucoup.

Mais je ne compte plus les villes visitées.

Je compte les endroits où j'ai fini par me sentir un peu chez moi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-057",
    title: "Quand le tourisme dérange les habitants",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Certaines villes reçoivent plus de visiteurs qu'elles ne peuvent en accueillir.",
    blurbEn:
      "Tourism brings money and jobs — and can hollow out the places it loves. What over-visited towns are trying to do about it. (Section: Travel, 2/5.)",
    body: `Le tourisme fait vivre des régions entières. En France, il représente environ huit pour cent de l'économie et des centaines de milliers d'emplois. Personne de sérieux ne propose de s'en passer.

Pourtant, dans certaines villes, la relation entre les habitants et les visiteurs s'est tendue.

Le problème n'est pas le tourisme en soi : c'est sa concentration. Les visiteurs arrivent aux mêmes endroits, aux mêmes mois, et souvent aux mêmes heures. Une ruelle qui accueille agréablement cinquante personnes devient invivable avec cinq cents.

Les conséquences sont bien documentées. Les logements se transforment en locations de courte durée, plus rentables, ce qui fait monter les loyers pour les habitants. Les commerces changent : la quincaillerie et le cordonnier laissent la place aux boutiques de souvenirs. Peu à peu, le centre-ville cesse d'être un lieu de vie pour devenir un décor.

Plusieurs villes européennes ont commencé à réagir. Certaines limitent le nombre de croisières autorisées. D'autres encadrent strictement les locations touristiques ou instaurent une taxe de séjour plus élevée. Quelques sites naturels très fragiles imposent désormais une réservation obligatoire.

Ces mesures sont critiquées, parfois par les habitants eux-mêmes, car beaucoup vivent du tourisme. L'équilibre est difficile à trouver.

En tant que voyageurs, nous avons pourtant une petite marge d'action. Venir hors saison, éviter les trois mêmes sites que tout le monde photographie, dormir dans un hôtel plutôt que dans un appartement retiré du marché locatif : ces choix ont un effet réel quand ils se multiplient.

Aimer un endroit, ce n'est pas seulement vouloir le voir.

C'est aussi accepter qu'il continue d'appartenir à ceux qui y vivent.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-058",
    title: "Le retour du train de nuit",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Les trains de nuit reviennent, après avoir presque disparu.",
    blurbEn:
      "Night trains almost vanished from Europe; now they are being reopened. Why they disappeared, and why they are coming back. (Section: Travel, 3/5.)",
    body: `Dans les années deux mille, les trains de nuit ont presque disparu d'Europe. En France, la plupart des lignes ont été fermées entre 2000 et 2017. Elles coûtaient cher, le matériel vieillissait, et les compagnies aériennes à bas prix proposaient des billets imbattables.

Depuis quelques années, le mouvement s'inverse. Plusieurs lignes ont rouvert, d'autres sont annoncées, en France comme en Autriche, en Suède ou en Allemagne.

Pourquoi ce retour ?

La raison la plus évidente est écologique. Un trajet en train émet en moyenne bien moins de gaz à effet de serre que le même trajet en avion. Pour des distances de six cents à mille cinq cents kilomètres, le train de nuit devient une alternative crédible.

Mais il y a aussi un argument pratique, souvent sous-estimé. Un train de nuit ne prend pas de temps sur la journée : on monte le soir, on dort, on arrive le matin. Pas d'aéroport à rejoindre, pas de contrôle deux heures avant, pas de nuit d'hôtel à payer. Comparé honnêtement, l'écart de durée réelle est plus faible qu'il n'y paraît.

Les difficultés restent nombreuses. Le matériel roulant coûte cher et il faut des années pour le construire. Les voies sont utilisées la nuit pour l'entretien. Enfin, il est difficile de rendre ces lignes rentables sans soutien public.

Le confort, lui, s'est amélioré : les nouvelles voitures proposent des compartiments plus petits, parfois individuels, très loin des couchettes à six d'autrefois.

J'ai pris un train de nuit l'an dernier. J'ai mal dormi, je l'admets.

Mais je me suis réveillé dans une autre région, sans avoir perdu un seul jour.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-059",
    title: "Apprendre quelques mots avant de partir",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Vingt mots changent complètement un voyage.",
    blurbEn:
      "You don't need to be fluent. Twenty words of the local language change how a country receives you — and why that is. (Section: Travel, 4/5.)",
    body: `Avant chaque voyage, j'apprends une vingtaine de mots dans la langue du pays. Pas des phrases compliquées : bonjour, merci, s'il vous plaît, pardon, oui, non, combien, où est, je ne comprends pas, au revoir.

Cela demande environ deux heures au total. Et l'effet est disproportionné.

La première fois que je l'ai constaté, c'était en Grèce. J'avais appris « bonjour » et « merci » dans l'avion. Dans une petite épicerie, je les ai utilisés maladroitement, avec un accent certainement terrible.

Le commerçant, qui parlait anglais, a immédiatement changé d'attitude. Il a souri, il a corrigé ma prononciation en riant, et il m'a offert un fruit.

Pourquoi une telle différence pour deux mots ?

Je crois que la raison est simple. Ces mots ne servent pas vraiment à communiquer : l'anglais aurait suffi. Ils servent à dire autre chose : « je sais que je suis chez vous, et je fais un effort ».

C'est une forme de politesse, et la politesse a toujours été un signal plus qu'une information.

L'inverse est vrai aussi. Un voyageur qui arrive et parle immédiatement anglais, en supposant que tout le monde le comprend, envoie lui aussi un message — même s'il ne s'en rend pas compte.

Je ne parle correctement aucune des langues des pays que j'ai visités. Je ne prétends pas le contraire.

Mais je n'ai jamais regretté ces deux heures.

Et il m'arrive encore, des années plus tard, de me souvenir du mot « merci » en hongrois.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-060",
    title: "Ce qu'on rapporte d'un voyage",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Les objets rapportés finissent souvent dans un tiroir.",
    blurbEn:
      "Souvenirs end up in drawers; habits stay for years. What travel actually leaves behind once the photographs are filed away. (Section: Travel, 5/5.)",
    body: `Pendant longtemps, j'ai rapporté des objets de mes voyages. Des petites statues, des boîtes décorées, des aimants pour le frigo. Presque tous ont fini dans un tiroir, et je serais incapable de dire de quel pays vient la moitié d'entre eux.

Ce qui est resté, en revanche, ce sont des choses que je n'avais pas prévu de rapporter.

Des habitudes, d'abord. Depuis un séjour en Espagne, je dîne plus tard et je marche après le repas. Depuis un voyage au Japon, j'enlève mes chaussures en entrant chez moi, et je trouve maintenant étrange de faire autrement. Ces gestes sont entrés dans ma vie sans que je les décide.

Des goûts, ensuite. J'ai découvert dans un marché marocain un mélange d'épices que je n'avais jamais utilisé. Je l'achète encore aujourd'hui, six ans plus tard, dans une épicerie de mon quartier.

Et surtout, une façon de voir. C'est plus difficile à expliquer.

Vivre quelques jours dans un endroit où les évidences ne sont pas les mêmes — les horaires, la place de la famille, la façon de discuter dans la rue — a un effet durable. On revient en trouvant un peu moins naturelles ses propres habitudes.

C'est peut-être là le vrai bénéfice du voyage : non pas ce qu'on a vu, mais ce qu'on cesse de considérer comme allant de soi.

Aujourd'hui, je n'achète presque plus de souvenirs.

En revanche, je note quelques lignes chaque soir. Ce carnet est le seul objet que je rapporte, et c'est le seul que je rouvre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-061",
    title: "Pourquoi nous dépensons sans le vouloir",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Nos décisions d'achat sont moins rationnelles qu'on ne le croit.",
    blurbEn:
      "We believe we choose freely, but shops and apps are designed around well-known mental shortcuts. Recognising them is the first defence. (Section: Money and choices, 1/5.)",
    body: `Nous aimons penser que nos achats sont réfléchis : nous comparons, nous évaluons, nous décidons. Les recherches en économie comportementale racontent une autre histoire.

Prenons un exemple courant. Dans un magasin, un article est affiché « 80 € au lieu de 120 € ». Notre cerveau ne retient pas vraiment le prix : il retient l'écart. Nous avons l'impression d'avoir gagné quarante euros, alors que nous en avons dépensé quatre-vingts. Le prix de référence sert d'ancre, et il est souvent choisi précisément pour cela.

Autre mécanisme bien connu : la douleur du paiement. Payer en espèces fait physiquement remarquer la dépense. Payer sans contact, en une seconde, la rend presque invisible. Plusieurs études montrent que nous dépensons davantage lorsque le geste de payer est moins concret. Les paiements en plusieurs fois amplifient encore l'effet : « quatre fois vingt-cinq euros » semble plus petit que cent euros, alors que c'est la même somme.

Il y a enfin la rareté artificielle. « Plus que deux en stock », « offre valable aujourd'hui » : ces messages déclenchent une réaction ancienne, la peur de manquer. Ils ne nous informent pas ; ils nous pressent.

Comprendre cela ne rend personne totalement rationnel. Ces mécanismes fonctionnent même quand on les connaît.

Mais on peut mettre en place quelques garde-fous simples : attendre vingt-quatre heures avant tout achat non prévu, regarder le prix final plutôt que la réduction, et se demander non pas « est-ce une bonne affaire ? » mais « en aurais-je voulu au prix normal ? ».

Cette dernière question, posée honnêtement, fait souvent tomber l'envie.

Ce n'est pas de la privation. C'est simplement reprendre la décision.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-062",
    title: "L'épargne de précaution",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Une réserve d'argent change la façon de vivre les imprévus.",
    blurbEn:
      "An emergency fund is not about getting rich; it is about not being forced into bad decisions when something breaks. (Section: Money and choices, 2/5.)",
    body: `On parle beaucoup d'investissement et assez peu d'une chose plus élémentaire : l'épargne de précaution, c'est-à-dire une réserve d'argent disponible immédiatement en cas d'imprévu.

L'idée n'a rien de spectaculaire. Il ne s'agit pas de faire fructifier son argent, mais de pouvoir absorber un choc : une voiture en panne, un appareil à remplacer, un mois de revenus en moins.

Son intérêt principal n'est d'ailleurs pas financier. Il est stratégique.

Une personne sans réserve subit les imprévus. Si sa machine à laver tombe en panne, elle doit soit s'endetter à un taux élevé, soit accepter la première solution disponible, soit se passer de la machine. Aucune de ces options n'est bonne, et toutes coûtent cher à terme.

Une personne qui dispose d'une réserve, même modeste, peut au contraire prendre le temps de comparer, attendre une réparation moins chère, ou refuser un crédit désavantageux.

C'est ce que les spécialistes appellent parfois « le coût de la pauvreté » : être à court d'argent oblige à faire des choix qui, précisément, coûtent plus cher.

Combien faut-il mettre de côté ? Les conseils varient, souvent entre un et trois mois de dépenses courantes. Mais ce chiffre décourage beaucoup de gens, qui renoncent avant de commencer.

Or l'essentiel est ailleurs. Une réserve de cinq cents euros change déjà énormément de situations quotidiennes.

Le meilleur conseil que j'aie reçu était très simple : mettre de côté un petit montant automatiquement, le jour du salaire, avant de dépenser quoi que ce soit.

Ce qu'on ne voit pas passer ne manque pas.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-063",
    title: "Réparer plutôt que remplacer",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Réparer un appareil est parfois plus difficile que d'en acheter un neuf.",
    blurbEn:
      "Repairing used to be normal and is now oddly difficult. What changed, and what repair cafés and new rules are trying to fix. (Section: Money and choices, 3/5.)",
    body: `Il y a quarante ans, on réparait. Un grille-pain, une télévision, une machine à laver : il existait un réparateur dans chaque quartier, et remplacer un appareil en état de marche aurait paru absurde.

Aujourd'hui, la situation s'est inversée. Faire réparer coûte souvent presque aussi cher qu'acheter neuf, et parfois davantage.

Plusieurs raisons expliquent ce basculement.

D'abord, le prix des objets manufacturés a beaucoup baissé, tandis que le coût du travail humain a augmenté. Une heure de main-d'œuvre peut dépasser la valeur de l'appareil.

Ensuite, la conception a changé. Beaucoup de produits sont assemblés par collage plutôt que par vis, ce qui rend l'ouverture difficile sans casse. Certaines pièces détachées ne sont pas vendues séparément, ou disparaissent quelques années après la commercialisation.

Enfin, les logiciels jouent un rôle croissant. Un appareil parfaitement fonctionnel peut devenir inutilisable simplement parce qu'il ne reçoit plus de mises à jour.

Des choses bougent toutefois. La France a instauré un « indice de réparabilité » affiché sur certains produits, et un bonus réparation qui prend en charge une partie du coût. Le droit européen impose progressivement la disponibilité des pièces détachées.

Parallèlement, des « repair cafés » se sont développés : des bénévoles y aident à réparer gratuitement, en apprenant aux gens à le faire eux-mêmes.

J'y suis allé une fois, avec un aspirateur qui ne fonctionnait plus.

Le problème était un morceau de tissu coincé. La réparation a pris douze minutes.

J'ai failli jeter un appareil de deux cents euros.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-064",
    title: "Les abonnements qu'on oublie",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Douze euros par mois paraissent peu. Ils ne le sont pas.",
    blurbEn:
      "Small monthly subscriptions are designed to be forgotten. An audit of one household's bank statement, and what it revealed. (Section: Money and choices, 4/5.)",
    body: `Le mois dernier, j'ai fait un exercice que je recommande à tout le monde : j'ai relu douze mois de relevés bancaires, ligne par ligne, en cherchant uniquement les paiements récurrents.

J'ai trouvé onze abonnements actifs. J'en utilisais réellement quatre.

Il y avait deux services de vidéo, dont un que je n'avais pas ouvert depuis huit mois. Une application de sport souscrite en janvier, dans un moment d'enthousiasme, et utilisée trois fois. Un espace de stockage en ligne dont j'avais oublié l'existence. Un magazine numérique. Une garantie sur un appareil que je ne possédais plus.

Le total atteignait soixante-treize euros par mois, soit près de neuf cents euros par an.

Ce qui m'a frappé, ce n'est pas la somme : c'est de ne pas l'avoir remarquée.

Le modèle de l'abonnement repose précisément là-dessus. Chaque montant est volontairement modeste, en dessous du seuil où l'on réagit. Le prélèvement est automatique, donc invisible. Et il n'y a aucun moment de décision : on ne choisit pas de payer, on choisit seulement d'arrêter — ce qui demande un effort actif.

Les entreprises le savent parfaitement. C'est pourquoi il faut souvent trois clics pour s'inscrire et beaucoup plus pour résilier.

J'ai supprimé sept abonnements. La procédure a pris environ quarante minutes au total.

Quarante minutes pour six cents euros par an : c'est probablement le meilleur taux horaire de ma vie.

Depuis, j'ai adopté une règle. Chaque année, en janvier, je relis mes relevés.

Et j'annule tout ce que je ne pourrais pas justifier à voix haute.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-065",
    title: "Le prix des choses n'est pas leur valeur",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Deux objets au même prix ne se valent pas.",
    blurbEn:
      "Cost per use, not sticker price, is the useful measure — and it explains why cheap things are often expensive. (Section: Money and choices, 5/5.)",
    body: `Il y a quelques années, j'ai acheté une paire de chaussures à trente euros. Elles ont tenu sept mois. J'en ai racheté une paire semblable, puis une autre.

Un ami m'a alors expliqué un calcul très simple, qui a changé ma façon d'acheter : le coût par utilisation.

Trente euros pour sept mois de port quotidien, cela revient à environ quatorze centimes par jour. Une paire à cent vingt euros qui dure cinq ans revient à sept centimes. La paire « chère » coûte donc deux fois moins.

Ce raisonnement ne s'applique pas partout, et il ne faut pas en faire une règle absolue. Le prix élevé ne garantit nullement la qualité : dans beaucoup de secteurs, on paie surtout une marque. Il faut donc regarder la fabrication, la garantie, la possibilité de réparer.

Il suppose aussi d'avoir l'argent au départ, ce qui est loin d'être le cas de tout le monde. Ne pas pouvoir acheter durable et devoir remplacer sans cesse est l'une des façons les plus concrètes dont le manque d'argent coûte cher.

Mais quand le choix est possible, la question utile n'est pas « combien ça coûte ? ». Elle est : « combien de temps cela va-t-il durer, et pourrai-je le faire réparer ? »

J'ai appliqué cette logique à quelques objets seulement : les chaussures, un manteau, une casserole, un sac.

Ils m'ont coûté plus cher au départ. Je les ai tous encore.

Et curieusement, j'y fais davantage attention.

On prend mieux soin de ce qu'on n'a pas prévu de remplacer.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-066",
    title: "Nos téléphones captent notre attention",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Les applications sont conçues pour être difficiles à quitter.",
    blurbEn:
      "Apps are engineered to hold attention, using the same mechanisms as slot machines. Understanding the design makes it easier to resist. (Section: Technology in daily life, 1/5.)",
    body: `Il est facile de se reprocher son manque de volonté devant un téléphone. C'est oublier que ces applications sont conçues, par des équipes entières, pour capter l'attention le plus longtemps possible.

Le mécanisme principal porte un nom : la récompense variable. Quand on tire le fil d'actualité vers le bas, on ne sait pas ce qu'on va trouver — rien d'intéressant, ou quelque chose de passionnant. Cette incertitude est exactement le principe des machines à sous, et le cerveau y réagit très fortement. Une récompense prévisible lasse ; une récompense imprévisible retient.

S'y ajoutent d'autres éléments : le défilement infini, qui supprime tout point d'arrêt naturel ; la lecture automatique de la vidéo suivante ; les notifications, qui créent une interruption à laquelle il est difficile de ne pas répondre.

Aucune de ces techniques n'est un accident. Elles sont mesurées, testées, optimisées.

Le résultat est mesurable : le temps d'écran moyen dépasse trois heures par jour dans la plupart des pays européens. Ce n'est pas que trois heures perdues, car une partie est utile. Mais très peu de gens, interrogés honnêtement, disent avoir choisi ce temps.

Que faire ? Les conseils qui fonctionnent ne reposent pas sur la volonté, mais sur la friction.

Désactiver les notifications non essentielles supprime les interruptions. Ranger les applications les plus captivantes dans un dossier, hors de l'écran d'accueil, ajoute deux gestes — ce qui suffit souvent. Laisser le téléphone dans une autre pièce le soir est plus efficace que toute résolution.

L'idée n'est pas de diaboliser ces outils, qui rendent d'immenses services.

Elle est de rétablir un rapport plus équilibré : que ce soit nous qui décidions du moment, et non l'inverse.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-067",
    title: "Qui n'a pas accès au numérique ?",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Tout se fait en ligne. Pour certains, c'est un vrai problème.",
    blurbEn:
      "As administration moves online, millions are left behind — not only older people. What digital exclusion actually looks like. (Section: Technology in daily life, 2/5.)",
    body: `En France, la plupart des démarches administratives se font aujourd'hui en ligne : déclarer ses revenus, demander une aide, renouveler un document, prendre un rendez-vous médical.

Pour la majorité des gens, c'est un progrès : plus rapide, disponible à toute heure, sans file d'attente.

Mais une partie importante de la population rencontre de réelles difficultés. On parle d'illectronisme, ou d'exclusion numérique. Selon les estimations, plusieurs millions de personnes sont concernées en France.

On imagine spontanément des personnes âgées, et elles constituent effectivement une part importante. Mais ce serait une erreur de s'arrêter là.

Il y a aussi des personnes qui n'ont pas d'équipement adapté : un smartphone ne remplace pas un ordinateur pour remplir un dossier complexe ou téléverser des documents. Il y a celles qui vivent dans des zones où la connexion reste mauvaise. Il y a celles qui lisent difficilement le français administratif — une langue déjà compliquée sur papier, et qui ne s'améliore pas à l'écran.

Et il y a, tout simplement, ceux que la peur de l'erreur bloque : beaucoup de démarches ne permettent pas de revenir en arrière.

Les conséquences sont sérieuses. Un pourcentage non négligeable de personnes renoncent à des droits auxquels elles ont droit, faute de pouvoir accomplir la démarche.

Des réponses existent : des « France Services » dans les territoires, des médiateurs numériques, le maintien d'un accueil physique et téléphonique.

Mais ces dispositifs supposent un choix politique clair : considérer que l'accompagnement fait partie du service, et non qu'il est une dépense à réduire.

Une administration accessible seulement en ligne n'est pas accessible à tous.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-068",
    title: "Faut-il donner un téléphone à un enfant ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "La question revient dans toutes les familles, vers dix ou onze ans.",
    blurbEn:
      "Every family faces the same question around age ten. Not yes or no, but what kind of phone, with what rules, and why. (Section: Technology in daily life, 3/5.)",
    body: `La question se pose dans presque toutes les familles, généralement vers dix ou onze ans : faut-il donner un téléphone à son enfant ?

Elle est souvent mal posée, car elle mélange deux choses très différentes : avoir un téléphone, et avoir un accès complet à internet et aux réseaux sociaux.

Un téléphone simple, permettant d'appeler et d'envoyer des messages, répond au besoin pratique qui motive la plupart des parents : joindre son enfant quand il rentre seul de l'école ou va chez un ami. Ce besoin est réel.

Un smartphone connecté est autre chose. Il donne accès à des contenus conçus pour capter l'attention, à des jeux monétisés, et à des espaces où l'enfant peut être exposé à des messages ou à des images difficiles.

Les données disponibles invitent à la prudence, sans dramatiser. Ce qui inquiète le plus les spécialistes n'est pas l'usage modéré, mais deux situations précises : l'accès aux réseaux sociaux avant l'adolescence, et le téléphone dans la chambre la nuit, qui réduit nettement le temps de sommeil.

Le sommeil est peut-être l'argument le plus solide, parce qu'il est mesurable et que ses effets sur l'humeur, la concentration et les résultats scolaires sont bien établis.

Dans la pratique, les familles qui s'en sortent le mieux ne sont pas les plus strictes ni les plus permissives. Ce sont celles qui posent des règles claires, discutées, et surtout appliquées aux adultes aussi.

Il est difficile d'exiger qu'un adolescent laisse son téléphone hors de la chambre si ses parents dînent avec le leur à table.

La cohérence convainc mieux que l'interdiction.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-069",
    title: "L'intelligence artificielle au quotidien",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Nous utilisons déjà l'IA, souvent sans le savoir.",
    blurbEn:
      "Artificial intelligence is already in translation, maps and photos. What it does well, where it fails, and why it sounds so confident. (Section: Technology in daily life, 4/5.)",
    body: `L'intelligence artificielle occupe beaucoup l'actualité, entre promesses spectaculaires et inquiétudes. Il est utile de regarder ce qu'elle fait déjà, concrètement, dans une journée ordinaire.

Elle est présente quand une application de traduction transforme un menu photographié en texte compréhensible. Quand un service de navigation recalcule un itinéraire en tenant compte du trafic. Quand un téléphone retrouve toutes les photos où apparaît une même personne. Quand une messagerie écarte les courriers indésirables.

Ces usages ont un point commun : la machine reconnaît des régularités dans d'énormes quantités de données. C'est ce qu'elle fait très bien.

Les outils plus récents, capables de rédiger un texte ou de répondre à une question, fonctionnent sur un principe voisin. Ils ont appris, à partir de très nombreux textes, quels mots suivent probablement quels autres. C'est ce qui explique à la fois leur aisance et leur principal défaut.

Car ces systèmes ne « savent » rien au sens où nous l'entendons. Ils produisent la suite la plus plausible, ce qui n'est pas la même chose que la plus vraie. Ils peuvent donc affirmer avec assurance des informations fausses, inventer une référence, ou se tromper de date sans jamais hésiter.

Cette assurance est précisément le piège : nous associons spontanément le ton confiant à la fiabilité.

L'usage raisonnable qui se dégage est assez simple. Ces outils sont utiles pour dégrossir, reformuler, traduire, résumer, proposer des pistes.

Ils ne remplacent pas la vérification, surtout dès qu'il s'agit de faits, de chiffres ou de décisions importantes.

Autrement dit : un assistant rapide, jamais une source.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-070",
    title: "Ce que nos données racontent de nous",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "« Je n'ai rien à cacher » est une réponse trop rapide.",
    blurbEn:
      "'I have nothing to hide' misunderstands what data collection is. It is less about secrets than about the profile built from ordinary details. (Section: Technology in daily life, 5/5.)",
    body: `Quand on évoque la collecte de données, une réponse revient souvent : « Je n'ai rien à cacher. »

Elle part d'une intuition compréhensible, mais elle repose sur un malentendu. La question n'est pas de savoir si nous avons des secrets. Elle est de savoir ce que révèle l'accumulation de détails parfaitement anodins.

Pris séparément, ces éléments ne disent rien. L'heure à laquelle on se connecte. Les trajets quotidiens. Les recherches effectuées. Les achats, les pauses, les hésitations avant de cliquer.

Rassemblés, ils dessinent quelque chose de très précis : des horaires de travail, un état de santé probable, une situation familiale, des convictions, une capacité financière, parfois un moment de fragilité.

Ce profil a une valeur, et c'est pour cela qu'il est constitué.

Ses usages ne sont pas tous inquiétants — un service mieux adapté est parfois agréable. Mais certains posent de vraies questions : des prix qui varient selon le profil de l'acheteur, des offres de crédit ciblées sur des personnes en difficulté, des publicités politiques adressées différemment selon les sensibilités supposées.

Un autre problème est la durée. Ce qui est collecté aujourd'hui peut être conservé longtemps, et interprété plus tard dans un contexte que personne ne prévoit.

Le droit européen offre des protections réelles : consentement, droit d'accès, droit à l'effacement. Elles sont utiles, mais peu utilisées, tant les interfaces rendent le refus fastidieux.

Quelques gestes simples réduisent la collecte : refuser les cookies non essentiels, limiter les autorisations des applications, utiliser un navigateur plus protecteur.

Rien de tout cela ne relève de la paranoïa.

C'est simplement décider qui, de nous ou d'un autre, connaît le mieux nos habitudes.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-071",
    title: "Le repas français est-il en train de changer ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Le repas structuré résiste, mais il se transforme.",
    blurbEn:
      "The three-course French meal is not dead, but it is changing — shorter lunches, fewer courses, and a stubborn attachment to eating together. (Section: Food culture, 1/5.)",
    body: `Le repas à la française — une entrée, un plat, du fromage, un dessert, pris ensemble et sans se presser — figure sur la liste du patrimoine immatériel de l'UNESCO depuis 2010. Cette reconnaissance a surpris certains : peut-on classer une façon de manger ?

L'argument était pourtant précis. Ce qui était distingué, ce n'était pas la cuisine française, mais le rituel : la table dressée, l'ordre des plats, le fait de manger ensemble et de parler de ce qu'on mange.

Ce rituel a-t-il disparu ? Les chiffres racontent une histoire nuancée.

D'un côté, il s'est nettement raccourci. Le déjeuner de semaine dure aujourd'hui environ trente minutes en moyenne, contre bien davantage il y a quarante ans. Beaucoup de salariés mangent devant un écran, et le sandwich a pris une place considérable.

Le nombre de plats a également diminué : peu de familles servent quatre services en semaine.

De l'autre côté, quelque chose résiste avec une force réelle. Comparée à ses voisins, la France conserve des horaires de repas remarquablement synchronisés : à treize heures, une grande partie du pays mange au même moment. Le repas y reste très majoritairement une pratique collective, assise et à table.

Et le week-end, le repas long réapparaît, surtout le dimanche.

Ce qui a changé n'est donc pas tant la valeur accordée au repas que la place que le travail lui laisse en semaine.

Il serait excessif de parler de disparition.

Il est plus juste de dire que le repas s'est concentré : moins fréquent, mais toujours important quand il a lieu.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-072",
    title: "D'où vient ce que nous mangeons ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Peu de gens savent d'où vient réellement leur repas.",
    blurbEn:
      "Most of us cannot say where our food comes from. Labels help less than they seem, and the honest answers are more complicated. (Section: Food culture, 2/5.)",
    body: `Posez la question à table : d'où vient ce poulet ? Ces tomates ? Ce fromage ? Rares sont ceux qui peuvent répondre précisément.

Ce n'est pas un reproche. Les chaînes d'approvisionnement modernes sont longues et volontairement discrètes.

Les étiquettes aident, mais moins qu'on ne le croit. « Fabriqué en France » signifie que la transformation a eu lieu en France, pas nécessairement que les ingrédients en viennent. Un biscuit français peut contenir du blé, du sucre et de l'huile venus de trois continents. Pour la viande, l'origine est mieux encadrée, mais la mention peut distinguer le lieu de naissance, d'élevage et d'abattage — qui ne sont pas toujours les mêmes.

Faut-il alors chercher à tout savoir ? Ce serait épuisant et un peu vain.

Quelques repères simples suffisent souvent.

Le premier est la saison. Un produit de saison a rarement voyagé longtemps ou poussé sous serre chauffée. Il est en général moins cher, meilleur, et plus sobre en énergie.

Le deuxième est le degré de transformation. Plus un produit compte d'ingrédients, plus son origine devient impossible à retracer.

Le troisième est le circuit. Acheter directement à un producteur ne garantit pas la qualité, mais il permet au moins de poser la question — et d'obtenir une réponse.

Il y a enfin un intérêt moins pratique. Savoir qu'une pomme met des mois à mûrir, qu'un fromage demande un affinage, qu'un poulet met plusieurs semaines à grandir change le regard porté sur son prix.

Ce que nous appelons « cher » paraît parfois moins cher quand on sait ce que cela suppose.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-073",
    title: "Le gaspillage alimentaire",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Un tiers de la nourriture produite n'est jamais mangée.",
    blurbEn:
      "A third of the food produced worldwide is never eaten. Where the waste actually happens, and what has been shown to reduce it. (Section: Food culture, 3/5.)",
    body: `Selon les estimations des Nations unies, près d'un tiers de la nourriture produite dans le monde n'est jamais consommée. Le chiffre est difficile à croire, et pourtant il est largement documenté.

Le gaspillage ne se produit pas au même endroit selon les pays.

Dans les pays à faibles revenus, les pertes surviennent surtout avant la vente : mauvaises conditions de stockage, transport lent, absence de chaîne du froid. La nourriture s'abîme avant d'arriver.

Dans les pays riches, c'est l'inverse. L'essentiel du gaspillage a lieu à la fin de la chaîne, dans la distribution et surtout à la maison. En France, on estime que chaque personne jette environ trente kilos de nourriture par an, dont une part encore emballée.

Les causes domestiques sont banales : on achète trop, on oublie ce qu'il y a au fond du réfrigérateur, on cuisine des portions trop grandes, on confond deux mentions de date.

Cette confusion mérite d'être clarifiée. « À consommer jusqu'au » concerne la sécurité : passé ce délai, le produit peut être dangereux. « À consommer de préférence avant le » concerne la qualité : le produit reste consommable, il perd seulement en goût ou en texture. Des tonnes de riz, de pâtes et de conserves parfaitement bonnes sont jetées à cause de ce malentendu.

Ce qui fonctionne, en pratique, tient à peu de choses : planifier les repas de la semaine, faire une liste, ranger les produits anciens devant, et considérer les restes comme un repas prévu plutôt que comme un reste.

La loi française interdit désormais aux grandes surfaces de jeter les invendus consommables ; elles doivent les donner.

C'est une avancée. Mais l'essentiel se joue encore dans nos cuisines.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-074",
    title: "Manger moins de viande",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Le débat oppose souvent deux camps. La réalité est plus graduelle.",
    blurbEn:
      "The meat debate is usually presented as all-or-nothing. The evidence points instead to something duller and more effective: less, and better. (Section: Food culture, 4/5.)",
    body: `Le débat sur la viande est souvent présenté de façon binaire : en manger ou n'en manger pas du tout. Cette opposition rend la discussion difficile, alors que les données invitent à une conclusion plus modeste.

Sur le plan environnemental, les ordres de grandeur sont clairs. L'élevage représente une part importante des émissions de gaz à effet de serre liées à l'alimentation, ainsi qu'une utilisation considérable de terres et d'eau. Mais toutes les viandes ne se valent pas : l'écart entre le bœuf et la volaille est très supérieur à l'écart entre la volaille et certains produits végétaux.

Sur le plan de la santé, les recommandations officielles ne demandent pas la suppression. Elles conseillent de limiter la viande rouge et surtout la charcuterie, sans exclure les autres sources.

Il existe aussi une dimension sociale rarement évoquée. La viande occupe une place symbolique forte dans beaucoup de cultures, y compris en France : elle marque le repas de fête, l'accueil, la générosité. Ignorer cela conduit à des discours moralisateurs qui produisent surtout de la résistance.

C'est pourquoi l'approche qui fonctionne le mieux, dans les études comme dans les cantines, est peu spectaculaire : réduire la fréquence plutôt qu'interdire, améliorer la qualité de ce qui est servi, et proposer des alternatives réellement bonnes.

Un plat végétarien mal préparé ne convainc personne. Un bon plat végétarien se choisit sans y penser.

Personnellement, je suis passé de la viande presque chaque jour à deux ou trois fois par semaine.

Je dépense autant, parce que j'achète mieux.

Et je n'ai jamais eu l'impression de me priver.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-075",
    title: "Cuisiner, une compétence qui se perd ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Nous regardons plus d'émissions de cuisine et nous cuisinons moins.",
    blurbEn:
      "We watch more cooking than ever and cook less. Why basic kitchen skills matter for money, health and independence. (Section: Food culture, 5/5.)",
    body: `Il existe un paradoxe contemporain : jamais la cuisine n'a été aussi présente dans les médias, et jamais le temps passé à cuisiner n'a été aussi faible.

Les émissions culinaires attirent des millions de téléspectateurs. Les recettes circulent en vidéo par milliers. Pourtant, le temps consacré quotidiennement à la préparation des repas a nettement diminué en cinquante ans, et la part des plats préparés dans les achats a fortement augmenté.

Regarder cuisiner n'est pas cuisiner.

Cette évolution s'explique aisément : des journées plus longues, des trajets, une offre de plats prêts abondante et bon marché. Il serait injuste d'y voir de la paresse.

Mais elle a des conséquences concrètes.

La première est financière. Cuisiner des produits bruts reste, à qualité comparable, nettement moins cher.

La deuxième est nutritionnelle. Les plats industriels contiennent en moyenne plus de sel, de sucre et d'additifs, non par malveillance, mais parce qu'ils doivent se conserver et plaire immédiatement.

La troisième est une forme d'autonomie. Savoir cuisiner, c'est pouvoir manger correctement avec peu d'argent, improviser avec ce qu'on a, et ne pas dépendre entièrement de ce que l'industrie propose.

Or il ne s'agit pas d'un talent rare. Cinq ou six techniques suffisent pour couvrir l'essentiel : cuire des œufs, faire revenir des oignons, cuire des féculents, rôtir des légumes, faire une vinaigrette, monter une soupe.

Avec cela, on tient des mois de repas.

Ce n'est pas de la gastronomie, et ce n'est pas le but.

C'est simplement savoir se nourrir soi-même.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-076",
    title: "Les amitiés à l'âge adulte",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Se faire des amis devient plus difficile après trente ans.",
    blurbEn:
      "Adult friendships are harder to start, not because people change, but because the conditions that create friendship disappear. (Section: Relationships, 1/5.)",
    body: `Beaucoup d'adultes font le même constat : il est nettement plus difficile de se faire de nouveaux amis à trente-cinq ans qu'à dix-huit.

On l'explique souvent par le caractère — on serait devenu moins ouvert, plus difficile. L'explication est probablement ailleurs, et elle est plus rassurante.

Les sociologues identifient trois conditions qui favorisent la naissance d'une amitié : la proximité répétée, des interactions non planifiées, et un cadre qui encourage à baisser un peu sa garde.

À l'école ou à l'université, ces trois conditions sont réunies en permanence, sans aucun effort. On voit les mêmes personnes tous les jours, on se croise sans l'avoir décidé, et on partage une situation commune.

À l'âge adulte, elles disparaissent presque toutes.

On voit ses collègues souvent, mais dans un cadre professionnel qui limite ce qu'on montre de soi. Les rencontres deviennent planifiées : il faut proposer une date, la reporter, réorganiser. Et l'imprévu, qui crée les liens, se raréfie.

Ce diagnostic a l'avantage d'être actionnable.

Si les amitiés naissent de la répétition, alors ce qui fonctionne, c'est l'activité régulière : un cours hebdomadaire, un club sportif, un engagement associatif, une chorale. Non pas parce que l'activité importe, mais parce qu'elle recrée la fréquence.

Un dîner unique produit rarement une amitié. Douze séances de la même activité, souvent.

L'autre levier est moins confortable : il faut oser proposer. À l'âge adulte, quelqu'un doit faire le premier pas, et tout le monde attend que ce soit l'autre.

Ce n'est pas envahissant.

Dans la plupart des cas, la personne en face est simplement soulagée.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-077",
    title: "Vivre seul, est-ce un problème ?",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "De plus en plus de personnes vivent seules. Ce n'est pas la même chose que la solitude.",
    blurbEn:
      "More people live alone than ever, and that is not automatically bad. Isolation is what harms health — and the two are often confused. (Section: Relationships, 2/5.)",
    body: `En France, environ un ménage sur trois est composé d'une seule personne. Cette proportion a doublé en cinquante ans, et elle continue d'augmenter.

Ce chiffre est souvent commenté sur un ton inquiet. Il mérite d'être examiné plus calmement, car il mélange deux réalités différentes.

Vivre seul est une situation de logement. C'est parfois choisi et apprécié : liberté, calme, absence de compromis quotidiens. Beaucoup de personnes vivant seules ont une vie sociale riche.

L'isolement est autre chose. C'est l'absence de relations régulières et de soutien, et il peut parfaitement exister à l'intérieur d'un couple ou d'une famille.

Cette distinction est importante, car les effets documentés sur la santé concernent l'isolement, pas le fait d'habiter seul. Les recherches sont assez convergentes : l'isolement prolongé augmente les risques cardiovasculaires, favorise la dépression et se compare, dans certaines études, à des facteurs de risque bien connus comme le tabagisme.

Les populations les plus concernées ne sont pas toujours celles qu'on imagine. Les personnes âgées veuves, oui. Mais aussi les jeunes adultes fraîchement arrivés dans une ville, et les aidants qui s'occupent d'un proche malade et n'ont plus de temps pour eux.

Les réponses efficaces ne consistent pas à dire aux gens de « sortir davantage ». Elles créent des occasions : associations, activités de quartier, jardins partagés, tiers-lieux, visites organisées.

Ce qui rend ces dispositifs efficaces, c'est la régularité. Un événement ponctuel ne suffit pas.

Vivre seul n'est donc ni bon ni mauvais en soi.

Ce qui compte, c'est le nombre de personnes qui remarqueraient votre absence.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-078",
    title: "Les disputes utiles",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Les couples qui durent ne sont pas ceux qui ne se disputent jamais.",
    blurbEn:
      "Research on couples suggests the frequency of arguments matters far less than how they are conducted. (Section: Relationships, 3/5.)",
    body: `On imagine souvent qu'une relation réussie est une relation sans conflit. Les travaux menés sur les couples depuis plusieurs décennies suggèrent le contraire : ce n'est pas la fréquence des désaccords qui distingue les relations durables, mais leur manière de se dérouler.

Certains schémas reviennent systématiquement dans les relations qui se dégradent.

Le premier est la critique globale. Il y a une différence importante entre « tu n'as pas fait la vaisselle » et « tu ne fais jamais rien ». Le premier énoncé porte sur un fait ; le second porte sur la personne, et il appelle presque nécessairement une défense.

Le deuxième est le mépris : l'ironie blessante, le ton condescendant, les yeux levés au ciel. C'est le signal le plus négatif identifié dans ces recherches.

Le troisième est le retrait : ne plus répondre, quitter la pièce, laisser tomber. Cela met fin à la dispute sans rien résoudre, et le problème réapparaît intact.

À l'inverse, les échanges qui fonctionnent partagent quelques caractéristiques : ils commencent doucement, ils portent sur un comportement précis, ils laissent à chacun la possibilité de reconnaître un point, et ils admettent des pauses quand le ton monte.

Un détail souvent cité : lorsque l'un des deux devient trop tendu pour écouter, la discussion ne peut plus avancer. Une interruption de vingt minutes, annoncée et suivie d'un retour, change tout.

Rien de tout cela n'est propre au couple. Les mêmes principes valent entre amis, entre collègues, entre parents et enfants.

Ce n'est pas le désaccord qui abîme les relations.

C'est la façon dont on le mène, et surtout dont on le termine.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-079",
    title: "Quand les parents vieillissent",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Un moment arrive où les rôles commencent à s'inverser.",
    blurbEn:
      "The slow reversal of roles between adult children and ageing parents: the conversations nobody wants to start, and why starting early helps. (Section: Relationships, 4/5.)",
    body: `Il existe un moment, difficile à situer, où la relation avec ses parents commence à changer. Ce n'est pas un événement unique : c'est une accumulation de petits signes.

Un rendez-vous médical oublié. Une facture impayée. Une conversation où l'on répète trois fois la même chose. Une chute sans gravité, mais qui inquiète.

La plupart des familles réagissent tard, et il y a de bonnes raisons à cela. Aborder le sujet suppose de reconnaître un déclin, ce que ni les parents ni les enfants n'ont envie de faire. On repousse donc, jusqu'à ce qu'une urgence impose des décisions dans la précipitation — souvent les pires conditions possibles.

Les personnes qui ont traversé cette période donnent presque toujours le même conseil : parler avant.

Non pas de tout organiser, mais de connaître quelques réponses. Où vos parents souhaitent-ils vivre s'ils ne peuvent plus rester seuls ? Qui doit décider s'ils ne le peuvent plus ? Où se trouvent les documents importants ? Quel est le médecin traitant ?

Ces conversations sont plus faciles quand elles sont hypothétiques. Elles deviennent presque impossibles à l'hôpital, un dimanche soir.

Il y a un second point, moins pratique mais tout aussi réel : la culpabilité.

Beaucoup d'aidants ont le sentiment de ne jamais en faire assez, quelle que soit la quantité de temps donnée. Cette culpabilité épuise, et elle conduit fréquemment les aidants à négliger leur propre santé.

S'occuper d'un parent sur plusieurs années suppose d'être encore debout à la fin.

Demander de l'aide n'est pas un abandon.

C'est la condition pour tenir.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-080",
    title: "Rester en contact quand on est loin",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Nous n'avons jamais eu autant d'outils, et les liens se défont quand même.",
    blurbEn:
      "We have more ways to stay in touch than ever, and relationships still fade. What actually keeps a long-distance friendship alive. (Section: Relationships, 5/5.)",
    body: `Nous disposons de plus de moyens de communication que n'importe quelle génération précédente. Messages, photos, appels vidéo gratuits vers l'autre bout du monde : tout est techniquement possible.

Et pourtant, les amitiés à distance continuent de s'éteindre, souvent sans dispute et sans décision.

Ce paradoxe s'explique en partie par la nature de ces outils. Ils sont excellents pour le contact bref et fréquent : une photo, une réaction, un message de trois mots. Ils sont beaucoup moins adaptés à ce qui construit réellement une relation, c'est-à-dire une conversation longue et sans objectif précis.

Or nous confondons facilement les deux. Voir régulièrement les publications de quelqu'un donne l'impression de garder le lien. En réalité, on suit sa vie sans jamais lui parler. Le sentiment de proximité augmente pendant que la relation, elle, s'appauvrit.

Ce qui fonctionne, d'après ceux qui maintiennent des amitiés à distance sur des années, tient à deux choses.

La première est la régularité choisie. Un rendez-vous fixe — le premier dimanche du mois, un appel de trente minutes — résiste bien mieux que la bonne intention de s'appeler « bientôt ». Sans date, le temps passe et la gêne s'installe.

La seconde est d'accepter que la relation change de forme. Une amitié à distance ne peut pas être ce qu'elle était quand on se voyait chaque semaine. Vouloir retrouver exactement la même chose conduit surtout à la déception.

J'ai un ami au Canada depuis six ans. Nous nous parlons un dimanche matin sur deux.

Ce n'est pas grand-chose.

Mais c'est écrit dans nos deux agendas, et c'est probablement pour cela que ça tient.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-081",
    title: "Les gestes qui comptent vraiment",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Tous les gestes écologiques n'ont pas le même effet.",
    blurbEn:
      "Not all green actions are equal. Some feel virtuous and change little; a few change a lot. The orders of magnitude are worth knowing. (Section: The environment, 1/5.)",
    body: `Il existe une confusion fréquente dans les discussions écologiques : on met sur le même plan des gestes dont les effets diffèrent d'un facteur cent.

Éteindre la lumière en sortant d'une pièce est une bonne habitude. Mais en termes d'émissions, cela ne se compare pas à un vol long-courrier.

Les analyses disponibles donnent des ordres de grandeur assez stables pour un ménage européen. Ce qui pèse le plus lourd, ce sont, dans le désordre : les déplacements en avion, la voiture individuelle utilisée quotidiennement, le chauffage d'un logement mal isolé, et l'alimentation — en particulier la viande rouge.

Ce qui pèse nettement moins : les sacs plastiques, les pailles, l'eau du robinet laissée couler quelques secondes, l'éclairage.

Cela ne signifie pas que les petits gestes soient inutiles. Ils ont une valeur d'habitude et de cohérence, et certains ont d'autres bénéfices — la pollution plastique est un vrai problème, même si son poids climatique est faible.

Mais il est décourageant, et un peu injuste, de faire porter aux ménages une culpabilité disproportionnée pour des gestes marginaux, alors que les décisions structurantes — l'isolation des logements, l'offre de transports, l'aménagement des villes — dépendent largement de politiques publiques et d'entreprises.

La conclusion pratique est plutôt libératrice.

Mieux vaut concentrer ses efforts sur deux ou trois leviers réellement importants — réduire l'avion, isoler son logement, changer sa façon de se déplacer au quotidien, ajuster son alimentation — que se disperser sur vingt micro-gestes.

Et il reste un dernier levier, souvent oublié : la voix.

Un citoyen qui vote, qui écrit, qui soutient un projet local pèse davantage que le tri parfait de ses déchets.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-082",
    title: "Isoler les logements",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Des millions de logements français sont mal isolés.",
    blurbEn:
      "Poorly insulated homes cost their occupants money and health. Why renovation is slow, and what is being tried. (Section: The environment, 2/5.)",
    body: `On estime que plusieurs millions de logements français sont considérés comme des « passoires thermiques » : mal isolés, coûteux à chauffer, inconfortables l'hiver et de plus en plus pénibles l'été.

Le sujet paraît technique. Il est en réalité social autant qu'écologique.

Le chauffage représente une part importante des émissions liées au logement, et le bâtiment constitue l'un des principaux postes d'émissions du pays. Réduire les besoins en chauffage est donc un levier majeur.

Mais l'effet le plus immédiat concerne les habitants eux-mêmes. Vivre dans un logement mal isolé signifie payer davantage pour être moins bien chauffé. Ce sont souvent les ménages les plus modestes qui occupent ces logements, notamment en location. On parle de « précarité énergétique » : devoir choisir entre se chauffer correctement et d'autres dépenses essentielles.

Pourquoi la rénovation avance-t-elle lentement ?

D'abord parce qu'elle coûte cher : une rénovation complète se chiffre en dizaines de milliers d'euros. Des aides existent, mais les dossiers sont complexes et il faut souvent avancer l'argent.

Ensuite parce que le propriétaire n'est pas toujours celui qui paie le chauffage. Un bailleur n'a pas d'intérêt financier direct à isoler un logement dont il ne règle pas les factures.

Enfin parce que les travaux sont lourds et que le nombre d'artisans formés reste insuffisant.

Des mesures ont été prises, notamment l'interdiction progressive de louer les logements les moins performants.

Elles suscitent des débats légitimes : mal appliquées, elles peuvent réduire l'offre locative.

Mais laisser des millions de foyers dans des logements coûteux à chauffer n'est pas non plus une politique.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-083",
    title: "L'eau va-t-elle manquer ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "La France n'est pas un pays sec. Elle connaît pourtant des restrictions.",
    blurbEn:
      "France is not a dry country, yet summer water restrictions have become normal. Where the water actually goes, and what is changing. (Section: The environment, 3/5.)",
    body: `La France n'a pas la réputation d'un pays sec. Elle reçoit des précipitations abondantes et dispose de nappes souterraines importantes.

Pourtant, depuis plusieurs étés, des restrictions d'eau sont mises en place dans une majorité de départements. Comment expliquer ce décalage ?

Le problème n'est pas tant la quantité totale que la répartition dans le temps. Les pluies deviennent plus irrégulières : des épisodes intenses en automne et en hiver, puis de longues périodes sèches en été. Or une pluie violente ruisselle et repart vers les rivières ; elle recharge mal les nappes. Ce sont les pluies lentes de l'hiver qui remplissent les réserves.

À cela s'ajoute une demande qui augmente précisément quand la ressource baisse : l'irrigation agricole en été, le tourisme dans les régions déjà les plus sèches.

Il est utile de connaître la répartition des usages. En France, l'agriculture représente une part majoritaire de l'eau réellement consommée sur l'année, en particulier l'été. L'eau potable domestique représente une part beaucoup plus faible, même si elle est la plus visible.

Cela ne rend pas les économies domestiques inutiles — elles comptent localement, et elles ont une valeur d'exemple. Mais on ne résoudra pas la question avec des douches plus courtes.

Les réponses discutées concernent surtout les infrastructures et les usages. Réparer les réseaux, dont une partie non négligeable de l'eau se perd en fuites. Adapter les cultures aux ressources disponibles. Réutiliser les eaux usées traitées, ce que la France pratique encore peu par rapport à d'autres pays.

Ces choix sont techniques mais aussi politiques.

Décider qui peut utiliser l'eau, et pour quoi, sera l'une des questions des prochaines décennies.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-084",
    title: "Le retour du vélo en ville",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Le nombre de cyclistes a fortement augmenté dans les villes françaises.",
    blurbEn:
      "Cycling has risen sharply in French cities. The change was not moral persuasion but infrastructure — and the lesson generalises. (Section: The environment, 4/5.)",
    body: `En une dizaine d'années, la pratique du vélo a fortement progressé dans la plupart des grandes villes françaises. Dans certaines, le nombre de cyclistes a plus que doublé.

Ce changement mérite d'être analysé, car il contredit une idée répandue : celle selon laquelle les comportements changeraient surtout par conviction.

Ce qui a fait bouger les choses n'est pas principalement la sensibilisation. C'est l'aménagement.

Les études sur le sujet sont convergentes. Le facteur déterminant dans la décision de faire du vélo n'est ni l'écologie ni la santé : c'est le sentiment de sécurité. Tant qu'un trajet suppose de rouler au milieu des voitures, la grande majorité des gens refuse — et ce refus est parfaitement rationnel.

Dès qu'une piste protégée et continue existe, la fréquentation augmente rapidement, y compris chez des personnes qui ne se considéraient pas du tout comme des cyclistes.

Le mot important est « continue ». Une piste qui s'interrompt à un carrefour dangereux n'est pas un itinéraire : c'est un tronçon. Les villes qui ont le mieux réussi ont construit des réseaux cohérents plutôt que des morceaux isolés.

Les bénéfices constatés dépassent les émissions évitées. Moins de bruit, moins de pollution de l'air, moins de congestion, et une activité physique quotidienne intégrée sans effort, ce que les autorités sanitaires cherchent depuis longtemps.

Il existe aussi des critiques légitimes. Les aménagements se font parfois au détriment des piétons, ou dans des quartiers déjà bien dotés, tandis que les zones périphériques restent dépendantes de la voiture.

La leçon générale est pourtant claire, et elle vaut au-delà du vélo.

On change plus efficacement les comportements en rendant le bon choix facile qu'en demandant aux gens d'être meilleurs.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-085",
    title: "L'éco-anxiété",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Beaucoup de jeunes disent être inquiets pour l'avenir de la planète.",
    blurbEn:
      "Climate anxiety is not an illness but a reasonable response to real information. What helps, and what makes it worse. (Section: The environment, 5/5.)",
    body: `Le terme « éco-anxiété » est apparu récemment dans le débat public. Il désigne l'inquiétude, parfois profonde, ressentie face au changement climatique et à la dégradation de l'environnement.

Plusieurs enquêtes internationales indiquent qu'une part importante des jeunes déclarent être inquiets, et qu'une fraction non négligeable dit que cela affecte leur vie quotidienne, voire leurs projets d'avenir.

Il faut être prudent avec ces chiffres, mais le phénomène est réel et documenté.

La première chose à dire est qu'il ne s'agit pas d'une maladie. L'inquiétude face à un danger documenté est une réaction rationnelle. Traiter cette anxiété comme un simple trouble individuel reviendrait à demander aux gens de mal percevoir la réalité.

Cela dit, une anxiété qui paralyse ne rend service à personne, ni à la personne ni à la cause.

Ce que rapportent les psychologues qui travaillent sur ce sujet est assez cohérent.

Ce qui aggrave le sentiment d'impuissance : la consommation continue d'informations catastrophiques sans possibilité d'agir, et l'isolement — vivre cette inquiétude seul, entouré de gens qui n'en parlent pas.

Ce qui l'atténue : l'action concrète, même modeste, et surtout l'action collective. Participer à un projet local, une association, un chantier de plantation produit un effet nettement supérieur à des gestes individuels isolés, non pas parce que l'impact est plus grand, mais parce qu'on cesse d'être seul.

Un autre élément aide : distinguer ce sur quoi on peut agir de ce sur quoi on ne peut pas.

Personne ne peut résoudre le climat mondial à lui seul.

Mais presque tout le monde peut faire quelque chose quelque part, avec d'autres.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-086",
    title: "Apprendre à tout âge",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "L'idée qu'on n'apprend plus après un certain âge est fausse.",
    blurbEn:
      "The belief that adults cannot learn is wrong, but adult learning does work differently — and knowing how changes the results. (Section: Learning, 1/5.)",
    body: `« Je suis trop vieux pour apprendre ça. » Cette phrase est parmi les plus répandues, et parmi les moins exactes.

Le cerveau adulte conserve une capacité d'apprentissage tout au long de la vie. Le phénomène porte un nom, la plasticité cérébrale, et il est bien établi : les connexions se réorganisent en fonction de ce que l'on pratique, à trente ans comme à soixante-dix.

Cela ne veut pas dire qu'il n'y a aucune différence.

Certaines choses sont effectivement plus faciles jeune, notamment l'acquisition d'un accent parfait dans une langue étrangère.

Mais les adultes disposent d'avantages réels et sous-estimés : ils comprennent les structures, font des liens avec ce qu'ils savent déjà, choisissent leurs méthodes, et savent pourquoi ils apprennent — une motivation choisie vaut mieux qu'une motivation imposée.

Ce qui change surtout, ce sont les conditions. Un adulte a moins de temps, plus de fatigue, et beaucoup plus de peur du ridicule. Cette peur est probablement le principal obstacle, bien avant l'âge.

Les recherches sur l'apprentissage donnent quelques principes solides, valables à tout âge.

La répétition espacée bat la répétition massée : trois fois vingt minutes dans la semaine valent mieux qu'une heure le dimanche.

Se tester est plus efficace que relire. Chercher à se souvenir, même sans y arriver, ancre davantage que passer le texte en revue.

Enfin, la difficulté modérée est utile : ce qui est trop facile n'apprend rien.

La question n'est donc pas de savoir si l'on peut encore apprendre.

Elle est de savoir si l'on accepte d'être mauvais pendant quelques semaines.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-087",
    title: "Pourquoi nous oublions",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Oublier n'est pas un défaut du cerveau.",
    blurbEn:
      "Forgetting is not a failure of memory but a feature of it — and understanding the forgetting curve makes revision far more efficient. (Section: Learning, 2/5.)",
    body: `Nous parlons de l'oubli comme d'un défaut : « j'ai une mauvaise mémoire ». Les chercheurs le décrivent plutôt comme une fonction.

Un cerveau qui retiendrait absolument tout serait ingérable. L'oubli trie : il élimine ce qui n'a pas servi, pour laisser accessible ce qui sert souvent.

Le problème est que ce tri ne correspond pas toujours à nos intentions.

Les travaux sur la mémoire ont mis en évidence une régularité connue sous le nom de courbe de l'oubli. Après avoir appris quelque chose, on en perd une grande partie très rapidement — souvent la majorité dans les premiers jours — puis la perte ralentit.

Cette courbe explique une expérience familière : réviser intensément la veille d'un examen permet de réussir l'examen, et de tout oublier trois semaines plus tard.

Mais elle indique aussi la solution.

Chaque fois qu'on récupère une information juste avant de l'oublier, la courbe s'aplatit : l'oubli devient plus lent. C'est le principe de la répétition espacée. On revoit une notion après un jour, puis trois, puis une semaine, puis un mois, en espaçant progressivement.

Cette méthode paraît contre-intuitive, parce qu'elle est moins confortable. Relire ses notes donne une impression de maîtrise ; se tester, au contraire, met en évidence ce qu'on ne sait pas. C'est désagréable, et c'est précisément ce qui fonctionne.

Les applications de vocabulaire les plus efficaces reposent toutes sur ce principe.

Le principe vaut au-delà des langues : pour un cours, une procédure professionnelle, un morceau de musique.

Il ne s'agit pas de travailler plus.

Il s'agit de travailler au bon moment.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-088",
    title: "La lecture rend-elle plus intelligent ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "On attribue beaucoup de vertus à la lecture. Que sait-on vraiment ?",
    blurbEn:
      "Reading is credited with many benefits. Some are well supported, others less so — and the difference matters. (Section: Learning, 3/5.)",
    body: `On prête à la lecture des vertus nombreuses : elle rendrait plus intelligent, plus empathique, plus concentré. Ces affirmations méritent d'être examinées séparément, car elles ne reposent pas sur les mêmes preuves.

L'effet le mieux établi concerne le vocabulaire. Les personnes qui lisent beaucoup disposent d'un vocabulaire nettement plus étendu, et ce lien est solide. La raison est simple : la langue écrite contient des mots que la conversation courante n'emploie presque jamais. On peut passer une vie sans jamais entendre certains termes qu'un roman utilise naturellement.

Or le vocabulaire n'est pas un ornement. Il conditionne la capacité à comprendre un texte complexe, un contrat, un article médical, un débat public.

Le deuxième effet, plus discuté, concerne l'empathie. Plusieurs études suggèrent que la lecture de fiction améliore la capacité à percevoir les états mentaux d'autrui. Les résultats sont réels mais fragiles, et le sens de la relation reste incertain : les personnes plus empathiques lisent peut-être davantage de romans, plutôt que l'inverse.

Le troisième effet est le plus intéressant à notre époque : la concentration.

Lire un texte long suppose de maintenir son attention sans récompense immédiate, en gardant en mémoire ce qui précède. C'est un exercice devenu rare. La plupart de nos lectures quotidiennes sont brèves et interrompues.

Il ne s'agit pas de nostalgie : rien ne prouve qu'un roman vaille mieux qu'un bon article. Ce qui compte, c'est la durée d'attention continue.

Alors, la lecture rend-elle plus intelligent ?

La question est mal posée.

Elle entraîne une capacité que peu d'autres activités entraînent encore.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-089",
    title: "Se former quand on travaille déjà",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "La formation continue existe, mais elle est mal connue.",
    blurbEn:
      "Continuing training exists and is funded, yet many workers never use it. Why, and what makes the difference for those who do. (Section: Learning, 4/5.)",
    body: `La France consacre chaque année des sommes considérables à la formation professionnelle. Il existe des dispositifs, des droits individuels, des financements.

Et pourtant, une proportion importante de salariés n'en bénéficie jamais.

Ce paradoxe s'explique par plusieurs obstacles, rarement dus au manque d'envie.

Le premier est l'information. Beaucoup de personnes ignorent leurs droits ou ne savent pas par où commencer. Le vocabulaire administratif n'aide pas : sigles, plateformes, dossiers.

Le deuxième est le temps. Se former suppose des heures qu'il faut prendre quelque part — sur le travail, ce qui nécessite l'accord de l'employeur, ou sur la vie personnelle, ce qui est difficile avec des enfants ou plusieurs emplois.

Le troisième est plus discret : la répartition inégale. Les formations bénéficient davantage aux cadres, déjà diplômés, qu'aux salariés les moins qualifiés — ceux dont les métiers sont pourtant les plus exposés aux transformations.

Il y a aussi un frein psychologique. Reprendre une formation à quarante ou cinquante ans suppose d'accepter d'être débutant, souvent devant des personnes plus jeunes. Beaucoup y renoncent par crainte de ne pas y arriver.

Ce qui distingue ceux qui se forment effectivement ? Presque toujours, un déclencheur concret : un poste visé, une mobilité annoncée, un métier qui change.

Une formation « pour se cultiver » est rarement menée à son terme ; une formation avec un objectif précis l'est beaucoup plus souvent.

Le conseil qui revient le plus souvent est donc simple.

Ne pas commencer par chercher une formation.

Commencer par définir ce qu'on veut pouvoir faire, puis chercher.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-090",
    title: "L'erreur fait partie de l'apprentissage",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "En France, on apprend tôt que l'erreur est une faute.",
    blurbEn:
      "In French schooling, mistakes are often treated as failures. Research suggests they are the mechanism by which learning happens. (Section: Learning, 5/5.)",
    body: `Il existe un trait souvent relevé dans le système éducatif français : le rapport à l'erreur.

Historiquement, l'évaluation y a été construite en retirant des points. On part de vingt et on descend. L'erreur y est un manque, quelque chose à éviter.

Ce rapport laisse des traces durables. Beaucoup d'adultes français hésitent à parler une langue étrangère tant qu'ils ne la maîtrisent pas correctement — attitude que les enseignants observent moins dans d'autres pays, où l'on se lance plus volontiers avec un vocabulaire limité.

Or les recherches sur l'apprentissage indiquent presque l'inverse.

Se tromper, puis recevoir une correction, produit un apprentissage plus solide que de recevoir directement la bonne réponse. L'erreur crée une attente, et la correction s'ancre sur cette attente. Certains chercheurs parlent d'« erreurs productives ».

Cela suppose une condition : que l'erreur soit corrigée rapidement et sans humiliation. Une erreur non corrigée peut s'installer ; une erreur sanctionnée décourage d'essayer.

Cette distinction est essentielle. Il ne s'agit pas de valoriser l'erreur en soi, ni de prétendre que tout se vaut. Il s'agit de la considérer comme une étape normale et informative.

Dans l'apprentissage d'une langue, c'est particulièrement net. Celui qui parle mal progresse. Celui qui attend d'être prêt attend indéfiniment, parce qu'on ne devient jamais prêt en silence.

J'ai mis des années à l'accepter.

Aujourd'hui, quand je parle une langue étrangère, je fais beaucoup de fautes.

Et je suis compris, ce qui était exactement l'objectif.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-091",
    title: "Comment se fabrique une information",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Une information passe par plusieurs étapes avant d'arriver jusqu'à nous.",
    blurbEn:
      "Before it reaches you, a news item passes through selection, sourcing, editing and headlining. Knowing the process explains a lot. (Section: Media and information, 1/5.)",
    body: `Nous consommons des informations toute la journée sans nous demander comment elles ont été fabriquées. Or ce processus explique une bonne partie de ce qui nous étonne ou nous agace.

Tout commence par une sélection. Chaque jour, il se produit infiniment plus d'événements qu'un journal ne peut en traiter. Il faut choisir, et ce choix obéit à des critères assez constants : la nouveauté, la proximité, le nombre de personnes concernées, le caractère spectaculaire ou inhabituel.

Ce dernier critère explique un biais bien connu. Un avion qui s'écrase est une information ; des milliers d'avions qui atterrissent normalement n'en sont pas. À force, nous surestimons les risques rares et spectaculaires, et sous-estimons les risques fréquents et banals.

Vient ensuite la collecte. Le journaliste dispose rarement d'un accès direct : il s'appuie sur des sources — communiqués, experts, témoins, dépêches d'agence. Chaque source a ses intérêts, ce qui n'est pas nécessairement un problème, à condition d'être connu.

Puis l'écriture et l'édition. Le texte est raccourci, structuré, hiérarchisé. Un article commence par l'essentiel, car beaucoup de lecteurs ne liront que le début.

Enfin, le titre. C'est l'étape la plus trompeuse, parce qu'il n'est presque jamais écrit par l'auteur de l'article, et qu'il doit attirer l'attention. Un titre peut donc être plus catégorique que le texte qu'il annonce.

D'où un conseil très concret : ne jamais partager un article dont on n'a lu que le titre.

Les études montrent que cela arrive extrêmement souvent.

Lire l'article prend deux minutes. Cela suffit à éviter la moitié des malentendus.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-092",
    title: "Vérifier avant de partager",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Quelques réflexes simples suffisent à éviter la plupart des fausses informations.",
    blurbEn:
      "Most false information can be caught with three quick checks — no expertise required, just a small pause before sharing. (Section: Media and information, 2/5.)",
    body: `Les fausses informations circulent vite, et elles circulent d'autant mieux qu'elles provoquent une émotion forte : indignation, peur, colère.

C'est d'ailleurs le premier signal d'alerte. Une information qui nous fait immédiatement réagir mérite quelques secondes de méfiance supplémentaire. Ce n'est pas un hasard : les contenus les plus partagés sont ceux qui déclenchent le plus d'émotion.

Trois vérifications élémentaires permettent d'écarter une grande partie des contenus douteux. Elles ne demandent aucune compétence particulière.

La première : qui dit cela ? Il ne s'agit pas de faire confiance aveuglément à certains médias, mais de savoir si l'information vient d'une source identifiable ou d'un compte anonyme. Un contenu qui ne mentionne aucun auteur, aucune date, aucun lieu doit être traité avec prudence.

La deuxième : quand ? Beaucoup de fausses informations sont en réalité de vraies informations sorties de leur époque. Une photographie authentique d'une catastrophe survenue il y a dix ans, republiée comme une actualité, trompe efficacement.

La troisième : est-ce ailleurs ? Si un événement important a réellement eu lieu, plusieurs sources indépendantes en parlent. Une information majeure qui n'existerait qu'à un seul endroit est suspecte.

À cela s'ajoute un outil très simple pour les images : la recherche inversée, qui permet de retrouver les précédentes publications d'une photo. Elle prend quelques secondes.

Enfin, un principe utile : nous sommes tous plus crédules face à ce qui confirme nos opinions.

La vraie difficulté n'est donc pas de vérifier ce que disent les autres.

C'est de vérifier ce qui nous arrange.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-093",
    title: "Pourquoi les mauvaises nouvelles dominent",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Le monde s'améliore sur plusieurs points. L'information ne le reflète pas.",
    blurbEn:
      "The news is not designed to describe the world accurately, and that produces a distorted picture. How to stay informed without despairing. (Section: Media and information, 3/5.)",
    body: `Si l'on se fiait uniquement à l'actualité, on conclurait que tout empire, partout, en permanence.

Or certaines évolutions de long terme vont dans l'autre sens : la mortalité infantile mondiale a fortement baissé en quelques décennies, l'accès à l'éducation a progressé, l'extrême pauvreté a reculé.

Cela ne signifie pas que tout va bien — les inégalités, le climat et plusieurs conflits contredisent tout optimisme naïf. Mais il existe un écart net entre l'image que donne l'actualité et les tendances mesurables.

Cet écart s'explique par la nature même de l'information.

Une nouvelle est, par définition, un événement. Or les catastrophes sont des événements, alors que les progrès sont des processus. Un tremblement de terre a lieu un mardi ; la baisse progressive de la mortalité infantile n'a lieu aucun jour en particulier, donc elle n'est presque jamais annoncée.

S'ajoute un phénomène psychologique bien documenté : nous accordons plus de poids aux informations négatives qu'aux positives. Les rédactions n'ont pas inventé ce biais ; elles y répondent, parce que nous cliquons davantage.

Le résultat est une forme d'usure. Beaucoup de gens déclarent éviter l'actualité — non par désintérêt, mais par fatigue.

Que faire ? Se couper complètement n'est pas satisfaisant : rester informé fait partie de la vie collective.

Ce qui fonctionne, pour beaucoup, tient en deux ajustements. Choisir des moments définis plutôt qu'un flux continu, qui augmente l'anxiété sans augmenter la compréhension. Et privilégier des formats longs, qui expliquent des tendances, plutôt que l'accumulation d'alertes.

Être informé, ce n'est pas tout savoir en temps réel.

C'est comprendre ce qui se passe.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-094",
    title: "Qui paie l'information ?",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "L'information gratuite a un coût, simplement pas au moment de la lecture.",
    blurbEn:
      "News feels free, but producing it is not. Who pays — advertisers, subscribers, the state — shapes what gets produced. (Section: Media and information, 4/5.)",
    body: `Nous avons pris l'habitude de lire l'actualité sans payer. Cette gratuité apparente a des conséquences qu'il est utile de comprendre.

Produire une information coûte cher. Envoyer un journaliste sur le terrain, vérifier des documents, mener une enquête de plusieurs mois : tout cela suppose des salaires et du temps, parfois pour un seul article.

Historiquement, ce coût était couvert par deux sources : la vente du journal et la publicité. Les petites annonces, notamment, ont longtemps financé une grande part de la presse locale.

Internet a fait s'effondrer ces deux piliers. Les annonces sont parties vers des plateformes spécialisées, et la publicité en ligne rapporte beaucoup moins que la publicité imprimée, l'essentiel des revenus étant capté par quelques très grandes entreprises.

Les conséquences sont visibles. De nombreux titres locaux ont disparu ou fusionné. Or la presse locale est précisément celle qui couvre les conseils municipaux, les tribunaux, les décisions qui affectent le quotidien. Des recherches montrent que la disparition d'un journal local s'accompagne d'une baisse de la participation électorale et d'un contrôle moindre des dépenses publiques.

Plusieurs modèles tentent de compenser : abonnements numériques, financement participatif, soutien public, fondations.

Chacun pose ses propres questions d'indépendance, et aucun n'a encore remplacé ce qui a été perdu.

Il y a là un choix collectif, rarement formulé ainsi.

Une information de qualité n'est pas un bien qui apparaît spontanément.

Si personne ne la paie, quelqu'un finira par la financer pour d'autres raisons que nous informer.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-095",
    title: "Nous ne voyons pas tous la même chose",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Deux personnes peuvent utiliser le même réseau et voir deux mondes différents.",
    blurbEn:
      "Recommendation algorithms mean two people on the same platform see different worlds. The effect is real, though often exaggerated. (Section: Media and information, 5/5.)",
    body: `Sur la plupart des plateformes, ce que nous voyons n'est pas ce que voit notre voisin. Un algorithme sélectionne, pour chacun, les contenus jugés les plus susceptibles de retenir son attention.

Le principe n'est pas absurde : la quantité de contenus disponibles dépasse toute capacité humaine de tri.

Mais le critère utilisé pose problème. Ces systèmes n'optimisent pas la qualité ni la véracité ; ils optimisent l'engagement, c'est-à-dire le temps passé et les réactions.

Or les contenus qui font le plus réagir ne sont pas les plus nuancés. Ce sont les plus tranchés, les plus indignants, les plus émotionnels. Un texte équilibré, qui reconnaît la complexité d'un sujet, circule mal par construction.

On parle souvent de « bulles de filtres » : chacun serait enfermé dans un univers d'opinions semblables aux siennes. La recherche invite à nuancer ce diagnostic. En réalité, les utilisateurs de réseaux sociaux sont souvent exposés à des opinions opposées — mais dans leur version la plus caricaturale, ce qui renforce l'hostilité plutôt que le dialogue.

L'effet n'est donc pas tant l'isolement que la déformation.

Quelques réflexes limitent le phénomène. Suivre volontairement quelques sources sérieuses avec lesquelles on n'est pas d'accord. Chercher activement une information plutôt que d'attendre qu'elle apparaisse. Se méfier des extraits très courts, qui suppriment le contexte par nature.

Et se rappeler une chose simple, souvent oubliée dans les discussions en ligne.

La personne qui écrit une opinion absurde n'est pas nécessairement représentative de quoi que ce soit.

Elle a peut-être seulement été choisie pour nous parce qu'elle nous fait réagir.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-096",
    title: "Bouger, même un peu",
    category: "sport",
    difficulty: "B1",
    minutes: 3,
    preview: "L'écart le plus important est entre zéro et un peu.",
    blurbEn:
      "The biggest health gain is not between moderate and intense exercise, but between none and some — which changes the advice entirely. (Section: Sport and the body, 1/5.)",
    body: `Les recommandations sanitaires évoquent souvent trente minutes d'activité par jour, ou cent cinquante minutes par semaine. Ces chiffres découragent beaucoup de personnes qui en sont loin.

Or ils masquent un fait plus encourageant.

Quand on examine la relation entre activité physique et santé, la courbe n'est pas droite. Le bénéfice le plus important ne se situe pas entre « modéré » et « intense », mais entre « rien » et « un peu ».

Autrement dit, une personne totalement sédentaire qui se met à marcher vingt minutes par jour obtient un gain proportionnellement bien plus grand qu'un sportif régulier qui ajoute une séance.

Cette nuance change complètement le conseil à donner. Il ne s'agit pas d'atteindre un objectif idéal, mais de sortir de zéro.

Un deuxième point mérite d'être connu : la sédentarité et l'exercice sont deux choses distinctes. On peut courir une heure le matin et passer ensuite dix heures assis. Les recherches suggèrent que la position assise prolongée a ses propres effets, indépendamment de l'activité sportive.

D'où l'intérêt de fractionner : se lever quelques minutes toutes les heures, prendre les escaliers, descendre un arrêt plus tôt. Ces gestes ne remplacent pas le sport, mais ils agissent sur un autre facteur.

Enfin, l'activité la plus efficace reste celle qu'on pratique réellement. Un sport parfait sur le papier mais abandonné au bout d'un mois vaut moins qu'une marche quotidienne poursuivie pendant dix ans.

La question n'est donc pas « quel est le meilleur exercice ? ».

Elle est : « qu'est-ce que je ferai encore dans un an ? »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-097",
    title: "Le sport féminin gagne du terrain",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Les compétitions féminines attirent un public de plus en plus large.",
    blurbEn:
      "Women's sport is drawing record audiences after decades of near-invisibility. What changed, and what still has not. (Section: Sport and the body, 2/5.)",
    body: `Depuis une dizaine d'années, le sport féminin connaît une progression rapide. Les compétitions attirent des audiences records, les stades se remplissent, et des clubs professionnels se sont structurés dans des disciplines où ils n'existaient pratiquement pas.

Ce mouvement s'explique en partie par une décision simple : la diffusion.

Pendant longtemps, l'argument avancé pour ne pas retransmettre les compétitions féminines était l'absence de public. Le raisonnement était circulaire : sans diffusion, pas de spectateurs ; sans spectateurs, pas de diffusion.

Lorsque de grandes chaînes ont commencé à retransmettre des matchs féminins aux heures de grande écoute, les audiences ont dépassé les prévisions, parfois largement.

Les progrès restent toutefois inégaux.

Les écarts de rémunération demeurent considérables dans la plupart des disciplines. Les moyens d'entraînement, les infrastructures et l'encadrement médical restent souvent inférieurs. Plusieurs athlètes ont témoigné d'installations sommaires comparées à celles des équipes masculines du même club.

Un autre sujet a émergé récemment : la recherche médicale. Pendant des décennies, la physiologie sportive a été étudiée presque exclusivement sur des hommes, et les protocoles d'entraînement ont été conçus sur cette base. Des travaux plus récents s'intéressent enfin aux spécificités féminines, notamment aux blessures des ligaments du genou, nettement plus fréquentes chez les sportives.

Il y a enfin l'effet d'exemple, difficile à quantifier mais réel.

Les inscriptions en clubs augmentent régulièrement après les grandes compétitions féminines.

On pratique plus facilement un sport quand on a vu quelqu'un qui vous ressemble le pratiquer.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-098",
    title: "Le corps et l'image de soi",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Les images que nous voyons ne représentent presque personne.",
    blurbEn:
      "Filtered and edited images now form most of what we see of other bodies. The effect is measurable, and it is not only about vanity. (Section: Sport and the body, 3/5.)",
    body: `Nous voyons chaque jour un très grand nombre d'images de corps humains. La quasi-totalité d'entre elles sont sélectionnées, cadrées, retouchées, éclairées, parfois modifiées automatiquement par un filtre.

Ce n'est pas nouveau — la publicité retouche depuis longtemps — mais l'échelle a changé. Le phénomène concerne désormais les photos de personnes ordinaires, et les filtres s'appliquent en temps réel, souvent par défaut.

Les recherches en psychologie sociale montrent un mécanisme constant : nous nous comparons à ce que nous voyons régulièrement, sans décider de le faire. Lorsque le point de comparaison est un ensemble d'images optimisées, la comparaison est systématiquement défavorable.

Les effets documentés incluent une insatisfaction corporelle accrue, en particulier chez les adolescentes, mais pas uniquement : les jeunes hommes sont de plus en plus concernés, avec un idéal musculaire tout aussi inaccessible.

Il serait simpliste d'en faire une question de vanité. Une image de soi dégradée influence des comportements concrets : éviter certaines activités, renoncer à la piscine, adopter des régimes déséquilibrés, ou à l'inverse abandonner tout sport par découragement.

Que faire ? Les approches efficaces ne consistent pas à demander aux gens de « s'accepter » — injonction facile et peu opérante.

Ce qui fonctionne davantage : diversifier ce que l'on voit, en suivant des comptes montrant des corps variés et non retouchés ; réduire l'exposition aux contenus qui déclenchent la comparaison ; et déplacer l'attention de l'apparence vers la fonction.

Cette dernière idée mérite d'être soulignée.

Un corps qui marche, porte, nage ou danse fait quelque chose.

C'est un critère plus juste, et plus durable, que son apparence sur une photographie.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-099",
    title: "Les blessures des sportifs amateurs",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "La plupart des blessures viennent d'une progression trop rapide.",
    blurbEn:
      "Most amateur injuries are not accidents. They come from doing too much too soon — and the pattern is remarkably consistent. (Section: Sport and the body, 4/5.)",
    body: `Chaque année, de nombreux sportifs amateurs se blessent. Contrairement à ce qu'on imagine, la majorité de ces blessures ne résultent pas d'un accident : ce sont des blessures dites « de surcharge », apparues progressivement.

Le schéma est presque toujours le même. Une personne reprend le sport avec enthousiasme, augmente rapidement la durée ou l'intensité, et ressent au bout de quelques semaines une douleur qu'elle ignore d'abord, puis qui l'oblige à s'arrêter plusieurs mois.

L'explication tient à une différence de rythme entre les tissus du corps.

Le système cardiovasculaire s'adapte vite : en quelques semaines, on est nettement moins essoufflé. Les muscles suivent assez rapidement. Mais les tendons, les ligaments et les os s'adaptent beaucoup plus lentement, sur plusieurs mois.

Le danger vient précisément de cet écart. On se sent capable de faire davantage bien avant que les structures qui encaissent le choc ne soient prêtes.

D'où la règle souvent citée par les kinésithérapeutes : augmenter la charge d'environ dix pour cent par semaine au maximum, et prévoir régulièrement une semaine plus légère.

Deux autres facteurs reviennent constamment.

Le premier est le sommeil : c'est pendant le repos que la réparation se produit. S'entraîner beaucoup en dormant peu est un excellent moyen de se blesser.

Le second est la variété. Répéter exactement le même mouvement sollicite toujours les mêmes tissus. Alterner les activités répartit la contrainte.

Enfin, une douleur qui persiste plus de quelques jours mérite un avis, pas de la patience.

La plupart des blessures longues ont commencé par une gêne qu'on a choisi d'ignorer.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-100",
    title: "Le sport à l'école",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Les enfants bougent moins qu'il y a trente ans.",
    blurbEn:
      "Children move markedly less than a generation ago, and school PE cannot compensate alone. Why the walk to school matters as much as the lesson. (Section: Sport and the body, 5/5.)",
    body: `Les études sanitaires convergent : la condition physique des enfants a baissé de façon mesurable depuis une trentaine d'années. La capacité d'endurance moyenne d'un enfant de dix ans est aujourd'hui nettement inférieure à celle des générations précédentes.

Plusieurs causes se combinent, et il serait réducteur de tout attribuer aux écrans.

Le mode de déplacement a changé. Une part importante des enfants était autrefois conduite à l'école à pied ou à vélo ; la voiture domine désormais, souvent pour de courtes distances. Cette marche quotidienne représentait une activité régulière, invisible mais constante.

Le jeu libre extérieur a également reculé, pour des raisons de sécurité, d'aménagement urbain et d'organisation des familles.

L'école ne peut pas compenser seule ce déficit. Les horaires d'éducation physique représentent quelques heures par semaine, largement insuffisantes pour atteindre les recommandations, qui portent sur une heure d'activité quotidienne.

Certaines initiatives cherchent à agir autrement qu'en ajoutant des cours. Des écoles ont mis en place de courtes séances d'activité intégrées à la journée. D'autres organisent des trajets collectifs à pied, encadrés par des adultes bénévoles, qui permettent aux enfants de marcher en sécurité.

Ces dispositifs ont un avantage : ils ne dépendent ni d'équipements coûteux ni d'un talent sportif particulier.

Car il existe un risque à ne penser l'activité qu'à travers la compétition. Les enfants les moins à l'aise en sport sont précisément ceux qui en auraient le plus besoin, et ce sont souvent eux que l'évaluation décourage le plus tôt.

L'enjeu n'est pas de former des athlètes.

Il est que bouger reste, à l'âge adulte, quelque chose de normal plutôt qu'une épreuve.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-101",
    title: "Pourquoi la France a tant de fêtes en mai",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Le mois de mai compte plusieurs jours fériés. Ce n'est pas un hasard.",
    blurbEn:
      "May is full of French public holidays, and each one comes from a different history: labour, war, religion. What they commemorate, and why. (Section: French traditions, 1/5.)",
    body: `Chaque année, les salariés français regardent le calendrier de mai avec attention. Le mois compte plusieurs jours fériés, parfois placés de façon à permettre de « faire le pont ».

Cette concentration n'a rien d'un hasard : elle résulte de trois histoires différentes qui se sont superposées.

Le 1er mai est une fête du travail. Son origine est internationale et remonte à la fin du dix-neuvième siècle, en mémoire d'un mouvement pour la journée de huit heures. En France, il est devenu jour chômé et payé en 1948. C'est le seul jour férié où presque tout le monde s'arrête vraiment — même les commerces, sauf exceptions. La tradition du brin de muguet, offert ce jour-là, est plus ancienne et sans rapport direct.

Le 8 mai commémore la fin de la Seconde Guerre mondiale en Europe, en 1945. Il a été supprimé comme jour férié dans les années soixante-quinze, puis rétabli en 1981 — signe que ces dates restent des choix politiques.

Viennent ensuite deux fêtes religieuses, héritées d'un calendrier chrétien ancien : l'Ascension, toujours un jeudi, et la Pentecôte, un lundi. Leurs dates changent chaque année car elles dépendent de Pâques, dont le calcul suit les cycles lunaires.

Cette coexistence entre des fêtes ouvrières, mémorielles et religieuses surprend souvent les étrangers, en particulier dans un pays officiellement laïque.

Elle s'explique simplement : ces jours n'ont pas été décidés ensemble, mais accumulés au fil de deux siècles.

Peu de Français pourraient expliquer ce que célèbre l'Ascension.

Tous savent qu'elle tombe un jeudi.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-102",
    title: "Le marché, une institution qui résiste",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Malgré les supermarchés, les marchés n'ont pas disparu.",
    blurbEn:
      "Supermarkets should have killed the open-air market decades ago. They did not, and the reasons say something about what shopping is for. (Section: French traditions, 2/5.)",
    body: `On aurait pu penser que les marchés de plein air disparaîtraient avec l'essor des supermarchés. Ils sont pourtant restés : la France en compte plusieurs milliers, hebdomadaires ou bihebdomadaires, dans les villes comme dans les villages.

Leur survie est intéressante, car sur le papier, le supermarché gagne sur presque tous les critères : horaires plus larges, choix plus vaste, abri en cas de pluie, stationnement, prix souvent inférieurs.

Pourquoi, alors, continuer d'aller au marché ?

La première réponse est la qualité perçue, notamment pour les fruits, les légumes et les fromages. Elle n'est pas toujours objectivement supérieure — un marché peut vendre des produits venus des mêmes circuits — mais la possibilité de voir, de sentir, de demander compte beaucoup.

La deuxième réponse est la relation. Au marché, il y a quelqu'un en face. On peut demander comment cuisiner un légume inconnu, obtenir un conseil, être reconnu d'une semaine à l'autre. Ce lien n'existe pas dans un rayon.

La troisième réponse est sociale, et c'est probablement la plus déterminante. Le marché est l'un des rares lieux où des personnes de générations et de milieux différents se croisent sans rendez-vous. On y va aussi pour rencontrer des gens, souvent sans le formuler ainsi.

Les municipalités l'ont compris : beaucoup soutiennent activement leurs marchés, y compris quand ils ne sont pas rentables, parce qu'ils font vivre un centre-ville.

Le marché n'a donc pas résisté malgré son inefficacité commerciale.

Il a résisté parce qu'il ne servait pas seulement à acheter.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-103",
    title: "La laïcité, souvent mal comprise",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Le mot revient sans cesse dans le débat français.",
    blurbEn:
      "Laïcité is central to French public life and frequently misunderstood abroad. What the 1905 law actually says, and what it does not. (Section: French traditions, 3/5.)",
    body: `Peu de mots reviennent aussi souvent dans le débat public français que celui de laïcité. Peu sont aussi régulièrement mal compris, en France comme à l'étranger.

Le principe trouve sa forme actuelle dans la loi de 1905, qui sépare les Églises et l'État. Cette loi a mis fin à un régime où l'État finançait et encadrait certains cultes.

Elle repose sur deux idées, souvent citées séparément alors qu'elles vont ensemble.

La première est la neutralité de l'État. La puissance publique ne reconnaît, ne salarie ni ne subventionne aucun culte. Un fonctionnaire, dans l'exercice de ses fonctions, ne manifeste pas ses convictions religieuses.

La seconde est la liberté de conscience. L'État garantit le libre exercice des cultes. Autrement dit, la laïcité n'a pas été conçue contre les religions, mais pour permettre leur coexistence sans qu'aucune n'occupe l'État.

Le malentendu le plus fréquent consiste à confondre ces deux niveaux. La neutralité s'impose à l'État et à ses agents, non aux individus dans l'espace public. Un usager d'un service public n'est pas soumis aux mêmes obligations qu'un agent.

Il existe aussi des exceptions historiques peu connues : en Alsace et en Moselle, rattachées à l'Allemagne en 1905, un régime concordataire antérieur s'applique encore, et certains cultes y sont financés.

Les débats contemporains portent rarement sur le principe lui-même, largement accepté.

Ils portent sur son application concrète — à l'école, dans le sport, au travail.

C'est-à-dire, comme souvent, non sur la règle, mais sur sa frontière.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-104",
    title: "Les langues régionales",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Le breton, l'occitan, l'alsacien : des langues longtemps découragées.",
    blurbEn:
      "France has many regional languages, most of them now endangered. Their decline was policy, and their partial revival is recent. (Section: French traditions, 4/5.)",
    body: `On oublie souvent que le français n'a été la langue majoritaire de la France que tardivement. À la Révolution, une part importante de la population parlait d'abord une autre langue : breton, occitan, basque, alsacien, corse, flamand, catalan, et de nombreuses variantes.

Le recul de ces langues n'a pas été spontané.

Il a résulté d'une politique délibérée, menée à partir du dix-neuvième siècle, avec l'idée que l'unité nationale supposait une langue unique. L'école a joué un rôle central. De nombreux témoignages rapportent des punitions infligées aux élèves surpris à parler leur langue maternelle dans la cour.

Cette politique a produit un effet durable, moins par l'interdiction que par la honte : beaucoup de parents ont cessé de transmettre leur langue à leurs enfants, convaincus qu'elle les désavantagerait.

C'est ce mécanisme — l'arrêt de la transmission familiale — qui fait disparaître une langue, bien plus sûrement que les règlements.

Depuis les années soixante-dix, un mouvement inverse s'est amorcé. Des écoles associatives et bilingues ont vu le jour, la loi a évolué, et ces langues sont désormais reconnues comme faisant partie du patrimoine de la France.

Les résultats sont contrastés. Le nombre de locuteurs continue de baisser, car les générations qui parlaient ces langues quotidiennement disparaissent. Mais le nombre d'élèves scolarisés en breton ou en occitan augmente.

Ces nouveaux locuteurs ne parlent pas exactement la même langue que leurs grands-parents.

Une langue apprise à l'école n'est jamais identique à une langue héritée.

Elle a toutefois un avantage décisif : elle est encore là.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-105",
    title: "Le patrimoine, qui décide de ce qu'on garde ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Conserver un bâtiment ancien coûte cher. Il faut choisir.",
    blurbEn:
      "France protects tens of thousands of monuments, but conservation costs money and requires choices. Who decides what deserves saving? (Section: French traditions, 5/5.)",
    body: `La France protège plusieurs dizaines de milliers de monuments historiques, des cathédrales aux lavoirs de village. Cette politique est ancienne : elle remonte au dix-neuvième siècle, à une époque où de nombreux édifices médiévaux étaient détruits ou pillés.

Elle soulève pourtant une question rarement posée : qui décide de ce qui mérite d'être conservé ?

Le classement suit des procédures précises, avec des experts et des commissions. Mais tout choix de conservation est aussi un choix de récit.

Pendant longtemps, on a protégé en priorité les châteaux, les églises et les demeures aristocratiques — c'est-à-dire les traces des puissants. Les bâtiments du travail ordinaire, eux, ont massivement disparu : ateliers, usines, fermes, logements ouvriers.

Depuis quelques décennies, ce regard a changé. Le patrimoine industriel est désormais reconnu, et d'anciennes usines sont transformées en musées, en logements ou en lieux culturels plutôt que démolies.

Reste la question du coût. L'entretien d'un monument est permanent, et beaucoup de communes rurales possèdent des églises qu'elles n'ont pas les moyens de restaurer. Le nombre d'édifices en péril est important.

Les solutions sont diverses : loteries dédiées, mécénat, financement participatif, réutilisation pour un autre usage.

Cette dernière piste est probablement la plus efficace. Un bâtiment vide se dégrade ; un bâtiment occupé est entretenu par ceux qui s'en servent.

Conserver ne signifie donc pas figer.

Beaucoup des édifices que nous admirons ont changé plusieurs fois de fonction au cours des siècles.

Ce que nous appelons patrimoine est souvent le résultat d'une longue série de réemplois.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-106",
    title: "La disparition silencieuse des insectes",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Le nombre d'insectes a chuté de façon spectaculaire.",
    blurbEn:
      "Insect numbers have collapsed across Europe. It matters far more than it sounds, because almost everything else depends on them. (Section: Nature and wildlife, 1/5.)",
    body: `Les insectes n'ont pas bonne presse. Ils piquent, ils dérangent, ils apparaissent dans la cuisine en été. Peu de gens s'en inquiètent quand ils se raréfient.

Or les données disponibles sont préoccupantes. Plusieurs études européennes, dont une menée en Allemagne sur près de trente ans, ont mesuré une chute considérable de la biomasse d'insectes volants — de l'ordre de plusieurs dizaines de pour cent selon les sites.

Beaucoup de gens ont observé le phénomène sans le nommer : les pare-brise des voitures, autrefois couverts d'insectes après un trajet d'été, restent aujourd'hui presque propres.

Pourquoi est-ce grave ?

D'abord pour la pollinisation. Une part importante des cultures destinées à l'alimentation humaine dépend, totalement ou partiellement, de pollinisateurs. Sans eux, certaines productions deviennent impossibles ou nécessitent une pollinisation manuelle, pratiquée dans quelques régions du monde à un coût considérable.

Ensuite parce que les insectes sont à la base des chaînes alimentaires. Les oiseaux insectivores, dont les populations déclinent également, en dépendent directement.

Enfin pour la décomposition : sans insectes, la matière organique se dégrade beaucoup plus lentement.

Les causes identifiées sont multiples et se cumulent : usage massif de pesticides, disparition des haies et des prairies, artificialisation des sols, éclairage nocturne, changement climatique.

Des mesures existent, à toutes les échelles : réduire les traitements, replanter des haies, laisser des zones non tondues, limiter l'éclairage inutile.

Ce qui rend ce sujet difficile, c'est son invisibilité.

Personne ne remarque l'absence d'un insecte.

On remarque seulement, des années plus tard, qu'il n'y en a plus.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-107",
    title: "Le retour du loup",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Le loup est revenu en France seul, sans être réintroduit.",
    blurbEn:
      "Wolves returned to France on their own in 1992 and the debate has been fierce ever since. Both sides have a real case. (Section: Nature and wildlife, 2/5.)",
    body: `Le loup avait disparu de France dans les années trente, éliminé par la chasse. Il est réapparu en 1992, dans le parc du Mercantour, venu d'Italie par ses propres moyens.

Ce point est important : le loup n'a pas été réintroduit. Il est revenu seul, à la faveur de la reforestation et de la protection dont il bénéficie au niveau européen.

Depuis, sa population a progressé et s'est étendue à de nombreux départements.

Le débat qu'il suscite est vif, et les deux positions reposent sur des arguments réels.

Du côté de la protection, on souligne que le loup est une espèce protégée, qu'il joue un rôle dans la régulation des populations d'herbivores, et que son retour témoigne d'une amélioration des milieux naturels.

Du côté des éleveurs, la difficulté est concrète. Les attaques sur les troupeaux se comptent en milliers chaque année. Au-delà des pertes indemnisées, les éleveurs décrivent une charge de travail supplémentaire et une tension permanente : surveiller, regrouper, entretenir des clôtures, dormir mal.

Il faut reconnaître que la protection des troupeaux, dans les zones de pâturage difficiles, n'est pas toujours possible. Les chiens de protection fonctionnent bien, mais posent d'autres problèmes, notamment avec les randonneurs.

Les politiques actuelles combinent protection de l'espèce, indemnisations, aides aux mesures de protection et prélèvements encadrés d'un nombre limité d'individus.

Cette solution ne satisfait pleinement personne, ce qui est peut-être inévitable.

Le retour du loup pose en réalité une question plus large : jusqu'où sommes-nous prêts à partager le territoire avec une faune sauvage que nous avions éliminée ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-108",
    title: "Nos villes peuvent accueillir la nature",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Certaines espèces vivent mieux en ville qu'à la campagne.",
    blurbEn:
      "Some species now do better in cities than in intensively farmed countryside. What that says about both, and how urban design can help. (Section: Nature and wildlife, 3/5.)",
    body: `On oppose souvent la ville et la nature, comme si l'une excluait l'autre. La réalité est plus nuancée, et parfois surprenante.

Plusieurs études montrent que certaines espèces — notamment des abeilles sauvages et des oiseaux — se portent aujourd'hui mieux dans certaines villes que dans les zones de grande culture intensive environnantes.

Ce constat n'est pas un compliment adressé aux villes. C'est surtout un signal préoccupant concernant les campagnes où les haies ont disparu et où les traitements sont intensifs.

Les villes présentent néanmoins de vrais atouts. Elles offrent une grande diversité de milieux sur un petit espace : jardins, parcs, friches, toitures, cimetières, bords de voies ferrées. Les floraisons y sont étalées sur une longue période, alors qu'un champ fleurit tout en même temps puis plus rien. Et l'usage de pesticides y est désormais très encadré dans les espaces publics.

Elles présentent aussi de sérieux inconvénients : imperméabilisation des sols, circulation, et surtout éclairage nocturne, dont l'effet sur les insectes et les chauves-souris est important.

Ce qui fonctionne, dans les villes qui s'y intéressent, tient à quelques principes simples.

La continuité d'abord : des espaces verts reliés entre eux valent mieux que des espaces isolés, car les espèces doivent pouvoir circuler.

La gestion ensuite : tondre moins souvent, laisser des zones en herbe haute, accepter une esthétique moins nette.

Ce dernier point est le plus difficile, car il suppose de changer ce qu'on considère comme « bien entretenu ».

Une pelouse rase et verte est un désert écologique.

Un coin d'herbe folle est un habitat.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-109",
    title: "Faut-il nourrir les oiseaux en hiver ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Le geste est répandu. Il demande quelques précautions.",
    blurbEn:
      "Feeding garden birds helps, but only if done correctly. The season, the food and the hygiene all matter more than people think. (Section: Nature and wildlife, 4/5.)",
    body: `Nourrir les oiseaux en hiver est un geste très répandu, et globalement bénéfique. Il aide de nombreuses espèces à passer la période où la nourriture naturelle est rare, et il permet à beaucoup de gens d'observer la faune de près.

Il demande toutefois quelques précautions, que les associations naturalistes rappellent régulièrement.

La première concerne la période. Le nourrissage est utile de la fin de l'automne à la fin de l'hiver, tant que le froid persiste. Il est en revanche déconseillé au printemps et en été : les oisillons ont besoin d'insectes riches en protéines, et des graines apportées à ce moment peuvent leur être nuisibles.

La deuxième concerne la nourriture. Les graines de tournesol non salées et les boules de graisse conviennent à beaucoup d'espèces. Le pain, en revanche, est à éviter : il gonfle, nourrit mal et peut provoquer des troubles digestifs. Tout aliment salé est à proscrire.

La troisième précaution est la plus importante, et la plus souvent oubliée : l'hygiène.

Une mangeoire concentre des dizaines d'oiseaux au même endroit, ce qui facilite la transmission de maladies. Des épidémies touchant certaines espèces ont été documentées et attribuées en partie à des mangeoires mal entretenues.

Il faut donc nettoyer régulièrement le dispositif, retirer les restes humides, et déplacer occasionnellement le point de nourrissage.

Un dernier conseil vaut d'être mentionné : une fois commencé, il vaut mieux continuer jusqu'à la fin de l'hiver. Les oiseaux intègrent la ressource dans leurs déplacements quotidiens.

Et si l'on veut vraiment aider, le meilleur geste n'est pas la mangeoire.

C'est de planter une haie.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-110",
    title: "La nuit a besoin d'obscurité",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "L'éclairage nocturne perturbe une grande partie du vivant.",
    blurbEn:
      "Artificial light at night disrupts insects, birds, plants and people. Switching some of it off is one of the cheapest environmental measures available. (Section: Nature and wildlife, 5/5.)",
    body: `La pollution lumineuse est un sujet relativement récent, longtemps considéré comme secondaire. Les recherches menées depuis une vingtaine d'années ont changé ce regard.

L'éclairage artificiel nocturne a fortement augmenté dans le monde, et la quasi-totalité de la population européenne vit désormais sous un ciel où la Voie lactée est invisible.

Les effets documentés concernent une grande partie du vivant.

Pour les insectes, la lumière agit comme un piège. Ils tournent autour des sources lumineuses jusqu'à l'épuisement, ne se reproduisent pas et deviennent des proies faciles. On estime que l'éclairage nocturne compte parmi les causes du déclin des insectes.

Pour les oiseaux migrateurs, qui se repèrent en partie sur les étoiles, les villes éclairées désorientent. Des collisions avec des bâtiments illuminés sont régulièrement observées.

Les chauves-souris, qui chassent la nuit, évitent les zones éclairées et perdent ainsi des territoires de chasse.

Les plantes elles-mêmes sont affectées : des arbres situés sous des lampadaires conservent leurs feuilles plus longtemps à l'automne.

Chez l'humain, la lumière nocturne perturbe la production de mélatonine et la qualité du sommeil.

Ce qui rend ce sujet particulier, c'est qu'il est facile à corriger — bien plus que la plupart des problèmes environnementaux.

Éteindre une lumière ne demande ni technologie ni investissement lourd. Cela réduit même la facture.

De nombreuses communes françaises ont déjà instauré une extinction en milieu de nuit, sans hausse constatée de la délinquance, contrairement aux craintes exprimées.

Peu de mesures écologiques coûtent moins cher et agissent aussi vite.

Il suffit, littéralement, d'appuyer sur un interrupteur.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-111",
    title: "Deux façons de faire l'école",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Les systèmes scolaires français et britannique diffèrent profondément.",
    blurbEn:
      "French and British schooling differ in structure, philosophy and pace. Neither is obviously better, but the contrast is revealing. (Section: France and Britain, 1/5.)",
    body: `Les systèmes éducatifs français et britannique se ressemblent moins qu'on ne le croit, et les différences ne portent pas seulement sur l'organisation.

La première tient à la spécialisation. En France, les élèves suivent un tronc commun assez large jusqu'au baccalauréat : même en filière scientifique, ils étudient la philosophie, l'histoire et une ou deux langues. En Angleterre, la spécialisation intervient beaucoup plus tôt : un élève de dix-sept ans peut n'étudier que trois matières.

Chaque approche a sa logique. La spécialisation précoce permet d'aller plus loin dans un domaine ; le tronc commun retarde le choix et maintient une culture générale partagée.

La deuxième différence est l'évaluation. Le système français note traditionnellement sur vingt, avec une culture où quinze est déjà une très bonne note et où vingt est presque théorique. Le système britannique fonctionne par lettres et par paliers, avec des attentes différentes.

Cette différence dépasse la technique. Un élève français apprend tôt qu'il n'atteindra pas la perfection ; certains y voient une saine exigence, d'autres une source de découragement.

La troisième différence concerne la journée. La journée scolaire française est longue, avec une vraie pause déjeuner et un repas servi à table. Les activités sportives et artistiques se déroulent souvent en dehors de l'école, dans des clubs. En Angleterre, ces activités sont fréquemment intégrées à l'établissement.

Enfin, l'uniforme, courant outre-Manche, est très rare en France.

Il serait vain de désigner un vainqueur.

Les deux systèmes forment des élèves compétents, avec des habitudes intellectuelles différentes.

Ce qu'ils révèlent surtout, ce sont deux idées de ce qu'une école doit produire.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-112",
    title: "Manifester, une tradition française ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "La France a la réputation de descendre facilement dans la rue.",
    blurbEn:
      "The French reputation for protest is real but often misunderstood. It has roots in history and in how negotiation actually works. (Section: France and Britain, 2/5.)",
    body: `La France a, à l'étranger, une réputation solide : celle d'un pays où l'on manifeste souvent. Cette image n'est pas fausse, mais elle mérite d'être expliquée plutôt que caricaturée.

Les statistiques comparatives confirment une fréquence de mobilisations supérieure à celle de la plupart des voisins européens. Reste à comprendre pourquoi.

Une première explication est historique. La Révolution de 1789 a installé l'idée que le peuple peut légitimement contester le pouvoir. Cette mémoire est enseignée à l'école et reste vivante dans le discours politique.

Une deuxième explication tient au fonctionnement du dialogue social. Dans plusieurs pays d'Europe du Nord, les syndicats sont puissants, comptent de nombreux adhérents et négocient directement avec les employeurs. En France, le taux de syndicalisation est faible, mais la capacité de mobilisation est forte.

Il en résulte une culture différente : la négociation intervient souvent après le rapport de force, alors qu'ailleurs elle le précède.

Une troisième explication est institutionnelle. Le pouvoir français est fortement centralisé. Quand une décision importante se prend à Paris, contester localement a peu d'effet, et la rue devient le canal d'expression.

Cette culture a ses coûts, régulièrement rappelés : grèves de transports, conflits longs, difficulté à réformer.

Elle a aussi produit des acquis auxquels une majorité de Français tient, obtenus par des mobilisations.

Mon ami Tom, arrivé de Londres, a mis du temps à s'y faire. La première grève qu'il a vécue l'a exaspéré.

Puis un collègue lui a dit une phrase qui l'a marqué :

« Ici, quand personne ne descend dans la rue, cela veut souvent dire que personne n'écoute. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-113",
    title: "L'administration française vue de l'étranger",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Les démarches administratives déroutent souvent les nouveaux arrivants.",
    blurbEn:
      "French bureaucracy has a formidable reputation. Some of it is deserved, some of it is a misunderstanding of a different logic. (Section: France and Britain, 3/5.)",
    body: `Peu de sujets font autant parler les étrangers installés en France que l'administration. Le mot « paperasse » figure parmi les premiers qu'ils apprennent.

Une partie de cette réputation est méritée. Les démarches supposent souvent de fournir des documents multiples, parfois plusieurs fois au même organisme, et les délais peuvent être longs.

Mais une partie relève du malentendu, car les logiques diffèrent.

Le système français est fondé sur la preuve écrite. Il demande des justificatifs parce qu'il part du principe qu'une affirmation doit être documentée. Le système britannique repose davantage sur la déclaration : on affirme, et les contrôles interviennent ensuite, par sondage.

Aucune des deux approches n'est absurde. La première est plus lourde mais crée moins de contentieux ; la seconde est plus rapide mais suppose une confiance qui peut être trahie.

Autre différence : la France a longtemps préféré des règles très détaillées, prévoyant chaque cas, plutôt que des principes généraux laissés à l'appréciation. Cela produit des textes précis, et une difficulté réelle quand une situation n'entre dans aucune case.

Il faut ajouter que la dématérialisation a amélioré beaucoup de démarches. Déclarer ses impôts en ligne prend aujourd'hui quelques minutes, ce qui était impensable il y a vingt ans.

Le conseil que donnent unanimement les expatriés est très concret : garder tout, classer tout, et ne jamais jeter un justificatif de domicile.

Tom a mis trois ans à comprendre le système.

Il conserve désormais un classeur — une habitude qu'il n'avait jamais eue à Londres.

« Ça m'agace toujours », dit-il. « Mais je n'ai plus jamais de problème. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-114",
    title: "Le rapport au temps libre",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Prendre ses vacances complètes est normal en France.",
    blurbEn:
      "Taking all your holiday is normal in France and less so in Britain. The difference is cultural, and it shows up in how offices run in August. (Section: France and Britain, 4/5.)",
    body: `Une différence culturelle frappe souvent les Britanniques installés en France : le rapport aux congés.

En France, prendre l'intégralité de ses vacances va de soi. Personne ne s'en excuse, et un salarié qui ne prendrait pas ses jours inquiéterait plutôt son entourage.

Au Royaume-Uni comme aux États-Unis, il n'est pas rare que des salariés laissent des jours non pris. Certaines entreprises s'en félicitaient d'ailleurs implicitement, l'implication étant mesurée à la disponibilité.

Cette différence se manifeste très concrètement au mois d'août. Une partie du pays ralentit : des artisans ferment trois semaines, des dossiers attendent la rentrée, et il devient difficile d'obtenir une décision administrative.

Pour un nouveau venu, c'est déroutant, voire irritant. Tom a passé un mois d'août à s'agacer que personne ne réponde à ses courriels.

Son collègue lui a répondu, à son retour : « J'étais en vacances. »

Cette réponse, en France, est complète. Elle n'appelle ni excuse ni justification.

Il y a derrière cela une idée qui structure une bonne part de la culture du travail française : le temps hors travail n'est pas un résidu, c'est une part légitime de la vie.

Le droit à la déconnexion, inscrit dans la loi depuis 2017, prolonge cette logique.

Il serait naïf d'idéaliser ce modèle : la France connaît aussi le surmenage, et certains secteurs le pratiquent intensément.

Mais la norme sociale, elle, diffère.

Après six ans en France, Tom prend désormais toutes ses vacances.

« Au début, je culpabilisais », dit-il. « Maintenant, je trouve ça normal. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-115",
    title: "Ce que chacun envie à l'autre",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Les Français et les Britanniques s'observent depuis des siècles.",
    blurbEn:
      "After centuries of rivalry and mockery, each country quietly admires things in the other. A look at what, and why. (Section: France and Britain, 5/5.)",
    body: `Les relations entre la France et le Royaume-Uni sont anciennes, faites de conflits, d'alliances et d'une longue tradition de moqueries réciproques.

Ce qui est plus intéressant, ce sont les admirations discrètes.

Ce que beaucoup de Britanniques envient à la France : le système de santé, régulièrement cité pour son accessibilité et ses délais. La qualité de l'alimentation ordinaire, notamment le fait qu'un repas correct reste abordable. La place accordée au temps libre. Et un aménagement du territoire qui a maintenu des services publics dans des villes moyennes, alors que la centralisation britannique sur Londres a été plus brutale.

Ce que beaucoup de Français envient au Royaume-Uni : une administration plus légère et plus rapide. Un marché du travail où il est plus facile de rebondir après un échec, y compris après une faillite. Une culture du service commercial souvent jugée plus aimable. Et un rapport plus décontracté à la hiérarchie et au diplôme — en France, l'école fréquentée à vingt ans pèse encore à cinquante.

Il y a aussi des reproches croisés, tout aussi révélateurs. Les Français trouvent les Britanniques indirects, au point qu'on ne sait jamais ce qu'ils pensent vraiment. Les Britanniques trouvent les Français abrupts, voire agressifs, alors qu'il s'agit souvent d'une franchise assumée.

Ces malentendus ont un point commun : chacun interprète l'autre avec ses propres codes.

Tom résume les choses à sa façon.

« En Angleterre, on dit "c'est intéressant" quand on pense que c'est mauvais. En France, on dit que c'est mauvais. »

« Ça m'a choqué pendant deux ans. »

« Maintenant, ça me fait gagner du temps. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-116",
    title: "Faut-il aimer son travail ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "« Fais ce que tu aimes » est un conseil récent, et discutable.",
    blurbEn:
      "'Do what you love' is recent advice, and not harmless. What happens when a job is expected to provide meaning as well as income. (Section: Work and meaning, 1/5.)",
    body: `« Fais ce que tu aimes et tu ne travailleras jamais un seul jour. » Cette phrase circule beaucoup. Elle mérite d'être examinée, car elle est plus récente et plus problématique qu'il n'y paraît.

Pendant l'essentiel de l'histoire, le travail n'était pas censé être épanouissant. Il servait à subvenir aux besoins. L'idée qu'un emploi doive apporter du sens et de la réalisation personnelle est apparue tardivement, et surtout dans certaines catégories professionnelles.

Cette évolution a du bon : elle a légitimé le refus de conditions dégradantes.

Mais elle produit aussi des effets pervers.

Le premier est la culpabilité. Si le travail doit être une passion, ne pas aimer le sien devient un échec personnel plutôt qu'une situation ordinaire. Or la majorité des emplois, dans n'importe quelle société, sont nécessaires sans être passionnants.

Le deuxième effet est plus concret. Les secteurs où l'on fait valoir la passion — la culture, le soin, l'animation, la recherche, le sport — sont souvent ceux où les rémunérations sont les plus faibles et les conditions les plus difficiles. La passion supposée y sert d'argument implicite : puisque vous aimez cela, vous accepterez moins.

Des chercheurs ont donné un nom à ce phénomène et l'ont documenté dans plusieurs pays.

Faut-il alors renoncer à chercher du sens ? Certainement pas.

Mais peut-être faut-il déplacer l'exigence. Un travail peut être supportable et bien payé, laissant du temps et de l'énergie pour ce qui compte ailleurs.

Ce n'est pas un renoncement.

C'est une autre façon de refuser que l'emploi occupe toute la place.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-117",
    title: "Les réunions qui ne servent à rien",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Une part importante du temps de travail passe en réunion.",
    blurbEn:
      "Meetings consume a large share of working time, and much of it is wasted. What research says about why, and what actually helps. (Section: Work and meaning, 2/5.)",
    body: `Les cadres passent, selon les estimations, entre un tiers et la moitié de leur temps en réunion. Une proportion importante de ces réunions est jugée inutile par ceux qui y participent.

Ce constat est banal. Les raisons le sont moins.

La première est l'absence de décision claire à prendre. Beaucoup de réunions servent à informer, ce qu'un message écrit ferait mieux et plus vite, en laissant une trace consultable.

La deuxième est le nombre de participants. Au-delà de six ou sept personnes, la discussion devient difficile : les plus à l'aise parlent, les autres se taisent, et le temps de parole individuel devient si faible que la présence perd son sens.

La troisième est la durée par défaut. Une réunion programmée pour une heure durera une heure, quel que soit le sujet. Le format s'impose au contenu plutôt que l'inverse.

Ce qui fonctionne, dans les organisations qui s'y sont attaquées, tient à quelques règles simples.

Envoyer un ordre du jour avec la question à trancher : s'il n'y en a pas, la réunion n'a pas lieu d'être. Limiter le nombre de participants et rendre la présence facultative pour ceux qui sont seulement concernés de loin. Réduire la durée par défaut à vingt-cinq ou cinquante minutes, ce qui laisse aussi le temps de se déplacer. Terminer en énonçant qui fait quoi et pour quand.

Ces principes sont connus depuis longtemps et rarement appliqués.

La raison en est peut-être moins organisationnelle que sociale.

Convoquer une réunion reste, dans beaucoup de structures, une manière de montrer qu'on existe.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-118",
    title: "Le travail invisible",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Une grande partie du travail effectué chaque jour n'est ni vue ni comptée.",
    blurbEn:
      "Domestic work, caring and organising are essential and largely uncounted. Who does them, and what happens when they are ignored. (Section: Work and meaning, 3/5.)",
    body: `Il existe une quantité considérable de travail qui n'apparaît dans aucune statistique économique : les tâches domestiques, les soins aux enfants et aux proches âgés, l'organisation quotidienne d'un foyer.

Ce travail n'est pas rémunéré, donc il n'est pas compté. Il n'en est pas moins indispensable : sans lui, aucune activité professionnelle ne serait possible.

Les enquêtes sur l'emploi du temps mesurent régulièrement sa répartition. Elles montrent une réalité constante, même si l'écart se réduit lentement : les femmes en accomplissent la plus grande part, y compris lorsque les deux membres du couple travaillent à temps plein.

À cette charge s'ajoute une dimension moins visible encore, que les chercheurs appellent la charge mentale. Il ne s'agit pas seulement d'exécuter une tâche, mais d'y penser : savoir qu'il faut prendre rendez-vous chez le dentiste, que les chaussures sont trop petites, qu'il faut un cadeau pour samedi.

Cette charge d'anticipation est difficile à partager, parce qu'elle est invisible tant qu'elle est bien assurée. On ne remarque son existence que lorsqu'elle cesse.

Les conséquences sont concrètes : ce sont majoritairement des femmes qui réduisent leur temps de travail ou interrompent leur carrière, ce qui pèse ensuite sur les salaires et sur les retraites.

Les solutions relèvent de plusieurs niveaux : services de garde accessibles, congés parentaux réellement partagés, reconnaissance du statut d'aidant.

Mais une part se joue à l'intérieur des foyers, dans une répartition explicitement discutée.

Les couples qui y parviennent décrivent souvent la même méthode.

Ils n'ont pas partagé les tâches.

Ils ont partagé la responsabilité de savoir ce qu'il y a à faire.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-119",
    title: "Quand le métier disparaît",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Des métiers disparaissent, d'autres apparaissent. Ce n'est pas nouveau.",
    blurbEn:
      "Jobs have always disappeared with technology. What is different this time is the speed, and what happens to the people in between. (Section: Work and meaning, 4/5.)",
    body: `La disparition de métiers n'a rien d'inédit. Les allumeurs de réverbères, les dactylographes, les opératrices téléphoniques ont existé, puis n'ont plus existé. À chaque fois, d'autres emplois sont apparus, souvent plus nombreux.

Cette observation est utilisée pour rassurer : l'automatisation ne détruit pas l'emploi, elle le déplace.

Sur le long terme, l'histoire lui donne plutôt raison. Mais elle passe sous silence deux difficultés.

La première est le rythme. Une transformation étalée sur cinquante ans se traite par le renouvellement des générations : les enfants exercent un autre métier que leurs parents. Une transformation qui s'opère en dix ans frappe des personnes en milieu de carrière, qui doivent se reconvertir avec des charges familiales et un crédit en cours.

La seconde est la géographie. Les emplois qui disparaissent et ceux qui se créent ne se trouvent pas au même endroit. Quand une usine ferme dans une ville moyenne, dire que des emplois se créent dans le numérique à deux cents kilomètres n'aide pas concrètement.

Ce qui distingue les pays qui traversent bien ces transitions n'est pas la vitesse de l'automatisation : c'est l'accompagnement. Formation financée et anticipée, revenus maintenus pendant la reconversion, aide à la mobilité.

Là où cet accompagnement manque, les conséquences se lisent longtemps après : chômage durable, dégradation de la santé, défiance politique.

Le débat sur l'intelligence artificielle reprend aujourd'hui les mêmes termes.

La question utile n'est probablement pas « combien d'emplois vont disparaître ? », car personne ne le sait précisément.

Elle est : qu'aura-t-on prévu pour ceux qui les occupaient ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-120",
    title: "Prendre sa retraite, et après ?",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "La retraite est attendue, puis parfois plus difficile que prévu.",
    blurbEn:
      "Retirement is looked forward to for decades and can still be destabilising. What makes the difference, according to those who navigate it well. (Section: Work and meaning, 5/5.)",
    body: `La retraite est l'un des rares événements que l'on anticipe pendant des décennies. On la souhaite, on la calcule, on en parle.

Et pourtant, une partie des nouveaux retraités décrivent une période difficile, généralement six à dix-huit mois après l'arrêt.

Le phénomène est documenté. Les premiers mois ressemblent souvent à de longues vacances : on dort, on répare ce qu'on avait laissé, on voyage. Puis vient une phase plus délicate, quand cette liste est épuisée.

Trois pertes se combinent, rarement anticipées.

La première est la structure du temps. Un emploi impose un rythme : des horaires, des échéances, des jours différenciés. Sans lui, les journées se ressemblent, et beaucoup de retraités disent avoir été surpris par cette absence de repères.

La deuxième est le réseau social. Une grande partie des relations quotidiennes d'un adulte passe par le travail. Elles s'estompent souvent en quelques mois, sans conflit, simplement parce que le lien était contextuel.

La troisième est l'utilité perçue. Être attendu quelque part, avoir un rôle, produit un sentiment que le repos ne remplace pas.

Ceux qui traversent bien cette transition ont généralement prévu autre chose qu'un arrêt : une activité bénévole, une formation, un engagement associatif, la garde régulière de petits-enfants.

Le point commun de ces activités est d'apporter à la fois du rythme, des relations et une forme de responsabilité.

Un ancien collègue me l'a résumé après deux années de retraite :

« Je croyais que je voulais ne rien faire. »

« En réalité, je voulais choisir ce que je fais. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-121",
    title: "Les antibiotiques ne soignent pas tout",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Un antibiotique n'agit pas contre un virus.",
    blurbEn:
      "Antibiotics do nothing against viruses, yet are still asked for. Why that matters far beyond the individual patient. (Section: Health and medicine, 1/5.)",
    body: `Les antibiotiques comptent parmi les découvertes médicales les plus importantes du vingtième siècle. Avant eux, une infection banale pouvait tuer.

Ils souffrent pourtant d'un malentendu tenace : beaucoup de gens les considèrent comme un remède général contre le fait d'être malade.

Or un antibiotique agit contre des bactéries. Il n'a strictement aucun effet sur un virus. Cela signifie qu'il est inutile contre la grippe, le rhume ou la plupart des angines et des bronchites, qui sont d'origine virale.

Prendre un antibiotique dans ces cas n'accélère pas la guérison d'un seul jour.

Cela pose deux problèmes.

Le premier est individuel : les antibiotiques ont des effets secondaires, notamment sur la flore intestinale, et il est absurde de les subir sans bénéfice.

Le second est collectif, et il est bien plus sérieux. Chaque usage inutile favorise l'apparition de bactéries résistantes. Le mécanisme est simple : les bactéries qui survivent au traitement sont précisément celles qui y résistent, et ce sont elles qui se multiplient ensuite.

L'antibiorésistance est aujourd'hui considérée par les autorités sanitaires comme l'une des principales menaces à long terme. Des infections autrefois faciles à traiter redeviennent difficiles.

C'est pourquoi les campagnes rappellent régulièrement que les antibiotiques ne sont pas automatiques, et pourquoi il faut aller au bout d'un traitement prescrit plutôt que de l'arrêter dès que l'on se sent mieux.

Il faut aussi reconnaître que la pression ne vient pas uniquement des patients.

Un médecin pressé, face à quelqu'un qui insiste, prescrit parfois pour éviter un conflit.

La bonne question à poser n'est pas « pouvez-vous me donner quelque chose ? », mais « est-ce que c'est viral ? ».`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-122",
    title: "L'effet placebo",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Un traitement sans substance active peut produire un effet réel.",
    blurbEn:
      "The placebo effect is not imagination: it produces measurable changes. Understanding it explains a lot about how medicine is tested. (Section: Health and medicine, 2/5.)",
    body: `L'effet placebo est souvent mal compris. On l'emploie comme synonyme de « faux » ou d'« imaginaire ». La réalité est plus intéressante.

Un placebo est un traitement sans substance active : un comprimé de sucre, une injection d'eau salée. Or, dans de nombreuses études, les patients qui le reçoivent constatent une amélioration mesurable.

Cette amélioration n'est pas une invention du patient. On a observé des modifications physiologiques réelles, notamment la libération de substances antidouleur naturelles par le cerveau.

L'effet est particulièrement marqué sur la douleur, la fatigue, l'anxiété et les nausées — c'est-à-dire sur des symptômes fortement modulés par le système nerveux. Il n'a en revanche aucun effet sur une infection bactérienne ou sur une tumeur.

Plusieurs éléments renforcent le phénomène : la conviction du soignant, le temps consacré à l'écoute, l'aspect du traitement, et même son prix. Un comprimé présenté comme coûteux fonctionne mieux qu'un comprimé identique présenté comme bon marché.

C'est précisément pour cela que les essais cliniques comparent un médicament à un placebo. Sans cette comparaison, il serait impossible de savoir si l'amélioration vient du produit ou du contexte.

Il existe aussi l'effet inverse, moins connu : le nocebo. Informer un patient des effets secondaires possibles augmente la probabilité qu'il les ressente.

Ce phénomène pose une question difficile aux soignants, entre information honnête et suggestion involontaire.

Ce qu'il enseigne, en tout cas, est important.

La relation entre un patient et son médecin n'est pas un supplément d'humanité optionnel.

Elle fait partie du traitement.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-123",
    title: "La santé mentale au travail",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Le sujet était tabou. Il ne l'est plus tout à fait.",
    blurbEn:
      "Mental health at work has moved from taboo to policy. Recognising the difference between stress, exhaustion and burnout matters. (Section: Health and medicine, 3/5.)",
    body: `Pendant longtemps, la souffrance psychique au travail relevait du domaine privé. Un salarié en difficulté était supposé « tenir » ou partir.

Ce n'est plus tout à fait le cas. Les arrêts de travail pour raisons psychologiques ont fortement augmenté, et les entreprises ont l'obligation légale de préserver la santé mentale de leurs salariés, pas seulement leur sécurité physique.

Encore faut-il distinguer des réalités différentes, souvent confondues.

Le stress ponctuel n'est pas une maladie. Il est une réponse normale à une échéance ou à une difficulté, et il disparaît quand la situation se résout.

L'épuisement professionnel — le burn-out — est autre chose. Il se caractérise par un épuisement profond qui ne se répare pas avec le repos habituel, une distance croissante vis-à-vis du travail, et un sentiment d'inefficacité. Il s'installe progressivement, souvent chez des personnes très impliquées.

Ce dernier point est important : contrairement à une idée reçue, ce ne sont pas les moins engagés qui s'effondrent. Ce sont fréquemment ceux qui en font le plus.

Les facteurs de risque identifiés sont assez constants : une charge de travail durablement excessive, un manque d'autonomie, l'absence de reconnaissance, des consignes contradictoires, et des conflits de valeurs — devoir faire mal ce qu'on sait faire bien.

Les réponses individuelles — sport, sommeil, relaxation — aident, mais elles ne suffisent pas si l'organisation ne change pas.

C'est là que le débat se tend, car il est plus simple de proposer une séance de méditation que de réduire une charge de travail.

Les entreprises qui obtiennent des résultats agissent presque toujours sur l'organisation elle-même.

Le reste relève de l'affichage.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-124",
    title: "Vieillir en bonne santé",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "L'espérance de vie augmente. L'espérance de vie en bonne santé moins vite.",
    blurbEn:
      "Living longer is not the same as living well for longer. The gap between the two is where prevention actually matters. (Section: Health and medicine, 4/5.)",
    body: `L'espérance de vie a considérablement augmenté au cours du vingtième siècle. C'est l'un des progrès les plus spectaculaires de l'histoire humaine.

Mais un autre indicateur, moins médiatisé, mérite attention : l'espérance de vie en bonne santé, c'est-à-dire le nombre d'années vécues sans limitation importante dans les activités quotidiennes.

Cet indicateur progresse moins vite que l'espérance de vie totale. Autrement dit, nous gagnons des années, mais une partie de ces années se vit avec des difficultés.

Réduire cet écart est devenu un objectif central des politiques de santé publique.

Ce qui influence cette période est assez bien identifié, et sans grande surprise : l'activité physique, l'alimentation, le tabac, l'alcool, la qualité du sommeil, et — élément souvent oublié — le maintien des liens sociaux.

Deux points méritent d'être soulignés.

Le premier est l'importance du maintien musculaire. À partir d'un certain âge, la masse musculaire diminue naturellement, et cette perte est un facteur majeur de dépendance : elle augmente le risque de chute, et une chute est fréquemment le point de bascule vers la perte d'autonomie. Le renforcement musculaire, même modeste, a un effet démontré à tout âge, y compris après quatre-vingts ans.

Le second est que la prévention n'a pas d'âge limite. Arrêter de fumer à soixante-cinq ans apporte encore des bénéfices mesurables. Commencer une activité physique à soixante-quinze ans améliore l'équilibre en quelques mois.

L'idée qu'il serait « trop tard » est démentie par les données.

Le corps, y compris âgé, répond à ce qu'on lui demande.

Il faut simplement continuer à lui demander quelque chose.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-125",
    title: "Chercher ses symptômes sur internet",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Presque tout le monde le fait. Ce n'est ni inutile ni sans risque.",
    blurbEn:
      "Almost everyone searches their symptoms online. It is neither useless nor harmless — the difference lies in how you read the results. (Section: Health and medicine, 5/5.)",
    body: `Une large majorité de personnes cherchent des informations médicales en ligne avant, ou parfois au lieu de, consulter un médecin.

Cette pratique est souvent moquée. Elle mérite un regard plus nuancé.

Elle a de réels avantages. Un patient informé pose de meilleures questions, comprend mieux ce qu'on lui explique, et suit plus volontiers un traitement dont il saisit la logique. Pour les maladies chroniques, les communautés de patients en ligne apportent une aide concrète que le système de soins ne fournit pas toujours.

Mais elle comporte deux pièges bien identifiés.

Le premier est statistique. Les moteurs de recherche ne classent pas les résultats par probabilité médicale. Un mal de tête peut correspondre à des dizaines de causes, dont l'immense majorité sont bénignes ; ce sont pourtant les causes graves qui apparaissent, parce qu'elles génèrent plus de contenus. Le résultat est une anxiété disproportionnée, parfois appelée « cybercondrie ».

Le second est la qualité inégale des sources. Des sites commerciaux, des forums non modérés et des contenus promotionnels côtoient des ressources sérieuses, sans que la présentation permette toujours de les distinguer.

Quelques réflexes limitent ces risques. Privilégier les sites institutionnels ou les organismes publics de santé. Se méfier de tout contenu qui vend simultanément une solution. Regarder la date : les recommandations médicales évoluent.

Et surtout, garder à l'esprit une limite fondamentale.

Un moteur de recherche liste des possibilités.

Un médecin examine une personne, connaît son histoire, et écarte l'immense majorité de ces possibilités en quelques minutes.

Ce n'est pas la même opération.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-126",
    title: "Louer ou acheter ?",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "En France, acheter est présenté comme l'objectif normal.",
    blurbEn:
      "Buying is treated as the obvious goal in France. The arithmetic is less clear-cut than the culture suggests. (Section: Housing, 1/5.)",
    body: `En France, devenir propriétaire est largement présenté comme une évolution normale, presque une étape obligée. « Payer un loyer, c'est jeter de l'argent par les fenêtres » figure parmi les phrases les plus répétées sur le sujet.

Cette affirmation mérite d'être examinée, car elle est partiellement inexacte.

Acheter comporte des coûts que l'on oublie souvent. Les frais de notaire représentent environ sept à huit pour cent du prix dans l'ancien. S'y ajoutent la taxe foncière, les charges de copropriété, l'entretien, et surtout les intérêts d'emprunt — qui constituent, dans les premières années, la majorité des mensualités.

Ces sommes ne sont pas récupérées. Elles sont, elles aussi, dépensées.

Le calcul dépend donc de plusieurs facteurs : la durée pendant laquelle on reste dans le logement, l'évolution des prix, l'écart entre le loyer et la mensualité, et le taux d'emprunt.

La durée est le facteur décisif. En dessous de cinq à sept ans, l'achat est fréquemment défavorable, car les frais initiaux n'ont pas eu le temps d'être amortis.

Il existe pourtant de bons arguments en faveur de l'achat, qui ne sont pas seulement financiers. La stabilité : on ne peut pas être contraint de partir. La liberté d'aménager. Et surtout, la perspective de la retraite, période où l'absence de loyer change considérablement le niveau de vie.

Inversement, la location offre une mobilité réelle, précieuse dans un marché du travail où l'on change souvent d'emploi et de ville.

Le débat est donc mal posé lorsqu'il oppose un choix intelligent à un choix stupide.

La vraie question est simple : combien de temps compte-t-on rester ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-127",
    title: "La colocation entre générations",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Un étudiant loge chez une personne âgée, en échange de présence.",
    blurbEn:
      "Students housed by older people in exchange for company: a scheme that answers two problems at once, when it is properly organised. (Section: Housing, 2/5.)",
    body: `Il existe un dispositif qui répond simultanément à deux problèmes distincts : le logement étudiant, cher et rare dans les grandes villes, et l'isolement des personnes âgées vivant seules dans des logements devenus trop grands.

Le principe de la cohabitation intergénérationnelle est simple. Un étudiant est logé chez une personne âgée pour un loyer très réduit, parfois nul, en échange d'une présence régulière et de menus services : partager quelques repas, être là le soir, aider pour les courses ou un appareil.

Il ne s'agit pas d'un emploi d'aide à domicile. L'étudiant n'assure aucun soin médical ni aucune tâche lourde, et c'est une distinction essentielle, régulièrement rappelée par les associations qui organisent ces binômes.

Ces associations jouent d'ailleurs un rôle déterminant. Elles vérifient les logements, rencontrent les deux parties, établissent une convention écrite précisant les engagements, et interviennent en cas de difficulté.

Les expériences menées sans cadre échouent beaucoup plus souvent : les attentes implicites divergent, personne n'ose en parler, et la situation se dégrade.

Les retours des participants sont majoritairement positifs, avec un point commun : les bénéfices ne sont pas ceux qu'on attendait. Les étudiants évoquent moins l'économie de loyer que les conversations. Les personnes âgées évoquent moins la sécurité que le fait d'avoir quelqu'un à qui raconter sa journée.

Le dispositif reste modeste en nombre, limité par la logistique et par la réticence, compréhensible, à faire entrer un inconnu chez soi.

Mais il illustre une idée utile.

Certains problèmes sociaux ne se résolvent pas séparément.

Ils se résolvent en les mettant en présence.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-128",
    title: "Vivre dans un petit logement",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "La surface moyenne par habitant a cessé d'augmenter dans les grandes villes.",
    blurbEn:
      "Small flats are a fact of urban life. What actually makes them liveable is less about square metres than about light, storage and layout. (Section: Housing, 3/5.)",
    body: `Dans les grandes villes, la surface disponible par habitant a cessé de progresser, et elle recule même dans certains centres. Les logements y sont plus petits que la moyenne nationale, et les studios très compacts se sont multipliés.

Il existe une surface minimale légale pour une location, mais cette limite reste basse, et le débat ne porte pas seulement sur les mètres carrés.

Les études sur le confort du logement identifient en effet d'autres facteurs, souvent plus déterminants que la surface.

La lumière naturelle arrive en tête. Un logement petit mais lumineux est presque toujours mieux vécu qu'un logement plus grand et sombre. L'orientation et la taille des fenêtres pèsent lourd sur le sentiment d'enfermement.

Le rangement vient ensuite. Ce qui rend un petit logement invivable, ce n'est pas sa taille mais l'encombrement. Sans espace de stockage, les objets occupent le sol, et la surface utile disparaît.

La séparation des usages compte également. Pouvoir dormir ailleurs que là où l'on travaille, même par une simple cloison ou un rideau, change nettement la qualité de vie — un constat devenu évident avec le télétravail.

Le bruit, enfin, est déterminant. Une isolation phonique médiocre annule presque tous les autres avantages.

Ces éléments sont connus des architectes, mais ils sont fréquemment sacrifiés dans les opérations où le prix au mètre carré prime.

Vivre à l'étroit n'est donc pas nécessairement mal vivre.

Cela dépend surtout de choix de conception qui ne coûtent pas grand-chose au moment de la construction.

Et beaucoup, ensuite, à ceux qui y habitent.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-129",
    title: "Rénover une vieille maison",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Le budget prévu est presque toujours dépassé.",
    blurbEn:
      "Renovating an old house almost always costs more and takes longer than planned. Why that happens so consistently, and what reduces the risk. (Section: Housing, 4/5.)",
    body: `Il existe une régularité si constante qu'elle en devient une règle : une rénovation coûte plus cher et dure plus longtemps que prévu.

Ce n'est pas une question d'incompétence. Le phénomène a des causes structurelles.

La première est l'invisible. Dans une maison ancienne, on ne découvre l'état réel des murs, des planchers et des réseaux qu'en ouvrant. Un devis établi avant travaux repose donc partiellement sur des hypothèses, et les mauvaises surprises sont fréquentes : humidité, charpente attaquée, électricité non conforme.

La deuxième est l'enchaînement des décisions. Refaire l'électricité suppose d'ouvrir les murs ; puisque les murs sont ouverts, il devient absurde de ne pas isoler ; l'isolation modifie l'épaisseur, donc les menuiseries. Chaque décision en appelle une autre, et le projet grossit sans qu'aucune étape ne soit déraisonnable.

La troisième est l'ordre des travaux. Beaucoup de particuliers commencent par ce qui se voit — la cuisine, la peinture — et découvrent ensuite qu'il faut tout défaire pour traiter la toiture ou l'humidité. L'ordre correct est constant : d'abord le clos et le couvert, puis les réseaux, puis l'isolation, et seulement ensuite les finitions.

Les personnes qui s'en sortent le mieux appliquent généralement deux principes.

Elles prévoient une réserve financière d'environ vingt pour cent, considérée comme faisant partie du budget et non comme un dépassement.

Et elles font établir un diagnostic sérieux avant d'acheter, pas après.

Un ami m'a résumé son chantier ainsi, deux ans après :

« Ce n'est pas que j'avais mal calculé. »

« C'est que je ne savais pas encore ce que j'achetais. »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-130",
    title: "À quoi sert le logement social ?",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Un logement social sur deux est occupé par un ménage salarié.",
    blurbEn:
      "Social housing in France covers far more people than the stereotype suggests. Who lives there, how it is allocated, and why waiting lists are long. (Section: Housing, 5/5.)",
    body: `Le logement social occupe une place importante en France : il représente environ un logement sur six, et loge plusieurs millions de personnes.

Il fait l'objet de représentations souvent éloignées de la réalité.

La première concerne les habitants. Contrairement à une idée répandue, le logement social ne s'adresse pas uniquement aux personnes sans emploi. Les plafonds de ressources sont fixés de telle sorte qu'une part importante de la population y est éligible, et une majorité de locataires occupent un emploi. On y trouve des infirmiers, des employés, des enseignants — c'est-à-dire des métiers indispensables au fonctionnement des villes où se loger est devenu difficile.

La deuxième concerne l'attribution. Elle ne dépend pas d'une décision individuelle mais de commissions, qui examinent les dossiers selon des critères : composition du foyer, ressources, ancienneté de la demande, situations prioritaires.

Les délais d'attente sont longs, particulièrement dans les zones tendues, où ils se comptent en années. La raison est arithmétique : le nombre de demandes dépasse largement le nombre de logements qui se libèrent chaque année.

La construction, elle, se heurte à plusieurs obstacles : le coût du foncier, la durée des procédures, et parfois l'opposition locale à des projets pourtant approuvés dans le principe.

Ce dernier point est révélateur. Le logement social bénéficie d'un soutien large en théorie et rencontre des résistances précises en pratique, quartier par quartier.

La question posée n'est donc pas seulement technique ou budgétaire.

Elle est de savoir si les personnes qui font fonctionner une ville doivent pouvoir y habiter.

La réponse paraît évidente jusqu'au moment où il faut décider où construire.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-131",
    title: "À quoi sert vraiment l'école ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "L'école transmet des savoirs, mais pas seulement.",
    blurbEn:
      "School teaches knowledge, but that was never its only job. A look at the functions we rarely name — and the tension between them. (Section: Education, 1/5.)",
    body: `On répond souvent à la question « à quoi sert l'école ? » par une évidence : transmettre des connaissances. La réponse est juste, mais incomplète, car l'école remplit plusieurs fonctions à la fois, qui ne s'accordent pas toujours.

La première est effectivement la transmission des savoirs : lire, écrire, compter, comprendre le monde. C'est la mission la plus visible.

La deuxième est la socialisation. À l'école, un enfant apprend à vivre avec des personnes qu'il n'a pas choisies, à respecter des règles communes, à attendre son tour, à coopérer et à supporter le désaccord. Ces apprentissages ne figurent dans aucun programme, mais ils comptent parmi les plus durables.

La troisième fonction est plus rarement formulée : la sélection. L'école oriente, classe, distribue des diplômes qui ouvrent ou ferment des portes. Cette fonction est nécessaire — il faut bien organiser l'accès aux formations — mais elle entre parfois en tension avec les deux autres.

Cette tension est réelle. Un système obsédé par la sélection risque de réduire l'apprentissage à la performance mesurable, au détriment de la curiosité. À l'inverse, un système qui néglige l'évaluation prive les élèves de repères et peut masquer des difficultés jusqu'à ce qu'il soit trop tard.

Ce débat traverse toutes les réformes éducatives, dans tous les pays.

Il explique pourquoi ces réformes sont si difficiles : elles ne tranchent pas un problème technique, mais un désaccord sur ce que l'école doit produire en priorité.

La plupart des gens veulent, en réalité, les trois fonctions à la fois.

Le problème est qu'elles tirent parfois dans des directions opposées.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-132",
    title: "Les devoirs à la maison",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Le débat sur les devoirs revient régulièrement.",
    blurbEn:
      "Homework is defended and attacked with equal certainty. The evidence is more nuanced, and it depends heavily on age. (Section: Education, 2/5.)",
    body: `Peu de sujets scolaires divisent autant que les devoirs à la maison. Les uns y voient une école du travail personnel ; les autres, une source d'inégalités et de tensions familiales.

Les recherches sur le sujet permettent de dépasser les certitudes des deux camps, à condition de distinguer selon l'âge.

Pour les élèves de l'école primaire, les études ne montrent pas d'effet significatif des devoirs sur les résultats. Un enfant jeune apprend surtout en classe et par le jeu ; l'ajout de travail à la maison n'apporte pas grand-chose, et peut même dégrader la relation à l'école s'il génère des conflits le soir.

Pour les élèves plus âgés, en revanche, un effet positif apparaît, à condition que les devoirs restent raisonnables en durée. Au-delà d'un certain seuil, le bénéfice disparaît, voire s'inverse.

Mais l'argument le plus solide contre les devoirs n'est pas leur inefficacité : c'est leur effet sur les inégalités.

Un devoir suppose implicitement un environnement favorable : un endroit calme, un adulte disponible pour aider, parfois des ressources matérielles. Ces conditions ne sont pas également réparties. Deux enfants recevant le même devoir ne sont donc pas dans la même situation.

C'est pourquoi de nombreux établissements ont développé des dispositifs d'aide aux devoirs après la classe, précisément pour rétablir cette égalité.

Le débat, au fond, porte moins sur les devoirs eux-mêmes que sur ce qu'on attend des familles.

Un système qui repose fortement sur le travail à la maison suppose des familles disponibles et outillées.

Toutes ne le sont pas, et c'est là que le principe d'égalité se joue réellement.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-133",
    title: "Apprendre un métier par l'apprentissage",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "L'apprentissage a longtemps souffert d'une mauvaise image.",
    blurbEn:
      "Vocational apprenticeship was long seen as a second-class path in France. That perception is shifting, and the results explain why. (Section: Education, 3/5.)",
    body: `En France, l'apprentissage — cette formation qui alterne travail en entreprise et cours — a longtemps souffert d'une image dévalorisée. On l'associait à l'échec scolaire : la voie de ceux qui « ne pouvaient pas » suivre des études générales.

Cette représentation était largement injuste, et elle est en train de changer.

Le principe de l'apprentissage est ancien et efficace. L'apprenti apprend un métier en le pratiquant, aux côtés de professionnels, tout en suivant un enseignement théorique. Il est rémunéré, et l'entreprise participe à sa formation.

Les résultats, en matière d'insertion, sont souvent supérieurs à ceux des filières purement scolaires : une proportion élevée d'apprentis trouvent un emploi rapidement, parfois dans l'entreprise qui les a formés.

Plusieurs pays d'Europe, notamment l'Allemagne et la Suisse, ont fait de l'apprentissage une voie prestigieuse, choisie par de bons élèves, et non un lot de consolation. Le taux de chômage des jeunes y est structurellement plus bas.

En France, le regard évolue. Le nombre d'apprentis a fortement augmenté ces dernières années, y compris dans l'enseignement supérieur, où l'on peut désormais préparer un diplôme de niveau élevé par cette voie.

Cette évolution a des causes concrètes : des aides financières aux entreprises, mais aussi une lassitude vis-à-vis d'un modèle unique, valorisant une seule forme d'intelligence.

Car c'est peut-être là l'essentiel.

Il existe des intelligences différentes : abstraite, manuelle, relationnelle. Un système qui n'en reconnaît qu'une gaspille les autres.

Un bon plombier, un bon cuisinier, un bon électricien exercent un savoir complexe.

Le mépris qui a longtemps entouré ces métiers en dit plus long sur nous que sur eux.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-134",
    title: "Les écrans à l'école",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Les tablettes sont entrées dans les classes. Le bilan est mitigé.",
    blurbEn:
      "Digital tools entered classrooms with high hopes. The results are mixed, and some countries are quietly walking back. (Section: Education, 4/5.)",
    body: `Il y a une dizaine d'années, de nombreux pays ont massivement équipé les écoles en tablettes et en ordinateurs, avec la conviction que le numérique améliorerait les apprentissages.

Le bilan, aujourd'hui, est plus nuancé que prévu, et certains pays reviennent partiellement en arrière.

Les études disponibles suggèrent quelques constats.

Le numérique n'améliore pas automatiquement les résultats. Un outil n'enseigne pas ; c'est l'usage qui compte. Une tablette utilisée pour recopier ce qu'on écrivait sur un cahier n'apporte rien.

Certains usages sont en revanche réellement utiles : les exercices interactifs qui s'adaptent au niveau, la production de contenus par les élèves, l'accès à des ressources indisponibles autrement, l'apprentissage à distance quand la présence est impossible.

Mais des inconvénients sont également documentés. La prise de notes à la main est associée à une meilleure mémorisation que la saisie au clavier. La lecture sur écran favorise un parcours plus superficiel qu'un texte imprimé. Et l'appareil est une source permanente de distraction, difficile à contrôler.

Un autre enseignement concerne l'illusion de compétence. Les élèves qui ont grandi avec des écrans manient les applications avec aisance, mais cette aisance ne signifie pas qu'ils savent évaluer une source, protéger leurs données ou distinguer une information fiable. Ces compétences-là s'enseignent, et elles ne viennent pas d'elles-mêmes.

La conclusion qui se dégage est décevante pour ceux qui espéraient une solution simple.

Le numérique à l'école n'est ni un progrès automatique, ni un danger en soi.

C'est un outil dont tout dépend de l'usage — ce qui ramène, encore une fois, à la question de la formation des enseignants.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-135",
    title: "Le poids du diplôme en France",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "En France, le diplôme initial suit longtemps une carrière.",
    blurbEn:
      "In France the qualification you get at twenty follows you for decades. Why, and how that differs from more forgiving systems. (Section: Education, 5/5.)",
    body: `Il existe une particularité française souvent relevée par les observateurs étrangers : le poids durable du diplôme initial.

Dans beaucoup de pays, le parcours professionnel corrige progressivement le point de départ. Ce que l'on a fait compte davantage que l'école fréquentée à vingt ans. En France, le diplôme d'origine, et surtout l'établissement où il a été obtenu, continue de peser des décennies plus tard.

Ce système a une logique. Il repose sur l'idée d'un concours équitable, où le mérite scolaire ouvre l'accès à des positions. Il a permis, à certaines époques, une réelle mobilité sociale : des enfants d'origine modeste ont accédé, par l'école, à des fonctions élevées.

Mais il présente aussi des effets pervers, aujourd'hui bien identifiés.

Le premier est la difficulté du second départ. Celui qui a mal choisi, échoué, ou simplement mûri tard, traîne longtemps ce démarrage. Reprendre des études plus tard reste possible, mais le système valorise moins ces parcours.

Le second est une forme d'assignation. La réussite scolaire à seize ans dépend fortement du milieu d'origine. Un système qui fige tôt tend donc à reproduire les inégalités qu'il prétend corriger.

Le troisième est un rapport tendu à l'échec, qui rejoint la culture de la note. Se tromper de voie y est vécu comme une faute presque définitive, alors qu'ailleurs c'est une étape.

Les choses évoluent lentement : la formation continue se développe, les reconversions se banalisent, et le diplôme perd un peu de son pouvoir absolu.

Mais l'idée reste ancrée.

Dans un entretien d'embauche, en France, on demande encore fréquemment ce que le candidat a étudié il y a vingt-cinq ans.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-136",
    title: "Pourquoi le ciel change de couleur",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Le ciel n'est pas bleu par hasard, et rouge le soir non plus.",
    blurbEn:
      "The blue of the day and the red of sunset come from the same simple physics. Understanding it explains a surprising amount. (Section: Everyday science, 1/5.)",
    body: `Le ciel est bleu le jour et souvent rouge ou orange au coucher du soleil. Ces deux phénomènes, qui semblent séparés, viennent en réalité de la même cause.

La lumière du soleil paraît blanche, mais elle est composée de toutes les couleurs. Chaque couleur correspond à une longueur d'onde différente : le bleu et le violet sont courts, le rouge est long.

Quand cette lumière traverse l'atmosphère, elle rencontre d'innombrables molécules d'air. Celles-ci dévient la lumière, et ce phénomène de dispersion n'affecte pas toutes les couleurs de la même façon : les couleurs courtes, comme le bleu, sont beaucoup plus dispersées que les couleurs longues.

Résultat, en pleine journée : le bleu est renvoyé dans toutes les directions du ciel, si bien qu'en levant les yeux, on le voit partout. Le violet est encore plus dispersé, mais notre œil y est moins sensible et une partie est absorbée en haute atmosphère.

Le soir, la situation change. Le soleil est bas, et sa lumière traverse une épaisseur d'atmosphère bien plus grande. Sur ce long trajet, le bleu est dispersé si tôt qu'il n'atteint plus nos yeux directement. Ne restent que les couleurs longues, le rouge et l'orange, d'où la couleur des couchers de soleil.

Cela explique aussi une observation courante : les couchers de soleil sont particulièrement rouges lorsque l'air contient davantage de particules — poussières, pollution, cendres.

Ce mécanisme, décrit au dix-neuvième siècle, illustre une idée intéressante.

Une couleur n'est pas seulement une propriété de la lumière.

C'est le résultat d'un trajet, et de ce qu'il a rencontré en chemin.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-137",
    title: "Pourquoi le pain lève",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Une pâte vivante travaille pendant qu'on ne la regarde pas.",
    blurbEn:
      "Bread rising is a controlled fermentation by living organisms. A little biology transforms how you cook. (Section: Everyday science, 2/5.)",
    body: `Faire du pain semble simple : de la farine, de l'eau, du sel, de la levure. Pourtant, entre ces ingrédients et une belle miche, il se produit un phénomène biologique remarquable.

La levure est un organisme vivant : un champignon microscopique. Lorsqu'on la mélange à une pâte, elle trouve de quoi se nourrir dans les sucres de la farine. En les consommant, elle produit du gaz — du dioxyde de carbone — ainsi que de petites quantités d'alcool.

C'est ce gaz qui fait lever la pâte. Emprisonné dans le réseau formé par les protéines de la farine — le gluten —, il gonfle la masse comme des milliers de minuscules bulles. Sans gluten, le gaz s'échapperait et le pain resterait plat, ce qui explique pourquoi les pains sans gluten sont plus difficiles à faire lever.

Le temps et la température jouent un rôle décisif. Au chaud, la levure travaille vite ; au froid, lentement. C'est pourquoi de nombreux boulangers laissent reposer leur pâte au réfrigérateur toute une nuit : une fermentation lente développe davantage d'arômes.

À la cuisson, la chaleur provoque une dernière poussée du gaz, puis fixe la structure et tue la levure. L'alcool, lui, s'évapore.

Le levain, plus ancien que la levure de boulanger, repose sur le même principe, mais avec un mélange naturel de micro-organismes capturés dans l'air et la farine. Il donne un goût plus acide et une meilleure conservation.

Comprendre cela change la façon de cuisiner.

On cesse de suivre une recette à l'aveugle.

On commence à travailler avec un organisme vivant, qui a ses préférences et son rythme.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-138",
    title: "Pourquoi nous avons le hoquet",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Le hoquet est inutile, et personne n'en connaît la fonction.",
    blurbEn:
      "Hiccups serve no known purpose, and the many folk cures work — or don't — for one underlying reason. (Section: Everyday science, 3/5.)",
    body: `Le hoquet est un phénomène banal, un peu ridicule, et scientifiquement plus mystérieux qu'on ne l'imagine.

Il résulte d'une contraction brusque et involontaire du diaphragme, ce grand muscle situé sous les poumons qui commande la respiration. Cette contraction provoque une inspiration soudaine, immédiatement stoppée par la fermeture rapide de la gorge — d'où le petit bruit caractéristique.

La plupart des épisodes sont bénins et déclenchés par des causes identifiables : manger trop vite, boire des boissons gazeuses, un changement brusque de température, parfois une émotion.

La vraie question est ailleurs : à quoi sert le hoquet ? Et la réponse honnête est qu'on l'ignore. Contrairement à la toux ou à l'éternuement, qui protègent l'organisme, le hoquet ne semble avoir aucune fonction utile. Certains chercheurs y voient un vestige de notre lointaine histoire évolutive, sans usage actuel.

Il existe d'innombrables remèdes populaires : retenir sa respiration, boire de l'eau à l'envers, se faire surprendre. Fait intéressant, beaucoup fonctionnent réellement, mais pour une raison commune.

Le hoquet est entretenu par un réflexe. Or plusieurs de ces méthodes agissent sur le même mécanisme : elles augmentent le taux de dioxyde de carbone dans le sang, ou elles stimulent des nerfs qui interrompent le cycle. Retenir sa respiration fait les deux à la fois.

Cela explique pourquoi il n'existe pas un remède unique : plusieurs voies mènent au même résultat.

Dans de très rares cas, un hoquet persiste des jours, voire des semaines, et signale alors un problème médical.

Mais pour l'immense majorité d'entre nous, il reste ce qu'il est : un rappel étrange que notre corps fait parfois des choses sans raison.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-139",
    title: "Comment fonctionne un vaccin",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Un vaccin entraîne le corps sans lui faire courir le danger.",
    blurbEn:
      "A vaccine trains the immune system using a harmless preview of a threat. The basic idea is old and surprisingly intuitive. (Section: Everyday science, 4/5.)",
    body: `La vaccination compte parmi les mesures de santé publique les plus efficaces de l'histoire. Elle a fait reculer, et parfois éliminer, des maladies qui tuaient massivement.

Son principe est ancien et, une fois expliqué, assez intuitif.

Notre corps possède un système immunitaire capable de reconnaître et de combattre les agents infectieux. Le problème est que, face à une menace inconnue, il met du temps à réagir — et pendant ce temps, la maladie peut faire des dégâts.

Mais le système immunitaire a une mémoire. Une fois qu'il a rencontré un agent, il le reconnaît et réagit beaucoup plus vite la fois suivante. C'est pourquoi on n'attrape en général qu'une seule fois certaines maladies infantiles.

Le vaccin exploite cette mémoire. Il présente au corps un aperçu inoffensif de la menace : un agent affaibli, un fragment de celui-ci, ou une instruction pour en fabriquer un morceau. Le système immunitaire s'entraîne alors, comme lors d'un exercice, sans subir la vraie maladie.

Ainsi, en cas de rencontre réelle, la défense est déjà prête.

Il existe un second effet, collectif, souvent mal compris : l'immunité de groupe. Quand une proportion suffisante d'une population est protégée, l'agent circule difficilement. Cela protège indirectement ceux qui ne peuvent pas être vaccinés — nourrissons, personnes immunodéprimées. La protection n'est donc pas seulement individuelle.

Comme tout acte médical, la vaccination comporte des effets indésirables, presque toujours bénins, à mettre en regard des risques de la maladie évitée.

Ce calcul de bénéfice et de risque est précisément ce que les autorités sanitaires évaluent avant de recommander un vaccin.

Comprendre ce principe ne remplace pas cette évaluation.

Mais il rend le débat plus clair.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-140",
    title: "Pourquoi les objets flottent",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Un bateau d'acier flotte, un clou d'acier coule. Pourquoi ?",
    blurbEn:
      "A steel ship floats while a steel nail sinks. The answer is one of the most useful ideas in physics. (Section: Everyday science, 5/5.)",
    body: `Voici une énigme apparente : un clou en acier coule immédiatement, mais un navire de plusieurs milliers de tonnes, fait du même acier, flotte. Comment est-ce possible ?

La réponse tient à un principe découvert dans l'Antiquité par Archimède, et il est plus simple qu'il n'y paraît.

Lorsqu'un objet est plongé dans l'eau, il pousse l'eau et prend sa place. En retour, l'eau exerce sur lui une force qui le pousse vers le haut. Cette force est égale au poids de l'eau déplacée.

Un objet flotte donc si le poids de l'eau qu'il déplace est supérieur ou égal à son propre poids.

Ce qui compte n'est pas le matériau en lui-même, mais le rapport entre le poids et le volume — ce qu'on appelle la densité.

Le clou est petit et dense : il déplace très peu d'eau, dont le poids est inférieur au sien. Il coule.

Le navire, lui, n'est pas un bloc plein d'acier. C'est une coque, remplie surtout d'air. Son volume est énorme par rapport à sa masse. Il déplace donc une quantité d'eau considérable, dont le poids dépasse le sien. Il flotte.

C'est aussi pourquoi un navire s'enfonce davantage lorsqu'il est chargé : il lui faut déplacer plus d'eau pour équilibrer le poids supplémentaire.

Ce principe explique une multitude de phénomènes quotidiens : pourquoi on flotte mieux dans l'eau de mer, plus dense que l'eau douce ; pourquoi un ballon rempli d'un gaz léger s'élève dans l'air, qui obéit à la même logique.

Une idée vieille de plus de deux mille ans continue ainsi de faire naviguer nos plus grands navires.

La science ne vieillit pas comme les techniques.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-141",
    title: "Pourquoi étudier l'histoire",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "« L'histoire ne sert à rien », dit-on parfois. C'est faux.",
    blurbEn:
      "History is often dismissed as useless memorising of dates. Its real value is a way of thinking that applies far beyond the past. (Section: History and memory, 1/5.)",
    body: `« À quoi sert l'histoire ? On ne peut pas changer le passé. » Cette objection paraît solide. Elle repose pourtant sur une idée fausse de ce qu'est l'histoire.

Étudier l'histoire, ce n'est pas mémoriser des dates. C'est apprendre une façon de raisonner, et cette façon s'applique bien au-delà du passé.

L'historien travaille sur des sources : des documents, des témoignages, des objets. Chaque source a un auteur, une intention, des limites. Un même événement est raconté différemment selon celui qui l'écrit. Le métier consiste précisément à confronter ces récits, à repérer les silences, à distinguer un fait d'une opinion.

Or c'est exactement ce que nous devons faire chaque jour face à l'information. Qui parle ? Dans quel intérêt ? Que ne dit-on pas ? La méthode historique est, en réalité, une éducation à l'esprit critique.

L'histoire enseigne aussi la complexité. Les événements ont plusieurs causes ; les acteurs ne sont ni entièrement bons ni entièrement mauvais ; une décision qui semble évidente aujourd'hui ne l'était pas sur le moment, avec les informations de l'époque. Cette prudence est précieuse à une époque qui aime les explications simples.

Elle rend enfin plus humble. En voyant combien de sociétés ont cru détenir une vérité définitive, on relativise ses propres certitudes.

Il existe une phrase souvent citée : « ceux qui ignorent l'histoire sont condamnés à la répéter ». Elle est en partie vraie, mais un peu naïve : l'histoire ne se répète jamais à l'identique.

Son utilité est plus subtile.

Elle ne prédit pas l'avenir.

Elle apprend à ne pas croire le premier récit venu.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-142",
    title: "Les monuments aux morts",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Presque chaque village français possède un monument aux morts.",
    blurbEn:
      "Almost every French village has a war memorial. Their near-universal presence tells a story about a whole generation. (Section: History and memory, 2/5.)",
    body: `Il est presque impossible de traverser un village français sans rencontrer un monument aux morts. On en compte des dizaines de milliers. Cette présence, si banale qu'on n'y prête plus attention, mérite qu'on s'y arrête.

La grande majorité de ces monuments ont été érigés après la Première Guerre mondiale, entre 1920 et 1925. Ils portent les noms des habitants de la commune tués pendant le conflit.

Ce qui frappe, quand on lit ces listes, c'est leur longueur, y compris dans de tout petits villages. Certaines communes de quelques centaines d'habitants comptent plusieurs dizaines de noms. On y trouve souvent le même nom de famille répété : des frères, des cousins, tombés à quelques mois d'intervalle.

Cette guerre a tué environ un million et demi de soldats français, dans un pays de quarante millions d'habitants. Presque chaque famille a été touchée. C'est ce qui explique l'élan qui a conduit tant de communes, même les plus modestes, à construire un monument.

Ces monuments ne sont pas seulement des listes. Ils portent des messages qui révèlent l'état d'esprit de l'époque : la fierté patriotique, mais aussi, sur certains, le refus de la guerre, plus rare et plus courageux.

Chaque 11 novembre, une cérémonie s'y déroule. Elle attire aujourd'hui moins de monde qu'autrefois, à mesure que s'éloigne le souvenir direct.

Se pose alors une question : que transmettre quand il n'y a plus de témoins ?

Les derniers combattants de cette guerre sont morts depuis longtemps.

Restent les pierres, et les noms gravés dessus.

Les lire à voix haute, une fois, suffit souvent à comprendre pourquoi ces monuments existent.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-143",
    title: "Comment on écrit l'histoire",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "L'histoire qu'on enseigne change au fil du temps.",
    blurbEn:
      "The history taught in schools is not fixed: it shifts as new questions are asked and new voices are included. That is a strength, not a weakness. (Section: History and memory, 3/5.)",
    body: `Beaucoup de gens imaginent l'histoire comme un ensemble de faits établis une fois pour toutes. La réalité est différente : l'histoire enseignée évolue, et cette évolution n'est pas un défaut, mais le signe d'une discipline vivante.

Ce changement a plusieurs sources.

La première est la découverte de nouvelles sources. Des archives s'ouvrent après des décennies de fermeture ; des documents réapparaissent ; les techniques progressent, permettant de dater ou d'analyser ce qu'on ne pouvait pas examiner auparavant.

La deuxième, plus profonde, est le changement des questions posées. Longtemps, l'histoire s'est concentrée sur les rois, les batailles, les grands hommes. Au vingtième siècle, des historiens ont commencé à s'intéresser à la vie des gens ordinaires : comment ils mangeaient, travaillaient, mouraient. Cette histoire du quotidien n'existait pas avant qu'on décide de la chercher.

Plus récemment, d'autres voix ont été intégrées : celles des femmes, largement absentes des récits anciens, celles des colonisés, celles des vaincus.

Ce processus est parfois mal compris. On y voit une « réécriture » suspecte, comme si l'on manipulait le passé. C'est confondre deux choses.

Falsifier des faits est une faute. Poser de nouvelles questions sur les mêmes faits est le travail normal de la discipline.

Un exemple : les faits de la conquête coloniale sont largement connus. Mais les raconter du point de vue des colonisateurs ou de celui des colonisés donne deux histoires différentes, toutes deux fondées sur des sources.

L'histoire n'est donc jamais entièrement neutre.

Ce qui la rend fiable n'est pas l'absence de point de vue.

C'est la méthode, et la possibilité de vérifier.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-144",
    title: "Les objets racontent le passé",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Un objet ordinaire en dit parfois plus qu'un texte officiel.",
    blurbEn:
      "An ordinary object — a cooking pot, a shoe, a coin — can reveal how people actually lived in ways that official documents cannot. (Section: History and memory, 4/5.)",
    body: `Quand on pense à l'histoire, on pense d'abord aux textes : des lois, des lettres, des récits. Pourtant, les objets ordinaires racontent parfois le passé mieux que les documents officiels.

La raison est simple. Un document est écrit par quelqu'un, avec une intention, souvent par les puissants et pour eux. Un objet du quotidien, lui, n'a pas été fabriqué pour transmettre un message. Il témoigne sans le vouloir, et c'est précisément ce qui le rend précieux.

Une simple marmite renseigne sur ce qu'on mangeait, comment on cuisinait, quelles ressources on avait. Une chaussure indique la taille des gens, leur métier, la distance qu'ils parcouraient. Une pièce de monnaie révèle les échanges, les images qu'un pouvoir voulait diffuser, l'étendue d'un commerce.

L'archéologie repose entièrement sur cette idée. En fouillant les traces matérielles, elle reconstitue des sociétés entières qui n'ont laissé aucun écrit, ou dont les écrits ont disparu.

Ces objets corrigent souvent les récits officiels. Les textes anciens parlent des rois et des guerres ; les fouilles révèlent la vie des paysans, l'alimentation réelle, les maladies, l'espérance de vie. On y découvre parfois que la vie quotidienne différait beaucoup de l'image qu'en donnaient les documents.

C'est aussi pourquoi ce que nous jetons aujourd'hui intéressera les historiens de demain. Nos déchets, nos emballages, nos objets banals raconteront notre époque plus fidèlement que nos discours.

Un archéologue l'a joliment formulé.

Les gens mentent dans leurs écrits.

Ils mentent rarement dans leurs poubelles.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-145",
    title: "La mémoire des familles",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Chaque famille a ses histoires, transmises et déformées.",
    blurbEn:
      "Family stories are history's smallest unit — passed down, embellished, and lost within three generations unless someone writes them down. (Section: History and memory, 5/5.)",
    body: `Il existe une forme d'histoire à laquelle nous participons tous sans y penser : la mémoire familiale. Ces récits transmis à table, ces photos sans légende, ces objets qu'on garde sans savoir pourquoi.

Cette mémoire est fragile, et elle obéit à une règle assez constante : elle disparaît vite. Les chercheurs qui étudient la transmission familiale constatent que, dans la plupart des familles, le souvenir concret s'efface au bout de trois générations.

Nous connaissons souvent bien nos parents, un peu nos grands-parents, et presque rien de nos arrière-grands-parents. Leurs noms subsistent parfois, mais leur voix, leur métier, leur caractère ont disparu.

Cette mémoire est aussi transformée à chaque transmission. Chaque génération sélectionne, embellit, oublie. Une histoire familiale racontée trois fois n'est plus tout à fait la même. Les défauts s'atténuent, les exploits grandissent, les épisodes gênants s'effacent.

Ce n'est pas un mensonge : c'est le fonctionnement normal de la mémoire, appliqué à un groupe.

Pourtant, cette mémoire compte. Elle donne un sentiment de continuité, une place dans une lignée. Les personnes qui connaissent leur histoire familiale traversent parfois mieux les épreuves : elles se savent partie d'une suite plus longue qu'elles-mêmes.

Ce qui la sauve de l'oubli tient à peu de choses. Poser des questions aux plus âgés tant qu'ils sont là. Enregistrer une conversation. Noter au dos des photos qui figure dessus et quand.

Ces gestes paraissent modestes.

Ils font pourtant la différence entre une personne dont on se souvient et un simple nom sur un vieux document.

La grande histoire garde les rois.

La petite histoire, il faut la garder soi-même.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-146",
    title: "Pourquoi l'art nous touche",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Un tableau, une musique peuvent nous émouvoir sans qu'on sache pourquoi.",
    blurbEn:
      "Art can move us without our understanding why. That does not mean the feeling is arbitrary — nor that knowledge spoils it. (Section: Art and music, 1/5.)",
    body: `Il arrive qu'une œuvre nous saisisse : un tableau devant lequel on s'arrête sans raison, une musique qui serre la gorge, un poème qui reste en tête. Souvent, on serait incapable d'expliquer pourquoi.

Cette émotion, apparemment mystérieuse, intéresse aussi bien les artistes que les chercheurs.

Une première réponse est que l'art travaille sur des mécanismes profonds, en partie communs à tous les humains. Certaines proportions, certains rythmes, certains contrastes produisent des effets assez constants. Ce n'est pas un hasard si des musiques de cultures très différentes utilisent des structures voisines.

Mais l'émotion artistique n'est pas seulement universelle. Elle dépend aussi de ce que nous apportons à l'œuvre : nos souvenirs, notre culture, notre état du moment. Une chanson banale peut nous bouleverser parce qu'elle est liée à un moment de notre vie. La même œuvre ne touche pas deux personnes de la même manière, ni la même personne à deux âges différents.

Se pose une question fréquente : faut-il « comprendre » l'art pour l'apprécier ? Faut-il connaître l'histoire d'un tableau, la théorie d'une musique ?

La réponse honnête est : non, ce n'est pas nécessaire, mais cela ajoute quelque chose.

On peut être ému sans rien savoir. C'est même l'expérience la plus commune. Mais connaître le contexte, les intentions, les techniques ouvre souvent des portes supplémentaires — sans annuler l'émotion première, contrairement à une crainte répandue.

Comprendre comment fonctionne un coucher de soleil n'empêche pas de le trouver beau.

Comprendre une œuvre, c'est pareil.

La connaissance ne remplace pas l'émotion.

Elle lui donne parfois plus de place.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-147",
    title: "La musique nous accompagne partout",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Nous écoutons de la musique presque en continu. Que nous fait-elle ?",
    blurbEn:
      "We listen to music almost constantly now. What that does to mood, memory and movement — and what constant listening might cost. (Section: Art and music, 2/5.)",
    body: `Pour la première fois dans l'histoire, une grande partie de l'humanité peut écouter de la musique presque sans interruption. Dans les transports, au travail, en marchant, en cuisinant, le casque sur les oreilles.

Cette omniprésence est récente. Pendant des siècles, la musique était rare : on l'entendait lors d'une fête, à l'église, quand quelqu'un jouait. L'écouter était un événement.

Que nous fait cette écoute continue ?

Ses effets positifs sont bien documentés. La musique agit sur l'humeur, souvent efficacement : une chanson entraînante peut réellement changer un état d'esprit. Elle facilite l'effort physique, ce que les sportifs connaissent bien. Elle aide à la concentration pour certaines tâches, surtout dans un environnement bruyant qu'elle vient masquer.

Elle a aussi un lien étroit avec la mémoire. Une chanson peut ramener, intact, un souvenir vieux de vingt ans. Cette propriété est utilisée en médecine : chez des personnes ayant perdu une grande partie de leurs souvenirs, une musique de jeunesse ranime parfois le regard et les mots.

Mais l'écoute permanente a peut-être un coût, moins étudié.

En remplissant chaque instant, elle supprime le silence — ces moments vides où l'esprit vagabonde, où viennent les idées. Elle transforme aussi la musique en fond sonore : à force d'écouter tout le temps, on n'écoute plus vraiment.

Certains musiciens le regrettent : leur art, conçu pour être au centre de l'attention, est devenu un décor.

Il n'y a pas de conclusion morale à en tirer.

Peut-être seulement une invitation.

Écouter, parfois, un seul morceau, sans rien faire d'autre.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-148",
    title: "Faut-il apprendre à jouer d'un instrument ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Apprendre la musique demande des années. Cela en vaut-il la peine ?",
    blurbEn:
      "Learning an instrument is slow and often abandoned. The benefits, and the reasons most people quit, are both well understood. (Section: Art and music, 3/5.)",
    body: `Beaucoup de gens ont appris un instrument enfant, puis abandonné. Beaucoup d'adultes rêvent de s'y mettre, sans oser. La question revient donc souvent : cela en vaut-il la peine ?

Les bénéfices sont réels, mais il faut les présenter honnêtement, sans exagération.

Apprendre un instrument développe la coordination, la mémoire et la capacité à maintenir son attention sur une tâche exigeante. Chez l'enfant, certaines études associent la pratique musicale à de meilleures capacités de langage, sans qu'on puisse toujours établir un lien de cause à effet — les enfants qui font de la musique diffèrent souvent par d'autres aspects.

Chez l'adulte, apprendre un instrument tardivement reste tout à fait possible, contrairement à une idée reçue. On n'atteindra peut-être pas la virtuosité, mais on peut atteindre un vrai plaisir de jeu.

Il faut aussi être franc sur la difficulté. Un instrument demande une pratique régulière, souvent quotidienne, sur des années. Les débuts sont ingrats : on produit des sons désagréables, la progression est lente, invisible sur le moment.

C'est précisément là qu'une majorité de gens abandonnent, non par manque de talent, mais par découragement, généralement dans les premiers mois.

Ceux qui persévèrent citent souvent les mêmes clés. Une pratique courte mais quotidienne vaut mieux qu'une longue séance hebdomadaire. Jouer des morceaux qu'on aime, même simplifiés, entretient la motivation mieux que des exercices arides. Et accepter d'être mauvais un certain temps est la condition de tout progrès.

Le vrai bénéfice, au fond, n'est peut-être pas mesurable.

C'est le plaisir de fabriquer soi-même de la musique, plutôt que de seulement la consommer.

Peu de gens le regrettent.

Beaucoup regrettent d'avoir arrêté.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-149",
    title: "L'art dans l'espace public",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Une statue, une fresque : qui décide de ce qu'on voit dans la rue ?",
    blurbEn:
      "Public art belongs to everyone and pleases no one entirely. The debates it provokes reveal what a community values. (Section: Art and music, 4/5.)",
    body: `L'art dans l'espace public a une particularité : personne ne l'a choisi individuellement, et tout le monde le voit. Une statue sur une place, une fresque sur un mur, une sculpture devant une gare s'imposent à tous, qu'on les aime ou non.

Cela explique pourquoi ces œuvres provoquent des débats si vifs.

Une œuvre exposée dans un musée, on peut ne pas aller la voir. Une œuvre dans la rue, on la croise chaque jour. Elle appartient à l'espace commun, et chacun se sent légitime à donner son avis — ce qui est sain.

Les controverses portent sur plusieurs plans.

Le premier est esthétique : une œuvre contemporaine installée dans un quartier ancien divise presque toujours. Certains y voient une audace bienvenue, d'autres une agression visuelle.

Le deuxième est financier : dépenser de l'argent public pour de l'art suscite la question « n'y avait-il pas plus urgent ? ». Question légitime, mais qui suppose que la beauté d'un lieu commun ne serait jamais prioritaire.

Le troisième est mémoriel, et c'est le plus vif aujourd'hui. Les statues érigées au passé honorent des personnages dont le regard porté sur eux a changé. Faut-il les retirer, les expliquer, les laisser ? Le débat oppose ceux qui veulent effacer et ceux qui veulent contextualiser.

Ces conflits, si épuisants soient-ils, ont une vertu.

Ils obligent une collectivité à se demander ce qu'elle valorise, ce dont elle veut se souvenir, ce qu'elle veut montrer d'elle-même.

Une ville sans art public serait plus tranquille.

Elle dirait aussi quelque chose de plus triste : que l'espace commun ne mérite que l'utile.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-150",
    title: "Le musée est-il ennuyeux ?",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Beaucoup de gens trouvent les musées fatigants. C'est peut-être une question de méthode.",
    blurbEn:
      "Many people find museums exhausting rather than enjoyable. The problem is usually the way we visit them, not the museums themselves. (Section: Art and music, 5/5.)",
    body: `Beaucoup de gens avouent, à voix basse, trouver les musées ennuyeux ou fatigants. Ils s'en veulent un peu, comme s'ils manquaient de culture. Le problème vient pourtant plus souvent de la façon de visiter que du musée lui-même.

L'erreur la plus répandue est de vouloir tout voir. Devant un grand musée qui expose des milliers d'œuvres, on avance de salle en salle, on regarde chaque tableau quelques secondes, et au bout de deux heures, on est épuisé sans se souvenir de rien. Les spécialistes appellent parfois cela la « fatigue muséale », et elle est bien réelle : l'attention s'effondre après un certain temps.

L'approche inverse fonctionne beaucoup mieux, et elle est presque contre-intuitive.

Choisir peu, regarder longtemps. Décider à l'avance de voir cinq ou dix œuvres, pas cent. S'asseoir devant un tableau plusieurs minutes, le laisser agir, remarquer les détails, revenir. On sort avec moins d'œuvres vues, mais avec de vrais souvenirs.

Une autre clé est le contexte. Une œuvre seule peut sembler muette ; la même œuvre, une fois qu'on connaît son histoire ou son époque, devient parlante. C'est pourquoi une visite guidée, un audioguide, ou simplement quelques lectures préalables changent radicalement l'expérience.

Enfin, il n'est pas obligatoire d'aimer. On peut regarder attentivement une œuvre, s'y intéresser, et décider qu'elle ne nous touche pas. C'est une réaction valable, bien plus honnête que l'admiration polie et distraite.

Le musée n'est pas un examen.

Personne ne vérifiera ce qu'on a retenu.

Il vaut mieux en garder trois œuvres vivantes que cent oubliées.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-151",
    title: "L'art de la conversation",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Bien parler avec quelqu'un tient surtout à savoir écouter.",
    blurbEn:
      "Good conversation is often blamed on charisma. It relies far more on a skill anyone can learn: genuine listening. (Section: Social life, 1/5.)",
    body: `On croit souvent que les bons interlocuteurs sont ceux qui parlent bien, avec aisance et esprit. L'observation dit le contraire : ce sont d'abord ceux qui savent écouter.

Cette idée paraît banale, mais elle va à l'encontre de nos réflexes.

Dans une conversation, la plupart des gens n'écoutent pas vraiment : ils attendent leur tour. Pendant que l'autre parle, ils préparent déjà leur réponse, cherchent une anecdote à raconter, guettent le moment d'intervenir. L'écoute devient une pause avant de reprendre la parole.

Les personnes avec qui l'on aime parler font autre chose. Elles posent des questions qui prolongent, plutôt que des questions qui redirigent vers elles-mêmes. Elles laissent des silences. Elles reformulent parfois ce qu'on vient de dire, ce qui prouve qu'elles ont écouté.

Un détail révélateur a été étudié : après qu'on a partagé une expérience, il existe deux réactions possibles. La première ramène à soi : « Ah, moi aussi, la dernière fois... ». La seconde reste sur l'autre : « Et qu'est-ce que tu as ressenti ? ». La première coupe le fil ; la seconde le tisse.

Ce n'est pas une question de gentillesse forcée. On peut être en désaccord, débattre vivement, tout en écoutant réellement.

Il y a aussi une part de courage. Écouter vraiment expose : on peut être touché, contredit, obligé de changer d'avis. Parler protège ; écouter ouvre.

À l'ère des conversations en ligne, où chacun publie sans se répondre, cette compétence devient rare et précieuse.

La prochaine fois, un test simple : compter combien de questions on pose sur l'autre.

Souvent, la réponse est zéro.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-152",
    title: "Recevoir des invités",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Recevoir intimide, souvent pour de mauvaises raisons.",
    blurbEn:
      "People stress about hosting for reasons that have little to do with what guests actually enjoy. What matters, and what does not. (Section: Social life, 2/5.)",
    body: `Recevoir des amis à dîner intimide beaucoup de gens. Ils repoussent, s'inquiètent du menu, de la maison, de la vaisselle. Cette anxiété repose souvent sur un malentendu : elle porte sur des choses qui comptent peu pour les invités.

Quand on interroge des gens sur les repas dont ils gardent un bon souvenir, ils évoquent rarement la complexité des plats. Ils citent l'ambiance, les conversations, le sentiment d'être bien accueillis.

Cela ne veut pas dire que la nourriture n'a aucune importance. Mais un plat simple et réussi vaut mieux qu'un plat ambitieux et raté, qui laisse d'ailleurs l'hôte tendu et absent, coincé dans sa cuisine.

Les personnes chez qui l'on aime aller partagent quelques traits.

Elles préparent l'essentiel à l'avance, pour être présentes au moment où les invités arrivent. Un hôte stressé rend ses invités mal à l'aise ; un hôte détendu les met à l'aise.

Elles assument la simplicité. Dire « j'ai fait quelque chose de facile » est plus généreux qu'un festin qui transforme le repas en démonstration.

Elles pensent aux personnes, pas seulement au repas : placer les gens de façon à ce que la conversation circule, éviter de laisser quelqu'un isolé.

En France, il existe quelques codes utiles à connaître : ne pas arriver exactement à l'heure, apporter quelque chose, ne pas se lever de table trop vite. Mais ces règles servent la même chose : le confort commun.

Le meilleur conseil est peut-être le plus libérateur.

Les invités ne viennent pas juger.

Ils viennent passer un moment avec vous.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-153",
    title: "Dire non sans se justifier",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Beaucoup de gens acceptent ce qu'ils ne veulent pas, par gêne.",
    blurbEn:
      "Saying no clearly is a social skill many never learn. The trick is refusing without over-explaining, which usually makes things worse. (Section: Social life, 3/5.)",
    body: `Il existe une petite compétence sociale que beaucoup n'ont jamais apprise : refuser clairement.

Une invitation qui ne nous tente pas, un service qu'on n'a pas le temps de rendre, une sollicitation de trop. Plutôt que de dire non, beaucoup de gens acceptent à contrecœur, ou inventent une excuse compliquée, ou promettent vaguement pour se dégager sur le moment.

Ces stratégies posent problème.

Accepter ce qu'on ne veut pas produit du ressentiment, souvent dirigé, injustement, contre celui qui a demandé. Inventer une excuse crée un risque : l'excuse peut être démentie, et il faut ensuite s'en souvenir. Promettre vaguement reporte simplement le malaise.

Le refus clair est en réalité plus respectueux. Il laisse l'autre libre de s'organiser autrement, sans faux espoir.

La difficulté principale n'est pas de dire non, mais de résister à l'envie de trop se justifier. Plus on ajoute d'explications, plus on paraît chercher une permission, et plus on ouvre la porte à la négociation.

Quelques formules simples suffisent souvent. « Merci de penser à moi, mais je ne pourrai pas. » « C'est gentil, mais je vais passer cette fois. » Ces phrases sont complètes. Elles n'ont pas besoin d'être développées.

On peut, si on le souhaite, proposer autre chose : « Pas ce soir, mais un autre jour avec plaisir. » Le refus porte alors sur la demande précise, pas sur la personne.

Ce qui surprend le plus ceux qui s'y essaient, c'est la réaction des autres.

Presque personne ne se vexe.

La plupart des gens acceptent un non honnête bien mieux qu'un oui qui traîne.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-154",
    title: "Les petites politesses du quotidien",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Tenir une porte, dire bonjour : des gestes minuscules et puissants.",
    blurbEn:
      "Tiny courtesies seem trivial, but research on daily life suggests they do real work in holding a society together. (Section: Social life, 4/5.)",
    body: `Tenir une porte, dire bonjour au chauffeur, laisser passer quelqu'un, remercier d'un signe de tête : ces gestes semblent insignifiants. Ils occupent pourtant une place plus importante qu'on ne le croit dans la qualité de la vie commune.

Les chercheurs qui étudient la vie quotidienne appellent parfois ces gestes des « micro-interactions ». Prises isolément, elles ne pèsent rien. Multipliées par des milliers chaque jour, elles composent l'atmosphère d'une ville ou d'un quartier.

Leur fonction n'est pas seulement pratique. Dire bonjour à un commerçant ne sert pas à échanger une information : cela sert à se reconnaître mutuellement comme des personnes. C'est un signal minimal, mais réel : « je te vois, tu comptes ».

L'absence de ces gestes se remarque immédiatement. Dans un lieu où personne ne se dit bonjour, où chacun regarde son téléphone, une tension diffuse s'installe, difficile à nommer.

Ces politesses ont un autre effet, mesurable celui-là : elles se propagent. Un geste de courtoisie augmente la probabilité que la personne qui en bénéficie en fasse un à son tour. À l'inverse, la grossièreté est contagieuse : quelqu'un de mal reçu tend à mal recevoir ensuite.

Il faut éviter deux excès. Le premier serait d'idéaliser un passé forcément plus poli — chaque génération croit à tort que la politesse se perd. Le second serait de mépriser ces gestes comme superficiels.

Ils ne règlent aucun grand problème.

Mais ils rendent supportable le fait de vivre à des millions au même endroit.

Une société n'est pas seulement faite de lois.

Elle est faite, aussi, de bonjours.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-155",
    title: "La solitude choisie",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Passer du temps seul n'est pas un problème à résoudre.",
    blurbEn:
      "Being alone is treated as a failure to be fixed. But chosen solitude is a resource, distinct from loneliness, and worth protecting. (Section: Social life, 5/5.)",
    body: `Dans une culture qui valorise la vie sociale, passer du temps seul est souvent perçu comme un manque, voire un problème. Celui qui dîne seul au restaurant ou part en voyage sans compagnie suscite parfois une pitié discrète.

Cette confusion mérite d'être défaite, car elle mélange deux choses opposées : la solitude subie et la solitude choisie.

La solitude subie — l'isolement — est réellement nuisible. Ne pas avoir de relations, se sentir seul contre son gré, affecte la santé physique et mentale. Sur ce point, les données sont solides.

La solitude choisie est autre chose. C'est le fait de rechercher, par moments, d'être seul. Et loin d'être un signe de faiblesse, elle est une ressource.

Les moments de solitude permettent des choses que la présence des autres empêche. Réfléchir sans être interrompu. Ressentir ce qu'on ressent vraiment, sans l'ajuster au regard d'autrui. Se reposer d'un effort permanent souvent invisible : celui de tenir un rôle en société.

Les créateurs, les penseurs, mais aussi beaucoup de gens ordinaires savent qu'une part de leur meilleur travail, ou simplement de leur équilibre, dépend de ces moments seuls.

Le besoin de solitude varie fortement d'une personne à l'autre. Certains en ont besoin de beaucoup, d'autres de peu. Ni l'un ni l'autre n'est un défaut.

Le problème contemporain n'est pas l'excès de solitude, mais sa disparition. Entre le travail, la famille et les écrans, les vrais moments seuls, sans sollicitation, sont devenus rares.

Apprendre à être bien seul n'éloigne pas des autres.

C'est souvent le contraire.

On a plus à offrir quand on ne fuit pas le silence.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-156",
    title: "La mode jetable",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Nous achetons plus de vêtements que jamais, et les gardons moins longtemps.",
    blurbEn:
      "Fast fashion made clothes cheaper than ever, and disposable. The true costs are paid elsewhere — by workers, and by the planet. (Section: Consumer choices, 1/5.)",
    body: `Nous achetons aujourd'hui beaucoup plus de vêtements qu'il y a vingt ans, et nous les gardons deux fois moins longtemps. Ce modèle porte un nom : la « mode rapide ».

Son principe est simple. Au lieu de deux collections par an, les enseignes en proposent parfois plusieurs dizaines. Les prix sont très bas, la nouveauté permanente, et le vêtement devient un produit qu'on remplace plutôt qu'on entretient.

Ce modèle a rendu la mode accessible, ce qui est réel et positif : s'habiller ne coûte plus une fortune. Mais ses coûts, eux, sont simplement payés ailleurs.

Ils sont d'abord environnementaux. L'industrie textile consomme d'énormes quantités d'eau et d'énergie, et une grande partie des vêtements produits sont peu portés avant d'être jetés. Les fibres synthétiques relâchent en outre des microplastiques à chaque lavage.

Ils sont ensuite humains. Les prix très bas supposent des coûts de fabrication très bas, souvent dans des pays où les salaires et les conditions de travail sont difficiles à vérifier.

Face à cela, les réponses individuelles existent, mais il faut les présenter sans naïveté. Acheter moins et mieux, entretenir, réparer, se tourner vers l'occasion : ces gestes ont un effet, surtout multipliés.

Il faut cependant éviter deux pièges. Le premier serait de culpabiliser ceux qui n'ont pas les moyens d'acheter cher. Le second serait de croire que les seuls choix des consommateurs suffiront, alors que les décisions structurantes dépendent aussi de la réglementation.

Le vêtement le plus écologique reste, comme souvent, celui qu'on possède déjà.

Une garde-robe plus petite, mais réellement portée, coûte moins cher et pèse moins lourd.

Ce n'est pas de la privation.

C'est simplement cesser d'acheter ce qu'on ne mettra pas.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-157",
    title: "Les avis en ligne sont-ils fiables ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Nous nous fions aux étoiles et aux commentaires. À tort, parfois.",
    blurbEn:
      "Online reviews shape most of our purchases, yet they are easy to manipulate. How to read them more critically. (Section: Consumer choices, 2/5.)",
    body: `Avant d'acheter un produit, de réserver un restaurant ou de choisir un hôtel, la plupart d'entre nous consultent les avis en ligne. Ces étoiles et ces commentaires guident désormais une part énorme de nos décisions.

Le principe est excellent : mettre en commun l'expérience de nombreux clients devrait donner une information fiable, indépendante du vendeur.

En pratique, plusieurs biais compliquent la lecture.

Le premier est le biais des extrêmes. Les gens laissent plus volontiers un avis quand ils sont très mécontents ou très enthousiastes. Les expériences moyennes, pourtant les plus fréquentes, sont sous-représentées. La note reflète donc mal l'expérience typique.

Le deuxième est la manipulation. Il existe de faux avis, positifs pour gonfler un produit, négatifs pour nuire à un concurrent. Certaines entreprises en achètent. Les plateformes luttent contre ces pratiques, avec un succès inégal.

Le troisième est plus subtil : les avis anciens pèsent sur la note globale, même si le produit ou l'établissement a changé.

Quelques réflexes améliorent la lecture. Ignorer la note globale et lire plutôt les avis récents. Se méfier d'une avalanche de commentaires enthousiastes très courts et publiés en peu de temps. Chercher les critiques détaillées, qui décrivent précisément un problème : elles sont plus crédibles qu'un « nul » ou un « parfait ». Et se rappeler qu'un défaut mentionné par une personne peut être sans importance pour nous.

L'avis en ligne reste utile, à condition d'être lu comme un indice, non comme une preuve.

Un chiffre global rassure.

Trois commentaires précis renseignent davantage.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-158",
    title: "Acheter local, vraiment ?",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "« Local » n'est pas toujours synonyme de meilleur pour la planète.",
    blurbEn:
      "'Local' feels obviously greener, but the arithmetic is more complicated. Season and production method often matter more than distance. (Section: Consumer choices, 3/5.)",
    body: `« Acheter local » est devenu un conseil répandu, presque un réflexe. L'idée semble évidente : un produit qui vient de près a moins voyagé, donc moins pollué. La réalité est plus nuancée.

Les avantages du local sont réels. Il fait vivre les producteurs de la région, garantit souvent des produits plus frais, et maintient une agriculture de proximité. Ces raisons suffisent à le défendre.

Mais sur le plan strictement climatique, l'affaire se complique. Le transport ne représente en effet qu'une petite partie de l'empreinte de la plupart des aliments — souvent moins de dix pour cent. L'essentiel se joue dans la manière de produire.

Un exemple parlant : une tomate cultivée à côté de chez soi, mais sous une serre chauffée en plein hiver, peut avoir une empreinte bien supérieure à une tomate venue d'un pays ensoleillé et transportée par bateau. Le chauffage de la serre pèse davantage que le trajet.

De même, le mode de transport compte énormément. Le bateau transporte de grandes quantités pour peu d'émissions par kilo ; l'avion, à l'inverse, est catastrophique. Un produit lointain arrivé par cargo peut être plus sobre qu'un produit régional acheminé par avion.

Ce qui compte le plus, finalement, c'est la saison. La formule la plus juste tient en deux mots : local et de saison. La fraise de mai de sa région, oui ; la fraise de décembre, non, qu'elle vienne de loin ou d'une serre voisine.

Il ne s'agit donc pas de renoncer au local, qui garde de nombreuses vertus.

Il s'agit de ne pas croire qu'un seul mot sur une étiquette résout la question.

Le bon sens géographique doit s'accompagner d'un calendrier.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-159",
    title: "La publicité est partout",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Nous voyons des milliers de messages publicitaires par jour.",
    blurbEn:
      "We see thousands of ads a day and believe they don't affect us. That belief is exactly what makes advertising work. (Section: Consumer choices, 4/5.)",
    body: `Selon les estimations, une personne vivant dans une ville est exposée à plusieurs milliers de messages publicitaires par jour. Panneaux, écrans, applications, vidéos, marques sur les vêtements : la publicité occupe une part considérable de notre environnement visuel.

La plupart des gens affirment y être insensibles. « La pub ne marche pas sur moi. » C'est précisément cette conviction qui la rend efficace.

Car la publicité moderne ne cherche pas seulement à vanter un produit. Elle vise souvent quelque chose de plus discret : associer une marque à une émotion, un statut, une identité. On ne vend pas une voiture, mais la liberté ; pas une boisson, mais l'amitié.

Ce mécanisme fonctionne en dehors de la décision consciente. On n'a pas besoin de croire la publicité pour qu'elle agisse : il suffit qu'elle installe une association dans la mémoire. Au moment de choisir, une marque nous « vient » plus facilement, sans qu'on sache pourquoi.

La répétition joue un rôle central. Un message vu une fois s'oublie ; vu mille fois, il devient familier, et le cerveau confond souvent familiarité et confiance.

Reconnaître cela ne rend pas immunisé — ces mécanismes agissent même quand on les connaît. Mais quelques réflexes réduisent leur emprise.

Se demander, devant une envie soudaine, d'où elle vient. Attendre avant un achat, le temps que l'effet retombe. Utiliser des outils qui limitent la publicité en ligne. Et se méfier des contenus qui font semblant de ne pas en être : recommandations d'influenceurs, articles promotionnels.

La publicité n'est ni un complot ni une catastrophe.

C'est un environnement, et comme tout environnement, il nous façonne.

Le minimum est de savoir qu'il est là.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-160",
    title: "Le vrai coût du pas cher",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Un prix bas cache souvent un coût payé ailleurs.",
    blurbEn:
      "A low price is not the same as a low cost. Someone, or something, usually pays the difference. Learning to see it changes how we buy. (Section: Consumer choices, 5/5.)",
    body: `« C'est moins cher » est probablement l'argument de vente le plus puissant qui soit. Il paraît indiscutable : à produit égal, pourquoi payer davantage ?

La question mérite pourtant d'être retournée. Un prix bas n'est pas la même chose qu'un coût bas. Quand un produit coûte peu, la différence est presque toujours payée quelque part.

Elle peut être payée par la durée. Un objet peu cher qui casse au bout d'un an et qu'il faut remplacer trois fois revient plus cher qu'un objet solide acheté une fois. Le prix affiché ment sur le coût réel.

Elle peut être payée par quelqu'un. Un vêtement très bon marché suppose des coûts de fabrication très bas, donc des salaires très bas, quelque part, chez des gens qu'on ne voit pas.

Elle peut être payée par l'environnement. Un prix qui n'intègre ni la pollution produite ni les ressources épuisées est un prix incomplet. La nature paie la différence, et souvent une génération future avec elle.

Elle peut enfin être payée collectivement. Certaines activités très rentables pour une entreprise créent des coûts supportés par la société — soins de santé, dépollution, aides sociales.

Voir ces coûts cachés ne signifie pas qu'il faille toujours payer plus cher. Beaucoup de gens n'ont pas le choix, et culpabiliser les plus modestes serait injuste. C'est précisément pour cela que le prix ne peut pas être le seul régulateur.

Mais pour ceux qui ont une marge, la question utile change.

Non pas « combien ça coûte ? », mais « qui paie la différence ? ».

Une fois qu'on voit cette question, on ne la voit plus jamais tout à fait de la même façon.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-161",
    title: "La ville des quinze minutes",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Et si tout l'essentiel était à un quart d'heure de chez soi ?",
    blurbEn:
      "The '15-minute city' idea says daily needs should be a short walk away. Simple in principle, contested in practice. (Section: Transport and cities, 1/5.)",
    body: `Une idée urbanistique a beaucoup circulé ces dernières années : la « ville du quart d'heure ». Le principe est simple. Chacun devrait pouvoir accéder à l'essentiel de ses besoins quotidiens — commerces, école, médecin, travail, loisirs, espaces verts — en quinze minutes à pied ou à vélo.

Ce n'est pas une idée entièrement neuve. C'est, en réalité, la façon dont fonctionnaient la plupart des villes avant l'automobile. Les quartiers mêlaient logements, commerces et ateliers, et l'on vivait près de tout.

Le vingtième siècle a séparé ces fonctions. On a construit des zones d'habitation d'un côté, des zones commerciales de l'autre, des zones de bureaux ailleurs, reliées par la voiture. Cette organisation a produit de longs trajets quotidiens et une dépendance totale à l'automobile.

La ville du quart d'heure propose de recoudre ce tissu : rapprocher les fonctions, favoriser la marche et le vélo, réduire les déplacements contraints.

Les bénéfices attendus sont nombreux : moins de pollution, plus d'activité physique, des commerces de proximité qui revivent, du temps gagné.

Mais le concept fait débat, et ces critiques méritent d'être entendues.

Certains y voient une idée pensée pour les centres-villes aisés, difficile à appliquer dans des zones périphériques ou rurales où les distances sont grandes. D'autres craignent qu'elle n'accroisse les inégalités, les quartiers bien dotés devenant plus désirables et plus chers.

Il y a aussi une confusion fréquente à écarter : il ne s'agit pas d'empêcher les gens de sortir de leur quartier, mais de faire en sorte qu'ils n'y soient pas obligés pour le quotidien.

L'idée n'est donc ni une utopie ni une menace.

C'est un objectif d'aménagement, plus facile à réaliser dans certaines villes que dans d'autres.

Et une manière de reposer une vieille question : à quelle distance vit-on de sa propre vie ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-162",
    title: "Faut-il des voitures en centre-ville ?",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Réduire la place de la voiture divise fortement les habitants.",
    blurbEn:
      "Cutting car access to city centres provokes fierce opposition and, often, later approval. A look at how these changes actually unfold. (Section: Transport and cities, 2/5.)",
    body: `De nombreuses villes européennes réduisent progressivement la place de la voiture en centre-ville : rues piétonnes, zones à faibles émissions, suppression de places de stationnement au profit de pistes cyclables ou de terrasses.

Ces décisions provoquent presque toujours de vives oppositions. Il est utile de comprendre pourquoi, et ce qui se passe ensuite.

Les craintes exprimées sont réelles. Les commerçants redoutent une baisse de fréquentation, persuadés que leurs clients viennent en voiture. Les habitants des périphéries, moins bien desservis par les transports, se sentent visés. Les personnes âgées ou à mobilité réduite s'inquiètent, à juste titre, de l'accessibilité.

Ces objections ne doivent pas être balayées : une politique qui les ignore échoue et se retourne contre elle.

Pourtant, un phénomène se répète dans les villes qui ont mené ces transformations.

D'abord, les études montrent que les commerçants surestiment généralement la part de leurs clients venant en voiture ; une majorité arrive souvent à pied, à vélo ou en transports. Ensuite, une fois les aménagements réalisés et l'espace rendu agréable, la fréquentation se maintient, voire augmente. Une rue piétonne bien conçue attire du monde.

Autre constat récurrent : l'opposition est forte avant, plus faible après. Beaucoup d'habitants d'abord hostiles ne voudraient plus revenir en arrière une fois habitués.

Cela ne signifie pas que toute piétonnisation est une réussite. Mal pensée, sans transports alternatifs ni prise en compte des livraisons et de l'accessibilité, elle peut vider un quartier.

La question n'est donc pas « pour ou contre la voiture ».

Elle est : comment redistribuer un espace limité entre des usages qui se disputent chaque mètre ?

Et cette question, par nature, ne se tranche pas sans conflit.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-163",
    title: "Les transports en commun gratuits ?",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Quelques villes ont rendu leurs bus et tramways gratuits.",
    blurbEn:
      "A handful of cities have made public transport free. The results are mixed and reveal a deeper question about what transport is for. (Section: Transport and cities, 3/5.)",
    body: `Quelques villes, en France et ailleurs, ont fait un choix audacieux : rendre les transports en commun entièrement gratuits pour les usagers. L'expérience alimente un débat intéressant.

Les arguments en faveur de la gratuité sont séduisants. Elle supprime un obstacle pour les personnes à faibles revenus. Elle encourage à laisser la voiture. Elle élimine les coûts liés à la vente des tickets et au contrôle. Et elle envoie un signal : le transport public est un service essentiel, comme l'école ou l'éclairage des rues.

Les résultats observés sont cependant nuancés.

La gratuité augmente bien la fréquentation, parfois fortement. Mais une partie de cette hausse ne vient pas des automobilistes : elle vient de personnes qui marchaient ou pédalaient auparavant, et qui prennent désormais le bus. L'effet sur le trafic automobile est donc plus faible qu'espéré.

Surtout, la gratuité pose la question du financement. L'argent des tickets doit être remplacé par autre chose : impôts locaux, taxes sur les entreprises. Or ces recettes servaient souvent à améliorer le réseau. Le risque est d'obtenir un transport gratuit mais insuffisant.

Car ce qui pousse réellement les gens à abandonner la voiture, ce n'est pas d'abord le prix : c'est la qualité. Un réseau fréquent, ponctuel, qui va où l'on veut, convainc davantage qu'un réseau gratuit mais rare.

Ce constat ne condamne pas la gratuité, qui garde un sens social fort.

Il rappelle simplement une évidence souvent oubliée.

Un transport que personne ne veut prendre reste inutilisé, même gratuit.

Le vrai luxe, en matière de transport, n'est pas la gratuité.

C'est de pouvoir compter dessus.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-164",
    title: "Le bruit, une pollution oubliée",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "On s'habitue au bruit. Le corps, lui, ne s'y habitue pas.",
    blurbEn:
      "Noise is treated as a nuisance rather than a health risk, but the evidence says otherwise. Cities are beginning to take it seriously. (Section: Transport and cities, 4/5.)",
    body: `Parmi les pollutions urbaines, le bruit est probablement la plus sous-estimée. On le considère comme une gêne, un inconfort, rarement comme un problème de santé. Les données disent le contraire.

Le bruit permanent — trafic, travaux, activités — a des effets mesurables sur l'organisme, indépendamment de l'agacement qu'il provoque. Il perturbe le sommeil, même quand on croit s'y être habitué. Il maintient le corps dans un léger état d'alerte, ce qui, sur le long terme, augmente la tension et les risques cardiovasculaires.

Ce dernier point est contre-intuitif. On pense s'habituer au bruit, et c'est vrai consciemment : on cesse de le remarquer. Mais le corps, lui, continue de réagir. On peut dormir dans une rue bruyante et présenter malgré tout des micro-réveils qui dégradent la qualité du repos.

Les organisations sanitaires classent aujourd'hui le bruit parmi les facteurs environnementaux ayant un impact réel sur la santé des populations urbaines.

Les sources principales sont bien identifiées, et le trafic routier arrive largement en tête.

C'est pourquoi les mesures de réduction du bruit rejoignent souvent d'autres politiques : réduire la vitesse en ville diminue nettement le bruit ; les véhicules électriques sont plus silencieux à basse vitesse ; certains revêtements de chaussée absorbent le son.

L'aménagement joue aussi : éloigner les logements des grands axes, créer des zones calmes, protéger le silence relatif des parcs.

Le bruit a un défaut par rapport à d'autres pollutions : il est invisible et sans trace.

On ne le photographie pas, on ne le mesure pas d'un coup d'œil.

C'est peut-être pour cela qu'il a été si longtemps toléré.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-165",
    title: "Quand la voiture devient inutile",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Se passer de voiture est un choix, pas toujours possible partout.",
    blurbEn:
      "Living without a car is liberating for some and impossible for others. The difference is rarely about willpower — it is about geography. (Section: Transport and cities, 5/5.)",
    body: `Depuis quatre ans, je vis sans voiture. Quand je le dis, les réactions sont extrêmes : certains trouvent cela admirable, d'autres inimaginable. Les deux se trompent en partie, car tout dépend d'où l'on habite.

Dans mon cas, ce n'était pas un sacrifice écologique héroïque. C'était un calcul.

J'ai fait le compte de ce que me coûtait ma voiture : l'achat, l'assurance, l'entretien, le carburant, le stationnement. La somme annuelle m'a surpris. Or je vis dans une ville où le bus, le vélo et la marche suffisent pour l'essentiel, et où l'on peut louer une voiture les rares fois où c'est nécessaire.

Le calcul était vite fait : garder une voiture utilisée trois fois par mois n'avait pas de sens.

Les bénéfices ont dépassé le budget. Marcher et pédaler chaque jour a remplacé, sans effort, le sport que je ne trouvais jamais le temps de faire. Je connais mieux ma ville. Et j'ai découvert un soulagement inattendu : ne plus chercher de place, ne plus penser au contrôle technique, ne plus subir les embouteillages.

Mais je me garde d'en faire une leçon générale. Ce choix n'est possible que grâce à ma situation : une ville dense, bien desservie, un travail proche. Pour une famille en zone rurale, sans transports, avec des trajets longs et des enfants à conduire, la voiture n'est pas un luxe : c'est une nécessité.

Culpabiliser ces personnes serait injuste et absurde.

La vraie question n'est donc pas individuelle mais collective.

Elle n'est pas « pourquoi gardez-vous une voiture ? ».

Elle est : combien de gens n'ont aujourd'hui pas d'autre choix, et que fait-on pour cela ?`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-166",
    title: "Pourquoi apprendre une langue à l'âge adulte",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "On croit qu'il est trop tard. C'est faux, mais différent.",
    blurbEn:
      "Adults are told they are too old to learn a language. The truth is more encouraging, and it changes how you should go about it. (Section: Learning a language, 1/5.)",
    body: `« Je suis trop vieux pour apprendre une langue. » C'est l'une des croyances les plus répandues, et l'une des plus fausses.

Elle repose sur une observation exacte, mal interprétée. Il est vrai que les enfants acquièrent un accent parfait plus facilement, et qu'un cerveau jeune absorbe certaines choses sans effort. Mais l'accent n'est qu'une petite partie d'une langue, et le reste avantage souvent les adultes.

Un adulte comprend les structures, fait des liens avec ce qu'il sait déjà, apprend par la logique autant que par l'imitation. Il choisit ses méthodes et sait pourquoi il apprend. Ces atouts compensent largement une mémoire un peu moins souple.

Ce qui change vraiment, ce ne sont pas les capacités, mais les conditions. Un adulte a moins de temps, plus de fatigue, et surtout beaucoup plus de peur du ridicule. C'est ce dernier point, bien plus que l'âge, qui bloque la plupart des gens.

Car apprendre une langue oblige à une chose désagréable : parler mal, longtemps, devant les autres. Il faut accepter de ressembler à un enfant, de chercher ses mots, de faire des fautes. Les adultes détestent cela, précisément parce qu'ils ont l'habitude d'être compétents.

Or c'est exactement là que se joue la réussite. Ceux qui progressent ne sont pas les plus doués : ce sont ceux qui acceptent d'être mauvais assez longtemps.

Les bénéfices, eux, dépassent la langue elle-même. Voyager autrement, accéder à une culture de l'intérieur, et, selon certaines études, entretenir son cerveau.

Il n'est donc jamais trop tard.

La seule vraie question n'est pas « en suis-je capable ? ».

Elle est : « suis-je prêt à me tromper pendant un an ? »`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-167",
    title: "La régularité bat l'intensité",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Dix minutes par jour valent mieux que trois heures le dimanche.",
    blurbEn:
      "The single most reliable finding in language learning is dull but powerful: little and often beats long and rare. (Section: Learning a language, 2/5.)",
    body: `S'il fallait retenir une seule chose sur l'apprentissage d'une langue, ce serait celle-ci : la régularité bat l'intensité. Dix minutes chaque jour font plus de progrès que trois heures une fois par semaine.

Ce constat est solide, et il s'explique par le fonctionnement de la mémoire.

Après avoir appris quelque chose, on l'oublie rapidement, sauf si on le revoit avant l'oubli complet. Chaque nouvelle rencontre avec l'information ralentit l'oubli suivant. C'est le principe de la répétition espacée : revoir un mot après un jour, puis trois, puis une semaine, l'ancre durablement.

Une longue séance hebdomadaire s'oppose à cette logique. On y apprend beaucoup, puis on laisse le tout s'effacer pendant six jours. La semaine suivante, on repart presque de zéro.

À l'inverse, une courte pratique quotidienne rencontre sans cesse les mêmes éléments, juste avant qu'ils ne disparaissent. Le progrès est lent au jour le jour, mais il s'accumule.

La régularité a un second avantage, psychologique celui-là. Dix minutes sont faciles à tenir. On trouve toujours dix minutes : dans les transports, en attendant, avant de dormir. Impossible de prétendre le contraire. Trois heures, en revanche, se reportent facilement.

C'est pourquoi les applications de langue efficaces reposent toutes sur ce principe : de courtes sessions, tous les jours, avec des rappels espacés.

Cela vaut d'ailleurs bien au-delà des langues, pour n'importe quel apprentissage durable.

Le conseil paraît décevant, car il ne promet aucun raccourci.

Mais c'est justement sa force.

Il ne demande pas de la volonté héroïque.

Il demande une habitude minuscule, tenue longtemps.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-168",
    title: "Comprendre avant de parler",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "On peut comprendre beaucoup avant de savoir produire une phrase.",
    blurbEn:
      "In every language, understanding runs ahead of speaking. Accepting that gap makes learning less frustrating and more effective. (Section: Learning a language, 3/5.)",
    body: `Il existe, dans l'apprentissage de toute langue, un décalage naturel entre deux compétences : on comprend toujours plus qu'on ne sait produire.

Ce décalage se vérifie même dans notre langue maternelle. Nous comprenons des mots que nous n'employons jamais, des registres que nous ne saurions pas imiter. Comprendre est plus facile que produire.

Beaucoup d'apprenants ignorent ce phénomène, et s'en trouvent découragés. Ils se jugent nuls parce qu'ils ne parviennent pas à parler couramment, alors qu'ils comprennent déjà l'essentiel d'une conversation. Ils confondent deux niveaux qui n'avancent pas au même rythme.

Cette réalité a des conséquences pratiques.

D'abord, elle valorise l'écoute et la lecture, souvent négligées au profit de la seule expression. Écouter beaucoup, lire des textes adaptés à son niveau, construit une base solide de compréhension. Cette base finit par nourrir la production : on ne peut dire que ce qu'on a d'abord rencontré ailleurs.

C'est pourquoi lire des textes légèrement au-dessus de son niveau, avec l'aide de traductions, est l'une des méthodes les plus efficaces. On y rencontre les mots dans leur contexte, plusieurs fois, sans effort de mémorisation forcée.

Ensuite, cette réalité déculpabilise. Ne pas parler parfaitement tout en comprenant bien n'est pas un échec : c'est l'ordre normal des choses.

Il ne faut pas pour autant attendre d'être « prêt » pour parler, car on ne l'est jamais tout à fait. Comprendre prépare, mais seul l'usage active vraiment la parole.

L'ordre efficace est donc clair.

Comprendre beaucoup, tôt.

Parler imparfaitement, tôt aussi.

Et accepter que les deux ne progressent jamais à la même vitesse.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-169",
    title: "Le plaisir d'une langue étrangère",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Une langue ouvre plus qu'un moyen de communiquer.",
    blurbEn:
      "Beyond communication, a new language offers something harder to name: another way of seeing, and a second identity. (Section: Learning a language, 4/5.)",
    body: `On apprend souvent une langue pour une raison pratique : le travail, un voyage, un examen. Ce sont de bonnes raisons. Mais ceux qui vont loin découvrent généralement autre chose, plus difficile à nommer.

Une langue n'est pas seulement un code pour dire les mêmes choses autrement. Chaque langue découpe le monde à sa façon.

Certaines distinguent des couleurs que d'autres regroupent. Certaines possèdent un mot précis pour une émotion qui, ailleurs, demande une phrase entière. Le français distingue le tu et le vous, distinction qui n'existe pas en anglais et qui change subtilement chaque relation. Apprendre une langue, c'est donc découvrir des catégories qu'on n'avait pas.

Il y a aussi une expérience troublante, que rapportent beaucoup de personnes bilingues : elles ne se sentent pas tout à fait les mêmes selon la langue qu'elles parlent. Plus directes dans l'une, plus réservées dans l'autre. Comme si chaque langue activait une version légèrement différente de soi.

Ce n'est pas de la magie. Une langue est liée à une culture, à des situations, à des souvenirs. La parler, c'est entrer un peu dans ce monde.

Il y a enfin le plaisir simple, concret, du seuil franchi. Le jour où l'on comprend une blague, où l'on suit une conversation rapide, où l'on rêve dans l'autre langue. Ce moment récompense des mois d'efforts ingrats.

Ces bénéfices ne se promettent pas au début. On ne peut pas les vendre, car ils ne se révèlent qu'en chemin.

C'est peut-être pour cela qu'ils comptent.

Une langue n'ajoute pas seulement un outil à sa boîte.

Elle ajoute une fenêtre à sa maison.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-170",
    title: "Les fausses promesses des méthodes miracles",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "« Parlez couramment en trente jours. » Vraiment ?",
    blurbEn:
      "'Fluent in 30 days' sells because we want it to be true. What such promises get wrong, and what honest learning looks like. (Section: Learning a language, 5/5.)",
    body: `« Parlez anglais couramment en trente jours. » « La méthode secrète que les écoles vous cachent. » Les promesses de ce type sont partout, et elles se vendent bien, parce qu'elles répondent à un désir réel : apprendre vite et sans effort.

Elles reposent pourtant sur un mensonge, ou du moins sur une imprécision soigneusement entretenue.

Le premier problème est le mot « couramment ». Il n'a pas de définition claire. Commander un café et débattre de philosophie sont deux niveaux séparés par des années. Une méthode peut vous rendre capable de dire quelques phrases en un mois — c'est vrai — puis appeler cela « couramment ».

Le deuxième problème est l'effacement du temps réel. Toutes les estimations sérieuses convergent : atteindre un niveau conversationnel dans une langue demande des centaines d'heures de pratique. Aucune méthode ne supprime ces heures. Certaines les rendent plus efficaces ou plus agréables, ce qui est déjà précieux, mais aucune ne les remplace.

Cela ne veut pas dire que toutes les méthodes se valent. De vraies différences existent. Les approches qui font parler tôt, qui exposent à la langue réelle, qui reposent sur la répétition espacée, fonctionnent mieux que la mémorisation de listes ou la grammaire abstraite.

Mais la meilleure méthode reste, de loin, celle qu'on utilise vraiment. Une application parfaite abandonnée au bout de deux semaines vaut moins qu'une méthode médiocre pratiquée un an.

Le vrai secret, s'il en existe un, est décevant de banalité.

Un peu, chaque jour, longtemps, avec du contact réel avec la langue.

Ce n'est pas vendeur.

C'est simplement ce qui marche.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-171",
    title: "Chaque génération critique la suivante",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "« Les jeunes d'aujourd'hui... » est une phrase très ancienne.",
    blurbEn:
      "Every generation complains about the next in almost identical words. Understanding why is a useful cure for a tired argument. (Section: Generations, 1/5.)",
    body: `« Les jeunes d'aujourd'hui ne respectent plus rien. » « Ils sont paresseux, individualistes, accros à leurs écrans. » Ces phrases semblent décrire notre époque. On en trouve pourtant des équivalents dans des textes vieux de plusieurs siècles, parfois de l'Antiquité.

Cette continuité est frappante, et elle mérite réflexion. Si chaque génération dégénérait vraiment, comme le prétendent ces plaintes, l'humanité serait depuis longtemps au fond du gouffre. Ce n'est manifestement pas le cas.

Alors pourquoi cette critique se répète-t-elle, presque à l'identique ?

Plusieurs mécanismes se combinent.

Le premier est un effet de mémoire. En vieillissant, on se souvient de sa propre jeunesse de façon sélective, en oubliant ses excès. On compare donc une jeunesse idéalisée à une jeunesse réelle, ce qui est injuste par construction.

Le deuxième est le malentendu des nouveaux usages. Chaque génération grandit avec des outils que la précédente ne maîtrise pas. Ces outils paraissent futiles ou dangereux à ceux qui ne les ont pas intégrés. On a dit du roman, puis du cinéma, puis de la télévision qu'ils abrutiraient la jeunesse.

Le troisième est plus profond : la difficulté d'accepter que le monde change et nous échappe. Critiquer les jeunes, c'est parfois refuser de vieillir.

Rien de tout cela ne signifie qu'aucune évolution n'est préoccupante. Certaines le sont réellement, et il faut pouvoir en parler. Mais il faut les distinguer de la plainte automatique.

Le bon réflexe, face à un « c'était mieux avant », est de se demander : est-ce un vrai problème observé, ou le refrain que chaque génération chante en vieillissant ?

Souvent, c'est le refrain.

Et un jour, ce sont les jeunes critiqués qui le chanteront à leur tour.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-172",
    title: "Quand les grands-parents gardent les enfants",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "Beaucoup de familles reposent sur l'aide des grands-parents.",
    blurbEn:
      "Grandparents provide an enormous, unpaid share of childcare. It benefits everyone — and works best when its limits are agreed. (Section: Generations, 2/5.)",
    body: `Dans de nombreuses familles, les grands-parents jouent un rôle essentiel dans la garde des enfants. Aller chercher à l'école, garder le mercredi, dépanner quand un enfant est malade : cette aide, largement invisible, représente une contribution énorme, non rémunérée.

Sans elle, beaucoup de parents ne pourraient tout simplement pas travailler, tant les modes de garde sont chers ou rares.

Cette solidarité entre générations a des bénéfices pour tout le monde.

Pour les parents, c'est un soutien matériel et une tranquillité : confier son enfant à quelqu'un de confiance n'a pas de prix. Pour les enfants, c'est une relation supplémentaire, différente de celle des parents, souvent plus patiente, porteuse de récits et de mémoire familiale. Pour les grands-parents eux-mêmes, c'est un rôle, un lien, une utilité — trois choses qui protègent contre l'isolement de l'âge.

Mais cette aide connaît aussi des tensions, généralement tues.

Les méthodes d'éducation ont changé d'une génération à l'autre : le sucre, les écrans, les règles, la discipline. Les grands-parents appliquent parfois leurs habitudes, les parents s'en agacent, et personne n'ose en parler franchement pour ne pas blesser.

Il y a aussi la question des limites. Certains grands-parents se sentent obligés, au point d'y sacrifier leur propre repos ou leurs projets. La retraite tant attendue se remplit d'obligations. Là encore, le non-dit domine.

Les familles qui vivent bien cette organisation partagent une chose : elles en parlent explicitement. Combien de jours, quelles règles, comment dire non sans culpabilité.

Cette aide n'est pas un dû.

C'est un cadeau, immense, qui mérite d'être nommé comme tel — et discuté comme tel.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-173",
    title: "Le fossé numérique entre les âges",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Les plus jeunes et les plus âgés n'habitent pas le même monde numérique.",
    blurbEn:
      "The digital gap between generations is real but more nuanced than the stereotype. Skill and comfort do not always follow age. (Section: Generations, 3/5.)",
    body: `On oppose souvent deux figures : les jeunes, à l'aise avec le numérique, et les personnes âgées, dépassées. Cette image contient une part de vérité, mais elle est plus nuancée qu'il n'y paraît.

Il est exact que les personnes âgées rencontrent davantage de difficultés avec les démarches en ligne, les applications, les nouveaux appareils. Une part importante d'entre elles renoncent à des services devenus exclusivement numériques. C'est un vrai problème d'accès aux droits.

Mais deux idées reçues doivent être corrigées.

La première est que les jeunes maîtriseraient naturellement le numérique. Ils savent utiliser des applications avec aisance, c'est vrai. Mais utiliser n'est pas comprendre. Beaucoup de jeunes ne savent pas évaluer la fiabilité d'une source, protéger leurs données, ou remplir un dossier administratif complexe — qui suppose de la lecture attentive plus que de la dextérité. Leur aisance est réelle sur le divertissement, plus fragile sur le reste.

La seconde est que l'âge expliquerait tout. En réalité, le facteur décisif n'est pas seulement l'âge, mais l'exposition et la nécessité. Un retraité qui utilise l'ordinateur pour son travail toute sa vie reste souvent à l'aise ; un jeune sans équipement à la maison peut être en difficulté.

Ce qui aide vraiment à réduire ce fossé n'est pas de fournir des appareils, mais de l'accompagnement humain : quelqu'un de patient, disponible, qui montre sans juger.

Les dispositifs qui fonctionnent le mieux reposent d'ailleurs souvent sur les liens entre générations : des jeunes qui aident des personnes âgées, ou l'inverse pour d'autres compétences.

Le fossé numérique n'est donc pas une fatalité liée à l'âge.

C'est surtout un manque d'accompagnement.

Et l'accompagnement, contrairement à la technologie, ne se périme jamais.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-174",
    title: "Habiter ensemble, jeunes et âgés",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Des habitats mêlent volontairement les générations.",
    blurbEn:
      "New forms of housing deliberately mix ages, against a long trend of separating them. Early results are promising, and instructive. (Section: Generations, 4/5.)",
    body: `Depuis quelques décennies, nos sociétés ont eu tendance à séparer les âges. Les enfants à l'école, les actifs au travail, les personnes âgées dans des résidences dédiées. Chacun vit de plus en plus entre semblables.

À rebours de cette tendance, des projets d'habitat intergénérationnel se développent : des lieux conçus pour que différentes générations vivent au même endroit, non par hasard, mais volontairement.

Les formes varient. Il y a la cohabitation, où un étudiant loge chez une personne âgée. Il y a aussi des immeubles ou des quartiers pensés pour mélanger les âges, avec des logements adaptés, des espaces communs, parfois une crèche et une résidence pour seniors sur le même site.

L'idée repose sur un constat simple : les besoins des uns rencontrent les ressources des autres.

Les personnes âgées disposent de temps, d'expérience, et souffrent souvent d'isolement. Les jeunes familles manquent de temps, de soutien, parfois de repères. Les enfants bénéficient de la présence d'adultes disponibles. En mettant ces groupes en présence, on crée des échanges naturels : un coup de main, une histoire racontée, une conversation.

Les premiers résultats sont encourageants, mais les organisateurs soulignent une condition essentielle, la même que pour toute cohabitation : le cadre.

Sans espaces partagés bien pensés, sans occasions de rencontre organisées au début, sans règles claires, les générations peuvent vivre côte à côte sans jamais se croiser. La proximité géographique ne crée pas le lien à elle seule.

Ces projets restent minoritaires, limités par le foncier et par la difficulté à les monter.

Mais ils rappellent une évidence oubliée.

Séparer les âges est récent dans l'histoire humaine.

Pendant très longtemps, les générations ont simplement vécu ensemble.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-175",
    title: "Transmettre un savoir-faire",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Certains savoirs ne s'apprennent pas dans les livres.",
    blurbEn:
      "Some knowledge lives only in hands and habits, and dies when it is not passed on. Why transmission matters, and why it is fragile. (Section: Generations, 5/5.)",
    body: `Il existe des savoirs qui ne figurent dans aucun livre, et qui pourtant représentent une richesse considérable : les savoir-faire. Tailler la pierre, réparer un moteur ancien, cuisiner un plat régional, cultiver une variété locale, jouer un répertoire musical.

Ces savoirs ont une particularité : ils vivent dans des gestes, des habitudes, une expérience accumulée. On ne les transmet pas seulement en expliquant, mais en montrant, en faisant faire, en corrigeant.

C'est ce qui les rend fragiles.

Un savoir écrit se conserve dans une bibliothèque, même si personne ne le lit pendant un siècle. Un savoir-faire, lui, disparaît dès qu'une génération cesse de le pratiquer. Il n'existe que tant qu'il est transmis.

L'histoire regorge de techniques perdues, que l'on a mis longtemps à retrouver, ou qu'on n'a jamais retrouvées. Non parce qu'elles étaient secrètes, mais parce que le dernier qui les maîtrisait est mort sans les avoir transmises.

Cette transmission est aujourd'hui menacée pour plusieurs raisons. La rapidité des changements techniques rend certains savoirs obsolètes avant même d'être transmis. La séparation des générations réduit les occasions de côtoyer ceux qui savent. Et une certaine dévalorisation des métiers manuels a détourné les jeunes de ces apprentissages.

Des efforts existent pour préserver ces savoirs : formations, apprentissage, documentation vidéo, reconnaissance de « maîtres d'art ».

Mais aucun enregistrement ne remplace tout à fait la présence. Beaucoup de gestes ne se comprennent qu'en les faisant, corrigés par quelqu'un qui les a faits mille fois.

C'est pourquoi la transmission reste un acte profondément humain, et un peu urgent.

Un savoir-faire non transmis ne se perd pas lentement.

Il se perd d'un coup, avec la personne qui le portait.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-176",
    title: "Pourquoi les gens donnent de leur temps",
    category: "science",
    difficulty: "B1",
    minutes: 3,
    preview: "Des millions de personnes sont bénévoles. Qu'est-ce qui les motive ?",
    blurbEn:
      "Millions volunteer for no pay. The reasons are less selfless and more interesting than 'kindness' — and that is good news. (Section: Volunteering, 1/5.)",
    body: `En France, des millions de personnes donnent régulièrement de leur temps, sans être payées, dans des associations : sport, aide alimentaire, soutien scolaire, secours, culture, environnement.

Ce phénomène pose une question intéressante. Pourquoi consacrer un temps précieux à des inconnus, sans rémunération ?

La réponse « par gentillesse » est trop simple, et un peu fausse. Les recherches sur le bénévolat montrent des motivations multiples, souvent mélangées, et pas toujours désintéressées — ce qui n'a rien de choquant.

Il y a bien sûr le désir d'être utile, de contribuer à quelque chose qui dépasse soi. C'est réel, et c'est important.

Mais il y a aussi des motivations plus personnelles, que les bénévoles reconnaissent volontiers.

Le lien social, d'abord. Beaucoup de gens deviennent bénévoles à un moment de solitude : après une retraite, un déménagement, un deuil. L'association leur offre un cadre, des rencontres, un rôle.

Le sens ensuite. Un travail salarié n'apporte pas toujours le sentiment d'être utile. Le bénévolat comble parfois ce manque.

L'apprentissage également. On y développe des compétences, on rencontre des milieux différents, on sort de sa routine.

Fait intéressant, les études montrent que le bénévolat régulier est associé à un meilleur bien-être et même à une meilleure santé. Donner de son temps profite aussi à celui qui donne.

Comprendre ces motivations n'enlève rien à la valeur du geste. Au contraire.

Cela signifie que le bénévolat n'est pas réservé aux saints.

C'est une activité humaine ordinaire, qui répond à des besoins de part et d'autre.

Ce qui est plutôt une bonne nouvelle.

Ce qui profite à celui qui aide dure plus longtemps.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-177",
    title: "Les banques alimentaires",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "Elles nourrissent des millions de personnes, et posent question.",
    blurbEn:
      "Food banks feed millions and are widely admired. They also raise an uncomfortable question about why they are needed at all. (Section: Volunteering, 2/5.)",
    body: `Les banques alimentaires et les associations de distribution nourrissent chaque année des millions de personnes en France. Elles reposent presque entièrement sur des bénévoles et sur des dons.

Leur fonctionnement est un bel exemple d'organisation. Elles récupèrent les invendus des supermarchés, les surplus agricoles, les dons des particuliers, et redistribuent le tout à des personnes en difficulté. Ce système évite du gaspillage tout en apportant une aide vitale.

Le travail des bénévoles y est considérable : trier, transporter, ranger, distribuer, accueillir. Beaucoup y consacrent plusieurs jours par semaine.

Ces associations méritent une admiration sincère.

Elles posent pourtant une question inconfortable, que leurs responsables sont souvent les premiers à soulever.

Le nombre de personnes qui y ont recours augmente, y compris des personnes qui travaillent. On y voit désormais des étudiants, des retraités, des salariés dont le revenu ne suffit plus à se nourrir correctement.

Or l'aide alimentaire, aussi précieuse soit-elle, traite une conséquence, pas une cause. Si autant de gens ne peuvent pas se nourrir, c'est que quelque chose, en amont, ne fonctionne pas : salaires trop bas, loyers trop élevés, protection sociale insuffisante.

Le risque, souligné par certains, est que l'existence de ces associations rende ce problème plus supportable, donc moins urgent à résoudre. La générosité privée peut, involontairement, masquer une défaillance collective.

Cela ne remet nullement en cause l'utilité de ces structures, qui répondent à une détresse immédiate et réelle.

Mais cela rappelle une distinction essentielle.

Une société généreuse aide ceux qui ont faim.

Une société juste cherche à ce qu'ils n'aient plus faim.

Les deux sont nécessaires. La première ne dispense pas de la seconde.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-178",
    title: "Aider sans écraser",
    category: "culture",
    difficulty: "B1",
    minutes: 3,
    preview: "Une aide mal pensée peut humilier ou rendre dépendant.",
    blurbEn:
      "Helping well is harder than helping. Aid that ignores dignity or autonomy can do as much harm as good. (Section: Volunteering, 3/5.)",
    body: `Vouloir aider est une bonne intention. Aider bien est plus difficile qu'il n'y paraît, et une aide mal pensée peut faire autant de mal que de bien.

Les personnes qui travaillent depuis longtemps dans l'action sociale connaissent bien ce paradoxe. Elles ont vu des aides généreuses produire de la honte, de la dépendance, ou du ressentiment.

Plusieurs pièges reviennent.

Le premier est l'oubli de la dignité. Recevoir de l'aide expose à une position basse : on est celui qui reçoit, face à celui qui donne. Une aide qui souligne cette différence, même sans le vouloir, humilie. Les dispositifs les plus respectueux sont ceux qui traitent les personnes aidées comme des adultes capables de choisir, et non comme des cas à gérer.

Le deuxième est de faire à la place. Aider quelqu'un en accomplissant tout pour lui peut soulager sur le moment, mais entretient une dépendance. La bonne aide vise souvent à rendre l'autre plus autonome, quitte à être moins visible et moins gratifiante pour celui qui aide.

Le troisième est de décider pour l'autre ce dont il a besoin. On apporte ce qu'on croit utile, sans écouter la personne concernée, qui connaît sa situation mieux que quiconque.

Ce constat vaut à toutes les échelles : entre voisins, dans une association, entre pays.

Il ne doit pas décourager d'aider — l'inaction n'a jamais rien résolu.

Mais il invite à une aide plus humble, qui écoute avant d'agir, et qui se demande non pas « qu'est-ce que je peux donner ? », mais « de quoi cette personne a-t-elle réellement besoin, selon elle ? ».

La meilleure aide, souvent, ne se remarque pas.

Elle laisse l'autre debout.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-179",
    title: "Le monde associatif, un pilier discret",
    category: "news-style",
    difficulty: "B1",
    minutes: 3,
    preview: "La France compte plus d'un million d'associations.",
    blurbEn:
      "France has over a million associations doing work the state and market do not. This quiet sector holds much of daily life together. (Section: Volunteering, 4/5.)",
    body: `La France compte plus d'un million d'associations actives, et une part importante de la population y adhère ou y participe. Ce tissu associatif est un pilier de la vie sociale, souvent invisible parce qu'il fonctionne bien.

Ces associations couvrent des domaines immenses : le sport de proximité, la culture, l'aide sociale, l'environnement, la défense de causes, les loisirs, l'éducation populaire.

Elles occupent un espace particulier, entre l'État et le marché.

L'État agit selon des règles générales, égales pour tous, mais parfois lourdes et lointaines. Le marché produit ce qui est rentable. Or beaucoup de besoins ne relèvent ni de l'un ni de l'autre : ils sont trop locaux, trop spécifiques, ou pas assez lucratifs.

C'est là que les associations interviennent. Un club de sport dans un village, un atelier de théâtre, une aide aux devoirs, une association de quartier : autant d'activités qu'aucune administration ne piloterait aussi finement, et qu'aucune entreprise ne trouverait rentables.

Ce secteur repose sur une combinaison fragile : des bénévoles, quelques salariés, des subventions publiques, des cotisations, des dons.

Cette fragilité est réelle. Le bénévolat vieillit dans certaines associations, qui peinent à renouveler leurs équipes. Les financements publics, sous contrainte budgétaire, se réduisent parfois. Les démarches administratives découragent les petites structures.

Pourtant, ce que ce secteur produit est difficile à remplacer : du lien, de l'engagement, une capacité à réponder vite et près du terrain.

On mesure mal ce qu'il apporte, précisément parce qu'il fonctionne sans bruit.

On le mesurerait immédiatement s'il disparaissait.

Une grande partie de ce qui rend une vie locale vivable passe par lui.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
  {
    id: "starter-b1-180",
    title: "Commencer petit",
    category: "everyday life",
    difficulty: "B1",
    minutes: 3,
    preview: "On attend souvent le grand geste. Le petit suffit à commencer.",
    blurbEn:
      "People wait for the perfect way to help and never start. A quiet argument for beginning small — and for the value of just showing up. (Section: Volunteering, 5/5.)",
    body: `Beaucoup de gens aimeraient s'engager, aider, contribuer. Peu le font. Entre l'intention et l'action, un obstacle revient : l'idée qu'il faudrait un grand geste, du temps qu'on n'a pas, une compétence qu'on ne possède pas.

Cette exigence, en apparence louable, est souvent ce qui empêche de commencer.

Car l'immense majorité de ce qui se fait dans les associations ne demande aucune compétence rare. Trier des vêtements, accompagner une sortie, tenir une table lors d'un événement, passer un coup de fil à une personne isolée. Ce sont des actions simples, à la portée de presque tout le monde.

Et surtout, ce qui compte le plus n'est pas l'ampleur du geste, mais la régularité et la fiabilité. Une personne qui vient deux heures chaque semaine, sur laquelle on peut compter, vaut mieux qu'un grand élan qui s'éteint au bout d'un mois.

Ceux qui s'engagent racontent souvent le même parcours. Ils ont commencé par très peu, presque par hasard, sans grande conviction. Puis ils y ont trouvé du sens, des rencontres, une place. L'engagement a grandi ensuite, mais il est parti d'un petit pas.

Il y a une leçon plus générale dans cette observation, valable au-delà du bénévolat.

Attendre les bonnes conditions, le bon moment, la bonne cause, conduit souvent à ne jamais commencer. Les grandes choses naissent presque toujours d'un début modeste.

Le contraire est vrai aussi : rien de collectif n'existe si personne ne fait le premier petit pas.

La question n'est donc pas « puis-je changer les choses ? ».

C'est : « puis-je donner deux heures, cette semaine, à quelque chose de plus grand que moi ? »

Cette question-là a presque toujours une réponse.`,
    sourceName: "Written for Lire",
    language: "fr",
  },
];
