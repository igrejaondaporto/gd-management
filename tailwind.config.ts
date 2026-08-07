import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F1E6",
        "paper-alt": "#EDE7D4",
        card: "#FFFFFF",
        ink: "#232A21",
        "ink-soft": "#68695C",
        "ink-faint": "#9A9A8A",
        line: "#DFD8C0",
        "line-soft": "#EAE4D0",
        // primária: azul (#266BC6) em vez do verde original
        primary: "#266BC6",
        "primary-dark": "#1B4E93",
        "primary-soft": "#DCE7F8",
        gold: "#A9822C",
        "gold-soft": "#F1E2B8",
        rose: "#AF5D64",
        "rose-soft": "#F1DAD9",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Public Sans"', "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      animation: {
        "stamp-pop": "stampPop 0.32s cubic-bezier(.2,1.4,.4,1) both",
      },
      keyframes: {
        stampPop: {
          "0%": { transform: "scale(2.4) rotate(-14deg)", opacity: "0" },
          "55%": { transform: "scale(0.85) rotate(-10deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
