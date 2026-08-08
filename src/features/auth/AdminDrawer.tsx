import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, X, Users, Church } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const ADMIN_LINKS = [
  { path: "/pastor/users", label: "Gerir usuarios", icon: <Users size={18} /> },
  { path: "/pastor/gds", label: "Gerir GDs", icon: <Church size={18} /> },
];

export function AdminDrawer() {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const isAdmin = profile?.role === "supervisor" || profile?.role === "pastor";

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!isAdmin) return null;

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex shrink-0 cursor-pointer items-center rounded-lg border-none bg-transparent p-1.5 text-ink-faint"
      >
        <Settings size={17} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        ref={sheetRef}
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-card shadow-lg transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line-soft px-4 py-4">
          <div className="font-display text-base font-bold text-ink">Menu</div>
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-ink-faint"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-2">
          {ADMIN_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-3 border-none bg-transparent px-4 py-3 font-body text-[14px] font-semibold text-ink transition-colors hover:bg-paper-alt"
            >
              <span className="text-ink-faint">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
