import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame
        title="Relatorios"
        badge={{ label: "pastor", color: "#A9822C", bg: "#F1E2B8" }}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <BarChart3 size={36} className="text-ink-faint" />
          <p className="mt-3 font-body text-sm text-ink-faint">
            Dashboard agregado — Fase 7
          </p>
        </div>
      </PhoneFrame>
    </div>
  );
}
