import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1d1814",
        parchment: "#e8dcc0",
        cream: "#f1e7ce",
        walnut: "#21150f",
        mahogany: "#34170f",
        brass: "#a98848",
        oxblood: "#671d19",
      },
      boxShadow: {
        deep: "0 24px 80px rgba(0,0,0,.52)",
        insetWood: "inset 0 0 0 1px rgba(216,175,101,.13), inset 0 -16px 30px rgba(0,0,0,.28)",
      },
      letterSpacing: {
        court: ".18em",
      },
    },
  },
  plugins: [],
};

export default config;
