import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { AttendanceFlow } from "@/features/attendance";
import { GdPicker } from "@/features/attendance/components/GdPicker";
import { AdminMenu } from "@/features/auth";
import { useLeaderGd } from "@/hooks/useLeaderGd";
import { usePeople } from "@/hooks/usePeople";
import { useWeeks } from "@/hooks/useWeeks";
import type { LeaderGd as LeaderGdType } from "@/hooks/useLeaderGd";

export default function AttendanceFlowPage() {
  const navigate = useNavigate();

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
    <div className="flex min-h-screen items-center justify-center bg-paper p-0 sm:p-6">
      <PhoneFrame
        title={effectiveGd?.gdName || (isMulti && !effectiveGd ? "Grupos" : "GD")}
        rightSlot={<AdminMenu />}
      >
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
            ) : (
              <AttendanceFlow
                gdId={effectiveGd.gdId}
                gdName={effectiveGd.gdName}
                people={people}
                weeks={weeks}
                onExit={() => navigate("/")}
              />
            )}
          </>
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
