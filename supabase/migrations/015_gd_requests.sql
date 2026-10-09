-- Migration 015: GD requests ("Quero entrar num GD")
--
-- People who fill in the membership form of the Portal do Voluntário
-- (membro.igrejaonda.pt, repo `igrejaondaporto/portal-onda`) can ask for help
-- finding a GD. Until now that request stopped at the pastoral team. Now:
--
--   1. the Portal sends it here through the `gd-requests` Edge Function;
--   2. a supervisor/pastor sees it under "Pedidos" and assigns a GD
--      (`assign_gd_request`);
--   3. the staff of that GD see it on their home screen, contact the person
--      and mark how it went (`set_gd_request_status`) — "Entrou" can also add
--      them to the GD's people as a visitor, so the first attendance is one
--      tap;
--   4. the Portal reads the status back through the same Edge Function, so the
--      pastoral team sees where each request is without asking.
--
-- **Writes only go through the functions below**, never through the table:
-- there is no insert/update/delete policy, so RLS denies all three to every
-- client. The functions are `security definer` and check the caller
-- themselves — the same reason the role comes from `auth_role()` and the
-- author name from `profiles`, never from the request body.
--
-- ── the integration boundary ──
-- Partners never reach these RPCs. They call the `gd-requests` Edge Function
-- (`supabase/functions/gd-requests`) with a static per-partner API key, and the
-- function — holding the `service_role` key — is the only caller of
-- `submit_gd_request` / `gd_request_statuses`. Those two are granted to
-- `service_role` and to nobody else (not `public`, not `anon`, not
-- `authenticated`), so they are not part of the public PostgREST surface.
--
-- Each partner is one Edge Function secret (`PARTNER_*`) holding
-- `{ "source": "<source>", "key": "<chave>", "scopes": [...] }`. The function
-- resolves the presented key to its `source` and passes it here as `p_source`,
-- which is never taken from the request body. A partner can therefore only ever
-- touch rows carrying its own `source`. Adding a partner or rotating a key is a
-- secret change (`supabase secrets set`), not a code change.

create table if not exists gd_requests (
  id uuid primary key default gen_random_uuid(),
  -- Which partner sent it ('portal-onda', …), taken from the authenticated
  -- JWT — never from the request body.
  source text not null,
  -- Where it came from and its id there (the membro's Firestore id). Unique
  -- per partner, not globally: two partners may legitimately use the same ref.
  source_ref text not null,
  name text not null,
  phone text,
  email text,
  concelho text,
  age smallint,
  marital_status text,
  notes text,
  gd_id uuid references gds(id) on delete set null,
  status text not null default 'new'
    check (status in ('new', 'assigned', 'contacted', 'joined', 'declined')),
  -- The `people` row created when the leader marked "Entrou" and chose to add
  -- them, so a second tap never adds the same person twice.
  person_id uuid references people(id) on delete set null,
  -- Name snapshots, like `gd_status_updates.created_by_name`: `profiles` RLS
  -- only lets a user read their own row, so a join would show NULL to others.
  assigned_by_name text,
  assigned_at timestamptz,
  status_by_name text,
  status_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The idempotency key the functions upsert on: one request per partner+ref.
  constraint gd_requests_source_ref_key unique (source, source_ref)
);

create index if not exists gd_requests_gd_idx on gd_requests (gd_id, status);
create index if not exists gd_requests_status_idx on gd_requests (status, created_at desc);
create index if not exists gd_requests_source_idx on gd_requests (source, status);

alter table gd_requests enable row level security;

-- ── read: supervisors/pastors see every request (they are the ones who
-- route the unassigned ones); anyone on a GD's staff sees the ones sent to
-- that GD. Nobody else, and no write policy at all (see the header).
drop policy if exists "read_gd_requests" on gd_requests;
create policy "read_gd_requests" on gd_requests
  for select using (
    coalesce(auth_role(), '') in ('supervisor', 'pastor')
    or exists (
      select 1 from gd_staff
      where gd_staff.gd_id = gd_requests.gd_id
        and gd_staff.profile_id = auth.uid()
    )
  );

comment on table gd_requests is
  'Requests to join a GD, sent by third-party partners through the gd-requests Edge Function. Written only through the gd_request functions (service_role).';

create or replace function gd_actor_name()
returns text
language sql
stable
security definer
set search_path = 'public'
as $$
  select coalesce(
    (select nullif(btrim(p.full_name), '') from profiles p where p.id = auth.uid()),
    'Sem nome'
  );
$$;

/**
 * The Edge Function submits (or re-submits) a request on behalf of a partner.
 * `p_source` is the partner identity taken from the verified JWT, never from
 * the request body. Same `p_source` + `p_ref` = the same request: the contact
 * details are refreshed, the routing (GD, status) is kept — a re-send must
 * never undo what a supervisor already did.
 */
create or replace function submit_gd_request(
  p_source text,
  p_ref text,
  p_name text,
  p_phone text default null,
  p_email text default null,
  p_concelho text default null,
  p_age int default null,
  p_marital_status text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_row gd_requests;
begin
  if coalesce(p_source, '') !~ '^[a-z0-9][a-z0-9_-]{0,59}$' then
    raise exception 'invalid source' using errcode = '22023';
  end if;
  if coalesce(btrim(p_ref), '') = '' or length(p_ref) > 120 then
    raise exception 'invalid ref' using errcode = '22023';
  end if;
  if length(coalesce(btrim(p_name), '')) < 2 then
    raise exception 'invalid name' using errcode = '22023';
  end if;

  insert into gd_requests (source, source_ref, name, phone, email, concelho, age, marital_status, notes)
  values (
    p_source,
    btrim(p_ref),
    left(btrim(p_name), 120),
    left(nullif(btrim(p_phone), ''), 40),
    left(nullif(btrim(p_email), ''), 160),
    left(nullif(btrim(p_concelho), ''), 80),
    case when p_age between 0 and 120 then p_age end,
    left(nullif(btrim(p_marital_status), ''), 40),
    left(nullif(btrim(p_notes), ''), 600)
  )
  -- Contact fields only: routing, claim and status are deliberately absent so
  -- a re-send cannot undo them.
  on conflict (source, source_ref) do update set
    name = excluded.name,
    phone = excluded.phone,
    email = excluded.email,
    concelho = excluded.concelho,
    age = excluded.age,
    marital_status = excluded.marital_status,
    notes = excluded.notes,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'status', v_row.status);
end;
$$;
revoke execute on function submit_gd_request(text, text, text, text, text, text, int, text, text)
  from public, anon, authenticated;
grant execute on function submit_gd_request(text, text, text, text, text, text, int, text, text)
  to service_role;

/** Where each request is, for a partner's own list. Scoped to `p_source`, so
 *  a partner can never read another partner's refs. Only status and GD name go
 *  back — the partner already has the rest. `p_refs` null = the latest 1000. */
create or replace function gd_request_statuses(p_source text, p_refs text[] default null)
returns table (source_ref text, status text, gd_name text, status_by_name text, updated_at timestamptz)
language plpgsql
stable
security definer
set search_path = 'public'
as $$
begin
  if coalesce(p_source, '') !~ '^[a-z0-9][a-z0-9_-]{0,59}$' then
    raise exception 'invalid source' using errcode = '22023';
  end if;
  return query
    select r.source_ref, r.status, g.name, r.status_by_name, r.updated_at
    from gd_requests r
    left join gds g on g.id = r.gd_id
    where r.source = p_source
      and (p_refs is null or r.source_ref = any (p_refs))
    order by r.updated_at desc
    limit 1000;
end;
$$;
revoke execute on function gd_request_statuses(text, text[]) from public, anon, authenticated;
grant execute on function gd_request_statuses(text, text[]) to service_role;

/** Supervisor/pastor routes a request to a GD (or back to "sem GD" with
 *  null). Re-routing resets the status: the new GD has not talked to them. */
create or replace function assign_gd_request(p_id uuid, p_gd_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if coalesce(auth_role(), '') not in ('supervisor', 'pastor') then
    raise exception 'only supervisors and pastors route requests' using errcode = '42501';
  end if;
  if p_gd_id is not null and not exists (select 1 from gds where id = p_gd_id and active) then
    raise exception 'GD not found or inactive' using errcode = '22023';
  end if;

  update gd_requests set
    gd_id = p_gd_id,
    status = case when p_gd_id is null then 'new' else 'assigned' end,
    assigned_by_name = case when p_gd_id is null then null else gd_actor_name() end,
    assigned_at = case when p_gd_id is null then null else now() end,
    status_by_name = null,
    status_at = null,
    updated_at = now()
  where id = p_id;

  if not found then
    raise exception 'request not found' using errcode = '22023';
  end if;
end;
$$;
revoke execute on function assign_gd_request(uuid, uuid) from public, anon;
grant execute on function assign_gd_request(uuid, uuid) to authenticated;

/**
 * The GD's staff (or a supervisor/pastor) record how it went:
 * `contacted`, `joined`, `declined`, or back to `assigned`.
 * With `joined` and `p_add_person`, the person is added to the GD's people as
 * a visitor — once (`person_id` remembers it).
 */
create or replace function set_gd_request_status(p_id uuid, p_status text, p_add_person boolean default false)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_req gd_requests;
  v_person uuid;
begin
  select * into v_req from gd_requests where id = p_id for update;
  if not found then
    raise exception 'request not found' using errcode = '22023';
  end if;
  if v_req.gd_id is null then
    raise exception 'request has no GD yet' using errcode = '22023';
  end if;
  if not (
    coalesce(auth_role(), '') in ('supervisor', 'pastor')
    or exists (select 1 from gd_staff where gd_id = v_req.gd_id and profile_id = auth.uid())
  ) then
    raise exception 'not on this GD' using errcode = '42501';
  end if;
  if p_status not in ('assigned', 'contacted', 'joined', 'declined') then
    raise exception 'invalid status' using errcode = '22023';
  end if;

  v_person := v_req.person_id;
  if p_status = 'joined' and p_add_person and v_person is null then
    insert into people (gd_id, name, category)
    values (v_req.gd_id, v_req.name, 'visitor')
    returning id into v_person;
  end if;

  update gd_requests set
    status = p_status,
    person_id = v_person,
    status_by_name = gd_actor_name(),
    status_at = now(),
    updated_at = now()
  where id = p_id;
end;
$$;
revoke execute on function set_gd_request_status(uuid, text, boolean) from public, anon;
grant execute on function set_gd_request_status(uuid, text, boolean) to authenticated;
