-- Migration 010: meeting weekday per GD
--
-- `gds.weekday` was documented as existing since the first schema notes, but no
-- migration ever created it. Verified against the live database before writing
-- this file — `select weekday from gds` returned:
--   42703 "column gds.weekday does not exist"
--
-- Convention: 0 = Sunday … 6 = Saturday, matching JavaScript's `Date.getDay()`,
-- so the client can compute the next meeting date without a lookup table.
-- Nullable on purpose: the weekday of the GDs that already exist is unknown,
-- and a default of 0 would silently claim they all meet on Sunday.

alter table gds
  add column if not exists weekday smallint;

alter table gds
  drop constraint if exists gds_weekday_range;

alter table gds
  add constraint gds_weekday_range
  check (weekday is null or (weekday between 0 and 6));

comment on column gds.weekday is
  'Meeting weekday: 0 = Sunday … 6 = Saturday (matches JS Date.getDay()). NULL = not set.';

-- No RLS change: updating `gds` already goes through the `staff_update_gds`
-- policy (supervisor/pastor) from migration 006, which covers this column too.
