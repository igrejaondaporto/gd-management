import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, CheckCircle, Undo2, X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { VisitorStep } from "./components/VisitorStep";
import { AttenderStep } from "./components/AttenderStep";
import { MemberStep } from "./components/MemberStep";
import { ReviewStep, type ReviewGroup } from "./components/ReviewStep";
import { SuccessStep } from "./components/SuccessStep";
import { useCreateWeek } from "@/hooks/useWeeks";
import { supabase } from "@/lib/supabaseClient";
import { formatWeekLabel, suggestWeekDate } from "@/lib/utils";
import { colors } from "@/lib/constants";
import type { Person, Category, Week } from "@/types";

const STEPS = ["Visitantes", "Frequentadores", "Membros", "Revisao"];

const STEP_COLORS = [colors.rose, colors.gold, colors.primary, colors.green];

interface AttendanceFlowProps {
  gdId: string;
  gdName: string;
  /** The GD's meeting day (0 = Sunday … 6 = Saturday), or null when it was
   *  never set. Drives the suggested date below. */
  weekday?: number | null;
  people: Person[];
  weeks: Week[];
  onExit: () => void;
}

export function AttendanceFlow({
  gdId,
  gdName,
  weekday = null,
  people,
  weeks,
  onExit,
}: AttendanceFlowProps) {
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

  // `weeks` arrives newest-first (see `useWeeks`), so the last recorded week is
  // `weeks[0]` — not the last element. `weeks[weeks.length - 1]` is the OLDEST,
  // which used to make the suggested date land weeks in the past and made the
  // "vs. semana anterior" delta compare against the first week ever recorded.
  const lastWeek = weeks[0] ?? null;
  const [selectedDate, setSelectedDate] = useState(() => suggestWeekDate(weeks, weekday));
  const nextLabel = formatWeekLabel(selectedDate);

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

  // Query previous week's attendance count to compute delta
  const { data: previousWeekCount } = useQuery({
    queryKey: ["previousWeekCount", gdId, lastWeek?.id],
    queryFn: async () => {
      if (!lastWeek?.id) return null;
      const { count, error } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("week_id", lastWeek.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!lastWeek?.id,
  });

  const delta: number | null =
    previousWeekCount !== null && previousWeekCount !== undefined
      ? totalPresent - previousWeekCount
      : null;

  // Build review groups
  const reviewGroups: ReviewGroup[] = useMemo(
    () => [
      { entries: visitorNames.map((n) => ({ name: n })), category: "visitor" as Category },
      {
        entries: [
          ...attenders.filter((p) => selectedAttenderIds.has(p.id)).map((p) => ({ name: p.name })),
          ...visitors
            .filter((p) => upgradeVisitorIds.has(p.id))
            .map((p) => ({ name: p.name, tag: "novo" as const })),
          ...manualAttenderNames.map((n) => ({ name: n, tag: "novo" as const })),
        ],
        category: "attender" as Category,
      },
      {
        entries: [
          ...members.filter((p) => selectedMemberIds.has(p.id)).map((p) => ({ name: p.name })),
          ...attenders
            .filter((p) => upgradeAttenderIds.has(p.id))
            .map((p) => ({ name: p.name, tag: "novo membro" as const })),
          ...manualMemberNames.map((n) => ({ name: n, tag: "novo" as const })),
        ],
        category: "member" as Category,
      },
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
        memberSince: selectedDate,
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
        memberSince: selectedDate,
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

    createWeek.mutate({ gdId, date: selectedDate, newPeople, promotions, attendance });
    setStep(4);
  };

  const stepColor = STEP_COLORS[step] || colors.ink;

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
          {/* Back button — from step 1 onwards */}
          {step >= 1 ? (
            <IconButton onClick={() => setStep((s) => s - 1)} label="Voltar">
              <Undo2 size={16} />
            </IconButton>
          ) : (
            <div className="w-[36px]" />
          )}
          <div className="text-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="cursor-pointer rounded-lg border border-line bg-transparent px-2 py-1 text-center font-mono text-[12px] font-bold text-ink outline-none"
              style={{ colorScheme: "light", WebkitAppearance: "none", minWidth: 90 }}
            />
          </div>
          <IconButton onClick={onExit} label="Fechar">
            <X size={18} />
          </IconButton>
        </div>
        {/* Progress bar */}
        {step === 3 ? (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-sm bg-primary" />
            <Check size={14} className="shrink-0 text-primary" strokeWidth={3} />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className="h-1.5 flex-1 rounded-sm transition-colors duration-200"
                style={{ background: i <= step ? stepColor : colors.lineSoft }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-2 pb-2">
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
      <div className="border-t border-line-soft px-5 pt-3 pb-4">
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
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-primary px-[13px] py-3 font-body text-[14.5px] font-bold text-white disabled:opacity-60"
          >
            {createWeek.isPending ? (
              "Salvando..."
            ) : (
              <>
                <CheckCircle size={20} />
                Confirmar presença
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
