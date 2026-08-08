interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
  onClick?: () => void;
}

export function MiniStat({ label, value, color, onClick }: MiniStatProps) {
  const isClickable = !!onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={
        "flex flex-1 flex-col rounded-xl border bg-card px-3 py-[10px] text-left" +
        (isClickable
          ? " cursor-pointer border-primary/50 active:bg-primary/10 sm:hover:bg-primary/5"
          : " border-line cursor-default")
      }
    >
      <div className="min-h-[26px] font-body text-[11px] font-semibold leading-[13px] text-ink-faint">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[19px] font-bold" style={{ color: color || "#232A21" }}>
        {value}
      </div>
    </button>
  );
}
