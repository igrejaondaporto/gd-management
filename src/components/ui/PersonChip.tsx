import { Avatar } from "./Avatar";
import { StampBadge } from "./StampBadge";

interface PersonChipProps {
  name: string;
  selected: boolean;
  onClick: () => void;
  color: string;
  bg: string;
  tag?: string;
  dashed?: boolean;
  selectedColor?: string;
  selectedBg?: string;
}

export function PersonChip({
  name,
  selected,
  onClick,
  color,
  bg,
  tag,
  dashed = false,
  selectedColor,
  selectedBg,
}: PersonChipProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex cursor-pointer items-center gap-2 rounded-full py-[7px] pr-3 pl-[7px] transition-all duration-150"
      style={{
        border: selected
          ? `1.5px solid ${selectedColor || color}`
          : dashed
            ? `1.5px dashed ${color}`
            : `1.5px solid ${color}`,
        background: selected ? selectedBg || bg : "#FFFFFF",
      }}
    >
      <Avatar
        name={name}
        color={selected ? selectedColor || color : color}
        bg={selected ? selectedBg || bg : bg}
        size={28}
      />
      <span className="font-body text-[13.5px] font-semibold text-ink">{name}</span>
      {tag && (
        <span
          className="ml-0.5 font-body text-[10.5px] font-bold"
          style={{ color: selectedColor || color }}
        >
          {tag}
        </span>
      )}
      {selected && <StampBadge small />}
    </button>
  );
}
