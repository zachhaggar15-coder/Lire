/**
 * The recommendation engine — turns a pool of candidate ReadingTexts into
 * ranked article/news sections. Everything here is pure, deterministic, and
 * framework-agnostic; React components call into this, never the other way
 * around, and never embed scoring logic themselves.
 *
 *   1. buildScorableArticles(texts, knownWords) — attach difficulty +
 *      content-quality data to each candidate (src/lib/recommendation/build.ts).
 *   2. buildScoringContext() — gather interest profile, recent reading
 *      history, and inferred user level from localStorage
 *      (src/lib/recommendation/context.ts).
 *   3. rankArticles(scorable, context) — score and sort
 *      (src/lib/recommendation/score.ts, weights in weights.ts).
 *   4. buildSections(ranked) — split the same ranked pool into the sections
 *      active pages render (src/lib/recommendation/sections.ts).
 *
 * See the README's "Recommendation engine" section for how scoring works,
 * where the weights live, how interests are learned, and how to add a
 * new signal.
 */
export * from "@/lib/recommendation/types";
export * from "@/lib/recommendation/signals";
export * from "@/lib/recommendation/weights";
export * from "@/lib/recommendation/score";
export * from "@/lib/recommendation/sections";
export * from "@/lib/recommendation/build";
export * from "@/lib/recommendation/context";
export * from "@/lib/recommendation/interests";
