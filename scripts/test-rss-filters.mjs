// Ad-hoc test runner for the RSS language/content-quality helpers — the
// project doesn't have a test framework set up, so this is a small,
// Node-runnable script instead of a real test file. Run with:
//   node scripts/test-rss-filters.mjs
// (uses Node's built-in TypeScript stripping, no build step needed)
import { analyseLanguage, isAcceptableFrenchText } from "../src/lib/rss/language.ts";
import { analyseContentQuality, isAcceptableReadingContent } from "../src/lib/rss/contentQuality.ts";
import { looksLikeBoilerplate, looksLikePaywallOrBotWall } from "../src/lib/rss/cleanContent.ts";

let passed = 0;
let failed = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "✓" : "✗"} ${label} — expected ${expected}, got ${actual}`);
}

const FRENCH_PARAGRAPH = `
Le gouvernement a annoncé aujourd'hui de nouvelles mesures pour lutter contre
le changement climatique. Cette décision, prise après plusieurs mois de
négociations, vise à réduire les émissions de gaz à effet de serre. Les
associations écologistes se disent satisfaites, même si elles estiment que
ces mesures restent insuffisantes. Le ministre de l'Environnement a précisé
que d'autres annonces suivront dans les prochaines semaines.
`.trim();

const ENGLISH_PARAGRAPH = `
The government announced today new measures to fight climate change. This
decision, made after several months of negotiations, aims to reduce
greenhouse gas emissions. Environmental groups say they are satisfied, even
though they believe these measures remain insufficient. The Environment
Minister said further announcements will follow in the coming weeks.
`.trim();

const MIXED_TITLE_ENGLISH_BODY = `
Le gouvernement announces new climate measures. The government announced
today new measures to fight climate change. This decision, made after
several months of negotiations, aims to reduce greenhouse gas emissions.
Environmental groups say they are satisfied, even though they believe these
measures remain insufficient.
`.trim();

const SHORT_FRENCH_TEASER = `Le gouvernement annonce de nouvelles mesures pour le climat.`;

const GOOD_FRENCH_ARTICLE = `
La ville de Lyon a inauguré hier son nouveau tramway, un projet qui aura
coûté plus de deux cents millions d'euros. Les habitants du quartier se
disent enthousiastes, même si certains commerçants s'inquiètent des
nuisances pendant les derniers travaux. Le maire a rappelé que cette
nouvelle ligne permettra de réduire la circulation automobile dans le
centre-ville. Selon les premières estimations, environ quarante mille
voyageurs emprunteront cette ligne chaque jour. Plusieurs autres villes
françaises envisagent désormais des projets similaires pour moderniser
leurs transports en commun. Les travaux, qui ont duré près de trois ans,
ont mobilisé plus de cinq cents ouvriers sur le chantier. La mairie promet
une cérémonie officielle le mois prochain pour célébrer cette ouverture.
`.trim();

const TRUNCATED_ARTICLE = `
La ville de Lyon a inauguré hier son nouveau tramway, un projet qui aura
coûté plus de deux cents millions d'euros. Les habitants du quartier se
disent enthousiastes, même si certains commerçants s'inquiètent des
nuisances pendant les derniers travaux. Le maire a rappelé que cette
nouvelle ligne...
`.trim();

const BOILERPLATE_TEXT = `
Ce site utilise des cookies pour améliorer votre expérience. Abonnez-vous à
notre newsletter pour ne rien manquer. Politique de confidentialité et
gestion des cookies disponibles en bas de page.
`.trim();

const PAYWALL_TEXT = `
Cet article est réservé aux abonnés. Abonnez-vous pour lire la suite et
accéder à l'intégralité de nos contenus premium.
`.trim();

const BOTWALL_TEXT = `
Just a moment... Please enable JavaScript and cookies to continue. Checking
your browser before accessing this website.
`.trim();

console.log("--- Language detection ---");
{
  const r = analyseLanguage(FRENCH_PARAGRAPH);
  console.log(`  French paragraph -> ${r.likelyLanguage} (fr=${r.frenchScore.toFixed(1)}, en=${r.englishScore.toFixed(1)}) — ${r.reason}`);
  check("clearly French paragraph is detected as fr", r.likelyLanguage, "fr");
  check("clearly French paragraph is acceptable", isAcceptableFrenchText(FRENCH_PARAGRAPH), true);
}
{
  const r = analyseLanguage(ENGLISH_PARAGRAPH);
  console.log(`  English paragraph -> ${r.likelyLanguage} (fr=${r.frenchScore.toFixed(1)}, en=${r.englishScore.toFixed(1)}) — ${r.reason}`);
  check("clearly English paragraph is detected as en", r.likelyLanguage, "en");
  check("clearly English paragraph is rejected", isAcceptableFrenchText(ENGLISH_PARAGRAPH), false);
}
{
  const r = analyseLanguage(MIXED_TITLE_ENGLISH_BODY);
  console.log(`  Mixed FR title + EN body -> ${r.likelyLanguage} (fr=${r.frenchScore.toFixed(1)}, en=${r.englishScore.toFixed(1)}) — ${r.reason}`);
  check("French title cannot rescue an English body", isAcceptableFrenchText(MIXED_TITLE_ENGLISH_BODY), false);
}
{
  const ok = isAcceptableFrenchText(SHORT_FRENCH_TEASER);
  console.log(`  Short French teaser -> acceptable French? ${ok} (this is a language check only — length is contentQuality's job)`);
}

console.log("\n--- Content quality ---");
{
  const q = analyseContentQuality(SHORT_FRENCH_TEASER);
  console.log(`  Short French teaser -> ${q.wordCount} words, quality=${q.quality} — ${q.reason}`);
  check("short French teaser is rejected as content", isAcceptableReadingContent(SHORT_FRENCH_TEASER), false);
}
{
  const q = analyseContentQuality(GOOD_FRENCH_ARTICLE);
  console.log(`  Good French article -> ${q.wordCount} words, ${q.sentenceCount} sentences, quality=${q.quality} — ${q.reason}`);
  check("good-length French article is accepted", isAcceptableReadingContent(GOOD_FRENCH_ARTICLE), true);
}
{
  const q = analyseContentQuality(TRUNCATED_ARTICLE);
  console.log(`  Truncated article -> isProbablyTruncated=${q.isProbablyTruncated}, quality=${q.quality} — ${q.reason}`);
  check("truncated article (ends in '...') is rejected", isAcceptableReadingContent(TRUNCATED_ARTICLE), false);
  check("truncated article is flagged isProbablyTruncated", q.isProbablyTruncated, true);
}
{
  const isBoilerplate = looksLikeBoilerplate(BOILERPLATE_TEXT);
  console.log(`  Cookie/newsletter boilerplate -> looksLikeBoilerplate=${isBoilerplate}`);
  check("cookie/newsletter boilerplate is flagged", isBoilerplate, true);
  check("clean French article is not flagged as boilerplate", looksLikeBoilerplate(GOOD_FRENCH_ARTICLE), false);
}
{
  const isPaywall = looksLikePaywallOrBotWall(PAYWALL_TEXT);
  const isBotWall = looksLikePaywallOrBotWall(BOTWALL_TEXT);
  console.log(`  Paywall prompt -> looksLikePaywallOrBotWall=${isPaywall}; bot-protection page -> ${isBotWall}`);
  check("paywall prompt is flagged", isPaywall, true);
  check("bot-protection challenge page is flagged", isBotWall, true);
  check("clean French article is not flagged as a paywall/bot-wall", looksLikePaywallOrBotWall(GOOD_FRENCH_ARTICLE), false);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
