import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { PastorHome } from "@/features/dashboard";
import { useAllGds } from "@/hooks/useAllGds";
import { ROLE_LABELS } from "@/lib/constants";

export default function ReportsPage() {
  const { data, isLoading } = useAllGds();
  const roleLabel = data?.role ? ROLE_LABELS[data.role] : "pastor";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-0 sm:p-6">
      <PhoneFrame title="Relatorios" badge={{ label: roleLabel, color: "#A9822C", bg: "#F1E2B8" }}>
        <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : (
            <PastorHome gds={data?.gds || []} />
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
