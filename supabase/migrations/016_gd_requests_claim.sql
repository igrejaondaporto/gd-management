-- Migration 016: a supervisor "takes" a GD request before routing it
--
-- With three supervisors looking at the same inbox, nothing said who was
-- dealing with which person. Now a new request is first *taken*
-- (`claim_gd_request`): it shows as "A tratar · <name>" to everyone, and
-- only that supervisor (or a pastor) picks the GD — after talking to the
-- person to find the right fit. They can also hand it back
-- (`release_gd_request`).
--
-- Flow: new → claimed → assigned → contacted → joined / declined
--
-- Also: region and children, so the card shows what helps match a group
-- (sent by the Portal from the membership form).

alter table gd_requests drop constraint if exists gd_requests_status_check;
alter table gd_requests add constraint gd_requests_status_check
  check (status in ('new', 'claimed', 'assigned', 'contacted', 'joined', 'declined'));

alter table gd_requests
  add column if not exists claimed_by uuid references profiles(id) on delete set null,
  add column if not exists claimed_by_name text,
  add column if not exists claimed_at timestamptz,
  add column if not exists region text,
  add column if not exists has_children boolean,
  add column if not exists children_note text;

/** Take a new request: "I'm dealing with this one". Only one supervisor can
 *  hold it — the `status = 'new'` guard makes two simultaneous taps safe. */
create or replace function claim_gd_request(p_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if coalesce(auth_role(), '') not in ('supervisor', 'pastor') then
    raise exception 'only supervisors and pastors take requests' using errcode = '42501';
  end if;

  update gd_requests set
    status = 'claimed',
    claimed_by = auth.uid(),
    claimed_by_name = gd_actor_name(),
    claimed_at = now(),
    status_by_name = gd_actor_name(),
    status_at = now(),
    updated_at = now()
  where id = p_id and status = 'new';

  if not found then
    raise exception 'Outro supervisor já pegou neste pedido.' using errcode = '22023';
  end if;
end;
$$;
revoke execute on function claim_gd_request(uuid) from public, anon;
grant execute on function claim_gd_request(uuid) to authenticated;

/** Hand a taken request back to the inbox — whoever took it, or a pastor. */
create or replace function release_gd_request(p_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  update gd_requests set
    status = 'new',
    claimed_by = null,
    claimed_by_name = null,
    claimed_at = null,
    status_by_name = null,
    status_at = null,
    updated_at = now()
  where id = p_id
    and status = 'claimed'
    and (claimed_by = auth.uid() or coalesce(auth_role(), '') = 'pastor');

  if not found then
    raise exception 'Só quem pegou no pedido o pode largar.' using errcode = '42501';
  end if;
end;
$$;
revoke execute on function release_gd_request(uuid) from public, anon;
grant execute on function release_gd_request(uuid) to authenticated;

/** Routing now respects who took the request: a supervisor cannot route a
 *  request another supervisor is dealing with (a pastor still can). Going
 *  back to "no GD" returns it to whoever had taken it, or to the inbox. */
create or replace function assign_gd_request(p_id uuid, p_gd_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_req gd_requests;
begin
  if coalesce(auth_role(), '') not in ('supervisor', 'pastor') then
    raise exception 'only supervisors and pastors route requests' using errcode = '42501';
  end if;
  select * into v_req from gd_requests where id = p_id for update;
  if not found then
    raise exception 'request not found' using errcode = '22023';
  end if;
  if v_req.claimed_by is not null and v_req.claimed_by <> auth.uid()
     and coalesce(auth_role(), '') <> 'pastor' then
    raise exception 'Este pedido está a ser tratado por %.', v_req.claimed_by_name using errcode = '42501';
  end if;
  if p_gd_id is not null and not exists (select 1 from gds where id = p_gd_id and active) then
    raise exception 'GD not found or inactive' using errcode = '22023';
  end if;

  update gd_requests set
    gd_id = p_gd_id,
    status = case
      when p_gd_id is not null then 'assigned'
      when v_req.claimed_by is not null then 'claimed'
      else 'new' end,
    assigned_by_name = case when p_gd_id is null then null else gd_actor_name() end,
    assigned_at = case when p_gd_id is null then null else now() end,
    status_by_name = case when p_gd_id is null then v_req.claimed_by_name else null end,
    status_at = case when p_gd_id is null then v_req.claimed_at else null end,
    updated_at = now()
  where id = p_id;
end;
$$;

-- The Portal now also sends region and children. The old 9-argument version is
-- dropped so PostgREST never has two candidates to choose from; the new one
-- takes `p_source` (the partner identity from the verified JWT) instead of the
-- old shared secret.
drop function if exists submit_gd_request(text, text, text, text, text, text, int, text, text);

create or replace function submit_gd_request(
  p_source text,
  p_ref text,
  p_name text,
  p_phone text default null,
  p_email text default null,
  p_concelho text default null,
  p_age int default null,
  p_marital_status text default null,
  p_notes text default null,
  p_region text default null,
  p_has_children boolean default null,
  p_children_note text default null
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

  insert into gd_requests (source, source_ref, name, phone, email, concelho, age, marital_status, notes,
                           region, has_children, children_note)
  values (
    p_source,
    btrim(p_ref),
    left(btrim(p_name), 120),
    left(nullif(btrim(p_phone), ''), 40),
    left(nullif(btrim(p_email), ''), 160),
    left(nullif(btrim(p_concelho), ''), 80),
    case when p_age between 0 and 120 then p_age end,
    left(nullif(btrim(p_marital_status), ''), 40),
    left(nullif(btrim(p_notes), ''), 600),
    left(nullif(btrim(p_region), ''), 40),
    p_has_children,
    left(nullif(btrim(p_children_note), ''), 120)
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
    region = excluded.region,
    has_children = excluded.has_children,
    children_note = excluded.children_note,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'status', v_row.status);
end;
$$;
revoke execute on function submit_gd_request(text, text, text, text, text, text, int, text, text, text, boolean, text)
  from public, anon, authenticated;
grant execute on function submit_gd_request(text, text, text, text, text, text, int, text, text, text, boolean, text)
  to service_role;

-- Let PostgREST drop the stale (previously `anon`-callable) function visibility now.
notify pgrst, 'reload schema';
