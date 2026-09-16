import { X } from "lucide-react";

interface TimePickerProps {
  /** "HH:MM", or null when not set. */
  value: string | null;
  onChange: (time: string | null) => void;
  disabled?: boolean;
}

/** Native `<input type="time">` — the OS wheel is faster and less error-prone
 *  on a phone than anything hand-rolled, and it validates for free. Matches the
 *  styling of the date input in `AttendanceFlow`.
 *
 *  Renders in 12h or 24h according to the *browser's* locale, which `lang` on
 *  the element does not override (Chromium still shows "07:30 PM" with
 *  `lang="pt-PT"`). Accepted on purpose: following the user's own locale is the
 *  right default, and swapping in two `<select>`s to force 24h was not worth
 *  losing the native wheel. The stored value is always "HH:MM", so the format
 *  on screen never reaches the database. */
export function TimePicker({ value, onChange, disabled = false }: TimePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        aria-label="Hora do GD"
        className="cursor-pointer rounded-lg border border-line bg-card px-2.5 py-[7px] font-body text-[12px] font-bold text-ink outline-none focus:border-primary disabled:opacity-50"
        style={{ colorScheme: "light", WebkitAppearance: "none" }}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remover hora"
          className="cursor-pointer rounded-lg border-none bg-transparent p-1 text-ink-faint"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
