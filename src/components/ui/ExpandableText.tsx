import { useState } from "react";
import { truncateAtWord } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  /** Characters to show before collapsing. */
  limit?: number;
  className?: string;
}

/**
 * A long comment, collapsed with an ellipsis until tapped.
 *
 * When collapsed, the **text itself** is the control (a real `<button>`, not a
 * `<span>` with an onClick — it is interactive, so it must be keyboard
 * reachable and announced). Tapping anywhere on the paragraph expands it, with
 * a "Ver mais" line as the visual hint; collapsing keeps an explicit button so
 * the whole comment is not accidentally re-collapsed by a stray tap.
 *
 * Short text renders as a plain paragraph with no affordance, so nothing looks
 * tappable when tapping would do nothing.
 */
export function ExpandableText({ text, limit = 500, className = "" }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= limit) {
    // `break-words` matters for pasted URLs or long unbroken strings: without
    // it the text overflows the card instead of wrapping.
    return <p className={`break-words whitespace-pre-line ${className}`}>{text}</p>;
  }

  if (expanded) {
    return (
      <div className={className}>
        <p className="break-words whitespace-pre-line">{text}</p>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-expanded
          className="mt-1 cursor-pointer border-none bg-transparent p-0 font-body text-[11.5px] font-bold text-primary"
        >
          Ver menos
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      aria-expanded={false}
      aria-label="Ver comentário completo"
      className={`block w-full cursor-pointer border-none bg-transparent p-0 text-left font-body text-inherit ${className}`}
    >
      <span className="break-words whitespace-pre-line">{truncateAtWord(text, limit)}…</span>
      <span className="mt-1 block font-body text-[11.5px] font-bold text-primary">Ver mais</span>
    </button>
  );
}
