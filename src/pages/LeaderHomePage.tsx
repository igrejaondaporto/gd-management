import { useNavigate, useLocation } from "react-router-dom";
import { Home, ClipboardList, BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { LeaderHome } from "@/features/attendance";
import { AdminMenu } from "@/features/auth";
import { useFirstLeaderGd } from "@/hooks/useLeaderGd";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import { useProfile } from "@/hooks/useProfile";

const LEADER_TABS = [
  { key: "/", label: "Inicio", icon: <Home size={20} /> },
  { key: "/register", label: "Registrar", icon: <ClipboardList size={20} /> },
  { key: "/summary", label: "Resumo", icon: <BarChart3 size={20} /> },
];

export default function LeaderHomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: leaderGd, isLoading: gdLoading } = useFirstLeaderGd();
  const { data: profile } = useProfile();
  const { data: people = [], isLoading: peopleLoading } = usePeople(leaderGd?.gdId);
  const { data: weeks = [], isLoading: weeksLoading } = useWeeks(leaderGd?.gdId);

  const isLoading = gdLoading || peopleLoading || weeksLoading;
  const leaderName = profile?.fullName || profile?.email || "Lider";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title={leaderGd?.gdName || "GD"} rightSlot={<AdminMenu />}>
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : leaderGd ? (
            <LeaderHome
              gdName={leaderGd.gdName}
              leaderName={leaderName}
              people={people}
              weeks={weeks}
              onStartFlow={() => navigate("/register")}
            />
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
