-- Migration 005: RPC function for atomic week attendance confirmation
-- NOTE: The composite types must be created first. Run this before the function:
--   drop type if exists attendance_entry, new_person_entry, promotion_entry cascade;
--   create type attendance_entry as (person_id uuid, category_at_time text);
--   create type new_person_entry as (name text, category text, member_since date);
--   create type promotion_entry as (person_id uuid, new_category text, member_since date);

create or replace function confirm_week_attendance(
  p_gd_id uuid,
  p_date date,
  p_new_people new_person_entry[],
  p_promotions promotion_entry[],
  p_attendance attendance_entry[]
) returns uuid
language plpgsql
security definer set search_path = 'public'
as $$
declare
  v_week_id uuid;
  v_new_person record;
  v_promotion promotion_entry;
  v_attendance attendance_entry;
  v_person_id uuid;
begin
  -- 1. Create the week
  insert into weeks (gd_id, date, created_by)
  values (p_gd_id, p_date, auth.uid())
  returning id into v_week_id;

  -- 2. Create new people and their attendance
  foreach v_new_person in array p_new_people loop
    insert into people (gd_id, name, category, member_since)
    values (p_gd_id, v_new_person.name, v_new_person.category, v_new_person.member_since)
    returning id into v_person_id;
    insert into attendance (week_id, person_id, category_at_time)
    values (v_week_id, v_person_id, v_new_person.category);
  end loop;

  -- 3. Handle promotions
  foreach v_promotion in array p_promotions loop
    update people
    set category = v_promotion.new_category,
        member_since = coalesce(v_promotion.member_since, member_since)
    where id = v_promotion.person_id;
  end loop;

  -- 4. Insert attendance for existing people
  foreach v_attendance in array p_attendance loop
    insert into attendance (week_id, person_id, category_at_time)
    values (v_week_id, v_attendance.person_id, v_attendance.category_at_time)
    on conflict (week_id, person_id) do nothing;
  end loop;

  return v_week_id;
end;
$$;
