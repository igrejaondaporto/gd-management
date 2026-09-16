import { useState } from "react";
import { Curva, Logo } from "@/components/ui/PhoneFrame";
import { supabase } from "@/lib/supabaseClient";

/** Login screen — two columns on large screens (blue + white), like
 *  portal-onda's `.login`; on a phone it is the blue header with the curve
 *  and the white body below. */
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper desktop:grid desktop:min-h-dvh desktop:grid-cols-2">
      {/* ── blue side ──
          On a phone it takes all remaining space (white sits at the bottom),
          like the portal-onda header; on desktop it is the left column with
          the content centred. */}
      <div className="crista flex flex-1 flex-col px-[22px] pt-8 desktop:justify-center desktop:px-[46px] desktop:pt-10">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <span className="cap text-white/80">Grupos de Discípulos</span>
        </div>

        <h1 className="mt-6 font-display text-[clamp(44px,13vw,58px)] leading-[0.98] font-extrabold tracking-[-0.045em] desktop:mt-[26px] desktop:text-[clamp(64px,5.4vw,92px)]">
          Presença <em className="destaque">GD</em>
        </h1>

        <p className="sob mt-3">Registro de presença dos Grupos de Discípulos, semana a semana.</p>

        {/* No time or venue: each GD meets on its own day and at its own
            place, there is no fixed value that is true for all of them. */}
        <div className="mt-[18px] flex flex-wrap gap-2">
          <span className="chip">Visitantes</span>
          <span className="chip">Frequentadores</span>
          <span className="chip">Membros</span>
        </div>

        {/* Pushes the curve to the bottom of the blue side — on a phone the
            header fills the screen and the curve closes it below; on desktop
            the column is already centred and the curve is left out. */}
        <div className="mt-auto desktop:hidden">
          <Curva />
        </div>
      </div>

      {/* ── white side ── */}
      <div className="flex flex-col justify-start px-[22px] pt-8 pb-10 desktop:justify-center desktop:px-[46px] desktop:py-10">
        <span className="cap">Acesso reservado</span>
        <h2 className="mt-2 font-display text-[26px] font-extrabold tracking-[-0.03em] text-ink">
          Entra com a tua conta
        </h2>
        <p className="mt-2 text-[14.5px] text-ink-soft">
          Líderes e supervisores entram com a conta Google da igreja.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn full mt-7 flex items-center justify-center gap-3"
        >
          {loading ? (
            <span>Redirecionando para o Google...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#fff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#fff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  opacity=".6"
                />
                <path
                  fill="#fff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  opacity=".4"
                />
                <path
                  fill="#fff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  opacity=".2"
                />
              </svg>
              Entrar com Google
            </>
          )}
        </button>

        {error && <p className="mt-3 text-center font-body text-xs text-rose">{error}</p>}

        <p className="mt-6 text-[12.5px] leading-relaxed text-ink-faint">
          O teu nome e a tua foto só ficam visíveis para quem serve nos mesmos grupos.
        </p>
      </div>
    </div>
  );
}
