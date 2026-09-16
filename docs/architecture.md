# Architecture

Current state of the SignStack app, described honestly as of now — this is a young project and most of the app doesn't exist yet.

## Stack

- **Frontend:** React 19 + TypeScript, built with Vite.
- **Backend:** Supabase (Postgres, Auth, Row Level Security, RPC/Postgres functions, Storage), run locally via Docker during development.
- **Package manager:** npm.

## Current state

- `src/App.tsx` is still the default Vite/React template — it has not been adapted into any SignStack-specific UI yet. No routing, no custom components.
- The one real piece of app code is [src/lib/supabase.ts](./utils/supabase-client.md), a singleton Supabase client used to talk to Postgres/Auth/Storage.
- No database tables, RLS policies, or RPC functions exist yet — `supabase/migrations/` is empty. See [migrations.md](./migrations.md) for the workflow that will populate it.

## How the pieces will connect

The React app will call Supabase directly from the browser via `@supabase/supabase-js` (the client in `src/lib/supabase.ts`), using the local Supabase stack's REST/Auth/Storage endpoints during development. Access control is enforced at the database layer via RLS policies rather than a separate backend API layer — see [rls-policies/](./rls-policies/README.md) once policies exist.

This file should be updated as real architectural decisions are made (e.g. routing library, state management, auth flow) — keep it describing what's actually built, not aspirational design.
