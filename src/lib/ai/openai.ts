import type {
  SentenceExplanation,
  SentenceExplanationRequest,
  WordExplanation,
  WordExplanationRequest,
} from "@/lib/ai/types";

const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 20000;

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
async function callOpenAiJson(systemPrompt: string, userPrompt: string): Promise<unknown> {
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
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
  };
}

function assertSentenceExplanation(raw: unknown, fallbackSentence: string): SentenceExplanation {
  const r = raw as Record<string, unknown>;
  if (
    !r ||
    !isNonEmptyString(r.naturalEnglishTranslation) ||
    typeof r.simplifiedFrench !== "string" ||
    typeof r.explanation !== "string" ||
    !isStringArray(r.grammarNotes) ||
    !Array.isArray(r.usefulVocabulary)
  ) {
    throw new Error("OpenAI sentence explanation response had an unexpected shape.");
  }
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
    grammarNotes: r.grammarNotes,
    usefulVocabulary,
    explanation: r.explanation,
  };
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
  "commonMistake": string | null   // a common mistake learners make with this word, or null
}`;

const SENTENCE_SCHEMA = `Respond with a single valid JSON object, no markdown, no commentary, matching exactly this shape:
{
  "originalSentence": string,
  "naturalEnglishTranslation": string,
  "simplifiedFrench": string,        // the same idea reworded as a simpler French sentence
  "grammarNotes": string[],          // 1-3 short grammar/usage notes
  "usefulVocabulary": [ { "word": string, "meaning": string } ],  // 1-5 useful words from the sentence
  "explanation": string              // 2-4 short sentences explaining the sentence for a learner
}`;

export async function explainWord(req: WordExplanationRequest): Promise<WordExplanation> {
  const system = `You are a French tutor helping a ${req.level}. ${WORD_SCHEMA}`;
  const user = [
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
  const system = `You are a French tutor helping a ${req.level}. ${SENTENCE_SCHEMA}`;
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
