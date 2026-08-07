-- Migration 002: Row Level Security policies
-- Roles: leader, supervisor, pastor (pastor is the admin role)

-- ===== PROFILES =====
-- Users can read/edit their own profile; pastor can read/edit all
create policy "users_read_own_profile" on profiles
  for select using (auth.uid() = id);

create policy "users_update_own_profile" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "pastor_read_all_profiles" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

create policy "pastor_update_all_profiles" on profiles
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

-- ===== GDS =====
-- Approved users can read GDs they are linked to via gd_staff
-- Pastor can read/write all GDs
create policy "staff_read_linked_gds" on gds
  for select using (
    exists (
      select 1 from gd_staff
      where gd_staff.gd_id = gds.id
      and gd_staff.profile_id = auth.uid()
    )
    or
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

create policy "pastor_insert_gds" on gds
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

create policy "pastor_update_gds" on gds
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

create policy "pastor_delete_gds" on gds
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

-- ===== GD_STAFF =====
-- Pastor writes (links/unlinks staff); users read their own links; pastor reads all
create policy "staff_read_own_links" on gd_staff
  for select using (profile_id = auth.uid());

create policy "pastor_read_all_links" on gd_staff
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

create policy "pastor_write_gd_staff" on gd_staff
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

create policy "pastor_delete_gd_staff" on gd_staff
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pastor')
  );

-- ===== PEOPLE =====
-- Leader reads/writes people in their linked GDs
-- Supervisor reads people in their linked GDs
-- Pastor reads all people in all GDs
create policy "leader_read_own_gd_people" on people
  for select using (
    exists (
      select 1 from gd_staff
      where gd_staff.gd_id = people.gd_id
      and gd_staff.profile_id = auth.uid()
      and exists (select 1 from profiles where id = auth.uid() and role in ('leader', 'supervisor', 'pastor'))
    )
  );

create policy "leader_write_own_gd_people" on people
  for insert with check (
    exists (
      select 1 from gd_staff
      where gd_staff.gd_id = people.gd_id
      and gd_staff.profile_id = auth.uid()
      and exists (select 1 from profiles where id = auth.uid() and role in ('leader', 'pastor'))
    )
  );

create policy "leader_update_own_gd_people" on people
  for update using (
    exists (
      select 1 from gd_staff
      where gd_staff.gd_id = people.gd_id
      and gd_staff.profile_id = auth.uid()
      and exists (select 1 from profiles where id = auth.uid() and role in ('leader', 'pastor'))
    )
  );

-- ===== WEEKS =====
-- Leader reads/writes weeks in linked GDs; supervisor reads; pastor reads all
create policy "leader_read_own_gd_weeks" on weeks
  for select using (
    exists (
      select 1 from gd_staff
      where gd_staff.gd_id = weeks.gd_id
      and gd_staff.profile_id = auth.uid()
      and exists (select 1 from profiles where id = auth.uid() and role in ('leader', 'supervisor', 'pastor'))
    )
  );

create policy "leader_write_own_gd_weeks" on weeks
  for insert with check (
    exists (
      select 1 from gd_staff
      where gd_staff.gd_id = weeks.gd_id
      and gd_staff.profile_id = auth.uid()
      and exists (select 1 from profiles where id = auth.uid() and role in ('leader', 'pastor'))
    )
  );

-- ===== ATTENDANCE =====
-- Leader reads/writes attendance in linked GDs; supervisor reads; pastor reads all
create policy "leader_read_own_gd_attendance" on attendance
  for select using (
    exists (
      select 1 from weeks
      join gd_staff on gd_staff.gd_id = weeks.gd_id
      where weeks.id = attendance.week_id
      and gd_staff.profile_id = auth.uid()
      and exists (select 1 from profiles where id = auth.uid() and role in ('leader', 'supervisor', 'pastor'))
    )
  );

create policy "leader_write_own_gd_attendance" on attendance
  for insert with check (
    exists (
      select 1 from weeks
      join gd_staff on gd_staff.gd_id = weeks.gd_id
      where weeks.id = attendance.week_id
      and gd_staff.profile_id = auth.uid()
      and exists (select 1 from profiles where id = auth.uid() and role in ('leader', 'pastor'))
    )
  );
