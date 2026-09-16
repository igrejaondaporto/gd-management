/** Visual tone of a header chip / status pill. */
export type ChipTone = "default" | "success" | "warning" | "danger";

/**
 * Tones that carry meaning (as opposed to `default`, which is decoration).
 * A subset of `ChipTone` so domain code can return one of these directly.
 */
export type StatusTone = Exclude<ChipTone, "default">;

/**
 * Class names written out in full on purpose: Tailwind only keeps a class in
 * `@layer components` when it can find the literal string in the source, and a
 * template like `chip-${tone}` is invisible to that scan — the rules were
 * silently dropped and the pill rendered unstyled, with no error.
 *
 * Keep these as whole strings, and keep this the only place they are written:
 * the header chips and the dashboard pills must not drift apart.
 */
export const CHIP_TONE_CLASS: Record<ChipTone, string> = {
  default: "chip",
  success: "chip chip-success",
  warning: "chip chip-warning",
  danger: "chip chip-danger",
};
