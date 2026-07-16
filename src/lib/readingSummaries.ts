import type { ReadingText } from "@/types";

const METADATA_BLURB_PATTERNS = [
  /\bpublic-domain french excerpt\b/i,
  /\bselected as \d+[\s-]word reading practice\b/i,
  /\bimported by you\b/i,
  /\bclose reading with liree'?s\b/i,
];

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function stripLeadingDialogueFrame(text: string): string {
  return text
    .replace(/^[\s"'`()[\]{}\u00ab\u00bb\u201c\u201d\u2018\u2019.,;:!?-]+/, "")
    .trim();
}

function countWords(text: string): number {
  return text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
}

function truncateAtWordBoundary(text: string, maxLength: number): string {
  const clean = collapseWhitespace(text);
  if (clean.length <= maxLength) return clean;
  const clipped = clean.slice(0, maxLength - 3);
  const lastSpace = clipped.lastIndexOf(" ");
  const safe = lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped;
  return `${safe.replace(/[,\s;:.-]+$/, "")}...`;
}

function sentenceCandidates(text: string): string[] {
  return collapseWhitespace(text)
    .split(/(?<=[.!?\u2026])\s+/)
    .map(stripLeadingDialogueFrame)
    .filter(Boolean);
}

export function isMetadataOnlyBlurb(blurb: string | null | undefined): boolean {
  const clean = blurb?.trim();
  if (!clean) return false;
  return METADATA_BLURB_PATTERNS.some((pattern) => pattern.test(clean));
}

export function stripMetadataOnlyBlurb<T extends ReadingText>(text: T): T {
  if (!isMetadataOnlyBlurb(text.blurbEn)) return text;
  return { ...text, blurbEn: null };
}

export function contentSnippetForReadingText(text: ReadingText, maxLength = 120): string {
  const candidates = [
    ...sentenceCandidates(text.preview),
    ...sentenceCandidates(text.body),
    stripLeadingDialogueFrame(text.preview),
    stripLeadingDialogueFrame(text.body),
    text.title,
  ];
  const picked = candidates.find((candidate) => countWords(candidate) >= 4) ?? candidates.find(Boolean) ?? text.title;
  return truncateAtWordBoundary(picked, maxLength);
}

export function gistTextForReadingText(text: ReadingText, maxLength = 120): string {
  const blurb = text.blurbEn?.trim();
  if (blurb && !isMetadataOnlyBlurb(blurb)) {
    return truncateAtWordBoundary(sentenceCandidates(blurb)[0] ?? blurb, maxLength);
  }
  return contentSnippetForReadingText(text, maxLength);
}
