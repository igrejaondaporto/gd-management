-- Migration 006: Fix RLS infinite recursion + grant supervisor same power as pastor
-- Uses auth_role() helper function to avoid recursive queries on profiles

-- Helper: returns the current user's role without self-referencing RLS
create or replace function auth_role()
returns text
language sql
security definer
as $$
  select role from profiles where id = auth.uid();
$$;

-- Drop all policies that referenced profiles subqueries (causing recursion)
-- Recreate them using auth_role() helper

-- PROFILES
drop policy if exists "pastor_read_all_profiles" on profiles;
drop policy if exists "pastor_update_all_profiles" on profiles;
create policy "pastor_read_all_profiles" on profiles for select using (auth_role() = 'pastor');
create policy "pastor_update_all_profiles" on profiles for update using (auth_role() = 'pastor');

-- GDS: supervisor and pastor can write
drop policy if exists "staff_read_linked_gds" on gds;
drop policy if exists "pastor_insert_gds" on gds;
drop policy if exists "pastor_update_gds" on gds;
drop policy if exists "pastor_delete_gds" on gds;
create policy "staff_read_linked_gds" on gds for select using (
  exists (select 1 from gd_staff where gd_staff.gd_id = gds.id and gd_staff.profile_id = auth.uid())
  or auth_role() in ('supervisor', 'pastor')
);
create policy "staff_write_gds" on gds for insert with check (auth_role() in ('supervisor', 'pastor'));
create policy "staff_update_gds" on gds for update using (auth_role() in ('supervisor', 'pastor'));
create policy "staff_delete_gds" on gds for delete using (auth_role() in ('supervisor', 'pastor'));

-- GD_STAFF
drop policy if exists "staff_read_own_links" on gd_staff;
drop policy if exists "pastor_read_all_links" on gd_staff;
drop policy if exists "pastor_write_gd_staff" on gd_staff;
drop policy if exists "pastor_delete_gd_staff" on gd_staff;
create policy "staff_read_own_links" on gd_staff for select using (profile_id = auth.uid());
create policy "staff_read_all_links" on gd_staff for select using (auth_role() in ('supervisor', 'pastor'));
create policy "staff_write_gd_staff" on gd_staff for insert with check (auth_role() in ('supervisor', 'pastor'));
create policy "staff_delete_gd_staff" on gd_staff for delete using (auth_role() in ('supervisor', 'pastor'));

-- PEOPLE
drop policy if exists "leader_read_own_gd_people" on people;
drop policy if exists "leader_write_own_gd_people" on people;
drop policy if exists "leader_update_own_gd_people" on people;
create policy "read_own_gd_people" on people for select using (
  exists (select 1 from gd_staff where gd_staff.gd_id = people.gd_id and gd_staff.profile_id = auth.uid())
);
create policy "write_own_gd_people" on people for insert with check (
  exists (select 1 from gd_staff where gd_staff.gd_id = people.gd_id and gd_staff.profile_id = auth.uid())
  and auth_role() in ('leader', 'supervisor', 'pastor')
);
create policy "update_own_gd_people" on people for update using (
  exists (select 1 from gd_staff where gd_staff.gd_id = people.gd_id and gd_staff.profile_id = auth.uid())
  and auth_role() in ('leader', 'supervisor', 'pastor')
);

-- WEEKS
drop policy if exists "leader_read_own_gd_weeks" on weeks;
drop policy if exists "leader_write_own_gd_weeks" on weeks;
create policy "read_own_gd_weeks" on weeks for select using (
  exists (select 1 from gd_staff where gd_staff.gd_id = weeks.gd_id and gd_staff.profile_id = auth.uid())
);
create policy "write_own_gd_weeks" on weeks for insert with check (
  exists (select 1 from gd_staff where gd_staff.gd_id = weeks.gd_id and gd_staff.profile_id = auth.uid())
  and auth_role() in ('leader', 'supervisor', 'pastor')
);

-- ATTENDANCE
drop policy if exists "leader_read_own_gd_attendance" on attendance;
drop policy if exists "leader_write_own_gd_attendance" on attendance;
create policy "read_own_gd_attendance" on attendance for select using (
  exists (select 1 from weeks join gd_staff on gd_staff.gd_id = weeks.gd_id
    where weeks.id = attendance.week_id and gd_staff.profile_id = auth.uid())
);
create policy "write_own_gd_attendance" on attendance for insert with check (
  exists (select 1 from weeks join gd_staff on gd_staff.gd_id = weeks.gd_id
    where weeks.id = attendance.week_id and gd_staff.profile_id = auth.uid())
  and auth_role() in ('leader', 'supervisor', 'pastor')
);
