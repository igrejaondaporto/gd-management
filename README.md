# Presença GD

Smart attendance tracking app for small groups (Grupos de Discípulos) at church.

Built with React 19 + TypeScript + Vite + Supabase + Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required variables:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anonymous public key

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable Google OAuth in Authentication → Providers
3. Run the SQL migrations from `supabase/migrations/`

### Dev

```bash
pnpm dev
```

Opens at http://localhost:5173/

### Build

```bash
pnpm build
pnpm preview
```

### Lint

```bash
pnpm lint
```

## Project Structure

```
src/
  components/ui/   — reusable UI primitives (Avatar, Pill, PersonChip, etc.)
  features/        — domain logic (auth, pastor, attendance, dashboard)
  pages/           — one component per route
  hooks/           — custom React hooks (useSession, useProfile, data hooks)
  routes/          — route config and guards
  lib/             — utilities, constants, Supabase client
  types/           — domain types and generated database types
```

## Roles

| Role         | Access                                           |
| ------------ | ------------------------------------------------ |
| `leader`     | Read and write attendance for their own GD       |
| `supervisor` | Read-only access to assigned GDs                 |
| `pastor`     | Global read access, user approval, GD management |

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Routing:** react-router-dom v7
- **Data:** Supabase (Postgres + Auth + RLS), TanStack React Query
- **Icons:** lucide-react
- **Validation:** zod
- **Fonts:** Fraunces, Public Sans, JetBrains Mono
