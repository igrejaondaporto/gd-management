import { Navigate } from "react-router-dom";
import { useSession } from "@/features/auth/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: sessionLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Still determining auth state
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but profile still loading
  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  // Profile pending approval
  if (profile?.status === "pending") {
    return <Navigate to="/pending" replace />;
  }

  // Role check (if specified)
  if (allowedRoles && profile && !allowedRoles.includes(profile.role as Role)) {
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

  return <>{children}</>;
}
