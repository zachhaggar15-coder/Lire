import type { Category, Difficulty, ReadingText } from "@/types";
import { starterTexts } from "@/data/starterTexts";
import { getProgress } from "@/lib/progress";

export interface LessonUnit {
  id: string;
  level: Difficulty;
  category: Category;
  order: number;
  title: string;
  goal: string;
}

const CATEGORY_ORDER: Category[] = ["everyday life", "news-style", "culture", "science", "sport"];

const UNIT_COPY: Record<Difficulty, Record<Category, { title: string; goal: string }>> = {
  A1: {
    "everyday life": {
      title: "Daily Life Basics",
      goal: "Read simple routines, homes, food, and familiar people.",
    },
    "news-style": {
      title: "Simple Local News",
      goal: "Follow short public updates with very concrete vocabulary.",
    },
    culture: {
      title: "Going Out",
      goal: "Meet museums, music, films, and small cultural events.",
    },
    science: {
      title: "Nature Around You",
      goal: "Read clear observations about animals, weather, and space.",
    },
    sport: {
      title: "Games And Movement",
      goal: "Understand easy reports about teams, practice, and weekend sport.",
    },
  },
  A2: {
    "everyday life": {
      title: "Plans And Past Events",
      goal: "Build confidence with everyday stories using past and near-future time.",
    },
    "news-style": {
      title: "Community Updates",
      goal: "Read short reports about transport, services, and local decisions.",
    },
    culture: {
      title: "Culture In Context",
      goal: "Follow longer descriptions of media, museums, festivals, and habits.",
    },
    science: {
      title: "Useful Science",
      goal: "Read practical science and environment stories with common connectors.",
    },
    sport: {
      title: "Match Reports",
      goal: "Understand sport routines, results, training, and simple opinions.",
    },
  },
  B1: {
    "everyday life": {
      title: "Everyday Choices",
      goal: "Follow causes, opinions, and changes in ordinary life.",
    },
    "news-style": {
      title: "News With Context",
      goal: "Read learner-friendly civic and local news with reasons and consequences.",
    },
    culture: {
      title: "Culture And Opinion",
      goal: "Read about books, screens, traditions, and public debate.",
    },
    science: {
      title: "Science Explainers",
      goal: "Understand clear explanations about health, technology, and the planet.",
    },
    sport: {
      title: "Sport And Society",
      goal: "Read sport stories with more nuance, contrast, and commentary.",
    },
  },
  B2: {
    "everyday life": {
      title: "Modern Life Debates",
      goal: "Read reflective essays on work, cities, privacy, and daily choices.",
    },
    "news-style": {
      title: "Public Affairs",
      goal: "Read balanced news analysis about policy, society, and institutions.",
    },
    culture: {
      title: "Culture In Debate",
      goal: "Follow richer arguments about art, media, memory, and identity.",
    },
    science: {
      title: "Science And Society",
      goal: "Read nuanced science essays with abstract vocabulary and qualification.",
    },
    sport: {
      title: "Sport In Perspective",
      goal: "Understand sport as culture, economy, identity, and public life.",
    },
  },
  C1: {
    "everyday life": { title: "Advanced Life", goal: "Read advanced everyday prose." },
    "news-style": { title: "Advanced News", goal: "Read advanced news analysis." },
    culture: { title: "Advanced Culture", goal: "Read advanced cultural prose." },
    science: { title: "Advanced Science", goal: "Read advanced science prose." },
    sport: { title: "Advanced Sport", goal: "Read advanced sport prose." },
  },
  C2: {
    "everyday life": { title: "Independent Life", goal: "Read independent everyday prose." },
    "news-style": { title: "Independent News", goal: "Read independent news analysis." },
    culture: { title: "Independent Culture", goal: "Read independent cultural prose." },
    science: { title: "Independent Science", goal: "Read independent science prose." },
    sport: { title: "Independent Sport", goal: "Read independent sport prose." },
  },
};

export const LESSON_UNITS: LessonUnit[] = (Object.keys(UNIT_COPY) as Difficulty[]).flatMap((level) =>
  CATEGORY_ORDER.map((category, index) => ({
    id: `${level.toLowerCase()}-${category.replace(/\s+/g, "-")}`,
    level,
    category,
    order: index + 1,
    ...UNIT_COPY[level][category],
  }))
);

export interface LessonUnitProgress {
  unit: LessonUnit;
  total: number;
  completed: number;
  nextText: ReadingText | null;
}

export function getLessonUnits(level: Difficulty, category: Category | "all" = "all"): LessonUnit[] {
  return LESSON_UNITS.filter((unit) => unit.level === level && (category === "all" || unit.category === category));
}

export function lessonUnitForText(text: ReadingText): LessonUnit | null {
  return LESSON_UNITS.find((unit) => unit.level === text.difficulty && unit.category === text.category) ?? null;
}

export function getLessonUnitTexts(unitId: string): ReadingText[] {
  const unit = LESSON_UNITS.find((item) => item.id === unitId);
  if (!unit) return [];
  return starterTexts
    .filter((text) => text.difficulty === unit.level && text.category === unit.category)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getLessonUnitProgress(unit: LessonUnit): LessonUnitProgress {
  const texts = getLessonUnitTexts(unit.id);
  const completed = texts.filter((text) => getProgress(text.id).status === "completed").length;
  const nextText = texts.find((text) => getProgress(text.id).status !== "completed") ?? texts[0] ?? null;
  return { unit, total: texts.length, completed, nextText };
}

export function lessonNumberInUnit(text: ReadingText): number {
  const unit = lessonUnitForText(text);
  if (!unit) return 1;
  const index = getLessonUnitTexts(unit.id).findIndex((item) => item.id === text.id);
  return index === -1 ? 1 : index + 1;
}

export function getNextLessonUnit(level: Difficulty, category: Category | "all" = "all"): LessonUnitProgress | null {
  const units = getLessonUnits(level, category);
  if (units.length === 0) return null;
  return units.map(getLessonUnitProgress).find((progress) => progress.completed < progress.total) ?? getLessonUnitProgress(units[0]);
}

export function getLessonPathTexts({
  level,
  category = "all",
  limit = 8,
}: {
  level: Difficulty;
  category?: Category | "all";
  limit?: number;
}): ReadingText[] {
  const units = getLessonUnits(level, category);
  if (units.length === 0) return [];

  const nextUnit = getNextLessonUnit(level, category);
  const orderedUnits = nextUnit
    ? [nextUnit.unit, ...units.filter((unit) => unit.id !== nextUnit.unit.id)]
    : units;

  const out: ReadingText[] = [];
  for (const unit of orderedUnits) {
    const texts = getLessonUnitTexts(unit.id);
    const firstIncomplete = texts.findIndex((text) => getProgress(text.id).status !== "completed");
    const start = firstIncomplete === -1 ? 0 : firstIncomplete;
    for (const text of [...texts.slice(start), ...texts.slice(0, start)]) {
      if (!out.some((existing) => existing.id === text.id)) out.push(text);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
