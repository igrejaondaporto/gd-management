import { ChevronRight, UserPlus } from "lucide-react";

/** "N pedidos de GD por encaminhar" — top of the supervisor/pastor
 *  dashboard. Hidden when nothing waits: an empty inbox needs no banner. */
export function GdRequestsBanner({ count, onOpen }: { count: number; onOpen: () => void }) {
  if (count === 0) return null;
  return (
    <button
      onClick={onOpen}
      className="mb-4 flex w-full cursor-pointer items-center gap-3 rounded-[20px] border-none bg-gold-soft px-4 py-3.5 text-left"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-gold">
        <UserPlus size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-bold tracking-[-0.02em] text-ink">
          {count === 1 ? "1 pedido de GD novo" : `${count} pedidos de GD novos`}
        </span>
        <span className="block font-body text-[12px] text-ink-soft">
          Querem entrar num GD — ninguém pegou ainda
        </span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-ink-faint" />
    </button>
  );
}
