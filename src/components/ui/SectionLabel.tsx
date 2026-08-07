interface SectionLabelProps {
  children: string;
  hint?: string;
}

export function SectionLabel({ children, hint }: SectionLabelProps) {
  return (
    <div className="mb-[10px]">
      <div className="font-body text-[12.5px] font-bold text-ink-soft uppercase tracking-[0.6px]">
        {children}
      </div>
      {hint && (
        <div className="mt-0.5 font-body text-[12.5px] text-ink-faint">
          {hint}
        </div>
      )}
    </div>
  );
}
