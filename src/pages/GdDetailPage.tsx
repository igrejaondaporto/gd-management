import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

type SubTab = "home" | "register" | "summary";

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "home", label: "Inicio" },
  { key: "register", label: "Registrar" },
  { key: "summary", label: "Resumo" },
];

export default function GdDetailPage() {
  const { gdId } = useParams<{ gdId: string }>();
  const [tab, setTab] = useState<SubTab>("home");
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
          {/* Sub navigation */}
          <div className="flex border-b border-line-soft px-4">
            {SUB_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative cursor-pointer border-none bg-transparent px-4 py-3 font-body text-[13px] font-semibold"
                style={{ color: tab === t.key ? "#266BC6" : "#9A9A8A" }}
              >
                {t.label}
                {tab === t.key && (
                  <div className="absolute bottom-0 left-1/2 h-[2.5px] w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col overflow-y-auto">
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
                    onStartFlow={() => setTab("register")}
                    readOnly={!!profile?.role && profile.role !== "leader"}
                  />
                )}
                {tab === "register" && (
                  <AttendanceFlow
                    gdId={gdId!}
                    gdName={gd?.name || "GD"}
                    people={people}
                    weeks={weeks}
                    onExit={() => setTab("home")}
                  />
                )}
                {tab === "summary" && weeks.length > 0 && (
                  <WeeklySummary weeks={weeks} people={people} />
                )}
                {tab === "summary" && weeks.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
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
        </div>
      </PhoneFrame>
    </div>
  );
}
