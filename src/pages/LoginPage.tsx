import { Church } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Church size={32} color="#fff" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Presenca GD
          </h1>
          <p className="mt-2 font-body text-sm text-ink-soft">
            Registro de presenca dos Grupos de Discipulos
          </p>
        </div>
        <button className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-none bg-primary px-6 py-3.5 font-body text-sm font-bold text-white">
          Entrar com Google
        </button>
        <p className="mt-4 text-center font-body text-xs text-ink-faint">
          Placeholder — Google OAuth sera integrado na Fase 1
        </p>
      </div>
    </div>
  );
}
