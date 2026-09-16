import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { AdminDrawer } from "@/features/auth";
import { LeaderHome } from "@/features/attendance";
import { WeeklySummary } from "@/features/attendance";
import { AttendanceFlow } from "@/features/attendance";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import { useAllGds } from "@/hooks/useAllGds";

type View = "home" | "register" | "summary";

export default function GdDetailPage() {
  const { gdId } = useParams<{ gdId: string }>();
  const [view, setView] = useState<View>("home");
  const navigate = useNavigate();

  const { data: allGds } = useAllGds();
  const { data: people = [], isLoading: peopleLoading } = usePeople(gdId);
  const { data: weeks = [], isLoading: weeksLoading } = useWeeks(gdId);

  const gd = allGds?.gds.find((g) => g.id === gdId);
  const isLoading = peopleLoading || weeksLoading;

  // Header chips: only data that actually exists. There is no time or venue
  // per GD in the database (only `gds.weekday`), so no fixed value is made up
  // here.
  const headerChips: string[] = [];
  if (!isLoading) {
    headerChips.push(`${people.length} pessoa${people.length !== 1 ? "s" : ""}`);
    if (weeks.length > 0) {
      headerChips.push(
        `${weeks.length} semana${weeks.length !== 1 ? "s" : ""} registada${weeks.length !== 1 ? "s" : ""}`,
      );
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-backdrop">
      <PhoneFrame
        accent={gd?.name}
        chips={headerChips}
        onBack={() => {
          if (view !== "home") {
            setView("home");
          } else {
            navigate(-1);
          }
        }}
        rightSlot={<AdminDrawer />}
      >
        <div className="flex flex-1 flex-col min-h-0">
          {/* Content */}
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
              </div>
            ) : view === "register" ? (
              <AttendanceFlow
                gdId={gdId!}
                gdName={gd?.name || "GD"}
                people={people}
                weeks={weeks}
                onExit={() => setView("home")}
              />
            ) : view === "summary" ? (
              weeks.length > 0 ? (
                <WeeklySummary weeks={weeks} gdId={gdId!} people={people} />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <BarChart3 size={30} className="mb-[10px] text-ink-faint" />
                  <div className="font-display text-[17px] font-bold text-ink">
                    Nenhum dado ainda
                  </div>
                  <div className="mt-1 font-body text-[13px] text-ink-faint">
                    Assim que a primeira semana for registrada, o resumo aparece aqui.
                  </div>
                </div>
              )
            ) : (
              <LeaderHome
                gdId={gdId!}
                staff={(gd?.staff || []).map((s) => ({
                  name: s.profileName || "?",
                  role: s.profileRole || null,
                }))}
                people={people}
                weeks={weeks}
                onStartFlow={() => setView("register")}
                onViewSummary={() => setView("summary")}
              />
            )}
          </div>

          {/* Action buttons — visible on home */}
          {view === "home" && (
            <div className="border-t border-line-soft px-5 py-3">
              <button
                onClick={() => setView("summary")}
                className="btn sec full flex items-center justify-center gap-2"
              >
                <BarChart3 size={18} />
                Ver resumo
              </button>
            </div>
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
