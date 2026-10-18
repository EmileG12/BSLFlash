# Hosting

## Supabase projects

Two separate hosted Supabase projects, both free tier: `staging` and `production`. Neither ever runs `supabase/seed.sql` — that's local-dev-only. Each only ever receives schema changes via `supabase db push` in [`deploy-migrations.yml`](./ci-cd.md), so `supabase/migrations/` is the actual, complete source of truth for both — there is no manual drift, since there is no other way either project's schema changes.

**Auth:** both projects use Supabase's built-in email sender (the default — no SMTP provider configured), with "Confirm email" turned off (Authentication → Providers → Email, in each project's own dashboard). The built-in sender caps at roughly 2 emails/hour per project, shared across all auth email types — acceptable here since email is only used for password resets, not signup confirmation.

**Table grants:** every table was created via raw SQL migrations, never Supabase's Table Editor UI — which is what normally bundles in the Data API's table-level grants (`SELECT`/`INSERT`/`UPDATE`/`DELETE` to `anon`/`authenticated`) automatically on a hosted project. This went unnoticed for a while because the local Docker stack's own init applies a broader baseline that hosted projects don't replicate. See [db-schema/README.md](../db-schema/README.md) for the actual grants (now explicit, via migration) and each table's own doc for its current grant state.

## Vercel

The frontend. Connected to the GitHub repo; `main` is the Production branch, every other branch (including `staging`) deploys as Preview — Vercel's default once a branch isn't the designated Production one, no separate config needed.

Environment variables `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are set twice, once per Vercel environment, each pointing at the matching Supabase project (Production → production project, Preview → staging project). Type is **Config**, not **Secret** — a `VITE_`-prefixed variable is inlined into the client bundle at build time by Vite, so it will be readable in the shipped JavaScript regardless; "Secret" type (write-only after saving, meant for values that should stay server-side) is incompatible with that and Vercel's UI blocks the combination. Both values are meant to be public anyway — the anon key is designed by Supabase to be safely exposed client-side, since RLS is the actual data boundary, not hiding this key.

## Production bootstrap

Production starts with no users and no way to create a superadmin through the app itself (every admin-management RPC requires an existing superadmin to call it). The one-time bootstrap: run a manual SQL script directly in the production project's SQL editor that inserts a temporary `auth.users` row, a matching `auth.identities` row, and a `superadmin` grant in `user_roles` — mirroring the exact pattern `supabase/seed.sql` uses for its local seed superadmin, since `handle_new_user` (the trigger that creates `profiles` + the base `user` role) fires on that `INSERT` the same as any real signup. Log in as that temporary account, create a real permanent superadmin through the app's own signup + role-grant flow, then delete the temporary account through the app's own delete-account feature ([`delete_user`](../rpc-functions/delete_user.md)) rather than another manual SQL step.
