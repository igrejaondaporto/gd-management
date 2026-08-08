import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ClipboardList, BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { WeeklySummary } from "@/features/attendance";
import { GdPicker } from "@/features/attendance/components/GdPicker";
import { AdminMenu } from "@/features/auth";
import { useLeaderGd } from "@/hooks/useLeaderGd";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import type { LeaderGd as LeaderGdType } from "@/hooks/useLeaderGd";

const LEADER_TABS = [
  { key: "/", label: "Inicio", icon: <Home size={20} /> },
  { key: "/register", label: "Registrar", icon: <ClipboardList size={20} /> },
  { key: "/summary", label: "Resumo", icon: <BarChart3 size={20} /> },
];

export default function WeeklySummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: leaderGds = [], isLoading: gdLoading } = useLeaderGd();
  const [selectedGd, setSelectedGd] = useState<LeaderGdType | null>(null);

  const effectiveGd =
    selectedGd && leaderGds.some((g) => g.gdId === selectedGd.gdId)
      ? selectedGd
      : leaderGds.length === 1
        ? leaderGds[0]
        : null;

  const isMulti = leaderGds.length > 1;

  const { data: people = [], isLoading: peopleLoading } = usePeople(effectiveGd?.gdId);
  const { data: weeks = [], isLoading: weeksLoading } = useWeeks(effectiveGd?.gdId);

  const isLoading = gdLoading || (!!effectiveGd && (peopleLoading || weeksLoading));

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame
        title={effectiveGd?.gdName || (isMulti && !effectiveGd ? "Grupos" : "GD")}
        rightSlot={<AdminMenu />}
      >
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
          {gdLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : isMulti && !effectiveGd ? (
            <GdPicker gds={leaderGds} selectedGdId={null} onSelect={setSelectedGd} />
          ) : effectiveGd ? (
            <>
              {isMulti && (
                <button
                  onClick={() => setSelectedGd(null)}
                  className="mx-5 mt-3 cursor-pointer border-none bg-transparent text-left font-body text-[11px] font-semibold text-primary"
                >
                  ← Trocar de GD
                </button>
              )}
              {isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
                </div>
              ) : weeks.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <BarChart3 size={30} className="mb-[10px] text-ink-faint" />
                  <div className="font-display text-[17px] font-bold text-ink">
                    Nenhum dado ainda
                  </div>
                  <div className="mt-1 font-body text-[13px] text-ink-faint">
                    Assim que a primeira semana for registrada, o resumo aparece aqui.
                  </div>
                </div>
              ) : (
                <WeeklySummary weeks={weeks} people={people} />
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
                <span className="font-display text-2xl font-bold text-gold">!</span>
              </div>
              <p className="font-body text-sm text-ink-soft">
                Voce ainda nao esta vinculado a um GD. Solicite ao pastor que vincule seu perfil.
              </p>
            </div>
          )}
        </div>
        <BottomNav
          tabs={LEADER_TABS}
          active={location.pathname}
          onChange={(key) => navigate(key)}
        />
      </PhoneFrame>
    </div>
  );
}
