-- Migration 001: Initial schema
-- Tables: profiles, gds, gd_staff, people, weeks, attendance

-- 1. profiles — mirrors auth.users, adds approval status and role
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  role text check (role in ('leader', 'supervisor', 'pastor')),
  created_at timestamptz not null default now()
);

-- 2. gds — groups of disciples
create table if not exists gds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. gd_staff — links any combination of leaders, supervisors, and pastors to a GD
create table if not exists gd_staff (
  gd_id uuid references gds(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (gd_id, profile_id)
);

-- 4. people — attendees (visitor/attender/member) within a GD
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  gd_id uuid not null references gds(id) on delete cascade,
  name text not null,
  category text not null check (category in ('visitor', 'attender', 'member')),
  member_since date,
  created_at timestamptz not null default now()
);

-- 5. weeks — one row per GD per week
create table if not exists weeks (
  id uuid primary key default gen_random_uuid(),
  gd_id uuid not null references gds(id) on delete cascade,
  date date not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (gd_id, date)
);

-- 6. attendance — many-to-many between weeks and people
-- category_at_time preserves the person's category at the moment of attendance
create table if not exists attendance (
  week_id uuid not null references weeks(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  category_at_time text not null check (category_at_time in ('visitor', 'attender', 'member')),
  primary key (week_id, person_id)
);

-- Enable Row Level Security on all tables (policies come in migration 002)
alter table profiles enable row level security;
alter table gds enable row level security;
alter table gd_staff enable row level security;
alter table people enable row level security;
alter table weeks enable row level security;
alter table attendance enable row level security;
