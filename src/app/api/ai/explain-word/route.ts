import { NextResponse } from "next/server";
import { explainWord } from "@/lib/ai/openai";
import { optionalText, readJsonBody, requirePaidAiCaller, requireText, MAX_TITLE_CHARS, aiFailureResponse, learnerLevel } from "@/lib/ai/guard";


export async function POST(request: Request) {
  const gate = await requirePaidAiCaller(request);
  if (!gate.ok) return gate.response;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value;

  const { word, lemma, articleSentence, simpleExampleSentence, surroundingSentence, articleTitle, level } =
    (body ?? {}) as Record<string, unknown>;

  const checkedWord = requireText(word, "word", 120);
  if (!checkedWord.ok) return checkedWord.response;
  const checkedSentence = requireText(articleSentence, "articleSentence");
  if (!checkedSentence.ok) return checkedSentence.response;

  try {
    const result = await explainWord({
      word: checkedWord.value,
      lemma: optionalText(lemma, 120),
      articleSentence: checkedSentence.value,
      simpleExampleSentence: optionalText(simpleExampleSentence),
      surroundingSentence: optionalText(surroundingSentence),
      articleTitle: optionalText(articleTitle, MAX_TITLE_CHARS),
      level: learnerLevel(level),
    });
    return NextResponse.json(result);
  } catch (err) {
    return aiFailureResponse(err);
  }
}
