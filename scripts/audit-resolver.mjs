import { resolveWithCandidates } from "../src/lib/dictionary/resolveMeaning.ts";
import { ensureGeneratedDictionary } from "../src/lib/dictionary/lookup.ts";
import { tokenizeParagraphsToSentences } from "../src/lib/words.ts";

/**
 * Resolver behaviour across a broad probe corpus.
 *
 * Reports how ordinary reading actually resolves — locally, via the article
 * translation, by escalating, or by abstaining — plus how often the resolver
 * asserts something at high confidence that the probe says is wrong. That last
 * number is the one that matters: confidently teaching the wrong meaning is the
 * failure this whole architecture exists to prevent.
 *
 * Run with: npm run audit:resolver
 */

await ensureGeneratedDictionary();

/** [sentence, tapped word, acceptable readings] — the accepted list is generous on wording, strict on sense. */
const PROBES = [
  ["Le livre est sur la table de la cuisine.", "sur", ["on", "upon", "about"]],
  ["Il marche vers la sortie sans rien dire.", "vers", ["towards", "toward"]],
  ["Il me regarde, moi.", "moi", ["me"]],
  ["Elle ouvre la fenêtre de la cuisine.", "fenêtre", ["window"]],
  ["Le chat dort sur le canapé du salon.", "chat", ["cat"]],
  ["Mon frère habite dans une petite maison.", "maison", ["house", "home"]],
  ["La voiture rouge est garée devant l'école.", "voiture", ["car"]],
  ["Il boit un verre d'eau très froide.", "eau", ["water"]],
  ["Le train part de la gare à midi.", "gare", ["station"]],
  ["Je voudrais un café et un croissant.", "café", ["coffee", "café"]],
  ["Les enfants jouent dans le jardin public.", "enfants", ["child"]],
  ["Elle écrit une lettre à son amie.", "lettre", ["letter"]],
  ["Nous regardons un film ce soir.", "film", ["film", "movie"]],
  ["Le repas est prêt sur la table.", "repas", ["meal"]],
  ["Elle achète des fruits au marché.", "marché", ["market"]],

  ["Il compte les personnes.", "compte", ["count"]],
  ["Je compte sur toi.", "compte", ["rely", "count on"]],
  ["Elle compte partir demain.", "compte", ["plan", "intend"]],
  ["Cela compte beaucoup.", "compte", ["matter", "count"]],
  ["Il se rend compte du problème.", "compte", ["realiz", "realis"]],
  ["Il prend le train.", "prend", ["take", "catch"]],
  ["Il prend un café tous les matins.", "prend", ["has", "have"]],
  ["Le conseil prend une décision.", "prend", ["make", "take"]],
  ["Il met son manteau.", "met", ["put on", "puts on"]],
  ["Elle met une heure pour venir.", "met", ["take"]],
  ["Il tient le livre.", "tient", ["hold"]],
  ["Elle tient à venir.", "tient", ["care about", "keen", "attached", "insist"]],
  ["Elle suit un cours d'anglais.", "suit", ["take"]],
  ["Le chien la suit partout.", "suit", ["follow"]],
  ["Le train arrive à huit heures.", "arrive", ["arrive"]],
  ["Cela arrive souvent en hiver.", "arrive", ["happen", "occur"]],
  ["Je trouve la clé sous le tapis.", "trouve", ["find"]],
  ["Je trouve que c'est difficile.", "trouve", ["think", "find"]],
  ["Elle manque de temps.", "manque", ["lack", "short of"]],
  ["Tu me manques beaucoup.", "manques", ["miss"]],
  ["Elle porte une robe bleue.", "porte", ["wear"]],
  ["Il porte les valises jusqu'à la voiture.", "porte", ["carry", "wear", "bear"]],
  ["Que s'est-il passé hier soir ?", "passé", ["happen"]],
  ["Elle passe un examen difficile.", "passe", ["exam"]],
  ["Nous aimons passer du temps ensemble.", "passer", ["spend"]],

  ["La tour de l'église domine le village.", "tour", ["tower"]],
  ["C'est son tour de jouer maintenant.", "tour", ["turn"]],
  ["Chacun a le droit de s'exprimer.", "droit", ["right", "entitle"]],
  ["Elle étudie le droit à l'université.", "droit", ["law"]],
  ["Continuez tout droit jusqu'au carrefour.", "droit", ["straight"]],
  ["Il n'y a plus de place dans la voiture.", "place", ["room", "space"]],
  ["La place du village est animée.", "place", ["square"]],
  ["C'est un fait très important.", "fait", ["fact"]],
  ["Il fait beau et chaud aujourd'hui.", "fait", ["weather", "is"]],
  ["Le temps passe beaucoup trop vite.", "temps", ["time"]],
  ["Quel temps fait-il à Paris ?", "temps", ["weather"]],
  ["Le sens de cette phrase reste obscur.", "sens", ["meaning", "sense"]],
  ["Je sens une odeur de brûlé.", "sens", ["feel", "smell"]],
  ["Il est encore au bureau.", "encore", ["still"]],
  ["Même les enfants ont compris.", "même", ["even"]],
  ["Ils sont nés le même jour.", "même", ["same"]],
  ["Une personne attend devant la porte.", "personne", ["person"]],
  ["Il n'y a personne dans la salle.", "personne", ["nobody", "anyone", "no one"]],
  ["Il habite à Lyon depuis 2010.", "depuis", ["since"]],
  ["Elle travaille ici depuis trois ans.", "depuis", ["for"]],
  ["Il travaille bien malgré la fatigue.", "bien", ["well", "quite", "good"]],
  ["Ce livre raconte une histoire vraie.", "livre", ["book"]],
  ["Il est parti très tôt ce matin.", "parti", ["left", "gone", "depart"]],
  ["Le parti politique a gagné.", "parti", ["party"]],

  ["Il a besoin de partir tout de suite.", "besoin", ["need"]],
  ["Nous avons envie de rester ici.", "envie", ["want", "feel like"]],
  ["Il est en train de préparer le dîner.", "train", ["middle of", "process", "currently"]],
  ["La réunion a eu lieu hier matin.", "lieu", ["take place"]],
  ["Le gouvernement veut mettre en place une réforme.", "place", ["set up", "establish", "implement"]],
  ["Ce pays fait partie de l'Union européenne.", "partie", ["part of"]],
  ["Il faut prendre en compte tous les risques.", "compte", ["into account"]],

  ["Il y va tous les jeudis.", "y", ["there", "to it"]],
  ["Elle en parle souvent.", "en", ["of it", "about it", "some"]],
  ["Je lui ai donné le livre.", "lui", ["to him", "to her", "him", "her"]],
  ["Nous leur avons écrit.", "leur", ["to them", "them"]],
  ["Nous allons au cinéma ce soir.", "au", ["to the", "at the"]],
  ["Elle revient du marché.", "du", ["of the", "from the", "some"]],
  ["Il ne veut pas partir.", "pas", ["not"]],
  ["Elle ne travaille plus ici.", "plus", ["no longer", "not anymore", "anymore"]],
  ["Nous ne sommes jamais allés en Italie.", "jamais", ["never"]],
  ["Il ne dit rien.", "rien", ["nothing", "anything"]],

  ["Le gouvernement annonce de nouvelles mesures.", "mesures", ["measure", "step"]],
  ["Une forte hausse des prix inquiète les ménages.", "hausse", ["rise", "increase"]],
  ["Des frappes ont visé plusieurs sites.", "frappes", ["strike"]],
  ["Les autorités ont ouvert une enquête.", "enquête", ["investigation", "inquiry"]],
  ["La croissance ralentit dans la zone euro.", "croissance", ["growth"]],
  ["Le tribunal a condamné l'entreprise à une amende.", "amende", ["fine", "penalty"]],
  ["Le sommet réunit les dirigeants de vingt pays.", "dirigeants", ["leader", "executive"]],
  ["Ce projet nécessite des moyens considérables.", "moyens", ["means", "resource"]],

  ["Emmanuel Macron a rencontré la presse à Paris.", "Macron", ["macron"]],
  ["Marie habite à Lyon depuis deux ans.", "Marie", ["marie"]],

  ["Elle est allée au marché ce matin.", "allée", ["go", "went", "gone"]],
  ["Ils ont pris le dernier train.", "pris", ["taken", "took", "take"]],
  ["Nous viendrons dès que possible.", "viendrons", ["come"]],
  ["Le rapport a été publié hier.", "publié", ["publish"]],
];

function normalise(value) {
  return String(value).toLowerCase().replace(/[’]/g, "'").trim();
}

function locate(sentenceText, needle) {
  const sentence = tokenizeParagraphsToSentences(sentenceText)[0][0];
  const target = normalise(needle);
  const index = sentence.tokens.findIndex(
    (token) =>
      token.isWord &&
      (normalise(token.clean) === target ||
        normalise(token.text) === target ||
        normalise(token.clean).replace(/^(?:[cdjlmnst]|qu)['’]/u, "") === target)
  );
  if (index === -1) throw new Error(`Could not find "${needle}" in: ${sentenceText}`);
  return { tokens: sentence.tokens, tokenIndex: index, contextSentence: sentence.text };
}

const stats = {
  total: 0,
  local: 0,
  alignment: 0,
  escalated: 0,
  abstained: 0,
  correct: 0,
  wrong: 0,
  wrongAndConfident: 0,
};
const confidentlyWrong = [];
const wrong = [];

for (const [sentence, needle, accepted] of PROBES) {
  const outcome = resolveWithCandidates(locate(sentence, needle));
  const meaning = outcome.meaning;
  stats.total++;

  if (meaning.abstained) stats.abstained++;
  else if (meaning.source === "natural-alignment") stats.alignment++;
  else stats.local++;
  if (meaning.wantsAiEscalation) stats.escalated++;

  const ok = accepted.some((value) => normalise(meaning.displayEnglish).includes(normalise(value)));
  if (ok) stats.correct++;
  else if (!meaning.abstained) {
    stats.wrong++;
    wrong.push({ sentence, needle, got: meaning.displayEnglish, confidence: meaning.confidence });
    if (meaning.confidence === "high") {
      stats.wrongAndConfident++;
      confidentlyWrong.push({ sentence, needle, got: meaning.displayEnglish });
    }
  }
}

const percent = (value) => `${Math.round((value / stats.total) * 1000) / 10}%`;

console.log("=== Resolver audit ===");
console.log(`probes:                 ${stats.total}`);
console.log(`resolved locally:       ${stats.local} (${percent(stats.local)})`);
console.log(`via natural alignment:  ${stats.alignment} (${percent(stats.alignment)})`);
console.log(`escalates to AI:        ${stats.escalated} (${percent(stats.escalated)})`);
console.log(`abstained:              ${stats.abstained} (${percent(stats.abstained)})`);
console.log("");
console.log(`correct:                ${stats.correct} (${percent(stats.correct)})`);
console.log(`wrong:                  ${stats.wrong} (${percent(stats.wrong)})`);
console.log(`wrong AND confident:    ${stats.wrongAndConfident} (${percent(stats.wrongAndConfident)})`);

if (wrong.length > 0) {
  console.log("\n--- wrong answers ---");
  for (const item of wrong) {
    console.log(`  ${item.needle.padEnd(10)} "${item.got}" [${item.confidence}]  — ${item.sentence}`);
  }
}
if (confidentlyWrong.length > 0) {
  console.log("\n--- CONFIDENTLY WRONG (the failure mode that matters most) ---");
  for (const item of confidentlyWrong) {
    console.log(`  ${item.needle}: "${item.got}" — ${item.sentence}`);
  }
}
