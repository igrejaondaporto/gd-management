import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { AdminDrawer } from "@/features/auth";
import { UserList } from "@/features/pastor";
import {
  useProfilesByStatus,
  useApproveUser,
  useRejectUser,
  useUpdateUserRole,
} from "@/hooks/useProfiles";
import { useMemo } from "react";

export default function UserManagementPage() {
  const pending = useProfilesByStatus("pending");
  const approved = useProfilesByStatus("approved");
  const rejected = useProfilesByStatus("rejected");
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const updateRole = useUpdateUserRole();

  const allProfiles = useMemo(
    () => [...(pending.data || []), ...(approved.data || []), ...(rejected.data || [])],
    [pending.data, approved.data, rejected.data],
  );

  const isLoading = pending.isLoading || approved.isLoading || rejected.isLoading;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper sm:items-center sm:justify-center sm:p-6">
      <PhoneFrame title="Usuarios" rightSlot={<AdminDrawer />}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-4 pb-4">
          <div className="mb-4 font-display text-lg font-bold text-ink">Gestao de Usuarios</div>
          <UserList
            profiles={allProfiles}
            isLoading={isLoading}
            approveUser={approveUser}
            rejectUser={rejectUser}
            updateRole={updateRole}
          />
        </div>
      </PhoneFrame>
    </div>
  );
}
