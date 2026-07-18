import type { Category } from "@/types";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_LABELS: Record<Category, string> = {
  "news-style": "News",
  sport: "Sport",
  culture: "Culture",
  science: "Science",
  "everyday life": "Life",
};

export function formatCategory(category: Category | string | null | undefined): string {
  if (!category) return "Uncategorised";
  if (category in CATEGORY_LABELS) return CATEGORY_LABELS[category as Category];
  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
