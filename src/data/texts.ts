import type { ReadingText } from "@/types";

/**
 * Hardcoded sample French reading texts — the emergency fallback pool used
 * only when RSS content is unavailable or insufficient (see "RSS reading
 * content" in the README). Rewritten to be substantial (400+ words each,
 * not just a few short paragraphs), matching the same "real reading
 * content" bar the RSS pipeline now enforces, so this fallback never feels
 * like a downgrade. Paragraphs within `body` are separated by a blank line.
 */
export const texts: ReadingText[] = [
  {
    id: "metro-gratuit",
    title: "Le métro bientôt gratuit ?",
    category: "news-style",
    difficulty: "A2",
    minutes: 3,
    preview:
      "Une grande ville française étudie la possibilité de rendre les transports gratuits pour tous les habitants.",
    body: `Une grande ville française étudie la possibilité de rendre les transports en commun gratuits pour tous les habitants. Le maire explique que cette mesure pourrait réduire la pollution et aider les familles qui ont un budget limité. Selon lui, moins de voitures dans les rues signifie un air plus propre et moins de bruit.

Le projet n'est pas nouveau. Plusieurs villes en Europe ont déjà testé la gratuité des transports, avec des résultats différents. Dans certaines villes, le nombre de passagers a beaucoup augmenté, ce qui a créé des bus et des trams très remplis aux heures de pointe. Dans d'autres villes, les résultats ont été plus modestes, mais les habitants ont apprécié de payer moins chaque mois.

Les habitants de la ville sont partagés sur cette idée. Certains trouvent le projet excellent. Ils pensent que la gratuité va encourager plus de gens à laisser leur voiture à la maison. Une jeune étudiante explique qu'elle utilise déjà le bus tous les jours pour aller à l'université, et qu'un transport gratuit lui permettrait d'économiser beaucoup d'argent chaque mois.

D'autres habitants sont plus prudents. Ils se demandent qui va payer pour ce changement. La gratuité des transports coûte cher à la ville, et il faut trouver l'argent quelque part. Un commerçant du centre-ville pense que les impôts locaux vont augmenter pour compenser la perte de revenus des tickets de bus et de métro.

Le conseil municipal a organisé plusieurs réunions publiques pour discuter du projet avec les habitants. Pendant ces réunions, des experts en transport ont présenté des chiffres et des études sur les villes qui ont déjà adopté la gratuité. Ils ont expliqué les avantages, comme la réduction de la pollution, mais aussi les défis, comme l'entretien des véhicules et l'embauche de nouveaux conducteurs.

Le maire a promis qu'une décision finale sera prise l'année prochaine, après une longue période d'étude et de discussion avec les citoyens. Un sondage sera aussi organisé pour connaître l'opinion générale de la population avant le vote final au conseil municipal.

En attendant, la ville a annoncé un premier changement : les transports seront gratuits le week-end pendant les trois prochains mois, à titre d'essai. Ce test permettra de mesurer l'impact réel sur le nombre de passagers et sur la circulation automobile en centre-ville. Les résultats de cet essai seront présentés publiquement à la fin de l'année.

D'autres villes françaises suivent ce projet avec beaucoup d'attention. Si l'essai est un succès, plusieurs maires ont déjà annoncé qu'ils étudieraient eux aussi la gratuité des transports dans leur propre commune. Pour l'instant, tout le monde attend les premiers résultats avec impatience.`,
  },
  {
    id: "victoire-finale",
    title: "Une victoire au dernier moment",
    category: "sport",
    difficulty: "A2",
    minutes: 3,
    preview:
      "L'équipe locale gagne le match dans les dernières secondes et le public explose de joie.",
    body: `Hier soir, l'équipe locale a gagné un match extraordinaire dans les dernières secondes de la rencontre. Le stade était complet depuis le début de l'après-midi, et des milliers de supporters attendaient ce match depuis des semaines. L'ambiance était électrique dès l'entrée des joueurs sur le terrain.

Le début du match a été difficile pour l'équipe locale. L'adversaire a marqué un but dès la dixième minute, et les supporters sont restés silencieux pendant un long moment. Les joueurs locaux semblaient nerveux et ont eu du mal à contrôler le ballon pendant la première moitié du match.

Pendant la pause, l'entraîneur a parlé longuement avec ses joueurs dans les vestiaires. Il leur a rappelé l'importance de ce match pour le classement et leur a demandé de rester calmes et concentrés. Ce discours a visiblement changé quelque chose, car l'équipe est revenue sur le terrain avec beaucoup plus d'énergie.

Au retour des vestiaires, le jeu a complètement changé. Les joueurs locaux ont commencé à dominer le ballon et à créer de nombreuses occasions de but. Le jeune attaquant de l'équipe, seulement âgé de dix-neuf ans, a égalisé le score avec un tir puissant depuis l'extérieur de la surface de réparation. Le stade a explosé de joie.

Le match est resté très serré jusqu'aux dernières minutes. Les deux équipes avaient des occasions de marquer, mais les gardiens de but ont fait d'excellents arrêts. Tout le monde pensait que le match allait se terminer sur un match nul, ce qui aurait été un résultat honorable pour les deux équipes.

Mais dans le temps additionnel, à la quatre-vingt-treizième minute, le même jeune attaquant a reçu un centre parfait et a marqué un but magnifique de la tête. Le stade est devenu fou. Les supporters ont crié de joie pendant plusieurs minutes, et certains ont même pleuré de bonheur devant ce moment historique pour le club.

Après le match, l'entraîneur a expliqué aux journalistes que ses joueurs n'ont jamais abandonné, même après avoir concédé le premier but. Il a aussi félicité le jeune attaquant pour sa performance exceptionnelle et a annoncé qu'il jouerait un rôle encore plus important dans les matchs à venir.

La prochaine rencontre aura lieu dimanche prochain, contre l'une des meilleures équipes du championnat. Les supporters espèrent déjà revivre les mêmes émotions et continuent de célébrer cette victoire mémorable dans les rues de la ville jusque tard dans la nuit.

Pour le club, cette victoire est aussi importante sur le plan financier. Gagner ce match permet de rester dans le haut du classement et d'espérer une place en compétition européenne la saison prochaine, ce qui rapporterait beaucoup d'argent et de visibilité à l'équipe.`,
  },
  {
    id: "musee-nuit",
    title: "La nuit des musées",
    category: "culture",
    difficulty: "B1",
    minutes: 4,
    preview:
      "Chaque printemps, les musées ouvrent leurs portes gratuitement pendant toute une nuit spéciale.",
    body: `Chaque printemps, de nombreux musées à travers le pays ouvrent leurs portes gratuitement pendant toute une nuit, dans le cadre d'un événement culturel très populaire appelé la Nuit des musées. Cette manifestation existe depuis plusieurs années et attire, à chaque édition, un public toujours plus nombreux et varié.

L'idée derrière cet événement est simple : permettre à tous, quel que soit leur budget, de découvrir les collections des musées dans une ambiance différente de celle de la journée. La nuit, les salles d'exposition prennent une atmosphère particulière, presque mystérieuse, qui change complètement la façon dont les visiteurs perçoivent les œuvres d'art.

Dans les grandes villes, certains musées proposent des visites guidées spéciales, animées par des conservateurs passionnés qui racontent des anecdotes surprenantes sur les tableaux et les sculptures exposés. D'autres musées organisent des concerts de musique classique ou contemporaine directement dans les salles, créant un dialogue original entre les œuvres et la musique jouée en direct.

Les enfants ne sont pas oubliés pendant cette soirée exceptionnelle. Plusieurs musées mettent en place des ateliers créatifs où les plus jeunes peuvent dessiner, peindre ou même essayer la sculpture avec l'aide d'artistes professionnels. Ces activités permettent d'éveiller la curiosité artistique dès le plus jeune âge, dans un cadre ludique et sans pression scolaire.

Un visiteur régulier de l'événement raconte qu'il attend cette soirée avec impatience chaque année. Il explique que la foule, la musique et les lumières particulières transforment complètement son rapport à l'art. D'après lui, il découvre souvent des œuvres qu'il avait déjà vues auparavant sous un angle totalement nouveau.

Les musées de sciences naturelles participent aussi à l'événement, avec des animations autour de l'astronomie ou de la biologie. Certains organisent même des observations du ciel étoilé sur leur toit-terrasse, quand la météo le permet, en collaboration avec des associations locales d'astronomes amateurs.

Cet événement culturel rencontre chaque année un succès grandissant. Selon les organisateurs, plusieurs millions de visiteurs participent à cette nuit spéciale dans toute l'Europe, ce qui en fait l'un des événements culturels les plus fréquentés du continent. Ce succès démontre que la culture, lorsqu'elle est rendue accessible et gratuite, continue d'attirer un public très large et diversifié.

Pour les musées eux-mêmes, cette soirée représente aussi une occasion unique de toucher un public qui ne viendrait peut-être jamais visiter leurs collections en temps normal. Beaucoup de visiteurs découvrent ainsi des lieux culturels de leur propre ville qu'ils ne connaissaient pas auparavant, et reviennent ensuite les visiter pendant l'année, en dehors de cet événement exceptionnel.`,
  },
  {
    id: "sommeil-cerveau",
    title: "Pourquoi dormir est essentiel",
    category: "science",
    difficulty: "B1",
    minutes: 4,
    preview:
      "Des chercheurs expliquent comment le sommeil aide le cerveau à mémoriser et à se réparer.",
    body: `Le sommeil n'est pas une simple pause dans notre journée, comme on pourrait le penser. Pendant la nuit, notre cerveau reste en réalité très actif et accomplit un travail essentiel pour notre santé physique et mentale. Les scientifiques étudient depuis des décennies les mécanismes complexes qui se déroulent pendant que nous dormons.

Le sommeil se divise en plusieurs phases qui se répètent plusieurs fois pendant la nuit. La première phase est un sommeil léger, pendant lequel il est facile de se réveiller. Vient ensuite une phase de sommeil profond, essentielle pour la récupération physique du corps. Enfin, une phase appelée sommeil paradoxal correspond au moment où nous rêvons le plus intensément.

Pendant le sommeil profond, le corps répare les tissus musculaires et renforce le système immunitaire. C'est aussi pendant cette phase que l'hormone de croissance est produite en plus grande quantité, ce qui explique pourquoi le sommeil est particulièrement important pour les enfants et les adolescents en pleine croissance.

Le sommeil paradoxal, quant à lui, joue un rôle crucial dans la mémoire et l'apprentissage. Des chercheurs ont montré que le cerveau trie, pendant cette phase, les informations reçues pendant la journée. Il renforce les souvenirs importants et élimine les informations jugées inutiles, un peu comme s'il faisait le ménage dans nos pensées.

Plusieurs études ont montré les conséquences négatives du manque de sommeil sur notre organisme. Une personne qui dort mal pendant plusieurs nuits consécutives voit sa concentration diminuer fortement. Sa capacité à prendre des décisions et à résoudre des problèmes est également affectée. Le manque de sommeil est aussi associé à une irritabilité plus importante et à des changements d'humeur.

Sur le long terme, un sommeil insuffisant peut avoir des conséquences plus graves sur la santé. Des recherches ont établi un lien entre le manque chronique de sommeil et un risque plus élevé de maladies cardiovasculaires, de diabète et de prise de poids. Le corps, privé de repos suffisant, produit davantage d'hormones liées au stress, ce qui fatigue l'organisme sur la durée.

Face à ces constats, les spécialistes du sommeil recommandent aux adultes de dormir entre sept et neuf heures par nuit, selon les besoins individuels de chacun. Ils conseillent également d'éviter les écrans lumineux avant de se coucher, car la lumière bleue perturbe la production de mélatonine, l'hormone qui favorise l'endormissement.

Adopter une routine régulière, en se couchant et en se levant à des heures similaires chaque jour, reste selon les experts l'une des meilleures façons d'améliorer durablement la qualité de son sommeil et, par conséquent, sa santé générale.`,
  },
  {
    id: "marche-dimanche",
    title: "Un dimanche au marché",
    category: "everyday life",
    difficulty: "A1",
    minutes: 3,
    preview:
      "Le dimanche matin, beaucoup de gens font leurs courses au marché de leur quartier.",
    body: `Le dimanche matin, beaucoup de gens vont au marché du quartier. Le marché commence tôt, à huit heures, et il finit à treize heures. Il y a beaucoup de monde, surtout entre dix heures et midi.

Sur le marché, il y a de nombreux stands. Un marchand vend des fruits : des pommes, des poires, des oranges et des bananes. Un autre marchand vend des légumes : des tomates, des carottes, des pommes de terre et des courgettes. Les légumes sont frais et ils viennent souvent de fermes proches de la ville.

Il y a aussi un stand de pain. Le boulanger vend des baguettes, du pain de campagne et des croissants. Le matin, l'odeur du pain chaud attire beaucoup de clients. Les gens font souvent la queue devant ce stand, car les croissants sont très populaires.

Un peu plus loin, il y a un stand de fromages. Le vendeur propose de nombreux fromages différents : du fromage de chèvre, du camembert, du comté et beaucoup d'autres. Il donne parfois de petits morceaux à goûter aux clients avant qu'ils achètent. Les clients aiment beaucoup ce moment de dégustation.

Les vendeurs du marché sont souvent très sympathiques. Ils saluent les clients avec le sourire et ils connaissent bien leurs habitudes. Un vendeur reconnaît un client régulier et lui demande des nouvelles de sa famille. Cette relation simple et chaleureuse rend le marché agréable pour tout le monde.

Les prix sont écrits sur de petites pancartes en bois ou en carton. Les clients regardent les prix avant de choisir leurs produits. Parfois, à la fin de la matinée, les vendeurs baissent un peu les prix pour vendre les derniers produits qui restent sur leur stand.

Une famille se promène tranquillement entre les stands. Les parents choisissent des légumes pour le repas du dimanche, pendant que leurs enfants regardent les fruits colorés avec curiosité. Un enfant demande à sa mère d'acheter des fraises, et sa mère accepte avec plaisir.

Après les courses, beaucoup de personnes s'arrêtent dans un café près du marché. Elles commandent un café ou un chocolat chaud et elles s'assoient en terrasse pour se reposer. C'est un moment simple, calme et agréable, à la fin d'une matinée bien remplie.

Le marché du dimanche est un vrai moment de vie pour les habitants du quartier. Beaucoup de gens s'y retrouvent chaque semaine, discutent un peu et profitent de cette ambiance conviviale avant de rentrer chez eux pour préparer le déjeuner.`,
  },
];

export function getTextById(id: string): ReadingText | undefined {
  return texts.find((t) => t.id === id);
}
