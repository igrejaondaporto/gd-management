-- Migration 007: Allow deleting attendance records for staff linked to the GD
-- RLS: leader/supervisor/pastor linked to the GD via gd_staff can delete attendance

create policy "delete_own_gd_attendance" on attendance for delete using (
  exists (
    select 1 from weeks
    join gd_staff on gd_staff.gd_id = weeks.gd_id
    where weeks.id = attendance.week_id
      and gd_staff.profile_id = auth.uid()
      and auth_role() in ('leader', 'supervisor', 'pastor')
  )
);
