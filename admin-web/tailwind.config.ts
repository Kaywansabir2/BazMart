import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bazmart: {
          orange: "#FF5A00",
          "orange-hover": "#E04F00",
          "orange-light": "#FFF3ED",
          green: "#A4FF00",
          yellow: "#FFF176",
          dark: "#111827",
          cream: "#F6F1EB",
          surface: "#F5F6F8",
        },
      },
    },
  },
  plugins: [],
};
export default config;

