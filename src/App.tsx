import { useState } from "react";
import { Home, ClipboardList, BarChart3 } from "lucide-react";
import { colors, categoryColors } from "@/lib/constants";
import {
  IconButton,
  Pill,
  Avatar,
  StampBadge,
  PersonChip,
  NameInput,
  AddedNameChip,
  SectionLabel,
  MiniStat,
  Delta,
  BottomNav,
} from "@/components/ui";

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
  const [activeTab, setActiveTab] = useState("home");
  const [chipSelected, setChipSelected] = useState(false);
  const [chips, setChips] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="mx-auto max-w-lg space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Componentes UI
          </h1>
          <p className="mt-1 font-body text-sm text-ink-soft">
            Portados do prototipo &middot; Tailwind
          </p>
        </div>

        {/* Color Swatches */}
        <section>
          <SectionLabel>Paleta de cores</SectionLabel>
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

        {/* Categories (Pill) */}
        <section>
          <SectionLabel>Categorias (Pill)</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {(
              Object.keys(categoryColors) as Array<keyof typeof categoryColors>
            ).map((cat) => (
              <Pill
                key={cat}
                color={categoryColors[cat].color}
                bg={categoryColors[cat].bg}
              >
                {categoryColors[cat].label}
              </Pill>
            ))}
          </div>
        </section>

        {/* Avatar */}
        <section>
          <SectionLabel>Avatar</SectionLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar
              name="Ana Souza"
              color={categoryColors.member.color}
              bg={categoryColors.member.bg}
              size={40}
            />
            <Avatar
              name="Bruno Lima"
              color={categoryColors.member.color}
              bg={categoryColors.member.bg}
            />
            <Avatar
              name="Carla N"
              color={categoryColors.member.color}
              bg={categoryColors.member.bg}
              size={28}
            />
            <Avatar
              name="Fabio T"
              color={categoryColors.attender.color}
              bg={categoryColors.attender.bg}
              size={22}
            />
            <Avatar
              name="Helena"
              color={categoryColors.visitor.color}
              bg={categoryColors.visitor.bg}
              size={18}
            />
          </div>
        </section>

        {/* PersonChip */}
        <section>
          <SectionLabel>PersonChip (toggle)</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <PersonChip
              name="Ana Souza"
              color={categoryColors.member.color}
              bg={categoryColors.member.bg}
              selected={chipSelected}
              onClick={() => setChipSelected((v) => !v)}
            />
            <PersonChip
              name="Fabio Teixeira"
              color={categoryColors.attender.color}
              bg={categoryColors.attender.bg}
              tag="novo"
              dashed
              selected={false}
              onClick={() => {}}
            />
            <PersonChip
              name="Helena Duarte"
              color={categoryColors.visitor.color}
              bg={categoryColors.visitor.bg}
              selected={false}
              onClick={() => {}}
            />
          </div>
        </section>

        {/* StampBadge */}
        <section>
          <SectionLabel>StampBadge (animacao)</SectionLabel>
          <div className="flex items-center gap-4 rounded-xl border border-line bg-card p-4">
            <div className="relative inline-block">
              <Avatar name="OK" color="#fff" bg={colors.primary} size={48} />
              <StampBadge />
            </div>
            <div>
              <div className="font-body text-sm font-semibold text-ink">
                Presenca registrada
              </div>
              <div className="font-body text-xs text-ink-soft">
                Animacao stampPop
              </div>
            </div>
          </div>
        </section>

        {/* NameInput + AddedNameChip */}
        <section>
          <SectionLabel>NameInput + AddedNameChip</SectionLabel>
          <NameInput
            placeholder="Nome do visitante"
            onAdd={(name) => setChips((v) => [...v, name])}
          />
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((name, i) => (
                <AddedNameChip
                  key={i}
                  name={name}
                  color={categoryColors.visitor.color}
                  bg={categoryColors.visitor.bg}
                  onRemove={() =>
                    setChips((v) => v.filter((_, idx) => idx !== i))
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* MiniStat */}
        <section>
          <SectionLabel>MiniStat</SectionLabel>
          <div className="flex gap-[10px]">
            <MiniStat label="Pessoas no GD" value={42} />
            <MiniStat label="Media em ago" value={12} color={colors.primary} />
            <MiniStat label="Novos membros" value={3} color={colors.gold} />
          </div>
        </section>

        {/* Delta */}
        <section>
          <SectionLabel>Delta (variacao)</SectionLabel>
          <div className="flex flex-col gap-1 rounded-xl border border-line bg-card p-4">
            <Delta value={5} />
            <Delta value={-3} />
            <Delta value={0} />
            <Delta value={null} />
          </div>
        </section>

        {/* IconButton */}
        <section>
          <SectionLabel>IconButton</SectionLabel>
          <div className="flex items-center gap-2">
            <IconButton onClick={() => {}} label="Chart">
              <BarChart3 size={20} />
            </IconButton>
            <IconButton onClick={() => {}} label="Register">
              <ClipboardList size={20} />
            </IconButton>
          </div>
        </section>

        {/* BottomNav */}
        <section>
          <SectionLabel>BottomNav</SectionLabel>
          <BottomNav
            tabs={[
              { key: "home", label: "Inicio", icon: <Home size={20} /> },
              {
                key: "register",
                label: "Registrar",
                icon: <ClipboardList size={20} />,
              },
              {
                key: "summary",
                label: "Resumo",
                icon: <BarChart3 size={20} />,
              },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </section>

        <p className="pb-4 text-center font-body text-[11px] text-ink-faint">
          Remover em Task 0.6 (roteamento)
        </p>
      </div>
    </div>
  );
}

export default App;
