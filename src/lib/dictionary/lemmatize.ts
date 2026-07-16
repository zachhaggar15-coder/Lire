/**
 * Rule-based French morphological fallback. Not a real NLP lemmatiser —
 * just a small, ordered suffix→replacement table covering the most common
 * regular conjugation and agreement patterns. Used only as a last resort in
 * lookupWord, after an exact lemma match and an exact `forms[]` match have
 * both missed, so it catches inflections an entry didn't explicitly list
 * (e.g. an imperfect or conditional form of a verb whose dictionary entry
 * only lists a few present-tense forms).
 *
 * Safety property: a wrong guess is harmless. `guessLemmas` only produces
 * candidate strings; the caller checks each candidate against the real
 * dictionary and simply moves on if it isn't a known lemma. So it's fine
 * for this rule table to be a little permissive.
 */

interface Rule {
  suffix: string;
  replacement: string;
}

const IRREGULAR_LEMMAS: Record<string, string[]> = {
  // "suis" is ambiguous between être ("je suis" = I am) and suivre ("je
  // suis" = I follow) — merged with suivre's entry further down, both
  // candidates are produced and the caller's dictionary check picks
  // whichever is real for the word actually being looked up.
  es: ["être"],
  est: ["être"],
  fus: ["être"],
  fût: ["être"],
  sommes: ["être"],
  êtes: ["être"],
  sont: ["être"],
  étais: ["être"],
  était: ["être"],
  étaient: ["être"],
  sera: ["être"],
  seront: ["être"],
  serait: ["être"],
  ai: ["avoir"],
  as: ["avoir"],
  a: ["avoir"],
  avons: ["avoir"],
  avez: ["avoir"],
  ayez: ["avoir"],
  ont: ["avoir"],
  avais: ["avoir"],
  avait: ["avoir"],
  avaient: ["avoir"],
  aura: ["avoir"],
  aurez: ["avoir"],
  auriez: ["avoir"],
  aurons: ["avoir"],
  auront: ["avoir"],
  auraient: ["avoir"],
  aurait: ["avoir"],
  eurent: ["avoir"],
  eussent: ["avoir"],
  eusse: ["avoir"],
  vais: ["aller"],
  vas: ["aller"],
  va: ["aller"],
  allons: ["aller"],
  allez: ["aller"],
  vont: ["aller"],
  irai: ["aller"],
  ira: ["aller"],
  iront: ["aller"],
  alla: ["aller"],
  fait: ["faire"],
  fit: ["faire"],
  firent: ["faire"],
  fais: ["faire"],
  faisant: ["faire"],
  faisaient: ["faire"],
  fasse: ["faire"],
  faisons: ["faire"],
  faites: ["faire"],
  font: ["faire"],
  fera: ["faire"],
  ferait: ["faire"],
  ferez: ["faire"],
  feront: ["faire"],
  faisais: ["faire"],
  fît: ["faire"],
  peux: ["pouvoir"],
  peut: ["pouvoir"],
  pouvons: ["pouvoir"],
  pouvez: ["pouvoir"],
  peuvent: ["pouvoir"],
  pouvait: ["pouvoir"],
  pouvaient: ["pouvoir"],
  pouvais: ["pouvoir"],
  pouvant: ["pouvoir"],
  pourrez: ["pouvoir"],
  pourriez: ["pouvoir"],
  pourrions: ["pouvoir"],
  pourrons: ["pouvoir"],
  pourrais: ["pouvoir"],
  pourrait: ["pouvoir"],
  pourraient: ["pouvoir"],
  pût: ["pouvoir"],
  put: ["pouvoir"],
  purent: ["pouvoir"],
  veux: ["vouloir"],
  veut: ["vouloir"],
  voulons: ["vouloir"],
  voulez: ["vouloir"],
  veulent: ["vouloir"],
  voudrez: ["vouloir"],
  voulais: ["vouloir"],
  vouliez: ["vouloir"],
  voulant: ["vouloir"],
  voulut: ["vouloir"],
  dois: ["devoir"],
  doit: ["devoir"],
  devons: ["devoir"],
  devez: ["devoir"],
  doivent: ["devoir"],
  devais: ["devoir"],
  devions: ["devoir"],
  devaient: ["devoir"],
  devront: ["devoir"],
  devrait: ["devoir"],
  devriez: ["devoir"],
  dut: ["devoir"],
  durent: ["devoir"],
  dit: ["dire"],
  disant: ["dire"],
  disais: ["dire"],
  disaient: ["dire"],
  dis: ["dire"],
  dites: ["dire"],
  disent: ["dire"],
  prend: ["prendre"],
  prends: ["prendre"],
  prit: ["prendre"],
  prenons: ["prendre"],
  prenez: ["prendre"],
  prennent: ["prendre"],
  prenions: ["prendre"],
  prenait: ["prendre"],
  prenaient: ["prendre"],
  pris: ["prendre"],
  prirent: ["prendre"],
  mis: ["mettre"],
  mit: ["mettre"],
  mise: ["mettre"],
  mises: ["mettre"],
  ayant: ["avoir"],
  eut: ["avoir"],
  "eût": ["avoir"],
  fut: ["être"],

  // venir / tenir — highly irregular, and extremely common as compounds
  // (revenir, devenir, retenir, obtenir, ...); see stripKnownPrefix below for
  // how those compounds reuse this same table.
  viens: ["venir"],
  vient: ["venir"],
  venons: ["venir"],
  venez: ["venir"],
  viennent: ["venir"],
  venais: ["venir"],
  venait: ["venir"],
  venaient: ["venir"],
  viendra: ["venir"],
  viendras: ["venir"],
  viendrai: ["venir"],
  viendrons: ["venir"],
  viendront: ["venir"],
  viendrait: ["venir"],
  vint: ["venir"],
  venu: ["venir"],
  venue: ["venir"],
  venus: ["venir"],
  venues: ["venir"],
  tiens: ["tenir"],
  tient: ["tenir"],
  tenons: ["tenir"],
  tenez: ["tenir"],
  tiennent: ["tenir"],
  tenais: ["tenir"],
  tenait: ["tenir"],
  tenant: ["tenir"],
  tiendra: ["tenir"],
  tiendrai: ["tenir"],
  tiendrait: ["tenir"],
  tint: ["tenir"],
  tenu: ["tenir"],
  tenue: ["tenir"],
  tenus: ["tenir"],
  tenues: ["tenir"],

  // voir / savoir / connaître
  vois: ["voir"],
  voit: ["voir"],
  voyons: ["voir"],
  voyez: ["voir"],
  voient: ["voir"],
  voyais: ["voir"],
  voyait: ["voir"],
  verra: ["voir"],
  verrai: ["voir"],
  verrait: ["voir"],
  vit: ["voir", "vivre"],
  vu: ["voir"],
  vue: ["voir"],
  vus: ["voir"],
  vues: ["voir"],
  sais: ["savoir"],
  sait: ["savoir"],
  savons: ["savoir"],
  savez: ["savoir"],
  savent: ["savoir"],
  savais: ["savoir"],
  savait: ["savoir"],
  saura: ["savoir"],
  saurai: ["savoir"],
  saurait: ["savoir"],
  sachant: ["savoir"],
  su: ["savoir"],
  sue: ["savoir"],
  sus: ["savoir"],
  sues: ["savoir"],
  connais: ["connaître"],
  connait: ["connaître"],
  "connaît": ["connaître"],
  connaissons: ["connaître"],
  connaissez: ["connaître"],
  connaissent: ["connaître"],
  connaissais: ["connaître"],
  connaissait: ["connaître"],
  connaissaient: ["connaître"],
  "connaîtra": ["connaître"],
  "connaîtrait": ["connaître"],
  connut: ["connaître"],
  connu: ["connaître"],
  connue: ["connaître"],
  connus: ["connaître"],
  connues: ["connaître"],

  // écrire / lire / boire / croire — everyday irregular -re verbs
  "écris": ["écrire"],
  "écrit": ["écrire"],
  "écrivons": ["écrire"],
  "écrivez": ["écrire"],
  "écrivent": ["écrire"],
  "écrivais": ["écrire"],
  "écrivait": ["écrire"],
  "écrira": ["écrire"],
  "écrirait": ["écrire"],
  lis: ["lire"],
  lit: ["lire"],
  lisons: ["lire"],
  lisez: ["lire"],
  lisent: ["lire"],
  lisais: ["lire"],
  lisait: ["lire"],
  lirait: ["lire"],
  lut: ["lire"],
  lu: ["lire"],
  lue: ["lire"],
  lus: ["lire"],
  lues: ["lire"],
  offrant: ["offrir"],
  bois: ["boire"],
  boit: ["boire"],
  buvons: ["boire"],
  buvez: ["boire"],
  boivent: ["boire"],
  buvais: ["boire"],
  buvait: ["boire"],
  boira: ["boire"],
  boirait: ["boire"],
  but: ["boire"],
  bu: ["boire"],
  bue: ["boire"],
  bus: ["boire"],
  bues: ["boire"],
  crois: ["croire"],
  croit: ["croire"],
  croyons: ["croire"],
  croyez: ["croire"],
  croient: ["croire"],
  croyais: ["croire"],
  croyait: ["croire"],
  croira: ["croire"],
  croirait: ["croire"],
  crut: ["croire"],
  cru: ["croire"],
  crue: ["croire"],
  crus: ["croire"],
  crues: ["croire"],

  // courir / mourir / vivre / rire / suivre
  cours: ["courir"],
  court: ["courir"],
  courons: ["courir"],
  courez: ["courir"],
  courent: ["courir"],
  courais: ["courir"],
  courait: ["courir"],
  courra: ["courir"],
  courrait: ["courir"],
  courut: ["courir"],
  couru: ["courir"],
  dors: ["dormir"],
  meurs: ["mourir"],
  meurt: ["mourir"],
  mourons: ["mourir"],
  mourez: ["mourir"],
  meurent: ["mourir"],
  mourais: ["mourir"],
  mourait: ["mourir"],
  mourra: ["mourir"],
  mourrait: ["mourir"],
  mourut: ["mourir"],
  meure: ["mourir"],
  mourante: ["mourir"],
  mourants: ["mourir"],
  mort: ["mourir"],
  morte: ["mourir"],
  morts: ["mourir"],
  mortes: ["mourir"],
  vis: ["vivre"],
  vivons: ["vivre"],
  vivez: ["vivre"],
  vivent: ["vivre"],
  vivais: ["vivre"],
  vivait: ["vivre"],
  vivra: ["vivre"],
  vivrait: ["vivre"],
  "vécut": ["vivre"],
  "vécu": ["vivre"],
  "vécue": ["vivre"],
  "vécus": ["vivre"],
  "vécues": ["vivre"],
  ris: ["rire"],
  rions: ["rire"],
  riez: ["rire"],
  rient: ["rire"],
  riais: ["rire"],
  riait: ["rire"],
  rira: ["rire"],
  rirait: ["rire"],
  ri: ["rire"],
  suis: ["être", "suivre"],
  suit: ["suivre"],
  suivons: ["suivre"],
  suivez: ["suivre"],
  suivent: ["suivre"],
  suivais: ["suivre"],
  suivait: ["suivre"],
  suivra: ["suivre"],
  suivrait: ["suivre"],
  suivit: ["suivre"],
  suivi: ["suivre"],
  répondis: ["répondre"],
  répondit: ["répondre"],
  répondirent: ["répondre"],
  reprit: ["reprendre"],
  reprirent: ["reprendre"],
  demanda: ["demander"],
  demandèrent: ["demander"],
  leva: ["lever"],
  levèrent: ["lever"],
  laissa: ["laisser"],
  laissèrent: ["laisser"],
  regarda: ["regarder"],
  regardèrent: ["regarder"],
  jeta: ["jeter"],
  jetèrent: ["jeter"],
  tomba: ["tomber"],
  tombèrent: ["tomber"],
  trouva: ["trouver"],
  trouvèrent: ["trouver"],
  passa: ["passer"],
  passèrent: ["passer"],
  poussa: ["pousser"],
  poussèrent: ["pousser"],
  continua: ["continuer"],
  continuèrent: ["continuer"],
  commença: ["commencer"],
  commencèrent: ["commencer"],
  répliqua: ["répliquer"],
  répliquèrent: ["répliquer"],
  parut: ["paraître"],
  parurent: ["paraître"],
  paraissait: ["paraître"],
  paraissaient: ["paraître"],
  sentait: ["sentir"],
  sentaient: ["sentir"],
  "s'écria": ["s'écrier"],
  "s’écria": ["s'écrier"],
  écriai: ["s'écrier"],
  entendit: ["entendre"],
  entendirent: ["entendre"],
  entendant: ["entendre"],
  apercevait: ["apercevoir"],
  apercevant: ["apercevoir"],
  aperçut: ["apercevoir"],
  aperçurent: ["apercevoir"],
  disparaissait: ["disparaître"],
  disparut: ["disparaître"],
  disparurent: ["disparaître"],
  servait: ["servir"],
  servaient: ["servir"],
  descendit: ["descendre"],
  descendirent: ["descendre"],
  tendit: ["tendre"],
  tendirent: ["tendre"],
  conduisit: ["conduire"],
  conduisirent: ["conduire"],
  conduisait: ["conduire"],
  conduise: ["conduire"],
  battu: ["battre"],
  battue: ["battre"],
  battus: ["battre"],
  battues: ["battre"],
  battit: ["battre"],
  résolut: ["résoudre"],
  résolurent: ["résoudre"],
  écrivit: ["écrire"],
  écrivirent: ["écrire"],
  "s'assit": ["s'asseoir"],
  "s’assit": ["s'asseoir"],
  "s'assirent": ["s'asseoir"],
  "s’assirent": ["s'asseoir"],
  rassit: ["s'asseoir"],
  asseyez: ["s'asseoir"],
  fallut: ["falloir"],
  sentais: ["sentir"],
  couraient: ["courir"],
  produisait: ["produire"],
  produisit: ["produire"],
  reçut: ["recevoir"],
  reçurent: ["recevoir"],
  sortait: ["sortir"],
  sortaient: ["sortir"],
  sourit: ["sourire"],
  apparaissait: ["apparaître"],
  apparaissaient: ["apparaître"],
  apparut: ["apparaître"],
  apparurent: ["apparaître"],
  couvrait: ["couvrir"],
  couvraient: ["couvrir"],
  dormait: ["dormir"],
  dormaient: ["dormir"],
  dormi: ["dormir"],
  franchi: ["franchir"],
  franchie: ["franchir"],
  parvint: ["parvenir"],
  parvinrent: ["parvenir"],
  perdit: ["perdre"],
  perdirent: ["perdre"],
  prétend: ["prétendre"],
  prétendent: ["prétendre"],
  rempli: ["remplir"],
  remplie: ["remplir"],
  rendit: ["rendre"],
  rendirent: ["rendre"],
  rendu: ["rendre"],
  rendue: ["rendre"],
  reprenant: ["reprendre"],
  retenaient: ["retenir"],
  saviez: ["savoir"],
  souffre: ["souffrir"],
  souffert: ["souffrir"],
  tut: ["taire"],
  vînt: ["venir"],
  attendit: ["attendre"],
  attendirent: ["attendre"],
  accoururent: ["accourir"],
  accueillirent: ["accueillir"],
  admettant: ["admettre"],
  admise: ["admettre"],
  aille: ["aller"],
  alourdi: ["alourdir"],
  apprit: ["apprendre"],
  comprenais: ["comprendre"],
  comprenions: ["comprendre"],
  comprenne: ["comprendre"],
  conclu: ["conclure"],
  conçut: ["concevoir"],
  confondant: ["confondre"],
  consenti: ["consentir"],
  construit: ["construire"],
  construisit: ["construire"],
  coururent: ["courir"],
  craignant: ["craindre"],
  craignaient: ["craindre"],
  croie: ["croire"],
  crurent: ["croire"],
  décrivit: ["décrire"],
  dépend: ["dépendre"],
  devienne: ["devenir"],
  interrompit: ["interrompre"],
  introduit: ["introduire"],
  maintenaient: ["maintenir"],
  mettant: ["mettre"],
  mette: ["mettre"],
  mourant: ["mourir"],
  nourri: ["nourrir"],
  ouvrant: ["ouvrir"],
  paraisse: ["paraître"],
  parcourait: ["parcourir"],
  plaignait: ["plaindre"],
  rompant: ["rompre"],
  rompu: ["rompre"],
  saurais: ["savoir"],
  sent: ["sentir"],
  sentant: ["sentir"],
  suffisait: ["suffire"],
  suffit: ["suffire"],
  tenaient: ["tenir"],
  étendit: ["étendre"],
  finirent: ["finir"],
  prévient: ["prévenir"],
  prévienne: ["prévenir"],
  rejoignit: ["rejoindre"],
  rejoint: ["rejoindre"],
  restât: ["rester"],
  réunies: ["réunir"],
  revêtu: ["revêtir"],
  revoie: ["revoir"],
  souvint: ["souvenir"],
  tordit: ["tordre"],
  trouverez: ["trouver"],
  vinrent: ["venir"],

  // valoir / falloir / pleuvoir / plaire / naître / craindre — less
  // frequent but still common enough in news prose to be worth catching.
  vaux: ["valoir"],
  vaut: ["valoir"],
  valons: ["valoir"],
  valez: ["valoir"],
  valent: ["valoir"],
  valais: ["valoir"],
  valait: ["valoir"],
  vaudra: ["valoir"],
  vaudrait: ["valoir"],
  valut: ["valoir"],
  valu: ["valoir"],
  faut: ["falloir"],
  fallait: ["falloir"],
  faudra: ["falloir"],
  faudrait: ["falloir"],
  fallu: ["falloir"],
  pleut: ["pleuvoir"],
  pleuvait: ["pleuvoir"],
  pleuvra: ["pleuvoir"],
  plu: ["pleuvoir", "plaire"],
  plais: ["plaire"],
  plait: ["plaire"],
  "plaît": ["plaire"],
  plaisons: ["plaire"],
  plaisez: ["plaire"],
  plaisent: ["plaire"],
  plaisais: ["plaire"],
  plaisait: ["plaire"],
  plaira: ["plaire"],
  plairait: ["plaire"],
  nais: ["naître"],
  "naît": ["naître"],
  naissons: ["naître"],
  naissez: ["naître"],
  naissent: ["naître"],
  naissais: ["naître"],
  naissait: ["naître"],
  "naîtra": ["naître"],
  naquit: ["naître"],
  "né": ["naître"],
  "née": ["naître"],
  "nés": ["naître"],
  "nées": ["naître"],
  crains: ["craindre"],
  craint: ["craindre"],
  craignons: ["craindre"],
  craignez: ["craindre"],
  craignent: ["craindre"],
  craignais: ["craindre"],
  craignait: ["craindre"],
  craindra: ["craindre"],
  craignit: ["craindre"],
};

/**
 * Common prefixes that turn a base irregular verb into a compound one
 * (revenir, devenir, retenir, obtenir, apprendre, comprendre, permettre,
 * promettre, ...) — these compounds inflect exactly like their base verb,
 * but IRREGULAR_LEMMAS above is keyed by exact whole-word forms, so
 * "revient" would otherwise never match "vient". Stripping a known prefix
 * and re-checking the remainder against the same table catches this whole
 * family without having to enumerate every compound by hand. Longest
 * prefixes first, so e.g. "entre" is tried before "en" would be (not
 * currently listed, but keeps the ordering principle consistent).
 */
const COMPOUND_PREFIXES = [
  "entre", "contre", "appar", "trans", "inter",
  "sous", "sur", "pré", "pro", "com", "con", "per", "main", "re", "ré", "dé", "de",
];

/**
 * If `word` starts with a known compound prefix and the remainder is itself
 * a recognised irregular form, returns the prefixed lemma guesses (e.g.
 * "revient" -> ["revenir"], from prefix "re" + remainder "vient" ->
 * ["venir"]). Returns an empty array otherwise — never throws, never
 * guesses without a real IRREGULAR_LEMMAS hit on the remainder.
 */
function stripKnownPrefix(word: string): string[] {
  const results: string[] = [];
  for (const prefix of COMPOUND_PREFIXES) {
    if (!word.startsWith(prefix) || word.length <= prefix.length + 1) continue;
    const remainder = word.slice(prefix.length);
    const bases = IRREGULAR_LEMMAS[remainder];
    if (bases) results.push(...bases.map((base) => prefix + base));
  }
  return results;
}

// Longer, more specific suffixes are tried before shorter generic ones —
// enforced by sorting once below, so the order they're written in here only
// matters as a tiebreaker between same-length suffixes.
const RULES: Rule[] = [
  // Literary/simple-past -er endings common in public-domain texts.
  { suffix: "èrent", replacement: "er" },
  { suffix: "âmes", replacement: "er" },
  { suffix: "âtes", replacement: "er" },
  { suffix: "ai", replacement: "er" },
  { suffix: "as", replacement: "er" },
  { suffix: "a", replacement: "er" },

  // -er verbs: future / conditional
  { suffix: "eraient", replacement: "er" },
  { suffix: "erions", replacement: "er" },
  { suffix: "eriez", replacement: "er" },
  { suffix: "erais", replacement: "er" },
  { suffix: "erait", replacement: "er" },
  { suffix: "erons", replacement: "er" },
  { suffix: "eront", replacement: "er" },
  { suffix: "erai", replacement: "er" },
  { suffix: "eras", replacement: "er" },
  { suffix: "era", replacement: "er" },

  // Imperfect endings are shared by the -er and -re groups (only -ir verbs
  // insert "iss" before them, handled separately below), so both a "+er"
  // and a "+re" candidate are generated — a wrong one is harmless, it just
  // won't match anything in the dictionary.
  { suffix: "aient", replacement: "er" },
  { suffix: "aient", replacement: "re" },
  { suffix: "ions", replacement: "er" },
  { suffix: "ions", replacement: "re" },
  { suffix: "iez", replacement: "er" },
  { suffix: "iez", replacement: "re" },
  { suffix: "ais", replacement: "er" },
  { suffix: "ais", replacement: "re" },
  { suffix: "ait", replacement: "er" },
  { suffix: "ait", replacement: "re" },
  { suffix: "ant", replacement: "er" },
  // Present participles used adjectivally in feminine/plural form
  // (grelottantes -> grelotter, scintillants -> scintiller).
  { suffix: "antes", replacement: "er" },
  { suffix: "ante", replacement: "er" },
  { suffix: "ants", replacement: "er" },

  // Literary/public-domain imperfect subjunctive forms for -er verbs.
  { suffix: "assent", replacement: "er" },
  { suffix: "assions", replacement: "er" },
  { suffix: "assiez", replacement: "er" },
  { suffix: "asses", replacement: "er" },
  { suffix: "asse", replacement: "er" },
  { suffix: "ât", replacement: "er" },
  { suffix: "ées", replacement: "er" },
  { suffix: "és", replacement: "er" },
  { suffix: "ée", replacement: "er" },
  { suffix: "é", replacement: "er" },

  // Present-tense -ons/-ez/-ent are also shared by -er and -re verbs.
  { suffix: "ons", replacement: "er" },
  { suffix: "ons", replacement: "re" },
  { suffix: "ez", replacement: "er" },
  { suffix: "ez", replacement: "re" },
  { suffix: "ez", replacement: "ir" },
  { suffix: "ent", replacement: "er" },
  { suffix: "ent", replacement: "re" },
  { suffix: "ent", replacement: "ir" },
  { suffix: "es", replacement: "er" },
  { suffix: "e", replacement: "er" },

  // -ir verbs (regular "finir" group): imperfect / present participle
  { suffix: "issaient", replacement: "ir" },
  { suffix: "issions", replacement: "ir" },
  { suffix: "issiez", replacement: "ir" },
  { suffix: "issais", replacement: "ir" },
  { suffix: "issait", replacement: "ir" },
  { suffix: "issant", replacement: "ir" },

  // -ir verbs: present tense
  { suffix: "iraient", replacement: "ir" },
  { suffix: "irions", replacement: "ir" },
  { suffix: "iriez", replacement: "ir" },
  { suffix: "irais", replacement: "ir" },
  { suffix: "irait", replacement: "ir" },
  { suffix: "irons", replacement: "ir" },
  { suffix: "iront", replacement: "ir" },
  { suffix: "irent", replacement: "ir" },
  { suffix: "irai", replacement: "ir" },
  { suffix: "iras", replacement: "ir" },
  { suffix: "ira", replacement: "ir" },
  { suffix: "issons", replacement: "ir" },
  { suffix: "issez", replacement: "ir" },
  { suffix: "issent", replacement: "ir" },
  { suffix: "ies", replacement: "ir" },
  { suffix: "ie", replacement: "ir" },
  { suffix: "is", replacement: "ir" },
  { suffix: "i", replacement: "ir" },
  { suffix: "it", replacement: "ir" },
  // Some irregular -ir verbs still use an -ir infinitive without the
  // regular -iss- stem in imperfect/present forms (partait -> partir).
  { suffix: "aient", replacement: "ir" },
  { suffix: "ions", replacement: "ir" },
  { suffix: "iez", replacement: "ir" },
  { suffix: "ais", replacement: "ir" },
  { suffix: "ait", replacement: "ir" },
  { suffix: "ons", replacement: "ir" },

  // Simple-past/literary forms for -re verbs (attendis -> attendre,
  // confondirent -> confondre) plus imperfect-subjunctive spellings.
  { suffix: "irent", replacement: "re" },
  { suffix: "îmes", replacement: "re" },
  { suffix: "îtes", replacement: "re" },
  { suffix: "ît", replacement: "re" },
  { suffix: "is", replacement: "re" },
  { suffix: "it", replacement: "re" },

  // -re and -dre verbs: future / conditional. Both variants are useful:
  // "lira" -> "lire", while "vendra" -> "vendre".
  { suffix: "draient", replacement: "dre" },
  { suffix: "drions", replacement: "dre" },
  { suffix: "driez", replacement: "dre" },
  { suffix: "drais", replacement: "dre" },
  { suffix: "drait", replacement: "dre" },
  { suffix: "drons", replacement: "dre" },
  { suffix: "dront", replacement: "dre" },
  { suffix: "drai", replacement: "dre" },
  { suffix: "dras", replacement: "dre" },
  { suffix: "dra", replacement: "dre" },
  { suffix: "raient", replacement: "re" },
  { suffix: "rions", replacement: "re" },
  { suffix: "riez", replacement: "re" },
  { suffix: "rais", replacement: "re" },
  { suffix: "rait", replacement: "re" },
  { suffix: "rons", replacement: "re" },
  { suffix: "ront", replacement: "re" },
  { suffix: "rai", replacement: "re" },
  { suffix: "ras", replacement: "re" },
  { suffix: "ra", replacement: "re" },

  // Plural / feminine agreement (nouns & adjectives)
  { suffix: "aux", replacement: "al" },
  { suffix: "ales", replacement: "al" },
  { suffix: "euses", replacement: "eux" },
  { suffix: "euse", replacement: "eux" },
  { suffix: "euses", replacement: "eur" },
  { suffix: "euse", replacement: "eur" },
  { suffix: "elles", replacement: "el" },
  { suffix: "elle", replacement: "el" },
  { suffix: "trices", replacement: "teur" },
  { suffix: "trice", replacement: "teur" },
  { suffix: "ières", replacement: "ier" },
  { suffix: "ière", replacement: "ier" },
  { suffix: "ères", replacement: "er" },
  { suffix: "ère", replacement: "er" },
  { suffix: "ives", replacement: "if" },
  { suffix: "ive", replacement: "if" },
  { suffix: "uës", replacement: "u" },
  { suffix: "uë", replacement: "u" },
  { suffix: "ches", replacement: "c" },
  { suffix: "che", replacement: "c" },
  { suffix: "ques", replacement: "c" },
  { suffix: "que", replacement: "c" },
  { suffix: "es", replacement: "" },
  { suffix: "e", replacement: "" },
  { suffix: "s", replacement: "" },
  { suffix: "x", replacement: "" },

  // -re verbs (regular "vendre" group): present tense
  { suffix: "s", replacement: "re" },
  { suffix: "d", replacement: "re" },
];

const SORTED_RULES = [...RULES].sort((a, b) => b.suffix.length - a.suffix.length);

const MIN_STEM_LENGTH = 2;

/**
 * Extra stem spellings to also try before re-adding the "er" ending, for the
 * three classic French stem-changing/spelling-change -er verb families —
 * none of which round-trip through the plain suffix table above, since the
 * conjugated stem's spelling genuinely differs from the infinitive's:
 *
 *   - e/é -> è (acheter -> achète, préférer -> préfère): the stem's last
 *     vowel is è in the conjugated form but e or é in the infinitive — try
 *     both, since which one is real depends on the specific verb.
 *   - doubled consonant (appeler -> appelle, jeter -> jette): try
 *     de-doubling the stem's final consonant.
 *   - y/i (payer -> paie, envoyer -> envoie): try restoring a final i (after
 *     a vowel) to y.
 *   - ç/c (commencer -> commença): try restoring a final ç to plain c —
 *     only relevant before "a"/"o"-initial endings, but harmless before any.
 *
 * Only ever used for the "er" replacement rules (these are -er verb
 * phenomena specifically), and only ever *adds* extra candidates — the
 * plain stem is still tried as-is by the caller.
 */
function stemSpellingVariants(stem: string): string[] {
  const variants: string[] = [];
  const last = stem.length - 1;
  if (last < 1) return variants;

  // e/é -> è: the changing vowel sits one before the stem's final consonant
  // (lever -> lève: stem "lèv"; acheter -> achète: stem "achèt"; préférer ->
  // préfère: stem "préfèr") — it's never the stem's very last character,
  // since these verbs' endings always keep a trailing consonant.
  if (stem[last - 1] === "è") {
    const before = stem.slice(0, last - 1);
    const after = stem.slice(last);
    variants.push(before + "e" + after, before + "é" + after);
  }

  // Doubled consonant -> single (appeler -> appelle: stem "appell"; jeter ->
  // jette: stem "jett") — here the doubling *is* the stem's last character.
  if (stem[last] === stem[last - 1] && /[bcdfglmnprst]/.test(stem[last])) {
    variants.push(stem.slice(0, last));
  }

  if (stem[last] === "i" && /[aeou]/.test(stem[last - 1])) {
    variants.push(stem.slice(0, last) + "y");
  }

  if (stem[last] === "ç") {
    variants.push(stem.slice(0, last) + "c");
  }

  if (stem.endsWith("ge")) {
    variants.push(stem.slice(0, -1));
  }

  return variants;
}

/**
 * Returns candidate lemma guesses for a word, longest/most-specific suffix
 * match first, with exact duplicates removed. Doesn't check them against
 * any dictionary — that's the caller's job (see lookupWord).
 */
export function guessLemmas(word: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  function add(candidate: string) {
    if (candidate === word || seen.has(candidate)) return;
    seen.add(candidate);
    candidates.push(candidate);
  }

  function addRuleGuesses(target: string) {
    for (const rule of SORTED_RULES) {
      if (!target.endsWith(rule.suffix)) continue;

      const stem = target.slice(0, target.length - rule.suffix.length);
      if (stem.length < MIN_STEM_LENGTH) continue;

      add(stem + rule.replacement);

      if (rule.replacement === "er") {
        for (const variantStem of stemSpellingVariants(stem)) {
          if (variantStem.length < MIN_STEM_LENGTH) continue;
          add(variantStem + "er");
        }
      }
    }
  }

  const forms = [word];
  const apostropheIndex = Math.max(word.lastIndexOf("'"), word.lastIndexOf("\u2019"));
  if (apostropheIndex >= 0 && apostropheIndex < word.length - 1) {
    const apostropheTail = word.slice(apostropheIndex + 1);
    forms.push(apostropheTail);
    const tailHyphenIndex = apostropheTail.indexOf("-");
    if (tailHyphenIndex > 0 && tailHyphenIndex < apostropheTail.length - 1) {
      forms.push(apostropheTail.slice(0, tailHyphenIndex));
    }
  }
  const hyphenIndex = word.indexOf("-");
  if (hyphenIndex > 0 && hyphenIndex < word.length - 1) {
    forms.push(word.slice(0, hyphenIndex));
  }

  for (const form of forms) {
    for (const irregular of IRREGULAR_LEMMAS[form] ?? []) add(irregular);
    for (const compound of stripKnownPrefix(form)) add(compound);
    add(form);
    addRuleGuesses(form);
  }

  return candidates;
}
