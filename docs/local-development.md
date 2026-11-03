# Local development

How to run BSLFlash on your own machine against a local, Docker-hosted Supabase stack. The live app at [bslflash.vercel.app](https://bslflash.vercel.app/) needs none of this — see [deployment/](./deployment/README.md) for how that is hosted.

## Prerequisites

- **Docker** — running, since the local Supabase stack runs in containers.
- **Node 24** — the version CI pins (see [deployment/ci-cd.md](./deployment/ci-cd.md) for why an older Node breaks the jsdom test environment).

## Setup

1. Install dependencies:
   ```
   npm install
   ```
   This also points git at the repo's `.githooks` directory via `postinstall`. If you installed with `--ignore-scripts`, run `npm run setup-hooks` afterwards.
2. Start the local Supabase stack:
   ```
   npx supabase start
   ```
   This prints a local API URL and anon key. Create `.env.local` with:
   ```
   VITE_SUPABASE_URL=<local API URL>
   VITE_SUPABASE_ANON_KEY=<local anon key>
   ```
   (see `src/vite-env.d.ts` for the expected shape)
3. Apply migrations and seed sample data, including sign videos:
   ```
   npm run db:reset:seeded
   ```
   This runs `supabase db reset` followed by `scripts/seed-sign-videos.mjs` — the video upload is a separate step because `db reset` only runs SQL and can't put files into Storage.
4. Start the dev server:
   ```
   npm run dev
   ```

## Seed accounts

`supabase/seed.sql` creates two accounts. They exist **only in a local database** — the hosted staging and production projects never run `seed.sql` (see [deployment/hosting.md](./deployment/hosting.md)).

| Email | Password | Role |
| --- | --- | --- |
| `superadmin@bslflash.local` | `SuperAdmin123!` | superadmin |
| `user@bslflash.local` | `User123!` | user |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the unit test suite (Vitest, jsdom) |
| `npm run preview` | Preview the production build locally |
| `npm run db:reset:seeded` | Reset the local Supabase DB and seed sample data/videos |
| `npm run setup-hooks` | Point git at the repo's `.githooks` directory |
| `npm run test-hooks` | Verify git hook enforcement is wired up correctly |

### Browser tests

`npm run test` only runs the jsdom suite. Tests named `*.browser.test.tsx` run in real Chromium via Playwright, as a separate Vitest project (see [tests/](./tests/README.md)). One-time browser install, then run the suite:

```
npx playwright install chromium
npx vitest run --project=browser
```

## Database

`supabase/migrations/` is the source of truth for schema, RLS policies, and RPC functions — locally via `db reset`, and on the hosted projects via `supabase db push` in CI.
