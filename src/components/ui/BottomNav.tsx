import type { ReactNode } from "react";

interface BottomNavTab {
  key: string;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  tabs: BottomNavTab[];
  active: string;
  onChange: (key: string) => void;
}

export function BottomNav({ tabs, active, onChange }: BottomNavProps) {
  return (
    <div className="flex border-t border-line-soft bg-card">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="flex flex-1 cursor-pointer flex-col items-center gap-[3px] border-none bg-transparent px-0 pt-[10px] pb-3"
          style={{ color: active === t.key ? "#266BC6" : "#9A9A8A" }}
        >
          {t.icon}
          <span className="font-body text-[10.5px] font-bold">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
