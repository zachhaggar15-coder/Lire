import type {
  AiProvider,
  SentenceExplanation,
  VocabularyEntry,
  WordAnalysis,
} from "@/lib/ai/types";

const DEFAULT_MODEL = "gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 20000;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

/**
 * Calls OpenAI's Chat Completions API in JSON mode and returns the parsed
 * object. Uses a plain fetch (no SDK) to avoid an extra dependency for what
 * is a single, simple HTTP call.
 */
async function callOpenAiJson(systemPrompt: string, userPrompt: string): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to .env.local (see .env.local.example)."
    );
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

function assertWordAnalysis(raw: unknown): WordAnalysis {
  const r = raw as Record<string, unknown>;
  if (
    !r ||
    !isNonEmptyString(r.word) ||
    !isNonEmptyString(r.translation) ||
    !isNonEmptyString(r.partOfSpeech) ||
    typeof r.literalMeaning !== "string" ||
    typeof r.meaningInThisSentence !== "string" ||
    typeof r.exampleSentence !== "string" ||
    typeof r.notes !== "string" ||
    typeof r.lemma !== "string" ||
    typeof r.cefr !== "string"
  ) {
    throw new Error("OpenAI word analysis response had an unexpected shape.");
  }
  return {
    word: r.word,
    translation: r.translation,
    partOfSpeech: r.partOfSpeech,
    literalMeaning: r.literalMeaning,
    meaningInThisSentence: r.meaningInThisSentence,
    exampleSentence: r.exampleSentence,
    notes: r.notes,
    lemma: r.lemma,
    cefr: r.cefr,
  };
}

function assertSentenceExplanation(raw: unknown): SentenceExplanation {
  const r = raw as Record<string, unknown>;
  if (!r || !isNonEmptyString(r.translation) || !isNonEmptyString(r.explanation)) {
    throw new Error("OpenAI sentence explanation response had an unexpected shape.");
  }
  return { translation: r.translation, explanation: r.explanation };
}

function assertArticleTranslation(raw: unknown): string {
  const r = raw as Record<string, unknown>;
  if (!r || !isNonEmptyString(r.translation)) {
    throw new Error("OpenAI article translation response had an unexpected shape.");
  }
  return r.translation;
}

const WORD_ANALYSIS_SCHEMA = `Respond with a single valid JSON object, no markdown, no commentary, matching exactly this shape:
{
  "word": string,                    // the French word as given
  "translation": string,             // best English translation of the word in isolation
  "partOfSpeech": string,            // e.g. "noun (m.)", "verb (infinitive)", "adjective"
  "literalMeaning": string,          // the word's literal/dictionary meaning
  "meaningInThisSentence": string,   // one short sentence explaining what it means specifically here
  "exampleSentence": string,         // a new, simple French sentence using the word, with an English translation in parentheses
  "notes": string,                  // any useful usage note (register, false friend warning, etc.), or "" if none
  "lemma": string,                  // dictionary/citation form (infinitive for verbs, masculine singular for adjectives)
  "cefr": string                     // rough CEFR level of the word: one of A1, A2, B1, B2, C1, C2
}`;

export class OpenAiProvider implements AiProvider {
  async translateArticle(text: string): Promise<string> {
    const system = `You translate French news articles into natural, fluent English for an intermediate (B1) learner's reading app. The input's paragraphs are separated by a blank line; your translation must preserve the exact same number of paragraphs, in the same order, also separated by a blank line ("\\n\\n"). Respond with a single valid JSON object, no markdown: { "translation": string }.`;
    const raw = await callOpenAiJson(system, text);
    return assertArticleTranslation(raw);
  }

  async translateWord(
    word: string,
    sentence: string,
    previousSentence?: string
  ): Promise<WordAnalysis> {
    const system = `You are a French-to-English tutor helping an intermediate (B1) English-speaking learner understand a French word in context. ${WORD_ANALYSIS_SCHEMA}`;
    const user = [
      `Word: ${word}`,
      previousSentence ? `Previous sentence (context only): ${previousSentence}` : null,
      `Sentence containing the word: ${sentence}`,
    ]
      .filter(Boolean)
      .join("\n");
    const raw = await callOpenAiJson(system, user);
    return assertWordAnalysis(raw);
  }

  async explainSentence(
    sentence: string,
    previousSentence?: string
  ): Promise<SentenceExplanation> {
    const system = `You are a French tutor for an intermediate (B1) English-speaking learner. Given a French sentence, provide a natural English translation and a short explanation (2-4 sentences) covering whatever is most useful: grammar, tense, unusual word order, idioms, or why a particular wording was chosen. Keep the explanation at a B1 level — clear and simple, not academic. Respond with a single valid JSON object, no markdown: { "translation": string, "explanation": string }.`;
    const user = [
      previousSentence ? `Previous sentence (context only): ${previousSentence}` : null,
      `Sentence to explain: ${sentence}`,
    ]
      .filter(Boolean)
      .join("\n");
    const raw = await callOpenAiJson(system, user);
    return assertSentenceExplanation(raw);
  }

  async extractVocabulary(word: string, sentence: string): Promise<VocabularyEntry> {
    // Deliberately reuses translateWord rather than issuing a second API call:
    // WordAnalysis is a superset of VocabularyEntry, so a word that was just
    // analysed for the popup already carries everything vocabulary storage
    // needs. This method exists so the interface is swappable/callable on
    // its own later (e.g. a future "re-enrich saved words" batch job).
    const analysis = await this.translateWord(word, sentence);
    const { translation, lemma, partOfSpeech, cefr, exampleSentence } = analysis;
    return { translation, lemma, partOfSpeech, cefr, exampleSentence };
  }
}
