import { useState } from "react";
import { Plus } from "lucide-react";

interface NameInputProps {
  placeholder: string;
  onAdd: (name: string) => void;
}

export function NameInput({ placeholder, onAdd }: NameInputProps) {
  const [val, setVal] = useState("");

  const commit = () => {
    const v = val.trim();
    if (!v) return;
    onAdd(v);
    setVal("");
  };

  return (
    <div className="flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-line bg-card px-3 py-[10px] font-body text-sm text-ink outline-none"
      />
      <button
        onClick={commit}
        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-[10px] border-none bg-primary px-3 py-[10px] font-body text-[13px] font-bold text-white"
      >
        <Plus size={15} />
        <span className="hidden sm:inline">Adicionar</span>
      </button>
    </div>
  );
}
