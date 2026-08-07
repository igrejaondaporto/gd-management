import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { ClipboardList } from "lucide-react";

export default function AttendanceFlowPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title="GD Arca D'agua">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <ClipboardList size={36} className="text-ink-faint" />
          <p className="mt-3 font-body text-sm text-ink-faint">
            Fluxo de presenca — Fase 5
          </p>
        </div>
      </PhoneFrame>
    </div>
  );
}
