import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { useLeaderGd } from "@/hooks/useLeaderGd";
import type { Role } from "@/types";
import type { ReactNode } from "react";

function CenteredSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-soft">
        <span className="font-display text-2xl font-bold text-rose">!</span>
      </div>
      <h2 className="font-display text-xl font-bold text-ink">Acesso negado</h2>
      <p className="mt-2 font-body text-sm text-ink-soft">
        Voce nao tem permissao para acessar esta pagina.
      </p>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: sessionLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (sessionLoading || profileLoading) return <CenteredSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.status === "pending") return <Navigate to="/pending" replace />;
  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

/* ===== GD Binding Guard ===== */
interface GdBoundaryProps {
  children: ReactNode;
}

export function GdBoundary({ children }: GdBoundaryProps) {
  const { data: leaderGd, isLoading } = useLeaderGd();

  if (isLoading) return <CenteredSpinner />;

  if (!leaderGd) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
          <span className="font-display text-2xl font-bold text-gold">!</span>
        </div>
        <h2 className="font-display text-xl font-bold text-ink">Sem GD vinculado</h2>
        <p className="mt-2 font-body text-sm text-ink-soft">
          Voce ainda nao esta vinculado a um GD. Solicite ao pastor que vincule seu perfil.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
