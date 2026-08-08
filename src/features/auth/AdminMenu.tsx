import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Users, Church, BarChart3 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const ADMIN_LINKS = [
  { path: "/pastor/users", label: "Usuarios", icon: <Users size={15} /> },
  { path: "/pastor/gds", label: "GDs", icon: <Church size={15} /> },
  { path: "/reports", label: "Relatorios", icon: <BarChart3 size={15} /> },
];

export function AdminMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const isAdmin = profile?.role === "supervisor" || profile?.role === "pastor";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAdmin) return null;

  return (
    <div ref={ref} className="relative ml-auto">
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center rounded-lg border-none bg-transparent p-1.5 text-ink-faint transition-colors hover:text-ink"
      >
        <Settings size={17} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[150px] rounded-xl border border-line bg-card py-1 shadow-sm">
          {ADMIN_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-2 font-body text-[13px] font-semibold text-ink transition-colors hover:bg-paper-alt"
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
