import {
  resolveMeaning,
  isMeaningUpgrade,
  shouldEscalateToAi,
  meaningCacheKey,
} from "../src/lib/dictionary/resolveMeaning.ts";
import { ensureGeneratedDictionary } from "../src/lib/dictionary/lookup.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";

/**
 * Contextual translation regression suite.
 *
 * These are end-to-end assertions about what a reader is actually shown when
 * they tap a word in a sentence — not isolated dictionary lookups. A dictionary
 * test can pass while the reader still sees the wrong sense, because the sense
 * chosen depends on the sentence; that gap is what this file closes.
 *
 * Every case is written as (sentence, tapped word, acceptable meanings). The
 * acceptable list is deliberately generous about wording and strict about
 * sense: "towards" and "toward" are both fine for `vers`; "verse" is not.
 */

await ensureGeneratedDictionary();

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function normalise(value) {
  return String(value).toLowerCase().replace(/[’]/g, "'").trim();
}

function resolve(sentenceText, needle, options = {}) {
  const sentence = tokenizeParagraphsToSentences(sentenceText)[0][0];
  const target = normalise(needle);
  // Elisions stay attached to their word in the tokeniser ("l'escalade" is one
  // token) because that is what the reader sees and taps, so match on the
  // lexical tail too rather than rewriting the test sentences to avoid them.
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

/** The shown meaning contains one of the acceptable readings. */
function meansAnyOf(result, expected) {
  return expected.some((value) => normalise(result.displayEnglish).includes(normalise(value)));
}

function expectMeaning(label, sentence, needle, expected) {
  const values = Array.isArray(expected) ? expected : [expected];
  const result = resolve(sentence, needle);
  check(
    label,
    meansAnyOf(result, values),
    `tapped "${needle}" in "${sentence}" -> "${result.displayEnglish}" (${result.source}/${result.confidence})`
  );
}

/** Asserts the shown meaning does NOT contain a wrong reading. */
function refuteMeaning(label, sentence, needle, forbidden) {
  const values = Array.isArray(forbidden) ? forbidden : [forbidden];
  const result = resolve(sentence, needle);
  const offending = values.find((value) => normalise(result.displayEnglish) === normalise(value));
  check(label, !offending, `tapped "${needle}" -> "${result.displayEnglish}" (${result.source})`);
}

function expectExpression(label, sentence, needle, expression, expected) {
  const result = resolve(sentence, needle);
  const values = Array.isArray(expected) ? expected : [expected];
  check(
    label,
    normalise(result.partOfExpression ?? "").includes(normalise(expression)) && meansAnyOf(result, values),
    `tapped "${needle}" -> expression=${result.partOfExpression} meaning="${result.displayEnglish}"`
  );
}

console.log("--- Known historical failures ---");
// These three shipped to readers. The dictionary layers can technically
// justify each one; context cannot. They must never come back.
refuteMeaning("sur is not 'sour'", "Le livre est sur la table.", "sur", ["sour"]);
refuteMeaning("sur is not 'sour' (abstract use)", "Il travaille sur un nouveau projet.", "sur", ["sour"]);
expectMeaning("sur means on/about", "Le livre est sur la table.", "sur", ["on", "upon", "about"]);
refuteMeaning("moi is not 'ego'", "Il me regarde, moi.", "moi", ["ego", "self"]);
expectMeaning("moi means me", "Donne-le moi.", "moi", ["me"]);
refuteMeaning("vers is not 'verse'", "Il marche vers la gare.", "vers", ["verse", "worms", "worm"]);
expectMeaning("vers means towards", "Il marche vers la gare.", "vers", ["towards", "toward"]);
refuteMeaning("ne is not the abbreviation 'NE'", "Il ne veut pas partir.", "ne", ["ne", "n.e."]);
refuteMeaning("est is not the compass bearing 'SSE'", "Il est content.", "est", ["sse", "e"]);

console.log("--- Idioms and fixed expressions ---");
expectExpression("se rendre compte wins over 'account'", "Elle se rend compte du problème.", "compte", "se rendre compte", ["realize", "realise"]);
refuteMeaning("compte inside se rendre compte is never 'account'", "Elle se rend compte du problème.", "compte", ["account"]);
expectExpression("avoir besoin de wins over 'need' the noun", "Il a besoin de partir.", "besoin", "avoir besoin de", ["to need"]);
expectExpression("avoir envie de resolves as an expression", "Il a envie de partir.", "envie", "avoir envie de", ["want", "feel like"]);
expectExpression("être en train de resolves as an expression", "Il est en train de manger.", "train", "en train de", ["in the middle of", "in the process of", "currently"]);
refuteMeaning("train inside en train de is not the vehicle", "Il est en train de manger.", "train", ["train"]);
expectExpression("il y a resolves as an expression", "Il y a beaucoup de monde.", "y", "il y a", ["there is", "there are"]);
expectExpression("avoir lieu means to take place", "La réunion a eu lieu hier.", "lieu", "avoir lieu", ["take place"]);
expectExpression("mettre en place means to set up", "Le gouvernement veut mettre en place une réforme.", "place", "mettre en place", ["set up", "establish", "implement"]);
expectExpression("faire partie de means to be part of", "Ce pays fait partie de l'Union.", "partie", "faire partie de", ["part of"]);
expectExpression("prendre en compte means to take into account", "Il faut prendre en compte les risques.", "compte", "prendre en compte", ["into account", "take account"]);

{
  // Tapping any word of an expression must give the same expression — this is
  // the property that let the long-press gesture be removed.
  const sentence = "Elle se rend compte du problème.";
  const fromRend = resolve(sentence, "rend");
  const fromCompte = resolve(sentence, "compte");
  check(
    "every word of an expression resolves to the same expression",
    fromRend.displayEnglish === fromCompte.displayEnglish && !!fromRend.partOfExpression,
    JSON.stringify({ rend: fromRend.displayEnglish, compte: fromCompte.displayEnglish })
  );
  check(
    "the tapped word is still reported alongside the expression",
    fromCompte.tappedText === "compte" && fromCompte.displayFrench !== "compte",
    JSON.stringify({ tapped: fromCompte.tappedText, shown: fromCompte.displayFrench })
  );
}

console.log("--- Polysemy ---");
expectMeaning("compte alone is account/count", "Il a ouvert un compte bancaire.", "compte", ["account", "count"]);
expectMeaning("sens after a determiner is meaning", "Le sens de la phrase est clair.", "sens", ["meaning", "sense"]);
expectMeaning("sens in traffic context is direction", "La rue est à sens unique dans ce quartier.", "sens", ["direction", "way"]);
expectMeaning("sens after a subject pronoun is the verb", "Je sens une odeur étrange.", "sens", ["feel", "smell"]);
expectMeaning("temps defaults to time", "Le temps passe vite.", "temps", ["time"]);
expectMeaning("temps in a weather frame is weather", "Quel temps fait-il aujourd'hui ?", "temps", ["weather"]);
expectMeaning("depuis means since/for", "Il habite ici depuis 2010.", "depuis", ["since", "for"]);
expectMeaning("encore after a state verb is still", "Il est encore là.", "encore", ["still"]);
expectMeaning("encore before a quantity is another/more", "Je voudrais encore un café.", "encore", ["another", "more"]);
expectMeaning("pas encore is not yet", "Il n'est pas encore arrivé.", "encore", ["not yet"]);
expectMeaning("même without a determiner is even", "Même les enfants comprennent.", "même", ["even"]);
expectMeaning("même after a determiner is same", "Ils sont arrivés le même jour.", "même", ["same"]);
expectMeaning("bien means well/quite", "Il travaille bien.", "bien", ["well", "quite", "good", "indeed"]);
expectMeaning("passer un examen means to take an exam", "Il va passer un examen demain.", "passer", ["take an exam", "sit an exam"]);
expectMeaning("rendre + adjective means to make", "Cela me rend heureux.", "rend", ["make", "render"]);
expectMeaning("manquer with a person subject is to miss", "Tu me manques beaucoup.", "manques", ["miss"]);

console.log("--- Pronouns and clitics ---");
expectMeaning("y as an adverbial pronoun", "Il y va demain.", "y", ["there", "to it"]);
expectMeaning("en as a pronoun", "Elle en parle souvent.", "en", ["of it", "about it", "some"]);
expectMeaning("lui as an indirect object", "Je lui donne le livre.", "lui", ["to him", "to her", "him", "her"]);
expectMeaning("leur before a verb is to them", "Je leur parle tous les jours.", "leur", ["to them", "them"]);
expectMeaning("le before a verb is a direct object", "Je le vois souvent.", "le", ["him", "it"]);
expectMeaning("la before a verb is a direct object", "Je la connais bien.", "la", ["her", "it"]);
expectMeaning("le before a noun is the article", "Le livre est ouvert.", "le", ["the"]);
expectMeaning("me as a clitic", "Il me parle souvent.", "me", ["me", "to me"]);
expectMeaning("se as a reflexive", "Il se lave les mains.", "se", ["himself", "oneself", "herself", "themselves"]);

console.log("--- Contractions ---");
expectMeaning("au expands to to the / at the", "Il va au marché.", "au", ["to the", "at the"]);
expectMeaning("aux expands to to the / at the", "Il parle aux enfants.", "aux", ["to the", "at the"]);
expectMeaning("du expands to of the / some", "Il revient du stade.", "du", ["of the", "from the", "some"]);
expectMeaning("des expands to of the / some", "Il revient des États-Unis.", "des", ["of the", "from the", "some"]);

console.log("--- Verb morphology ---");
expectMeaning("conjugated avoir stays 'have'", "Il a trois enfants.", "a", ["have", "has"]);
expectMeaning("conjugated être stays 'be'", "Elle est médecin.", "est", ["is", "be"]);
expectMeaning("past participle resolves to its lemma's sense", "Il est parti hier.", "parti", ["left", "gone", "depart"]);
expectMeaning("noun parti keeps the political sense", "Le parti annonce son programme.", "parti", ["party"]);
expectMeaning("future form resolves", "Il viendra demain.", "viendra", ["come", "will come"]);
expectMeaning("imperfect form resolves", "Elle allait souvent au cinéma.", "allait", ["go", "went", "used to go"]);

{
  const political = resolve("Le parti annonce son programme.", "parti");
  const departed = resolve("Il est parti hier.", "parti");
  check(
    "the same spelling gets different meanings in different sentences",
    political.displayEnglish !== departed.displayEnglish,
    JSON.stringify({ political: political.displayEnglish, departed: departed.displayEnglish })
  );
  check(
    "cache keys separate the two senses so one cannot leak into the other",
    political.cacheKey !== departed.cacheKey
  );
}

console.log("--- Negation ---");
expectMeaning("ne...pas negation is surfaced", "Il ne veut pas partir.", "pas", ["not"]);
expectMeaning("ne...plus means no longer", "Il ne travaille plus ici.", "plus", ["no longer", "not anymore", "anymore"]);
expectMeaning("ne...jamais means never", "Il n'est jamais venu.", "jamais", ["never"]);
expectMeaning("ne...rien means nothing", "Il ne dit rien.", "rien", ["nothing", "anything"]);
{
  const result = resolve("Il ne veut pas partir.", "veut");
  check("negation is recorded in the grammar detail", result.grammar?.negated === true, JSON.stringify(result.grammar));
}

console.log("--- Function words keep their common sense ---");
// Rare-but-real dictionary senses must never outrank the everyday reading of a
// word a learner meets in every other sentence.
expectMeaning("de means of/from", "C'est la voiture de Marie.", "de", ["of", "from", "'s"]);
expectMeaning("pour means for/to", "C'est pour toi.", "pour", ["for", "to", "in order"]);
expectMeaning("avec means with", "Il vient avec nous.", "avec", ["with"]);
expectMeaning("mais means but", "Il est fatigué mais content.", "mais", ["but"]);
expectMeaning("donc means so/therefore", "Il pleut, donc je reste.", "donc", ["so", "therefore", "thus"]);
expectMeaning("dans means in", "Il est dans la cuisine.", "dans", ["in", "into", "inside"]);
expectMeaning("chez means at someone's", "Il est chez lui.", "chez", ["at", "home", "with"]);
expectMeaning("entre means between", "Entre les deux maisons.", "entre", ["between", "among"]);

console.log("--- News and headline language ---");
expectMeaning("hausse means rise/increase", "Budget : nouvelle hausse des prix", "hausse", ["rise", "increase"]);
expectMeaning("baisse means fall/decrease", "Forte baisse du chômage en France", "baisse", ["fall", "drop", "decrease", "decline"]);
expectMeaning("frappes in a conflict headline means strikes", "Des frappes ont visé la capitale.", "frappes", ["strike"]);
expectMeaning("escalade means escalation in the news", "L'escalade du conflit inquiète les diplomates.", "escalade", ["escalation"]);
expectMeaning("porte-parole means spokesperson", "Le porte-parole du gouvernement a réagi.", "porte-parole", ["spokesperson", "spokesman", "spokeswoman"]);
expectMeaning("mesures means measures", "Le gouvernement annonce de nouvelles mesures.", "mesures", ["measure", "step"]);

console.log("--- Proper nouns ---");
{
  const macron = resolve("Emmanuel Macron parle à Paris.", "Macron");
  check("a person's name is not translated away", normalise(macron.displayEnglish).includes("macron"), macron.displayEnglish);
  const paris = resolve("Emmanuel Macron parle à Paris.", "Paris");
  check("a place name is not translated away", normalise(paris.displayEnglish).includes("paris"), paris.displayEnglish);
  const invented = resolve("Zblorknik Vandermeer arrive demain.", "Zblorknik");
  check(
    "an unknown capitalised word is kept as a name rather than guessed at",
    normalise(invented.displayEnglish).includes("zblorknik") || invented.abstained,
    invented.displayEnglish
  );
}

console.log("--- Abstaining rather than guessing ---");
{
  const nonsense = resolve("Le zzzqwertyx arrive demain.", "zzzqwertyx");
  check("an unrecognised word abstains instead of inventing a meaning", nonsense.abstained === true, JSON.stringify(nonsense));
  check("an abstaining result shows no English", nonsense.displayEnglish === "", nonsense.displayEnglish);
  check("an abstaining result asks for AI escalation", shouldEscalateToAi(nonsense) === true);
}
{
  // Everyday vocabulary must never require a network call.
  const common = ["sur", "vers", "moi", "depuis", "bien", "temps"];
  const sentences = [
    "Le livre est sur la table.",
    "Il marche vers la gare.",
    "Il me regarde, moi.",
    "Il habite ici depuis 2010.",
    "Il travaille bien.",
    "Le temps passe vite.",
  ];
  const escalated = common.filter((word, i) => shouldEscalateToAi(resolve(sentences[i], word)));
  check("common words resolve offline with no AI escalation", escalated.length === 0, `escalated: ${escalated.join(", ")}`);
}

console.log("--- One authoritative answer, not competing ones ---");
{
  // A clause-sized alignment is useful to read but is not this word's meaning.
  const clause = [{ french: "se rend compte du problème", english: "comes to understand the whole situation at last" }];
  const result = resolve("Elle se rend compte du problème.", "compte", { alignments: clause });
  check(
    "a clause-sized alignment never becomes a single word's headline meaning",
    result.source !== "natural-alignment" && result.displayEnglish.split(" ").length < 6,
    `${result.source}: ${result.displayEnglish}`
  );
}
{
  const tight = [{ french: "la table", english: "the table" }];
  const result = resolve("Le livre est sur la table.", "table", { alignments: tight });
  check("a word-scoped alignment is allowed to answer", !result.abstained && !!result.displayEnglish, JSON.stringify(result));
}
{
  // A late-loading article translation must not displace a confident answer.
  const late = [{ french: "sur", english: "atop" }];
  const result = resolve("Le livre est sur la table.", "sur", { alignments: late });
  check(
    "a late alignment does not displace a high-confidence local answer",
    result.confidence === "high" && result.source !== "natural-alignment",
    `${result.source}/${result.confidence}: ${result.displayEnglish}`
  );
}
{
  const result = resolve("Elle se rend compte du problème.", "compte");
  check(
    "alternatives are supporting detail and never repeat the headline",
    !result.alternatives.some((alt) => normalise(alt) === normalise(result.displayEnglish)),
    JSON.stringify(result.alternatives)
  );
}

console.log("--- Deterministic loading behaviour ---");
{
  const key = "same-tap";
  const low = { cacheKey: key, abstained: false, confidence: "low" };
  const medium = { cacheKey: key, abstained: false, confidence: "medium" };
  const high = { cacheKey: key, abstained: false, confidence: "high" };
  const abstained = { cacheKey: key, abstained: true, confidence: "low" };

  check("a more confident answer replaces a weaker one", isMeaningUpgrade(low, high) === true);
  check("a weaker answer never replaces a stronger one", isMeaningUpgrade(high, low) === false);
  check("an equally confident answer does not cause a visible flip", isMeaningUpgrade(medium, { ...medium }) === false);
  check("escaping an abstain is always an upgrade", isMeaningUpgrade(abstained, low) === true);
  check("a real answer is never replaced by an abstain", isMeaningUpgrade(medium, abstained) === false);
  check("a different tap always replaces what is on screen", isMeaningUpgrade(medium, { ...medium, cacheKey: "other-tap" }) === true);
  check("there is nothing to preserve before the first result", isMeaningUpgrade(null, low) === true);
}
{
  // AI escalation is only consulted where local resolution actually failed.
  const ai = { translation: "widget", meaningInContext: "a made-up thing" };
  const rescued = resolve("Le zzzqwertyx arrive demain.", "zzzqwertyx", { aiMeaning: ai });
  check("an AI meaning rescues a word the offline layers could not resolve", rescued.abstained === false && rescued.source === "ai-contextual", JSON.stringify(rescued));

  const confident = resolve("Le livre est sur la table.", "sur", { aiMeaning: { translation: "atop" } });
  check("an AI meaning never overrides a confident local answer", confident.source !== "ai-contextual", `${confident.source}: ${confident.displayEnglish}`);
}

console.log("--- Cache keys are context-scoped ---");
{
  const a = meaningCacheKey({ tappedText: "compte", contextSentence: "Elle se rend compte du problème.", lemma: "compte" });
  const b = meaningCacheKey({ tappedText: "compte", contextSentence: "Il a ouvert un compte bancaire.", lemma: "compte" });
  check("the same word in different sentences gets different cache keys", a !== b);
  const repeat = meaningCacheKey({ tappedText: "compte", contextSentence: "Elle se rend compte du problème.", lemma: "compte" });
  check("the same tap is stable across calls so a repeat tap hits cache", a === repeat);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
