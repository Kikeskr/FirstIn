import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141210",
        paper: "#F7F2E7",
        raised: "#FBF8F2",
        gold: "#C8962F",
        teal: "#1E5B52",
        "teal-soft": "#DCE9E6",
        muted: "#746D63",
      },
      fontFamily: {
        sans: ["Inter", "Avenir Next", "Arial", "sans-serif"],
        display: ["Space Grotesk", "Avenir Next", "Arial", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "Courier New", "monospace"],
      },
      boxShadow: { card: "0 16px 50px rgba(16, 17, 15, 0.08)" },
    },
  },
  plugins: [],
};

export default config;
