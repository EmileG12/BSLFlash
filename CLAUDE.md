# SignStack

BSL (British Sign Language) flashcard web app.

## Stack

- Frontend: React 19 + TypeScript + Vite
- Backend: Supabase (Postgres, Auth, RLS, RPC/Postgres functions, Storage) — run locally via Docker during development
- Package manager: npm

## Learning goal

This project also doubles as how the user is learning React, Postgres, and testing. When introducing a new pattern, library, or non-obvious technique, explain it like a tutorial, not a one-line mention: what it does, why it was chosen over the alternatives, how it actually works (not just "call this function"), and the steps to reproduce or extend it yourself. Don't compress this for brevity — skipping the reasoning or the mechanism to keep things short defeats the point; the goal is the user could rebuild the pattern from scratch next time, not just recognize it.

## Running locally

- Install deps: `npm install`
- Start the local Supabase stack (Docker must be running): `npx supabase start`
- Apply `supabase/migrations/` to the local database: `npx supabase db reset`
- Start the dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

`npx supabase start` (or `npx supabase status`) prints a local API URL and anon key. `.env.local` must define `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` pointing at those values (see `src/vite-env.d.ts` for the expected shape). Do not read, write, or print the contents of `.env.local` — treat it as opaque and let the user manage it.

## Documentation system (read before editing code)

[`/docs`](./docs/README.md) is a hand-maintained wiki describing the CURRENT state of the codebase: components, hooks/utilities, DB schema, RLS policies, RPC functions, and (as its own category) what the test suite covers. It is not a changelog — every file is edited in place to describe what exists now, never appended to with historical entries.

**Before grepping `src/` or `supabase/` to understand how something works, check the matching file(s) in `/docs` first.** Fall back to reading raw source only when the docs don't cover it, or to verify a doc is still accurate before changing the code it describes.

**As part of finishing any change** that adds, modifies, or removes a React component, hook/utility, database table, RLS policy, or RPC function, update the matching file(s) under `/docs` in the same change. Use the `update-docs` skill as a checklist.

For Supabase elements (tables, RLS policies, RPC functions), each doc file embeds the current live SQL definition directly — that embedded SQL is the thing to check, not migration history. A table/policy/function's current shape is the cumulative result of every migration applied to it, so reading an individual migration file (or the original one) does not tell you its current state.

## Build workflow

**Library-first for new components/functions:** when asked to build a new component, icon, or utility function, first check whether a well-tested existing library or plugin already provides it (e.g. an icon request → recommend Lucide rather than a custom SVG). Recommend the library and get confirmation before building a custom implementation. Only build custom when no suitable library exists.

**Extract shared code instead of duplicating it:** don't duplicate a component or its styling across pages — whether explicitly asked to copy something, or discovered while building something new that turns out to share structure with existing code. When a new page/component would repeat markup, styling, or logic that already exists elsewhere (or when building two similar things in the same task, like a login and signup page), extract the shared part into its own reusable file that both import, rather than pasting a second copy. Recognize this during design, not only when told to.

## Testing

This project uses [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) for component/hook tests — fast, in-memory, no browser or running Supabase instance required. Run the suite: `npm run test`.

**After finishing any change to a component, hook, or utility function**, use the `suggest-tests` skill to check whether new tests are warranted and which existing tests are relevant to re-run. Test files live next to the code they test (`Foo.tsx` -> `Foo.test.tsx`) and are documented separately under [`docs/tests/`](./docs/tests/README.md) (kept apart from the component/hook/utility docs so test docs don't flood the docs for the actual codebase) — each test doc links back to the doc of the thing it tests.

## Database migrations

`supabase/migrations/` is the source of truth for schema, RLS policies, and RPC functions. See [`docs/migrations.md`](./docs/migrations.md) for the full workflow, including how doc updates stay in sync with it.
