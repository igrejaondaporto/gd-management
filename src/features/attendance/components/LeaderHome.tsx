import { ClipboardList } from "lucide-react";
import { MiniStat } from "@/components/ui/MiniStat";
import { monthKey } from "@/lib/utils";
import { MONTHS_PT, colors } from "@/lib/constants";
import type { Person, Week } from "@/types";

interface LeaderHomeProps {
  gdName: string;
  leaderName: string;
  people: Person[];
  weeks: Week[];
  onStartFlow: () => void;
  readOnly?: boolean;
}

export function LeaderHome({
  gdName,
  leaderName,
  people,
  weeks,
  onStartFlow,
  readOnly = false,
}: LeaderHomeProps) {
  const lastWeek = weeks.length > 0 ? weeks[0] : null;
  const totalPeople = people.length;
  const currentMonthKey = lastWeek ? monthKey(lastWeek.date) : "2026-08";
  const weeksThisMonth = weeks.filter((w) => monthKey(w.date) === currentMonthKey);
  const newMembers = people.filter(
    (p) => p.category === "member" && p.memberSince && monthKey(p.memberSince) === currentMonthKey,
  ).length;

  return (
    <div className="px-5 pt-[18px] pb-6">
      <div className="font-body text-[12.5px] font-bold text-ink-faint uppercase tracking-[0.5px]">
        {leaderName}
      </div>
      <div className="mt-0.5 mb-[18px] font-display text-2xl font-bold text-ink">{gdName}</div>

      {!readOnly && (
        <button
          onClick={onStartFlow}
          className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-2xl border-none bg-primary px-[18px] py-[18px] text-white"
        >
          <div className="text-left">
            <div className="font-body text-[11px] font-bold opacity-75 uppercase tracking-[0.5px]">
              Registro semanal
            </div>
            <div className="mt-0.5 font-display text-[17px] font-bold">
              Registrar presenca de hoje
            </div>
          </div>
          <ClipboardList size={26} />
        </button>
      )}

      {lastWeek ? (
        <div className="mb-4 rounded-[14px] border border-line bg-card px-4 py-[14px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-body text-[11.5px] font-bold text-ink-faint">
                Ultima semana registrada
              </div>
              <div className="mt-px font-display text-base font-bold text-ink">
                {lastWeek.label}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[22px] font-bold text-primary">?</div>
              <div className="font-body text-[10.5px] text-ink-faint">presentes</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-[14px] border border-dashed border-line bg-paper-alt p-4 font-body text-[13px] text-ink-soft">
          Nenhuma semana registrada ainda.
          {readOnly
            ? " Aguardando o lider registrar a primeira presenca."
            : ' Toque em "Registrar presenca" para comecar.'}
        </div>
      )}

      <div className="flex gap-[10px]">
        <MiniStat label="Pessoas no GD" value={totalPeople} />
        <MiniStat
          label={`Media em ${MONTHS_PT[parseInt(currentMonthKey.split("-")[1], 10) - 1]}`}
          value={weeksThisMonth.length ? "?" : "—"}
          color={colors.primary}
        />
        <MiniStat label="Novos membros" value={newMembers} color={colors.gold} />
      </div>
    </div>
  );
}
