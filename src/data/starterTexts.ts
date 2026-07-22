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
];
