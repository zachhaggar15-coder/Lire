import ReadingCard from "@/components/ReadingCard";
import type { ScoredArticle } from "@/lib/recommendation/types";

interface ArticleSectionProps {
  title: string;
  subtitle?: string;
  articles: ScoredArticle[];
}

/** A titled row of ReadingCards, reused for every recommendation-engine section on the home page — see src/lib/recommendation/sections.ts. */
export default function ArticleSection({ title, subtitle, articles }: ArticleSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
      <div className="mt-3 space-y-4">
        {articles.map((article) => (
          <ReadingCard
            key={article.text.id}
            text={article.text}
            difficulty={article.difficulty}
            starRating={article.starRating}
          />
        ))}
      </div>
    </section>
  );
}
