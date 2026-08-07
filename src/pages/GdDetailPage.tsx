import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { BottomNav } from "@/components/ui/BottomNav";
import { Home, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function GdDetailPage() {
  const { gdId } = useParams<{ gdId: string }>();
  const [tab, setTab] = useState("home");

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame
        title={`GD ${gdId}`}
        badge={{ label: "pastor", color: "#A9822C", bg: "#F1E2B8" }}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Home size={36} className="text-ink-faint" />
          <p className="mt-3 font-body text-sm text-ink-faint">
            Detalhe do GD — Fase 7
          </p>
        </div>
        <BottomNav
          tabs={[
            { key: "home", label: "Inicio", icon: <Home size={20} /> },
            { key: "summary", label: "Resumo", icon: <BarChart3 size={20} /> },
          ]}
          active={tab}
          onChange={setTab}
        />
      </PhoneFrame>
    </div>
  );
}
