import { initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  color: string;
  bg: string;
  size?: number;
}

export function Avatar({ name, color, bg, size = 34 }: AvatarProps) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-body font-bold"
      style={{
        width: size,
        height: size,
        background: bg,
        color,
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </div>
  );
}
