-- Migration 013: GD status updates (supervisor/pastor assessment of a group)
--
-- **Append-only.** There is no separate "current status" table: the current
-- status is simply the newest row, and the history is every row. Two tables
-- would mean writing twice on every change and leaving the pair free to
-- disagree (the classic "current says Bom, history's newest says Ruim" bug).
-- Reads are cheap with the (gd_id, created_at desc) index below, and the row
-- is never edited — which also makes this a real audit trail.
--
-- DB values are English (`good`/`attention`/`bad`); the Portuguese labels
-- ("Bom"/"Atenção"/"Ruim") are mapped in `src/lib/constants.ts`, per the
-- project's identifier convention.

create table if not exists gd_status_updates (
  id uuid primary key default gen_random_uuid(),
  gd_id uuid not null references gds(id) on delete cascade,
  status text not null check (status in ('good', 'attention', 'bad')),
  comment text,
  created_by uuid references profiles(id),
  -- Snapshot of the author's name at the time of writing. Two reasons: it is
  -- what an audit trail should show (who said it then, not who they are now),
  -- and `profiles` RLS only lets a user read their own row, so a supervisor
  -- joining on `created_by` to display a colleague's name would get NULL.
  created_by_name text,
  created_at timestamptz not null default now()
);

-- The only query shape: latest-first for one GD.
create index if not exists gd_status_updates_gd_created_idx
  on gd_status_updates (gd_id, created_at desc);

/**
 * Sets the author server-side so it cannot be forged by the client — the same
 * reason the role is read from the token and not from the request body.
 */
create or replace function gd_status_updates_set_author()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  new.created_by := auth.uid();
  new.created_by_name := coalesce(
    (select nullif(btrim(p.full_name), '') from profiles p where p.id = auth.uid()),
    'Sem nome'
  );
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists gd_status_updates_author on gd_status_updates;
create trigger gd_status_updates_author
  before insert on gd_status_updates
  for each row execute function gd_status_updates_set_author();

alter table gd_status_updates enable row level security;

-- ── read: supervisors linked to the GD, plus pastors (who oversee all GDs) ──
-- The explicit `auth_role() in (...)` is what keeps LEADERS out: without it,
-- the `gd_staff` check alone would let a leader of the same GD read this.
drop policy if exists "read_gd_status_updates" on gd_status_updates;
create policy "read_gd_status_updates" on gd_status_updates
  for select using (
    auth_role() in ('supervisor', 'pastor')
    and (
      exists (
        select 1 from gd_staff
        where gd_staff.gd_id = gd_status_updates.gd_id
          and gd_staff.profile_id = auth.uid()
      )
      or auth_role() = 'pastor'
    )
  );

-- ── insert only ──
-- No update or delete policy exists, on purpose: without one, RLS denies both,
-- so the log is genuinely append-only. Correcting a wrong entry means adding a
-- new one, which is the point of a history.
drop policy if exists "insert_gd_status_updates" on gd_status_updates;
create policy "insert_gd_status_updates" on gd_status_updates
  for insert with check (
    auth_role() in ('supervisor', 'pastor')
    and (
      exists (
        select 1 from gd_staff
        where gd_staff.gd_id = gd_status_updates.gd_id
          and gd_staff.profile_id = auth.uid()
      )
      or auth_role() = 'pastor'
    )
  );

comment on table gd_status_updates is
  'Append-only log of GD status assessments. Current status = newest row per gd_id.';
