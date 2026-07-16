import type {
  ArticleBlurbInput,
  ArticleBlurbResult,
  ArticleTranslationRequest,
  ArticleTranslationResult,
  SentenceExplanation,
  SentenceStructure,
  SentenceExplanationRequest,
  WordExplanation,
  WordExplanationRequest,
} from "@/lib/ai/types";

const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 20000;
/** A full-article translation sends much more text than a single word/sentence explanation and can take longer to generate — same timeout budget as one round-trip, just more generous. */
const ARTICLE_TRANSLATION_TIMEOUT_MS = 45000;

/** Thrown when OPENAI_API_KEY isn't set — callers show a friendly "not configured" message instead of a generic error. */
export class AiNotConfiguredError extends Error {}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

/**
 * Calls OpenAI's Chat Completions API in JSON mode and returns the parsed
 * object. Plain fetch, no SDK — this is a single simple HTTP call.
 */
async function callOpenAiJson(systemPrompt: string, userPrompt: string, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiNotConfiguredError("OPENAI_API_KEY is not set.");
  }
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenAI response was missing message content.");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("OpenAI response was not valid JSON.");
  }
}

function assertWordExplanation(raw: unknown, fallbackWord: string, fallbackLemma: string | null): WordExplanation {
  const r = raw as Record<string, unknown>;
  if (
    !r ||
    !isNonEmptyString(r.translation) ||
    typeof r.meaningInContext !== "string" ||
    typeof r.simpleExampleFr !== "string" ||
    typeof r.simpleExampleEn !== "string" ||
    typeof r.grammarOrUsageNote !== "string"
  ) {
    throw new Error("OpenAI word explanation response had an unexpected shape.");
  }
  return {
    word: isNonEmptyString(r.word) ? r.word : fallbackWord,
    lemma: typeof r.lemma === "string" && r.lemma ? r.lemma : fallbackLemma,
    translation: r.translation,
    partOfSpeech: typeof r.partOfSpeech === "string" && r.partOfSpeech ? r.partOfSpeech : null,
    meaningInContext: r.meaningInContext,
    simpleExampleFr: r.simpleExampleFr,
    simpleExampleEn: r.simpleExampleEn,
    grammarOrUsageNote: r.grammarOrUsageNote,
    commonMistake: typeof r.commonMistake === "string" && r.commonMistake ? r.commonMistake : null,
    // Tolerant, not required in the shape check above: an older or
    // slightly-off model response missing just this newer field shouldn't
    // throw away an otherwise-good explanation — the sheet simply omits
    // this section if it's blank.
    whyThisWord: typeof r.whyThisWord === "string" ? r.whyThisWord : "",
  };
}

function assertSentenceExplanation(raw: unknown, fallbackSentence: string): SentenceExplanation {
  const r = raw as Record<string, unknown>;
  if (
    !r ||
    !isNonEmptyString(r.naturalEnglishTranslation) ||
    typeof r.simplifiedFrench !== "string" ||
    typeof r.explanation !== "string" ||
    !r.structure ||
    typeof r.structure !== "object" ||
    !isStringArray(r.grammarNotes) ||
    !Array.isArray(r.usefulVocabulary)
  ) {
    throw new Error("OpenAI sentence explanation response had an unexpected shape.");
  }
  const rawStructure = r.structure as Record<string, unknown>;
  const pronounReferences = Array.isArray(rawStructure.pronounReferences)
    ? rawStructure.pronounReferences
        .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
        .map((v) => ({
          pronoun: typeof v.pronoun === "string" ? v.pronoun : "",
          refersTo: typeof v.refersTo === "string" ? v.refersTo : "",
          explanation: typeof v.explanation === "string" ? v.explanation : "",
        }))
        .filter((v) => v.pronoun && v.refersTo)
    : [];
  const structure: SentenceStructure = {
    subject: typeof rawStructure.subject === "string" ? rawStructure.subject : "",
    mainVerb: typeof rawStructure.mainVerb === "string" ? rawStructure.mainVerb : "",
    object: typeof rawStructure.object === "string" && rawStructure.object ? rawStructure.object : null,
    subordinateClauses: isStringArray(rawStructure.subordinateClauses) ? rawStructure.subordinateClauses : [],
    pronounReferences,
    tense: typeof rawStructure.tense === "string" ? rawStructure.tense : "",
    literalTranslation: typeof rawStructure.literalTranslation === "string" ? rawStructure.literalTranslation : "",
  };
  const usefulVocabulary = r.usefulVocabulary
    .filter(
      (v): v is Record<string, unknown> => !!v && typeof v === "object"
    )
    .map((v) => ({
      word: typeof v.word === "string" ? v.word : "",
      meaning: typeof v.meaning === "string" ? v.meaning : "",
    }))
    .filter((v) => v.word && v.meaning);

  return {
    originalSentence: isNonEmptyString(r.originalSentence) ? r.originalSentence : fallbackSentence,
    naturalEnglishTranslation: r.naturalEnglishTranslation,
    simplifiedFrench: r.simplifiedFrench,
    naturalMeaning: typeof r.naturalMeaning === "string" ? r.naturalMeaning : r.naturalEnglishTranslation,
    literalStructure: typeof r.literalStructure === "string" ? r.literalStructure : structure.literalTranslation,
    mainExpression: typeof r.mainExpression === "string" ? r.mainExpression : "",
    relevantGrammar: isStringArray(r.relevantGrammar) ? r.relevantGrammar : [],
    whyLiteralTranslationSoundsWrong: typeof r.whyLiteralTranslationSoundsWrong === "string" ? r.whyLiteralTranslationSoundsWrong : "",
    structure,
    grammarNotes: r.grammarNotes,
    usefulVocabulary,
    explanation: r.explanation,
    tone: {
      label:
        r.tone && typeof r.tone === "object" && typeof (r.tone as Record<string, unknown>).label === "string"
          ? ((r.tone as Record<string, unknown>).label as string)
          : "neutral",
      explanation:
        r.tone && typeof r.tone === "object" && typeof (r.tone as Record<string, unknown>).explanation === "string"
          ? ((r.tone as Record<string, unknown>).explanation as string)
          : "",
    },
  };
}

function assertArticleTranslation(raw: unknown, expectedCount: number, fallback: string[]): ArticleTranslationResult {
  const r = raw as Record<string, unknown>;
  if (!r || !isStringArray(r.sentences) || r.sentences.length !== expectedCount) {
    throw new Error("OpenAI article-translation response had an unexpected shape.");
  }
  return { sentences: r.sentences.map((s, i) => (s.trim() ? s.trim() : fallback[i] ?? "")) };
}

function assertArticleBlurbResults(raw: unknown): ArticleBlurbResult[] {
  const r = raw as Record<string, unknown>;
  if (!r || !Array.isArray(r.summaries)) {
    throw new Error("OpenAI article-blurb response had an unexpected shape.");
  }
  return r.summaries
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      id: typeof s.id === "string" ? s.id : "",
      blurbEn: typeof s.blurbEn === "string" ? s.blurbEn.trim() : "",
    }))
    .filter((s) => s.id && s.blurbEn);
}

const WORD_SCHEMA = `Respond with a single valid JSON object, no markdown, no commentary, matching exactly this shape:
{
  "word": string,
  "lemma": string | null,
  "translation": string,           // best English translation in this context
  "partOfSpeech": string | null,   // e.g. "verb", "noun (m.)", "adjective"
  "meaningInContext": string,      // one short sentence on what it means specifically here
  "simpleExampleFr": string,       // a new, short, simple French sentence using the word
  "simpleExampleEn": string,       // English translation of simpleExampleFr
  "grammarOrUsageNote": string,    // one short useful note (conjugation, gender, register, idiom) or "" if none
  "commonMistake": string | null,  // a common mistake learners make with this word, or null
  "whyThisWord": string            // 1-2 short sentences: why the writer chose THIS word here specifically, not a more common synonym — register/tone (formal, journalistic, literary, colloquial), connotation, emphasis, or genre convention. If it's just an ordinary, unremarkable word choice with nothing notable to say, state that plainly instead of inventing a reason.
}`;

const SENTENCE_SCHEMA = `Respond with a single valid JSON object, no markdown, no commentary, matching exactly this shape:
{
  "originalSentence": string,
  "naturalEnglishTranslation": string,
  "naturalMeaning": string,          // the natural meaning in plain English
  "simplifiedFrench": string,        // the same idea reworded as a simpler French sentence
  "literalStructure": string,        // compact literal structure, not polished English
  "mainExpression": string,          // main idiom/expression if relevant, e.g. "se rendre compte de = to realise", otherwise ""
  "structure": {
    "subject": string,               // grammatical subject, or "" if implied/unclear
    "mainVerb": string,              // main conjugated verb or verbal phrase
    "object": string | null,         // direct/indirect object, or null
    "subordinateClauses": string[],  // subordinate or relative clauses, if any
    "pronounReferences": [
      { "pronoun": string, "refersTo": string, "explanation": string }
    ],
    "tense": string,                 // e.g. present, passé composé, imperfect, conditional
    "literalTranslation": string     // deliberately literal English to expose the structure
  },
  "relevantGrammar": string[],        // 1-4 specific grammar points that unlock this sentence
  "whyLiteralTranslationSoundsWrong": string, // one short explanation of why word-for-word English fails here, or "" if literal is fine
  "grammarNotes": string[],          // 1-3 short grammar/usage notes
  "usefulVocabulary": [ { "word": string, "meaning": string } ],  // 1-5 useful words from the sentence
  "explanation": string,             // 2-4 short sentences explaining the sentence for a learner
  "tone": { "label": string, "explanation": string } // tone/register: neutral, critical, amused, alarmist, sarcastic, confident, cautious, etc.
}`;

const ARTICLE_TRANSLATION_SCHEMA = `Respond with a single valid JSON object, no markdown, no commentary, matching exactly this shape:
{
  "sentences": string[]   // one fluent English translation per numbered input sentence, in the same order — the array length must exactly match the number of numbered sentences given
}`;

const ARTICLE_BLURB_SCHEMA = `Respond with a single valid JSON object, no markdown, no commentary, matching exactly this shape:
{
  "summaries": [
    { "id": string, "blurbEn": string }
  ]
}
One entry per article given, same id. blurbEn: exactly 2-3 short, plain English sentences summarizing what the article is actually about (the real subject/events), for someone who doesn't read French yet and is deciding whether to open it. Neutral tone, no clickbait, no "this article discusses..." framing, and do not mention excerpt length, word count, reading level, or app metadata — just state what it's about.`;

export async function explainWord(req: WordExplanationRequest): Promise<WordExplanation> {
  const system = `You are a French tutor helping a ${req.level}. ${WORD_SCHEMA}`;
  const user = [
    req.articleTitle ? `Article title (for genre/register context): ${req.articleTitle}` : null,
    `Word: ${req.word}`,
    req.lemma ? `Dictionary form (lemma): ${req.lemma}` : null,
    `Sentence from the article: ${req.articleSentence}`,
    req.simpleExampleSentence ? `A simple example sentence already on file: ${req.simpleExampleSentence}` : null,
    req.surroundingSentence ? `Sentence just before it (context only): ${req.surroundingSentence}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const raw = await callOpenAiJson(system, user);
  return assertWordExplanation(raw, req.word, req.lemma);
}

export async function explainSentence(req: SentenceExplanationRequest): Promise<SentenceExplanation> {
  const system = `You are a French tutor helping a ${req.level}. Decompose the sentence explicitly so the learner can track reference, clauses, tense, and tone instead of mistaking every problem for missing vocabulary. ${SENTENCE_SCHEMA}`;
  const user = [
    req.articleTitle ? `Article title: ${req.articleTitle}` : null,
    req.previousSentence ? `Previous sentence (context only): ${req.previousSentence}` : null,
    `Sentence to explain: ${req.sentence}`,
    req.nextSentence ? `Next sentence (context only): ${req.nextSentence}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const raw = await callOpenAiJson(system, user);
  return assertSentenceExplanation(raw, req.sentence);
}

/**
 * Translates a whole article's sentences fluently and idiomatically in one
 * call, for Reader.tsx's "Show English" toggle. Deliberately *not* word-for-
 * word — that instant, free, offline behaviour is
 * `translateSentenceWithDictionary` (articleTranslation.ts), which this
 * complements rather than replaces: it's the immediate fallback shown while
 * this loads, and again if AI isn't configured or this call fails.
 *
 * Sentence-, not paragraph-, granularity, so a reader can line each French
 * sentence up against its own English line directly underneath it. The
 * prompt still shows the model the full article with real paragraph breaks
 * (via `paragraphBreakBeforeIndex`) for context — pronouns, tone, and
 * ambiguous phrasing often depend on neighbouring sentences — but the
 * response stays a flat, sentence-indexed array so the reader-side
 * rendering doesn't need to re-derive paragraph structure from the model's
 * output.
 */
export async function translateArticleSentences(req: ArticleTranslationRequest): Promise<ArticleTranslationResult> {
  const system = `You are translating a French article into natural, fluent, idiomatic English for a ${req.level} — not a literal word-for-word rendering, but not a loose paraphrase either: preserve the actual meaning and tone precisely, just express it the way a fluent English speaker naturally would. Use the full article (including sentences other than the one you're currently translating) to resolve pronouns, tone, and ambiguous phrasing correctly. ${ARTICLE_TRANSLATION_SCHEMA}`;
  const breakSet = new Set(req.paragraphBreakBeforeIndex);
  const articleForContext = req.sentences
    .map((s, i) => (breakSet.has(i) && i > 0 ? `\n${s}` : s))
    .join(" ");
  const user = [
    req.articleTitle ? `Article title: ${req.articleTitle}` : null,
    `Full article, for context (paragraph breaks shown as blank lines):`,
    articleForContext,
    `Now translate each of the following ${req.sentences.length} sentences individually, in order:`,
    ...req.sentences.map((s, i) => `[${i + 1}] ${s}`),
  ]
    .filter(Boolean)
    .join("\n");
  const raw = await callOpenAiJson(system, user, ARTICLE_TRANSLATION_TIMEOUT_MS);
  return assertArticleTranslation(raw, req.sentences.length, req.sentences);
}

/**
 * Summarizes a batch of articles in one call — used to generate the home
 * page's "what is this about" English blurb during RSS pool building (see
 * src/lib/rss/articleBlurbs.ts), not per reader on-demand like the two
 * functions above. Batched (rather than one call per article) to keep the
 * number of OpenAI requests per pool refresh small.
 */
export async function summarizeArticlesForBlurbs(items: ArticleBlurbInput[]): Promise<ArticleBlurbResult[]> {
  if (items.length === 0) return [];
  const system = `You summarize French news/blog articles in plain English for language learners who are deciding what to read. ${ARTICLE_BLURB_SCHEMA}`;
  const user = items.map((it) => `id: ${it.id}\ntitle: ${it.title}\nexcerpt: ${it.excerpt}`).join("\n---\n");
  const raw = await callOpenAiJson(system, user);
  return assertArticleBlurbResults(raw);
}
