import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Person, Category } from "@/types";

function mapPerson(row: Record<string, unknown>): Person {
  return {
    id: row.id as string,
    gdId: row.gd_id as string,
    name: row.name as string,
    category: row.category as Category,
    memberSince: row.member_since as string | null,
    createdAt: row.created_at as string,
  };
}

export function usePeople(gdId: string | undefined) {
  return useQuery({
    queryKey: ["people", gdId],
    queryFn: async (): Promise<Person[]> => {
      if (!gdId) return [];
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("gd_id", gdId)
        .order("name");

      if (error) throw error;
      return (data || []).map(mapPerson);
    },
    enabled: !!gdId,
  });
}

export function useAddPerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (person: {
      gdId: string;
      name: string;
      category: Category;
      memberSince?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("people")
        .insert({
          gd_id: person.gdId,
          name: person.name,
          category: person.category,
          member_since: person.memberSince ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapPerson(data);
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ["people", data.gdId] }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      category,
      memberSince,
    }: {
      id: string;
      category: Category;
      memberSince?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("people")
        .update({ category, member_since: memberSince ?? null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return mapPerson(data);
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ["people", data.gdId] }),
  });
}

export function useBulkAddPeople() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      people: { gdId: string; name: string; category: Category; memberSince?: string | null }[],
    ) => {
      if (people.length === 0) return [];
      const { data, error } = await supabase
        .from("people")
        .insert(
          people.map((p) => ({
            gd_id: p.gdId,
            name: p.name,
            category: p.category,
            member_since: p.memberSince ?? null,
          })),
        )
        .select();

      if (error) throw error;
      return (data || []).map(mapPerson);
    },
    onSuccess: (_data, variables) => {
      if (variables.length > 0) qc.invalidateQueries({ queryKey: ["people", variables[0].gdId] });
    },
  });
}
