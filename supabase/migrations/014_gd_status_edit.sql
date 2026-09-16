-- Migration 014: allow fixing the current status update (typos), still no
-- history rewriting.
--
-- 013 made the log append-only, which is right for the audit trail but wrong
-- for a typo: correcting a word should not add a second entry claiming the GD
-- changed. The compromise here keeps most of the guarantee:
--
--   * only the **newest** row of a GD can be edited — once a new update is
--     written, the older one is frozen forever;
--   * only its **author** can edit it, so nobody can rewrite a colleague's
--     assessment;
--   * `gd_id`, `created_by`, `created_by_name` and `created_at` are reset to
--     their original values by the trigger, so an edit cannot backdate an
--     entry, move it to another GD, or change who said it;
--   * the edit is recorded in `updated_at`, and the UI marks the entry as
--     edited — an edit is visible, not silent.

alter table gd_status_updates
  add column if not exists updated_at timestamptz;

comment on column gd_status_updates.updated_at is
  'When the entry was last edited. NULL = never edited (still append-only history).';

/**
 * The newest entry for a GD. `security definer` so the RLS policy below can
 * call it without the policy having to query its own table (which risks
 * "infinite recursion detected in policy").
 */
create or replace function gd_latest_status_update_id(p_gd_id uuid)
returns uuid
language sql
stable
security definer
set search_path = 'public'
as $$
  select id from gd_status_updates where gd_id = p_gd_id order by created_at desc limit 1;
$$;

-- Extend the existing trigger to cover updates: keep authorship and insertion
-- time exactly as they were, and stamp the edit instead.
create or replace function gd_status_updates_set_author()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_by_name := coalesce(
      (select nullif(btrim(p.full_name), '') from profiles p where p.id = auth.uid()),
      'Sem nome'
    );
    new.created_at := now();
    new.updated_at := null;
  else
    new.id := old.id;
    new.gd_id := old.gd_id;
    new.created_by := old.created_by;
    new.created_by_name := old.created_by_name;
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists gd_status_updates_author on gd_status_updates;
create trigger gd_status_updates_author
  before insert or update on gd_status_updates
  for each row execute function gd_status_updates_set_author();

-- ── update: only your own, only the newest ──
-- Still no DELETE policy: entries are never removed, only superseded or fixed.
drop policy if exists "update_own_latest_gd_status" on gd_status_updates;
create policy "update_own_latest_gd_status" on gd_status_updates
  for update
  using (
    auth_role() in ('supervisor', 'pastor')
    and created_by = auth.uid()
    and id = gd_latest_status_update_id(gd_status_updates.gd_id)
  )
  with check (
    auth_role() in ('supervisor', 'pastor')
    and created_by = auth.uid()
  );
