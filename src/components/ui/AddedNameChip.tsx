import { X } from "lucide-react";
import { Avatar } from "./Avatar";

interface AddedNameChipProps {
  name: string;
  onRemove: () => void;
  color: string;
  bg: string;
}

export function AddedNameChip({
  name,
  onRemove,
  color,
  bg,
}: AddedNameChipProps) {
  return (
    <div
      className="flex items-center gap-[6px] rounded-full py-[6px] pl-3 pr-[6px]"
      style={{ background: bg }}
    >
      <Avatar name={name} color={color} bg="#fff" size={22} />
      <span className="font-body text-[13px] font-semibold text-ink">
        {name}
      </span>
      <button
        onClick={onRemove}
        className="flex cursor-pointer border-none bg-transparent p-[3px]"
        style={{ color }}
      >
        <X size={13} />
      </button>
    </div>
  );
}
