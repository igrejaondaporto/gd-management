import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Settings, X, Users, Church, ChevronRight } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const ADMIN_LINKS = [
  { path: "/pastor/users", label: "Gerir usuários", icon: <Users size={18} /> },
  { path: "/pastor/gds", label: "Gerir grupos", icon: <Church size={18} /> },
];

/** Admin menu. No longer a side drawer but a bottom sheet, like the
 *  `Sheet*` components in portal-onda: dimmed backdrop, rounded top corners
 *  and the grey grab handle in the middle. */
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
      {/* Trigger — lives in the blue header, hence white */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        className="flex shrink-0 cursor-pointer items-center rounded-full border-none bg-white/15 p-2 text-white"
      >
        <Settings size={17} />
      </button>

      {/* Backdrop and sheet are portalled into `document.body`, not rendered
          here. The trigger lives in the `.crista` header, and `index.css`'s
          `.crista > *` gives its children `z-index: 1` — that creates a
          stacking context. A `z-50` inside it only counts WITHIN it, so the
          `BottomNav` (also `fixed`, but `z-10` at the root) painted over the
          sheet on large screens. In a portal the `z-50` competes in the root
          context and wins. */}
      {createPortal(
        <>
          {/* Backdrop */}
          {open && (
            <div
              className="fixed inset-0 z-40 animate-fade-in bg-ink/45"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Sheet */}
          <div
            ref={sheetRef}
            className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[80dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[26px] bg-card shadow-lg transition-transform duration-300 ${
              open ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line" />

            <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
              <div className="font-display text-[19px] font-bold tracking-[-0.03em] text-ink">
                Menu
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="cursor-pointer rounded-full border-none bg-paper-alt p-2 text-ink-soft"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto px-5 pt-2 pb-6 pb-safe">
              {ADMIN_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-left transition-colors active:bg-paper-alt"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    {link.icon}
                  </span>
                  <span className="flex-1 font-body text-[14.5px] font-semibold text-ink">
                    {link.label}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-ink-faint" />
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
