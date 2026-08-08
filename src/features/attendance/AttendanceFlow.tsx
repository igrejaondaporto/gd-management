import { useState, useCallback, useMemo } from "react";
import { ChevronLeft, X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { VisitorStep } from "./components/VisitorStep";
import { AttenderStep } from "./components/AttenderStep";
import { MemberStep } from "./components/MemberStep";
import { ReviewStep, type ReviewGroup } from "./components/ReviewStep";
import { SuccessStep } from "./components/SuccessStep";
import { useCreateWeek } from "@/hooks/useWeeks";
import { addDays, formatWeekLabel } from "@/lib/utils";
import type { Person, Category, Week } from "@/types";

const STEPS = ["Visitantes", "Frequentadores", "Membros", "Revisao"];

const STEP_COLORS = ["#AF5D64", "#A9822C", "#266BC6", "#232A21"];

interface AttendanceFlowProps {
  gdId: string;
  gdName: string;
  people: Person[];
  weeks: Week[];
  onExit: () => void;
}

export function AttendanceFlow({ gdId, gdName, people, weeks, onExit }: AttendanceFlowProps) {
  const [step, setStep] = useState(0);

  // Step 0: new visitors
  const [visitorNames, setVisitorNames] = useState<string[]>([]);

  // Step 1: attenders
  const [selectedAttenderIds, setSelectedAttenderIds] = useState<Set<string>>(new Set());
  const [upgradeVisitorIds, setUpgradeVisitorIds] = useState<Set<string>>(new Set());
  const [manualAttenderNames, setManualAttenderNames] = useState<string[]>([]);

  // Step 2: members
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [upgradeAttenderIds, setUpgradeAttenderIds] = useState<Set<string>>(new Set());
  const [manualMemberNames, setManualMemberNames] = useState<string[]>([]);

  const createWeek = useCreateWeek();

  const toggle = useCallback((set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setter(next);
  }, []);

  const lastWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null;
  const nextDate = lastWeek ? addDays(lastWeek.date, 7) : "2026-08-04";
  const nextLabel = formatWeekLabel(nextDate);

  const attenders = useMemo(() => people.filter((p) => p.category === "attender"), [people]);
  const members = useMemo(() => people.filter((p) => p.category === "member"), [people]);
  const visitors = useMemo(() => people.filter((p) => p.category === "visitor"), [people]);

  const totalPresent =
    visitorNames.length +
    selectedAttenderIds.size +
    upgradeVisitorIds.size +
    manualAttenderNames.length +
    selectedMemberIds.size +
    upgradeAttenderIds.size +
    manualMemberNames.length;

  const delta: number | null = null; // accurate delta requires attendance query — Phase 6

  // Build review groups
  const reviewGroups: ReviewGroup[] = useMemo(
    () => [
      { names: visitorNames, category: "visitor" as Category },
      {
        names: attenders.filter((p) => selectedAttenderIds.has(p.id)).map((p) => p.name),
        category: "attender" as Category,
      },
      {
        names: visitors.filter((p) => upgradeVisitorIds.has(p.id)).map((p) => p.name),
        category: "attender" as Category,
        tag: "novo",
      },
      { names: manualAttenderNames, category: "attender" as Category, tag: "novo" },
      {
        names: members.filter((p) => selectedMemberIds.has(p.id)).map((p) => p.name),
        category: "member" as Category,
      },
      {
        names: attenders.filter((p) => upgradeAttenderIds.has(p.id)).map((p) => p.name),
        category: "member" as Category,
        tag: "novo membro",
      },
      { names: manualMemberNames, category: "member" as Category, tag: "novo" },
    ],
    [
      visitorNames,
      attenders,
      selectedAttenderIds,
      visitors,
      upgradeVisitorIds,
      manualAttenderNames,
      members,
      selectedMemberIds,
      upgradeAttenderIds,
      manualMemberNames,
    ],
  );

  const handleConfirm = () => {
    // Build RPC payload
    const newPeople: { name: string; category: Category; memberSince?: string | null }[] = [
      ...visitorNames.map((name) => ({ name, category: "visitor" as Category, memberSince: null })),
      ...manualAttenderNames.map((name) => ({
        name,
        category: "attender" as Category,
        memberSince: null,
      })),
      ...manualMemberNames.map((name) => ({
        name,
        category: "member" as Category,
        memberSince: nextDate,
      })),
    ];

    const promotions = [
      ...Array.from(upgradeVisitorIds).map((id) => ({
        personId: id,
        newCategory: "attender" as Category,
        memberSince: null,
      })),
      ...Array.from(upgradeAttenderIds).map((id) => ({
        personId: id,
        newCategory: "member" as Category,
        memberSince: nextDate,
      })),
    ];

    const attendance = [
      ...Array.from(selectedAttenderIds).map((id) => ({
        personId: id,
        categoryAtTime: "attender" as Category,
      })),
      ...Array.from(selectedMemberIds).map((id) => ({
        personId: id,
        categoryAtTime: "member" as Category,
      })),
    ];

    createWeek.mutate({ gdId, date: nextDate, newPeople, promotions, attendance });
    setStep(4);
  };

  const stepColor = STEP_COLORS[step] || "#232A21";

  if (step === 4) {
    return (
      <SuccessStep
        total={totalPresent}
        delta={delta}
        gdName={gdName}
        nextLabel={nextLabel}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="mb-3 flex items-center justify-between">
          <IconButton
            onClick={() => (step === 0 ? onExit() : setStep((s) => s - 1))}
            label="Voltar"
          >
            <ChevronLeft size={20} />
          </IconButton>
          <div className="font-body text-xs font-bold text-ink-faint">Passo {step + 1} de 4</div>
          <IconButton onClick={onExit} label="Fechar">
            <X size={18} />
          </IconButton>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-sm transition-colors duration-200"
              style={{ background: i <= step ? stepColor : "#EAE4D0" }}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-5">
        {step === 0 && (
          <VisitorStep
            names={visitorNames}
            onAdd={(name) => setVisitorNames((v) => [...v, name])}
            onRemove={(i) => setVisitorNames((v) => v.filter((_, idx) => idx !== i))}
          />
        )}

        {step === 1 && (
          <AttenderStep
            attenders={attenders}
            visitors={visitors}
            selectedIds={selectedAttenderIds}
            upgradeIds={upgradeVisitorIds}
            manualNames={manualAttenderNames}
            onToggle={(id) => toggle(selectedAttenderIds, setSelectedAttenderIds, id)}
            onToggleUpgrade={(id) => toggle(upgradeVisitorIds, setUpgradeVisitorIds, id)}
            onAddManual={(name) => setManualAttenderNames((v) => [...v, name])}
            onRemoveManual={(i) => setManualAttenderNames((v) => v.filter((_, idx) => idx !== i))}
          />
        )}

        {step === 2 && (
          <MemberStep
            members={members}
            attenders={attenders}
            selectedIds={selectedMemberIds}
            upgradeIds={upgradeAttenderIds}
            manualNames={manualMemberNames}
            onToggle={(id) => toggle(selectedMemberIds, setSelectedMemberIds, id)}
            onToggleUpgrade={(id) => toggle(upgradeAttenderIds, setUpgradeAttenderIds, id)}
            onAddManual={(name) => setManualMemberNames((v) => [...v, name])}
            onRemoveManual={(i) => setManualMemberNames((v) => v.filter((_, idx) => idx !== i))}
          />
        )}

        {step === 3 && <ReviewStep nextLabel={nextLabel} groups={reviewGroups} />}
      </div>

      {/* Footer */}
      <div className="border-t border-line-soft px-5 pt-3 pb-5">
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => Math.min(s + 1, 3))}
            className="w-full cursor-pointer rounded-xl border-none bg-primary px-[13px] py-3 font-body text-[14.5px] font-bold text-white"
          >
            Continuar
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={createWeek.isPending}
            className="w-full cursor-pointer rounded-xl border-none bg-primary px-[13px] py-3 font-body text-[14.5px] font-bold text-white disabled:opacity-60"
          >
            {createWeek.isPending ? "Salvando..." : "Confirmar presenca da semana"}
          </button>
        )}
      </div>
    </div>
  );
}
