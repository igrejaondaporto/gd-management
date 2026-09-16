import { WEEKDAY_SHORT } from "@/lib/constants";

interface WeekdayPickerProps {
  /** 0 = Sunday … 6 = Saturday, or null when not set. */
  value: number | null;
  /** Tapping the selected day again clears it (passes null). */
  onChange: (weekday: number | null) => void;
  disabled?: boolean;
}

/** Seven day pills. Deliberately one tap per day — no dropdown, no confirm.
 *
 *  The selected state is the soft blue, not the solid `primary`: it sits
 *  directly above "Salvar", and a solid blue chip competed with the real
 *  action button for attention. */
export function WeekdayPicker({ value, onChange, disabled = false }: WeekdayPickerProps) {
  return (
    <div className="flex gap-1">
      {WEEKDAY_SHORT.map((label, day) => {
        const active = value === day;
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(active ? null : day)}
            className={`flex-1 cursor-pointer rounded-lg border px-0 py-[7px] font-body text-[11.5px] font-bold transition-colors disabled:opacity-50 ${
              active
                ? "border-primary bg-primary-soft text-primary"
                : "border-line bg-card text-ink-soft active:bg-paper-alt"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
