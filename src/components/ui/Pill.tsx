interface PillProps {
  children: string;
  color?: string;
  bg?: string;
}

export function Pill({
  children,
  color = "#68695C",
  bg = "#EAE4D0",
}: PillProps) {
  return (
    <span
      className="inline-block rounded-full px-[9px] py-[3px] font-body text-[11px] font-semibold tracking-[0.2px]"
      style={{ color, background: bg }}
    >
      {children}
    </span>
  );
}
