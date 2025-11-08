import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0A0F1E",
        },
        primary: {
          DEFAULT: "#0AFFA7",
        },
        secondary: {
          DEFAULT: "#FFC107",
        },
        danger: {
          DEFAULT: "#E040FB",
        },
      },
    },
  },
  plugins: [],
};

export default config;
