// Application design tokens — mirrors tailwind.config.ts for JS/TS usage.
// Values of the igrejaonda visual identity (see packages/shared in portal-onda).
export const colors = {
  paper: "#FFFFFF",
  paperAlt: "#F4F6FD",
  backdrop: "#F1F3FA",
  card: "#FFFFFF",
  ink: "#0A0F2E",
  inkSoft: "#6A7192",
  inkFaint: "#9AA0BC",
  line: "#E3E6F2",
  lineSoft: "#EFF1F8",

  // primary color (igrejaonda blue)
  primary: "#0019BE",
  primaryDark: "#001594",
  primarySoft: "#EAEEFF",
  night: "#000E6B",

  // igrejaonda accents
  lima: "#D8F24B",
  limaSoft: "#EEF9B8",
  water: "#EAEEFF",
  cyan: "#0092D4",
  violet: "#7B5CFF",
  green: "#00A88F",

  gold: "#E59500",
  goldSoft: "#FFF0D6",
  rose: "#E0457B",
  roseSoft: "#FCE4EE",
} as const;

// person category mapping (keys in English, labels in Portuguese for UI)
export const categoryColors = {
  visitor: { color: colors.rose, bg: colors.roseSoft, label: "Visitante" },
  attender: { color: colors.gold, bg: colors.goldSoft, label: "Frequentador" },
  member: { color: colors.primary, bg: colors.primarySoft, label: "Membro" },
} as const;

export type Category = keyof typeof categoryColors;

// role display labels (keys in English, labels in Portuguese for UI)
export const ROLE_LABELS: Record<string, string> = {
  leader: "Líder",
  supervisor: "Supervisor",
  pastor: "Pastor",
};

export const ROLE_LABELS_PLURAL: Record<string, string> = {
  leader: "Líderes",
  supervisor: "Supervisores",
  pastor: "Pastores",
};

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

/** Meeting weekday of a GD. Index = `gds.weekday` = JS `Date.getDay()`,
 *  so `Date.getDay()` can index straight into either array. */
export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export const WEEKDAY_LONG = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
] as const;
