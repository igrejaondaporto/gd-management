import { useState } from "react";
import { Archive, Edit3, Users } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { NameInput } from "@/components/ui/NameInput";
import { StaffSection } from "@/features/pastor";
import {
  useGds,
  useCreateGd,
  useUpdateGd,
  useToggleGdActive,
  useLinkStaff,
  useUnlinkStaff,
} from "@/hooks/useGds";
import type { GD } from "@/types";

export default function GdManagementPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data: gds, isLoading } = useGds();
  const createGd = useCreateGd();
  const updateGd = useUpdateGd();
  const toggleActive = useToggleGdActive();
  const linkStaff = useLinkStaff();
  const unlinkStaff = useUnlinkStaff();

  const filteredGds = (gds || []).filter((g) => (showArchived ? !g.active : g.active));

  const handleEdit = (gd: GD) => {
    setEditingId(gd.id);
    setEditName(gd.name);
  };

  const handleSave = () => {
    if (!editingId || !editName.trim()) return;
    updateGd.mutate({ id: editingId, name: editName.trim() });
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <PhoneFrame title="GDs" badge={{ label: "pastor", color: "#A9822C", bg: "#F1E2B8" }}>
        <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-4 pb-4">
          <div className="mb-4 font-display text-lg font-bold text-ink">Grupos de Discipulos</div>

          <div className="mb-4">
            <NameInput placeholder="Nome do novo GD" onAdd={(name) => createGd.mutate(name)} />
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          )}

          {filteredGds.map((gd) => (
            <div key={gd.id} className="mb-2 rounded-xl border border-line bg-card p-3">
              <div className="flex items-center gap-2">
                {editingId === gd.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      className="flex-1 rounded-lg border-[1.5px] border-primary bg-card px-2 py-1.5 font-body text-[13px] font-semibold text-ink outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      className="cursor-pointer rounded-lg border-none bg-primary px-2.5 py-1.5 font-body text-[11px] font-bold text-white"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="cursor-pointer rounded-lg border-none bg-paper-alt px-2.5 py-1.5 font-body text-[11px] font-bold text-ink-faint"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-primary-soft">
                        <Users size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-body text-[13px] font-semibold text-ink">
                          {gd.name}
                        </div>
                        <div className="font-body text-[10.5px] text-ink-faint">
                          {gd.staff.length} pessoa{gd.staff.length !== 1 ? "s" : ""} vinculada
                          {gd.staff.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(gd)}
                      className="cursor-pointer border-none bg-transparent p-1 text-ink-faint"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => toggleActive.mutate({ id: gd.id, active: false })}
                      className="cursor-pointer border-none bg-transparent p-1 text-ink-faint"
                    >
                      <Archive size={14} />
                    </button>
                  </>
                )}
              </div>

              <StaffSection gd={gd} linkStaff={linkStaff} unlinkStaff={unlinkStaff} />
            </div>
          ))}

          {!isLoading && filteredGds.length === 0 && (
            <div className="py-8 text-center font-body text-sm text-ink-faint">
              {showArchived
                ? "Nenhum GD arquivado."
                : "Nenhum GD cadastrado. Crie o primeiro acima."}
            </div>
          )}

          {(gds || []).some((g) => !g.active) && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="mt-2 cursor-pointer border-none bg-transparent p-2 text-center font-body text-[11.5px] font-semibold text-ink-faint"
            >
              {showArchived ? "Mostrar ativos" : "Mostrar arquivados"}
            </button>
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
