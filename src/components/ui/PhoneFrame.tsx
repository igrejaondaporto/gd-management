import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CHIP_TONE_CLASS, type ChipTone } from "./chipTone";

/** Curve joining the blue header to the white body — the same `path` as
 *  portal-onda (`packages/shared/src/styles/global.css`, `.curva`). */
export function Curva() {
  return (
    <svg
      className="curva fill-paper"
      viewBox="0 0 400 46"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0,46 C110,4 290,4 400,46 L400,46 L0,46 Z" />
    </svg>
  );
}

/** igrejaonda logo: light `<i>` + heavy `<b>`, as in the portal. */
export function Logo() {
  return (
    <span className="logo">
      <i>igreja</i>
      <b>onda</b>
    </span>
  );
}

/** Re-exported so callers can keep importing the tone type from here. */
export type { ChipTone };

export interface Chip {
  label: string;
  /** `default` is the translucent header chip; the rest are solid status
   *  pills (green / amber / red) for values that need to draw the eye. */
  tone?: ChipTone;
  /** Optional inline qualifier, smaller and de-emphasised (e.g. "últimos 30
   *  dias" → "4 relatórios em falta · últimos 30 dias"). Kept on the same line
   *  on purpose: stacking it made the pill taller than its neighbours and
   *  broke the row's alignment. */
  note?: string;
}

/** A chip is either a plain string — the common case — or a toned `Chip`. */
export type ChipInput = string | Chip;

interface PhoneFrameProps {
  children: ReactNode;
  /** White part of the title. Optional: some screens have the group name
   *  already carrying the prefix (e.g. "GD Gaia") in lime, and a white part
   *  would just repeat the word. */
  title?: string;
  /** Lime part of the title (e.g. `Manage` + accent `users`). */
  accent?: string;
  subtitle?: string;
  /** Labels in the header (e.g. `12 people`, `Week 38`). */
  chips?: ChipInput[];
  onBack?: () => void;
  rightSlot?: ReactNode;
  bottomSlot?: ReactNode;
}

export function PhoneFrame({
  children,
  title,
  accent,
  subtitle,
  chips,
  onBack,
  rightSlot,
  bottomSlot,
}: PhoneFrameProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-paper">
      {/* ── blue header ──
          On large screens the `crista` spans the full viewport width (like
          portal-onda's `.crista.topo`), carrying its own side padding — only
          the body is centred into a column. */}
      <header className="crista shrink-0 px-[22px] pt-6 desktop:px-[46px] desktop:pt-[26px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {onBack ? (
              <>
                <button
                  onClick={onBack}
                  aria-label="Voltar"
                  className="-ml-2 flex shrink-0 cursor-pointer items-center rounded-full border-none bg-white/15 p-1.5 text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <Logo />
              </>
            ) : (
              <button
                onClick={() => navigate("/")}
                aria-label="Ir para o início"
                className="flex shrink-0 cursor-pointer border-none bg-transparent p-0"
              >
                <Logo />
              </button>
            )}
          </div>

          {rightSlot && <div className="flex shrink-0 items-center gap-1">{rightSlot}</div>}
        </div>

        <h1 className="mt-[18px] font-display text-[clamp(30px,9vw,40px)] leading-[1.02] font-extrabold tracking-[-0.045em]">
          {title}
          {/* The space only goes in when there is a white part — without
              this, a title with only `accent` kept a leading space. */}
          {title && accent ? " " : null}
          {accent && <em className="destaque">{accent}</em>}
        </h1>

        {subtitle && <p className="sob mt-[10px]">{subtitle}</p>}

        {chips && chips.length > 0 && (
          <div className="mt-[18px] flex flex-wrap items-center gap-2">
            {chips.map((c, i) => {
              const chip: Chip = typeof c === "string" ? { label: c } : c;
              return (
                <span
                  key={`${chip.label}-${i}`}
                  className={CHIP_TONE_CLASS[chip.tone ?? "default"]}
                >
                  {chip.label}
                  {chip.note && (
                    // Real spaces around the separator, not just CSS margin:
                    // the accessible name is built from the text content, so a
                    // margin-only gap reads out as "falta· últimos".
                    <span className="text-[11px] font-semibold opacity-75">
                      {" · "}
                      {chip.note}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        <div className="h-[18px]" />
        <Curva />
      </header>

      {/* ── body ──
          Centred column with a max width (portal-onda's `.corpo`: 1120px,
          46px side padding), so it does not stretch on wide monitors. With a
          BottomNav the bottom padding doubles, because the bar floats over
          the content on large screens. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <div
          className={`mx-auto flex w-full flex-1 flex-col desktop:max-w-[1120px] desktop:px-[46px] ${
            bottomSlot ? "desktop:pb-[124px]" : "desktop:pb-[46px]"
          }`}
        >
          {children}
        </div>
      </div>

      {bottomSlot}
    </div>
  );
}
