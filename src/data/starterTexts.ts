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
];
