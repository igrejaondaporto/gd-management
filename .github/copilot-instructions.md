# Presença GD — Copilot Instructions

## What is this?

A mobile-first web app for churches to track weekly attendance in small groups (Grupos de Discípulos). Built with React 19 + TypeScript + Vite + Supabase + Tailwind CSS. Deployed at `https://smart-gd-report.vercel.app`.

## Core problem it solves

Church leaders need to record who attended their weekly GD meeting (visitors, attenders, members), track promotions (visitor→attender→member), and see attendance stats per week/month. Pastors/supervisors oversee multiple GDs.

## Stack

| Layer    | Tech                                                             |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS                         |
| Routing  | react-router-dom v7 (SPA)                                        |
| Data     | Supabase (Postgres + Auth + RLS), TanStack React Query           |
| Auth     | Google OAuth via Supabase Auth                                   |
| Icons    | lucide-react                                                     |
| Fonts    | Fraunces (display), Public Sans (body), JetBrains Mono (numbers) |
| Deploy   | Vercel (SPA rewrite via `vercel.json`)                           |

## Architecture — strict conventions

```
src/
  components/ui/      Reusable primitives (Avatar, Pill, PersonChip, WeekdayPicker, TimePicker,
                      BottomNav, PhoneFrame...)
  features/
    auth/             AuthProvider, AdminDrawer
    pastor/components UserList, StaffSection
    attendance/       AttendanceFlow, LeaderHome, WeeklySummary, GdPicker + 5 step components
    dashboard/        PastorHome
  hooks/              All data hooks (useProfile, usePeople, useWeeks, useGds, useLeaderGd...)
  pages/              THIN pages — only compose hooks + feature components, no business logic
  routes/             AppRoutes, ProtectedRoute, GdBoundary
  lib/                supabaseClient, queryClient, constants (design tokens), utils
  types/              domain.ts (Person, Week, GD, Profile...), database.ts
```

### Critical rules

1. **Pages are thin** — they call hooks and pass data to feature components. No inline mutation logic, no inline data fetching, no complex JSX.
2. **Hooks live in `src/hooks/`** — one file per domain (usePeople, useWeeks, useGds, useProfiles...). Each hook is a React Query wrapper.
3. **Feature components live in `src/features/<domain>/components/`** — they receive data via props, never fetch directly.
4. **Code identifiers in English** — variables, enums, keys, DB enum values (`"visitor"|"attender"|"member"`, `"leader"|"supervisor"|"pastor"`).
5. **UI labels in Portuguese** — mapped via `categoryColors[cat].label` and `ROLE_LABLES` in `src/lib/constants.ts`.
6. **Mobile-first** — `PhoneFrame` is full-width on mobile (`min-h-dvh`), `sm:max-w-[430px]` on desktop. BottomNav is `sticky bottom-0`.
7. **No zoom on inputs** — viewport has `maximum-scale=1.0, user-scalable=no`.

## Roles & Permissions

| Role         | Access                                                                       |
| ------------ | ---------------------------------------------------------------------------- |
| `leader`     | Read/write people, weeks, attendance in linked GDs. Can register attendance. |
| `supervisor` | Same as leader + can approve users, manage GDs, see reports.                 |
| `pastor`     | Same as supervisor (identical power in this version).                        |

Roles are **global per user** (`profiles.role`), not per-GD. A pastor/supervisor can be linked to any GD via `gd_staff` to register attendance.

## Security (critical)

- **RLS is the real security** — every `SELECT/INSERT/UPDATE/DELETE` passes through Postgres Row Level Security policies.
- **`auth_role()` helper** — a `SECURITY DEFINER` function that reads the user's role from `profiles` without causing infinite recursion in policies.
- **Frontend guards are UX only** — `ProtectedRoute` checks roles for convenience, but the database is the authoritative source.
- **Supabase anon key is public** — permissions come from the user's JWT + RLS, not from hiding the key.
- **Never expose personal data** — no analytics on people's names, no logging PII.

## Database Schema

6 tables: `profiles`, `gds`, `gd_staff`, `people`, `weeks`, `attendance`.

- `profiles` — mirrors `auth.users`, adds `status` (pending/approved/rejected) and `role`.
- `gds` — groups of disciples. Has `weekday` (0-6, 0 = Sunday, matching JS `Date.getDay()`) and `start_time` (`time`, serialised as `"HH:MM:SS"` — use `formatTime()`) describing when the group meets. Both nullable — null means not set.
- `gd_staff` — many-to-many linking profiles to GDs.
- `people` — visitors/attenders/members in a GD. Categories: `visitor`, `attender`, `member`.
- `weeks` — one row per GD per week (`unique(gd_id, date)`).
- `attendance` — links weeks to people. Has `category_at_time` to preserve historical category.

### Key RPC

`confirm_week_attendance(p_gd_id, p_date, p_new_people[], p_promotions[], p_attendance[])` — atomic transaction creating a week + new people + category promotions + attendance records. Uses custom Postgres types (`new_person_entry`, `promotion_entry`, `attendance_entry`).

## Attendance Flow (Typeform-style)

4 steps: Visitantes → Frequentadores → Membros → Revisão → Confirma.

- Each step is a controlled component receiving state as props.
- The orchestrator (`AttendanceFlow`) manages all state locally.
- Date is editable via `<input type="date">` in the header.
- On confirm → `useCreateWeek().mutate()` → RPC `confirm_week_attendance`.

## Navigation

```
/                  GD Picker (list of linked GDs, always shown)
/gd/:id            GD detail with sub-views: Home | Registrar | Resumo
/gd/:id/people     Manage people (edit name, change category)
/pastor/users      Approve/reject users (supervisor/pastor)
/pastor/gds        CRUD GDs + link staff (supervisor/pastor)
/reports           Aggregate dashboard (supervisor/pastor)
/login             Google OAuth
/pending           Awaiting approval
```

## Design Tokens

Primary color: `#266BC6` (blue). Paper: `#F5F1E6`. Gold (attender): `#A9822C`. Rose (visitor): `#AF5D64`.

## Build & Deploy

```bash
pnpm dev        # localhost:5173
pnpm build      # tsc + vite build
pnpm lint       # eslint src/
```

Vercel deploys on push to `main`. SPA routing handled by `vercel.json` rewrite rule.

## Supabase

Project: `https://waeopvgoeadyrplrfuzk.supabase.co`
Migrations: `supabase/migrations/` (001–011)
Google OAuth configured in Auth → Providers.

## Key files to update when adding features

- New page → `src/pages/`, `src/pages/index.ts`, `src/routes/index.tsx`
- New hook → `src/hooks/`, `src/hooks/index.ts`
- New UI component → `src/components/ui/`, `src/components/ui/index.ts`
- New feature → `src/features/<domain>/components/`, `src/features/<domain>/index.ts`
- DB changes → `supabase/migrations/` + run in Supabase SQL Editor
