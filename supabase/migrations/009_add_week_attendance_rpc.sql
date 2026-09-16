-- Migration 009: RPC to add people to an already-registered week
--
-- Same purpose as `confirm_week_attendance` (005) but for the case where the
-- week already exists and someone was forgotten when it was first registered.
-- One round-trip, one transaction, no client-side multi-insert choreography.
--
-- Reuses the composite types created before 005:
--   attendance_entry  as (person_id uuid, category_at_time text)
--   new_person_entry  as (name text, category text, member_since date)

create or replace function add_week_attendance(
  p_week_id uuid,
  p_new_people new_person_entry[] default '{}'::new_person_entry[],
  p_entries attendance_entry[] default '{}'::attendance_entry[]
) returns uuid
language plpgsql
security definer set search_path = 'public'
as $$
declare
  v_gd_id uuid;
  v_week_date date;
  v_role text;
  v_new_person new_person_entry;
  v_entry attendance_entry;
  v_person_id uuid;
  v_current text;
  v_current_rank int;
  v_new_rank int;
begin
  select w.gd_id, w.date into v_gd_id, v_week_date
  from weeks w where w.id = p_week_id;

  if v_gd_id is null then
    raise exception 'Semana não encontrada' using errcode = 'no_data_found';
  end if;

  -- Mirrors the `write_own_gd_attendance` RLS policy: staff of the GD, with
  -- one of the three roles. Being SECURITY DEFINER, RLS does not run here,
  -- so the check has to be explicit.
  v_role := auth_role();
  if v_role is null or v_role not in ('leader', 'supervisor', 'pastor') then
    raise exception 'Sem permissão para registar presenças' using errcode = 'insufficient_privilege';
  end if;
  if not exists (select 1 from gd_staff where gd_id = v_gd_id and profile_id = auth.uid()) then
    raise exception 'Sem permissão para registar presenças neste GD' using errcode = 'insufficient_privilege';
  end if;

  -- 1. People that were not in the GD yet: create them and mark them present.
  foreach v_new_person in array coalesce(p_new_people, '{}'::new_person_entry[]) loop
    if btrim(coalesce(v_new_person.name, '')) = '' then
      continue;
    end if;
    if v_new_person.category not in ('visitor', 'attender', 'member') then
      continue;
    end if;

    insert into people (gd_id, name, category, member_since)
    values (
      v_gd_id,
      btrim(v_new_person.name),
      v_new_person.category,
      case when v_new_person.category = 'member'
           then coalesce(v_new_person.member_since, v_week_date)
           else null end
    )
    returning id into v_person_id;

    insert into attendance (week_id, person_id, category_at_time)
    values (p_week_id, v_person_id, v_new_person.category)
    on conflict (week_id, person_id) do nothing;
  end loop;

  -- 2. People already in the GD: mark present with the category the leader
  --    chose. If that category is ahead of the current one, promote (never
  --    demote) and stamp `member_since` with the week's date.
  foreach v_entry in array coalesce(p_entries, '{}'::attendance_entry[]) loop
    select p.category into v_current
    from people p
    where p.id = v_entry.person_id and p.gd_id = v_gd_id;

    if v_current is null then
      continue;
    end if;
    if v_entry.category_at_time not in ('visitor', 'attender', 'member') then
      continue;
    end if;

    v_current_rank := case v_current when 'attender' then 2 when 'member' then 3 else 1 end;
    v_new_rank := case v_entry.category_at_time when 'attender' then 2 when 'member' then 3 else 1 end;

    if v_new_rank > v_current_rank then
      update people
      set category = v_entry.category_at_time,
          member_since = case when v_entry.category_at_time = 'member'
                              then coalesce(member_since, v_week_date)
                              else member_since end
      where id = v_entry.person_id;
    end if;

    insert into attendance (week_id, person_id, category_at_time)
    values (p_week_id, v_entry.person_id, v_entry.category_at_time)
    on conflict (week_id, person_id) do update set category_at_time = excluded.category_at_time;
  end loop;

  return p_week_id;
end;
$$;
