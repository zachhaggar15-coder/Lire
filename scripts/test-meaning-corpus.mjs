import { resolveMeaning, shouldEscalateToAi, meaningCacheKey } from "../src/lib/dictionary/resolveMeaning.ts";
import { materiallyDistinctSenses, sensesAgree } from "../src/lib/dictionary/ambiguity.ts";
import { ensureGeneratedDictionary } from "../src/lib/dictionary/lookup.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";

/**
 * Contextual meaning over continuous French prose.
 *
 * The companion suite (test-meaning-resolution.mjs) pins the resolver's
 * mechanics — tiers, abstaining, upgrade rules. This one is about ordinary
 * reading: complete A1-B2 sentences and news-style lines, tapping the words a
 * learner actually taps.
 *
 * The organising idea is contrast. Proving the dictionary contains a sense is
 * nearly worthless; what matters is that the *same surface form* resolves
 * differently when the sentence changes. So the ambiguous words below appear
 * two, three or four times each in deliberately opposed frames, and a pass
 * requires every one of them to come out differently.
 */

await ensureGeneratedDictionary();

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function normalise(value) {
  return String(value).toLowerCase().replace(/[’]/g, "'").trim();
}

function resolve(sentenceText, needle, options = {}) {
  const sentence = tokenizeParagraphsToSentences(sentenceText)[0][0];
  const target = normalise(needle);
  const index = sentence.tokens.findIndex(
    (token) =>
      token.isWord &&
      (normalise(token.clean) === target ||
        normalise(token.text) === target ||
        normalise(token.clean).replace(/^(?:[cdjlmnst]|qu)'/u, "") === target)
  );
  if (index === -1) throw new Error(`Could not find "${needle}" in: ${sentenceText}`);
  return resolveMeaning({
    tokens: sentence.tokens,
    tokenIndex: index,
    contextSentence: sentence.text,
    alignments: options.alignments ?? null,
    aiMeaning: options.aiMeaning ?? null,
  });
}

/**
 * One corpus row: a sentence, the tapped word, and the readings that would be
 * acceptable to show. Generous on wording, strict on sense.
 */
function expect(sentence, needle, accepted) {
  const values = Array.isArray(accepted) ? accepted : [accepted];
  const result = resolve(sentence, needle);
  const ok = values.some((value) => normalise(result.displayEnglish).includes(normalise(value)));
  check(
    `"${needle}" in "${sentence}"`,
    ok,
    `got "${result.displayEnglish || "(abstain)"}" [${result.source}/${result.confidence}], wanted one of ${JSON.stringify(values)}`
  );
  return result;
}

/**
 * The core assertion of this file: one spelling, several sentences, and a
 * different answer required in each.
 */
function expectContrast(label, rows) {
  const seen = [];
  for (const [sentence, needle, accepted] of rows) {
    seen.push(expect(sentence, needle, accepted).displayEnglish);
  }
  const distinct = new Set(seen.map(normalise));
  check(`${label}: contrasting sentences produce distinct meanings`, distinct.size === seen.length, JSON.stringify(seen));
}

console.log("--- Highly polysemous verbs, contrasted ---");
expectContrast("passer", [
  ["Il va passer un examen difficile demain.", "passer", ["take an exam", "sit an exam"]],
  ["Nous aimons passer du temps ensemble.", "passer", ["spend"]],
  ["Que s'est-il passé hier soir ?", "passé", ["happen"]],
]);
expectContrast("prendre", [
  ["Elle prend le train de sept heures.", "prend", ["take", "catch"]],
  ["Il prend un café tous les matins.", "prend", ["has", "have"]],
  ["Le conseil prend une décision importante.", "prend", ["make", "take"]],
]);
expectContrast("mettre", [
  ["Il met son manteau avant de sortir.", "met", ["put on", "puts on"]],
  ["Elle met une heure pour venir au bureau.", "met", ["take", "takes"]],
]);
expectContrast("tenir", [
  ["Elle tient un journal depuis dix ans.", "tient", ["hold", "keep"]],
  ["Il tient à ce projet plus que tout.", "tient", ["care about", "attached"]],
]);
expectContrast("suivre", [
  ["Elle suit un cours d'anglais le mardi.", "suit", ["take", "takes"]],
  ["Le chien la suit partout dans la maison.", "suit", ["follow"]],
]);
expectContrast("arriver", [
  ["Le train arrive à huit heures précises.", "arrive", ["arrive"]],
  ["Cela arrive souvent en hiver.", "arrive", ["happen", "occur"]],
]);
expectContrast("trouver", [
  ["Je trouve la clé sous le tapis.", "trouve", ["find"]],
  ["Je trouve que cette question est difficile.", "trouve", ["think", "find"]],
  ["La gare se trouve près du centre.", "trouve", ["located", "is"]],
]);
expectContrast("manquer", [
  ["Elle manque de temps pour finir.", "manque", ["lack", "short of"]],
  ["Tu me manques beaucoup depuis ton départ.", "manques", ["miss"]],
]);
expectContrast("porter", [
  ["Elle porte une robe bleue aujourd'hui.", "porte", ["wear"]],
  ["Il porte les valises jusqu'à la voiture.", "porte", ["carry"]],
]);
expectContrast("compter", [
  ["La caissière compte les billets avec soin.", "compte", ["count"]],
  ["Elle compte partir en juillet.", "compte", ["plan", "intend"]],
  ["Ton avis compte beaucoup pour moi.", "compte", ["matter", "count"]],
  ["Il compte sur toi pour l'aider.", "compte", ["rely", "count on"]],
]);
expectContrast("rendre", [
  ["Cette nouvelle me rend très heureux.", "rend", ["make"]],
  ["Elle se rend compte de son erreur.", "rend", ["realize", "realise"]],
]);
expectContrast("partir", [
  ["Il est parti très tôt ce matin.", "parti", ["left", "gone", "depart"]],
  ["Le parti politique a gagné les élections.", "parti", ["party"]],
]);

console.log("--- Ambiguous common words, contrasted ---");
expectContrast("tour", [
  ["La tour de l'église domine le village.", "tour", ["tower"]],
  ["C'est son tour de jouer maintenant.", "tour", ["turn"]],
  ["Nous faisons un tour en ville après le dîner.", "tour", ["trip", "walk", "stroll"]],
]);
expectContrast("droit", [
  ["Chacun a le droit de s'exprimer librement.", "droit", ["right", "entitle"]],
  ["Elle étudie le droit à l'université.", "droit", ["law"]],
  ["Continuez tout droit jusqu'au carrefour.", "droit", ["straight"]],
]);
expectContrast("place", [
  ["Il n'y a plus de place dans la voiture.", "place", ["room", "space"]],
  ["La place du village est très animée.", "place", ["square"]],
  ["J'ai réservé une place dans le train.", "place", ["seat"]],
]);
expectContrast("fait", [
  ["C'est un fait très important pour l'enquête.", "fait", ["fact"]],
  ["Il fait beau et chaud aujourd'hui.", "fait", ["weather", "is"]],
  ["Elle fait ses devoirs chaque soir.", "fait", ["does", "do", "make"]],
]);
expectContrast("temps", [
  ["Le temps passe beaucoup trop vite.", "temps", ["time"]],
  ["Quel temps fait-il à Paris ce matin ?", "temps", ["weather"]],
]);
expectContrast("sens", [
  ["Le sens de cette phrase reste obscur.", "sens", ["meaning", "sense"]],
  ["La rue est à sens unique depuis janvier.", "sens", ["direction", "way"]],
  ["Je sens une odeur de brûlé.", "sens", ["feel", "smell"]],
]);
expectContrast("encore", [
  ["Il est encore au bureau à cette heure.", "encore", ["still"]],
  ["Je voudrais encore un peu de café.", "encore", ["more", "another"]],
  ["Elle n'est pas encore arrivée.", "encore", ["not yet", "yet"]],
]);
expectContrast("même", [
  ["Même les enfants ont compris la leçon.", "même", ["even"]],
  ["Ils sont nés le même jour de la même année.", "même", ["same"]],
]);
expectContrast("personne", [
  ["Une personne attend devant la porte.", "personne", ["person"]],
  ["Il n'y a personne dans la salle.", "personne", ["nobody", "anyone", "no one"]],
]);
expectContrast("pas", [
  ["Il fait un pas en avant puis s'arrête.", "pas", ["step"]],
  ["Elle ne veut pas partir maintenant.", "pas", ["not"]],
]);
expectContrast("depuis", [
  ["Il habite à Lyon depuis 2010.", "depuis", ["since"]],
  ["Elle travaille ici depuis trois ans.", "depuis", ["for"]],
]);
expectContrast("livre", [
  ["Ce livre raconte une histoire vraie.", "livre", ["book"]],
  ["Il achète une livre de beurre au marché.", "livre", ["pound"]],
]);

console.log("--- Ordinary A1-A2 prose ---");
expect("Léa se lève à sept heures du matin.", "lève", ["get up", "rise", "raise"]);
expect("Elle ouvre la fenêtre de la cuisine.", "fenêtre", ["window"]);
expect("Le chat dort sur le canapé du salon.", "chat", ["cat"]);
expect("Mon frère habite dans une petite maison.", "maison", ["house", "home"]);
expect("Nous mangeons du pain et du fromage.", "pain", ["bread"]);
expect("La voiture rouge est garée devant l'école.", "voiture", ["car"]);
expect("Il boit un verre d'eau très froide.", "eau", ["water"]);
expect("Les enfants jouent dans le jardin public.", "enfants", ["child"]);
expect("Elle achète des fruits au marché le samedi.", "marché", ["market"]);
expect("Le train part de la gare à midi.", "gare", ["station"]);
expect("Je voudrais un café et un croissant.", "café", ["coffee", "café"]);
expect("Il fait ses courses tous les vendredis.", "courses", ["shopping", "errand", "race"]);
expect("Ma soeur travaille dans un hôpital.", "hôpital", ["hospital"]);
expect("Nous partons en vacances la semaine prochaine.", "vacances", ["holiday", "vacation"]);
expect("Le professeur explique la leçon aux élèves.", "professeur", ["teacher", "professor"]);
expect("Elle écrit une lettre à son amie.", "lettre", ["letter"]);
expect("Il y a beaucoup de monde dans la rue.", "rue", ["street", "road"]);
expect("Le repas est prêt sur la table.", "repas", ["meal"]);
expect("Nous regardons un film ce soir.", "film", ["film", "movie"]);
expect("Elle porte des lunettes pour lire.", "lunettes", ["glasses", "spectacles"]);

console.log("--- B1-B2 prose ---");
expect("Le gouvernement a annoncé de nouvelles mesures économiques.", "mesures", ["measure", "step"]);
expect("Cette décision risque d'aggraver la situation actuelle.", "aggraver", ["worsen", "aggravate", "make worse"]);
expect("Les habitants s'inquiètent de la hausse des loyers.", "loyers", ["rent"]);
expect("Il a réussi à convaincre ses collègues.", "convaincre", ["convince", "persuade"]);
expect("L'entreprise envisage de recruter cinquante salariés.", "salariés", ["employee", "worker", "salaried"]);
expect("Le rapport souligne l'importance de la formation.", "souligne", ["highlight", "underline", "emphasis", "stress"]);
expect("Elle a obtenu une bourse pour poursuivre ses études.", "bourse", ["grant", "scholarship", "stock exchange", "purse"]);
expect("Ce projet nécessite des moyens considérables.", "moyens", ["means", "resource", "way"]);
expect("Les négociations se poursuivent malgré les désaccords.", "désaccords", ["disagreement", "dispute"]);
expect("Il a fini par accepter notre proposition.", "proposition", ["proposal", "offer", "proposition"]);
expect("La réunion a été reportée à la semaine prochaine.", "reportée", ["postpone", "put off", "defer"]);
expect("Cette решение — non, cette réforme suscite de vives critiques.", "réforme", ["reform"]);
expect("Le témoin affirme avoir vu la scène entière.", "témoin", ["witness"]);
expect("Nous devons tenir compte des contraintes budgétaires.", "compte", ["into account", "account"]);
expect("Le chômage a baissé de deux points cette année.", "chômage", ["unemployment"]);

console.log("--- News and headline language ---");
expect("Le président s'exprimera devant l'Assemblée nationale.", "président", ["president"]);
expect("Une forte hausse des prix inquiète les ménages.", "hausse", ["rise", "increase"]);
expect("Le porte-parole du ministère a démenti l'information.", "démenti", ["deny", "denial", "refute"]);
expect("Des frappes ont visé plusieurs sites militaires.", "frappes", ["strike"]);
expect("L'escalade du conflit préoccupe les diplomates européens.", "escalade", ["escalation"]);
expect("Les autorités ont ouvert une enquête judiciaire.", "enquête", ["investigation", "inquiry"]);
expect("Le projet de loi sera examiné mardi prochain.", "loi", ["law", "bill", "act"]);
expect("La croissance ralentit dans la zone euro.", "croissance", ["growth"]);
expect("Un accord a été trouvé après de longues discussions.", "accord", ["agreement", "deal", "accord"]);
expect("Le tribunal a condamné l'entreprise à une amende.", "amende", ["fine", "penalty"]);
expect("Les syndicats appellent à la grève lundi.", "syndicats", ["union", "syndicate"]);
expect("Le taux de chômage reste stable ce trimestre.", "taux", ["rate"]);
expect("Plusieurs élus ont réclamé la démission du maire.", "maire", ["mayor"]);
expect("La justice enquête sur des soupçons de fraude.", "soupçons", ["suspicion"]);
expect("Le sommet réunit les dirigeants de vingt pays.", "dirigeants", ["leader", "executive"]);

console.log("--- Function words and pronouns in running text ---");
expect("Il y va tous les jeudis après le travail.", "y", ["there", "to it"]);
expect("Elle en parle souvent à ses collègues.", "en", ["of it", "about it", "some"]);
expect("Je lui ai donné le livre hier soir.", "lui", ["to him", "to her", "him", "her"]);
expect("Nous leur avons écrit la semaine dernière.", "leur", ["to them", "them"]);
expect("Le film dont je parle sort vendredi.", "dont", ["of which", "whose", "about which", "that"]);
expect("La personne qui attend est ma soeur.", "qui", ["who", "which", "that"]);
expect("Le livre que tu cherches est ici.", "que", ["that", "which", "whom", "what"]);
expect("Ce matin, il pleuvait très fort.", "ce", ["this", "that", "it"]);
expect("Ça ne me dérange pas du tout.", "ça", ["that", "it"]);
expect("Il travaille avec nous depuis janvier.", "avec", ["with"]);
expect("C'est la voiture de mon voisin.", "de", ["of", "from", "'s"]);
expect("Elle est partie pour Paris ce matin.", "pour", ["for", "to", "in order"]);
expect("Il est fatigué mais il continue.", "mais", ["but"]);
expect("Il pleut, donc nous restons à la maison.", "donc", ["so", "therefore", "thus"]);
expect("Les clés sont dans le tiroir du bureau.", "dans", ["in", "into", "inside"]);
expect("Elle est chez sa grand-mère ce week-end.", "chez", ["at", "home", "with"]);
expect("Le café est entre la banque et la poste.", "entre", ["between", "among"]);
expect("Il marche vers la sortie sans rien dire.", "vers", ["towards", "toward"]);
expect("Le livre est sur la table de la cuisine.", "sur", ["on", "upon", "about"]);
expect("Elle pense souvent à son enfance.", "à", ["to", "at", "in", "about"]);

console.log("--- Contractions in running text ---");
expect("Nous allons au cinéma ce soir.", "au", ["to the", "at the"]);
expect("Il parle aux enfants avec beaucoup de patience.", "aux", ["to the", "at the"]);
expect("Elle revient du marché avec un panier plein.", "du", ["of the", "from the", "some"]);
expect("Il vient des États-Unis pour son travail.", "des", ["of the", "from the", "some"]);

console.log("--- Negation in running text ---");
expect("Il ne veut pas partir avant la fin.", "pas", ["not"]);
expect("Elle ne travaille plus dans cette entreprise.", "plus", ["no longer", "not anymore", "anymore"]);
expect("Nous ne sommes jamais allés en Italie.", "jamais", ["never"]);
expect("Il ne dit rien depuis le début de la réunion.", "rien", ["nothing", "anything"]);
expect("Personne ne sait ce qui s'est passé.", "personne", ["nobody", "no one", "anyone"]);

console.log("--- Verb morphology in running text ---");
expect("Elle est allée au marché ce matin.", "allée", ["go", "went", "gone"]);
expect("Ils avaient déjà terminé le travail.", "terminé", ["finish", "complete", "end", "done"]);
expect("Nous viendrons dès que possible.", "viendrons", ["come", "will come"]);
expect("Si j'avais le temps, je viendrais.", "viendrais", ["come", "would come"]);
expect("Il faut que tu sois à l'heure.", "sois", ["be", "are"]);
expect("Elle allait souvent au théâtre.", "allait", ["go", "went", "used to go"]);
expect("Ils ont pris le dernier train.", "pris", ["taken", "took", "take"]);
expect("Le rapport a été publié hier.", "publié", ["publish"]);

console.log("--- Tapping inside expressions ---");
// Every word of an expression must reach the same expression.
for (const [sentence, words, expression] of [
  ["Elle se rend compte de son erreur.", ["rend", "compte"], "se rendre compte"],
  ["Il a besoin de partir tout de suite.", ["besoin"], "avoir besoin de"],
  ["Nous avons envie de rester ici.", ["envie"], "avoir envie de"],
  ["Il est en train de préparer le dîner.", ["train"], "en train de"],
  ["La réunion a eu lieu hier matin.", ["lieu"], "avoir lieu"],
  ["Le gouvernement veut mettre en place une réforme.", ["place"], "mettre en place"],
  ["Ce pays fait partie de l'Union européenne.", ["partie"], "faire partie de"],
  ["Il faut prendre en compte tous les risques.", ["compte"], "prendre en compte"],
]) {
  for (const word of words) {
    const result = resolve(sentence, word);
    check(
      `"${word}" resolves to the expression ${expression}`,
      normalise(result.partOfExpression ?? "").includes(normalise(expression)),
      `partOfExpression=${result.partOfExpression} meaning="${result.displayEnglish}"`
    );
    check(`"${word}" in an expression stays local`, shouldEscalateToAi(result) === false);
  }
}

console.log("--- Proper nouns in running text ---");
for (const [sentence, name] of [
  ["Emmanuel Macron a rencontré la presse à Paris.", "Macron"],
  ["Emmanuel Macron a rencontré la presse à Paris.", "Paris"],
  ["Marie habite à Lyon depuis deux ans.", "Marie"],
  ["L'équipe de Marseille a gagné le match.", "Marseille"],
]) {
  const result = resolve(sentence, name);
  check(
    `"${name}" is not translated away`,
    normalise(result.displayEnglish).includes(normalise(name)) || result.abstained,
    result.displayEnglish
  );
}

console.log("--- Escalation stays proportionate ---");
{
  // The whole corpus above, re-walked: count how often ordinary reading would
  // hit the network. A resolver that escalates freely is as broken as one that
  // guesses freely, just in the other direction.
  const ordinary = [
    ["Léa se lève à sept heures du matin.", "lève"],
    ["Elle ouvre la fenêtre de la cuisine.", "fenêtre"],
    ["Le chat dort sur le canapé du salon.", "chat"],
    ["Mon frère habite dans une petite maison.", "maison"],
    ["La voiture rouge est garée devant l'école.", "voiture"],
    ["Il boit un verre d'eau très froide.", "eau"],
    ["Le train part de la gare à midi.", "gare"],
    ["Je voudrais un café et un croissant.", "café"],
    ["Le livre est sur la table de la cuisine.", "sur"],
    ["Il marche vers la sortie sans rien dire.", "vers"],
    ["Il habite à Lyon depuis 2010.", "depuis"],
    ["Il travaille bien malgré la fatigue.", "bien"],
    ["Nous allons au cinéma ce soir.", "au"],
    ["Il ne veut pas partir avant la fin.", "pas"],
    ["Elle porte une robe bleue aujourd'hui.", "porte"],
    ["C'est son tour de jouer maintenant.", "tour"],
    ["Elle étudie le droit à l'université.", "droit"],
    ["Il fait beau et chaud aujourd'hui.", "fait"],
    ["Elle prend le train de sept heures.", "prend"],
    ["Le chien la suit partout dans la maison.", "suit"],
  ];
  const escalating = ordinary.filter(([s, w]) => shouldEscalateToAi(resolve(s, w)));
  check(
    "ordinary reading almost never needs the network",
    escalating.length <= 1,
    `${escalating.length}/${ordinary.length} escalated: ${escalating.map(([, w]) => w).join(", ")}`
  );
}

console.log("--- Ambiguity helpers ---");
check("near-synonyms count as one meaning", materiallyDistinctSenses(["cat", "tomcat"]) === 1);
check("unrelated senses count separately", materiallyDistinctSenses(["tower", "turn", "trick"]) === 3);
check("verb-particle variants count as one", materiallyDistinctSenses(["to put", "to put on"]) === 1);
check("spelling variants count as one", materiallyDistinctSenses(["to realize", "to realise"]) === 1);
check("an empty list has no meanings", materiallyDistinctSenses([]) === 0);
check("identical senses agree", sensesAgree("to realise", "realise") === true);
check("paraphrases agree", sensesAgree("the political party", "party") === true);
check("opposites do not agree", sensesAgree("on", "underneath") === false);
check("a clause does not agree with a word", sensesAgree("to realise", "comes to understand the whole situation at last") === false);
check("nothing agrees with an empty string", sensesAgree("on", "") === false);

console.log("--- Cache identity over the corpus ---");
{
  const a = meaningCacheKey({ tappedText: "tour", contextSentence: "La tour de l'église domine le village.", lemma: "tour" });
  const b = meaningCacheKey({ tappedText: "tour", contextSentence: "C'est son tour de jouer maintenant.", lemma: "tour" });
  check("one word in two sentences gets two cache keys", a !== b);
  check("the same sentence is stable", a === meaningCacheKey({ tappedText: "tour", contextSentence: "La tour de l'église domine le village.", lemma: "tour" }));
}

if (failures.length > 0) {
  console.log("");
  for (const failure of failures) console.log(`FAIL ${failure}`);
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
