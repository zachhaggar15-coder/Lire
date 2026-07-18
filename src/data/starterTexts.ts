import type { ReadingText } from "@/types";

/**
 * Original A1/A2 French texts written for beginners.
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
];
