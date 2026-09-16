import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit3, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PhoneFrame } from "@/components/ui/PhoneFrame";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AdminDrawer } from "@/features/auth";
import { usePeople, useDeletePerson } from "@/hooks/usePeople";
import { useAllGds } from "@/hooks/useAllGds";
import { supabase } from "@/lib/supabaseClient";
import { categoryColors } from "@/lib/constants";
import type { Person, Category } from "@/types";

function useUpdatePerson(gdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      category,
    }: {
      id: string;
      name: string;
      category: Category;
    }) => {
      const { error } = await supabase.from("people").update({ name, category }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["people", gdId] });
    },
  });
}

function PersonRow({
  person,
  gdId,
  readOnly,
}: {
  person: Person;
  gdId: string;
  readOnly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(person.name);
  const [category, setCategory] = useState<Category>(person.category);
  const [showDelete, setShowDelete] = useState(false);
  const updatePerson = useUpdatePerson(gdId);
  const deletePerson = useDeletePerson();

  const save = () => {
    if (!name.trim()) return;
    updatePerson.mutate({ id: person.id, name: name.trim(), category });
    setEditing(false);
  };

  const handleDelete = () => {
    deletePerson.mutate({ id: person.id, gdId });
    setShowDelete(false);
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-primary bg-card p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 w-full rounded-lg border border-line bg-card px-3 py-2 font-body text-sm font-semibold text-ink outline-none"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="mb-2 w-full rounded-lg border border-line bg-card px-3 py-2 font-body text-[13px] font-semibold text-ink outline-none"
        >
          <option value="member">Membro</option>
          <option value="attender">Frequentador</option>
          <option value="visitor">Visitante</option>
        </select>
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={updatePerson.isPending}
            className="flex-1 cursor-pointer rounded-lg border-none bg-primary px-3 py-2 font-body text-[12px] font-bold text-white disabled:opacity-50"
          >
            {updatePerson.isPending ? "Salvando..." : "Salvar"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex-1 cursor-pointer rounded-lg border border-line bg-card px-3 py-2 font-body text-[12px] font-bold text-ink-faint"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl px-0 py-2">
      <Avatar
        name={person.name}
        color={categoryColors[person.category].color}
        bg={categoryColors[person.category].bg}
        size={36}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-[14px] font-semibold text-ink">{person.name}</div>
        <div
          className="font-body text-[11.5px] font-bold"
          style={{ color: categoryColors[person.category].color }}
        >
          {categoryColors[person.category].label}
        </div>
      </div>
      {!readOnly && (
        <>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setEditing(true)}
              className="cursor-pointer rounded-lg border-none bg-transparent p-2 text-ink-faint hover:text-primary"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="cursor-pointer rounded-lg border-none bg-transparent p-2 text-ink-faint hover:text-rose"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <ConfirmModal
            open={showDelete}
            title="Excluir pessoa"
            message={
              <>
                Tem certeza que deseja excluir <strong>{person.name}</strong>?
              </>
            }
            confirmLabel="Excluir"
            variant="danger"
            onConfirm={handleDelete}
            onCancel={() => setShowDelete(false)}
            loading={deletePerson.isPending}
          />
        </>
      )}
    </div>
  );
}

export default function PeoplePage() {
  const { gdId } = useParams<{ gdId: string }>();
  const navigate = useNavigate();
  const { data: allGds } = useAllGds();
  const { data: people = [], isLoading } = usePeople(gdId);

  const gd = allGds?.gds.find((g) => g.id === gdId);
  const readOnly = false; // All roles (leader, supervisor, pastor) can edit

  const sorted = [...people].sort((a, b) => {
    const o: Record<Category, number> = { member: 0, attender: 1, visitor: 2 };
    return o[a.category] - o[b.category] || a.name.localeCompare(b.name);
  });

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-backdrop">
      <PhoneFrame
        accent={gd?.name}
        subtitle="Pessoas vinculadas a este grupo"
        onBack={() => navigate(-1)}
        rightSlot={<AdminDrawer />}
      >
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 pt-5 pb-6">
          <div className="mb-1 font-display text-[21px] font-bold tracking-[-0.03em] text-ink">
            Pessoas do GD
          </div>
          <div className="mb-5 font-body text-[13.5px] text-ink-soft">
            {people.length} pessoa{people.length !== 1 ? "s" : ""} cadastrada
            {people.length !== 1 ? "s" : ""}.
            {!readOnly && " Toque em Editar para alterar ou no ícone de lixeira para excluir."}
          </div>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-primary border-t-transparent" />
            </div>
          ) : (
            <div>
              {sorted.map((p) => (
                <PersonRow key={p.id} person={p} gdId={gdId!} readOnly={readOnly} />
              ))}
            </div>
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}
