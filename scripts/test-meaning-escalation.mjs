import { resolveMeaning, shouldEscalateToAi, isMeaningUpgrade, aiMeaningCacheKey } from "../src/lib/dictionary/resolveMeaning.ts";
import { ensureGeneratedDictionary } from "../src/lib/dictionary/lookup.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";

/**
 * When Lire is allowed to reach the network, and what it does when that fails.
 *
 * Two failure modes matter equally here and pull in opposite directions. A
 * resolver that escalates freely turns every tap into an API call and a
 * spinner; one that never escalates goes back to confidently teaching whatever
 * gloss happened to be first. These tests pin both edges, plus the caching
 * that keeps a re-tap free and the isolation that stops one sentence's answer
 * leaking into another.
 *
 * The AI itself is stubbed. resolveMeaning takes an already-fetched meaning as
 * input rather than fetching one, so escalation policy is testable without a
 * network or a key — the fetch lives in Reader.escalateMeaningToAi, gated by
 * shouldEscalateToAi, which is what these assertions exercise.
 */

await ensureGeneratedDictionary();

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) passed++;
  else {
    failed++;
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function resolve(sentenceText, needle, options = {}) {
  const sentence = tokenizeParagraphsToSentences(sentenceText)[0][0];
  const target = needle.toLowerCase();
  // Elisions stay attached to their word in the tokeniser ("d'eau" is one
  // token), matching what the reader sees and taps.
  const index = sentence.tokens.findIndex(
    (token) =>
      token.isWord &&
      (token.clean.toLowerCase() === target ||
        token.text.toLowerCase() === target ||
        token.clean.toLowerCase().replace(/^(?:[cdjlmnst]|qu)['’]/u, "") === target)
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

console.log("--- Obvious meanings stay local ---");
for (const [sentence, word] of [
  ["Le livre est sur la table de la cuisine.", "sur"],
  ["Il marche vers la sortie sans rien dire.", "vers"],
  ["Elle ouvre la fenêtre de la cuisine.", "fenêtre"],
  ["Le chat dort sur le canapé du salon.", "chat"],
  ["La voiture rouge est garée devant l'école.", "voiture"],
  ["Il boit un verre d'eau très froide.", "eau"],
  ["Mon frère habite dans une petite maison.", "maison"],
  ["Nous allons au cinéma ce soir.", "au"],
  ["Il ne veut pas partir avant la fin.", "pas"],
  ["Il habite à Lyon depuis 2010.", "depuis"],
  ["Je lui ai donné le livre hier soir.", "lui"],
  ["Elle en parle souvent à ses collègues.", "en"],
]) {
  const result = resolve(sentence, word);
  check(`"${word}" stays local`, shouldEscalateToAi(result) === false, `${result.source}/${result.confidence}`);
  check(`"${word}" produces an answer`, result.abstained === false && !!result.displayEnglish);
}

console.log("--- Recognised expressions stay local ---");
for (const [sentence, word] of [
  ["Elle se rend compte de son erreur.", "compte"],
  ["Il a besoin de partir tout de suite.", "besoin"],
  ["La réunion a eu lieu hier matin.", "lieu"],
  ["Ce pays fait partie de l'Union européenne.", "partie"],
  ["Il est en train de préparer le dîner.", "train"],
]) {
  const result = resolve(sentence, word);
  check(`expression via "${word}" stays local`, shouldEscalateToAi(result) === false, `${result.source}/${result.confidence}`);
  check(`expression via "${word}" is high confidence`, result.confidence === "high", result.confidence);
}

console.log("--- Genuinely unresolved cases escalate ---");
{
  const unknown = resolve("Le zzzqwertyx arrive demain.", "zzzqwertyx");
  check("an unknown word escalates", shouldEscalateToAi(unknown) === true);
  check("an unknown word abstains rather than guessing", unknown.abstained === true);
  check("an abstaining result shows no English at all", unknown.displayEnglish === "");
}
{
  // A contradicting article translation is a reason to doubt a lexical answer.
  const contradicted = resolve("Le livre est sur la table.", "sur", {
    alignments: [{ french: "sur", english: "underneath" }],
  });
  check("a contradicted lexical answer escalates", shouldEscalateToAi(contradicted) === true);
  check("a contradicted answer is marked low confidence", contradicted.confidence === "low");
}

console.log("--- Escalation is proportionate, not reflexive ---");
{
  const corpus = [
    ["Léa se lève à sept heures du matin.", "lève"],
    ["Elle ouvre la fenêtre de la cuisine.", "fenêtre"],
    ["Le chat dort sur le canapé.", "chat"],
    ["Mon frère habite dans une petite maison.", "maison"],
    ["Nous mangeons du pain et du fromage.", "pain"],
    ["La voiture rouge est garée devant l'école.", "voiture"],
    ["Il boit un verre d'eau froide.", "eau"],
    ["Les enfants jouent dans le jardin.", "enfants"],
    ["Elle achète des fruits au marché.", "marché"],
    ["Le train part de la gare à midi.", "gare"],
    ["Je voudrais un café et un croissant.", "café"],
    ["Ma soeur travaille dans un hôpital.", "hôpital"],
    ["Elle écrit une lettre à son amie.", "lettre"],
    ["Le repas est prêt sur la table.", "repas"],
    ["Nous regardons un film ce soir.", "film"],
    ["Le livre est sur la table.", "sur"],
    ["Il marche vers la sortie.", "vers"],
    ["Il habite ici depuis 2010.", "depuis"],
    ["Il travaille bien malgré la fatigue.", "bien"],
    ["C'est son tour de jouer.", "tour"],
  ];
  const escalating = corpus.filter(([s, w]) => shouldEscalateToAi(resolve(s, w)));
  const rate = escalating.length / corpus.length;
  check(
    "fewer than one in five ordinary taps reaches the network",
    rate < 0.2,
    `${escalating.length}/${corpus.length}: ${escalating.map(([, w]) => w).join(", ")}`
  );
}

console.log("--- AI results are accepted only where local resolution failed ---");
{
  const rescued = resolve("Le zzzqwertyx arrive demain.", "zzzqwertyx", {
    aiMeaning: { translation: "a widget", meaningInContext: "an invented device" },
  });
  check("an AI answer rescues an abstained word", rescued.abstained === false);
  check("the rescued answer is attributed to AI", rescued.source === "ai-contextual", rescued.source);
  check("a rescued answer stops asking for escalation", shouldEscalateToAi(rescued) === false);
}
{
  const untouched = resolve("Le livre est sur la table.", "sur", { aiMeaning: { translation: "beneath" } });
  check("an AI answer never overrides a confident local one", untouched.source !== "ai-contextual", untouched.source);
  check("the confident local answer is what is shown", untouched.displayEnglish === "on", untouched.displayEnglish);
}

console.log("--- Failed AI resolution keeps the restrained state ---");
{
  // The Reader passes no aiMeaning when the call errors or returns nothing, so
  // re-resolving must land back on the honest uncertainty state rather than on
  // some weaker gloss.
  const failedNetwork = resolve("Le zzzqwertyx arrive demain.", "zzzqwertyx", { aiMeaning: null });
  check("a failed AI call leaves the word abstained", failedNetwork.abstained === true);
  check("a failed AI call shows no invented meaning", failedNetwork.displayEnglish === "");

  const emptyAnswer = resolve("Le zzzqwertyx arrive demain.", "zzzqwertyx", { aiMeaning: { translation: "   " } });
  check("a blank AI answer is not treated as a result", emptyAnswer.abstained === true, emptyAnswer.displayEnglish);

  // And an arriving AI answer must not be able to *replace* a good local one
  // through the upgrade path either.
  const local = resolve("Le livre est sur la table.", "sur");
  const withAi = resolve("Le livre est sur la table.", "sur", { aiMeaning: { translation: "beneath" } });
  check("a late AI answer is not an upgrade over a confident local answer", isMeaningUpgrade(local, withAi) === false);
}

console.log("--- Caching and context isolation ---");
{
  const sentence = "Elle se rend compte de son erreur.";
  const first = resolve(sentence, "compte");
  const second = resolve(sentence, "compte");
  check("re-tapping the same word in the same sentence is cache-identical", first.cacheKey === second.cacheKey);
  check("a repeat tap returns the same meaning", first.displayEnglish === second.displayEnglish);
  check("a repeat tap does not newly escalate", shouldEscalateToAi(second) === false);
  check(
    "the AI cache key is the same for a repeat tap",
    aiMeaningCacheKey("compte", sentence) === aiMeaningCacheKey("compte", sentence)
  );
}
{
  // The whole point of a *contextual* meaning: the same word elsewhere is a
  // different question and must not be served the first answer.
  const a = resolve("La tour de l'église domine le village.", "tour");
  const b = resolve("C'est son tour de jouer maintenant.", "tour");
  check("the same word in a different sentence gets a different cache key", a.cacheKey !== b.cacheKey);
  check("the same word in a different sentence can mean something else", a.displayEnglish !== b.displayEnglish, `${a.displayEnglish} vs ${b.displayEnglish}`);
  check(
    "AI cache keys are context-scoped too",
    aiMeaningCacheKey("tour", "La tour de l'église domine le village.") !== aiMeaningCacheKey("tour", "C'est son tour de jouer maintenant.")
  );
  check("a different tap always replaces what is on screen", isMeaningUpgrade(a, b) === true);
}

if (failures.length > 0) {
  console.log("");
  for (const failure of failures) console.log(`FAIL ${failure}`);
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
