import { type Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2A6EEA",
        accent: "#12B8AD",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
