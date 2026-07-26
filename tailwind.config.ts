import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#16593C",
          dark: "#0F3E2B",
          light: "#E4EFE7",
        },
        cream: {
          DEFAULT: "#FFFCF4",
          card: "#FFFFFF",
          dark: "#EAE2CF",
          sunken: "#FBF7ED",
          chrome: "#FFFDF6",
          fill: "#F1EBDC",
          strong: "#E8E0CC",
        },
        ink: {
          DEFAULT: "#1B1915",
          muted: "#6E6858",
          faint: "#A79F8B",
        },
        accent: {
          pink: "#F3DCD8",
          pinktext: "#8C4A42",
          sky: "#DDEDF0",
          skytext: "#2F5960",
          violet: "#E8E1EF",
          violettext: "#5B4D6A",
          gold: "#F9D96B",
          goldtext: "#5E4A0E",
          mint: "#E4EFE7",
          minttext: "#16593C",
        },
        yellow: {
          DEFAULT: "#F9D96B",
          ink: "#5E4A0E",
          muted: "#7A5E12",
        },
        rose: {
          DEFAULT: "#F3DCD8",
          ink: "#8C4A42",
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
