-- Migration 011: meeting start time per GD
--
-- Pairs with `weekday` (010): together they describe when the GD meets, e.g.
-- "terça às 19:30". Nullable for the same reason — the GDs that already exist
-- have no known time, and any default would be a made-up fact.
--
-- `time` rather than text: it compares and sorts correctly, and PostgREST
-- serialises it as "HH:MM:SS". The client trims it to "HH:MM" for display.
-- No range constraint is needed — `time` already rejects 25:00.

alter table gds
  add column if not exists start_time time;

comment on column gds.start_time is
  'Meeting start time, local time (Europe/Lisbon). NULL = not set.';
