import type { ReactNode } from "react";

interface BottomNavTab {
  key: string;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  tabs: BottomNavTab[];
  active: string;
  onChange: (key: string) => void;
}

/** Bottom navigation bar — the same design as portal-onda
 *  (`packages/shared/src/styles/global.css`, `.navb`): blue bar with a
 *  gradient, translucent icons and a lime dash above the active tab. */
export function BottomNav({ tabs, active, onChange }: BottomNavProps) {
  return (
    // On large screens it stops being a bar glued to the edges and becomes a
    // centred, fixed pill (portal-onda's `.navb`), with rounded corners only
    // at the top, since the bottom sits flush against the viewport.
    <nav className="crista relative z-10 flex w-full shrink-0 pb-safe shadow-nav desktop:fixed desktop:inset-x-0 desktop:bottom-0 desktop:mx-auto desktop:max-w-[560px] desktop:rounded-t-[26px]">
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            data-on={on ? 1 : 0}
            className={`relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 border-none bg-transparent pt-2.5 pb-2.5 transition-colors duration-150 ${
              on ? "text-white" : "text-white/60"
            }`}
          >
            <span
              className={`absolute top-0 h-[3px] w-[22px] rounded-full bg-lima transition-opacity duration-200 ${
                on ? "opacity-100" : "opacity-0"
              }`}
            />
            {t.icon}
            <span className="max-w-full truncate text-[9.5px] font-semibold tracking-[-0.035em]">
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
