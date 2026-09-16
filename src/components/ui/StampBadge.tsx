import { CheckCircle2 } from "lucide-react";
import { colors } from "@/lib/constants";

interface StampBadgeProps {
  small?: boolean;
}

export function StampBadge({ small = false }: StampBadgeProps) {
  const size = small ? 18 : 22;
  const iconSize = small ? 12 : 14;

  return (
    <div
      className="stamp-pop absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full border-2 border-card bg-primary"
      style={{ width: size, height: size }}
    >
      <CheckCircle2 size={iconSize} color={colors.paper} strokeWidth={3} />
    </div>
  );
}
