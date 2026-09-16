import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { AdminNav } from "@/components/AdminNav";
import { GdPicker } from "@/features/attendance/components/GdPicker";
import { GdStatusSummary } from "@/features/status";
import { PastorHome } from "@/features/dashboard";
import { AdminDrawer } from "@/features/auth";
import { useLeaderGd } from "@/hooks/useLeaderGd";
import { useProfile } from "@/hooks/useProfile";
import { useGdHealthOverview } from "@/hooks/useGdStatus";
import { useReportStatus } from "@/hooks/useReportStatus";

type AdminTab = "home" | "gds";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: leaderGds = [], isLoading } = useLeaderGd();
  const { data: profile } = useProfile();

  const isAdmin = profile?.role === "supervisor" || profile?.role === "pastor";
  const tabParam = searchParams.get("tab");
  const adminTab: AdminTab = tabParam === "gds" ? "gds" : "home";

  // Status chips for the list. Gated on `isAdmin` so a leader never fires
  // these requests — and RLS would return nothing to them anyway, since
  // `gd_status_updates` is supervisor/pastor-only.
  //
  // Scope is `null` (= every GD the caller may see) rather than the explicit
  // list: RLS already narrows both of these to the user's own GDs, and `null`
  // is the same query key the dashboard uses, so moving between Painel and
  // Grupos reuses the cache instead of refetching the same rows.
  const { data: health = {} } = useGdHealthOverview(null, isAdmin);
  const { data: reportStatus } = useReportStatus(null, 30, isAdmin);

  const badges = useMemo(() => {
    const map: Record<string, import("react").ReactNode> = {};
    for (const gd of leaderGds) {
      const latest = health[gd.gdId]?.[0] ?? null;
      const missing = reportStatus?.find((r) => r.gdId === gd.gdId)?.missing ?? 0;
      map[gd.gdId] = <GdStatusSummary status={latest?.status ?? null} missingReports={missing} />;
    }
    return map;
  }, [leaderGds, health, reportStatus]);

  // Leader view: simple GD picker, no BottomNav
  if (!isAdmin) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-backdrop">
        <PhoneFrame title="Os meus" accent="grupos" rightSlot={<AdminDrawer />}>
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
              </div>
            ) : leaderGds.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
                  <span className="font-display text-2xl font-bold text-gold">!</span>
                </div>
                <p className="font-body text-sm text-ink-soft">
                  Voce ainda nao esta vinculado a um GD. Solicite ao supervisor que vincule seu
                  perfil.
                </p>
              </div>
            ) : (
              <GdPicker
                gds={leaderGds}
                selectedGdId={null}
                onSelect={(gd) => navigate(`/gd/${gd.gdId}`)}
              />
            )}
          </div>
        </PhoneFrame>
      </div>
    );
  }

  // Pastor / Supervisor: tabbed view
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-backdrop">
      <PhoneFrame
        title={adminTab === "home" ? "Painel" : "Todos os"}
        accent={adminTab === "home" ? undefined : "grupos"}
        rightSlot={<AdminDrawer />}
        bottomSlot={<AdminNav />}
      >
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : adminTab === "home" ? (
            <PastorHome />
          ) : leaderGds.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
                <span className="font-display text-2xl font-bold text-gold">!</span>
              </div>
              <p className="font-body text-sm text-ink-soft">
                Voce ainda nao esta vinculado a um GD. Acesse o menu Admin para criar um GD e
                vincular pessoas.
              </p>
            </div>
          ) : (
            <GdPicker
              gds={leaderGds}
              selectedGdId={null}
              // The status line replaces the generic "Registro de presença e
              // resumo": for someone scanning ten GDs it carries the same
              // information about what the row does, and more about the GD.
              subtitle={null}
              badges={badges}
              onSelect={(gd) => navigate(`/gd/${gd.gdId}`)}
            />
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
