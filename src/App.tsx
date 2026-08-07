import { colors, categoryColors } from "@/lib/constants";

const swatches = [
  { name: "paper", hex: colors.paper },
  { name: "paper-alt", hex: colors.paperAlt },
  { name: "card", hex: colors.card },
  { name: "ink", hex: colors.ink },
  { name: "ink-soft", hex: colors.inkSoft },
  { name: "ink-faint", hex: colors.inkFaint },
  { name: "line", hex: colors.line },
  { name: "line-soft", hex: colors.lineSoft },
  { name: "primary", hex: colors.primary },
  { name: "primary-dark", hex: colors.primaryDark },
  { name: "primary-soft", hex: colors.primarySoft },
  { name: "gold", hex: colors.gold },
  { name: "gold-soft", hex: colors.goldSoft },
  { name: "rose", hex: colors.rose },
  { name: "rose-soft", hex: colors.roseSoft },
];

function App() {
  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="mx-auto max-w-lg space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Presença GD
          </h1>
          <p className="font-body text-sm text-ink-soft mt-1">
            Paleta de cores · Tipografia · Design Tokens
          </p>
        </div>

        {/* Color Swatches */}
        <section>
          <h2 className="font-body text-xs font-bold text-ink-faint uppercase tracking-wider mb-3">
            Cores
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {swatches.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-3 rounded-xl border border-line bg-card p-3"
              >
                <div
                  className="h-9 w-9 rounded-lg border border-line-soft"
                  style={{ background: s.hex }}
                />
                <div>
                  <div className="font-body text-xs font-semibold text-ink">
                    {s.name}
                  </div>
                  <div className="font-mono text-[10px] font-semibold text-ink-faint">
                    {s.hex}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="font-body text-xs font-bold text-ink-faint uppercase tracking-wider mb-3">
            Categorias
          </h2>
          <div className="flex flex-wrap gap-2">
            {(
              Object.keys(categoryColors) as Array<keyof typeof categoryColors>
            ).map((cat) => (
              <span
                key={cat}
                className="rounded-full px-3 py-1.5 font-body text-xs font-semibold"
                style={{
                  color: categoryColors[cat].color,
                  background: categoryColors[cat].bg,
                }}
              >
                {categoryColors[cat].label}
              </span>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="font-body text-xs font-bold text-ink-faint uppercase tracking-wider mb-3">
            Tipografia
          </h2>

          <div className="space-y-4 rounded-xl border border-line bg-card p-4">
            <div>
              <div className="font-body text-[10px] font-bold text-ink-faint uppercase">
                Fraunces · Display
              </div>
              <div className="font-display text-xl font-bold text-ink">
                A igreja reunida como família
              </div>
              <div className="font-display text-sm font-semibold text-ink-soft mt-1">
                Pesos: 600 (semibold) · 700 (bold)
              </div>
            </div>

            <div className="border-t border-line-soft pt-4">
              <div className="font-body text-[10px] font-bold text-ink-faint uppercase">
                Public Sans · Body
              </div>
              <p className="font-body text-sm text-ink leading-relaxed mt-1">
                Toque para marcar presença. Sugerimos quem visitou o GD
                recentemente.
              </p>
              <div className="flex gap-4 mt-2">
                <span className="font-body text-xs font-normal text-ink-soft">
                  Regular
                </span>
                <span className="font-body text-xs font-medium text-ink-soft">
                  Medium
                </span>
                <span className="font-body text-xs font-semibold text-ink">
                  Semi
                </span>
                <span className="font-body text-xs font-bold text-ink">
                  Bold
                </span>
              </div>
            </div>

            <div className="border-t border-line-soft pt-4">
              <div className="font-body text-[10px] font-bold text-ink-faint uppercase">
                JetBrains Mono · Mono
              </div>
              <div className="font-mono text-lg font-bold text-primary mt-1">
                247 pessoas
              </div>
              <div className="font-mono text-xs font-semibold text-ink-soft">
                +12 vs. semana anterior
              </div>
            </div>
          </div>
        </section>

        {/* Stamp animation test */}
        <section>
          <h2 className="font-body text-xs font-bold text-ink-faint uppercase tracking-wider mb-3">
            Animação · Carimbo
          </h2>
          <div className="flex items-center gap-4 rounded-xl border border-line bg-card p-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-card"
                style={{
                  animation: "stampPop 0.32s cubic-bezier(.2,1.4,.4,1) both",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <div>
              <div className="font-body text-sm font-semibold text-ink">
                Presença registrada
              </div>
              <div className="font-body text-xs text-ink-soft">
                Animação stampPop funcionando
              </div>
            </div>
          </div>
        </section>

        <p className="font-body text-[11px] text-ink-faint text-center pb-4">
          Remover esta página em Task 0.6 (roteamento)
        </p>
      </div>
    </div>
  );
}

export default App;
