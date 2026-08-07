// Application design tokens — mirrors tailwind.config.ts for JS/TS usage
export const colors = {
  paper: "#F5F1E6",
  paperAlt: "#EDE7D4",
  card: "#FFFFFF",
  ink: "#232A21",
  inkSoft: "#68695C",
  inkFaint: "#9A9A8A",
  line: "#DFD8C0",
  lineSoft: "#EAE4D0",

  // primary color (blue)
  primary: "#266BC6",
  primaryDark: "#1B4E93",
  primarySoft: "#DCE7F8",

  gold: "#A9822C",
  goldSoft: "#F1E2B8",
  rose: "#AF5D64",
  roseSoft: "#F1DAD9",
} as const;

// person category mapping
export const categoryColors = {
  visitante: { color: colors.rose, bg: colors.roseSoft },
  frequentador: { color: colors.gold, bg: colors.goldSoft },
  membro: { color: colors.primary, bg: colors.primarySoft },
} as const;

export type Category = keyof typeof categoryColors;

export const MONTHS_PT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;
