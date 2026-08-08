import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { UserList } from "@/features/pastor";
import { useProfilesByStatus, useApproveUser, useRejectUser } from "@/hooks/useProfiles";
import { useMemo } from "react";

export default function UserManagementPage() {
  const pending = useProfilesByStatus("pending");
  const approved = useProfilesByStatus("approved");
  const rejected = useProfilesByStatus("rejected");
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const allProfiles = useMemo(
    () => [...(pending.data || []), ...(approved.data || []), ...(rejected.data || [])],
    [pending.data, approved.data, rejected.data],
  );

  const isLoading = pending.isLoading || approved.isLoading || rejected.isLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title="Usuarios" badge={{ label: "pastor", color: "#A9822C", bg: "#F1E2B8" }}>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
          <div className="mb-4 font-display text-lg font-bold text-ink">Gestao de Usuarios</div>
          <UserList
            profiles={allProfiles}
            isLoading={isLoading}
            approveUser={approveUser}
            rejectUser={rejectUser}
          />
        </div>
      </PhoneFrame>
    </div>
  );
}
