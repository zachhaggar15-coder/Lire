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
          muted: "#8C8570",
        },
        accent: {
          pink: "#F7DAD0",
          pinktext: "#B5563C",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
