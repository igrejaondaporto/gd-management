import type { ReactNode } from "react";

interface IconButtonProps {
  onClick: () => void;
  children: ReactNode;
  label: string;
  className?: string;
}

export function IconButton({
  onClick,
  children,
  label,
  className = "",
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center border-none bg-transparent p-2 text-ink cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
