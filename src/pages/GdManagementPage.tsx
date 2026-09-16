import { Edit3, Users } from "lucide-react";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { AdminNav } from "@/components/AdminNav";
import { NameInput } from "@/components/ui/NameInput";
import { WeekdayPicker } from "@/components/ui/WeekdayPicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { StaffSection } from "@/features/pastor";
import { AdminDrawer } from "@/features/auth";
import { useGds, useCreateGd, useUpdateGd, useLinkStaff, useUnlinkStaff } from "@/hooks/useGds";
import { formatSchedule, formatTime } from "@/lib/utils";
import { useState } from "react";

import type { GD } from "@/types";

export default function GdManagementPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWeekday, setEditWeekday] = useState<number | null>(null);
  const [editStartTime, setEditStartTime] = useState<string | null>(null);

  const { data: gds, isLoading } = useGds();
  const createGd = useCreateGd();
  const updateGd = useUpdateGd();
  const linkStaff = useLinkStaff();
  const unlinkStaff = useUnlinkStaff();

  const filteredGds = (gds || []).filter((g) => (showArchived ? !g.active : g.active));

  const handleEdit = (gd: GD) => {
    setEditingId(gd.id);
    setEditName(gd.name);
    setEditWeekday(gd.weekday);
    // The picker works in "HH:MM"; the column comes back as "HH:MM:SS".
    setEditStartTime(formatTime(gd.startTime));
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditWeekday(null);
    setEditStartTime(null);
  };

  const handleSave = () => {
    if (!editingId || !editName.trim()) return;
    // The drafts start from the GD's current values, so sending them all back
    // is a no-op for whichever field was not touched.
    updateGd.mutate({
      id: editingId,
      name: editName.trim(),
      weekday: editWeekday,
      startTime: editStartTime,
    });
    handleCancel();
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-backdrop">
      <PhoneFrame
        title="Gerir"
        accent="grupos"
        rightSlot={<AdminDrawer />}
        bottomSlot={<AdminNav />}
      >
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 pt-5 pb-4">
          <div className="mb-4 font-display text-[19px] font-bold tracking-[-0.03em] text-ink">
            Grupos de Discípulos
          </div>

          <div className="mb-4">
            <NameInput placeholder="Nome do novo GD" onAdd={(name) => createGd.mutate(name)} />
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          )}

          {filteredGds.map((gd) => {
            const schedule = formatSchedule(gd.weekday, gd.startTime);
            return (
              <div key={gd.id} className="mb-2 rounded-xl border border-line bg-card p-3">
                <div className="flex items-center gap-2">
                  {editingId === gd.id ? (
                    <div className="w-full">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        className="mb-2 w-full rounded-lg border-[1.5px] border-primary bg-card px-2 py-1.5 font-body text-[13px] font-semibold text-ink outline-none"
                        autoFocus
                      />
                      <div className="mb-1 font-body text-[10.5px] font-bold text-ink-faint uppercase">
                        Dia do GD
                      </div>
                      <div className="mb-2">
                        <WeekdayPicker
                          value={editWeekday}
                          onChange={setEditWeekday}
                          disabled={updateGd.isPending}
                        />
                      </div>
                      <div className="mb-1 font-body text-[10.5px] font-bold text-ink-faint uppercase">
                        Hora
                      </div>
                      <div className="mb-2.5">
                        <TimePicker
                          value={editStartTime}
                          onChange={setEditStartTime}
                          disabled={updateGd.isPending}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={updateGd.isPending}
                          className="flex-1 cursor-pointer rounded-lg border-none bg-primary px-2.5 py-1.5 font-body text-[11px] font-bold text-white disabled:opacity-60"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 cursor-pointer rounded-lg border border-line bg-card px-2.5 py-1.5 font-body text-[11px] font-bold text-ink-faint"
                        >
                          Cancelar
                        </button>
                      </div>
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
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            {schedule ? (
                              <span className="rounded-pill bg-primary-soft px-2 py-[2px] font-body text-[10.5px] font-bold text-primary">
                                {schedule}
                              </span>
                            ) : (
                              <span className="rounded-pill border border-dashed border-line px-2 py-[2px] font-body text-[10.5px] font-semibold text-ink-faint">
                                Sem dia definido
                              </span>
                            )}
                            <span className="font-body text-[10.5px] text-ink-faint">
                              {gd.staff.length} pessoa{gd.staff.length !== 1 ? "s" : ""} vinculada
                              {gd.staff.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit(gd)}
                        aria-label={`Editar ${gd.name}`}
                        className="cursor-pointer border-none bg-transparent p-1 text-ink-faint"
                      >
                        <Edit3 size={14} />
                      </button>
                    </>
                  )}
                </div>

                <StaffSection gd={gd} linkStaff={linkStaff} unlinkStaff={unlinkStaff} />
              </div>
            );
          })}

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
