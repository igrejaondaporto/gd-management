-- Migration 015: GD requests ("Quero entrar num GD")
--
-- People who fill in the membership form of the Portal do Voluntário
-- (membro.igrejaonda.pt, repo `igrejaondaporto/portal-onda`) can ask for help
-- finding a GD. Until now that request stopped at the pastoral team. Now:
--
--   1. the Portal sends it here (`submit_gd_request`, server to server);
--   2. a supervisor/pastor sees it under "Pedidos" and assigns a GD
--      (`assign_gd_request`);
--   3. the staff of that GD see it on their home screen, contact the person
--      and mark how it went (`set_gd_request_status`) — "Entrou" can also add
--      them to the GD's people as a visitor, so the first attendance is one
--      tap;
--   4. the Portal reads the status back (`gd_request_statuses`), so the
--      pastoral team sees where each request is without asking.
--
-- **Writes only go through the functions below**, never through the table:
-- there is no insert/update/delete policy, so RLS denies all three to every
-- client. The functions are `security definer` and check the caller
-- themselves — the same reason the role comes from `auth_role()` and the
-- author name from `profiles`, never from the request body.
--
-- The Portal calls with the anon key (public, it ships in this app's bundle)
-- plus a shared secret. Only the secret's SHA-256 lives here; the secret
-- itself lives in the Portal's Firestore (`config/gdIntegracao`, a document
-- no Firestore rule opens), so it is never in a repo, a chat or a screen.
-- Rotating it = a new hash here + a new secret there.

create table if not exists gd_requests (
  id uuid primary key default gen_random_uuid(),
  -- Where it came from and its id there (the membro's Firestore id) — the
  -- unique key that makes a re-send update the request instead of duplicating.
  source text not null default 'portal-onda',
  source_ref text not null unique,
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
  updated_at timestamptz not null default now()
);

create index if not exists gd_requests_gd_idx on gd_requests (gd_id, status);
create index if not exists gd_requests_status_idx on gd_requests (status, created_at desc);

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
  'Requests to join a GD, sent by the Portal do Voluntário. Written only through the gd_request functions.';

-- ── shared secrets for server-to-server callers ──
-- RLS on and no policy: invisible to every client, readable only by the
-- security-definer functions below.
create table if not exists integration_keys (
  name text primary key,
  secret_sha256 text not null,
  created_at timestamptz not null default now()
);
alter table integration_keys enable row level security;
revoke all on integration_keys from anon, authenticated;

insert into integration_keys (name, secret_sha256)
values ('portal-onda', 'ed9bda7b0cc22d4f2d260f7456dedda6afc8f2fdbd113e8b25b574b0b969c872')
on conflict (name) do update set secret_sha256 = excluded.secret_sha256;

create or replace function gd_integration_key_ok(p_key text)
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select exists (
    select 1 from integration_keys
    where name = 'portal-onda'
      and secret_sha256 = encode(sha256(convert_to(coalesce(p_key, ''), 'UTF8')), 'hex')
  );
$$;
revoke execute on function gd_integration_key_ok(text) from public, anon, authenticated;

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
 * The Portal sends (or re-sends) a request. Same `p_ref` = the same request:
 * the contact details are refreshed, the routing (GD, status) is kept — a
 * re-send must never undo what a supervisor already did.
 */
create or replace function submit_gd_request(
  p_key text,
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
  if not gd_integration_key_ok(p_key) then
    raise exception 'invalid integration key' using errcode = '28000';
  end if;
  if coalesce(btrim(p_ref), '') = '' or length(p_ref) > 120 then
    raise exception 'invalid ref' using errcode = '22023';
  end if;
  if length(coalesce(btrim(p_name), '')) < 2 then
    raise exception 'invalid name' using errcode = '22023';
  end if;

  insert into gd_requests (source_ref, name, phone, email, concelho, age, marital_status, notes)
  values (
    btrim(p_ref),
    left(btrim(p_name), 120),
    left(nullif(btrim(p_phone), ''), 40),
    left(nullif(btrim(p_email), ''), 160),
    left(nullif(btrim(p_concelho), ''), 80),
    case when p_age between 0 and 120 then p_age end,
    left(nullif(btrim(p_marital_status), ''), 40),
    left(nullif(btrim(p_notes), ''), 600)
  )
  on conflict (source_ref) do update set
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
revoke execute on function submit_gd_request(text, text, text, text, text, text, int, text, text) from public;
grant execute on function submit_gd_request(text, text, text, text, text, text, int, text, text) to anon;

/** Where each request is, for the Portal's "Querem entrar num GD" list.
 *  Only status and GD name go back — the Portal already has the rest. */
create or replace function gd_request_statuses(p_key text, p_refs text[])
returns table (source_ref text, status text, gd_name text, status_by_name text, updated_at timestamptz)
language plpgsql
stable
security definer
set search_path = 'public'
as $$
begin
  if not gd_integration_key_ok(p_key) then
    raise exception 'invalid integration key' using errcode = '28000';
  end if;
  return query
    select r.source_ref, r.status, g.name, r.status_by_name, r.updated_at
    from gd_requests r
    left join gds g on g.id = r.gd_id
    where r.source_ref = any (coalesce(p_refs, '{}'::text[]))
    limit 1000;
end;
$$;
revoke execute on function gd_request_statuses(text, text[]) from public;
grant execute on function gd_request_statuses(text, text[]) to anon;

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
