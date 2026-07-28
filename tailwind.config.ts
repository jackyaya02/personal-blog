import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 高级甜美文艺风：奶油白 + 杏色 + 玫瑰粉 + 雾紫
        brand: {
          50: "#FDF4F7", // 极淡玫瑰雾
          100: "#FAE8EF", // 淡玫瑰
          200: "#F4CFDB", // 浅玫瑰
          300: "#EDB0C4", // 中浅玫瑰
          400: "#E88BA8", // 柔和玫瑰粉（主色）
          500: "#DB6F90", // 标准玫瑰
          600: "#C45A7A", // 深玫瑰
          700: "#A3475F", // 暗玫瑰
          800: "#7F3650", // 极暗玫瑰
          900: "#5C273A", // 酒红玫瑰
        },
        // 雾紫辅助色
        mist: {
          50: "#F8F5FB",
          100: "#EFE8F5",
          200: "#E0D4ED",
          300: "#D8C8E8", // 雾紫（辅助）
          400: "#C0AED8",
          500: "#A893C6",
        },
        // 中性色：奶油暖调
        cream: {
          50: "#FCFAF7", // 奶油白（主背景）
          100: "#F7F1EA", // 淡奶油
          200: "#F5E8E2", // 浅杏色（辅助背景）
          300: "#EDD8CC", // 杏灰
          400: "#D9BFAF", // 暖灰
        },
        // 兼容旧 warm 命名（部分组件仍在用，映射到 cream）
        warm: {
          50: "#FCFAF7",
          100: "#F7F1EA",
          200: "#EFE6DD",
          300: "#EDD8CC",
          400: "#D9BFAF",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-inter)", "HarmonyOS Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "editorial": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
      },
      maxWidth: {
        reading: "720px",
        editorial: "1080px",
      },
      boxShadow: {
        // 柔和暖调阴影
        soft: "0 2px 12px -2px rgba(120, 80, 60, 0.06), 0 4px 20px -4px rgba(120, 80, 60, 0.04)",
        "soft-hover": "0 10px 32px -6px rgba(180, 100, 130, 0.10), 0 4px 12px -2px rgba(120, 80, 60, 0.06)",
        rose: "0 8px 28px -8px rgba(232, 139, 168, 0.25)",
        "rose-soft": "0 2px 16px -4px rgba(232, 139, 168, 0.15)",
      },
      transitionTimingFunction: {
        "soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "soft-blob": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, -15px) scale(1.05)" },
          "66%": { transform: "translate(-15px, 10px) scale(0.98)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 1s ease-out both",
        "soft-blob": "soft-blob 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
