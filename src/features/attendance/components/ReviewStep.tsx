import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { categoryColors } from "@/lib/constants";
import type { Category } from "@/types";

const SECTION_LABELS: Record<Category, string> = {
  visitor: "VISITANTES",
  attender: "FREQUENTADORES",
  member: "MEMBROS",
};

export interface ReviewEntry {
  name: string;
  tag?: string;
}

export interface ReviewGroup {
  entries: ReviewEntry[];
  category: Category;
}

interface ReviewStepProps {
  nextLabel: string;
  groups: ReviewGroup[];
}

export function ReviewStep({ nextLabel, groups }: ReviewStepProps) {
  const total = groups.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <div>
      <div className="mb-1 font-display text-[21px] font-bold text-ink">Resumo do GD</div>
      <div className="mb-[18px] font-body text-[12.5px] text-ink-faint">Semana de {nextLabel}</div>
      <div className="mb-[18px] font-mono text-[13px] font-bold text-primary">
        {total} presente{total !== 1 ? "s" : ""}
      </div>

      {groups.map(
        (g) =>
          g.entries.length > 0 && (
            <div key={g.category} className="mb-4">
              <SectionLabel>{`${SECTION_LABELS[g.category]} (${g.entries.length})`}</SectionLabel>
              {g.entries.map((entry) => (
                <div
                  key={entry.name + (entry.tag || "")}
                  className="flex items-center justify-between border-b border-line-soft py-[7px]"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={entry.name}
                      color={categoryColors[g.category].color}
                      bg="#EDE7D4"
                      size={24}
                    />
                    <span className="font-body text-[13.5px] font-semibold text-ink">
                      {entry.name}
                    </span>
                  </div>
                  {entry.tag && (
                    <span
                      className="font-body text-[11px] font-bold"
                      style={{ color: categoryColors[g.category].color }}
                    >
                      {entry.tag}
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
