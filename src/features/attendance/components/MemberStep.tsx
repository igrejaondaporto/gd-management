import { PersonChip } from "@/components/ui/PersonChip";
import { NameInput } from "@/components/ui/NameInput";
import { AddedNameChip } from "@/components/ui/AddedNameChip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { categoryColors } from "@/lib/constants";
import type { Person } from "@/types";

interface MemberStepProps {
  members: Person[];
  attenders: Person[];
  selectedIds: Set<string>;
  upgradeIds: Set<string>;
  manualNames: string[];
  onToggle: (id: string) => void;
  onToggleUpgrade: (id: string) => void;
  onAddManual: (name: string) => void;
  onRemoveManual: (index: number) => void;
}

export function MemberStep({
  members,
  attenders,
  selectedIds,
  upgradeIds,
  manualNames,
  onToggle,
  onToggleUpgrade,
  onAddManual,
  onRemoveManual,
}: MemberStepProps) {
  return (
    <div>
      <div className="mb-1 font-display text-[21px] font-bold text-ink">
        Quem esteve entre os membros?
      </div>
      <div className="mb-[18px] font-body text-[13.5px] text-ink-soft">
        Toque para marcar presenca. Um frequentador pode se tornar membro aqui.
      </div>

      {members.length > 0 && (
        <div className="mb-[18px]">
          <SectionLabel>Membros</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {members.map((p) => (
              <PersonChip
                key={p.id}
                name={p.name}
                color={categoryColors.member.color}
                bg={categoryColors.member.bg}
                selected={selectedIds.has(p.id)}
                onClick={() => onToggle(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {attenders.length > 0 && (
        <div className="mb-[18px]">
          <SectionLabel hint="Toque para tornar essa pessoa membro do GD">
            Promover a membro
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            {attenders.map((p) => (
              <PersonChip
                key={p.id}
                name={p.name}
                color={categoryColors.member.color}
                bg={categoryColors.member.bg}
                dashed={!upgradeIds.has(p.id)}
                tag={upgradeIds.has(p.id) ? "novo membro" : undefined}
                selected={upgradeIds.has(p.id)}
                onClick={() => onToggleUpgrade(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="mb-[14px] font-body text-[13px] text-ink-faint">
          Primeira vez? Adicione os membros do seu GD manualmente abaixo.
        </div>
      )}

      <SectionLabel>Adicionar manualmente</SectionLabel>
      <NameInput placeholder="Nome do membro" onAdd={onAddManual} />
      {manualNames.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {manualNames.map((name, i) => (
            <AddedNameChip
              key={i}
              name={name}
              color={categoryColors.member.color}
              bg={categoryColors.member.bg}
              onRemove={() => onRemoveManual(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
