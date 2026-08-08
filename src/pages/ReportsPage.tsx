import { useNavigate } from "react-router-dom";
import { Home, BarChart3 } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { PastorHome } from "@/features/dashboard";
import { AdminDrawer } from "@/features/auth";
import { useAllGds } from "@/hooks/useAllGds";

export default function ReportsPage() {
  const { data, isLoading } = useAllGds();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col bg-paper sm:items-center sm:justify-center sm:p-6">
      <PhoneFrame title="Relatorios" rightSlot={<AdminDrawer />}>
        <div className="flex flex-1 flex-col overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : (
            <PastorHome gds={data?.gds || []} />
          )}
        </div>
      </PhoneFrame>

      <BottomNav
        tabs={[
          { key: "/", label: "Inicio", icon: <Home size={20} /> },
          { key: "/reports", label: "Relatorios", icon: <BarChart3 size={20} /> },
        ]}
        active="/reports"
        onChange={(key) => navigate(key)}
      />
    </div>
  );
}
