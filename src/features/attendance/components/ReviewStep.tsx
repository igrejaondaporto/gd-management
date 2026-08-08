import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { categoryColors } from "@/lib/constants";
import type { Category } from "@/types";

interface ReviewGroup {
  names: string[];
  category: Category;
  tag?: string;
}

export type { ReviewGroup };

interface ReviewStepProps {
  nextLabel: string;
  groups: ReviewGroup[];
}

export function ReviewStep({ nextLabel, groups }: ReviewStepProps) {
  const total = groups.reduce((sum, g) => sum + g.names.length, 0);

  return (
    <div>
      <div className="mb-1 font-display text-[21px] font-bold text-ink">
        Confira antes de confirmar
      </div>
      <div className="mb-[6px] font-body text-[13.5px] text-ink-soft">Semana de {nextLabel}</div>
      <div className="mb-[18px] font-mono text-[13px] font-bold text-primary">
        {total} presente{total !== 1 ? "s" : ""} no total
      </div>

      {groups.map(
        (g) =>
          g.names.length > 0 && (
            <div key={g.category + (g.tag || "")} className="mb-4">
              <SectionLabel>
                {`${categoryColors[g.category].label}s (${g.names.length})`}
              </SectionLabel>
              {g.names.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between border-b border-line-soft py-[7px]"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={name}
                      color={categoryColors[g.category].color}
                      bg="#EDE7D4"
                      size={24}
                    />
                    <span className="font-body text-[13.5px] font-semibold text-ink">{name}</span>
                  </div>
                  {g.tag && (
                    <span
                      className="font-body text-[11px] font-bold"
                      style={{ color: categoryColors[g.category].color }}
                    >
                      {g.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ),
      )}

      {total === 0 && (
        <div className="font-body text-[13px] text-ink-faint">
          Nenhuma presenca marcada ainda. Volte e selecione quem esteve no encontro.
        </div>
      )}
    </div>
  );
}
