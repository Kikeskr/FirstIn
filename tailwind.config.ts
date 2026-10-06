import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10110f",
        paper: "#f6f4ee",
        acid: "#d9ff57",
        muted: "#74766f",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      boxShadow: { card: "0 16px 50px rgba(16, 17, 15, 0.08)" },
    },
  },
  plugins: [],
};

export default config;
