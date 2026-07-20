/**
 * Flat scene illustrations for lessons and article cards.
 *
 * The app had no artwork of any kind — an audit of the live site found zero
 * images and zero illustrative SVGs, so every screen was text inside rounded
 * rectangles. Duolingo and Babbel both lean on imagery to do work text can't:
 * signalling what a lesson is about before you read a word, making a list
 * scannable at a glance, and giving a screen somewhere for the eye to land.
 *
 * These are drawn in the existing paper palette rather than introducing new
 * colour, and shipped as inline SVG: no network request, no layout shift, and
 * they inherit the page's own tints so a lesson card still looks like part of
 * the app rather than clip art dropped into it.
 *
 * Geometry is deliberately simple — a tinted ground plus two or three shapes.
 * At the 40-72px sizes these render at, detail turns to mud, and a small set
 * of confident shapes reads better than a literal picture.
 */

export type SceneName =
  | "coffee"
  | "home"
  | "market"
  | "cat"
  | "rain"
  | "ball"
  | "bicycle"
  | "art"
  | "music"
  | "nature"
  | "moon"
  | "train"
  | "sea"
  | "book"
  | "panda"
  | "recycle"
  | "run"
  | "work";

/** Palette echoes tailwind.config.ts so scenes stay in the paper theme. */
const INK = "#2B2A22";
const GREEN = "#2F5D46";
const GREEN_LIGHT = "#E3EEE7";
const CREAM_DARK = "#E8DFC9";
const PINK = "#F7DAD0";
const RUST = "#9C4530";

/** Which scene fits which lesson. Reuse is fine — a shared scene still tells you the topic. */
const SCENE_BY_LESSON: Record<string, SceneName> = {
  "starter-a1-001": "coffee",
  "starter-a1-002": "home",
  "starter-a1-003": "market",
  "starter-a1-004": "cat",
  "starter-a1-005": "rain",
  "starter-a1-006": "ball",
  "starter-a1-007": "bicycle",
  "starter-a1-008": "art",
  "starter-a1-009": "music",
  "starter-a1-010": "nature",
  "starter-a1-011": "moon",
  "starter-a1-012": "nature",
  "starter-a1-013": "train",
  "starter-a1-014": "coffee",
  "starter-a1-015": "sea",
  "starter-a2-001": "home",
  "starter-a2-002": "coffee",
  "starter-a2-003": "run",
  "starter-a2-004": "sea",
  "starter-a2-005": "art",
  "starter-a2-006": "book",
  "starter-a2-007": "moon",
  "starter-a2-008": "panda",
  "starter-a2-009": "recycle",
  "starter-a2-010": "book",
  "starter-a2-011": "bicycle",
  "starter-a2-012": "nature",
  "starter-a2-013": "work",
  "starter-a2-014": "music",
  "starter-a2-015": "train",
};

/** Fallback by topic, so RSS and public-domain texts get a scene too. */
const SCENE_BY_CATEGORY: Record<string, SceneName> = {
  "news-style": "work",
  sport: "ball",
  culture: "art",
  science: "nature",
  "everyday life": "home",
};

export function sceneFor(textId: string, category?: string): SceneName {
  return SCENE_BY_LESSON[textId] ?? SCENE_BY_CATEGORY[category ?? ""] ?? "book";
}

function Scene({ name }: { name: SceneName }) {
  switch (name) {
    case "coffee":
      return (
        <>
          <path d="M18 26h22v14a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" fill={GREEN} />
          <path d="M40 30h4a5 5 0 0 1 0 10h-4z" fill="none" stroke={GREEN} strokeWidth="3" />
          <rect x="16" y="50" width="26" height="3" rx="1.5" fill={INK} opacity="0.25" />
          <path d="M24 20c0-3 3-3 3-6M31 20c0-3 3-3 3-6" stroke={RUST} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    case "home":
      return (
        <>
          <path d="M14 30 32 16l18 14v22a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z" fill={GREEN} />
          <rect x="22" y="36" width="9" height="9" rx="1.5" fill={GREEN_LIGHT} />
          <rect x="34" y="36" width="9" height="9" rx="1.5" fill={GREEN_LIGHT} />
          <rect x="28" y="48" width="9" height="6" rx="1" fill={PINK} />
        </>
      );
    case "market":
      return (
        <>
          <path d="M16 28h32l-3 22a3 3 0 0 1-3 3H22a3 3 0 0 1-3-3z" fill={CREAM_DARK} />
          <path d="M24 28a8 8 0 0 1 16 0" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
          <circle cx="27" cy="38" r="5" fill={RUST} />
          <circle cx="37" cy="40" r="6" fill={GREEN} />
        </>
      );
    case "cat":
      return (
        <>
          <path d="M20 30l-3-10 9 5zM44 30l3-10-9 5z" fill={GREEN} />
          <circle cx="32" cy="36" r="14" fill={GREEN} />
          <circle cx="27" cy="34" r="2" fill={GREEN_LIGHT} />
          <circle cx="37" cy="34" r="2" fill={GREEN_LIGHT} />
          <path d="M32 39v2M28 43a5 5 0 0 0 8 0" stroke={GREEN_LIGHT} strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      );
    case "rain":
      return (
        <>
          <path d="M22 34a9 9 0 0 1 1-18 12 12 0 0 1 22 3 8 8 0 0 1-2 15z" fill={CREAM_DARK} />
          <path d="M24 42l-3 8M32 42l-3 8M40 42l-3 8" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "ball":
      return (
        <>
          <circle cx="32" cy="34" r="15" fill={GREEN_LIGHT} stroke={GREEN} strokeWidth="3" />
          <path d="M32 24l7 5-3 9h-8l-3-9z" fill={GREEN} />
          <path d="M18 52h28" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.25" />
        </>
      );
    case "bicycle":
      return (
        <>
          <circle cx="20" cy="40" r="10" fill="none" stroke={GREEN} strokeWidth="3" />
          <circle cx="44" cy="40" r="10" fill="none" stroke={GREEN} strokeWidth="3" />
          <path d="M20 40l8-14h8l-4 14M28 26h8" stroke={RUST} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M32 40h12" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "art":
      return (
        <>
          <rect x="14" y="16" width="36" height="30" rx="3" fill={CREAM_DARK} />
          <rect x="19" y="21" width="26" height="20" rx="2" fill={GREEN_LIGHT} />
          <circle cx="27" cy="29" r="4" fill={RUST} />
          <path d="M20 41l8-9 7 7 5-4 5 6z" fill={GREEN} />
          <path d="M32 46v8M24 54h16" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
        </>
      );
    case "music":
      return (
        <>
          <path d="M26 44V20l18-4v24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="21" cy="45" r="6" fill={GREEN} />
          <circle cx="39" cy="41" r="6" fill={RUST} />
        </>
      );
    case "nature":
      return (
        <>
          <path d="M32 50V30" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="22" r="9" fill={GREEN} />
          <circle cx="32" cy="22" r="3.5" fill={PINK} />
          <path d="M32 38c-5 0-8-3-9-7 5-1 8 2 9 7zM32 42c5 0 8-3 9-7-5-1-8 2-9 7z" fill={GREEN_LIGHT} />
          <path d="M18 52h28" stroke={CREAM_DARK} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "moon":
      return (
        <>
          <path d="M40 14a18 18 0 1 0 8 26A20 20 0 0 1 40 14z" fill={GREEN} />
          <circle cx="46" cy="20" r="2" fill={CREAM_DARK} />
          <circle cx="19" cy="24" r="1.8" fill={CREAM_DARK} />
          <circle cx="24" cy="48" r="1.5" fill={CREAM_DARK} />
        </>
      );
    case "train":
      return (
        <>
          <rect x="16" y="18" width="32" height="28" rx="6" fill={GREEN} />
          <rect x="21" y="24" width="22" height="11" rx="2" fill={GREEN_LIGHT} />
          <circle cx="24" cy="41" r="2.5" fill={PINK} />
          <circle cx="40" cy="41" r="2.5" fill={PINK} />
          <path d="M20 50l-4 6M44 50l4 6" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
        </>
      );
    case "sea":
      return (
        <>
          <circle cx="44" cy="20" r="7" fill={PINK} />
          <path d="M12 38c5-4 9-4 14 0s9 4 14 0 9-4 12 0" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
          <path d="M12 48c5-4 9-4 14 0s9 4 14 0 9-4 12 0" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        </>
      );
    case "book":
      return (
        <>
          <path d="M14 20h15a5 5 0 0 1 3 1v27a5 5 0 0 0-3-1H14z" fill={GREEN} />
          <path d="M50 20H35a5 5 0 0 0-3 1v27a5 5 0 0 1 3-1h15z" fill={GREEN_LIGHT} stroke={GREEN} strokeWidth="2" />
          <path d="M38 28h8M38 34h8" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "panda":
      return (
        <>
          <circle cx="20" cy="24" r="6" fill={INK} />
          <circle cx="44" cy="24" r="6" fill={INK} />
          <circle cx="32" cy="35" r="15" fill={CREAM_DARK} />
          <ellipse cx="26" cy="33" rx="4" ry="5" fill={INK} />
          <ellipse cx="38" cy="33" rx="4" ry="5" fill={INK} />
          <circle cx="32" cy="42" r="2.5" fill={INK} />
        </>
      );
    case "recycle":
      return (
        <>
          <path d="M32 14l7 12h-14z" fill={GREEN} />
          <path d="M50 44l-12 2 7-12z" fill={GREEN} opacity="0.75" />
          <path d="M14 44l5-10 7 12z" fill={GREEN} opacity="0.5" />
          <circle cx="32" cy="34" r="6" fill={GREEN_LIGHT} />
        </>
      );
    case "run":
      return (
        <>
          <circle cx="36" cy="17" r="5" fill={GREEN} />
          <path d="M34 24l-6 10 8 6 2 12" stroke={GREEN} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M28 34l-9 3M34 30l10 4" stroke={RUST} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M16 54h32" stroke={CREAM_DARK} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "work":
      return (
        <>
          <rect x="14" y="24" width="36" height="24" rx="3" fill={GREEN} />
          <rect x="19" y="29" width="26" height="14" rx="2" fill={GREEN_LIGHT} />
          <path d="M26 24v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" fill="none" stroke={GREEN} strokeWidth="3" />
          <path d="M24 35h16" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
  }
}

/**
 * Renders a scene on a soft tinted ground. `size` is the rendered square in
 * px; everything inside is drawn against a fixed 64x64 grid so scenes stay
 * consistent with one another at any size.
 */
export default function LessonScene({
  name,
  size = 56,
  className = "",
}: {
  name: SceneName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="18" fill={CREAM_DARK} opacity="0.5" />
      <Scene name={name} />
    </svg>
  );
}
