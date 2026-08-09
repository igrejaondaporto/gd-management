-- Migration 007: Allow deleting attendance + weeks for linked GDs
-- RLS: leader/supervisor/pastor linked to the GD via gd_staff can delete attendance and weeks

create policy "delete_own_gd_attendance" on attendance for delete using (
  exists (
    select 1 from weeks
    join gd_staff on gd_staff.gd_id = weeks.gd_id
    where weeks.id = attendance.week_id
      and gd_staff.profile_id = auth.uid()
      and auth_role() in ('leader', 'supervisor', 'pastor')
  )
);

create policy "delete_own_gd_weeks" on weeks for delete using (
  exists (
    select 1 from gd_staff
    where gd_staff.gd_id = weeks.gd_id
      and gd_staff.profile_id = auth.uid()
      and auth_role() in ('leader', 'supervisor', 'pastor')
  )
);
