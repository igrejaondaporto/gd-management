import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Circle, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { NameInput } from "@/components/ui/NameInput";
import { AddedNameChip } from "@/components/ui/AddedNameChip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { categoryColors, colors } from "@/lib/constants";
import type { Person, Category } from "@/types";

/** Categories from weakest to strongest. The first is a person's default. */
const CATEGORIES: Category[] = ["visitor", "attender", "member"];

const PLURALS: Record<Category, string> = {
  visitor: "Visitantes",
  attender: "Frequentadores",
  member: "Membros",
};

/** The single promotion each category can take here (member can't go up). */
const PROMOTE_TO: Record<Category, Category | null> = {
  visitor: "attender",
  attender: "member",
  member: null,
};

export interface AddedPeople {
  /** People already in the GD, with the category to register them as. */
  attendance: { personId: string; categoryAtTime: Category }[];
  /** People not in the GD yet. */
  newPeople: { name: string; category: Category }[];
}

interface PersonRowProps {
  person: Person;
  /** Chosen category, or undefined when the person is not selected. */
  target: Category | undefined;
  /** Toggle the person using their own current category. */
  onToggle: () => void;
  /** Toggle the person using `category` (used by the promotion pill). */
  onSetTarget: (category: Category) => void;
}

/**
 * Row layout follows the `PersonChip` idea (tap the person to mark them) but
 * adds the promotion path as a second, explicit tap — so a visitor can be
 * registered as frequentador without going through the step flow.
 */
function PersonRow({ person, target, onToggle, onSetTarget }: PersonRowProps) {
  const current = categoryColors[person.category];
  const shown = target ?? person.category;
  const shownColors = categoryColors[shown];
  const promoteTo = PROMOTE_TO[person.category];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        target ? "border-primary bg-primary-soft" : "border-line bg-card active:bg-paper-alt"
      }`}
    >
      <Avatar name={person.name} color={current.color} bg={current.bg} size={32} />

      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-[13.5px] font-semibold text-ink">{person.name}</div>
        <div className="font-body text-[11px] font-bold" style={{ color: shownColors.color }}>
          {target && target !== person.category ? `Passa a ${shownColors.label}` : current.label}
        </div>
      </div>

      {promoteTo && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetTarget(promoteTo);
          }}
          className="shrink-0 cursor-pointer rounded-pill border-none px-3 py-1.5 font-body text-[11.5px] font-bold"
          style={
            target === promoteTo
              ? { background: categoryColors[promoteTo].color, color: colors.paper }
              : {
                  background: categoryColors[promoteTo].bg,
                  color: categoryColors[promoteTo].color,
                }
          }
        >
          → {categoryColors[promoteTo].label}
        </button>
      )}

      <span className={`shrink-0 ${target ? "text-primary" : "text-line"}`}>
        {target ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </span>
    </div>
  );
}

interface AddPeopleSheetProps {
  open: boolean;
  weekLabel: string;
  /** Every person of the GD (already sorted by name). */
  people: Person[];
  /** People already registered in this week — excluded from the list. */
  presentIds: Set<string>;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: AddedPeople) => void;
}

export function AddPeopleSheet({
  open,
  weekLabel,
  people,
  presentIds,
  saving,
  onClose,
  onSubmit,
}: AddPeopleSheetProps) {
  /** personId → category to register them as. Absent key = not selected. */
  const [targets, setTargets] = useState<Record<string, Category>>({});
  const [manualCategory, setManualCategory] = useState<Category>("visitor");
  const [manual, setManual] = useState<{ name: string; category: Category }[]>([]);

  // Start clean every time the sheet opens.
  useEffect(() => {
    if (!open) return;
    setTargets({});
    setManual([]);
    setManualCategory("visitor");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const groups = useMemo(() => {
    const byCategory: Record<Category, Person[]> = { visitor: [], attender: [], member: [] };
    people.forEach((p) => {
      if (!presentIds.has(p.id)) byCategory[p.category].push(p);
    });
    return byCategory;
  }, [people, presentIds]);

  const missingCount = CATEGORIES.reduce((sum, c) => sum + groups[c].length, 0);
  const selectedCount = Object.keys(targets).length + manual.length;

  const toggleRow = (id: string, category: Category) =>
    setTargets((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = category;
      return next;
    });

  const setTarget = (id: string, category: Category) =>
    setTargets((prev) => {
      const next = { ...prev };
      if (next[id] === category) delete next[id];
      else next[id] = category;
      return next;
    });

  if (!open) return null;

  const submit = () =>
    onSubmit({
      attendance: Object.entries(targets).map(([personId, categoryAtTime]) => ({
        personId,
        categoryAtTime,
      })),
      newPeople: manual,
    });

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 animate-fade-in bg-ink/45" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[560px] animate-slide-up flex-col overflow-hidden rounded-t-[26px] bg-card shadow-lg">
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line" />

        <div className="flex shrink-0 items-start justify-between px-5 pt-4 pb-2">
          <div>
            <div className="font-display text-[19px] font-bold tracking-[-0.03em] text-ink">
              Adicionar presenças
            </div>
            <div className="mt-0.5 font-body text-[12.5px] text-ink-faint">
              Semana de {weekLabel}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="cursor-pointer rounded-full border-none bg-paper-alt p-2 text-ink-soft"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-[18px] overflow-y-auto px-5 pt-2 pb-4">
          {CATEGORIES.map((cat) =>
            groups[cat].length > 0 ? (
              <div key={cat}>
                <SectionLabel hint="Toque para registar presença">{PLURALS[cat]}</SectionLabel>
                <div className="flex flex-col gap-2">
                  {groups[cat].map((p) => (
                    <PersonRow
                      key={p.id}
                      person={p}
                      target={targets[p.id]}
                      onToggle={() => toggleRow(p.id, p.category)}
                      onSetTarget={(c) => setTarget(p.id, c)}
                    />
                  ))}
                </div>
              </div>
            ) : null,
          )}

          {missingCount === 0 && (
            <div className="rounded-xl bg-paper-alt px-4 py-3 font-body text-[13px] text-ink-soft">
              Todos os que estão no GD já aparecem nesta semana. Se veio alguém novo, adiciona-o
              abaixo.
            </div>
          )}

          <div>
            <SectionLabel hint="Alguém que ainda não está no GD">Novo</SectionLabel>
            <div className="mb-2.5 flex gap-2">
              {CATEGORIES.map((cat) => {
                const active = manualCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setManualCategory(cat)}
                    className="flex-1 cursor-pointer rounded-pill border px-3 py-2 font-body text-[12px] font-bold transition-colors"
                    style={{
                      borderColor: active ? categoryColors[cat].color : colors.line,
                      background: active ? categoryColors[cat].bg : colors.paper,
                      color: active ? categoryColors[cat].color : colors.inkSoft,
                    }}
                  >
                    {categoryColors[cat].label}
                  </button>
                );
              })}
            </div>
            <NameInput
              placeholder="Nome"
              onAdd={(name) => setManual((v) => [...v, { name, category: manualCategory }])}
            />
            {manual.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {manual.map((m, i) => (
                  <AddedNameChip
                    key={`${m.name}-${i}`}
                    name={m.name}
                    color={categoryColors[m.category].color}
                    bg={categoryColors[m.category].bg}
                    onRemove={() => setManual((v) => v.filter((_, idx) => idx !== i))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-line-soft px-5 py-3.5 pb-safe">
          <button
            onClick={submit}
            disabled={selectedCount === 0 || saving}
            className="w-full cursor-pointer rounded-xl border-none bg-primary px-[13px] py-3 font-body text-[14.5px] font-bold text-white disabled:opacity-40"
          >
            {saving
              ? "Salvando..."
              : selectedCount === 0
                ? "Escolha quem esteve presente"
                : `Adicionar ${selectedCount} ${selectedCount === 1 ? "pessoa" : "pessoas"}`}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
