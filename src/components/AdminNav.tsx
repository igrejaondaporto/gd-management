import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Home, Church } from "lucide-react";
import { BottomNav } from "./ui/BottomNav";

const TABS = [
  { key: "home", label: "Painel", icon: <Home size={20} /> },
  { key: "gds", label: "Grupos", icon: <Church size={20} /> },
];

/**
 * The bottom bar for supervisors/pastors, shared by every admin screen.
 *
 * Route-driven rather than state-driven so the same bar can be dropped into
 * `/pastor/users` and `/pastor/gds` — those screens used to have no bottom bar
 * at all, leaving the only way back to the dashboard as tapping the logo,
 * which is not discoverable.
 */
export function AdminNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  // On the management screens no tab is active: they are neither "Painel" nor
  // "Grupos", and lighting one up would claim you are somewhere you are not.
  const onHome = pathname === "/";
  const active = onHome ? (searchParams.get("tab") === "gds" ? "gds" : "home") : "";

  return (
    <BottomNav
      tabs={TABS}
      active={active}
      // `replace` so flicking between tabs does not pile up history entries.
      onChange={(key) => navigate(key === "gds" ? "/?tab=gds" : "/", { replace: true })}
    />
  );
}
