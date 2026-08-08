import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { LeaderHome } from "@/features/attendance";
import { WeeklySummary } from "@/features/attendance";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import { useAllGds } from "@/hooks/useAllGds";
import { ROLE_LABELS } from "@/lib/constants";

export default function GdDetailPage() {
  const { gdId } = useParams<{ gdId: string }>();
  const [tab, setTab] = useState("home");
  const navigate = useNavigate();

  const { data: allGds } = useAllGds();
  const { data: people = [], isLoading: peopleLoading } = usePeople(gdId);
  const { data: weeks = [], isLoading: weeksLoading } = useWeeks(gdId);

  const gd = allGds?.gds.find((g) => g.id === gdId);
  const roleLabel = allGds?.role ? ROLE_LABELS[allGds.role] : "pastor";
  const isLoading = peopleLoading || weeksLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame
        title={gd?.name || "GD"}
        badge={{ label: roleLabel, color: "#A9822C", bg: "#F1E2B8" }}
        onBack={() => navigate("/reports")}
      >
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {tab === "home" && (
                <LeaderHome
                  gdName={gd?.name || "GD"}
                  leaderName={
                    gd?.staff
                      .filter((s) => s.profileRole === "leader")
                      .map((s) => s.profileName)
                      .join(" e ") || "Lider"
                  }
                  people={people}
                  weeks={weeks}
                  onStartFlow={() => {}}
                  readOnly
                />
              )}
              {tab === "summary" && weeks.length > 0 && (
                <WeeklySummary weeks={weeks} people={people} />
              )}
              {tab === "summary" && weeks.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <BarChart3 size={30} className="mb-[10px] text-ink-faint" />
                  <div className="font-display text-[17px] font-bold text-ink">
                    Nenhum dado ainda
                  </div>
                  <div className="mt-1 font-body text-[13px] text-ink-faint">
                    Assim que a primeira semana for registrada, o resumo aparece aqui.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <BottomNav
          tabs={[
            { key: "home", label: "Inicio", icon: <Home size={20} /> },
            { key: "summary", label: "Resumo", icon: <BarChart3 size={20} /> },
          ]}
          active={tab}
          onChange={setTab}
        />
      </PhoneFrame>
    </div>
  );
}
