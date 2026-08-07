import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { supabase } from "@/lib/supabaseClient";

export default function PendingPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title="Presenca GD">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gold-soft">
            <span className="font-display text-[28px] font-bold text-gold">!</span>
          </div>
          <h2 className="font-display text-xl font-bold text-ink">Conta criada!</h2>
          <p className="mt-2 font-body text-sm text-ink-soft">
            Seu cadastro esta aguardando aprovacao de um pastor. Voce recebera acesso assim que for
            aprovado.
          </p>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-8 cursor-pointer rounded-xl border border-line bg-card px-6 py-2.5 font-body text-sm font-semibold text-ink-soft transition-opacity disabled:opacity-60"
          >
            {loading ? "Saindo..." : "Sair"}
          </button>
        </div>
      </PhoneFrame>
    </div>
  );
}
