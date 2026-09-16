-- Migration 012: per-GD report status (how many weekly reports are outstanding)
--
-- The rule, in one place so the app and the dashboard cannot drift:
--
--   * Only weeks containing the GD's meeting day are expected.
--   * Matching is by WEEK (Monday–Sunday), not by exact date. Leaders regularly
--     record a session on the day either side of the usual one — GD Fânzeres is
--     a Wednesday GD with reports dated 18 ago (Tue) and 24 ago (Mon) — so
--     requiring the exact weekday wrongly reported those weeks as missing.
--   * Today is excluded: a meeting later tonight is not late yet.
--   * Weeks before the GD was created are excluded, so a new GD starts "em dia".
--
-- `p_today` is a parameter, not `current_date`: the database runs in UTC, so
-- between 23:00 and midnight in Lisbon the server's date is still the previous
-- day and the "exclude today" rule would target the wrong meeting. The client
-- passes its own local date.
--
-- `security invoker` on purpose: RLS on `gds`/`weeks` then limits the rows to
-- the GDs the caller is linked to, so a supervisor sees only their own GDs
-- without this function re-implementing that rule.

create or replace function gd_report_status(
  p_gd_ids uuid[] default null,
  p_today date default current_date,
  p_days int default 30
)
returns table (
  gd_id uuid,
  gd_name text,
  active boolean,
  weekday smallint,
  expected int,
  reported int,
  missing int
)
language sql
stable
security invoker
set search_path = 'public'
as $$
  with scope as (
    select g.id, g.name, g.active, g.weekday, g.created_at::date as created
    from gds g
    where g.weekday is not null
      and (p_gd_ids is null or g.id = any (p_gd_ids))
  ),
  -- One row per expected week (not per meeting day): a week is either reported
  -- or it is not, and two meeting days in the same week would still be one
  -- report to fill in.
  expected as (
    select s.id, date_trunc('week', d)::date as wk
    from scope s
    cross join lateral generate_series(
      (p_today - p_days)::date, (p_today - 1)::date, interval '1 day'
    ) as d
    where extract(dow from d)::int = s.weekday
      and d::date >= s.created
    group by s.id, date_trunc('week', d)
  ),
  tally as (
    select e.id,
           count(*)::int as expected,
           count(*) filter (
             where exists (
               select 1 from weeks w
               where w.gd_id = e.id
                 and date_trunc('week', w.date)::date = e.wk
             )
           )::int as reported
    from expected e
    group by e.id
  )
  select s.id,
         s.name,
         s.active,
         s.weekday,
         coalesce(t.expected, 0)::int,
         coalesce(t.reported, 0)::int,
         (coalesce(t.expected, 0) - coalesce(t.reported, 0))::int
  from scope s
  left join tally t on t.id = s.id
  -- Worst first: the dashboard shows the GDs that need attention at the top.
  order by (coalesce(t.expected, 0) - coalesce(t.reported, 0)) desc, s.name;
$$;

comment on function gd_report_status(uuid[], date, int) is
  'Per-GD outstanding weekly reports over the last p_days, matched by week (Mon-Sun). Pass the caller''s local date as p_today (the database is UTC).';
