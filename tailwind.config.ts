import type { Config } from "tailwindcss";

/**
 * Every palette colour is a CSS variable holding bare RGB channels, defined
 * for light mode in :root and redefined under html[data-theme="dark"] in
 * src/app/globals.css. That keeps opacity modifiers (bg-cream/95,
 * border-cream-dark/70) working and lets the whole app switch theme without
 * per-component dark: variants. Change a colour's value in globals.css, not here.
 */
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: token("brand"),
          dark: token("brand-dark"),
          light: token("brand-light"),
        },
        cream: {
          DEFAULT: token("cream"),
          card: token("cream-card"),
          dark: token("cream-dark"),
          sunken: token("cream-sunken"),
          chrome: token("cream-chrome"),
          fill: token("cream-fill"),
          strong: token("cream-strong"),
          gutter: token("cream-gutter"),
        },
        ink: {
          DEFAULT: token("ink"),
          muted: token("ink-muted"),
          faint: token("ink-faint"),
        },
        accent: {
          pink: token("accent-pink"),
          pinktext: token("accent-pinktext"),
          sky: token("accent-sky"),
          skytext: token("accent-skytext"),
          violet: token("accent-violet"),
          violettext: token("accent-violettext"),
          gold: token("accent-gold"),
          goldtext: token("accent-goldtext"),
          mint: token("accent-mint"),
          minttext: token("accent-minttext"),
        },
        yellow: {
          DEFAULT: token("yellow"),
          ink: token("yellow-ink"),
          muted: token("yellow-muted"),
        },
        rose: {
          DEFAULT: token("rose"),
          ink: token("rose-ink"),
        },
        journey: {
          dot: token("journey-dot"),
          cleared: token("journey-cleared"),
          current: token("journey-current"),
          currenttext: token("journey-currenttext"),
          locked: token("journey-locked"),
          lockedtext: token("journey-lockedtext"),
        },
      },
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-ui)", "system-ui", "sans-serif"],
        french: ["var(--font-french)", "Georgia", "serif"],
        mono: ["var(--font-micro)", "ui-monospace", "SFMono-Regular", "monospace"],
        numeral: ["var(--font-numeral)", "Georgia", "serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1.0625rem", { lineHeight: "1.5rem" }],
        lg: ["1.375rem", { lineHeight: "1.75rem" }],
        xl: ["1.75rem", { lineHeight: "2.125rem" }],
        "2xl": ["2rem", { lineHeight: "2.375rem" }],
        "3xl": ["2.5rem", { lineHeight: "2.75rem" }],
      },
      borderRadius: {
        card: "1.25rem",
        control: "0.75rem",
      },
      boxShadow: {
        card: "none",
        raised: "none",
        pressed: "none",
      },
    },
  },
  plugins: [],
};

export default config;
