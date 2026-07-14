import Link from "next/link";
import ReadingCard from "@/components/ReadingCard";
import type { ScoredArticle } from "@/lib/recommendation/types";

interface ArticleSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  articles: ScoredArticle[];
  variant?: "cards" | "rail" | "compact";
  limit?: number;
}

export default function ArticleSection({
  id,
  title,
  subtitle,
  articles,
  variant = "cards",
  limit,
}: ArticleSectionProps) {
  const visibleArticles = typeof limit === "number" ? articles.slice(0, limit) : articles;
  if (visibleArticles.length === 0) return null;

  return (
    <section id={id} className="mb-6 scroll-mt-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
        </div>
        {limit && articles.length > limit && (
          <span className="shrink-0 rounded-full bg-cream-dark px-2.5 py-1 text-xs font-bold text-ink-muted">
            +{articles.length - limit}
          </span>
        )}
      </div>

      {variant === "cards" ? (
        <div className="mt-3 space-y-4">
          {visibleArticles.map((article) => (
            <ReadingCard
              key={article.text.id}
              text={article.text}
              difficulty={article.difficulty}
              starRating={article.starRating}
              score={article.score}
            />
          ))}
        </div>
      ) : (
        <div className={variant === "rail" ? "-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1" : "mt-3 grid gap-2"}>
          {visibleArticles.map((article) => (
            <CompactArticleCard key={article.text.id} article={article} rail={variant === "rail"} />
          ))}
        </div>
      )}
    </section>
  );
}

function CompactArticleCard({ article, rail }: { article: ScoredArticle; rail: boolean }) {
  const { text } = article;
  return (
    <Link
      href={`/reader/${text.id}`}
      className={`block rounded-2xl border border-cream-dark bg-cream-card p-3 shadow-sm active:scale-[0.99] ${
        rail ? "w-64 shrink-0" : ""
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-bold text-brand">
          {text.difficulty}
        </span>
        <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[11px] font-semibold capitalize text-ink-muted">
          {text.category}
        </span>
        <span className="ml-auto text-[11px] font-semibold text-ink-muted">{text.minutes} min</span>
      </div>
      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">{text.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{text.preview}</p>
      {text.sourceName && <p className="mt-2 truncate text-[11px] font-semibold text-ink-muted">{text.sourceName}</p>}
    </Link>
  );
}
