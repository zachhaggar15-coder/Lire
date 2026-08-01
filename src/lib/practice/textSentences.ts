import type { ReadingText } from "@/types";
import { tokenizeParagraphsToSentences, type Token } from "@/lib/words";

/** A sentence pulled from a reading, with its position preserved for stable selection. */
export interface TextSentence {
  index: number;
  text: string;
  tokens: Token[];
}

/** Every sentence in a reading, in order, flattened across paragraphs. */
export function allSentencesInText(text: ReadingText): TextSentence[] {
  return tokenizeParagraphsToSentences(text.body)
    .flat()
    .map((sentence, index) => ({ index, text: sentence.text, tokens: sentence.tokens }));
}
