import ReadingCard from "@/components/ReadingCard";
import LessonScene, { sceneFor } from "@/components/LessonScene";
import { formatCategory } from "@/lib/format";
import type { ScoredArticle } from "@/lib/recommendation/types";

function compactSourceLabel(article: ScoredArticle): string | null {
  const { text } = article;
  if (text.id.startsWith("custom-")) return "Imported text";
  if (text.id.startsWith("starter-")) return "Written for beginners";
  if (text.id.startsWith("pd-")) return "Classic story";
  return text.sourceName ?? null;
}

interface ArticleSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  articles: ScoredArticle[];
  variant?: "cards" | "rail" | "compact" | "grid";
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
        <div
          className={
            variant === "rail"
              ? "-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1"
              : variant === "grid"
                ? "mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-2"
                : "mt-3 grid gap-2"
          }
        >
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
  const sourceLabel = compactSourceLabel(article);
  return (
    <a
      href={`/reader/${encodeURIComponent(text.id)}`}
      className={`block min-w-0 rounded-card border border-cream-dark bg-cream-card p-3 shadow-card transition-shadow active:scale-[0.99] active:shadow-raised ${
        rail ? "w-64 shrink-0" : ""
      }`}
    >
      {/* The scene gives the list something to scan by: at a glance you can
          tell the market lesson from the train one without reading titles. */}
      <div className="flex min-w-0 items-start gap-3">
        <LessonScene name={sceneFor(text.id, text.category)} size={52} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">
              {text.difficulty}
            </span>
            <span className="rounded-full bg-cream-dark px-2 py-0.5 text-xs font-semibold capitalize text-ink-muted">
              {formatCategory(text.category)}
            </span>
            <span className="rounded-full bg-cream-dark px-2 py-0.5 text-xs font-semibold text-ink-muted">
              {text.minutes} min
            </span>
          </div>
          <h3 className="line-clamp-2 min-w-0 break-words text-sm font-bold leading-snug text-ink">{text.title}</h3>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 min-w-0 break-words text-xs text-ink-muted">{text.preview}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        {sourceLabel && <p className="truncate text-xs font-semibold text-ink-muted">{sourceLabel}</p>}
        <span className="shrink-0 text-xs font-bold text-brand">Start</span>
      </div>
    </a>
  );
}
