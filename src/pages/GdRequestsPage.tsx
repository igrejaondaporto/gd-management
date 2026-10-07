import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { PageLoader, ErrorMessage } from "@/components/ui";
import { AdminNav } from "@/components/AdminNav";
import { AdminDrawer } from "@/features/auth";
import { GdRequestsPanel } from "@/features/requests";
import { useGds } from "@/hooks/useGds";
import { useAssignGdRequest, useGdRequests, useSetGdRequestStatus } from "@/hooks/useGdRequests";

/** Supervisor/pastor inbox of requests to join a GD (migration 015). */
export default function GdRequestsPage() {
  const { data: requests = [], isLoading, error, refetch } = useGdRequests();
  const { data: gds = [] } = useGds();
  const assign = useAssignGdRequest();
  const setStatus = useSetGdRequestStatus();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-backdrop">
      <PhoneFrame
        title="Pedidos de"
        accent="GD"
        rightSlot={<AdminDrawer />}
        bottomSlot={<AdminNav />}
      >
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {isLoading ? (
            <PageLoader />
          ) : error ? (
            <ErrorMessage
              message="Não foi possível carregar os pedidos."
              onRetry={() => refetch()}
            />
          ) : (
            <GdRequestsPanel
              requests={requests}
              gds={gds}
              assigning={assign.isPending}
              savingStatus={setStatus.isPending}
              onAssign={(id, gdId) => assign.mutateAsync({ id, gdId })}
              onSetStatus={(id, status, addPerson) =>
                setStatus.mutateAsync({ id, status, addPerson })
              }
            />
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
