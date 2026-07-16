export type ChangelogType = "new" | "improved" | "fixed";

export interface ChangelogEntry {
  date: string;
  title: string;
  summary: string;
  type: ChangelogType;
  featureHref?: string;
}

export const changelogEntries: ChangelogEntry[] = [
  {
    date: "2026-07-16",
    title: "Product validation layer",
    summary: "Added anonymous validation metrics, Android beta interest capture, feedback, research prompts, and an internal validation dashboard.",
    type: "new",
    featureHref: "/settings",
  },
  {
    date: "2026-07-14",
    title: "Grammar practice path",
    summary: "Added a focused verb-conjugation practice area with short lessons, quizzes, and a reference panel.",
    type: "new",
    featureHref: "/grammar",
  },
  {
    date: "2026-07-12",
    title: "Public-domain reading bank",
    summary: "Expanded the stable daily article bank with hundreds of levelled public-domain excerpts.",
    type: "improved",
    featureHref: "/articles",
  },
];
