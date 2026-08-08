import { useNavigate } from "react-router-dom";
import { Home, BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { GdPicker } from "@/features/attendance/components/GdPicker";
import { AdminDrawer } from "@/features/auth";
import { useLeaderGd } from "@/hooks/useLeaderGd";
import { useProfile } from "@/hooks/useProfile";
import { ROLE_LABELS } from "@/lib/constants";

export default function HomePage() {
  const navigate = useNavigate();
  const { data: leaderGds = [], isLoading } = useLeaderGd();
  const { data: profile } = useProfile();

  const isAdmin = profile?.role === "supervisor" || profile?.role === "pastor";
  const roleLabel = profile?.role ? ROLE_LABELS[profile.role] : "";

  return (
    <div className="flex min-h-dvh flex-col bg-paper sm:items-center sm:justify-center sm:p-6">
      <PhoneFrame
        title={isAdmin ? "Inicio" : "Grupos"}
        badge={isAdmin ? { label: roleLabel, color: "#A9822C", bg: "#F1E2B8" } : undefined}
        rightSlot={<AdminDrawer />}
      >
        <div className="flex flex-1 flex-col overflow-y-auto">
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
                Voce ainda nao esta vinculado a um GD.
                {isAdmin
                  ? " Acesse o menu Admin para criar um GD e vincular pessoas."
                  : " Solicite ao supervisor que vincule seu perfil."}
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

      {isAdmin && (
        <BottomNav
          tabs={[
            { key: "/", label: "Inicio", icon: <Home size={20} /> },
            { key: "/reports", label: "Relatorios", icon: <BarChart3 size={20} /> },
          ]}
          active="/"
          onChange={(key) => navigate(key)}
        />
      )}
    </div>
  );
}
