import { colors } from "@/lib/constants";

interface PillProps {
  children: string;
  color?: string;
  bg?: string;
}

export function Pill({ children, color = colors.inkSoft, bg = colors.lineSoft }: PillProps) {
  return (
    <span
      className="inline-block rounded-full px-[9px] py-[3px] font-body text-[11px] font-semibold tracking-[0.2px]"
      style={{ color, background: bg }}
    >
      {children}
    </span>
  );
}
