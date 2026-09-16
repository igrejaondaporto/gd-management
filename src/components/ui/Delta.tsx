import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { colors } from "@/lib/constants";

interface DeltaProps {
  value: number | null;
}

export function Delta({ value }: DeltaProps) {
  if (value === null || value === undefined) {
    return <span className="font-body text-xs text-ink-faint">—</span>;
  }

  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-body text-xs font-bold text-ink-faint">
        <Minus size={12} /> igual à semana anterior
      </span>
    );
  }

  const up = value > 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 font-body text-xs font-bold"
      style={{ color: up ? colors.green : colors.gold }}
    >
      {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      {Math.abs(value)} vs. semana anterior
    </span>
  );
}
