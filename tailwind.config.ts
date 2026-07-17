 import type { Config } from "tailwindcss";
 
 const config: Config = {
   content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f3",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
        warm: {
          50: "#fdfbf9",
          100: "#faf7f4",
          200: "#f5f0eb",
          300: "#e8e0d6",
          400: "#d4c8b8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        reading: "720px",
      },
    },
  },
   plugins: [],
 };
 
 export default config;
