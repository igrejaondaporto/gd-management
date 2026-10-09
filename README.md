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
2. **Enable Google OAuth** in Authentication → Providers → Google:
   - Toggle **Enabled**
   - Paste your **Client ID** and **Client Secret** from Google Cloud Console
   - Under "Authorized Client IDs", the redirect URL is:
     `https://waeopvgoeadyrplrfuzk.supabase.co/auth/v1/callback`
   - Add this same URL to **Authorized redirect URIs** in your Google Cloud Console
3. Run the SQL migrations from `supabase/migrations/` (already applied: 001–014) in the SQL editor
4. **Deploy the `gd-requests` Edge Function** — see [Integrations](#integrations)

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

## Integrations

Third-party systems (starting with the Portal do Voluntário) create and read GD
requests by calling the `gd-requests` Edge Function — they never touch the
database directly. Each partner authenticates with a static key sent in the
`x-api-key` header. The keys are Edge Function secrets, one per partner:

```bash
supabase link --project-ref waeopvgoeadyrplrfuzk
supabase functions deploy gd-requests        # verify_jwt is off (see supabase/config.toml)

# One secret per partner: `source` is what the database stores, `scopes` what the
# partner may do. Takes effect immediately — no redeploy.
supabase secrets set PARTNER_PORTAL_ONDA='{"source":"portal-onda","key":"<chave>","scopes":["gd_requests:read","gd_requests:write"]}'
```

Adding a partner, rotating a key, or granting a new permission is a secret
change, not a code change. The DB functions behind the endpoint
(`submit_gd_request`, `gd_request_statuses`) are granted to `service_role` only —
not to `anon` or `authenticated`.

The endpoint contract for partners is in
[`supabase/functions/gd-requests/README.md`](supabase/functions/gd-requests/README.md)
(Portuguese). Partners must call it **server-to-server** — their Cloud Function,
server or cron, never a browser or app — and keep the key in their platform's
secret manager. The endpoint has open CORS and does not validate origin, so a key
that reaches a client bundle can be copied and used to write as that partner.

## Documentation

User-facing guide (Portuguese) in [`docs/`](docs/) — how to register attendance, read the
weekly summary, manage GDs, approve users, and the FAQ. Built to be published with GitHub Pages
(Settings → Pages → Deploy from a branch → `main` / `/docs`).

## Project Structure

```
src/
  components/ui/   — reusable UI primitives (Avatar, Pill, PersonChip, WeekdayPicker, etc.)
  features/        — domain logic (auth, pastor, attendance, dashboard, status)
  pages/           — one component per route (thin: compose hooks + feature components)
  hooks/           — custom React hooks (useSession, useProfile, data hooks)
  routes/          — route config and guards
  lib/             — utilities, constants, Supabase client
  types/           — domain types and generated database types
```

## Roles

| Role         | Access                                                          |
| ------------ | --------------------------------------------------------------- |
| `leader`     | Register attendance and manage people in the GDs they are linked to. |
| `supervisor` | Everything a leader can do, across all their GDs, plus: dashboard, GD health, GD management, user approval. |
| `pastor`     | Everything a supervisor can do, across every GD.                |

Roles are **per person, not per GD**. Being approved is not the same as being linked to a GD:
approval grants app access, `gd_staff` grants access to a group.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Routing:** react-router-dom v7
- **Data:** Supabase (Postgres + Auth + RLS), TanStack React Query
- **Icons:** lucide-react
- **Validation:** zod
- **Fonts:** Outfit (single family for display, body and numbers)
