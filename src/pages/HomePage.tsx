import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, Church } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { GdPicker } from "@/features/attendance/components/GdPicker";
import { PastorHome } from "@/features/dashboard";
import { AdminDrawer } from "@/features/auth";
import { useLeaderGd } from "@/hooks/useLeaderGd";
import { useProfile } from "@/hooks/useProfile";

type AdminTab = "home" | "gds";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: leaderGds = [], isLoading } = useLeaderGd();
  const { data: profile } = useProfile();

  const isAdmin = profile?.role === "supervisor" || profile?.role === "pastor";
  const tabParam = searchParams.get("tab");
  const adminTab: AdminTab = tabParam === "gds" ? "gds" : "home";

  const setAdminTab = (tab: AdminTab) => {
    setSearchParams(tab === "gds" ? { tab: "gds" } : {}, { replace: true });
  };

  // Leader view: simple GD picker, no BottomNav
  if (!isAdmin) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-paper sm:items-center sm:justify-center sm:p-6">
        <PhoneFrame title="Grupos" rightSlot={<AdminDrawer />}>
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
    <div className="flex h-dvh flex-col overflow-hidden bg-paper sm:items-center sm:justify-center sm:p-6">
      <PhoneFrame
        title={adminTab === "home" ? "Inicio" : "GDs"}
        rightSlot={<AdminDrawer />}
        bottomSlot={
          <BottomNav
            tabs={[
              { key: "home", label: "Inicio", icon: <Home size={20} /> },
              { key: "gds", label: "GDs", icon: <Church size={20} /> },
            ]}
            active={adminTab}
            onChange={(key) => setAdminTab(key as AdminTab)}
          />
        }
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
              onSelect={(gd) => navigate(`/gd/${gd.gdId}`)}
            />
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
