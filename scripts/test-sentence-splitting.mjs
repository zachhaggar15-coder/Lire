/**
 * Sentence splitting drives the reader, listening and AI translation, which
 * must agree sentence for sentence. A split after a title ("M. Omont") made
 * translation fail outright (the model returns one sentence where two were
 * sent) and showed half-sentences in the reader.
 */
import { createRunner } from "./lib/fakeBrowser.mjs";

const t = createRunner("sentence splitting");
const { splitSentences } = await import("../src/lib/words.ts");
const cases = [
  ["Et M. Omont la congédia. Elle sortit.", 2],
  ["Il voit Mme Dupont. Puis il part.", 2],
  ["Il y a MM. Barbicane et Nicholl. Ils partent.", 2],
  ["Mr. Fogg à Fix, qui s'inclina. Puis rien.", 2],
  ["Le capitaine J.-T. Maston parla. Puis il partit.", 2],
  ["On achète du pain, des œufs, etc. Ensuite on rentre.", 2],
  ["Ce n'est pas A qui cause B, mais B qui cause A. Ensuite on voit.", 2],
  ["Il dit : « on gagne. » Puis rien.", 1],
  ["Vraiment ? Oui ! Bon… D'accord.", 4],
];
for (const [input, expected] of cases) {
  const out = splitSentences(input);
  t.check(`${JSON.stringify(input)} → ${expected}`, out.length === expected, JSON.stringify(out));
}
t.finish();
