import { pushStore } from "@/lib/supabase/sync";

export type GrammarDomain = "verbs";
export type GrammarLevel = "A1" | "A2" | "B1" | "B2";
export type VerbTense = "present" | "passe-compose" | "imparfait" | "futur-simple" | "conditionnel";
export type VerbGroup = "er" | "ir" | "re" | "irregular" | "reflexive";
export type GrammarQuestionType = "choose-form" | "identify-tense" | "choose-ending" | "choose-auxiliary";

export interface VerbExample {
  french: string;
  english: string;
  note: string;
}

export interface VerbLesson {
  id: string;
  domain: GrammarDomain;
  tense: VerbTense;
  group: VerbGroup;
  level: GrammarLevel;
  title: string;
  shortTitle: string;
  purpose: string;
  explanation: string;
  pattern: string;
  endings: string[];
  commonMistake: string;
  examples: VerbExample[];
}

export interface VerbReference {
  infinitive: string;
  translation: string;
  group: VerbGroup;
  notes: string[];
  forms: Record<VerbTense, string[]>;
}

export interface GrammarPracticeQuestion {
  id: string;
  lessonId: string;
  type: GrammarQuestionType;
  prompt: string;
  sentence: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface GrammarProgressRecord {
  id: string;
  lessonId: string;
  domain: GrammarDomain;
  attempts: number;
  correct: number;
  completed: boolean;
  mastery: number;
  lastPracticedAt: string | null;
  updatedAt: string;
}

export interface GrammarPracticeEvent {
  id: string;
  lessonId: string;
  questionId: string;
  correct: boolean;
  answeredAt: string;
}

export interface GrammarDashboard {
  totalLessons: number;
  completedLessons: number;
  averageMastery: number;
  nextLesson: VerbLesson;
  strongestLesson: VerbLesson | null;
  weakestLesson: VerbLesson | null;
  recentEvents: GrammarPracticeEvent[];
}

const PROGRESS_KEY = "lire.grammar.progress.v1";
const EVENTS_KEY = "lire.grammar.practiceEvents.v1";

export const VERB_LESSONS: VerbLesson[] = [
  {
    id: "present-er",
    domain: "verbs",
    tense: "present",
    group: "er",
    level: "A1",
    title: "Present Tense: Regular -er Verbs",
    shortTitle: "Present -er",
    purpose: "Recognise the most common French verb pattern in live sentences.",
    explanation: "For regular -er verbs, remove -er and add the present ending. The silent written endings matter because they show who is doing the action.",
    pattern: "parler -> je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent",
    endings: ["-e", "-es", "-e", "-ons", "-ez", "-ent"],
    commonMistake: "The forms parle, parles and parlent usually sound the same. The subject tells you which one is meant.",
    examples: [
      { french: "Le ministre parle aux journalistes.", english: "The minister speaks to journalists.", note: "il/elle form: stem + -e" },
      { french: "Nous regardons les resultats.", english: "We look at the results.", note: "nous form: stem + -ons" },
      { french: "Les equipes cherchent une solution.", english: "The teams are looking for a solution.", note: "ils/elles form: stem + -ent" },
    ],
  },
  {
    id: "present-ir-re",
    domain: "verbs",
    tense: "present",
    group: "ir",
    level: "A2",
    title: "Present Tense: Regular -ir and -re Verbs",
    shortTitle: "Present -ir/-re",
    purpose: "Separate the two smaller regular families from the big -er family.",
    explanation: "Regular -ir verbs such as finir add -is, -is, -it, -issons, -issez, -issent. Regular -re verbs such as vendre drop the -e and use -s, -s, nothing, -ons, -ez, -ent.",
    pattern: "finir -> je finis; vendre -> je vends",
    endings: ["-is", "-is", "-it", "-issons", "-issez", "-issent", "-s", "-s", "-", "-ons", "-ez", "-ent"],
    commonMistake: "Do not treat every -ir verb as regular. venir, partir and sortir have their own patterns.",
    examples: [
      { french: "Le match finit tard.", english: "The match finishes late.", note: "finir, il form: finit" },
      { french: "Les magasins vendent moins.", english: "The shops sell less.", note: "vendre, ils form: vendent" },
      { french: "Nous choisissons cette option.", english: "We choose this option.", note: "regular -ir nous form: -issons" },
    ],
  },
  {
    id: "present-core-irregulars",
    domain: "verbs",
    tense: "present",
    group: "irregular",
    level: "A1",
    title: "Present Tense: Core Irregular Verbs",
    shortTitle: "Core irregulars",
    purpose: "Read etre, avoir, aller and faire instantly, because they carry a lot of article meaning.",
    explanation: "These verbs are too frequent to decode from endings alone. Learn them as complete patterns, then notice how often they build larger tenses and expressions.",
    pattern: "etre: suis, es, est, sommes, etes, sont; avoir: ai, as, a, avons, avez, ont",
    endings: ["suis", "es", "est", "sommes", "etes", "sont", "ai", "as", "a", "avons", "avez", "ont"],
    commonMistake: "a is avoir, not the preposition a. Context and accents matter: il a, a Paris.",
    examples: [
      { french: "Le resultat est important.", english: "The result is important.", note: "etre, il form: est" },
      { french: "La ville a un nouveau projet.", english: "The city has a new project.", note: "avoir, elle form: a" },
      { french: "Les joueurs vont en finale.", english: "The players are going to the final.", note: "aller, ils form: vont" },
    ],
  },
  {
    id: "passe-compose",
    domain: "verbs",
    tense: "passe-compose",
    group: "irregular",
    level: "A2",
    title: "Passe Compose: Completed Actions",
    shortTitle: "Passe compose",
    purpose: "Spot completed events in news articles without reading every past participle as an adjective.",
    explanation: "Passe compose uses avoir or etre plus a past participle. It usually presents an event as completed: a vote happened, a team won, a minister said something.",
    pattern: "avoir/etre + past participle: il a annonce, elle est arrivee",
    endings: ["-e", "-i", "-u", "irregular participles"],
    commonMistake: "With etre verbs, the participle often agrees: elle est arrivee, ils sont partis.",
    examples: [
      { french: "Le president a annonce la mesure.", english: "The president announced the measure.", note: "avoir + annonce" },
      { french: "La delegation est arrivee lundi.", english: "The delegation arrived on Monday.", note: "etre + arrivee" },
      { french: "Les Bleus ont gagne le match.", english: "France won the match.", note: "avoir + gagne" },
    ],
  },
  {
    id: "imparfait",
    domain: "verbs",
    tense: "imparfait",
    group: "irregular",
    level: "B1",
    title: "Imparfait: Background and Ongoing Past",
    shortTitle: "Imparfait",
    purpose: "Tell background description from the main completed event.",
    explanation: "The imparfait often sets the scene, describes repeated past actions, or gives background conditions. It uses the nous present stem plus -ais, -ais, -ait, -ions, -iez, -aient.",
    pattern: "nous avions -> j'avais; nous faisions -> il faisait",
    endings: ["-ais", "-ais", "-ait", "-ions", "-iez", "-aient"],
    commonMistake: "Passe compose moves the story forward; imparfait paints the background.",
    examples: [
      { french: "Le gouvernement cherchait une solution.", english: "The government was looking for a solution.", note: "ongoing background action" },
      { french: "La situation etait difficile.", english: "The situation was difficult.", note: "description in the past" },
      { french: "Les prix augmentaient chaque mois.", english: "Prices were rising every month.", note: "repeated or ongoing past" },
    ],
  },
  {
    id: "future-simple",
    domain: "verbs",
    tense: "futur-simple",
    group: "irregular",
    level: "B1",
    title: "Future Simple: What Will Happen",
    shortTitle: "Future",
    purpose: "Read forecasts, plans and official promises clearly.",
    explanation: "Most future forms use the infinitive plus the endings -ai, -as, -a, -ons, -ez, -ont. Some common verbs have irregular stems: etre -> ser-, avoir -> aur-, aller -> ir-, faire -> fer-.",
    pattern: "parler -> je parlerai; etre -> il sera",
    endings: ["-ai", "-as", "-a", "-ons", "-ez", "-ont"],
    commonMistake: "The future is one word in French where English often uses two: il annoncera = he will announce.",
    examples: [
      { french: "Le rapport sera publie demain.", english: "The report will be published tomorrow.", note: "etre future stem ser-" },
      { french: "La ville ouvrira une nouvelle ligne.", english: "The city will open a new line.", note: "ouvrir future: ouvrira" },
      { french: "Les equipes joueront samedi.", english: "The teams will play on Saturday.", note: "ils form: -ont" },
    ],
  },
  {
    id: "conditionnel",
    domain: "verbs",
    tense: "conditionnel",
    group: "irregular",
    level: "B1",
    title: "Conditional: Caution, Possibility and Would",
    shortTitle: "Conditional",
    purpose: "Understand why news French often sounds careful rather than certain.",
    explanation: "The conditional uses the future stem plus imparfait endings. In articles, it can mean would, but it also reports unconfirmed claims or cautious possibilities.",
    pattern: "pourvoir -> il pourrait; etre -> ce serait",
    endings: ["-ais", "-ais", "-ait", "-ions", "-iez", "-aient"],
    commonMistake: "pourrait often signals caution: would be able to, could, or may depending on context.",
    examples: [
      { french: "Le projet pourrait couter plus cher.", english: "The project could cost more.", note: "cautious possibility" },
      { french: "Selon la presse, il serait candidat.", english: "According to the press, he is reportedly a candidate.", note: "reported but not fully confirmed" },
      { french: "Cette decision changerait le calendrier.", english: "This decision would change the timetable.", note: "would + verb" },
    ],
  },
  {
    id: "reflexive-verbs",
    domain: "verbs",
    tense: "present",
    group: "reflexive",
    level: "B1",
    title: "Reflexive Verbs: se passer, se rendre compte",
    shortTitle: "Reflexives",
    purpose: "Avoid translating se literally when it is part of a fixed verb expression.",
    explanation: "Some verbs include a reflexive pronoun because the action turns back on the subject. Others are fixed expressions where se is simply part of the verb.",
    pattern: "se passer -> il se passe; se rendre compte -> elle se rend compte",
    endings: ["me", "te", "se", "nous", "vous", "se"],
    commonMistake: "Do not translate se rendre compte as render oneself account. It means to realise.",
    examples: [
      { french: "La reunion se deroule a Lyon.", english: "The meeting takes place in Lyon.", note: "se derouler = to take place" },
      { french: "Il s'en rend compte trop tard.", english: "He realises it too late.", note: "se rendre compte de = to realise" },
      { french: "Que se passe-t-il ?", english: "What is happening?", note: "se passer = to happen" },
    ],
  },
];

export const VERB_REFERENCES: VerbReference[] = [
  {
    infinitive: "etre",
    translation: "to be",
    group: "irregular",
    notes: ["Used as an auxiliary with movement/reflexive verbs.", "The future stem is ser- and the conditional stem is ser-."],
    forms: {
      present: ["je suis", "tu es", "il/elle est", "nous sommes", "vous etes", "ils/elles sont"],
      "passe-compose": ["j'ai ete", "tu as ete", "il/elle a ete", "nous avons ete", "vous avez ete", "ils/elles ont ete"],
      imparfait: ["j'etais", "tu etais", "il/elle etait", "nous etions", "vous etiez", "ils/elles etaient"],
      "futur-simple": ["je serai", "tu seras", "il/elle sera", "nous serons", "vous serez", "ils/elles seront"],
      conditionnel: ["je serais", "tu serais", "il/elle serait", "nous serions", "vous seriez", "ils/elles seraient"],
    },
  },
  {
    infinitive: "avoir",
    translation: "to have",
    group: "irregular",
    notes: ["Main auxiliary for passe compose.", "The future and conditional stem is aur-."],
    forms: {
      present: ["j'ai", "tu as", "il/elle a", "nous avons", "vous avez", "ils/elles ont"],
      "passe-compose": ["j'ai eu", "tu as eu", "il/elle a eu", "nous avons eu", "vous avez eu", "ils/elles ont eu"],
      imparfait: ["j'avais", "tu avais", "il/elle avait", "nous avions", "vous aviez", "ils/elles avaient"],
      "futur-simple": ["j'aurai", "tu auras", "il/elle aura", "nous aurons", "vous aurez", "ils/elles auront"],
      conditionnel: ["j'aurais", "tu aurais", "il/elle aurait", "nous aurions", "vous auriez", "ils/elles auraient"],
    },
  },
  {
    infinitive: "parler",
    translation: "to speak",
    group: "er",
    notes: ["Model for most regular -er verbs.", "The present singular forms are pronounced very similarly."],
    forms: {
      present: ["je parle", "tu parles", "il/elle parle", "nous parlons", "vous parlez", "ils/elles parlent"],
      "passe-compose": ["j'ai parle", "tu as parle", "il/elle a parle", "nous avons parle", "vous avez parle", "ils/elles ont parle"],
      imparfait: ["je parlais", "tu parlais", "il/elle parlait", "nous parlions", "vous parliez", "ils/elles parlaient"],
      "futur-simple": ["je parlerai", "tu parleras", "il/elle parlera", "nous parlerons", "vous parlerez", "ils/elles parleront"],
      conditionnel: ["je parlerais", "tu parlerais", "il/elle parlerait", "nous parlerions", "vous parleriez", "ils/elles parleraient"],
    },
  },
  {
    infinitive: "finir",
    translation: "to finish",
    group: "ir",
    notes: ["Model for regular -ir verbs like choisir and reussir.", "The plural present adds -iss-."],
    forms: {
      present: ["je finis", "tu finis", "il/elle finit", "nous finissons", "vous finissez", "ils/elles finissent"],
      "passe-compose": ["j'ai fini", "tu as fini", "il/elle a fini", "nous avons fini", "vous avez fini", "ils/elles ont fini"],
      imparfait: ["je finissais", "tu finissais", "il/elle finissait", "nous finissions", "vous finissiez", "ils/elles finissaient"],
      "futur-simple": ["je finirai", "tu finiras", "il/elle finira", "nous finirons", "vous finirez", "ils/elles finiront"],
      conditionnel: ["je finirais", "tu finirais", "il/elle finirait", "nous finirions", "vous finiriez", "ils/elles finiraient"],
    },
  },
  {
    infinitive: "prendre",
    translation: "to take",
    group: "irregular",
    notes: ["Common in article phrases: prendre une decision, prendre en compte.", "Past participle: pris."],
    forms: {
      present: ["je prends", "tu prends", "il/elle prend", "nous prenons", "vous prenez", "ils/elles prennent"],
      "passe-compose": ["j'ai pris", "tu as pris", "il/elle a pris", "nous avons pris", "vous avez pris", "ils/elles ont pris"],
      imparfait: ["je prenais", "tu prenais", "il/elle prenait", "nous prenions", "vous preniez", "ils/elles prenaient"],
      "futur-simple": ["je prendrai", "tu prendras", "il/elle prendra", "nous prendrons", "vous prendrez", "ils/elles prendront"],
      conditionnel: ["je prendrais", "tu prendrais", "il/elle prendrait", "nous prendrions", "vous prendriez", "ils/elles prendraient"],
    },
  },
  {
    infinitive: "pouvoir",
    translation: "to be able to",
    group: "irregular",
    notes: ["Very common in cautious news language.", "pourrait can mean could, may, or would be able to."],
    forms: {
      present: ["je peux", "tu peux", "il/elle peut", "nous pouvons", "vous pouvez", "ils/elles peuvent"],
      "passe-compose": ["j'ai pu", "tu as pu", "il/elle a pu", "nous avons pu", "vous avez pu", "ils/elles ont pu"],
      imparfait: ["je pouvais", "tu pouvais", "il/elle pouvait", "nous pouvions", "vous pouviez", "ils/elles pouvaient"],
      "futur-simple": ["je pourrai", "tu pourras", "il/elle pourra", "nous pourrons", "vous pourrez", "ils/elles pourront"],
      conditionnel: ["je pourrais", "tu pourrais", "il/elle pourrait", "nous pourrions", "vous pourriez", "ils/elles pourraient"],
    },
  },
];

export const GRAMMAR_QUESTIONS: GrammarPracticeQuestion[] = [
  {
    id: "present-er-1",
    lessonId: "present-er",
    type: "choose-form",
    prompt: "Choose the correct form of chercher.",
    sentence: "Les chercheurs ___ une explication.",
    choices: ["cherche", "cherchent", "cherchez", "cherchons"],
    answer: "cherchent",
    explanation: "Les chercheurs is plural, so the ils/elles ending is -ent: cherchent.",
  },
  {
    id: "present-er-2",
    lessonId: "present-er",
    type: "choose-ending",
    prompt: "Which ending fits nous in a regular -er verb?",
    sentence: "Nous regard___ les chiffres.",
    choices: ["e", "es", "ons", "ent"],
    answer: "ons",
    explanation: "The nous form of regular -er verbs ends in -ons: nous regardons.",
  },
  {
    id: "present-er-3",
    lessonId: "present-er",
    type: "choose-form",
    prompt: "Pick the form that agrees with vous.",
    sentence: "Vous ___ souvent les articles sportifs.",
    choices: ["commentes", "commente", "commentez", "commentent"],
    answer: "commentez",
    explanation: "With vous, regular -er verbs take -ez: vous commentez.",
  },
  {
    id: "present-er-4",
    lessonId: "present-er",
    type: "choose-form",
    prompt: "The spelling changes, but the sound may not. Which written form is right?",
    sentence: "Elle ___ la reaction du public.",
    choices: ["observe", "observes", "observent", "observons"],
    answer: "observe",
    explanation: "Elle uses the il/elle form: stem plus -e.",
  },
  {
    id: "present-er-5",
    lessonId: "present-er",
    type: "choose-form",
    prompt: "Choose the plural subject form.",
    sentence: "Les deputes ___ le texte.",
    choices: ["vote", "votes", "votent", "votez"],
    answer: "votent",
    explanation: "Les deputes means they, so the written ending is -ent: votent.",
  },
  {
    id: "present-ir-re-1",
    lessonId: "present-ir-re",
    type: "choose-form",
    prompt: "Choose the correct regular -ir form.",
    sentence: "Nous ___ cette option.",
    choices: ["choisit", "choisissons", "choisissez", "choisissent"],
    answer: "choisissons",
    explanation: "Regular -ir verbs use -issons with nous: nous choisissons.",
  },
  {
    id: "present-ir-re-2",
    lessonId: "present-ir-re",
    type: "choose-form",
    prompt: "Choose the correct regular -re form.",
    sentence: "Le magasin ___ des billets.",
    choices: ["vends", "vend", "vendent", "vendez"],
    answer: "vend",
    explanation: "For il/elle with regular -re verbs, the ending is silent and unwritten: il vend.",
  },
  {
    id: "present-ir-re-3",
    lessonId: "present-ir-re",
    type: "choose-form",
    prompt: "Which form shows that several people are acting?",
    sentence: "Les negociateurs ___ la reunion.",
    choices: ["finis", "finit", "finissent", "finissez"],
    answer: "finissent",
    explanation: "Regular -ir verbs use -issent with ils/elles: ils finissent.",
  },
  {
    id: "present-ir-re-4",
    lessonId: "present-ir-re",
    type: "choose-ending",
    prompt: "What disappears in the il/elle form of a regular -re verb?",
    sentence: "Il vend des billets.",
    choices: ["The whole stem", "The final written ending", "The subject", "The vowel sound"],
    answer: "The final written ending",
    explanation: "In il vend, the infinitive vendre loses -re and takes no extra written ending.",
  },
  {
    id: "present-ir-re-5",
    lessonId: "present-ir-re",
    type: "choose-form",
    prompt: "Choose the form that fits vous.",
    sentence: "Vous ___ aux questions.",
    choices: ["repond", "reponds", "repondez", "repondent"],
    answer: "repondez",
    explanation: "Regular -re verbs use -ez with vous: vous repondez.",
  },
  {
    id: "present-core-irregulars-1",
    lessonId: "present-core-irregulars",
    type: "choose-form",
    prompt: "Choose the correct form of etre.",
    sentence: "Les resultats ___ importants.",
    choices: ["est", "sont", "sommes", "etes"],
    answer: "sont",
    explanation: "Les resultats is plural, so etre becomes sont.",
  },
  {
    id: "present-core-irregulars-2",
    lessonId: "present-core-irregulars",
    type: "choose-form",
    prompt: "Choose the correct form of avoir.",
    sentence: "La ville ___ un nouveau plan.",
    choices: ["ai", "as", "a", "ont"],
    answer: "a",
    explanation: "La ville is elle, so avoir becomes a.",
  },
  {
    id: "present-core-irregulars-3",
    lessonId: "present-core-irregulars",
    type: "choose-form",
    prompt: "Choose the form of aller used with ils.",
    sentence: "Les joueurs ___ en finale.",
    choices: ["va", "vont", "allez", "allons"],
    answer: "vont",
    explanation: "aller is irregular: ils vont.",
  },
  {
    id: "present-core-irregulars-4",
    lessonId: "present-core-irregulars",
    type: "choose-form",
    prompt: "Which form of faire belongs with nous?",
    sentence: "Nous ___ face a une situation difficile.",
    choices: ["fait", "font", "faisons", "faites"],
    answer: "faisons",
    explanation: "faire is irregular, but the nous form is faisons.",
  },
  {
    id: "present-core-irregulars-5",
    lessonId: "present-core-irregulars",
    type: "choose-form",
    prompt: "Decide whether a is a verb here.",
    sentence: "Le rapport a trois conclusions.",
    choices: ["a = has", "a = to", "a = will", "a = was"],
    answer: "a = has",
    explanation: "No accent: a is the il/elle form of avoir, meaning has.",
  },
  {
    id: "passe-compose-1",
    lessonId: "passe-compose",
    type: "choose-auxiliary",
    prompt: "Which auxiliary completes this passe compose sentence?",
    sentence: "Le president ___ annonce la mesure.",
    choices: ["est", "a", "sont", "ont"],
    answer: "a",
    explanation: "annoncer normally uses avoir in the passe compose: il a annonce.",
  },
  {
    id: "passe-compose-2",
    lessonId: "passe-compose",
    type: "identify-tense",
    prompt: "Which tense is used here?",
    sentence: "La delegation est arrivee lundi.",
    choices: ["present", "passe compose", "imparfait", "conditionnel"],
    answer: "passe compose",
    explanation: "est arrivee is etre plus a past participle, so it is passe compose.",
  },
  {
    id: "passe-compose-3",
    lessonId: "passe-compose",
    type: "choose-form",
    prompt: "Choose the completed-action form.",
    sentence: "Les Bleus ___ le match.",
    choices: ["gagnent", "gagnaient", "ont gagne", "gagneront"],
    answer: "ont gagne",
    explanation: "ont gagne is avoir plus a past participle: they won.",
  },
  {
    id: "passe-compose-4",
    lessonId: "passe-compose",
    type: "choose-auxiliary",
    prompt: "Which auxiliary is used with this movement verb?",
    sentence: "La ministre ___ partie tot.",
    choices: ["a", "est", "ont", "sommes"],
    answer: "est",
    explanation: "partir commonly uses etre in the passe compose: elle est partie.",
  },
  {
    id: "passe-compose-5",
    lessonId: "passe-compose",
    type: "identify-tense",
    prompt: "What does the tense do in this news sentence?",
    sentence: "Le conseil a vote la reforme.",
    choices: ["Reports a completed event", "Describes background", "Makes a cautious claim", "Predicts tomorrow"],
    answer: "Reports a completed event",
    explanation: "a vote presents the vote as a completed event.",
  },
  {
    id: "imparfait-1",
    lessonId: "imparfait",
    type: "identify-tense",
    prompt: "Which tense sets the background here?",
    sentence: "La situation etait difficile.",
    choices: ["present", "passe compose", "imparfait", "futur simple"],
    answer: "imparfait",
    explanation: "etait is the imparfait of etre and describes a background state.",
  },
  {
    id: "imparfait-2",
    lessonId: "imparfait",
    type: "choose-ending",
    prompt: "Which ending fits il/elle in the imparfait?",
    sentence: "Le gouvernement cherch___ une solution.",
    choices: ["ais", "ait", "ions", "aient"],
    answer: "ait",
    explanation: "The il/elle imparfait ending is -ait: il cherchait.",
  },
  {
    id: "imparfait-3",
    lessonId: "imparfait",
    type: "choose-form",
    prompt: "Choose the form that describes an ongoing past situation.",
    sentence: "Les prix ___ chaque mois.",
    choices: ["augmentent", "ont augmente", "augmentaient", "augmenteront"],
    answer: "augmentaient",
    explanation: "augmentaient is imparfait and suggests ongoing or repeated past movement.",
  },
  {
    id: "imparfait-4",
    lessonId: "imparfait",
    type: "choose-form",
    prompt: "Which form paints the background rather than the main event?",
    sentence: "Avant le vote, les discussions ___ tendues.",
    choices: ["sont", "ont ete", "etaient", "seront"],
    answer: "etaient",
    explanation: "etaient describes the background state before the vote.",
  },
  {
    id: "imparfait-5",
    lessonId: "imparfait",
    type: "choose-ending",
    prompt: "Pick the ending shared by je and tu in the imparfait.",
    sentence: "Je pens___ que le projet etait pret.",
    choices: ["ais", "ait", "ions", "aient"],
    answer: "ais",
    explanation: "Je and tu both use -ais in the imparfait: je pensais.",
  },
  {
    id: "future-simple-1",
    lessonId: "future-simple",
    type: "choose-form",
    prompt: "Choose the future form.",
    sentence: "Le rapport ___ publie demain.",
    choices: ["est", "etait", "sera", "serait"],
    answer: "sera",
    explanation: "sera is the future simple of etre: it will be.",
  },
  {
    id: "future-simple-2",
    lessonId: "future-simple",
    type: "choose-ending",
    prompt: "Which ending fits ils/elles in the future simple?",
    sentence: "Les equipes jouer__ samedi.",
    choices: ["ai", "a", "ons", "ont"],
    answer: "ont",
    explanation: "The ils/elles future ending is -ont: elles joueront.",
  },
  {
    id: "future-simple-3",
    lessonId: "future-simple",
    type: "choose-form",
    prompt: "Choose the one-word French future.",
    sentence: "La ville ___ une nouvelle ligne.",
    choices: ["ouvre", "a ouvert", "ouvrait", "ouvrira"],
    answer: "ouvrira",
    explanation: "ouvrira means will open.",
  },
  {
    id: "future-simple-4",
    lessonId: "future-simple",
    type: "choose-form",
    prompt: "Spot the irregular future stem.",
    sentence: "Le ministre ___ une annonce demain.",
    choices: ["fera", "fait", "faisait", "ferait"],
    answer: "fera",
    explanation: "faire has the irregular future stem fer-: il fera.",
  },
  {
    id: "future-simple-5",
    lessonId: "future-simple",
    type: "identify-tense",
    prompt: "What time frame does this verb point to?",
    sentence: "Les resultats arriveront vendredi.",
    choices: ["Past completed", "Past background", "Future", "Cautious possibility"],
    answer: "Future",
    explanation: "arriveront is future simple: they will arrive.",
  },
  {
    id: "conditionnel-1",
    lessonId: "conditionnel",
    type: "identify-tense",
    prompt: "Which tense creates caution here?",
    sentence: "Le projet pourrait couter plus cher.",
    choices: ["present", "passe compose", "futur simple", "conditionnel"],
    answer: "conditionnel",
    explanation: "pourrait is conditional and often signals caution or possibility in news.",
  },
  {
    id: "conditionnel-2",
    lessonId: "conditionnel",
    type: "choose-form",
    prompt: "Choose the conditional form.",
    sentence: "Cette decision ___ le calendrier.",
    choices: ["change", "a change", "changera", "changerait"],
    answer: "changerait",
    explanation: "changerait means would change: future stem plus imparfait ending.",
  },
  {
    id: "conditionnel-3",
    lessonId: "conditionnel",
    type: "choose-form",
    prompt: "Choose the cautious reported form.",
    sentence: "Selon la presse, il ___ candidat.",
    choices: ["est", "a ete", "sera", "serait"],
    answer: "serait",
    explanation: "serait can signal a reported claim that the article is not fully confirming.",
  },
  {
    id: "conditionnel-4",
    lessonId: "conditionnel",
    type: "identify-tense",
    prompt: "Why might a journalist write pourrait here?",
    sentence: "La mesure pourrait etre reportee.",
    choices: ["To state a fact", "To give a command", "To signal possibility", "To describe a habit"],
    answer: "To signal possibility",
    explanation: "pourrait softens the claim: the measure could be postponed.",
  },
  {
    id: "conditionnel-5",
    lessonId: "conditionnel",
    type: "choose-ending",
    prompt: "Which ending fits il/elle in the conditional?",
    sentence: "Ce choix couter___ plus cher.",
    choices: ["ai", "ait", "ons", "ont"],
    answer: "ait",
    explanation: "The il/elle conditional ending is -ait: couterait.",
  },
  {
    id: "reflexive-verbs-1",
    lessonId: "reflexive-verbs",
    type: "choose-form",
    prompt: "Choose the reflexive expression.",
    sentence: "La reunion ___ a Lyon.",
    choices: ["deroule", "se deroule", "a deroule", "deroulait"],
    answer: "se deroule",
    explanation: "se derouler means to take place.",
  },
  {
    id: "reflexive-verbs-2",
    lessonId: "reflexive-verbs",
    type: "choose-form",
    prompt: "Choose the natural meaning of se rendre compte.",
    sentence: "Il s'en rend compte trop tard.",
    choices: ["He gives it back too late", "He realises it too late", "He counts it too late", "He reports it too late"],
    answer: "He realises it too late",
    explanation: "se rendre compte de means to realise; en replaces the de phrase.",
  },
  {
    id: "reflexive-verbs-3",
    lessonId: "reflexive-verbs",
    type: "choose-form",
    prompt: "Choose the expression meaning what is happening.",
    sentence: "Que ___ ?",
    choices: ["passe-t-il", "se passe-t-il", "a passe-t-il", "passera-t-il"],
    answer: "se passe-t-il",
    explanation: "Que se passe-t-il ? means What is happening?",
  },
  {
    id: "reflexive-verbs-4",
    lessonId: "reflexive-verbs",
    type: "choose-form",
    prompt: "Choose the fixed expression, not a literal translation.",
    sentence: "Elle ___ compte du probleme.",
    choices: ["rend", "se rend", "a rend", "rendait"],
    answer: "se rend",
    explanation: "se rendre compte de is a fixed expression meaning to realise.",
  },
  {
    id: "reflexive-verbs-5",
    lessonId: "reflexive-verbs",
    type: "choose-form",
    prompt: "Which pronoun matches nous?",
    sentence: "Nous ___ preparons pour la reunion.",
    choices: ["me", "te", "se", "nous"],
    answer: "nous",
    explanation: "With nous, the reflexive pronoun is also nous: nous nous preparons.",
  },
];

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function isProgressRecord(value: unknown): value is GrammarProgressRecord {
  return isRecord(value) && typeof value.lessonId === "string" && typeof value.attempts === "number" && typeof value.correct === "number";
}

function isPracticeEvent(value: unknown): value is GrammarPracticeEvent {
  return isRecord(value) && typeof value.lessonId === "string" && typeof value.questionId === "string" && typeof value.correct === "boolean";
}

function readArray<T>(key: string, guard: (value: unknown) => value is T): T[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

function persist(key: string, value: unknown): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  void pushStore(key);
}

export function getVerbLessons(): VerbLesson[] {
  return VERB_LESSONS;
}

export function getVerbLesson(lessonId: string): VerbLesson {
  return VERB_LESSONS.find((lesson) => lesson.id === lessonId) ?? VERB_LESSONS[0];
}

export function getGrammarProgress(): GrammarProgressRecord[] {
  return readArray(PROGRESS_KEY, isProgressRecord);
}

export function getGrammarPracticeEvents(): GrammarPracticeEvent[] {
  return readArray(EVENTS_KEY, isPracticeEvent);
}

export function getLessonProgress(lessonId: string): GrammarProgressRecord {
  const existing = getGrammarProgress().find((record) => record.lessonId === lessonId);
  if (existing) return existing;
  return {
    id: lessonId,
    lessonId,
    domain: "verbs",
    attempts: 0,
    correct: 0,
    completed: false,
    mastery: 0,
    lastPracticedAt: null,
    updatedAt: "",
  };
}

export function questionsForLesson(lessonId: string): GrammarPracticeQuestion[] {
  return GRAMMAR_QUESTIONS.filter((question) => question.lessonId === lessonId);
}

export function practiceSetForLesson(lessonId: string): GrammarPracticeQuestion[] {
  return questionsForLesson(lessonId).slice(0, 5);
}

export function normalizeGrammarAnswer(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

export function isGrammarAnswerCorrect(question: GrammarPracticeQuestion, answer: string): boolean {
  return normalizeGrammarAnswer(question.answer) === normalizeGrammarAnswer(answer);
}

export function recordGrammarAnswer(lessonId: string, questionId: string, correct: boolean): GrammarProgressRecord {
  const now = new Date().toISOString();
  const lesson = getVerbLesson(lessonId);
  const records = getGrammarProgress();
  const current = records.find((record) => record.lessonId === lessonId) ?? getLessonProgress(lessonId);
  const attempts = current.attempts + 1;
  const correctCount = current.correct + (correct ? 1 : 0);
  const mastery = Math.min(100, Math.round((correctCount / attempts) * 70 + Math.min(30, attempts * 5)));
  const next: GrammarProgressRecord = {
    ...current,
    domain: lesson.domain,
    attempts,
    correct: correctCount,
    mastery,
    completed: current.completed,
    lastPracticedAt: now,
    updatedAt: now,
  };
  persist(PROGRESS_KEY, [next, ...records.filter((record) => record.lessonId !== lessonId)]);
  persist(EVENTS_KEY, [
    { id: `${lessonId}:${questionId}:${now}`, lessonId, questionId, correct, answeredAt: now },
    ...getGrammarPracticeEvents(),
  ].slice(0, 500));
  return next;
}

export function markGrammarLessonComplete(lessonId: string): GrammarProgressRecord {
  const now = new Date().toISOString();
  const lesson = getVerbLesson(lessonId);
  const records = getGrammarProgress();
  const current = records.find((record) => record.lessonId === lessonId) ?? getLessonProgress(lessonId);
  const next: GrammarProgressRecord = {
    ...current,
    domain: lesson.domain,
    completed: true,
    mastery: Math.max(current.mastery, 70),
    updatedAt: now,
  };
  persist(PROGRESS_KEY, [next, ...records.filter((record) => record.lessonId !== lessonId)]);
  return next;
}

export function buildGrammarDashboard(progress = getGrammarProgress(), events = getGrammarPracticeEvents()): GrammarDashboard {
  const byLesson = new Map(progress.map((record) => [record.lessonId, record]));
  const completedLessons = VERB_LESSONS.filter((lesson) => byLesson.get(lesson.id)?.completed).length;
  const averageMastery = Math.round(VERB_LESSONS.reduce((sum, lesson) => sum + (byLesson.get(lesson.id)?.mastery ?? 0), 0) / VERB_LESSONS.length);
  const nextLesson = VERB_LESSONS.find((lesson) => !byLesson.get(lesson.id)?.completed) ?? VERB_LESSONS[VERB_LESSONS.length - 1];
  const practiced = VERB_LESSONS.filter((lesson) => (byLesson.get(lesson.id)?.attempts ?? 0) > 0);
  const strongestLesson = practiced.length === 0 ? null : [...practiced].sort((a, b) => (byLesson.get(b.id)?.mastery ?? 0) - (byLesson.get(a.id)?.mastery ?? 0))[0];
  const weakestLesson = practiced.length === 0 ? null : [...practiced].sort((a, b) => (byLesson.get(a.id)?.mastery ?? 0) - (byLesson.get(b.id)?.mastery ?? 0))[0];
  return {
    totalLessons: VERB_LESSONS.length,
    completedLessons,
    averageMastery,
    nextLesson,
    strongestLesson,
    weakestLesson,
    recentEvents: [...events].sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime()).slice(0, 8),
  };
}

export function currentUnlockedLesson(progress = getGrammarProgress()): VerbLesson {
  const completed = new Set(progress.filter((record) => record.completed).map((record) => record.lessonId));
  return VERB_LESSONS.find((lesson) => !completed.has(lesson.id)) ?? VERB_LESSONS[VERB_LESSONS.length - 1];
}

export function tenseLabel(tense: VerbTense): string {
  if (tense === "passe-compose") return "Passe compose";
  if (tense === "futur-simple") return "Future simple";
  if (tense === "conditionnel") return "Conditional";
  return tense[0].toUpperCase() + tense.slice(1);
}

export function referenceForVerb(infinitive: string): VerbReference | null {
  const clean = normalizeGrammarAnswer(infinitive);
  return VERB_REFERENCES.find((verb) => normalizeGrammarAnswer(verb.infinitive) === clean) ?? null;
}

export function clearGrammarStores(): void {
  persist(PROGRESS_KEY, []);
  persist(EVENTS_KEY, []);
}
