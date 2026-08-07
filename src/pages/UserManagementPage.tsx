import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { Users } from "lucide-react";

export default function UserManagementPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame
        title="Usuarios"
        badge={{ label: "pastor", color: "#A9822C", bg: "#F1E2B8" }}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Users size={36} className="text-ink-faint" />
          <p className="mt-3 font-body text-sm text-ink-faint">
            Gestao de usuarios — Fase 2
          </p>
        </div>
      </PhoneFrame>
    </div>
  );
}
