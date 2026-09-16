# SignStack

BSL (British Sign Language) flashcard web app.

## Stack

- Frontend: React 19 + TypeScript + Vite
- Backend: Supabase (Postgres, Auth, RLS, RPC/Postgres functions, Storage) — run locally via Docker during development
- Package manager: npm

## Running locally

- Install deps: `npm install`
- Start the local Supabase stack (Docker must be running): `npx supabase start`
- Apply `supabase/migrations/` to the local database: `npx supabase db reset`
- Start the dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

`npx supabase start` (or `npx supabase status`) prints a local API URL and anon key. `.env.local` must define `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` pointing at those values (see `src/vite-env.d.ts` for the expected shape). Do not read, write, or print the contents of `.env.local` — treat it as opaque and let the user manage it.

## Documentation system (read before editing code)

[`/docs`](./docs/README.md) is a hand-maintained wiki describing the CURRENT state of the codebase: components, hooks/utilities, DB schema, RLS policies, RPC functions. It is not a changelog — every file is edited in place to describe what exists now, never appended to with historical entries.

**Before grepping `src/` or `supabase/` to understand how something works, check the matching file(s) in `/docs` first.** Fall back to reading raw source only when the docs don't cover it, or to verify a doc is still accurate before changing the code it describes.

**As part of finishing any change** that adds, modifies, or removes a React component, hook/utility, database table, RLS policy, or RPC function, update the matching file(s) under `/docs` in the same change. Use the `update-docs` skill as a checklist.

For Supabase elements (tables, RLS policies, RPC functions), each doc file embeds the current live SQL definition directly — that embedded SQL is the thing to check, not migration history. A table/policy/function's current shape is the cumulative result of every migration applied to it, so reading an individual migration file (or the original one) does not tell you its current state.

## Database migrations

`supabase/migrations/` is the source of truth for schema, RLS policies, and RPC functions. See [`docs/migrations.md`](./docs/migrations.md) for the full workflow, including how doc updates stay in sync with it.
