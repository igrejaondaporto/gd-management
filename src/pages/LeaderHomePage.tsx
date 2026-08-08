import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ClipboardList, BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { LeaderHome } from "@/features/attendance";
import { useLeaderGd } from "@/hooks/useLeaderGd";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import { useProfile } from "@/hooks/useProfile";

export default function LeaderHomePage() {
  const [tab, setTab] = useState("home");
  const navigate = useNavigate();

  const { data: leaderGd, isLoading: gdLoading } = useLeaderGd();
  const { data: profile } = useProfile();
  const { data: people = [], isLoading: peopleLoading } = usePeople(leaderGd?.gdId);
  const { data: weeks = [], isLoading: weeksLoading } = useWeeks(leaderGd?.gdId);

  const isLoading = gdLoading || peopleLoading || weeksLoading;
  const leaderName = profile?.fullName || profile?.email || "Lider";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title={leaderGd?.gdName || "GD"}>
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : leaderGd ? (
            <>
              {tab === "home" && (
                <LeaderHome
                  gdName={leaderGd.gdName}
                  leaderName={leaderName}
                  people={people}
                  weeks={weeks}
                  onStartFlow={() => navigate("/register")}
                />
              )}
              {tab === "register" && (
                <div className="flex flex-1 items-center justify-center font-body text-sm text-ink-faint">
                  Use o botao Registrar presenca acima.
                </div>
              )}
              {tab === "summary" && (
                <div className="flex flex-1 items-center justify-center font-body text-sm text-ink-faint">
                  Acesse o menu Resumo.
                </div>
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
