interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
}

export function MiniStat({ label, value, color }: MiniStatProps) {
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-line bg-card px-3 py-[10px]">
      <div className="font-body text-[11px] font-semibold text-ink-faint">
        {label}
      </div>
      <div
        className="mt-0.5 font-mono text-[19px] font-bold"
        style={{ color: color || "#232A21" }}
      >
        {value}
      </div>
    </div>
  );
}
