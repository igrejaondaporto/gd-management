import { PersonChip } from "@/components/ui/PersonChip";
import { NameInput } from "@/components/ui/NameInput";
import { AddedNameChip } from "@/components/ui/AddedNameChip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { categoryColors } from "@/lib/constants";
import type { Person } from "@/types";

interface AttenderStepProps {
  attenders: Person[];
  visitors: Person[];
  selectedIds: Set<string>;
  upgradeIds: Set<string>;
  manualNames: string[];
  onToggle: (id: string) => void;
  onToggleUpgrade: (id: string) => void;
  onAddManual: (name: string) => void;
  onRemoveManual: (index: number) => void;
}

export function AttenderStep({
  attenders,
  visitors,
  selectedIds,
  upgradeIds,
  manualNames,
  onToggle,
  onToggleUpgrade,
  onAddManual,
  onRemoveManual,
}: AttenderStepProps) {
  return (
    <div>
      <div className="mb-1 font-display text-[21px] font-bold text-ink">
        Quem esteve entre os frequentadores?
      </div>
      <div className="mb-[18px] font-body text-[13.5px] text-ink-soft">
        Toque para marcar presenca. Sugerimos quem visitou o GD recentemente.
      </div>

      {visitors.length > 0 && (
        <div className="mb-[18px]">
          <SectionLabel hint="Visitaram o GD antes — toque para confirmar como frequentador presente">
            Sugestoes
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            {visitors.map((p) => (
              <PersonChip
                key={p.id}
                name={p.name}
                color={categoryColors.attender.color}
                bg={categoryColors.attender.bg}
                dashed={!upgradeIds.has(p.id)}
                tag="novo"
                selected={upgradeIds.has(p.id)}
                onClick={() => onToggleUpgrade(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {attenders.length > 0 && (
        <div className="mb-[18px]">
          <SectionLabel>Frequentadores</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {attenders.map((p) => (
              <PersonChip
                key={p.id}
                name={p.name}
                color={categoryColors.attender.color}
                bg={categoryColors.attender.bg}
                selected={selectedIds.has(p.id)}
                onClick={() => onToggle(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {attenders.length === 0 && visitors.length === 0 && (
        <div className="mb-[14px] font-body text-[13px] text-ink-faint">
          Ainda nao ha frequentadores cadastrados neste GD. Adicione manualmente abaixo.
        </div>
      )}

      <SectionLabel>Adicionar manualmente</SectionLabel>
      <NameInput placeholder="Nome do frequentador" onAdd={onAddManual} />
      {manualNames.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {manualNames.map((name, i) => (
            <AddedNameChip
              key={i}
              name={name}
              color={categoryColors.attender.color}
              bg={categoryColors.attender.bg}
              onRemove={() => onRemoveManual(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
