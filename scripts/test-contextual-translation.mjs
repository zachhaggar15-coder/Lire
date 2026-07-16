import { buildContextualTranslation, contextualTranslationCacheKey, normaliseContextText } from "../src/lib/dictionary/contextualTranslation.ts";
import { lookupWord } from "../src/lib/dictionary/lookup.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`OK ${label}`);
  } else {
    failed++;
    console.log(`FAIL ${label}${detail ? ` - ${detail}` : ""}`);
  }
}

function normalise(value) {
  return String(value).toLowerCase().replace(/[’]/g, "'");
}

function adjacentWords(tokens, index) {
  let previousWord = null;
  for (let i = index - 1; i >= 0; i--) {
    if (tokens[i].isWord) {
      previousWord = tokens[i].clean;
      break;
    }
  }
  let nextWord = null;
  for (let i = index + 1; i < tokens.length; i++) {
    if (tokens[i].isWord) {
      nextWord = tokens[i].clean;
      break;
    }
  }
  return { previousWord, nextWord };
}

function contextual(sentenceText, needle) {
  const sentence = tokenizeParagraphsToSentences(sentenceText)[0][0];
  const index = sentence.tokens.findIndex(
    (token) =>
      token.isWord &&
      (normalise(token.clean) === normalise(needle) ||
        normalise(token.text) === normalise(needle) ||
        normalise(token.clean).includes(normalise(needle)))
  );
  if (index === -1) throw new Error(`Could not find ${needle} in ${sentenceText}: ${JSON.stringify(sentence.tokens)}`);
  const lookup = lookupWord(sentence.tokens[index].text, adjacentWords(sentence.tokens, index));
  return buildContextualTranslation({
    tokens: sentence.tokens,
    tokenIndex: index,
    contextSentence: sentence.text,
    lookup,
  });
}

function hasText(result, expected) {
  return normalise(result.contextualTranslation).includes(normalise(expected));
}

console.log("--- Contextual translation pipeline ---");

{
  const cleaned = normaliseContextText("Le <strong>march&eacute;</strong>&nbsp;ouvre &amp; attire.");
  check("residual HTML and entities are removed before context analysis", cleaned === "Le marche ouvre & attire.", cleaned);
}

{
  const article = tokenizeParagraphsToSentences("Budget: nouvelle hausse des prix\n\nLe parti annonce son programme.");
  check("headline fragments and paragraph sentence extraction stay usable", article.length === 2 && article[0][0].text.includes("hausse"));
}

{
  const result = contextual("J'ai attendu le bus.", "j'ai");
  check("j'ai is treated as je + ai, not a bare dictionary word", hasText(result, "I have"), JSON.stringify(result));
}
{
  const result = contextual("C’est deja fini.", "c'est");
  check("unicode apostrophe c'est resolves as it is / this is", hasText(result, "it is"), JSON.stringify(result));
}
{
  const result = contextual("Il dit qu'il viendra.", "qu'il");
  check("qu'il resolves as that he/it", hasText(result, "that he"), JSON.stringify(result));
}
{
  const result = contextual("L'homme arrive.", "l'homme");
  check("l'homme expands to the article plus noun meaning", hasText(result, "the man"), JSON.stringify(result));
}
{
  const result = contextual("D'accord, on commence.", "d'accord");
  check("d'accord resolves as an everyday fixed expression", hasText(result, "okay") && ["contraction", "phrasebank"].includes(result.source), JSON.stringify(result));
}

{
  const result = contextual("A-t-il compris la question ?", "a-t-il");
  check("hyphenated inversion reports question grammar", result.grammar?.mood === "interrogative" && result.grammar?.person === "third", JSON.stringify(result));
}
{
  const result = contextual("Parlez-en demain.", "parlez-en");
  check("imperative with attached en is explained as about it/of it", result.grammar?.mood === "imperative" && hasText(result, "about it"), JSON.stringify(result));
}

{
  const result = contextual("Elle se rend compte du probleme.", "rend");
  check("tapping inside se rendre compte expands to the phrase meaning", result.expandedPhrase?.includes("se rend compte") && hasText(result, "realize"), JSON.stringify(result));
}
{
  const result = contextual("Il met fin à la crise.", "fin");
  check("tapping the middle of mettre fin à returns the phrase meaning", result.expandedPhrase?.includes("met fin") && hasText(result, "put an end"), JSON.stringify(result));
}
{
  const result = contextual("Il met fin a la crise.", "fin");
  check("accentless imported text still matches mettre fin à", result.expandedPhrase?.includes("met fin") && hasText(result, "put an end"), JSON.stringify(result));
}
{
  const result = contextual("Il en a marre de la pluie.", "marre");
  check("informal idiom en avoir marre resolves as fed up", result.expandedPhrase?.includes("a marre") && hasText(result, "fed up"), JSON.stringify(result));
}
{
  const result = contextual("J'ai besoin de temps.", "besoin");
  check("elided j'ai still matches avoir besoin de", result.expandedPhrase?.includes("besoin de") && hasText(result, "need"), JSON.stringify(result));
}
{
  const result = contextual("J'ai envie de partir.", "envie");
  check("new phrase coverage catches avoir envie de", result.expandedPhrase?.includes("envie de") && hasText(result, "want"), JSON.stringify(result));
}
{
  const result = contextual("Le gouvernement met l'accent sur la prévention.", "accent");
  check("new phrase coverage catches mettre l'accent sur", result.expandedPhrase?.includes("accent") && hasText(result, "emphasize"), JSON.stringify(result));
}
{
  const result = contextual("Elle rend hommage aux victimes.", "hommage");
  check("new phrase coverage catches rendre hommage à", result.expandedPhrase?.includes("hommage") && hasText(result, "tribute"), JSON.stringify(result));
}
{
  const result = contextual("La police place le suspect en garde à vue.", "garde");
  check("new legal phrase coverage catches garde à vue", result.expandedPhrase?.includes("garde") && hasText(result, "police custody"), JSON.stringify(result));
}
{
  const result = contextual("Autrement dit, c'est-à-dire que la mesure change.", "c'est-à-dire");
  check("single-token fixed expressions are treated as phrase-like", result.source === "phrasebank" && hasText(result, "that is to say"), JSON.stringify(result));
}

{
  const result = contextual("Il a pris le train.", "pris");
  check("compound tense uses the nearby auxiliary in the contextual card", result.grammar?.tense === "passe compose" && hasText(result, "taken"), JSON.stringify(result));
}
{
  const result = contextual("Elle parlait lentement.", "parlait");
  check("imperfect forms are identified locally", result.grammar?.tense === "imperfect", JSON.stringify(result));
}
{
  const result = contextual("Il viendra demain.", "viendra");
  check("future forms are identified locally", result.grammar?.tense === "future" && hasText(result, "will"), JSON.stringify(result));
}
{
  const result = contextual("Je voudrais un café.", "voudrais");
  check("conditional forms are identified locally", result.grammar?.tense === "conditional" && hasText(result, "would"), JSON.stringify(result));
}
{
  const result = contextual("Il faut qu'il soit prêt.", "soit");
  check("subjunctive forms are identified locally", result.grammar?.mood === "subjunctive", JSON.stringify(result));
}
{
  const result = contextual("Regardez cette phrase.", "regardez");
  check("imperative verb forms are identified locally", result.grammar?.mood === "imperative", JSON.stringify(result));
}
{
  const result = contextual("Les portes sont ouvertes.", "ouvertes");
  check("adjective/past-participle agreement is surfaced", result.grammar?.gender === "feminine" && result.grammar?.number === "plural", JSON.stringify(result));
}

{
  const result = contextual("Il y va demain.", "y");
  check("y is prioritized as an adverbial pronoun", result.source === "pronoun" && hasText(result, "there"), JSON.stringify(result));
}
{
  const result = contextual("Elle en parle.", "en");
  check("en is prioritized as a pronoun when it stands before a verb", result.source === "pronoun" && hasText(result, "about it"), JSON.stringify(result));
}
{
  const result = contextual("Je le vois.", "le");
  check("le before a verb is shown as a direct-object pronoun", result.source === "pronoun" && hasText(result, "him"), JSON.stringify(result));
}
{
  const result = contextual("Il lui parle.", "lui");
  check("lui is shown as an indirect-object pronoun", result.source === "pronoun" && hasText(result, "to him"), JSON.stringify(result));
}
{
  const result = contextual("Je leur donne une reponse.", "leur");
  check("leur before a verb is shown as to them", result.source === "pronoun" && hasText(result, "to them"), JSON.stringify(result));
}

{
  const result = contextual("Le probleme actuel est grave.", "actuel");
  check("actuel is protected from the English false-friend reading actual", hasText(result, "current") && result.explanation.includes("false-friend"), JSON.stringify(result));
}
{
  const result = contextual("La recette fiscale augmente.", "recette");
  check("recette in fiscal context means revenue, not recipe", hasText(result, "revenue") && result.alternativeMeanings.includes("recipe"), JSON.stringify(result));
}
{
  const result = contextual("Le parti annonce son programme.", "parti");
  check("parti in political context means political party", hasText(result, "political party"), JSON.stringify(result));
}
{
  const result = contextual("Il est parti hier.", "parti");
  check("parti after etre can still mean left/departed", hasText(result, "left"), JSON.stringify(result));
}
{
  const result = contextual("Ce cours de mathematiques est difficile.", "cours");
  check("cours in school context means class/course", hasText(result, "course"), JSON.stringify(result));
}
{
  const result = contextual("À son tour, elle répond.", "tour");
  check("tour in à son tour means turn", hasText(result, "turn"), JSON.stringify(result));
}
{
  const result = contextual("Le bruit entendu dans la rue inquiète les voisins.", "entendu");
  check("entendre in sound context keeps the hear sense", hasText(result, "hear"), JSON.stringify(result));
}
{
  const result = contextual("Cet outil sert à mesurer la temperature.", "sert");
  check("servir à is read as be used for", hasText(result, "used for"), JSON.stringify(result));
}
{
  const result = contextual("Il attend le bus depuis dix minutes.", "attend");
  check("attendre with bus/time context means wait for", hasText(result, "wait"), JSON.stringify(result));
}
{
  const result = contextual("Tu me manques.", "manques");
  check("manquer with an object pronoun means miss / be missed by", hasText(result, "miss"), JSON.stringify(result));
}
{
  const result = contextual("La ville manque de logements.", "manque");
  check("manquer de means lack / be short of", hasText(result, "lack"), JSON.stringify(result));
}
{
  const result = contextual("L'oiseau vole dans le ciel.", "vole");
  check("voler in air context means fly", hasText(result, "fly"), JSON.stringify(result));
}
{
  const result = contextual("Il vole un vélo.", "vole");
  check("voler in property/crime context means steal", hasText(result, "steal"), JSON.stringify(result));
}
{
  const result = contextual("Elle loue un appartement.", "loue");
  check("louer with housing means rent", hasText(result, "rent"), JSON.stringify(result));
}
{
  const result = contextual("Le journal loue son courage.", "loue");
  check("louer with merit context means praise", hasText(result, "praise"), JSON.stringify(result));
}
{
  const result = contextual("Elle assiste à la réunion.", "assiste");
  check("assister à means attend, not assist", hasText(result, "attend"), JSON.stringify(result));
}
{
  const result = contextual("Elle lui apprend le français.", "apprend");
  check("apprendre with an indirect object can mean teach", hasText(result, "teach"), JSON.stringify(result));
}
{
  const result = contextual("Il apprend le français.", "apprend");
  check("apprendre without an indirect object means learn", hasText(result, "learn"), JSON.stringify(result));
}
{
  const result = contextual("La loi défend de fumer.", "défend");
  check("défendre de means forbid", hasText(result, "forbid"), JSON.stringify(result));
}
{
  const result = contextual("Il défend son ami.", "défend");
  check("défendre without de keeps the defend sense", hasText(result, "defend"), JSON.stringify(result));
}
{
  const result = contextual("Les autorités préviennent les habitants.", "préviennent");
  check("prévenir people means warn or notify", hasText(result, "warn"), JSON.stringify(result));
}
{
  const result = contextual("Ce plan prévient les risques.", "prévient");
  check("prévenir risks means prevent", hasText(result, "prevent"), JSON.stringify(result));
}
{
  const result = contextual("Ses propres mots sont clairs.", "propres");
  check("propre after a possessive means own", hasText(result, "own"), JSON.stringify(result));
}
{
  const result = contextual("La chambre est propre.", "propre");
  check("propre in cleaning context means clean", hasText(result, "clean"), JSON.stringify(result));
}
{
  const result = contextual("L'ancien ministre répond.", "ancien");
  check("ancien before a role means former", hasText(result, "former"), JSON.stringify(result));
}
{
  const result = contextual("Un château ancien domine la ville.", "ancien");
  check("ancien with historical things means old or ancient", hasText(result, "old"), JSON.stringify(result));
}
{
  const result = contextual("Il ne travaille plus.", "plus");
  check("plus with negation means no longer", hasText(result, "no longer"), JSON.stringify(result));
}
{
  const result = contextual("Personne ne répond.", "Personne");
  check("personne with negation means nobody", hasText(result, "nobody"), JSON.stringify(result));
}
{
  const result = contextual("Il n'est toujours pas prêt.", "toujours");
  check("toujours pas means still not", hasText(result, "still not"), JSON.stringify(result));
}
{
  const result = contextual("Ce n'est pas encore fini.", "encore");
  check("pas encore means not yet", hasText(result, "not yet"), JSON.stringify(result));
}
{
  const result = contextual("Une hausse sensible des prix inquiète.", "sensible");
  check("sensible with changes means noticeable or significant", hasText(result, "noticeable"), JSON.stringify(result));
}
{
  const result = contextual("Il va à la librairie.", "librairie");
  check("librairie is protected from the English library false friend", hasText(result, "bookshop"), JSON.stringify(result));
}
{
  const result = contextual("Elle achète une voiture d'occasion.", "occasion");
  check("d'occasion means used or second-hand", hasText(result, "used"), JSON.stringify(result));
}
{
  const result = contextual("Il doit dix euros.", "doit");
  check("devoir with money can mean owe", hasText(result, "owe"), JSON.stringify(result));
}
{
  const result = contextual("Elle réalise un film.", "réalise");
  check("réaliser with film/project context means make or carry out", hasText(result, "make") || hasText(result, "carry out"), JSON.stringify(result));
}
{
  const result = contextual("Elle réalise que le problème est grave.", "réalise");
  check("réaliser que means realize", hasText(result, "realize"), JSON.stringify(result));
}

{
  const result = contextual("Il ne veut pas partir.", "veut");
  check("negation around a verb is surfaced in grammar notes", result.grammar?.negated === true, JSON.stringify(result));
}
{
  const au = contextual("Il va au marché et revient du stade.", "au");
  const du = contextual("Il va au marché et revient du stade.", "du");
  check("au and du contractions are expanded", hasText(au, "to the") && hasText(du, "of the"), JSON.stringify({ au, du }));
}
{
  const result = contextual("Emmanuel Macron parle à Paris.", "Macron");
  check("proper nouns are protected rather than translated literally", result.source === "proper-noun" && hasText(result, "Macron"), JSON.stringify(result));
}
{
  const result = contextual("Budget: nouvelle hausse des prix", "hausse");
  check("headline fragments still produce a useful local meaning", hasText(result, "rise") || hasText(result, "increase"), JSON.stringify(result));
}
{
  const result = contextual("zzznocurrencyword arrive.", "zzznocurrencyword");
  check("missing local fallback remains explicit and low confidence", result.source === "missing" && result.confidence === "low", JSON.stringify(result));
}

{
  const political = contextual("Le parti annonce son programme.", "parti");
  const departed = contextual("Il est parti hier.", "parti");
  check("same selected word can have different contextual meanings", political.contextualTranslation !== departed.contextualTranslation, JSON.stringify({ political, departed }));
  check(
    "contextual cache keys include sentence context",
    contextualTranslationCacheKey({ selectedText: "parti", sentence: "Le parti annonce son programme.", lemma: "partir" }) !==
      contextualTranslationCacheKey({ selectedText: "parti", sentence: "Il est parti hier.", lemma: "partir" })
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
