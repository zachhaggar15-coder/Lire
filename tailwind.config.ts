import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warm "paper" palette — cream page background, white cards, deep
        // green accents. See README "Visual design system" for the palette.
        brand: {
          DEFAULT: "#2F5D46",
          dark: "#1F4534",
          light: "#E3EEE7",
        },
        cream: {
          DEFAULT: "#F4EEE0",
          card: "#FFFFFF",
          dark: "#E8DFC9",
        },
        ink: {
          DEFAULT: "#2B2A22",
          // Was #8C8570, which measured 3.18:1 on cream and 3.68:1 on white —
          // below the 4.5:1 WCAG AA needs for normal text. Since this colour
          // carries almost every subtitle, preview, caption and hint in the
          // app, most of the secondary text on screen was failing. #6B6350 is
          // the lightest warm grey that clears AA on both surfaces (5.15 and
          // 5.96), so it fixes the problem without cooling the palette.
          muted: "#6B6350",
        },
        accent: {
          pink: "#F7DAD0",
          // Same reason: #B5563C measured 3.64:1 on accent.pink.
          pinktext: "#9C4530",
        },
      },
      fontFamily: {
        // Body text stays on the system stack: it renders instantly, and the
        // reading surface was already well-tuned. Headings get the brand face
        // (see app/layout.tsx) so the app stops looking like default UI.
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // A deliberately gapped scale. The previous sizes (11, 12, 14, 16, 18)
        // sat so close together that a label, its value and its caption were
        // often 1-2px apart, so nothing led the eye. Steps now jump far enough
        // to establish hierarchy on their own, with weight and colour as
        // secondary signals rather than the only ones.
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12 — captions, badges (floor)
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14 — secondary text
        base: ["1.0625rem", { lineHeight: "1.5rem" }], // 17 — body
        lg: ["1.375rem", { lineHeight: "1.75rem" }], // 22 — card titles
        xl: ["1.75rem", { lineHeight: "2.125rem" }], // 28 — screen titles
        "2xl": ["2rem", { lineHeight: "2.375rem" }], // 32 — hero
        "3xl": ["2.5rem", { lineHeight: "2.75rem" }], // 40
      },
      borderRadius: {
        // Three shapes with distinct jobs, rather than four arbitrary radii:
        // "card" for containers, "control" for inputs and secondary buttons,
        // and the existing full-round pill reserved for primary actions.
        card: "1.5rem",
        control: "0.875rem",
      },
      boxShadow: {
        // An elevation language. There was exactly one shadow in the whole
        // app, so a primary action and a passive stat tile read as equally
        // important. Three levels: flat surfaces get none, resting cards get
        // "card", and things you can act on get "raised".
        card: "0 1px 2px rgb(43 42 34 / 0.06), 0 1px 3px rgb(43 42 34 / 0.04)",
        raised: "0 2px 4px rgb(43 42 34 / 0.08), 0 6px 16px rgb(43 42 34 / 0.10)",
        pressed: "inset 0 1px 2px rgb(43 42 34 / 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
