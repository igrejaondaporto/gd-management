import type { Config } from "tailwindcss";

/**
 * Design tokens — igrejaonda visual identity (Portal do Voluntário).
 *
 * The token NAMES are unchanged from before (primary, ink, line…); only the
 * VALUES changed. No component needed a rewrite because of this: everything
 * already using `bg-primary`, `text-ink` or `border-line` started speaking
 * the igrejaonda language in one go.
 *
 * Source of the values: `packages/shared/src/styles/global.css` in the
 * portal-onda monorepo (tokens `--azul` blue, `--lima` lime, `--tinta` ink,
 * `--cinza` grey, `--fio` line, `--agua` water, `--grad` gradient).
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        /* portal-onda only switches to the desktop layout at 900px
           (`@media (min-width: 900px)`). Tailwind's `sm:` (640px) is too
           low: a phone in landscape is 700–900px wide and would already be
           treated as desktop. `desktop` is the only breakpoint that should
           change the shell. */
        desktop: "900px",
      },
      colors: {
        // ── surfaces ──
        paper: "#FFFFFF",
        "paper-alt": "#F4F6FD",
        backdrop: "#F1F3FA",
        card: "#FFFFFF",

        // ── ink ── (--tinta, --cinza)
        ink: "#0A0F2E",
        "ink-soft": "#6A7192",
        "ink-faint": "#9AA0BC",
        line: "#E3E6F2",
        "line-soft": "#EFF1F8",

        // ── brand ── (--azul and the --grad family)
        primary: "#0019BE",
        "primary-dark": "#001594",
        "primary-soft": "#EAEEFF",
        night: "#000E6B",

        // ── igrejaonda accents ──
        lima: "#D8F24B",
        "lima-soft": "#EEF9B8",
        water: "#EAEEFF",
        cyan: "#0092D4",
        violet: "#7B5CFF",
        green: "#00A88F",

        // ── domain (person categories) ──
        // Still functional (visitor/attender/member), just aligned with
        // igrejaonda's saturated palette.
        gold: "#E59500",
        "gold-soft": "#FFF0D6",
        rose: "#E0457B",
        "rose-soft": "#FCE4EE",
      },
      fontFamily: {
        // A single family, like portal-onda: Outfit everywhere.
        display: ['"Outfit"', "system-ui", "sans-serif"],
        body: ['"Outfit"', "system-ui", "sans-serif"],
        mono: ['"Outfit"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        // --grad
        "brand-grad": "linear-gradient(118deg, #001ed1 0%, #0019be 52%, #001594 100%)",
      },
      borderRadius: {
        pill: "100px",
      },
      boxShadow: {
        nav: "0 -10px 30px rgba(0, 20, 120, 0.18)",
      },
      animation: {
        "stamp-pop": "stampPop 0.32s cubic-bezier(.2,1.4,.4,1) both",
        "slide-up": "slideUp 0.25s ease-out both",
        "fade-in": "fadeIn 0.2s ease-out both",
        "fade-up": "fadeUp 0.4s backwards both",
      },
      keyframes: {
        stampPop: {
          "0%": { transform: "scale(2.4) rotate(-14deg)", opacity: "0" },
          "55%": { transform: "scale(0.85) rotate(-10deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
