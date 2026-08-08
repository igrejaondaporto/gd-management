import { Home, ClipboardList, BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { WeeklySummary } from "@/features/attendance";
import { useLeaderGd } from "@/hooks/useLeaderGd";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import { useState } from "react";

export default function WeeklySummaryPage() {
  const [tab, setTab] = useState("summary");

  const { data: leaderGd, isLoading: gdLoading } = useLeaderGd();
  const { data: people = [], isLoading: peopleLoading } = usePeople(leaderGd?.gdId);
  const { data: weeks = [], isLoading: weeksLoading } = useWeeks(leaderGd?.gdId);

  const isLoading = gdLoading || peopleLoading || weeksLoading;

  if (weeks.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <PhoneFrame title={leaderGd?.gdName || "GD"}>
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <BarChart3 size={30} className="mb-[10px] text-ink-faint" />
            <div className="font-display text-[17px] font-bold text-ink">Nenhum dado ainda</div>
            <div className="mt-1 font-body text-[13px] text-ink-faint">
              Assim que a primeira semana for registrada, o resumo aparece aqui.
            </div>
          </div>
        </PhoneFrame>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title={leaderGd?.gdName || "GD"}>
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : leaderGd ? (
            <WeeklySummary weeks={weeks} people={people} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <p className="font-body text-sm text-ink-soft">Nenhum GD vinculado.</p>
            </div>
          )}
        </div>
        <BottomNav
          tabs={[
            { key: "home", label: "Inicio", icon: <Home size={20} /> },
            { key: "register", label: "Registrar", icon: <ClipboardList size={20} /> },
            { key: "summary", label: "Resumo", icon: <BarChart3 size={20} /> },
          ]}
          active={tab}
          onChange={setTab}
        />
      </PhoneFrame>
    </div>
  );
}
