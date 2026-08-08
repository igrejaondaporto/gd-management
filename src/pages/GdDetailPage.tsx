import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipboardList, BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { AdminDrawer } from "@/features/auth";
import { LeaderHome } from "@/features/attendance";
import { WeeklySummary } from "@/features/attendance";
import { AttendanceFlow } from "@/features/attendance";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import { useAllGds } from "@/hooks/useAllGds";
import { useProfile } from "@/hooks/useProfile";
import { ROLE_LABELS } from "@/lib/constants";

type View = "home" | "register" | "summary";

export default function GdDetailPage() {
  const { gdId } = useParams<{ gdId: string }>();
  const [view, setView] = useState<View>("home");
  const navigate = useNavigate();

  const { data: allGds } = useAllGds();
  const { data: profile } = useProfile();
  const { data: people = [], isLoading: peopleLoading } = usePeople(gdId);
  const { data: weeks = [], isLoading: weeksLoading } = useWeeks(gdId);

  const gd = allGds?.gds.find((g) => g.id === gdId);
  const roleLabel = profile?.role ? ROLE_LABELS[profile.role] : "";
  const isLoading = peopleLoading || weeksLoading;

  return (
    <div className="flex min-h-dvh flex-col bg-paper sm:items-center sm:justify-center sm:p-6">
      <PhoneFrame
        title={gd?.name || "GD"}
        badge={roleLabel ? { label: roleLabel, color: "#A9822C", bg: "#F1E2B8" } : undefined}
        onBack={() => navigate("/")}
        rightSlot={<AdminDrawer />}
      >
        <div className="flex flex-1 flex-col min-h-0">
          {/* Content */}
          <div className="flex flex-1 flex-col overflow-y-auto">
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
                <WeeklySummary weeks={weeks} gdId={gdId!} />
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
                gdName={gd?.name || "GD"}
                leaderName={
                  gd?.staff
                    .filter((s) => s.profileRole === "leader")
                    .map((s) => s.profileName)
                    .join(" e ") || "Lider"
                }
                people={people}
                weeks={weeks}
                onStartFlow={() => setView("register")}
                onViewSummary={() => setView("summary")}
              />
            )}
          </div>

          {/* Action buttons — visible on home */}
          {view === "home" && (
            <div className="flex gap-3 border-t border-line-soft px-5 py-4">
              <button
                onClick={() => setView("register")}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-primary px-4 py-3.5 font-body text-[13.5px] font-bold text-white"
              >
                <ClipboardList size={18} />
                Registrar semana
              </button>
              <button
                onClick={() => setView("summary")}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] border-line bg-card px-4 py-3.5 font-body text-[13.5px] font-bold text-ink"
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
