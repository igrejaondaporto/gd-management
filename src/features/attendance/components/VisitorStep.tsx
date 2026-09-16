import { NameInput } from "@/components/ui/NameInput";
import { AddedNameChip } from "@/components/ui/AddedNameChip";
import { categoryColors } from "@/lib/constants";

interface VisitorStepProps {
  names: string[];
  onAdd: (name: string) => void;
  onRemove: (index: number) => void;
}

export function VisitorStep({ names, onAdd, onRemove }: VisitorStepProps) {
  return (
    <div>
      <div className="mb-1 font-display text-[21px] font-bold tracking-[-0.03em] text-ink">
        Quem visitou o GD hoje?
      </div>
      <div className="mb-[18px] font-body text-[13.5px] text-ink-soft">
        Adicione uma pessoa por vez. Se ninguém veio pela primeira vez, é só seguir em frente.
      </div>
      <NameInput placeholder="Nome do visitante" onAdd={onAdd} />
      {names.length > 0 && (
        <div className="mt-[14px] flex flex-wrap gap-2">
          {names.map((name, i) => (
            <AddedNameChip
              key={i}
              name={name}
              color={categoryColors.visitor.color}
              bg={categoryColors.visitor.bg}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
