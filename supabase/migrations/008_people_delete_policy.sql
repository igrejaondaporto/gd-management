-- Migration 009: Allow leaders/supervisors/pastors to delete people from their linked GDs

create policy "delete_own_gd_people" on people
  for delete using (
    exists (
      select 1 from gd_staff
      where gd_staff.gd_id = people.gd_id
      and gd_staff.profile_id = auth.uid()
    )
    and auth_role() in ('leader', 'supervisor', 'pastor')
  );
