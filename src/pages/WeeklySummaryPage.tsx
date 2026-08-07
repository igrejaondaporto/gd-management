import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BarChart3 } from "lucide-react";

export default function WeeklySummaryPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title="GD Arca D'agua">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <BarChart3 size={36} className="text-ink-faint" />
          <p className="mt-3 font-body text-sm text-ink-faint">
            Resumo semanal — Fase 6
          </p>
        </div>
      </PhoneFrame>
    </div>
  );
}
