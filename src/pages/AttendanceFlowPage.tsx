import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { AttendanceFlow } from "@/features/attendance";
import { useFirstLeaderGd } from "@/hooks/useLeaderGd";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import { AdminMenu } from "@/features/auth";
import { useNavigate } from "react-router-dom";

export default function AttendanceFlowPage() {
  const navigate = useNavigate();
  const { data: leaderGd, isLoading: gdLoading } = useFirstLeaderGd();
  const { data: people = [], isLoading: peopleLoading } = usePeople(leaderGd?.gdId);
  const { data: weeks = [], isLoading: weeksLoading } = useWeeks(leaderGd?.gdId);

  const isLoading = gdLoading || peopleLoading || weeksLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title={leaderGd?.gdName || "GD"} rightSlot={<AdminMenu />}>
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
          </div>
        ) : leaderGd ? (
          <AttendanceFlow
            gdId={leaderGd.gdId}
            gdName={leaderGd.gdName}
            people={people}
            weeks={weeks}
            onExit={() => navigate("/")}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
              <span className="font-display text-2xl font-bold text-gold">!</span>
            </div>
            <p className="font-body text-sm text-ink-soft">
              Voce ainda nao esta vinculado a um GD. Solicite ao pastor que vincule seu perfil a um
              grupo.
            </p>
          </div>
        )}
      </PhoneFrame>
    </div>
  );
}
