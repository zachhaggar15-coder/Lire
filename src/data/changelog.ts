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
    date: "2026-10-07",
    title: "Free and Premium",
    summary: "Reading, news, importing, listening, the dictionary, grammar and reviewing your words are free, with 5 new saved words a day. Premium (£3.99 a month, cancel any time in Google Play) adds unlimited saving and AI help.",
    type: "new",
    featureHref: "/premium",
  },
  {
    date: "2026-10-07",
    title: "More private",
    summary: "Sorlio no longer collects any usage analytics or crash reports, and keeps only your email when you sign in — not your name or photo. Each account's data is kept separate on shared devices, and imported texts stay on your device unless you choose to sync them.",
    type: "improved",
    featureHref: "/privacy",
  },
  {
    date: "2026-10-07",
    title: "Better French and reading texts",
    summary: "Corrected accents and grammar explanations throughout the lessons, and replaced the classic-literature extracts with unbroken passages from their original editions.",
    type: "fixed",
    featureHref: "/grammar",
  },
  {
    date: "2026-09-13",
    title: "Dark mode",
    summary: "Choose Light, Dark, or follow your phone's setting from Settings → Theme.",
    type: "new",
    featureHref: "/settings",
  },
  {
    date: "2026-09-13",
    title: "Quick tour for new learners",
    summary: "New learners are offered a one-minute interactive tour after choosing their level, plus tips in their first lesson. Skip it any time, or replay it from Settings.",
    type: "improved",
    featureHref: "/settings",
  },
  {
    date: "2026-09-13",
    title: "Rate Sorlio and clearer offline mode",
    summary: "Rate the app and send feedback from the top of Settings. Sorlio now tells you when you're offline and what still works.",
    type: "improved",
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
