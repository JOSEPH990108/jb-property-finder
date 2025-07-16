import { type Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
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
